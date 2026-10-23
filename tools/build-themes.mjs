#!/usr/bin/env node
/**
 * Mesin Ekstraksi Tema Foto & Palet Adaptif Halaman Negara (Tahap C.1).
 * Mengimplementasikan aturan:
 *   - docs/RESEARCH_TERRAIN.md Part 4 (§4a–§4d)
 *   - docs/PRD_MASTER.md §2.B
 *
 * Penggunaan:
 *   node tools/build-themes.mjs          # Ekstrak palet dari hero AVIF -> src/content/themes.json
 *   node tools/build-themes.mjs --check  # Verifikasi integritas & kontras tanpa menulis ulang
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

import { contrastRatio, hexToRgb } from '../src/lib/color.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

const IMAGES_JSON_PATH = path.join(ROOT, 'src/content/images.json');
const OUTPUT_PATH = path.join(ROOT, 'src/content/themes.json');

const COUNTRY_IDS = [
  'id',
  'my',
  'sg',
  'th',
  'vn',
  'ph',
  'cn',
  'jp',
  'kr',
  'in',
  'sa',
  'tr',
  'kz',
  'uz',
  'mn',
];

const INK_HEX = '#1a1f24';
const INK_MUTED_HEX = '#5c6670';
const CONTOUR_OPACITY = 0.16;

const MIN_INK_CONTRAST = 12.0;
const MIN_MUTED_CONTRAST = 4.5;

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h: Math.round((h + 360) % 360), s, l };
}

function hslToRgb(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (h % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;

  if (hp >= 0 && hp < 1) [r1, g1, b1] = [c, x, 0];
  else if (hp >= 1 && hp < 2) [r1, g1, b1] = [x, c, 0];
  else if (hp >= 2 && hp < 3) [r1, g1, b1] = [0, c, x];
  else if (hp >= 3 && hp < 4) [r1, g1, b1] = [0, x, c];
  else if (hp >= 4 && hp < 5) [r1, g1, b1] = [x, 0, c];
  else if (hp >= 5 && hp < 6) [r1, g1, b1] = [c, 0, x];

  const m = l - c / 2;
  return [
    Math.round((r1 + m) * 255),
    Math.round((g1 + m) * 255),
    Math.round((b1 + m) * 255),
  ];
}

function toHex([r, g, b]) {
  return (
    '#' +
    [r, g, b]
      .map((x) =>
        Math.max(0, Math.min(255, Math.round(x)))
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}

/**
 * Ekstraksi k cluster representatif dari citra secara deterministik.
 */
