import { chromium } from '@playwright/test';

const VIEWPORTS = [
  { width: 1440, height: 900, label: '1440' },
  { width: 768, height: 1024, label: '768' },
  { width: 375, height: 812, label: '375' },
];

const COUNTRIES = ['jp', 'sa'];

const browser = await chromium.launch();

const results = [];

for (const country of COUNTRIES) {
  for (const viewport of VIEWPORTS) {
    const context = await browser.newContext({
      viewport,
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    
    await page.goto(`http://localhost:5197/negara/${country}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    
    // Screenshot
    await page.screenshot({
      path: `docs/VERIFY_COUNTRY/art2-${country}-${viewport.label}.png`,
      fullPage: true,
    });
    
    // Metrics
    const metrics = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      
      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
      );
      
      const portraits = document.querySelectorAll('.country-portrait');
      const silhouettes = document.querySelectorAll('.country-silhouette');
      const outlineCount = portraits.length + silhouettes.length;
      
      const specimens = document.querySelectorAll('.country-specimen');
      const greetings = document.querySelectorAll('.country-greeting');
      const greetingCount = specimens.length + greetings.length;
      
      const text = document.body.innerText;
      const hasArrows = /[→←—–]/.test(text);
      
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      
      // Check interactive hit boxes >= 44px
      const interactiveElements = Array.from(document.querySelectorAll('button, a, [role="button"]'));
      const smallHitBoxes = interactiveElements.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.width < 44 || rect.height < 44;
      }).length;
      
      return {
        height,
        outlineCount,
        greetingCount,
        hasArrows,
        scrollWidth,
        clientWidth,
        horizontalScrollOk: scrollWidth === clientWidth,
        smallHitBoxes,
      };
    });
    
    // Console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    
    results.push({
      country,
      viewport: viewport.label,
      ...metrics,
      consoleErrors: errors.length,
    });
    
    await context.close();
  }
}

await browser.close();

console.log('\n=== VERIFICATION RESULTS ===\n');
console.log(JSON.stringify(results, null, 2));

const allPass = results.every(r => 
  r.outlineCount === 1 &&
  r.greetingCount === 1 &&
  !r.hasArrows &&
  r.horizontalScrollOk &&
  r.consoleErrors === 0 &&
  r.smallHitBoxes === 0
);

console.log('\nAll checks pass:', allPass);
process.exit(allPass ? 0 : 1);
