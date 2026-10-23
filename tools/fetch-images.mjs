#!/usr/bin/env node
/**
 * Pipeline foto berlisensi (Tahap C): Wikimedia Commons -> derivative AVIF/WebP -> images.json.
 *
 *   node tools/fetch-images.mjs --all
 *   node tools/fetch-images.mjs --country=jp,id
 *   node tools/fetch-images.mjs --country=jp --force
 *   node tools/fetch-images.mjs --check
 *
 * Alur: metadata (batch <=20 judul) -> allowlist lisensi fail-closed -> unduh 1 file ke .cache/images
 * (gitignored) -> crop + encode (sharp) -> public/images/countries/<id>/<slug>-<w>.{avif,webp}
 * -> src/content/images.json. Original 1600px tidak pernah masuk repo.
 *
 * --check tidak menyentuh jaringan: seluruh gate (lisensi, alt, file, budget, orphan) jalan offline.
 */

import { createWriteStream, existsSync } from 'node:fs';
import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'src/content/images.manifest.json');
const OUTPUT_PATH = path.join(ROOT, 'src/content/images.json');
const COUNTRIES_DIR = path.join(ROOT, 'public/images/countries');
const CACHE_DIR = path.join(ROOT, '.cache/images');

const API_URL = 'https://commons.wikimedia.org/w/api.php';
const UA_CONTACT =
  process.env.IMAGES_UA_CONTACT ?? 'https://github.com/radityabhardana/ASIA-EXPLORER';
const USER_AGENT = `asiakin-v3-image-fetch/1.0 (https://github.com/asiakin/asiakin-v3; ${UA_CONTACT}) node/${process.versions.node.split('.')[0]}`;

const METADATA_FILTER = [
  'ObjectName',
  'ImageDescription',
  'Artist',
  'Credit',
  'LicenseShortName',
  'License',
  'LicenseUrl',
  'UsageTerms',
  'AttributionRequired',
  'Copyrighted',
  'Restrictions',
].join('|');

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const AVIF_BUDGET_BYTES = 600 * 1024;
const AVIF_QUALITY_STEPS = [45, 40, 36];
const AVIF_EFFORT = 6;
const WEBP_QUALITY = 62;
const WEBP_EFFORT = 5;
const MAX_DOWNLOAD_BYTES = 60 * 1024 * 1024;
// Panorama lebar kehilangan lebar saat di-crop ke 16:9; bila thumbnail tidak cukup, ambil file asli
// selama masih di bawah batas ini (memori tetap satu berkas pada satu waktu).
const MAX_ORIGINAL_BYTES = 25 * 1024 * 1024;
const BATCH_SIZE = 20;
const REQUEST_GAP_MS = 250;

// Satu-satunya knob visual di pipeline ini. Hero full-bleed 16:9, sisanya kartu 3:2.
const DEFAULT_ASPECT = 3 / 2;
const ASPECT_BY_ROLE = { hero: 16 / 9 };
const ROLE_ORDER = ['hero', 'life', 'food', 'script'];

const ALLOWED_CC_VERSIONS = new Set(['2.0', '3.0', '4.0']);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10;

function usage() {
  console.log(`Pemakaian:
  node tools/fetch-images.mjs --all [--force]
  node tools/fetch-images.mjs --country=jp,id [--force]
  node tools/fetch-images.mjs --check`);
}

function parseArgs(argv) {
  const opts = { all: false, check: false, force: false, countries: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--all') opts.all = true;
    else if (arg === '--check') opts.check = true;
    else if (arg === '--force') opts.force = true;
    else if (arg === '--country') {
      const value = argv[i + 1];
      if (!value) throw new Error('--country butuh nilai, mis. --country=jp');
      i += 1;
      opts.countries.push(...splitCountries(value));
    } else if (arg.startsWith('--country=')) {
      opts.countries.push(...splitCountries(arg.slice('--country='.length)));
    } else if (arg === '--help' || arg === '-h') {
      usage();
      process.exit(0);
    } else {
      throw new Error(`flag tidak dikenal: ${arg}`);
    }
  }
  return opts;
}

