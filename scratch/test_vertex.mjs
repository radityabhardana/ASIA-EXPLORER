import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(600);

  const res = await page.evaluate(() => {
    // Check all paths and find which element is returned at path vertices or points
    const jp = document.querySelector('path[aria-label*="Jepang"]');
    const svg = document.querySelector('.asia-map-2d__svg');
    
    // Get points inside Japan
    // Let's test a point from the path d
    const d = jp.getAttribute('d');
    // First point is M677.8 145.7
    const pt = svg.createSVGPoint();
    pt.x = 678;
    pt.y = 146;
    const gViewport = document.querySelector('.asia-map-2d__viewport');
    const ctm = gViewport.getScreenCTM();
    const screenPt = pt.matrixTransform(ctm);

    const hitBefore = document.elementFromPoint(screenPt.x, screenPt.y);

    // Now set svg pointer-events to none
    svg.style.pointerEvents = 'none';
    const hitAfter = document.elementFromPoint(screenPt.x, screenPt.y);

    return {
      screenPt: { x: screenPt.x, y: screenPt.y },
      hitBefore: hitBefore ? { tag: hitBefore.tagName, aria: hitBefore.getAttribute('aria-label') } : null,
      hitAfter: hitAfter ? { tag: hitAfter.tagName, aria: hitAfter.getAttribute('aria-label') } : null,
    };
  });

  console.log('Test vertex hit:', JSON.stringify(res, null, 2));
  await browser.close();
}

run().catch(console.error);

