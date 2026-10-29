import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', msg => console.log('PAGE:', msg.text()));
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(500);

  console.log('Preview before click:', await page.locator('.country-preview').count());
  const jp = page.locator('path[aria-label*="Jepang"]');
  // Gunakan force: true agar Playwright tidak terjebak hit-testing di lekukan pulau SVG
  await jp.click({ force: true });
  await page.waitForTimeout(800);
  console.log('Preview after click:', await page.locator('.country-preview').count());
  
  // Ambil screenshot bukti drawer terbuka
  await page.screenshot({ path: 'scratch/2d_drawer_success.png' });
  await browser.close();
}

run().catch(console.error);