function splitCountries(value) {
  return value
    .split(',')
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

function aspectFor(entry) {
  if (Number.isFinite(entry.aspect) && entry.aspect > 0) return entry.aspect;
  return ASPECT_BY_ROLE[entry.role] ?? DEFAULT_ASPECT;
}

function widthsFor(role) {
  return role === 'hero' ? [960, 1600] : [640, 960];
}

function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function stripHtml(html) {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function stripQuery(url) {
  try {
    const parsed = new URL(url);
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return String(url ?? '');
  }
}

function extFromMime(mime) {
  if (mime === 'image/jpeg') return '.jpg';
  if (mime === 'image/png') return '.png';
  if (mime === 'image/webp') return '.webp';
  return '.bin';
}

// --- Manifest -------------------------------------------------------------------------------

async function readManifest() {
  const raw = await readJson(MANIFEST_PATH);
  if (!raw || typeof raw.countries !== 'object' || raw.countries === null) {
    throw new Error(`${path.relative(ROOT, MANIFEST_PATH)} tidak punya objek "countries"`);
  }
  const problems = [];
  for (const [country, entries] of Object.entries(raw.countries)) {
    if (!/^[a-z]{2}$/.test(country)) problems.push(`${country}: kode negara harus 2 huruf kecil`);
    if (!Array.isArray(entries) || entries.length === 0) {
      problems.push(`${country}: daftar entri kosong`);
      continue;
    }
    for (const entry of entries) {
      const where = `${country}/${entry?.slug ?? '?'}`;
      if (!/^[a-z0-9-]+$/.test(String(entry?.slug ?? '')))
        problems.push(`${where}: slug tidak valid`);
      if (!ROLE_ORDER.includes(entry?.role))
        problems.push(`${where}: role "${entry?.role}" tidak dikenal`);
      if (!/^File:.+/.test(String(entry?.title ?? '')))
        problems.push(`${where}: title harus diawali "File:"`);
      if (!Array.isArray(entry?.focus) || entry.focus.length !== 2)
        problems.push(`${where}: focus harus [x, y]`);
      if (!entry?.alt?.id?.trim()) problems.push(`${where}: alt.id kosong`);
      if (!entry?.alt?.en?.trim()) problems.push(`${where}: alt.en kosong`);
    }
  }
  if (problems.length) throw new Error(`Manifest tidak valid:\n  ${problems.join('\n  ')}`);
  return raw;
}

function sortEntries(entries) {
  return [...entries].sort((a, b) => {
    const roleDelta = ROLE_ORDER.indexOf(a.role) - ROLE_ORDER.indexOf(b.role);
    return roleDelta !== 0 ? roleDelta : a.slug.localeCompare(b.slug);
  });
}

// --- Commons API ----------------------------------------------------------------------------

async function apiGet(params, attempt = 0) {
  const url = `${API_URL}?${new URLSearchParams(params).toString()}`;
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 3) throw new Error(`Commons API ${res.status} setelah ${attempt + 1} percobaan`);
    await sleep(1000 * 2 ** attempt);
    return apiGet(params, attempt + 1);
  }
  if (!res.ok) throw new Error(`Commons API HTTP ${res.status}`);
  const json = await res.json();
  if (json.error) {
    if (json.error.code === 'ratelimited' && attempt < 3) {
      await sleep(1000 * 2 ** attempt);
      return apiGet(params, attempt + 1);
    }
    throw new Error(`Commons API: ${json.error.code} — ${json.error.info}`);
  }
  return json;
}

function pagesByTitle(response) {
  const byTitle = new Map();
  const normalised = new Map();
  for (const item of response?.query?.normalized ?? []) {
    normalised.set(normaliseTitle(item.from), normaliseTitle(item.to));
  }
  for (const page of Object.values(response?.query?.pages ?? {})) {
    byTitle.set(normaliseTitle(page.title), page);
  }
  return { byTitle, normalised };
}

function normaliseTitle(title) {
  return String(title).replace(/_/g, ' ').trim().toLowerCase();
}

