import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = 5201;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'docs/VERIFY/p2';

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const consoleErrors1440 = [];
  const consoleErrors375 = [];

  // ==========================================
  // 1440 x 900
  // ==========================================
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page1440.on('console', (m) => m.type() === 'error' && consoleErrors1440.push(m.text()));

  await page1440.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page1440.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 30000 });
  await page1440.waitForTimeout(2000);

  // Hero measurements
  const heroData = await page1440.evaluate(() => {
    const ink = window.__asiakin_scene?.measureInk?.() ?? null;
    const titleEl = document.querySelector('.landing-hero__copy');
    const titleRect = titleEl?.getBoundingClientRect();
    const groundEl = document.querySelector('.landing-hero__ground');
    const groundRect = groundEl?.getBoundingClientRect();
    const hintEl = document.querySelector('.landing-hint');
    const hintRect = hintEl?.getBoundingClientRect();

    const p = (id) => window.__asiakin_scene?.projected(id);
    const jp = p('jp'), sa = p('sa'), id_ = p('id'), cn = p('cn');

    return {
      ink,
      inkCentreY: ink ? (ink.top + ink.bottom) / 2 : null,
      inkCentrePercent: ink ? ((ink.top + ink.bottom) / 2 / 900) * 100 : null,
      title: titleRect ? { left: titleRect.left, top: titleRect.top, bottom: titleRect.bottom } : null,
      ground: groundRect ? { left: groundRect.left, right: groundRect.right, top: groundRect.top, bottom: groundRect.bottom, width: groundRect.width } : null,
      plateRimTop: groundRect ? groundRect.top : null,
      plateRimGap: (groundRect && titleRect) ? groundRect.top - titleRect.bottom : null,
      hint: hintRect ? { top: hintRect.top, bottom: hintRect.bottom } : null,
      orientation: {
        northUp: Boolean(jp && sa && id_ && cn && jp.x > sa.x && id_.y > cn.y),
        jp, sa, id: id_, cn
      }
    };
  });

  const total = await page1440.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

  // Scroll to Scene 2 (Scale) and capture screenshot
  await page1440.evaluate((y) => window.scrollTo(0, y), Math.round(total * 0.14));
  await page1440.waitForTimeout(500);
  await page1440.screenshot({ path: join(OUT_DIR, 'scale-1440.png'), fullPage: false });

  // Map wrap right margin
  const mapWrapMargin = await page1440.evaluate(() => {
    const el = document.querySelector('.landing-map-wrap');
    const b = el.getBoundingClientRect();
    return 1440 - b.right;
  });

  // Counter + highlight sync table
  const syncTable = [];
  for (const f of [0.105, 0.12, 0.135, 0.15, 0.165, 0.175, 0.18]) {
    await page1440.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
    await page1440.waitForTimeout(150);
    syncTable.push(await page1440.evaluate((fraction) => {
      const counterEl = document.querySelector('.landing-scene--scale [data-counter]');
      const marks = [...document.querySelectorAll('.landing-scene--scale [data-highlight]')];
      const lit = marks.filter((m) => Number(getComputedStyle(m).opacity) > 0.85).length;
      return {
        fraction,
        counter: counterEl?.textContent?.trim(),
        lit,
        totalMarks: marks.length,
        match: String(lit) === counterEl?.textContent?.trim()
      };
    }, f));
  }

  // Scene 3 max vertical gap
  await page1440.evaluate((y) => window.scrollTo(0, y), Math.round(total * (220 / 920)));
  await page1440.waitForTimeout(400);
  const scene3Gaps = await page1440.evaluate(() => {
    const h2 = document.querySelector('.landing-scene--language h2');
    const pNote = document.querySelector('.landing-scene--language .landing-note');
    const sil = document.querySelector('.landing-lang__shape');
    const h2b = h2.getBoundingClientRect();
    const pb = pNote.getBoundingClientRect();
    const sb = sil.getBoundingClientRect();
    return {
      gapH2ToNote: pb.top - h2b.bottom,
      gapNoteToSilBottom: sb.bottom - pb.bottom,
      maxGap: Math.max(pb.top - h2b.bottom, sb.bottom - pb.bottom)
    };
  });

  // Scene 6 (Cultural) overlap & screenshot
  await page1440.evaluate((y) => window.scrollTo(0, y), Math.round(total * (620 / 920) + 200));
  await page1440.waitForTimeout(500);
  await page1440.screenshot({ path: join(OUT_DIR, 'cultural-1440.png'), fullPage: false });

  const culturalIntersections = await page1440.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { l: b.left, t: b.top, r: b.right, b: b.bottom };
    };
    const inter = (a, b) => {
      if (!a || !b) return 0;
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
      const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      return w > 0 && h > 0 ? Math.round(w * h) : 0;
    };
    const head = r('.landing-scene--cultural .landing-display');
    const tr = r('.landing-cultural__layer--tr');
    const th = r('.landing-cultural__layer--th');
    const labelTr = r('.landing-cultural__label--tr');
    const labelTh = r('.landing-cultural__label--th');

    return {
      headTr: inter(head, tr),
      headTh: inter(head, th),
      labelTr: inter(labelTr, tr),
      labelTh: inter(labelTh, th),
      gapTrToLabel: labelTr ? labelTr.t - tr.b : null,
      gapThToLabel: labelTh ? labelTh.t - th.b : null
    };
  });

  // Footer & screenshot
  await page1440.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page1440.waitForTimeout(500);
  await page1440.screenshot({ path: join(OUT_DIR, 'landing-1440.png'), fullPage: false });

  const footerData1440 = await page1440.evaluate(() => {
    const h = document.querySelector('.landing-footer__copy .landing-display');
    const mark = document.querySelector('.landing-footer__mark');
    const links = [...document.querySelectorAll('.landing-footer__links a')].map((a) => ({
      text: a.textContent?.trim(),
      href: a.getAttribute('href')
    }));
    const items = [...document.querySelectorAll('.landing-footer__source-item')].map((item) => ({
      country: item.querySelector('.landing-footer__source-country')?.textContent?.replace(':', '').trim(),
      linksCount: item.querySelectorAll('a').length
    }));
    return {
      headingText: h?.textContent?.trim(),
      headingFontSize: h ? getComputedStyle(h).fontSize : null,
      markText: mark?.textContent?.trim(),
      totalLinks: links.length,
      countriesCovered: items.length,
      perCountryBreakdown: items
    };
  });

  // Section 8 textLefts & stage padding
  const sectionsGrid1440 = await page1440.evaluate(() => {
    const scenes = [...document.querySelectorAll('.landing-scene')];
    return scenes.map((s) => {
      const first = s.querySelector('h1, h2, h3, .landing-note, .landing-display');
      const r = first?.getBoundingClientRect();
      const stage = s.querySelector('.landing-stage');
      const paddingLeft = stage ? parseFloat(getComputedStyle(stage).paddingLeft) : null;
      return {
        scene: s.className.replace('landing-scene', '').trim(),
        textLeft: r ? +r.left.toFixed(1) : null,
        stagePaddingLeft: paddingLeft
      };
    });
  });

  await page1440.close();

  // ==========================================
  // 375 x 812
  // ==========================================
  const page375 = await browser.newPage({ viewport: { width: 375, height: 812 } });
  page375.on('console', (m) => m.type() === 'error' && consoleErrors375.push(m.text()));

  await page375.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page375.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 30000 });
  await page375.waitForTimeout(2000);

  const hero375 = await page375.evaluate(() => {
    const ink = window.__asiakin_scene?.measureInk?.() ?? null;
    const titleEl = document.querySelector('.landing-hero__copy');
    const titleRect = titleEl?.getBoundingClientRect();
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;
    return {
      ink,
      title: titleRect ? { left: titleRect.left, top: titleRect.top, bottom: titleRect.bottom } : null,
      scrollWidth,
      innerWidth,
      overflow: scrollWidth > innerWidth
    };
  });

  // Scroll to footer at 375 and capture screenshot
  await page375.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page375.waitForTimeout(500);
  await page375.screenshot({ path: join(OUT_DIR, 'footer-375.png'), fullPage: false });

  const footer375 = await page375.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;
    const gridCols = getComputedStyle(document.querySelector('.landing-footer__links')).gridTemplateColumns;
    return {
      scrollWidth,
      innerWidth,
      overflow: scrollWidth > innerWidth,
      gridCols
    };
  });

  await page375.close();
  await browser.close();

  console.log('\n=== COMPREHENSIVE P2 MEASUREMENTS ===');
  console.log(JSON.stringify({
    hero1440: heroData,
    sectionsGrid1440,
    mapWrapMargin1440: mapWrapMargin,
    syncTable,
    scene3Gaps,
    culturalIntersections,
    footerData1440,
    consoleErrors1440,
    hero375,
    footer375,
    consoleErrors375
  }, null, 2));
}

run().catch((err) => {
  console.error('Probe failed:', err);
  process.exit(1);
});
