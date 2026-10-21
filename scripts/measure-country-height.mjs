import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

await page.goto('http://localhost:5197/negara/jp', { waitUntil: 'networkidle' });
await page.waitForTimeout(500);

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
  
  // Count country outlines
  const portraits = document.querySelectorAll('.country-portrait');
  const silhouettes = document.querySelectorAll('.country-silhouette');
  const outlineCount = portraits.length + silhouettes.length;
  
  // Count greeting renderings
  const specimens = document.querySelectorAll('.country-specimen');
  const greetings = document.querySelectorAll('.country-greeting');
  const greetingCount = specimens.length + greetings.length;
  
  // Count boxed elements (border + background + radius)
  const boxes = Array.from(document.querySelectorAll('*')).filter(el => {
    const style = getComputedStyle(el);
    const hasBackground = style.backgroundColor !== 'rgba(0, 0, 0, 0)' && style.backgroundColor !== 'transparent';
    const hasBorder = parseFloat(style.borderWidth) > 0;
    const hasRadius = parseFloat(style.borderRadius) > 0;
    return hasBackground && hasBorder && hasRadius;
  }).length;
  
  // Check for arrow/dash glyphs in rendered text
  const text = document.body.innerText;
  const hasArrows = /[→←—–]/.test(text);
  
  // Check horizontal scroll
  const scrollWidth = document.documentElement.scrollWidth;
  const clientWidth = document.documentElement.clientWidth;
  
  return {
    height,
    outlineCount,
    greetingCount,
    boxes,
    hasArrows,
    scrollWidth,
    clientWidth,
    horizontalScrollOk: scrollWidth === clientWidth,
  };
});

console.log(JSON.stringify(metrics, null, 2));

await browser.close();