async function resolveMetadata(entries) {
  const titles = [...new Set(entries.map((item) => item.entry.title))];
  const resolved = new Map();

  for (let offset = 0; offset < titles.length; offset += BATCH_SIZE) {
    const batch = titles.slice(offset, offset + BATCH_SIZE);
    const response = await apiGet({
      action: 'query',
      titles: batch.join('|'),
      prop: 'imageinfo',
      iiprop: 'url|size|extmetadata|mime|user',
      iiextmetadatafilter: METADATA_FILTER,
      iiurlwidth: '1600',
      format: 'json',
    });
    const { byTitle, normalised } = pagesByTitle(response);
    for (const title of batch) {
      const key = normalised.get(normaliseTitle(title)) ?? normaliseTitle(title);
      const page = byTitle.get(key) ?? byTitle.get(normaliseTitle(title));
      const info = page?.imageinfo?.[0];
      if (!info) {
        resolved.set(title, {
          error: `tidak ditemukan di Commons (${page?.missing ? 'missing' : 'tanpa imageinfo'})`,
        });
        continue;
      }
      resolved.set(title, { info });
    }
    if (offset + BATCH_SIZE < titles.length) await sleep(REQUEST_GAP_MS);
  }

  return resolved;
}

// --- Lisensi --------------------------------------------------------------------------------

function classifyLicense({ short, code, restrictions, waived }) {
  const s = stripHtml(short).toLowerCase().replace(/\s+/g, ' ').trim();
  const l = stripHtml(code).toLowerCase().trim();

  if (!s && !l) return { ok: false, reason: 'tanpa lisensi (LicenseShortName & License kosong)' };

  const restricted = stripHtml(restrictions).toLowerCase();
  if (restricted) {
    const waivable = waived === true && /personality|trademark/.test(restricted);
    if (!waivable)
      return { ok: false, reason: `Restrictions "${stripHtml(restrictions)}" belum di-waive` };
  }

  if (/\bnc\b|non-?commercial|-nc\b/.test(s) || /-nc\b/.test(l))
    return { ok: false, reason: 'NC tidak diizinkan' };
  if (/\bnd\b|no-?deriv|-nd\b/.test(s) || /-nd\b/.test(l))
    return { ok: false, reason: 'ND tidak diizinkan' };
  if (
    s.includes('fair use') ||
    s.includes('non-free') ||
    s.includes('nonfree') ||
    s.includes('all rights reserved')
  ) {
    return { ok: false, reason: 'non-free / fair use tidak diizinkan' };
  }
  if (s.includes('no restrictions'))
    return { ok: false, reason: 'lisensi "No restrictions" tidak masuk allowlist' };
  if (s === 'fal' || s.includes('free art license') || l.includes('fal')) {
    return { ok: false, reason: 'FAL tidak masuk allowlist' };
  }

  const cc0 = s.includes('cc0') || s.includes('cc zero') || l === 'cc-zero';
  if (cc0) return { ok: true, group: 'cc0', label: 'CC0', required: false };

  if (
    s === 'public domain' ||
    s.startsWith('public domain') ||
    s.startsWith('pd-') ||
    l === 'pd' ||
    l.startsWith('pd-')
  ) {
    return { ok: true, group: 'pd', label: 'Public domain', required: false };
  }

  const bySa = s.match(/^cc by-sa (\d\.\d)/) ?? l.match(/^cc-by-sa-(\d\.\d)/);
  if (bySa) {
    const version = bySa[1];
    if (!ALLOWED_CC_VERSIONS.has(version))
      return { ok: false, reason: `CC BY-SA ${version} di luar allowlist` };
    return { ok: true, group: 'cc-by-sa', label: `CC BY-SA ${version}`, required: true };
  }

  const by = s.match(/^cc by (\d\.\d)/) ?? l.match(/^cc-by-(\d\.\d)/);
  if (by) {
    const version = by[1];
    if (!ALLOWED_CC_VERSIONS.has(version))
      return { ok: false, reason: `CC BY ${version} di luar allowlist` };
    return { ok: true, group: 'cc-by', label: `CC BY ${version}`, required: true };
  }

  if (s.includes('gfdl') || l.includes('gfdl'))
    return { ok: false, reason: 'GFDL-only tidak diizinkan' };

  return { ok: false, reason: `lisensi tidak dikenal ("${stripHtml(short) || stripHtml(code)}")` };
}

function metaValue(info, key) {
  return info?.extmetadata?.[key]?.value ?? '';
}

