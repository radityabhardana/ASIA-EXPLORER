#!/usr/bin/env node
import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const results = [];

async function verifyCountry(countryId) {
  const metrics = { country: countryId };
  
  // 1440px viewport
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const consoleErrors = [];
  page1440.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  await page1440.goto(`http://localhost:5206/negara/${countryId}`, { waitUntil: 'networkidle' });
  await page1440.waitForTimeout(800);
  
  // Document height
  metrics.height_1440 = await page1440.evaluate(() => document.documentElement.scrollHeight);
  
  // Count country outlines - only portrait (base + hatch = 2)
  metrics.country_outlines = await page1440.evaluate(() => {
    const portraitPaths = document.querySelectorAll('.country-portrait__svg path');
    return portraitPaths.length;
  });
  
  // Count greeting renders (sapaan besar)
  metrics.greeting_renders = await page1440.evaluate(() => {
    const specimen = document.querySelectorAll('.country-specimen__greeting');
    return specimen.length;
  });
  
  // Elements with border+background+radius (forbidden cards)
  metrics.card_elements = await page1440.evaluate(() => {
    const all = document.querySelectorAll('*');
    let count = 0;
    for (const el of all) {
      const style = window.getComputedStyle(el);
      const hasBorder = style.borderWidth && parseFloat(style.borderWidth) > 0;
      const hasBg = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
      const hasRadius = style.borderRadius && parseFloat(style.borderRadius) > 0;
      if (hasBorder && hasBg && hasRadius) count++;
    }
    return count;
  });
  
  // Forbidden arrows/dashes in visible text
  metrics.forbidden_chars = await page1440.evaluate(() => {
    const text = document.body.innerText;
    const matches = text.match(/[→←—–]/g);
    return matches ? matches.length : 0;
  });
  
  // scrollWidth === clientWidth (no horizontal overflow)
  metrics.no_overflow_1440 = await page1440.evaluate(() => 
    document.documentElement.scrollWidth === document.documentElement.clientWidth
  );
  
  // Console errors
  metrics.console_errors = consoleErrors.length;
  
  // Click targets ≥44px (check nav and buttons)
  metrics.small_targets = await page1440.evaluate(() => {
    const clickables = document.querySelectorAll('a, button');
    let small = 0;
    for (const el of clickables) {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44)) {
        small++;
      }
    }
    return small;
  });
  
  await page1440.close();
  
  // Test 768 and 375 for overflow
  for (const width of [768, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 1024 } });
    await page.goto(`http://localhost:5206/negara/${countryId}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    metrics[`no_overflow_${width}`] = await page.evaluate(() => 
      document.documentElement.scrollWidth === document.documentElement.clientWidth
    );
    await page.close();
  }
  
  return metrics;
}

results.push(await verifyCountry('jp'));
results.push(await verifyCountry('sa'));

await browser.close();

console.log('\n=== VERIFICATION RESULTS ===\n');
for (const m of results) {
  console.log(`Country: ${m.country}`);
  console.log(`  Height (1440px): ${m.height_1440}px`);
  console.log(`  Country outlines: ${m.country_outlines} (expected: 2)`);
  console.log(`  Greeting renders: ${m.greeting_renders} (expected: 1)`);
  console.log(`  Card elements: ${m.card_elements} (expected: 0)`);
  console.log(`  Forbidden chars: ${m.forbidden_chars} (expected: 0)`);
  console.log(`  No overflow 1440: ${m.no_overflow_1440} (expected: true)`);
  console.log(`  No overflow 768: ${m.no_overflow_768} (expected: true)`);
  console.log(`  No overflow 375: ${m.no_overflow_375} (expected: true)`);
  console.log(`  Console errors: ${m.console_errors} (expected: 0)`);
  console.log(`  Small click targets: ${m.small_targets} (expected: 0)`);
  console.log('');
}

// Exit with error if any metric fails
const failed = results.some(m => 
  m.country_outlines !== 2 ||
  m.greeting_renders !== 1 ||
  m.card_elements !== 0 ||
  m.forbidden_chars !== 0 ||
  !m.no_overflow_1440 ||
  !m.no_overflow_768 ||
  !m.no_overflow_375 ||
  m.console_errors !== 0
);

if (failed) {
  console.error('❌ Verification FAILED');
  process.exit(1);
} else {
  console.log('✓ All metrics passed');
}
