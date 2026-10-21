import { chromium } from '@playwright/test';

const VIEWPORTS = [
  { width: 1440, height: 900, label: '1440' },
  { width: 768, height: 1024, label: '768' },
  { width: 375, height: 812, label: '375' },
];

const COUNTRIES = ['jp', 'id', 'sa', 'kz'];

const browser = await chromium.launch();

for (const country of COUNTRIES) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    
    await page.goto(`http://localhost:5206/negara/${country}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    
    await page.screenshot({
      path: `docs/VERIFY_COUNTRY/art2-${country}-${viewport.label}.png`,
      fullPage: true,
    });
    
    await context.close();
  }
}

await browser.close();
console.log('Screenshots captured');
