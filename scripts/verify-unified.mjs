import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const PORT = 5200;
const BASE_URL = `http://localhost:${PORT}`;
const OUT_DIR = 'docs/VERIFY';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const consoleErrors = [];

  console.log(`\n======================================================`);
  console.log(`🚀 ASIAKIN UNIFIED AUDIT & VERIFICATION (Port ${PORT})`);
  console.log(`======================================================\n`);

  // -------------------------------------------------------------------------
  // 1. LANDING & PRELOADER VERIFICATION
  // -------------------------------------------------------------------------
  console.log(`[1/3] VERIFYING LANDING PAGE & PRELOADER`);
  const viewports = [
    { width: 1440, height: 900, name: '1440' },
    { width: 768, height: 1024, name: '768' },
    { width: 375, height: 812, name: '375' },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    page.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(`[Landing ${vp.name}] ${msg.text()}`);
      }
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

    if (vp.width === 1440) {
      await page.waitForTimeout(120);
      const earlyPreloader = await page.evaluate(() => {
        const el = document.querySelector('[class*="preloader"]');
        return el ? true : false;
      });
      console.log(`  ✓ Preloader visible at 120ms: ${earlyPreloader}`);

      await page.waitForFunction(() => document.documentElement.dataset.ready === 'true', null, { timeout: 6000 });
      console.log(`  ✓ documentElement.dataset.ready === 'true'`);

      await page.waitForTimeout(800);
      const preloaderCount = await page.evaluate(() => document.querySelectorAll('[class*="preloader"]').length);
      console.log(`  ✓ Preloader unmounted after transition: count = ${preloaderCount}`);

      const heroReady = await page.evaluate(() => document.querySelector('.landing--ready') !== null);
      console.log(`  ✓ Hero intro entrance state (.landing--ready): ${heroReady}`);
    } else {
      await page.waitForFunction(() => document.documentElement.dataset.ready === 'true', null, { timeout: 6000 });
    }

    // Capture screenshot at hero
    await page.screenshot({ path: join(OUT_DIR, `landing-hero-${vp.name}.png`) });

    // Check Scene 4 (Triptych) at 40% scroll
    const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const scroll40 = Math.round((docHeight - vp.height) * 0.45);
    await page.evaluate(y => window.scrollTo(0, y), scroll40);
    await page.waitForTimeout(500);

    const scene4Cards = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.landing-script__card'));
      return cards.map(c => ({
        label: c.querySelector('.landing-script__label')?.textContent?.trim(),
        text: c.innerText.replace(/\s+/g, ' ').trim(),
        opacity: getComputedStyle(c).opacity,
      }));
    });

    if (vp.width === 1440) {
      console.log(`  ✓ Scene 4 Triptych cards count: ${scene4Cards.length} (expected 3)`);
      for (const card of scene4Cards) {
        console.log(`     - [${card.label}]: opacity=${card.opacity}`);
      }
    }

    // Scroll to Footer
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);

    const footerSummary = await page.evaluate(() => {
      const text = document.body.innerText;
      const count = needle => (text.match(new RegExp(needle, 'g')) || []).length;
      const buttons = document.querySelectorAll('.landing-footer__index-button').length;
      return {
        buttons,
        lengkap: count('Lengkap'),
        penjelajahan: count('Penjelajahan'),
        arrows: count('[→←]'),
      };
    });

    console.log(`  ✓ Viewport ${vp.name} Footer: 15 countries (${footerSummary.buttons}), Lengkap=${footerSummary.lengkap}, Penjelajahan=${footerSummary.penjelajahan}, Arrows=${footerSummary.arrows}`);

    // Test Dialog
    const idBtn = page.locator('.landing-footer__index-button[data-country="id"]');
    await idBtn.click();
    await page.waitForTimeout(400);

    const dialogState = await page.evaluate(() => {
      const d = document.querySelector('dialog.landing-dialog');
      if (!d) return null;
      const cs = getComputedStyle(d);
      const action = d.querySelector('.landing-dialog__action');
      const actionCs = action ? getComputedStyle(action) : null;
      return {
        open: d.open,
        hasArrows: /[→←]/.test(d.innerText),
        borderWidth: cs.borderWidth,
        borderRadius: cs.borderRadius,
        actionUnderline: actionCs?.textDecorationLine,
      };
    });

    console.log(`  ✓ Dialog Editorial Check: border=${dialogState?.borderWidth}, radius=${dialogState?.borderRadius}, underline=${dialogState?.actionUnderline}, arrows=${dialogState?.hasArrows}`);
    await page.screenshot({ path: join(OUT_DIR, `dialog-${vp.name}.png`) });

    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    console.log(`  ✓ Viewport ${vp.name} horizontal overflow: ${scrollWidth <= vp.width ? 'PASS (0 overflow)' : 'FAIL'}`);

    await page.close();
  }

  // -------------------------------------------------------------------------
  // 2. 3D ASIA SCENE & PICKING VERIFICATION
  // -------------------------------------------------------------------------
  console.log(`\n[2/3] VERIFYING 3D ASIA SCENE, RAYCASTING & LABELS`);
  const scenePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  scenePage.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon')) {
      consoleErrors.push(`[Scene] ${msg.text()}`);
    }
  });

  await scenePage.goto(BASE_URL, { waitUntil: 'networkidle' });
  await sleep(1500);

  // Check decorative hero scene has 0 labels
  const heroLabelCount = await scenePage.locator('.landing-hero__scene .asia-scene__label').count();
  console.log(`  ✓ Decorative Hero Scene label count: ${heroLabelCount} (expected: 0)`);

  // Move pointer over hero scene canvas
  const heroCanvas = scenePage.locator('.landing-hero__scene canvas');
  const heroBox = await heroCanvas.boundingBox();
  if (heroBox) {
    await scenePage.mouse.move(heroBox.x + heroBox.width / 2, heroBox.y + heroBox.height / 2);
    await sleep(250);
    const heroLabelAfterHover = await scenePage.locator('.landing-hero__scene .asia-scene__label').count();
    console.log(`  ✓ Decorative Hero Scene label count after hover: ${heroLabelAfterHover} (expected: 0)`);
  }

  // Scroll to Invitation Scene (Interactive AsiaScene)
  await scenePage.evaluate(() => {
    document.querySelector('#peta')?.scrollIntoView({ behavior: 'instant' });
  });
  await sleep(1500);

  const targets = [
    { id: 'jp', expectedName: 'Jepang', expectedRegion: 'Asia Timur' },
    { id: 'id', expectedName: 'Indonesia', expectedRegion: 'Asia Tenggara' },
    { id: 'sa', expectedName: 'Arab Saudi', expectedRegion: 'Asia Barat' },
  ];

  for (const t of targets) {
    const proj = await scenePage.evaluate(id => window.__asiakin_scene?.projected(id), t.id);
    if (!proj) {
      console.log(`  ⚠️ Could not project ${t.id}`);
      continue;
    }

    await scenePage.mouse.move(proj.x, proj.y);
    await sleep(350);

    const labels = await scenePage.locator('.asia-scene__label');
    const labelCount = await labels.count();
    console.log(`  ✓ Hover on ${t.expectedName}: labelCount = ${labelCount} (expected: 1)`);

    if (labelCount === 1) {
      const box = await labels.first().boundingBox();
      const text = await labels.first().textContent();
      const dist = Math.hypot((box?.x || 0) - proj.x, (box?.y || 0) - proj.y);
      console.log(`     - Content: "${text?.replace(/\s+/g, ' ').trim()}"`);
      console.log(`     - Distance from pointer: ${Math.round(dist)}px (target < 40px)`);
    }

    // Dismiss label
    await scenePage.mouse.move(50, 50);
    await sleep(200);
  }

  await scenePage.screenshot({ path: join(OUT_DIR, `scene-interactive-1440.png`) });
  await scenePage.close();

  // -------------------------------------------------------------------------
  // 3. COUNTRY PAGE VERIFICATION
  // -------------------------------------------------------------------------
  console.log(`\n[3/3] VERIFYING COUNTRY PAGE CRAFT & ANTI-SLOP`);
  const countryIds = ['jp', 'id', 'sa', 'kz'];

  for (const cid of countryIds) {
    const countryPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    countryPage.on('console', msg => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(`[Country ${cid}] ${msg.text()}`);
      }
    });

    await countryPage.goto(`${BASE_URL}/negara/${cid}`, { waitUntil: 'networkidle' });
    await sleep(600);

    const audit = await countryPage.evaluate(() => {
      const bodyText = document.body.innerText;
      const outlines = document.querySelectorAll('.country-portrait__hatch-outline, .country-portrait__base-outline').length;
      const greetings = document.querySelectorAll('.country-script__greeting').length;
      const cards = document.querySelectorAll('.country-card, [class*="--card"]').length;
      const hasArrows = /[→←]/.test(bodyText);
      const scrollWidth = document.documentElement.scrollWidth;
      const clientWidth = document.documentElement.clientWidth;
      const docHeight = document.documentElement.scrollHeight;
      
      const honesty = document.querySelector('.country-honesty-marker, .country-sources__depth');
      const honestyCaps = honesty ? getComputedStyle(honesty).fontVariantCaps : null;
      const honestyBorder = honesty ? getComputedStyle(honesty).borderWidth : null;

      return {
        docHeight,
        outlines,
        greetings,
        cards,
        hasArrows,
        overflow: scrollWidth > clientWidth,
        honestyCaps,
        honestyBorder,
      };
    });

    console.log(`  ✓ Country /negara/${cid}: docHeight=${audit.docHeight}px, outlines=${audit.outlines}, greetings=${audit.greetings}, cards=${audit.cards}, arrows=${audit.hasArrows}, overflow=${audit.overflow}, honestyCaps=${audit.honestyCaps}, honestyBorder=${audit.honestyBorder}`);

    await countryPage.screenshot({ path: join(OUT_DIR, `country-${cid}-1440.png`) });
    await countryPage.close();
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log(`\n======================================================`);
  console.log(`📊 FINAL CONSOLE ERROR AUDIT`);
  console.log(`======================================================`);
  console.log(`Total console errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) {
    console.error(consoleErrors);
  } else {
    console.log(`🎉 0 CONSOLE ERRORS ACROSS ALL VERIFICATIONS!`);
  }

  await browser.close();
}

run().catch(err => {
  console.error('Unified verification failed:', err);
  process.exit(1);
});
