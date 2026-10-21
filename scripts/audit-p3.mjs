import { chromium } from 'playwright';

const base = `http://localhost:${process.env.PORT || '5210'}`;
const browser = await chromium.launch();
const out = {};
for (const [w, h] of [[1440, 900], [768, 1024], [375, 812]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${base}/negara/jp`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  out[w] = await page.evaluate(() => {
    const r = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const b = el.getBoundingClientRect();
      return {
        left: +b.left.toFixed(1),
        right: +b.right.toFixed(1),
        top: +b.top.toFixed(1),
        bottom: +b.bottom.toFixed(1),
        width: +b.width.toFixed(1),
      };
    };
    const order = [...document.querySelectorAll('.country > *, .country-main > *')].map(
      (el) => `${el.tagName.toLowerCase()}.${(el.className || '').toString().split(' ')[0]}`,
    );
    const back = document.querySelector('.country-back, a[href="/"], .back-nav, .country-backlink');
    const backStyle = back ? getComputedStyle(back) : null;
    const h1 = document.querySelector('h1');
    const text = document.body.innerText;
    return {
      docHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      main: r('.country-main'),
      sidebar: r('.country-sidebar'),
      textCol: r('.country-block--story, .country-story, .country-main p'),
      h1: r('h1'),
      hero: r('.country-hero'),
      order,
      backStyle: backStyle && {
        border: backStyle.border,
        radius: backStyle.borderRadius,
        bg: backStyle.backgroundColor,
        width: backStyle.width,
        height: backStyle.height,
      },
      counts: {
        nameLocal: (text.match(/日本/g) || []).length,
        language: (text.match(/bahasa Jepang/gi) || []).length,
      },
      sections: [...document.querySelectorAll('h2')].map((h) => h.textContent?.trim()),
    };
  });
  await page.close();
}
console.log(JSON.stringify(out, null, 2));
await browser.close();
