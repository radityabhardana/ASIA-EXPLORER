import { chromium } from 'playwright';

async function testScreenshots() {
  const browser = await chromium.launch();

  // 1. User's exact resolution: 1024 x 602
  const page1024 = await browser.newPage({ viewport: { width: 1024, height: 602 } });
  await page1024.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page1024.waitForTimeout(2500);
  await page1024.screenshot({ path: 'scratch/verified_1024_centered.png' });
  console.log('Saved scratch/verified_1024_centered.png');

  // 2. Desktop: 1440 x 900
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page1440.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page1440.waitForTimeout(2500);
  await page1440.screenshot({ path: 'scratch/verified_1440_centered.png' });
  console.log('Saved scratch/verified_1440_centered.png');

  await browser.close();
}

testScreenshots().catch(console.error);

