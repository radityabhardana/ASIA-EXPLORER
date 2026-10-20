/**
 * Visual research capture harness (isolated lane: writes only to docs/research/).
 *
 * Run: node docs/research/capture.mjs
 * Requires: @playwright/test (already in devDependencies). No new deps.
 *
 * For every target x viewport it captures viewport screenshots at 5 scroll
 * positions, page metrics (sticky / video / canvas / matrix3d / scroll-attrs /
 * pinned sections / height in vh), and console + page errors.
 */
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(ROOT, 'shots');

const TARGETS = [
  {
    slug: 'awwwards-parallax',
    url: 'https://www.awwwards.com/websites/parallax/',
    role: 'collection',
    note: 'Halaman koleksi awwwards (sumber pemilihan situs)',
  },
  {
    slug: 'apricode',
    url: 'https://apricode.agency',
    role: 'site',
    note: 'Dari daftar awwwards/parallax: #1 Apricode (Parallax, Scrolling, Storytelling, GSAP)',
  },
  {
    slug: 'lenval',
    url: 'https://lenvalproperties.com',
    role: 'site',
    note: 'Dari daftar awwwards/parallax: Lenval Properties (Parallax, Typography, WebGL, Storytelling, GSAP)',
  },
  {
    slug: 'motion-dev',
    url: 'https://motion.dev/',
    role: 'reference',
    note: 'Dokumentasi Motion (Framer Motion)',
  },
  {
    slug: 'threejs-home',
    url: 'https://threejs.org/',
    role: 'reference',
    note: 'Landing three.js',
  },
  {
    slug: 'threejs-examples',
    url: 'https://threejs.org/examples/',
    role: 'reference',
    note: 'Index examples three.js',
  },
];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];

const STEPS = [0, 25, 50, 75, 100];
const SETTLE_MS = 800;

const SCROLL_ATTR_SELECTOR = [
  '[data-scroll]',
  '[data-scroll-speed]',
  '[data-scroll-section]',
  '[data-scroll-container]',
  '[data-scroll-sticky]',
  '[data-scroll-target]',
  '[data-speed]',
  '[data-lag]',
  '[data-parallax]',
  '[data-scroll-repeat]',
  '[data-scroll-offset]',
].join(',');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Paint-level page metrics. Runs in the page. */
function collectMetrics(selector) {
  const all = Array.from(document.querySelectorAll('*'));
  const vh = window.innerHeight;
  let stickyCount = 0;
  let matrix3d = 0;
  let fixedCount = 0;
  let pinned = 0;
  const pinnedDetail = [];
  const stickyDetail = [];

  for (const el of all) {
    const cs = getComputedStyle(el);
    if (cs.position === 'fixed') fixedCount++;
    if (cs.transform && cs.transform.startsWith('matrix3d')) matrix3d++;
    if (cs.position === 'sticky' || cs.position === '-webkit-sticky') {
      stickyCount++;
      const parent = el.parentElement;
      const parentH = parent ? parent.getBoundingClientRect().height : 0;
      const ratio = parentH / vh;
      if (stickyDetail.length < 12) {
        stickyDetail.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.className && String(el.className).slice(0, 70)) || '',
          top: cs.top,
          parentVh: Math.round(ratio * 100) / 100,
        });
      }
      if (parentH > vh * 1.05) {
        pinned++;
        if (pinnedDetail.length < 10) {
          pinnedDetail.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className && String(el.className).slice(0, 70)) || '',
            top: cs.top,
            parentVh: Math.round(ratio * 100) / 100,
          });
        }
      }
    }
  }

  const doc = document.documentElement;
  const scrollHeight = Math.max(
    doc.scrollHeight,
    document.body ? document.body.scrollHeight : 0,
  );

  const h1 = document.querySelector('h1');
  const h1Size = h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0;

  return {
    title: document.title,
    scrollHeight,
    viewportHeight: vh,
    heightVh: Math.round((scrollHeight / vh) * 100) / 100,
    stickyCount,
    pinned,
    pinnedDetail,
    stickyDetail,
    fixedCount,
    videoCount: document.querySelectorAll('video').length,
    autoplayVideo: document.querySelectorAll('video[autoplay]').length,
    canvasCount: document.querySelectorAll('canvas').length,
    matrix3d,
    scrollAttrCount: document.querySelectorAll(selector).length,
    lazyImages: document.querySelectorAll('img[loading="lazy"]').length,
    imgCount: document.querySelectorAll('img').length,
    h1: h1 ? h1.innerText.replace(/\s+/g, ' ').trim().slice(0, 120) : '',
    h1FontVh: h1Size ? Math.round((h1Size / vh) * 1000) / 10 : 0,
  };
}