async function extractClusters(fullPath, k = 8) {
  const { data } = await sharp(fullPath)
    .resize(64, 64, { fit: 'fill' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const numPixels = data.length / 3;
  const centroids = [];
  const step = Math.floor(numPixels / k);

  for (let i = 0; i < k; i++) {
    const idx = i * step * 3;
    centroids.push([data[idx], data[idx + 1], data[idx + 2]]);
  }

  const assignments = new Int32Array(numPixels);
  for (let iter = 0; iter < 12; iter++) {
    for (let p = 0; p < numPixels; p++) {
      const r = data[p * 3];
      const g = data[p * 3 + 1];
      const b = data[p * 3 + 2];
      let bestDist = Infinity;
      let bestIdx = 0;
      for (let j = 0; j < k; j++) {
        const c = centroids[j];
        const dist = (r - c[0]) ** 2 + (g - c[1]) ** 2 + (b - c[2]) ** 2;
        if (dist < bestDist) {
          bestDist = dist;
          bestIdx = j;
        }
      }
      assignments[p] = bestIdx;
    }

    const sums = Array.from({ length: k }, () => [0, 0, 0, 0]);
    for (let p = 0; p < numPixels; p++) {
      const j = assignments[p];
      sums[j][0] += data[p * 3];
      sums[j][1] += data[p * 3 + 1];
      sums[j][2] += data[p * 3 + 2];
      sums[j][3]++;
    }

    for (let j = 0; j < k; j++) {
      if (sums[j][3] > 0) {
        centroids[j] = [
          Math.round(sums[j][0] / sums[j][3]),
          Math.round(sums[j][1] / sums[j][3]),
          Math.round(sums[j][2] / sums[j][3]),
        ];
      }
    }
  }

  const counts = new Array(k).fill(0);
  for (let p = 0; p < numPixels; p++) counts[assignments[p]]++;

  return centroids
    .map((c, i) => {
      const hsl = rgbToHsl(c[0], c[1], c[2]);
      return {
        hex: toHex(c),
        r: c[0],
        g: c[1],
        b: c[2],
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        count: counts[i],
        pct: counts[i] / numPixels,
      };
    })
    .filter((c) => c.pct >= 0.02);
}

/**
 * Memilih cluster earthy tone untuk latar relief tanah (L 0.35–0.55).
 */
function pickSoilColor(clusters) {
  let best = clusters[0];
  let bestScore = -Infinity;

  for (const c of clusters) {
    let earthScore = 0.2;
    if (c.h >= 15 && c.h <= 55) earthScore = 1.0;
    else if (c.h > 55 && c.h <= 90) earthScore = 0.7;
    else if (c.s <= 0.15) earthScore = 0.5;

    const inLRange = c.l >= 0.35 && c.l <= 0.55;
    const score = (inLRange ? 5 : 0) + earthScore * 4 - Math.abs(c.l - 0.45) * 2 + c.pct * 2;
    if (score > bestScore) {
      bestScore = score;
      best = c;
    }
  }

  const clampedL = Math.max(0.35, Math.min(0.55, best.l));
  return toHex(hslToRgb(best.h, best.s, clampedL));
}

/**
 * Memilih cluster saturasi kuat untuk aksen (L 0.35–0.50).
 */
function pickAccentColor(clusters) {
  let best = clusters[0];
  let maxSat = -Infinity;

  for (const c of clusters) {
    if (c.l > 0.05 && c.l < 0.95 && c.s > maxSat) {
      maxSat = c.s;
      best = c;
    }
  }

  const clampedL = Math.max(0.35, Math.min(0.5, best.l));
  const clampedS = Math.min(0.75, Math.max(0.2, best.s));
  return toHex(hslToRgb(best.h, clampedS, clampedL));
}

/**
 * Ekstraksi palet lengkap satu negara dari foto hero.
 */
async function extractThemeForCountry(countryId, imagesData) {
  const countryList = imagesData.countries[countryId];
  if (!countryList) {
    throw new Error(`Data gambar untuk negara '${countryId}' tidak ditemukan di images.json`);
  }

  const hero = countryList.find((entry) => entry.role === 'hero');
  if (!hero) {
    throw new Error(`Foto bertipe 'hero' untuk negara '${countryId}' tidak ditemukan di images.json`);
  }

  const avifEntry = hero.avif?.find((item) => item.w === 960);
  if (!avifEntry?.file) {
    throw new Error(`Berkas derivative 960.avif untuk '${countryId}/${hero.slug}' tidak ditemukan`);
  }

  const fullPath = path.join(ROOT, 'public', avifEntry.file);
  if (!existsSync(fullPath)) {
    throw new Error(`Berkas gambar tidak ditemukan di disk: ${fullPath}`);
  }

  // 1. Mean RGB via sharp(path).stats().channels
  const stats = await sharp(fullPath).stats();
  const [mr, mg, mb] = stats.channels.slice(0, 3).map((ch) => Math.round(ch.mean));
  const meanHsl = rgbToHsl(mr, mg, mb);

  // 2. Ekstraksi cluster foto
  const clusters = await extractClusters(fullPath);

  // Deteksi bila hero memiliki massa batu/tanah hangat dominan (contoh Al-Ula SA)
  let photoHue = meanHsl.h;
  if (countryId === 'sa') {
    // Al-Ula: mean terdistorsi oleh langit biru + batu pasir komplementer; gunakan hue batu pasir 30°
    photoHue = 30;
  }

  // 3. Warna Base: S 8–16% (0.12), L 0.94–0.97 (0.95) -> pastel anti-muddy
  const base = toHex(hslToRgb(photoHue, 0.12, 0.95));

  // 4. Warna Soil: cluster earthy tone (L 0.35–0.55)
  const soil = pickSoilColor(clusters);

  // 5. Warna Accent: cluster saturasi tinggi (L 0.35–0.50)
  const accent = pickAccentColor(clusters);

  // 6. Garis Kontur: hue dari foto dengan S 20–35% (0.28) dan L 45–55% (0.50)
  const contourStroke = toHex(hslToRgb(photoHue, 0.28, 0.5));

  // 7. Verifikasi kontras relatif
  const inkContrast = contrastRatio(INK_HEX, base);
  const mutedContrast = contrastRatio(INK_MUTED_HEX, base);

  const roundedInkContrast = Number(inkContrast.toFixed(1));
  const roundedMutedContrast = Number(mutedContrast.toFixed(1));

  return {
    base,
    soil,
    accent,
    contourStroke,
    contourOpacity: CONTOUR_OPACITY,
    contrast: {
      inkVsBase: roundedInkContrast,
      inkMutedVsBase: roundedMutedContrast,
    },
  };
}

/**
 * Mode Verifikasi (--check)
 */
async function runCheck() {
  console.log('[themes:check] Memeriksa src/content/themes.json...');

  if (!existsSync(OUTPUT_PATH)) {
    console.error(`[themes:check] GAGAL: Berkas ${OUTPUT_PATH} belum dibuat.`);
    process.exit(1);
  }

  let raw;
  try {
    raw = readFileSync(OUTPUT_PATH, 'utf8');
  } catch (err) {
    console.error(`[themes:check] GAGAL: Tidak dapat membaca ${OUTPUT_PATH}: ${err.message}`);
    process.exit(1);
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.error(`[themes:check] GAGAL: Format JSON tidak valid: ${err.message}`);
    process.exit(1);
  }

  if (data.version !== 1) {
    console.error(`[themes:check] GAGAL: Versi tema harus 1, ditemukan: ${data.version}`);
    process.exit(1);
  }

  if (!data.countries || typeof data.countries !== 'object') {
    console.error(`[themes:check] GAGAL: Properti 'countries' tidak ditemukan.`);
    process.exit(1);
  }

  const failures = [];
  const HEX_RE = /^#[0-9a-f]{6}$/i;

  console.log('\nID   Base      Soil      Accent    Stroke    inkVsBase   inkMutedVsBase  Status');
  console.log('---  --------  --------  --------  --------  ----------  --------------  ------');

  for (const cid of COUNTRY_IDS) {
    const theme = data.countries[cid];
    if (!theme) {
      failures.push(`Negara '${cid}' tidak ada di themes.json`);
      continue;
    }

    if (!HEX_RE.test(theme.base ?? '')) failures.push(`${cid}: base bukan hex valid (${theme.base})`);
    if (!HEX_RE.test(theme.soil ?? '')) failures.push(`${cid}: soil bukan hex valid (${theme.soil})`);
    if (!HEX_RE.test(theme.accent ?? '')) failures.push(`${cid}: accent bukan hex valid (${theme.accent})`);
    if (!HEX_RE.test(theme.contourStroke ?? ''))
      failures.push(`${cid}: contourStroke bukan hex valid (${theme.contourStroke})`);
    if (theme.contourOpacity !== 0.16)
      failures.push(`${cid}: contourOpacity harus 0.16, ditemukan ${theme.contourOpacity}`);

    const inkCr = contrastRatio(INK_HEX, theme.base);
    const mutedCr = contrastRatio(INK_MUTED_HEX, theme.base);

    if (inkCr < MIN_INK_CONTRAST) {
      failures.push(`${cid}: kontras inkVsBase (${inkCr.toFixed(2)}) < ${MIN_INK_CONTRAST}:1 (WCAG AAA)`);
    }
    if (mutedCr < MIN_MUTED_CONTRAST) {
      failures.push(
        `${cid}: kontras inkMutedVsBase (${mutedCr.toFixed(2)}) < ${MIN_MUTED_CONTRAST}:1 (WCAG AA)`,
      );
    }

    const rowStatus = inkCr >= MIN_INK_CONTRAST && mutedCr >= MIN_MUTED_CONTRAST ? 'LULUS' : 'GAGAL';
    console.log(
      `${cid.padEnd(4)} ` +
        `${(theme.base || '-').padEnd(9)} ` +
        `${(theme.soil || '-').padEnd(9)} ` +
        `${(theme.accent || '-').padEnd(9)} ` +
        `${(theme.contourStroke || '-').padEnd(9)} ` +
        `${inkCr.toFixed(1).padStart(6)}:1     ` +
        `${mutedCr.toFixed(1).padStart(7)}:1       ` +
        `${rowStatus}`,
    );
  }

  if (failures.length > 0) {
    console.error(`\n[themes:check] Ditemukan ${failures.length} masalah:`);
    for (const fail of failures) {
      console.error(`  - ${fail}`);
    }
    process.exit(1);
  }

  console.log(`\n[themes:check] SEMUA 15 NEGARA LULUS verifikasi kontras dan integritas.`);
  process.exit(0);
}

/**
 * Mode Generator (Default)
 */
async function runBuild() {
  console.log('[themes:build] Membaca metadata gambar dari src/content/images.json...');

  if (!existsSync(IMAGES_JSON_PATH)) {
    console.error(`[themes:build] GAGAL: ${IMAGES_JSON_PATH} tidak ditemukan.`);
    process.exit(1);
  }

  const imagesRaw = readFileSync(IMAGES_JSON_PATH, 'utf8');
  const imagesData = JSON.parse(imagesRaw);

  const countriesTheme = {};

  for (const cid of COUNTRY_IDS) {
    process.stdout.write(`  - Mengolah negara [${cid}]... `);
    const theme = await extractThemeForCountry(cid, imagesData);
    countriesTheme[cid] = theme;
    console.log(`OK (base: ${theme.base}, ink: ${theme.contrast.inkVsBase}:1, muted: ${theme.contrast.inkMutedVsBase}:1)`);
  }

  const output = {
    version: 1,
    countries: countriesTheme,
  };

  writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf8');
  console.log(`\n[themes:build] Sukses menulis ${OUTPUT_PATH}`);
}

const isCheck = process.argv.includes('--check');
if (isCheck) {
  runCheck().catch((err) => {
    console.error(`[themes:check] Terjadi kesalahan fatal:`, err);
    process.exit(1);
  });
} else {
  runBuild().catch((err) => {
    console.error(`[themes:build] Terjadi kesalahan fatal:`, err);
    process.exit(1);
  });
}
