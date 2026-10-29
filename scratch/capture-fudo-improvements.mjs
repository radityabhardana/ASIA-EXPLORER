import { chromium } from 'playwright';

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Overview screenshot
  await page.screenshot({ path: 'scratch/desktop-overview-fudo.png' });

  // Click on a country shortcut (e.g. Asia Timur / Japan)
  const eaBtn = page.locator('button:has-text("Asia Timur")');
  if (await eaBtn.isVisible()) {
    await eaBtn.click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: 'scratch/desktop-japan-fudo.png' });
  }

  // Click on Southeast Asia / Indonesia
  const seaBtn = page.locator('button:has-text("Asia Tenggara")');
  if (await seaBtn.isVisible()) {
    await seaBtn.click();
    await page.waitForTimeout(1600);
    await page.screenshot({ path: 'scratch/desktop-indonesia-fudo.png' });
  }

  await browser.close();
  console.log('Screenshots captured successfully!');
}

capture().catch(console.error);
