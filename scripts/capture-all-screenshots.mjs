#!/usr/bin/env node
import { mkdir, stat } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const outBase = join(rootDir, 'docs', 'SCREENSHOTS');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '768', width: 768, height: 1024 },
  { name: '375', width: 375, height: 812 },
];

const COUNTRIES = [
  'id', 'my', 'sg', 'th', 'vn',
  'ph', 'cn', 'jp', 'kr', 'in',
  'sa', 'tr', 'kz', 'uz', 'mn',
];

const dirs = {
  scenes: join(outBase, '01-landing-scenes'),
  fullpage: join(outBase, '02-landing-fullpage'),
  countries: join(outBase, '03-country-pages'),
  interaction: join(outBase, '04-interaction'),
  system: join(outBase, '05-lab-and-system'),
};

for (const dir of Object.values(dirs)) {
  await mkdir(dir, { recursive: true });
}

const recordedFiles = [];

async function recordShot(path) {
  try {
    const fileStat = await stat(path);
    const kb = (fileStat.size / 1024).toFixed(1);
    recordedFiles.push({ path, size: fileStat.size, kb });
    console.log(`  [OK] ${path.replace(rootDir, '').replace(/^[\\/]/, '')} (${kb} KB)`);
  } catch (err) {
    console.error(`  [ERR] Failed to stat ${path}: ${err.message}`);
  }
}

/**
 * Scroll to scene so copyTop is approximately 160px.
 */
async function scrollToCopyTop160(page, sceneName) {
  const target = await page.evaluate((name) => {
    const copySelector =
      name === 'footer'
        ? '.landing-scene--footer .landing-footer__copy'
        : `.landing-scene--${name} .landing-stage__copy`;
    const section = document.querySelector(`.landing-scene--${name}`);
    const stage = section?.querySelector('.landing-stage') ?? null;
    const copy = document.querySelector(copySelector);
    if (!section || !stage || !copy) return null;
    const sTop = section.getBoundingClientRect().top + window.scrollY;
    const rel = copy.getBoundingClientRect().top - stage.getBoundingClientRect().top;
    const limit = document.documentElement.scrollHeight - window.innerHeight;
    return Math.max(0, Math.min(limit, Math.round(sTop + rel - 160)));
  }, sceneName);

  let scrollTarget = target ?? 0;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
    await page.waitForTimeout(150);
    const copyTopNow = await page.evaluate((name) => {
      const copySelector =
        name === 'footer'
          ? '.landing-scene--footer .landing-footer__copy'
          : `.landing-scene--${name} .landing-stage__copy`;
      const copy = document.querySelector(copySelector);
      return copy ? Math.round(copy.getBoundingClientRect().top) : null;
    }, sceneName);

    if (copyTopNow === null || Math.abs(copyTopNow - 160) <= 6) {
      break;
    }
    scrollTarget = Math.max(0, scrollTarget + copyTopNow - 160);
  }
}

const browser = await chromium.launch();

