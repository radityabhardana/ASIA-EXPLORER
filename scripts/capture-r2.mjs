#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outDir = join(rootDir, 'docs', 'VERIFY_COUNTRY');

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch();
const countries = ['jp', 'sa'];
const viewports = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 },
];

for (const country of countries) {
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto(`http://localhost:5206/negara/${country}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: join(outDir, `r2-${country}-${vp.name}.png`),
      fullPage: true,
    });
    await page.close();
    console.log(`✓ r2-${country}-${vp.name}.png`);
  }
}

await browser.close();
