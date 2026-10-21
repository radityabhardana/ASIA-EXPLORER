import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = 5201;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'docs/VERIFY/p1';

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();

  const viewports = [
    { width: 1440, height: 900, name: '1440' },
    { width: 768, height: 1024, name: '768' },
    { width: 375, height: 812, name: '375' },
  ];

  const results = {};

  for (const vp of viewports) {
    const consoleErrors = [];
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });

    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    
    // Wait for window.__asiakin_scene?.ready
    await page.waitForFunction(
      () => Boolean(window.__asiakin_scene && window.__asiakin_scene.ready),
      null,
      { timeout: 12000 },
    );

    // Sleep 2s
    await new Promise((r) => setTimeout(r, 2000));

    // Capture screenshot
    const screenshotPath = join(OUT_DIR, `hero-${vp.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    const evalData = await page.evaluate(() => {
      const sceneDebug = window.__asiakin_scene;
      const ink = sceneDebug?.measureInk ? sceneDebug.measureInk() : null;

      const titleEl = document.querySelector('.landing-hero__copy');
      const titleRect = titleEl ? titleEl.getBoundingClientRect() : null;

      const titleObj = titleRect
        ? {
            left: titleRect.left,
            right: titleRect.right,
            top: titleRect.top,
            bottom: titleRect.bottom,
            width: titleRect.width,
            height: titleRect.height,
          }
        : null;

      let intersect = false;
      if (ink && titleObj) {
        intersect = !(
          ink.right < titleObj.left ||
          ink.left > titleObj.right ||
          ink.bottom < titleObj.top ||
          ink.top > titleObj.bottom
        );
      }

      const jp = sceneDebug?.projected('jp');
      const sa = sceneDebug?.projected('sa');
      const id = sceneDebug?.projected('id');
      const cn = sceneDebug?.projected('cn');

      const orientation = {
        jp,
        sa,
        id,
        cn,
        northUp: Boolean(jp && sa && id && cn && jp.x > sa.x && id.y > cn.y),
      };

      const scrollWidth = document.documentElement.scrollWidth;
      const innerWidth = window.innerWidth;
      const overflow = scrollWidth > innerWidth;

      const groundEl = document.querySelector('.landing-hero__ground');
      const groundRect = groundEl ? groundEl.getBoundingClientRect() : null;

      const inkCentreY = ink ? (ink.top + ink.bottom) / 2 : null;
      const inkCentrePercent = ink ? (inkCentreY / window.innerHeight) * 100 : null;

      const plateRimTop = groundRect ? groundRect.top : null;
      const plateRimGap = (plateRimTop !== null && titleObj) ? plateRimTop - titleObj.bottom : null;

      return {
        ink,
        inkCentreY,
        inkCentrePercent,
        title: titleObj,
        groundRect: groundRect ? {
          left: groundRect.left,
          right: groundRect.right,
          top: groundRect.top,
          bottom: groundRect.bottom,
          width: groundRect.width,
          height: groundRect.height,
        } : null,
        plateRimTop,
        plateRimGap,
        intersect,
        orientation,
        scrollWidth,
        innerWidth,
        overflow,
        titleText: titleEl?.innerText?.replace(/\s+/g, ' ').trim(),
      };
    });

    evalData.consoleErrors = consoleErrors;
    evalData.screenshot = screenshotPath;
    results[vp.name] = evalData;

    await page.close();
  }

  await browser.close();

  console.log('\n=== PROBE RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
}

run().catch((err) => {
  console.error('Probe failed:', err);
  process.exit(1);
});