try {
  console.log('====================================================');
  console.log('1. PRELOADER SCREENSHOTS');
  console.log('====================================================');
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.locator('.preloader').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(140);

    const shotPath = join(dirs.scenes, `00-preloader-${vp.name}.png`);
    await page.screenshot({ path: shotPath, fullPage: false });
    await recordShot(shotPath);
    await context.close();
  }

  console.log('\n====================================================');
  console.log('2. LANDING SCENES (01 - 08)');
  console.log('====================================================');
  for (const vp of VIEWPORTS) {
    console.log(`\n--- Viewport ${vp.name} (${vp.width}x${vp.height}) ---`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 45000 });
    await page.waitForTimeout(1500);

    // Scene 1: Hero (scrollY = 0)
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const heroPath = join(dirs.scenes, `01-hero-${vp.name}.png`);
    await page.screenshot({ path: heroPath, fullPage: false });
    await recordShot(heroPath);

    // Scene 2: Scale (copyTop ≈ 160)
    await scrollToCopyTop160(page, 'scale');
    await page.waitForTimeout(400);
    const scalePath = join(dirs.scenes, `02-scale-${vp.name}.png`);
    await page.screenshot({ path: scalePath, fullPage: false });
    await recordShot(scalePath);

    // Scene 3: Language (copyTop ≈ 160)
    await scrollToCopyTop160(page, 'language');
    await page.waitForTimeout(400);
    const langPath = join(dirs.scenes, `03-language-${vp.name}.png`);
    await page.screenshot({ path: langPath, fullPage: false });
    await recordShot(langPath);

    // Scene 4: Script (copyTop ≈ 160)
    await scrollToCopyTop160(page, 'script');
    await page.waitForTimeout(400);
    const scriptPath = join(dirs.scenes, `04-script-${vp.name}.png`);
    await page.screenshot({ path: scriptPath, fullPage: false });
    await recordShot(scriptPath);

    // Scene 5: Regional (copyTop ≈ 160)
    await scrollToCopyTop160(page, 'regional');
    await page.waitForTimeout(400);
    const regionalPath = join(dirs.scenes, `05-regional-${vp.name}.png`);
    await page.screenshot({ path: regionalPath, fullPage: false });
    await recordShot(regionalPath);

    // Scene 6: Cultural (1440 at scrollY 5670; 768 & 375 at copyTop ≈ 160)
    if (vp.name === '1440') {
      await page.evaluate(() => window.scrollTo(0, 5670));
      await page.waitForTimeout(500);
    } else {
      await scrollToCopyTop160(page, 'cultural');
      await page.waitForTimeout(500);
    }
    const culturalPath = join(dirs.scenes, `06-cultural-${vp.name}.png`);
    await page.screenshot({ path: culturalPath, fullPage: false });
    await recordShot(culturalPath);

    // Scene 7: Invitation (copyTop ≈ 160)
    await scrollToCopyTop160(page, 'invitation');
    await page.waitForTimeout(600);
    const invitationPath = join(dirs.scenes, `07-invitation-${vp.name}.png`);
    await page.screenshot({ path: invitationPath, fullPage: false });
    await recordShot(invitationPath);

    // Scene 8: Footer (scroll to scrollHeight)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);
    const footerPath = join(dirs.scenes, `08-footer-${vp.name}.png`);
    await page.screenshot({ path: footerPath, fullPage: false });
    await recordShot(footerPath);

    await context.close();
  }

  console.log('\n====================================================');
  console.log('3. LANDING FULLPAGE SCREENSHOTS');
  console.log('====================================================');
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 45000 });
    await page.waitForTimeout(800);

    // Progressive scroll so all ScrollTrigger triggers fire
    const max = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    const steps = 16;
    for (let i = 0; i <= steps; i += 1) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((max * i) / steps));
      await page.waitForTimeout(30);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(400);

    const fullPath = join(dirs.fullpage, `landing-fullpage-${vp.name}.png`);
    await page.screenshot({ path: fullPath, fullPage: true });
    await recordShot(fullPath);
    await context.close();
  }

  console.log('\n====================================================');
  console.log('4. COUNTRY PAGES (15 COUNTRIES x 3 VIEWPORTS)');
  console.log('====================================================');
  for (const vp of VIEWPORTS) {
    console.log(`Processing country pages for viewport ${vp.name}...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    for (const countryId of COUNTRIES) {
      await page.goto(`${BASE_URL}/negara/${countryId}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.country-body').waitFor({ state: 'visible', timeout: 10000 });
      await page.waitForTimeout(250);

      const shotPath = join(dirs.countries, `${countryId}-${vp.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: true });
      await recordShot(shotPath);
    }
    await context.close();
  }

  console.log('\n====================================================');
  console.log('5. INTERACTION SCREENSHOTS');
  console.log('====================================================');
  // Dialog JP across 3 viewports
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 45000 });
    await page.waitForTimeout(600);

    const jpBtn = page.locator('.landing-footer__index-button[data-country="jp"]');
    await jpBtn.scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    await jpBtn.click();

    await page.locator('.landing-dialog[open]').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);

    const dialogPath = join(dirs.interaction, `dialog-jp-${vp.name}.png`);
    await page.screenshot({ path: dialogPath, fullPage: false });
    await recordShot(dialogPath);
    await context.close();
  }

  // Hover Invitation (1440)
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 45000 });

    const peta = page.locator('#peta');
    await peta.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    const canvas = page.locator('#peta canvas');
    await canvas.waitFor({ state: 'visible', timeout: 5000 });
    const box = await canvas.boundingBox();

    if (box) {
      await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * 0.35);
      await page.waitForTimeout(100);

      const hasLabel = await page.locator('.asia-scene__label').count();
      if (hasLabel === 0) {
        for (let xf = 0.25; xf <= 0.75; xf += 0.05) {
          for (let yf = 0.25; yf <= 0.75; yf += 0.05) {
            await page.mouse.move(box.x + box.width * xf, box.y + box.height * yf);
            await page.waitForTimeout(50);
            if (await page.locator('.asia-scene__label').count() > 0) {
              break;
            }
          }
          if (await page.locator('.asia-scene__label').count() > 0) break;
        }
      }

      await page.waitForTimeout(300);
      const hoverPath = join(dirs.interaction, 'hover-invitation-1440.png');
      await page.screenshot({ path: hoverPath, fullPage: false });
      await recordShot(hoverPath);
    }
    await context.close();
  }

  console.log('\n====================================================');
  console.log('6. LAB AND SYSTEM SCREENSHOTS');
  console.log('====================================================');
  // Lab scene across 3 viewports
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/lab/scene`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 30000 });
    await page.waitForTimeout(600);

    const labPath = join(dirs.system, `lab-scene-${vp.name}.png`);
    await page.screenshot({ path: labPath, fullPage: false });
    await recordShot(labPath);
    await context.close();
  }

  // Missing country (1440, 375)
  for (const vp of [VIEWPORTS[0], VIEWPORTS[2]]) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${BASE_URL}/negara/xx`, { waitUntil: 'domcontentloaded' });
    await page.locator('#country-missing-title').waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForTimeout(300);

    const missingPath = join(dirs.system, `missing-country-${vp.name}.png`);
    await page.screenshot({ path: missingPath, fullPage: false });
    await recordShot(missingPath);
    await context.close();
  }

} finally {
  await browser.close();
}

console.log('\n====================================================');
console.log(`TOTAL SCREENSHOTS CAPTURED: ${recordedFiles.length}`);
console.log('====================================================');
