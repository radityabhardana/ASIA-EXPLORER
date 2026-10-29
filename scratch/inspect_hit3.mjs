import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(600);

  const info = await page.evaluate(() => {
    const svg = document.querySelector('.asia-map-2d__svg');
    const pt = svg.createSVGPoint();
    pt.x = 684;
    pt.y = 139.6;
    const gViewport = document.querySelector('.asia-map-2d__viewport');
    const ctm = gViewport.getScreenCTM();
    const screenPt = pt.matrixTransform(ctm);
    
    const topElem = document.elementFromPoint(screenPt.x, screenPt.y);
    return {
      screenPt: { x: screenPt.x, y: screenPt.y },
      topElem: topElem ? { tag: topElem.tagName, aria: topElem.getAttribute('aria-label') } : null,
    };
  });

  console.log('Real Centroid hit:', JSON.stringify(info, null, 2));
  await browser.close();
}

run().catch(console.error);

