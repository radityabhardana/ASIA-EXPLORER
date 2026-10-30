import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    const jp = document.querySelector('path[aria-label*="Jepang"]');
    if (!jp) return { error: 'Japan path not found' };
    const rect = jp.getBoundingClientRect();
    const midX = rect.left + rect.width / 2;
    const midY = rect.top + rect.height / 2;
    const topElem = document.elementFromPoint(midX, midY);
    
    // Check computed styles
    const jpStyle = window.getComputedStyle(jp);
    const parentSvg = jp.closest('svg');
    const svgStyle = parentSvg ? window.getComputedStyle(parentSvg) : null;
    const stage2d = document.querySelector('.landing-asia__stage--2d');
    const stageStyle = stage2d ? window.getComputedStyle(stage2d) : null;
    const heroScene = document.querySelector('.landing-hero__scene');
    const heroStyle = heroScene ? window.getComputedStyle(heroScene) : null;

    return {
      jpRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      topElemAtCenter: topElem ? { tag: topElem.tagName, class: topElem.className } : null,
      jpPointerEvents: jpStyle.pointerEvents,
      svgPointerEvents: svgStyle?.pointerEvents,
      stagePointerEvents: stageStyle?.pointerEvents,
      heroPointerEvents: heroStyle?.pointerEvents,
      stageZIndex: stageStyle?.zIndex,
    };
  });

  console.log('DOM info:', JSON.stringify(info, null, 2));
  await browser.close();
}

run().catch(console.error);

