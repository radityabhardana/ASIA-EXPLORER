#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = 'http://localhost:5173';
const OUT_DIR = 'docs/VERIFY_LANDING';
const SCROLL_POSITIONS = [0, 0.25, 0.5, 0.75, 1.0];

async function smoothScrollTo(page, targetProgress) {
  const scrollHeight = await page.evaluate(() => {
    return document.documentElement.scrollHeight - window.innerHeight;
  });
  const targetScroll = Math.round(targetProgress * scrollHeight);
  const steps = 20;
  const delay = 50;

  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const currentScroll = Math.round(progress * targetScroll);
    await page.evaluate((y) => window.scrollTo(0, y), currentScroll);
    await page.waitForTimeout(delay);
  }
  
  // Extra settle time for GSAP tweens
  await page.waitForTimeout(200);
}

async function captureViewport(browser, width, height) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height });
  
  const consoleLogs = [];
  const consoleErrors = [];
  
  page.on('console', (msg) => {
    const text = msg.text();
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    } else {
      consoleLogs.push(text);
    }
  });

  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);

  const measurements = {};

  for (const pos of SCROLL_POSITIONS) {
    await smoothScrollTo(page, pos);
    
    const filename = `r2-${width}x${height}-${String(Math.round(pos * 100)).padStart(3, '0')}.png`;
    await page.screenshot({
      path: join(OUT_DIR, filename),
      fullPage: false,
    });

    const dims = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollTop: window.scrollY,
      scrollHeight: document.documentElement.scrollHeight - window.innerHeight,
    }));

    measurements[`${Math.round(pos * 100)}%`] = dims;

    // Measure scene 4 cards at 50%
    if (pos === 0.5 && width === 1440) {
      const cardBoxes = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.landing-script__card'));
        return cards.map((card) => {
          const rect = card.getBoundingClientRect();
          return {
            left: Math.round(rect.left),
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
          };
        });
      });
      measurements['scene4_cards'] = cardBoxes;
    }

    // Measure footer index at 100%
    if (pos === 1.0 && width === 1440) {
      const footerIndex = await page.evaluate(() => {
        const indexBlock = document.querySelector('.landing-footer__index');
        const indexList = document.querySelector('.landing-footer__index-list');
        const buttons = Array.from(document.querySelectorAll('.landing-footer__index-button'));
        
        if (!indexBlock || !indexList) return null;
        
        const blockRect = indexBlock.getBoundingClientRect();
        const listRect = indexList.getBoundingClientRect();
        const buttonHeights = buttons.map((btn) => Math.round(btn.getBoundingClientRect().height));
        
        return {
          block: {
            x: Math.round(blockRect.left),
            width: Math.round(blockRect.width),
            height: Math.round(blockRect.height),
          },
          list: {
            x: Math.round(listRect.left),
            width: Math.round(listRect.width),
            height: Math.round(listRect.height),
          },
          buttonHeights,
          buttonCount: buttons.length,
        };
      });
      measurements['footer_index'] = footerIndex;
    }
  }

  await page.close();

  return {
    viewport: `${width}x${height}`,
    measurements,
    consoleErrors,
    errorCount: consoleErrors.length,
  };
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const browser = await chromium.launch();

  console.log('Capturing 1440x900...');
  const desktop = await captureViewport(browser, 1440, 900);

  console.log('Capturing 375x812...');
  const mobile = await captureViewport(browser, 375, 812);

  await browser.close();

  const report = {
    timestamp: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewports: [desktop, mobile],
  };

  await writeFile(
    join(OUT_DIR, 'measurements-r2.json'),
    JSON.stringify(report, null, 2),
    'utf-8'
  );

  console.log('\n=== VERIFICATION REPORT R2 ===\n');
  
  console.log('Desktop 1440x900:');
  console.log('  Console errors:', desktop.errorCount);
  if (desktop.errorCount > 0) {
    desktop.consoleErrors.forEach((err, i) => {
      console.log(`    ${i + 1}. ${err}`);
    });
  }
  
  if (desktop.measurements.scene4_cards) {
    console.log('\n  Scene 4 cards at 50% scroll:');
    desktop.measurements.scene4_cards.forEach((card, i) => {
      console.log(`    Card ${i + 1}: x=${card.left}..${card.right} (${card.width}px wide)`);
      if (card.left < 0 || card.right > 1440) {
        console.log(`      ⚠️  OVERFLOW: card extends beyond viewport`);
      }
    });
  }
  
  if (desktop.measurements.footer_index) {
    const fi = desktop.measurements.footer_index;
    console.log('\n  Footer index at 100% scroll:');
    console.log(`    Block: x=${fi.block.x}, w=${fi.block.width}, h=${fi.block.height}`);
    console.log(`    List: x=${fi.list.x}, w=${fi.list.width}, h=${fi.list.height}`);
    console.log(`    Button count: ${fi.buttonCount}`);
    console.log(`    Button heights: ${fi.buttonHeights.join(', ')}`);
    const minHeight = Math.min(...fi.buttonHeights);
    if (minHeight < 44) {
      console.log(`      ⚠️  ACCESSIBILITY: min button height ${minHeight}px < 44px`);
    }
  }

  console.log('\n  Scroll dimensions:');
  Object.entries(desktop.measurements).forEach(([key, val]) => {
    if (key.endsWith('%') && val.scrollWidth !== undefined) {
      const overflow = val.scrollWidth - val.clientWidth;
      const status = overflow > 0 ? `⚠️  +${overflow}px overflow` : '✓ no overflow';
      console.log(`    ${key}: scrollWidth=${val.scrollWidth}, clientWidth=${val.clientWidth} (${status})`);
    }
  });

  console.log('\nMobile 375x812:');
  console.log('  Console errors:', mobile.errorCount);
  if (mobile.errorCount > 0) {
    mobile.consoleErrors.forEach((err, i) => {
      console.log(`    ${i + 1}. ${err}`);
    });
  }

  console.log(`\nScreenshots saved to ${OUT_DIR}/`);
  console.log(`Measurements saved to ${OUT_DIR}/measurements-r2.json`);
  
  const totalErrors = desktop.errorCount + mobile.errorCount;
  if (totalErrors > 0) {
    console.log(`\n❌ FAILED: ${totalErrors} console errors`);
    process.exit(1);
  }
  
  console.log('\n✓ Verification complete');
}

main().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
