/**
 * Scene geometry verification (b):
 * - Load /lab/scene at 1440px
 * - Capture full-page screenshot
 * - Verify zero console errors
 * - Verify 15 countries are present and pickable via __asiakin_scene debug API
 */

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERIFY_DIR = join(ROOT, 'docs/VERIFY_SCENE');

const PORT = process.env.PW_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;

const EXPECTED_COUNTRIES = [
  'cn', 'in', 'id', 'jp', 'kr', 'my', 'ph', 'sg', 'th', 'vn',
  'sa', 'tr', 'kz', 'uz', 'mn',
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log(`\n=== D21 SCENE VERIFICATION (b) ===\n`);
  console.log(`Loading ${BASE_URL}/lab/scene at 1440×900...`);

  await page.goto(`${BASE_URL}/lab/scene`, { waitUntil: 'networkidle' });

  // Wait for scene to be ready
  await page.waitForFunction(
    () => window.__asiakin_scene?.ready === true,
    { timeout: 15000 }
  );

  console.log('Scene ready.');

  // Check country count
  const sceneData = await page.evaluate(() => {
    const scene = window.__asiakin_scene;
    return {
      ready: scene?.ready,
      countryCount: scene?.countryCount,
    };
  });

  console.log(`Country count: ${sceneData.countryCount}`);

  // Verify all 15 countries are present
  const missingCountries = [];
  for (const id of EXPECTED_COUNTRIES) {
    const projected = await page.evaluate((countryId) => {
      return window.__asiakin_scene?.projected(countryId);
    }, id);
    if (!projected) {
      missingCountries.push(id);
    }
  }

  if (missingCountries.length > 0) {
    console.log(`✗ Missing countries: ${missingCountries.join(', ')}`);
  } else {
    console.log('✓ All 15 countries present and projectable');
  }

  // Check console errors
  if (consoleErrors.length > 0) {
    console.log(`✗ Console errors detected (${consoleErrors.length}):`);
    consoleErrors.forEach((err, i) => {
      console.log(`  ${i + 1}. ${err}`);
    });
  } else {
    console.log('✓ Zero console errors');
  }

  // Capture screenshot
  await mkdir(VERIFY_DIR, { recursive: true });
  const screenshotPath = join(VERIFY_DIR, 'scene-geometry-1440x900.png');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log(`✓ Screenshot saved: ${screenshotPath}`);

  // Generate evidence report
  const evidence = {
    timestamp: new Date().toISOString(),
    viewport: '1440×900',
    url: `${BASE_URL}/lab/scene`,
    sceneReady: sceneData.ready,
    countryCount: sceneData.countryCount,
    expectedCountries: EXPECTED_COUNTRIES.length,
    missingCountries,
    consoleErrors: consoleErrors.length,
    screenshotPath,
  };

  const reportPath = join(VERIFY_DIR, 'scene-geometry-report.json');
  await writeFile(reportPath, JSON.stringify(evidence, null, 2));
  console.log(`✓ Report saved: ${reportPath}`);

  console.log('\n=== SUMMARY ===');
  console.log(`Scene ready: ${evidence.sceneReady ? 'YES' : 'NO'}`);
  console.log(`Countries present: ${evidence.countryCount}/${evidence.expectedCountries}`);
  console.log(`Console errors: ${evidence.consoleErrors}`);
  console.log(`Missing countries: ${evidence.missingCountries.length === 0 ? 'none' : evidence.missingCountries.join(', ')}`);

  const passed = 
    evidence.sceneReady &&
    evidence.countryCount === evidence.expectedCountries &&
    evidence.missingCountries.length === 0 &&
    evidence.consoleErrors === 0;

  console.log(`\nVerification: ${passed ? 'PASS' : 'FAIL'}`);

  await browser.close();

  process.exit(passed ? 0 : 1);
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