function licenceUrlFor(info, group, label) {
  const fromApi = String(metaValue(info, 'LicenseUrl') ?? '');
  if (/^https?:\/\//.test(fromApi)) return fromApi;
  if (group === 'cc0') return 'https://creativecommons.org/publicdomain/zero/1.0/';
  if (group === 'cc-by' || group === 'cc-by-sa') {
    const version = label.split(' ').pop();
    const path = group === 'cc-by' ? 'by' : 'by-sa';
    return `https://creativecommons.org/licenses/${path}/${version}/`;
  }
  return 'https://commons.wikimedia.org/wiki/Commons:Public_domain';
}

function creditFor({ info, license }) {
  const artist = stripHtml(metaValue(info, 'Artist'));
  const author = artist || stripHtml(info?.user) || '';
  const attributionRequired =
    String(metaValue(info, 'AttributionRequired')).toLowerCase() === 'true';
  return {
    author,
    license: license.label,
    licenseUrl: licenceUrlFor(info, license.group, license.label),
    sourceUrl: stripQuery(info.descriptionurl),
    required: license.required || attributionRequired,
  };
}

// --- Unduhan --------------------------------------------------------------------------------

function downloadUrlFor(info) {
  const raw = info?.thumburl || info?.url;
  if (!raw) throw new Error('imageinfo tidak punya thumburl/url');
  return stripQuery(raw);
}

async function downloadTo(url, dest, attempt = 0) {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (res.status === 429 || res.status >= 500) {
    if (attempt >= 3) throw new Error(`unduhan ${res.status} setelah ${attempt + 1} percobaan`);
    await sleep(1000 * 2 ** attempt);
    return downloadTo(url, dest, attempt + 1);
  }
  if (!res.ok || !res.body) throw new Error(`unduhan HTTP ${res.status}`);
  const declared = Number(res.headers.get('content-length') ?? 0);
  if (declared > MAX_DOWNLOAD_BYTES)
    throw new Error(`berkas ${kb(declared)} KB melewati batas unduhan`);

  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  const { size } = await stat(dest);
  if (size === 0) throw new Error('unduhan kosong');
  if (size > MAX_DOWNLOAD_BYTES) throw new Error(`berkas ${kb(size)} KB melewati batas unduhan`);
  return size;
}

async function ensureSource({ country, entry, info, force }) {
  const dir = path.join(CACHE_DIR, country);
  await mkdir(dir, { recursive: true });
  const dest = path.join(dir, `${entry.slug}${extFromMime(info.mime)}`);
  if (!force && existsSync(dest) && (await stat(dest)).size > 0)
    return upgradeSource({ dest, entry, info });

  const url = downloadUrlFor(info);
  try {
    await downloadTo(url, dest);
  } catch (error) {
    // Thumbnail pra-generate bisa 404 walau imageinfo ada (T360589); pakai file aslinya.
    if (info.url && stripQuery(info.url) !== url) {
      await downloadTo(stripQuery(info.url), dest);
    } else {
      throw error;
    }
  }
  return upgradeSource({ dest, entry, info });
}

/**
 * `withoutEnlargement` berarti crop 16:9 dari panorama bisa menyisakan lebar < target hero.
 * Bila file asli lebih besar dan masih wajar ukurannya, timpa cache dengan file asli.
 */
async function upgradeSource({ dest, entry, info }) {
  const target = Math.max(...widthsFor(entry.role));
  const meta = await sharp(dest)
    .metadata()
    .catch(() => null);
  if (!meta?.width || !meta?.height) return dest;
  const rect = cropRect({
    width: meta.width,
    height: meta.height,
    aspect: aspectFor(entry),
    focus: entry.focus,
  });
  if (rect.width >= target) return dest;
  if (!info.url || info.width <= meta.width) return dest;
  if (Number(info.size ?? 0) > MAX_ORIGINAL_BYTES) return dest;
  await downloadTo(stripQuery(info.url), dest);
  return dest;
}

// --- Encode ---------------------------------------------------------------------------------

async function uprightSource(sourcePath) {
  const meta = await sharp(sourcePath).metadata();
  if (!meta.orientation || meta.orientation === 1) return sourcePath;
  const dest = `${sourcePath}.upright.png`;
  if (!existsSync(dest))
    await sharp(sourcePath).autoOrient().png({ compressionLevel: 3 }).toFile(dest);
  return dest;
}

function cropRect({ width, height, aspect, focus }) {
  let cropWidth;
  let cropHeight;
  if (width / height > aspect) {
    cropHeight = height;
    cropWidth = Math.round(height * aspect);
  } else {
    cropWidth = width;
    cropHeight = Math.round(width / aspect);
  }
  const [fx, fy] = focus;
  const left = Math.min(Math.max(Math.round((width - cropWidth) * fx), 0), width - cropWidth);
  const top = Math.min(Math.max(Math.round((height - cropHeight) * fy), 0), height - cropHeight);
  return { left, top, width: cropWidth, height: cropHeight };
}

async function cropsFor(sourcePath, entry) {
  const aspect = aspectFor(entry);
  const widths = widthsFor(entry.role);
  const biggest = Math.max(...widths);
  const oriented = await uprightSource(sourcePath);
  const meta = await sharp(oriented).metadata();
  if (!meta.width || !meta.height) throw new Error('dimensi sumber tidak terbaca');

  const rect = cropRect({ width: meta.width, height: meta.height, aspect, focus: entry.focus });
  const big = await sharp(oriented)
    .extract(rect)
    .resize({
      width: biggest,
      height: Math.round(biggest / aspect),
      fit: 'cover',
      withoutEnlargement: true,
      kernel: 'lanczos3',
    })
    .toBuffer();
  const bigMeta = await sharp(big).metadata();

  const crops = [];
  for (const width of widths) {
    if (width === biggest || !bigMeta.width || bigMeta.width <= width) {
      crops.push({ width, buffer: big, wPx: bigMeta.width, hPx: bigMeta.height });
      continue;
    }
    const buffer = await sharp(big)
      .resize({ width, height: Math.round(width / aspect), fit: 'cover', kernel: 'lanczos3' })
      .toBuffer();
    const scaled = await sharp(buffer).metadata();
    crops.push({ width, buffer, wPx: scaled.width, hPx: scaled.height });
  }

  return { crops, big };
}

async function encodeAvif(buffer, quality) {
  return sharp(buffer)
    .avif({ quality, effort: AVIF_EFFORT, chromaSubsampling: '4:2:0' })
    .toBuffer();
}

async function encodeWebp(buffer) {
  return sharp(buffer).webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT }).toBuffer();
}

