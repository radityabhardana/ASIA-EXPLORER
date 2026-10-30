import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Switch to 2D
  await page.locator('.map48-hud__mode-pill:has-text("2D")').click();
  await page.waitForTimeout(500);

  // Check if drawer is currently visible
  console.log('Drawer before click:', await page.locator('.country-panel').count());

  // Click Indonesia path
  const idPath = page.locator('path[aria-label*="Indonesia"]');
  console.log('Indonesia path found:', await idPath.count());
  await idPath.click();
  await page.waitForTimeout(1000);

  console.log('Drawer after click:', await page.locator('.country-panel').count());
  await page.screenshot({ path: 'scratch/test_drawer_opened.png' });

  await browser.close();
}

main().catch(console.error);