/** Transform fingerprint of a hero-ish element. Runs in the page. */
function heroFingerprint() {
  const candidates = [
    'main h1',
    'h1',
    '[class*="hero"] h1',
    '[class*="hero"]',
    '[class*="Hero"]',
    'section:first-of-type',
    'main > section:first-child',
    'canvas',
    '[class*="sticky"]',
    '[class*="pin"]',
  ];
  const seen = new Set();
  const out = [];
  for (const sel of candidates) {
    let el = null;
    try {
      el = document.querySelector(sel);
    } catch {
      continue;
    }
    if (!el || seen.has(el)) continue;
    seen.add(el);
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    out.push({
      selector: sel,
      tag: el.tagName.toLowerCase(),
      cls: (el.className && String(el.className).slice(0, 60)) || '',
      transform: cs.transform,
      translate: cs.translate,
      opacity: cs.opacity,
      top: Math.round(r.top),
      height: Math.round(r.height),
    });
    if (out.length >= 5) break;
  }
  return out;
}

async function warmUpScroll(page) {
  // Trigger lazy loading / scroll-triggered mount before measuring.
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    const max = document.documentElement.scrollHeight - window.innerHeight;
    for (let y = 0; y < max; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, max);
  });
  await sleep(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);
}

async function captureViewport(browser, target, vp, errors) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    reducedMotion: 'no-preference',
    isMobile: vp.name === 'mobile',
    hasTouch: vp.name === 'mobile',
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error' && consoleErrors.length < 25) {
      consoleErrors.push(msg.text().replace(/\s+/g, ' ').slice(0, 300));
    }
  });
  page.on('pageerror', (err) => {
    if (pageErrors.length < 25) {
      pageErrors.push(String(err.message || err).replace(/\s+/g, ' ').slice(0, 300));
    }
  });

  const record = {
    slug: target.slug,
    url: target.url,
    role: target.role,
    viewport: vp.name,
    width: vp.width,
    height: vp.height,
    httpStatus: null,
    finalUrl: '',
    shots: [],
    metrics: null,
    consoleErrors,
    pageErrors,
    heroTrack: null,
    error: null,
  };

  try {
    const res = await page.goto(target.url, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    record.httpStatus = res ? res.status() : null;
    record.finalUrl = page.url();
    await page.waitForLoadState('load', { timeout: 30000 }).catch(() => {});
    await sleep(3000);

    await warmUpScroll(page);

    record.metrics = await page.evaluate(collectMetrics, SCROLL_ATTR_SELECTOR);

    const max = Math.max(
      0,
      record.metrics.scrollHeight - record.metrics.viewportHeight,
    );

    for (const pct of STEPS) {
      const y = Math.round((max * pct) / 100);
      await page.evaluate((top) => {
        window.scrollTo({ top, behavior: 'instant' });
      }, y);
      await sleep(SETTLE_MS);
      const file = path.join(SHOTS, `${target.slug}-${vp.name}-${pct}.png`);
      await page.screenshot({ path: file, fullPage: false });
      record.shots.push(path.relative(ROOT, file).replace(/\\/g, '/'));
    }

    // Scroll-linked proof: sample hero transforms at 3 positions.
    if (vp.name === 'desktop' && target.role === 'site') {
      const samples = [];
      for (const pct of [0, 50, 90]) {
        const y = Math.round((max * pct) / 100);
        await page.evaluate((top) => {
          window.scrollTo({ top, behavior: 'instant' });
        }, y);
        await sleep(SETTLE_MS);
        samples.push({
          pct,
          scrollY: await page.evaluate(() => Math.round(window.scrollY)),
          elements: await page.evaluate(heroFingerprint),
        });
      }
      record.heroTrack = samples;
    }
  } catch (err) {
    record.error = String(err.message || err).replace(/\s+/g, ' ').slice(0, 400);
  } finally {
    errors.push(record);
    await context.close().catch(() => {});
  }
  return record;
}

function fmt(n) {
  return n === null || n === undefined || Number.isNaN(n) ? '-' : String(n);
}

function tableRow(records) {
  const lines = [
    '| URL | viewport | tinggi (vh) | sticky | pinned | video | canvas | matrix3d | data-scroll* | HTTP | catatan |',
    '|---|---|---|---|---|---|---|---|---|---|---|',
  ];
  for (const r of records) {
    const m = r.metrics;
    const notes = [];
    if (r.httpStatus && r.httpStatus >= 400) notes.push(`HTTP ${r.httpStatus}`);
    if (r.error) notes.push(`GAGAL: ${r.error.slice(0, 90)}`);
    if (r.pageErrors.length) notes.push(`${r.pageErrors.length} pageerror`);
    if (r.consoleErrors.length) notes.push(`${r.consoleErrors.length} console error`);
    if (m && m.autoplayVideo) notes.push(`${m.autoplayVideo} video autoplay`);
    lines.push(
      `| ${r.finalUrl || r.url} | ${r.viewport} | ${fmt(m?.heightVh)} | ${fmt(m?.stickyCount)} | ${fmt(m?.pinned)} | ${fmt(m?.videoCount)} | ${fmt(m?.canvasCount)} | ${fmt(m?.matrix3d)} | ${fmt(m?.scrollAttrCount)} | ${fmt(r.httpStatus)} | ${notes.join('; ') || '-'} |`,
    );
  }
  return lines.join('\n');
}

