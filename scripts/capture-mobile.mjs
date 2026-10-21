/**
 * Mobile scene verification: 375×812 viewport
 */

import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VERIFY_DIR = join(ROOT, 'docs/VERIFY_SCENE');

const PORT = process.env.PW_PORT || '5173';
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 375, height: 812 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log(`\nCapturing ${BASE_URL}/lab/scene at 375×812...`);

  await page.goto(`${BASE_URL}/lab/scene`, { waitUntil: 'networkidle' });
  await page.waitForFunction(
    () => window.__asiakin_scene?.ready === true,
    { timeout: 15000 }
  );

  console.log('Scene ready.');

  await mkdir(VERIFY_DIR, { recursive: true });
  const screenshotPath = join(VERIFY_DIR, 'scene-geometry-375x812.png');
  await page.screenshot({ path: screenshotPath, fullPage: false });
  console.log(`✓ Screenshot saved: ${screenshotPath}`);

  await browser.close();
}

main().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
