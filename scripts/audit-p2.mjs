import { chromium } from 'playwright';

const PORT = process.env.PORT || '5210';
const base = `http://localhost:${PORT}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, { timeout: 45000 });
await page.waitForTimeout(1500);

const hero = await page.evaluate(() => {
  const rect = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return {
      left: +r.left.toFixed(1),
      top: +r.top.toFixed(1),
      right: +r.right.toFixed(1),
      bottom: +r.bottom.toFixed(1),
      width: +r.width.toFixed(1),
      height: +r.height.toFixed(1),
    };
  };
  const ink = window.__asiakin_scene?.measureInk?.() ?? null;
  return {
    ink,
    title: rect(document.querySelector('.landing-hero__copy')),
    ground: rect(document.querySelector('.landing-hero__ground')),
    hint: rect(document.querySelector('.landing-hint')),
    scene: rect(document.querySelector('.landing-hero__scene')),
    orientation: ['jp', 'sa', 'id', 'cn'].reduce((acc, id) => {
      acc[id] = window.__asiakin_scene?.projected(id);
      return acc;
    }, {}),
  };
});

// progressive scroll (D33)
const total = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
const STEPS = 60;
for (let i = 0; i <= STEPS; i += 1) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round((total * i) / STEPS));
  await page.waitForTimeout(60);
}

const sections = await page.evaluate(() => {
  const scenes = [...document.querySelectorAll('.landing-scene')];
  return scenes.map((scene) => {
    const first = scene.querySelector('h1, h2, h3, .landing-note, .landing-display');
    const r = first?.getBoundingClientRect();
    return {
      cls: scene.className.replace('landing-scene', '').trim(),
      top: Math.round(scene.getBoundingClientRect().top + window.scrollY),
      height: Math.round(scene.getBoundingClientRect().height),
      textLeft: r ? +r.left.toFixed(1) : null,
    };
  });
});

// counter + highlight sync inside scene 2
const sync = [];
for (const f of [0.105, 0.12, 0.135, 0.15, 0.165, 0.175]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
  await page.waitForTimeout(250);
  sync.push(
    await page.evaluate(() => {
      const counter = document.querySelector('.landing-scene--scale [data-counter]');
      const marks = [...document.querySelectorAll('.landing-scene--scale [data-highlight]')];
      const lit = marks.filter((m) => Number(getComputedStyle(m).opacity) > 0.85).length;
      return { counter: counter?.textContent?.trim() ?? null, marks: marks.length, lit };
    }),
  );
}

// scene 6 overlap
await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * (620 / 920) + 200));
await page.waitForTimeout(500);
const cultural = await page.evaluate(() => {
  const r = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height };
  };
  const inter = (a, b) => {
    if (!a || !b) return 0;
    const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
    const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
    return w > 0 && h > 0 ? +(w * h).toFixed(0) : 0;
  };
  const head = r('.landing-scene--cultural .landing-display');
  const note = r('.landing-scene--cultural .landing-note');
  const tr = r('.landing-cultural__layer--tr');
  const th = r('.landing-cultural__layer--th');
  const labelTr = r('.landing-cultural__label--tr');
  const labelTh = r('.landing-cultural__label--th');
  return {
    head,
    note,
    tr,
    th,
    labelTr,
    labelTh,
    overlap: {
      headTr: inter(head, tr),
      headTh: inter(head, th),
      labelTr: inter(labelTr, tr),
      labelTh: inter(labelTh, th),
    },
  };
});

await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
await page.waitForTimeout(600);
const footer = await page.evaluate(() => {
  const h = document.querySelector('.landing-footer__copy .landing-display');
  const links = [...document.querySelectorAll('.landing-footer__links a')].map((a) => ({
    text: a.textContent?.trim(),
    href: a.getAttribute('href'),
  }));
  return {
    heading: h?.textContent?.trim() ?? null,
    headingSize: h ? getComputedStyle(h).fontSize : null,
    links,
    countryButtons: document.querySelectorAll('.landing-footer__index-button').length,
    mark: document.querySelector('.landing-footer__mark')?.textContent?.trim() ?? null,
  };
});

console.log(JSON.stringify({ hero, sections, sync, cultural, footer, errors }, null, 2));
await browser.close();