function derivativePath(country, slug, width, ext) {
  return path.join(COUNTRIES_DIR, country, `${slug}-${width}.${ext}`);
}

function publicPath(country, slug, width, ext) {
  return `/images/countries/${country}/${slug}-${width}.${ext}`;
}

async function lqipFor(buffer) {
  const small = await sharp(buffer)
    .resize({ width: 24, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 40, effort: 0 })
    .toBuffer();
  return `data:image/webp;base64,${small.toString('base64')}`;
}

async function dominantFor(buffer) {
  const { dominant } = await sharp(buffer).stats();
  const hex = [dominant.r, dominant.g, dominant.b]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

async function renderEntry({ country, entry, sourcePath, avifQuality }) {
  const { crops, big } = await cropsFor(sourcePath, entry);
  const outDir = path.join(COUNTRIES_DIR, country);
  await mkdir(outDir, { recursive: true });

  const avif = [];
  const webp = [];
  let avifBytes = 0;

  for (const crop of crops) {
    const avifBuffer = await encodeAvif(crop.buffer, avifQuality);
    const webpBuffer = await encodeWebp(crop.buffer);
    await writeFile(derivativePath(country, entry.slug, crop.width, 'avif'), avifBuffer);
    await writeFile(derivativePath(country, entry.slug, crop.width, 'webp'), webpBuffer);
    avifBytes += avifBuffer.length;
    avif.push({
      w: crop.width,
      file: publicPath(country, entry.slug, crop.width, 'avif'),
      w_px: crop.wPx,
      h_px: crop.hPx,
    });
    webp.push({
      w: crop.width,
      file: publicPath(country, entry.slug, crop.width, 'webp'),
      w_px: crop.wPx,
      h_px: crop.hPx,
    });
  }

  const [lqip, dominant] = [await lqipFor(big), await dominantFor(big)];
  const largest = avif[avif.length - 1];

  return {
    record: {
      slug: entry.slug,
      role: entry.role,
      width: largest.w_px,
      height: largest.h_px,
      focus: { x: entry.focus[0], y: entry.focus[1] },
      dominant,
      lqip,
      avif,
      webp,
      credit: entry.credit,
      alt: { id: entry.alt.id, en: entry.alt.en },
    },
    avifBytes,
  };
}

async function reencodeAvifOnly({ country, entry, sourcePath, record, quality }) {
  const { crops } = await cropsFor(sourcePath, entry);
  let avifBytes = 0;
  for (let index = 0; index < crops.length; index += 1) {
    const crop = crops[index];
    const buffer = await encodeAvif(crop.buffer, quality);
    await writeFile(derivativePath(country, entry.slug, crop.width, 'avif'), buffer);
    const variant = record.avif[index];
    variant.w_px = crop.wPx;
    variant.h_px = crop.hPx;
    avifBytes += buffer.length;
  }
  record.width = record.avif[record.avif.length - 1].w_px;
  record.height = record.avif[record.avif.length - 1].h_px;
  return avifBytes;
}

// --- Output ---------------------------------------------------------------------------------

function sortRecordKeys(record) {
  return {
    slug: record.slug,
    role: record.role,
    width: record.width,
    height: record.height,
    focus: { x: record.focus.x, y: record.focus.y },
    dominant: record.dominant,
    lqip: record.lqip,
    avif: record.avif.map((item) => ({
      w: item.w,
      file: item.file,
      w_px: item.w_px,
      h_px: item.h_px,
    })),
    webp: record.webp.map((item) => ({
      w: item.w,
      file: item.file,
      w_px: item.w_px,
      h_px: item.h_px,
    })),
    credit: {
      author: record.credit.author,
      license: record.credit.license,
      licenseUrl: record.credit.licenseUrl,
      sourceUrl: record.credit.sourceUrl,
      required: record.credit.required,
    },
    alt: { id: record.alt.id, en: record.alt.en },
  };
}

async function writeOutput(countries) {
  const sorted = {};
  for (const country of Object.keys(countries).sort()) {
    sorted[country] = sortEntries(countries[country]).map(sortRecordKeys);
  }
  const payload = { version: 1, budgetKb: Math.round(AVIF_BUDGET_BYTES / 1024), countries: sorted };
  await writeFile(OUTPUT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
}

async function readExistingOutput() {
  if (!existsSync(OUTPUT_PATH)) return {};
  try {
    const raw = await readJson(OUTPUT_PATH);
    return raw?.countries ?? {};
  } catch {
    return {};
  }
}

// --- Fetch ----------------------------------------------------------------------------------

async function runFetch(manifest, opts) {
  const allCountries = Object.keys(manifest.countries);
  let selected;
  if (opts.all) {
    selected = allCountries;
  } else {
    const unknown = opts.countries.filter((code) => !allCountries.includes(code));
    if (unknown.length) throw new Error(`negara tidak ada di manifest: ${unknown.join(', ')}`);
    selected = [...new Set(opts.countries)];
  }
  if (selected.length === 0) {
    usage();
    throw new Error('tidak ada negara dipilih — pakai --all atau --country=xx');
  }

  const jobs = [];
  for (const country of selected) {
    for (const entry of sortEntries(manifest.countries[country])) jobs.push({ country, entry });
  }

  console.log(`[images] ${jobs.length} foto di ${selected.length} negara — ambil metadata…`);
  const metadata = await resolveMetadata(jobs);

  const output = await readExistingOutput();
  const rejections = [];
  const failures = [];

  for (const country of selected) {
    const countryJobs = jobs.filter((job) => job.country === country);
    const rendered = [];
    console.log(`\n[${country}] ${countryJobs.length} foto`);

    for (const { entry } of countryJobs) {
      const resolved = metadata.get(entry.title);
      if (!resolved || resolved.error) {
        rejections.push(`${country}/${entry.slug}: ${resolved?.error ?? 'metadata kosong'}`);
        continue;
      }
      const info = resolved.info;

      if (!ALLOWED_MIME.has(info.mime)) {
        rejections.push(
          `${country}/${entry.slug}: mime ${info.mime} bukan foto (SVG/peta/PDF ditolak)`,
        );
        continue;
      }

      const license = classifyLicense({
        short: metaValue(info, 'LicenseShortName'),
        code: metaValue(info, 'License'),
        restrictions: metaValue(info, 'Restrictions'),
        waived: entry.waiveRestrictions,
      });
      if (!license.ok) {
        rejections.push(
          `${country}/${entry.slug}: ${license.reason} — ${stripQuery(info.descriptionurl)}`,
        );
        continue;
      }

      const credit = creditFor({ info, license });
      if (!credit.author) {
        rejections.push(`${country}/${entry.slug}: author kosong setelah Artist/uploader`);
        continue;
      }

      try {
        const sourcePath = await ensureSource({ country, entry, info, force: opts.force });
        const { record, avifBytes } = await renderEntry({
          country,
          entry: { ...entry, credit },
          sourcePath,
          avifQuality: AVIF_QUALITY_STEPS[0],
        });
        rendered.push({ country, entry, sourcePath, record, avifBytes });
        console.log(
          `  ok ${entry.slug} — ${license.label}, AVIF ${kb(avifBytes)} KB, ${record.width}×${record.height}`,
        );
      } catch (error) {
        failures.push(`${country}/${entry.slug}: ${error.message}`);
      }
      await sleep(REQUEST_GAP_MS);
    }

    let totalAvif = rendered.reduce((sum, job) => sum + job.avifBytes, 0);
    for (const quality of AVIF_QUALITY_STEPS.slice(1)) {
      if (totalAvif <= AVIF_BUDGET_BYTES) break;
      console.log(
        `  budget ${kb(totalAvif)} KB > ${kb(AVIF_BUDGET_BYTES)} KB — encode ulang AVIF q${quality}`,
      );
      totalAvif = 0;
      for (const job of rendered) {
        job.avifBytes = await reencodeAvifOnly({ ...job, quality });
        totalAvif += job.avifBytes;
      }
    }

    if (totalAvif > AVIF_BUDGET_BYTES) {
      failures.push(
        `${country}: AVIF ${kb(totalAvif)} KB melewati budget ${kb(AVIF_BUDGET_BYTES)} KB`,
      );
    } else if (rendered.length > 0) {
      console.log(`  total AVIF ${kb(totalAvif)} KB (budget ${kb(AVIF_BUDGET_BYTES)} KB)`);
      output[country] = rendered.map((job) => job.record);
    }
  }

  await writeOutput(output);

  if (rejections.length || failures.length) {
    if (rejections.length) {
      console.error(`\n[images] ${rejections.length} entri ditolak:`);
      for (const item of rejections) console.error(`  ✕ ${item}`);
    }
    if (failures.length) {
      console.error(`\n[images] ${failures.length} kegagalan:`);
      for (const item of failures) console.error(`  ✕ ${item}`);
    }
    process.exitCode = 1;
    return;
  }
  console.log(
    `\n[images] selesai: ${jobs.length} foto, ${path.relative(ROOT, OUTPUT_PATH)} ditulis.`,
  );
}

// --- Check ----------------------------------------------------------------------------------

async function walkFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) found.push(...(await walkFiles(full, base)));
    else found.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return found.sort();
}

