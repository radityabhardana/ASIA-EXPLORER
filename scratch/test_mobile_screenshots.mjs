import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  // Screenshot 3D on mobile
  await page.screenshot({ path: 'scratch/mobile_3d_view.png' });

  // Switch to 2D
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(800);

  // Screenshot 2D on mobile
  await page.screenshot({ path: 'scratch/mobile_2d_view.png' });

  await browser.close();
  console.log('Mobile screenshots captured!');
}

run().catch(console.error);