function errorSection(records) {
  const out = [];
  for (const r of records) {
    if (!r.consoleErrors.length && !r.pageErrors.length && !r.error) continue;
    out.push(`\n### ${r.slug} — ${r.viewport}\n`);
    if (r.error) out.push(`- navigasi/gagal: \`${r.error}\``);
    for (const e of r.consoleErrors) out.push(`- console.error: \`${e}\``);
    for (const e of r.pageErrors) out.push(`- pageerror: \`${e}\``);
  }
  return out.length ? out.join('\n') : '\nTidak ada console error / pageerror tercatat.';
}

function heroSection(records) {
  const withTrack = records.filter((r) => r.heroTrack && r.heroTrack.length);
  if (!withTrack.length) return '\nTidak ada sampel transform.';
  const out = [];
  for (const r of withTrack) {
    out.push(`\n### ${r.slug} (${r.viewport})\n`);
    out.push('| scroll | scrollY | selector | transform | opacity | rect.top |');
    out.push('|---|---|---|---|---|---|');
    for (const s of r.heroTrack) {
      for (const el of s.elements) {
        out.push(
          `| ${s.pct}% | ${s.scrollY} | \`${el.selector}\` | \`${el.transform}\` | ${el.opacity} | ${el.top} |`,
        );
      }
    }
  }
  return out.join('\n');
}

function detailsSection(records) {
  const out = [];
  for (const r of records) {
    if (!r.metrics || !r.metrics.pinnedDetail.length) continue;
    out.push(`\n### ${r.slug} — ${r.viewport} — pinned`);
    for (const p of r.metrics.pinnedDetail) {
      out.push(
        `- \`${p.tag}.${p.cls || '_(tanpa class)_'}\` — top: ${p.top}, parent ${p.parentVh}vh`,
      );
    }
  }
  return out.length ? out.join('\n') : '\nTidak ada section pinned terdeteksi.';
}

async function main() {
  await fs.mkdir(SHOTS, { recursive: true });
  const browser = await chromium.launch();
  const records = [];

  for (const vp of VIEWPORTS) {
    for (const target of TARGETS) {
      process.stdout.write(`[capture] ${target.slug} / ${vp.name} ... `);
      const rec = await captureViewport(browser, target, vp, records);
      if (rec.error) console.log(`GAGAL (${rec.httpStatus}): ${rec.error.slice(0, 120)}`);
      else
        console.log(
          `OK ${rec.httpStatus} ${rec.metrics?.heightVh}vh sticky=${rec.metrics?.stickyCount} shots=${rec.shots.length}`,
        );
    }
  }

  await browser.close();

  const shotsOnDisk = (await fs.readdir(SHOTS)).filter((f) => f.endsWith('.png'));

  await fs.writeFile(
    path.join(ROOT, 'metrics.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), targets: TARGETS, records }, null, 2),
  );

  const analysisPath = path.join(ROOT, 'analysis.md');
  let analysis = '';
  try {
    analysis = await fs.readFile(analysisPath, 'utf8');
  } catch {
    analysis = '_(analysis.md belum ada — jalankan ulang setelah menulis analisis.)_';
  }

  const md = `# Riset Referensi Visual — Parallax & Scroll Narrative

Digenerate oleh \`docs/research/capture.mjs\` pada ${new Date().toISOString()} (Playwright/Chromium, desktop 1440×900 & mobile 390×844, deviceScaleFactor 1, reducedMotion \`no-preference\`).
Screenshot: ${shotsOnDisk.length} file di \`docs/research/shots/\`. Data mentah: \`docs/research/metrics.json\`.

Target yang dipakai (situs nyata dari daftar awwwards/parallax): **Apricode** dan **Lenval Properties**. Halaman koleksi ikut direkam sebagai bukti sumber seleksi.

---

## 1. Metrik per halaman

${tableRow(records)}

> \`pinned\` = elemen \`position: sticky\` yang tinggi parent-nya > 105% viewport (satu section mengunci satu elemen untuk beberapa layar). \`matrix3d\` = elemen dengan transform 3D aktif saat metric dibaca (indikatif; nilai bisa 0 kalau transform di-set hanya saat scroll).

### Detail section pinned

${detailsSection(records)}

## 2. Bukti transform scroll-linked

${heroSection(records)}

## 3. Console error & pageerror

${errorSection(records)}

---

${analysis}
`;

  await fs.writeFile(path.join(ROOT, 'report.md'), md);

  // Console summary
  console.log(`\nshots on disk: ${shotsOnDisk.length}`);
  for (const r of records) {
    console.log(
      `${r.slug.padEnd(18)} ${r.viewport.padEnd(8)} http=${fmt(r.httpStatus)} vh=${fmt(r.metrics?.heightVh)} sticky=${fmt(r.metrics?.stickyCount)} pinned=${fmt(r.metrics?.pinned)} video=${fmt(r.metrics?.videoCount)} canvas=${fmt(r.metrics?.canvasCount)} m3d=${fmt(r.metrics?.matrix3d)} err=${r.consoleErrors.length}/${r.pageErrors.length}`,
    );
  }

  const hardFailures = records.filter((r) => r.error || !r.metrics);
  if (hardFailures.length) {
    console.log(`\n${hardFailures.length}/${records.length} page-captures gagal (per-URL, tidak menghentikan run).`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('FATAL', err);
  process.exit(1);
});
