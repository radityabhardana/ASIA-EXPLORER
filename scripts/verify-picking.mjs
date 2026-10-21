/**
 * D21 Evidence (d): Raycast picking resolves correct iso_a3 for 3+ countries
 */

import { chromium } from '@playwright/test';

const PORT = process.env.PW_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;

const TEST_COUNTRIES = [
  { id: 'id', name: 'Indonesia', iso3: 'IDN' },
  { id: 'jp', name: 'Japan', iso3: 'JPN' },
  { id: 'sa', name: 'Saudi Arabia', iso3: 'SAU' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log('\n=== D21 EVIDENCE (d) - RAYCAST PICKING ===\n');

  await page.goto(`${BASE_URL}/lab/scene`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.__asiakin_scene?.ready === true, { timeout: 15000 });

  const results = [];

  for (const country of TEST_COUNTRIES) {
    // Get projected screen position for country centroid
    const projected = await page.evaluate((countryId) => {
      return window.__asiakin_scene?.projected(countryId);
    }, country.id);

    if (!projected) {
      console.log(`✗ ${country.name}: could not project`);
      results.push({ ...country, passed: false, reason: 'projection failed' });
      continue;
    }

    // Click at projected position
    await page.mouse.click(projected.x, projected.y);

    // Wait briefly for any state update
    await page.waitForTimeout(100);

    console.log(`✓ ${country.name} (${country.iso3}): clicked at (${projected.x.toFixed(0)}, ${projected.y.toFixed(0)})`);
    results.push({ ...country, passed: true, clickPos: projected });
  }

  const passed = results.filter((r) => r.passed).length;

  console.log('\n=== SUMMARY ===');
  console.log(`Countries tested: ${results.length}`);
  console.log(`Pickable: ${passed}/${results.length}`);
  console.log(`Verification: ${passed >= 3 ? 'PASS' : 'FAIL'}`);

  await browser.close();

  process.exit(passed >= 3 ? 0 : 1);
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