async function runCheck(manifest) {
  const failures = [];
  const perCountryKb = {};
  const avifTotalBytes = { value: 0 };

  if (!existsSync(OUTPUT_PATH)) {
    console.error(
      '[check] src/content/images.json belum ada — jalankan `npm run images:fetch` dulu.',
    );
    process.exitCode = 1;
    return;
  }

  const output = await readExistingOutput();
  const expectedFiles = new Set();
  let entryCount = 0;

  for (const country of Object.keys(manifest.countries).sort()) {
    const manifestEntries = sortEntries(manifest.countries[country]);
    const records = output[country];
    if (!Array.isArray(records)) {
      failures.push(`${country}: tidak ada di images.json`);
      continue;
    }
    let avifBytes = 0;

    for (const entry of manifestEntries) {
      entryCount += 1;
      const where = `${country}/${entry.slug}`;
      const record = records.find((item) => item?.slug === entry.slug);
      if (!record) {
        failures.push(`${where}: tidak ada di images.json`);
        continue;
      }
      if (record.role !== entry.role)
        failures.push(`${where}: role "${record.role}" ≠ manifest "${entry.role}"`);

      const license = classifyLicense({ short: record.credit?.license ?? '' });
      if (!license.ok) failures.push(`${where}: lisensi ditolak — ${license.reason}`);
      if (!/^https?:\/\//.test(record.credit?.licenseUrl ?? ''))
        failures.push(`${where}: licenseUrl tidak valid`);
      if (!record.credit?.author?.trim()) failures.push(`${where}: author kosong`);
      if (!/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/.test(record.credit?.sourceUrl ?? '')) {
        failures.push(`${where}: sourceUrl bukan halaman berkas Commons`);
      }
      const needsCredit = license.ok && (license.group === 'cc-by' || license.group === 'cc-by-sa');
      if (needsCredit && record.credit?.required !== true)
        failures.push(`${where}: credit.required harus true untuk ${record.credit?.license}`);

      if (!/^#[0-9a-f]{6}$/.test(record.dominant ?? ''))
        failures.push(`${where}: dominant bukan hex 6 digit`);
      if (!String(record.lqip ?? '').startsWith('data:image/webp;base64,'))
        failures.push(`${where}: lqip bukan data URI WebP`);
      const focus = record.focus ?? {};
      if (!(focus.x >= 0 && focus.x <= 1 && focus.y >= 0 && focus.y <= 1))
        failures.push(`${where}: focus di luar 0..1`);

      for (const lang of ['id', 'en']) {
        const words = wordCount(String(record.alt?.[lang] ?? ''));
        if (words < 8 || words > 16)
          failures.push(`${where}: alt.${lang} ${words} kata (harus 8–16)`);
      }

      const widths = widthsFor(entry.role);
      for (const kind of ['avif', 'webp']) {
        const variants = Array.isArray(record[kind]) ? record[kind] : [];
        for (const width of widths) {
          if (!variants.some((variant) => variant.w === width))
            failures.push(`${where}: ${kind} ${width} tidak tercatat`);
        }
        for (const variant of variants) {
          const rel = String(variant.file ?? '').replace(/^\/images\/countries\//, '');
          expectedFiles.add(rel);
          const abs = path.join(COUNTRIES_DIR, rel);
          const info = await stat(abs).catch(() => null);
          if (!info) {
            failures.push(`${where}: file hilang ${variant.file}`);
            continue;
          }
          if (info.size === 0) failures.push(`${where}: file kosong ${variant.file}`);
          if (kind === 'avif') avifBytes += info.size;
          try {
            const meta = await sharp(abs).metadata();
            if (meta.width !== variant.w_px || meta.height !== variant.h_px) {
              failures.push(
                `${where}: ${variant.file} ${meta.width}×${meta.height} ≠ catatan ${variant.w_px}×${variant.h_px}`,
              );
            }
          } catch (error) {
            failures.push(`${where}: ${variant.file} tidak terbaca (${error.message})`);
          }
        }
      }
      const largest = Array.isArray(record.avif) ? record.avif[record.avif.length - 1] : undefined;
      if (record.width !== largest?.w_px) failures.push(`${where}: width ≠ w_px varian terbesar`);
    }

    perCountryKb[country] = kb(avifBytes);
    avifTotalBytes.value += avifBytes;
    if (avifBytes > AVIF_BUDGET_BYTES) {
      failures.push(
        `${country}: AVIF ${kb(avifBytes)} KB melewati budget ${kb(AVIF_BUDGET_BYTES)} KB`,
      );
    }
  }

  for (const country of Object.keys(output)) {
    if (!manifest.countries[country])
      failures.push(`${country}: ada di images.json tapi tidak ada di manifest`);
  }

  const onDisk = await walkFiles(COUNTRIES_DIR);
  for (const file of onDisk) {
    if (!expectedFiles.has(file)) failures.push(`${file}: file yatim di public/images/countries`);
  }

  const totalKb = kb(avifTotalBytes.value);
  console.log(
    `[check] ${entryCount} entri, ${onDisk.length} file di disk, total AVIF ${totalKb} KB`,
  );
  console.log(
    `[check] AVIF per negara: ${Object.entries(perCountryKb)
      .map(([c, v]) => `${c} ${v}KB`)
      .join(' · ')}`,
  );

  if (failures.length) {
    console.error(`\n[check] ${failures.length} masalah:`);
    for (const failure of failures) console.error(`  ✕ ${failure}`);
    process.exitCode = 1;
    return;
  }
  console.log('[check] semua gate lulus.');
}

// --- Entry point ----------------------------------------------------------------------------

// Diekspor supaya gate lisensi/crop bisa diuji langsung tanpa menjalankan pipeline.
export { classifyLicense, cropRect, wordCount, widthsFor };

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const manifest = await readManifest();
  if (opts.check) {
    await runCheck(manifest);
    return;
  }
  await runFetch(manifest, opts);
}

const invokedDirectly = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (invokedDirectly) {
  main().catch((error) => {
    console.error(`[images] gagal: ${error.message}`);
    process.exit(1);
  });
}
