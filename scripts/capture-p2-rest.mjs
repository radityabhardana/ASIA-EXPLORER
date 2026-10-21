import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = 5201;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'docs/VERIFY/p2';

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  // ==========================================
  // 1440 x 900
  // ==========================================
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page1440.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 30000 });
  await page1440.waitForTimeout(2000);

  // 1. Cultural at rest (scrollY 5670)
  await page1440.evaluate(() => window.scrollTo(0, 5670));
  await page1440.waitForFunction(() => Math.abs(window.scrollY - 5670) < 5);
  await page1440.waitForTimeout(1000);
  await page1440.screenshot({ path: join(OUT_DIR, 'cultural-rest-1440.png'), fullPage: false });

  const culturalBoxes1440 = await page1440.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height };
    };
    const head = r('.landing-scene--cultural .landing-display');
    const colTr = r('.landing-cultural__col--tr');
    const colTh = r('.landing-cultural__col--th');
    const tr = r('.landing-cultural__layer--tr');
    const th = r('.landing-cultural__layer--th');
    const labelTr = r('.landing-cultural__label--tr');
    const labelTh = r('.landing-cultural__label--th');
    const iconTr = r('.landing-cultural__icon--cezve');
    const iconTh = r('.landing-cultural__icon--wai');

    return {
      head,
      colTr,
      colTh,
      tr,
      th,
      labelTr,
      labelTh,
      iconTr,
      iconTh,
      colTrEdges: colTr ? `${colTr.l} -> ${colTr.r}` : null,
      colThEdges: colTh ? `${colTh.l} -> ${colTh.r}` : null,
      gutterBetweenCols: (colTh && colTr) ? colTh.l - colTr.r : null,
      trHeight: tr?.h,
      thHeight: th?.h,
      heightDiff: (tr && th) ? Math.abs(tr.h - th.h) : null,
      headlineBottom: head?.b,
      trTop: tr?.t,
      thTop: th?.t,
      overlapHeadTr: (head && tr && head.b > tr.t) ? head.b - tr.t : 0,
      overlapHeadTh: (head && th && head.b > th.t) ? head.b - th.t : 0,
      labelTrBottom: labelTr?.b,
      labelThBottom: labelTh?.b,
      baselineDiff: (labelTr && labelTh) ? Math.abs(labelTr.b - labelTh.b) : null,
      lowestCaptionBottom: Math.max(labelTr?.b ?? 0, labelTh?.b ?? 0),
      bottomGapBelowCaptions: 900 - Math.max(labelTr?.b ?? 0, labelTh?.b ?? 0),
      iconTrInsideCaption: (iconTr && labelTr) ? (iconTr.l >= labelTr.l - 1 && iconTr.r <= labelTr.r + 1 && iconTr.t >= labelTr.t - 1 && iconTr.b <= labelTr.b + 1) : false,
      iconThInsideCaption: (iconTh && labelTh) ? (iconTh.l >= labelTh.l - 1 && iconTh.r <= labelTh.r + 1 && iconTh.t >= labelTh.t - 1 && iconTh.b <= labelTh.b + 1) : false,
    };
  });

  // 2. Footer at max scroll (1440)
  await page1440.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page1440.waitForTimeout(1000);
  await page1440.screenshot({ path: join(OUT_DIR, 'footer-end-1440.png'), fullPage: false });

  const footer1440 = await page1440.evaluate(() => {
    const stage = document.querySelector('.landing-stage--footer');
    const buttons = [...document.querySelectorAll('.landing-footer__index-button')].map((b) => b.getBoundingClientRect());
    const mark = document.querySelector('.landing-footer__mark')?.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollHeight = stage ? stage.scrollHeight : 0;
    const clientHeight = stage ? stage.clientHeight : 0;
    const diff = scrollHeight - clientHeight;
    const allButtonsInsideViewport = buttons.every((b) => b.bottom <= vh);
    const visibleCount = buttons.filter((b) => b.bottom <= vh).length;
    const markVisible = mark ? mark.bottom <= vh : false;

    return {
      scrollHeight,
      clientHeight,
      diff,
      buttonCount: buttons.length,
      visibleCount,
      allButtonsInsideViewport,
      markVisible,
      lastButtonBottom: buttons[buttons.length - 1]?.bottom,
      markBottom: mark?.bottom,
      vh,
    };
  });

  await page1440.close();

  // ==========================================
  // 768 x 1024
  // ==========================================
  const page768 = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  await page768.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page768.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 30000 });
  await page768.waitForTimeout(2000);

  await page768.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page768.waitForTimeout(1000);

  const footer768 = await page768.evaluate(() => {
    const stage = document.querySelector('.landing-stage--footer');
    const buttons = [...document.querySelectorAll('.landing-footer__index-button')].map((b) => b.getBoundingClientRect());
    const mark = document.querySelector('.landing-footer__mark')?.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollHeight = stage ? stage.scrollHeight : 0;
    const clientHeight = stage ? stage.clientHeight : 0;
    const diff = scrollHeight - clientHeight;
    const allButtonsInsideViewport = buttons.every((b) => b.bottom <= vh);
    const visibleCount = buttons.filter((b) => b.bottom <= vh).length;
    const markVisible = mark ? mark.bottom <= vh : false;

    return {
      scrollHeight,
      clientHeight,
      diff,
      buttonCount: buttons.length,
      visibleCount,
      allButtonsInsideViewport,
      markVisible,
      lastButtonBottom: buttons[buttons.length - 1]?.bottom,
      markBottom: mark?.bottom,
      vh,
    };
  });

  await page768.close();

  // ==========================================
  // 375 x 812
  // ==========================================
  const page375 = await browser.newPage({ viewport: { width: 375, height: 812 } });
  await page375.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page375.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 30000 });
  await page375.waitForTimeout(2000);

  // 3. Footer at max scroll (375)
  await page375.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page375.waitForTimeout(1000);
  await page375.screenshot({ path: join(OUT_DIR, 'footer-end-375.png'), fullPage: false });

  const footer375 = await page375.evaluate(() => {
    const stage = document.querySelector('.landing-stage--footer');
    const buttons = [...document.querySelectorAll('.landing-footer__index-button')].map((b) => b.getBoundingClientRect());
    const mark = document.querySelector('.landing-footer__mark')?.getBoundingClientRect();
    const vh = window.innerHeight;
    const scrollHeight = stage ? stage.scrollHeight : 0;
    const clientHeight = stage ? stage.clientHeight : 0;
    const diff = scrollHeight - clientHeight;
    const allButtonsInsideViewport = buttons.every((b) => b.bottom <= vh);
    const visibleCount = buttons.filter((b) => b.bottom <= vh).length;
    const markVisible = mark ? mark.bottom <= vh : false;
    const scrollWidth = document.documentElement.scrollWidth;
    const innerWidth = window.innerWidth;

    return {
      scrollHeight,
      clientHeight,
      diff,
      buttonCount: buttons.length,
      visibleCount,
      allButtonsInsideViewport,
      markVisible,
      lastButtonBottom: buttons[buttons.length - 1]?.bottom,
      markBottom: mark?.bottom,
      vh,
      scrollWidth,
      innerWidth,
      overflow: scrollWidth > innerWidth,
    };
  });

  await page375.close();
  await browser.close();

  console.log('\n=== COMPREHENSIVE REST VERIFICATION ===');
  console.log(JSON.stringify({
    culturalBoxes1440,
    footer1440,
    footer768,
    footer375,
  }, null, 2));
}

run().catch((err) => {
  console.error('Capture failed:', err);
  process.exit(1);
});
