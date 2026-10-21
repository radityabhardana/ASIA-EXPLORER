#!/usr/bin/env node
/**
 * Mechanical check: no-card rule, no arrow/dash separators, measurements.
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5206';
const COUNTRIES = ['jp', 'id', 'sa', 'kz'];
const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
];

async function check() {
  const browser = await chromium.launch();
  const results = [];

  for (const id of COUNTRIES) {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({ viewport });
      await page.goto(`${BASE_URL}/negara/${id}`, { waitUntil: 'networkidle' });

      // Check scroll width
      const scrollWidth = await page.evaluate(
        () => document.scrollingElement.scrollWidth
      );
      const clientWidth = await page.evaluate(
        () => document.scrollingElement.clientWidth
      );
      const hasHorizontalScroll = scrollWidth > clientWidth;

      // Check console errors
      const errors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') errors.push(msg.text());
      });

      // Check for card-like elements (border + background + radius)
      const cards = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('.country *'));
        const violations = [];
        for (const el of elements) {
          const styles = window.getComputedStyle(el);
          const hasBorder =
            parseFloat(styles.borderTopWidth) > 0 &&
            parseFloat(styles.borderRightWidth) > 0 &&
            parseFloat(styles.borderBottomWidth) > 0 &&
            parseFloat(styles.borderLeftWidth) > 0;
          const hasBackground =
            styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
            styles.backgroundColor !== 'transparent';
          const hasRadius = parseFloat(styles.borderRadius) > 0;

          if (hasBorder && hasBackground && hasRadius) {
            violations.push(el.className);
          }
        }
        return violations;
      });

      // Check for arrow/dash separators in rendered text
      const textContent = await page.evaluate(
        () => document.querySelector('.country')?.textContent || ''
      );
      const hasArrows = /[→←]/.test(textContent);
      const hasDashSeparators = / — | – | - /.test(textContent);

      // Count art modules
      const artModules = await page.evaluate(() => {
        return {
          locator: !!document.querySelector('.country-locator'),
          portrait: !!document.querySelector('.country-portrait'),
          specimen: !!document.querySelector('.country-specimen'),
          sources: !!document.querySelector('.country-sources'),
        };
      });

      results.push({
        id,
        viewport: `${viewport.width}x${viewport.height}`,
        scrollWidth: hasHorizontalScroll ? 'FAIL' : 'PASS',
        consoleErrors: errors.length,
        cards: cards.length > 0 ? `FAIL: ${cards.join(', ')}` : 'PASS',
        arrows: hasArrows ? 'FAIL' : 'PASS',
        dashes: hasDashSeparators ? 'FAIL' : 'PASS',
        artModules: Object.values(artModules).filter(Boolean).length,
      });

      await page.close();
    }
  }

  await browser.close();

  console.log('\n=== Country Art Check ===\n');
  for (const r of results) {
    console.log(`${r.id} @ ${r.viewport}:`);
    console.log(`  Horizontal scroll: ${r.scrollWidth}`);
    console.log(`  Console errors: ${r.consoleErrors}`);
    console.log(`  Card violations: ${r.cards}`);
    console.log(`  Arrow glyphs: ${r.arrows}`);
    console.log(`  Dash separators: ${r.dashes}`);
    console.log(`  Art modules: ${r.artModules}/4`);
    console.log('');
  }

  const failed = results.some(
    (r) =>
      r.scrollWidth === 'FAIL' ||
      r.consoleErrors > 0 ||
      r.cards.startsWith('FAIL') ||
      r.arrows === 'FAIL' ||
      r.dashes === 'FAIL' ||
      r.artModules < 4
  );

  if (failed) {
    console.error('❌ Checks failed');
    process.exit(1);
  } else {
    console.log('✅ All checks passed');
  }
}

check().catch((err) => {
  console.error(err);
  process.exit(1);
});
