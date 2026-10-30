import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(600);

  // Click on the point of Japan
  await page.mouse.click(1115.8, 258.5);
  await page.waitForTimeout(800);

  const drawerCount = await page.locator('.country-preview').count();
  console.log('Country preview drawer count after clicking Japan:', drawerCount);
  await page.screenshot({ path: 'scratch/japan_drawer_success.png' });
  await browser.close();
}

run().catch(console.error);

