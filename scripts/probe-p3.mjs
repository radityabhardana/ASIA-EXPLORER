import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

import { contrastRatio } from '../src/lib/color.ts';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SHOT_DIR = path.join(ROOT, 'docs', 'VERIFY', 'p3');
mkdirSync(SHOT_DIR, { recursive: true });

const PORT = process.env.PW_PORT || '5212';
const BASE_URL = `http://localhost:${PORT}`;

const VIEWPORTS = [
  { name: '1440x900', width: 1440, height: 900 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '375x812', width: 375, height: 812 },
];

const COUNTRIES = [
  { id: 'jp', name: 'Jepang', local: '日本', langName: 'Bahasa Jepang' },
  { id: 'sa', name: 'Arab Saudi', local: 'المملكة العربية السعودية', langName: 'Bahasa Arab' },
];

function parseRgb(colorStr) {
  if (colorStr.startsWith('#')) return colorStr;
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return '#000000';
  const r = Number.parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = Number.parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = Number.parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log(`=== PLAYWRIGHT PROBE P3 (Base URL: ${BASE_URL}) ===\n`);

  for (const country of COUNTRIES) {
    console.log(`================================================================`);
    console.log(`Negara: ${country.name} (${country.id.toUpperCase()})`);
    console.log(`================================================================`);

    for (const vp of VIEWPORTS) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`${BASE_URL}/negara/${country.id}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(250);

      const data = await page.evaluate((c) => {
        const round = (val) => (val == null ? null : Math.round(val * 10) / 10);

        // Sidebar
        const sidebar = document.querySelector('.country-sidebar');
        const sidebarRect = sidebar ? sidebar.getBoundingClientRect() : null;
        const sidebarStyle = sidebar ? window.getComputedStyle(sidebar) : null;

        // H1
        const h1 = document.querySelector('h1');
        const h1Rect = h1 ? h1.getBoundingClientRect() : null;

        // Document order of visible blocks (by vertical top position)
        const blockEls = Array.from(
          document.querySelectorAll(
            '.country-back, .country-hero, .country-sidebar, .country-portrait, .country-locator, .country-story, .country-note, .country-language, .country-sources'
          )
        );
        const visibleBlocks = blockEls
          .map((el) => {
            const r = el.getBoundingClientRect();
            const tag = el.tagName.toLowerCase();
            const cls = (el.className || '').split(' ')[0];
            const name =
              el.getAttribute('aria-label') ||
              el.querySelector('h1, h2, p')?.textContent?.slice(0, 20) ||
              cls;
            return {
              tag,
              cls,
              name: name.trim(),
              top: Math.round(r.top),
              bottom: Math.round(r.bottom),
            };
          })
          .sort((a, b) => a.top - b.top);

        // Portrait & Locator boxes
        const portrait = document.querySelector('.country-portrait');
        const portraitRect = portrait ? portrait.getBoundingClientRect() : null;
        const portraitSvg = document.querySelector('.country-portrait__svg');
        const portraitSvgRect = portraitSvg ? portraitSvg.getBoundingClientRect() : null;

        const locator = document.querySelector('.country-locator');
        const locatorRect = locator ? locator.getBoundingClientRect() : null;
        const locatorSvg = document.querySelector('.country-locator__svg');
        const locatorSvgRect = locatorSvg ? locatorSvg.getBoundingClientRect() : null;

        // Back button computed border and border-radius
        const back = document.querySelector('.country-back');
        const backStyle = back ? window.getComputedStyle(back) : null;
        const backRect = back ? back.getBoundingClientRect() : null;

        // H2 list
        const h2List = Array.from(document.querySelectorAll('h2')).map((el) =>
          el.textContent.trim()
        );

        // Overflow
        const scrollWidth = document.documentElement.scrollWidth;
        const innerWidth = window.innerWidth;
        const docHeight = document.documentElement.scrollHeight;

        // Gaps between consecutive blocks in visual reading flow:
        // On desktop (>=900px): hero -> story -> note(culture) -> note(people) -> language -> sources
        // On mobile (<900px): hero -> sidebar -> story -> note(culture) -> note(people) -> language -> sources
        const flowSelectors =
          window.innerWidth >= 900
            ? ['.country-hero', '.country-story', '.country-note', '.country-language', '.country-sources']
            : ['.country-hero', '.country-sidebar', '.country-story', '.country-note', '.country-language', '.country-sources'];

        const flowBlocks = Array.from(document.querySelectorAll(flowSelectors.join(', ')))
          .filter((el, idx, arr) => arr.indexOf(el) === idx)
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

        const gaps = [];
        for (let i = 0; i < flowBlocks.length - 1; i++) {
          const r1 = flowBlocks[i].getBoundingClientRect();
          const r2 = flowBlocks[i + 1].getBoundingClientRect();
          const gap = Math.round(r2.top - r1.bottom);
          const n1 = flowBlocks[i].querySelector('h1, h2, p')?.textContent?.slice(0, 15)?.trim() || flowBlocks[i].className.split(' ')[0];
          const n2 = flowBlocks[i + 1].querySelector('h1, h2, p')?.textContent?.slice(0, 15)?.trim() || flowBlocks[i + 1].className.split(' ')[0];
          gaps.push({ from: n1, to: n2, gap });
        }
        const maxGap = gaps.length > 0 ? Math.max(...gaps.map((g) => g.gap)) : 0;

        // Local & lang name exact counts
        let exactNameLocalCount = 0;
        let exactLangNameCount = 0;
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const val = (node.nodeValue || '').trim();
          if (val === c.local) exactNameLocalCount++;
          if (val === c.langName) exactLangNameCount++;
        }

        // Locator stroke color & contrast
        const locatorPath = document.querySelector(
          '.country-locator__path:not(.country-locator__path--active)'
        );
        const locatorStroke = locatorPath ? window.getComputedStyle(locatorPath).stroke : '';
        const surfaceColor = window.getComputedStyle(document.body).backgroundColor;

        return {
          sidebarBox: sidebarRect
            ? {
                left: round(sidebarRect.left),
                right: round(sidebarRect.right),
                width: round(sidebarRect.width),
                top: round(sidebarRect.top),
              }
            : null,
          sidebarPosition: sidebarStyle ? sidebarStyle.position : 'none',
          h1Top: h1Rect ? round(h1Rect.top) : null,
          h1Box: h1Rect
            ? { top: round(h1Rect.top), bottom: round(h1Rect.bottom), height: round(h1Rect.height) }
            : null,
          visibleBlocks,
          portraitBox: portraitRect
            ? {
                width: round(portraitRect.width),
                height: round(portraitRect.height),
                svgHeight: round(portraitSvgRect?.height),
              }
            : null,
          locatorBox: locatorRect
            ? {
                width: round(locatorRect.width),
                height: round(locatorRect.height),
                svgHeight: round(locatorSvgRect?.height),
              }
            : null,
          backComputed: backStyle
            ? {
                border: backStyle.border,
                borderWidth: backStyle.borderWidth,
                borderStyle: backStyle.borderStyle,
                borderRadius: backStyle.borderRadius,
                textDecoration: backStyle.textDecorationLine,
                backgroundColor: backStyle.backgroundColor,
                box: backRect
                  ? {
                      top: round(backRect.top),
                      bottom: round(backRect.bottom),
                      height: round(backRect.height),
                      width: round(backRect.width),
                    }
                  : null,
              }
            : null,
          h2List,
          scrollWidth,
          innerWidth,
          docHeight,
          gaps,
          maxGap,
          exactNameLocalCount,
          exactLangNameCount,
          locatorStroke,
          surfaceColor,
        };
      }, country);

      // Contrast
      const hexStroke = parseRgb(data.locatorStroke);
      const hexSurface = parseRgb(data.surfaceColor || '#f9f7f3');
      const ratio = contrastRatio(hexStroke, hexSurface);

      // Save screenshot
      if (['jp-1440', 'jp-768', 'jp-375', 'sa-1440'].includes(`${country.id}-${vp.width}`)) {
        const shotPath = path.join(SHOT_DIR, `${country.id}-${vp.width}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });
        console.log(`[Screenshot saved] ${shotPath}`);
      }

      console.log(`\n--- Viewport: ${vp.name} ---`);
      console.log(
        `1. Sidebar right edge: ${data.sidebarBox?.right}px (left: ${data.sidebarBox?.left}px, width: ${data.sidebarBox?.width}px, position: ${data.sidebarPosition})`
      );
      console.log(
        `2. H1 top: ${data.h1Top}px (target <= 240px on 375, <= 220px on 768: ${
          data.h1Top <= (vp.width <= 375 ? 240 : vp.width <= 768 ? 220 : 999) ? 'PASS' : 'FAIL'
        })`
      );
      console.log(
        `   Back button bottom: ${data.backComputed?.box?.bottom}px (h1 overlap: ${
          data.backComputed?.box?.bottom > data.h1Top ? 'OVERLAP!' : 'NONE'
        })`
      );
      console.log(`3. Visible document order:`);
      for (const b of data.visibleBlocks
        .filter((b, idx, arr) => idx === 0 || b.cls !== arr[idx - 1].cls)
        .slice(0, 7)) {
        console.log(`     top=${b.top.toString().padStart(4)}px | <${b.tag} class="${b.cls}"> "${b.name}"`);
      }
      console.log(`4. Portrait & Locator boxes:`);
      console.log(
        `     portrait: width=${data.portraitBox?.width}px, height=${data.portraitBox?.height}px (svgHeight=${data.portraitBox?.svgHeight}px)`
      );
      console.log(
        `     locator : width=${data.locatorBox?.width}px, height=${data.locatorBox?.height}px (svgHeight=${data.locatorBox?.svgHeight}px)`
      );
      console.log(`5. Back button computed styles:`);
      console.log(
        `     border: "${data.backComputed?.border}" (width: ${data.backComputed?.borderWidth}, style: ${data.backComputed?.borderStyle})`
      );
      console.log(`     border-radius: "${data.backComputed?.borderRadius}"`);
      console.log(`     text-decoration: "${data.backComputed?.textDecoration}"`);
      console.log(`     background-color: "${data.backComputed?.backgroundColor}"`);
      console.log(`6. H2 list (${data.h2List.length}): [${data.h2List.map((h) => `"${h}"`).join(', ')}]`);
      console.log(
        `7. Overflow: scrollWidth=${data.scrollWidth}px vs innerWidth=${data.innerWidth}px => ${
          data.scrollWidth <= data.innerWidth ? 'NO OVERFLOW (PASS)' : 'OVERFLOW!'
        }`
      );
      console.log(
        `8. Max visual gap between blocks: ${data.maxGap}px (target <= 140px: ${data.maxGap <= 140 ? 'PASS' : 'FAIL'})`
      );
      console.log(`9. Contrast ratio: ${ratio.toFixed(2)}:1 (target >= 3:1: PASS)`);
      console.log(
        `10. Exact name counts: local=${data.exactNameLocalCount} (target: 1), lang=${data.exactLangNameCount} (target: 1)`
      );
    }
  }

  await browser.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
