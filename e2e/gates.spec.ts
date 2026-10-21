import { expect, test } from '@playwright/test';

test.describe('gates P0', () => {
  test('orientation: benua 3D berorientasi utara-atas (north-up)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Viewport desktop 1440 diatur eksplisit di dalam tes.');
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 45_000 },
    );

    const projected = await page.evaluate(() => {
      const p = (id: string) => window.__asiakin_scene?.projected(id);
      return {
        jp: p('jp'),
        sa: p('sa'),
        id: p('id'),
        cn: p('cn'),
      };
    });

    expect(projected.jp).not.toBeNull();
    expect(projected.sa).not.toBeNull();
    expect(projected.id).not.toBeNull();
    expect(projected.cn).not.toBeNull();

    // Sumbu X: Jepang (timur) berada di sebelah kanan Arab Saudi (barat) + 20px
    expect(projected.jp!.x).toBeGreaterThan(projected.sa!.x + 20);

    // Sumbu Y: Indonesia (selatan) berada di bawah Tiongkok (utara) + 20px dalam koordinat layar
    expect(projected.id!.y).toBeGreaterThan(projected.cn!.y + 20);
  });

  test('no-flash: tidak ada peta SVG 2D saat loading dan kotak hero stabil', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Viewport desktop 1440 diatur eksplisit di dalam tes.');
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });

    // Tunda GLB 2.500 ms agar fase loading teramati pada titik-titik sampel 100/300/600/1200/2000 ms
    await page.route('**/models/asia.glb', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2500));
      await route.continue();
    });

    const startTime = Date.now();
    const navPromise = page.goto('/');

    const samplePoints = [100, 300, 600, 1200, 2000];
    const sampledHeights: number[] = [];

    for (const targetMs of samplePoints) {
      const elapsed = Date.now() - startTime;
      const waitTime = targetMs - elapsed;
      if (waitTime > 0) {
        await page.waitForTimeout(waitTime);
      }

      const sample = await page.evaluate(() => {
        const svg = document.querySelector('.country-map-svg');
        const heroScene = document.querySelector('.landing-hero__scene');
        const rect = heroScene?.getBoundingClientRect();
        const root = document.querySelector('.landing-asia');
        return {
          hasMapSvg: svg !== null,
          height: rect ? rect.height : null,
          dataState: root?.getAttribute('data-state'),
        };
      });

      // Pada browser berkemampuan WebGL, peta SVG 2D tidak boleh muncul di DOM selama loading
      expect(sample.hasMapSvg).toBe(false);

      if (sample.height !== null && sample.height > 0) {
        sampledHeights.push(sample.height);
      }
    }

    await navPromise;

    // Tunggu scene selesai hingga data-state="ready"
    await page.waitForFunction(
      () =>
        document.querySelector('.landing-asia')?.getAttribute('data-state') ===
        'ready',
      null,
      { timeout: 45_000 },
    );

    // Ambil tinggi akhir setelah 3D siap
    const finalHeight = await page.evaluate(() => {
      const heroScene = document.querySelector('.landing-hero__scene');
      return heroScene?.getBoundingClientRect().height ?? null;
    });
    if (finalHeight !== null) {
      sampledHeights.push(finalHeight);
    }

    // Variasi tinggi kotak hero tidak boleh melebihi 4 px (mencegah CLS / layout jump)
    expect(sampledHeights.length).toBeGreaterThanOrEqual(3);
    const minHeight = Math.min(...sampledHeights);
    const maxHeight = Math.max(...sampledHeights);
    expect(maxHeight - minHeight).toBeLessThanOrEqual(4);
  });

  test('preloader: direct load /negara/id langsung data-ready tanpa preloader', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Viewport desktop 1440 diatur eksplisit di dalam tes.');
    test.setTimeout(30_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/negara/id');

    const ready = await page.evaluate(
      () => document.documentElement.dataset.ready,
    );
    expect(ready).toBe('true');

    const preloaderCount = await page.evaluate(
      () => document.querySelectorAll('[class*="preloader"]').length,
    );
    expect(preloaderCount).toBe(0);
  });

  test('preloader: tidak berjalan dua kali saat navigasi kembali ke /', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Viewport desktop 1440 diatur eksplisit di dalam tes.');
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Tunggu landing siap pertama kali
    await page.waitForFunction(
      () => document.documentElement.dataset.ready === 'true',
      null,
      { timeout: 15_000 },
    );

    // Navigasi ke halaman negara lalu kembali ke beranda
    await page.goto('/negara/id');
    await page.goto('/');

    const preloaderCount = await page.evaluate(
      () => document.querySelectorAll('[class*="preloader"]').length,
    );
    expect(preloaderCount).toBe(0);

    const ready = await page.evaluate(
      () => document.documentElement.dataset.ready,
    );
    expect(ready).toBe('true');
  });

  test('fallback: jika WebGL tidak tersedia, CountryMapSvg tampil', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Viewport desktop 1440 diatur eksplisit di dalam tes.');
    test.setTimeout(30_000);
    await page.addInitScript(() => {
      const proto = HTMLCanvasElement.prototype as unknown as {
        getContext: (type: string, ...rest: unknown[]) => unknown;
      };
      const original = proto.getContext;
      proto.getContext = function getContext(
        this: HTMLCanvasElement,
        type: string,
        ...rest: unknown[]
      ) {
        if (type.startsWith('webgl')) {
          return null;
        }
        return original.apply(this, [type, ...rest]);
      };
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const fallbackSvg = page.locator('.country-map-svg').first();
    await expect(fallbackSvg).toBeVisible({ timeout: 10_000 });

    const root = page.locator('.landing-asia').first();
    await expect(root).toHaveAttribute('data-state', 'fallback');
  });

  test('pixel size: measureInk().widthVw 62 ±3 at 1440 dan 85 ±4 at 375', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(45_000);
    if (!isMobile) {
      await page.setViewportSize({ width: 1440, height: 900 });
    }
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 30_000 },
    );
    await page.waitForTimeout(1000);

    const ink = await page.evaluate(() => window.__asiakin_scene?.measureInk?.());
    expect(ink).not.toBeNull();

    if (isMobile) {
      expect(ink!.widthVw).toBeGreaterThanOrEqual(81);
      expect(ink!.widthVw).toBeLessThanOrEqual(89);
    } else {
      expect(ink!.widthVw).toBeGreaterThanOrEqual(59);
      expect(ink!.widthVw).toBeLessThanOrEqual(65);
    }
  });

  test('overlap: cultural headline vs both layers -> 0 intersection px²', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Pengujian desktop 1440');
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 30_000 },
    );

    const total = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    await page.evaluate(
      (y) => window.scrollTo(0, y),
      Math.round(total * (620 / 920) + 200),
    );
    await page.waitForTimeout(500);

    const overlap = await page.evaluate(() => {
      const r = (sel: string) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { l: b.left, t: b.top, r: b.right, b: b.bottom };
      };
      const inter = (
        a: { l: number; t: number; r: number; b: number } | null,
        b: { l: number; t: number; r: number; b: number } | null,
      ) => {
        if (!a || !b) return 0;
        const w = Math.min(a.r, b.r) - Math.max(a.l, b.l);
        const h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
        return w > 0 && h > 0 ? Math.round(w * h) : 0;
      };

      const head = r('.landing-scene--cultural .landing-display');
      const tr = r('.landing-cultural__layer--tr');
      const th = r('.landing-cultural__layer--th');
      const labelTr = r('.landing-cultural__label--tr');
      const labelTh = r('.landing-cultural__label--th');

      return {
        headTr: inter(head, tr),
        headTh: inter(head, th),
        labelTr: inter(labelTr, tr),
        labelTh: inter(labelTh, th),
      };
    });

    expect(overlap.headTr).toBe(0);
    expect(overlap.headTh).toBe(0);
    expect(overlap.labelTr).toBe(0);
    expect(overlap.labelTh).toBe(0);
  });

  test('grid: left-aligned scene blocks at 48 ±1 at 1440, dan stage content box left = 48', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Pengujian desktop 1440');
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 30_000 },
    );

    const total = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );
    const STEPS = 20;
    for (let i = 0; i <= STEPS; i += 1) {
      await page.evaluate(
        (y) => window.scrollTo(0, y),
        Math.round((total * i) / STEPS),
      );
      await page.waitForTimeout(40);
    }

    const grid = await page.evaluate(() => {
      const stageContentLefts = [...document.querySelectorAll('.landing-stage')].map((el) => {
        const style = getComputedStyle(el);
        const paddingLeft = parseFloat(style.paddingLeft);
        return paddingLeft;
      });

      const leftAlignedSelectors = [
        '.landing-scene--hero .landing-hero__copy',
        '.landing-scene--scale .landing-stage__copy',
        '.landing-scene--script .landing-stage__copy',
        '.landing-scene--footer .landing-footer__copy',
      ];

      const blockLefts = leftAlignedSelectors.map((sel) => {
        const el = document.querySelector(sel);
        return el ? el.getBoundingClientRect().left : null;
      });

      return { stageContentLefts, blockLefts };
    });

    // Every landing-stage content box has 48px left padding at 1440
    for (const left of grid.stageContentLefts) {
      expect(Math.abs(left - 48)).toBeLessThanOrEqual(1);
    }

    // Every left-aligned block starts at x=48 ±1
    for (const left of grid.blockLefts) {
      expect(left).not.toBeNull();
      expect(Math.abs(left! - 48)).toBeLessThanOrEqual(1);
    }
  });

  test('counter: counter text === number of lit marks at 5 fractions, final 15/15 (3x loop)', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Pengujian desktop 1440');
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 30_000 },
    );

    const total = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );

    const fractions = [0.105, 0.12, 0.135, 0.15, 0.175];

    for (let run = 1; run <= 3; run++) {
      for (const f of fractions) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
        await page.waitForTimeout(100);

        const sample = await page.evaluate(() => {
          const counterEl = document.querySelector(
            '.landing-scene--scale [data-counter]',
          );
          const marks = [
            ...document.querySelectorAll(
              '.landing-scene--scale [data-highlight]',
            ),
          ];
          const lit = marks.filter(
            (m) => Number(getComputedStyle(m).opacity) > 0.85,
          ).length;
          const counterNum = parseInt(counterEl?.textContent?.trim() ?? '0', 10);
          return { counterNum, lit };
        });

        expect(sample.counterNum).toBe(sample.lit);
      }

      await page.evaluate(
        (y) => window.scrollTo(0, y),
        Math.round(total * 0.18),
      );
      await page.waitForTimeout(100);

      const finalSample = await page.evaluate(() => {
        const counterEl = document.querySelector(
          '.landing-scene--scale [data-counter]',
        );
        const marks = [
          ...document.querySelectorAll(
            '.landing-scene--scale [data-highlight]',
          ),
        ];
        const lit = marks.filter(
          (m) => Number(getComputedStyle(m).opacity) > 0.85,
        ).length;
        const counterNum = parseInt(counterEl?.textContent?.trim() ?? '0', 10);
        return { counterNum, lit, totalMarks: marks.length };
      });

      expect(finalSample.counterNum).toBe(15);
      expect(finalSample.lit).toBe(15);
      expect(finalSample.totalMarks).toBe(15);
    }
  });

  test('cultural scene at rest diptych & footer sources distinctness', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Pengujian desktop 1440');
    test.setTimeout(45_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 30_000 },
    );

    // Scroll to scene 6 at rest (scrollY 5670)
    await page.evaluate(() => window.scrollTo(0, 5670));
    await page.waitForTimeout(800);

    const s6 = await page.evaluate(() => {
      const r = (sel: string) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height };
      };

      const head = r('.landing-scene--cultural .landing-display');
      const colTr = r('.landing-cultural__col--tr');
      const colTh = r('.landing-cultural__col--th');
      const tr = r('.landing-cultural__layer--tr');
      const th = r('.landing-cultural__layer--th');
      const labelTr = r('.landing-cultural__label--tr');
      const labelTh = r('.landing-cultural__label--th');
      const iconTr = r('.landing-cultural__icon--cezve');
      const iconTh = r('.landing-cultural__icon--wai');

      return { head, colTr, colTh, tr, th, labelTr, labelTh, iconTr, iconTh };
    });

    const { head, colTr, colTh, tr, th, labelTr, labelTh, iconTr, iconTh } = s6;
    expect(head).not.toBeNull();
    expect(colTr).not.toBeNull();
    expect(colTh).not.toBeNull();
    expect(tr).not.toBeNull();
    expect(th).not.toBeNull();
    expect(labelTr).not.toBeNull();
    expect(labelTh).not.toBeNull();
    expect(iconTr).not.toBeNull();
    expect(iconTh).not.toBeNull();

    // 1. Column edges: A = 48->672, B = 768->1392 (96px gutter)
    expect(Math.abs(colTr!.l - 48)).toBeLessThanOrEqual(1);
    expect(Math.abs(colTr!.r - 672)).toBeLessThanOrEqual(1);
    expect(Math.abs(colTh!.l - 768)).toBeLessThanOrEqual(1);
    expect(Math.abs(colTh!.r - 1392)).toBeLessThanOrEqual(1);

    // 2. Silhouettes optically centred in column, heights 360-440, within 60px of each other
    expect(tr!.h).toBeGreaterThanOrEqual(360);
    expect(tr!.h).toBeLessThanOrEqual(440);
    expect(th!.h).toBeGreaterThanOrEqual(360);
    expect(th!.h).toBeLessThanOrEqual(440);
    expect(Math.abs(tr!.h - th!.h)).toBeLessThanOrEqual(60);

    const colTrCenter = (colTr!.l + colTr!.r) / 2;
    const trCenter = (tr!.l + tr!.r) / 2;
    expect(Math.abs(colTrCenter - trCenter)).toBeLessThanOrEqual(2);

    const colThCenter = (colTh!.l + colTh!.r) / 2;
    const thCenter = (th!.l + th!.r) / 2;
    expect(Math.abs(colThCenter - thCenter)).toBeLessThanOrEqual(2);

    // 3. Headline top 96-140, centred in grid; headline ∩ each silhouette = 0 px²
    expect(head!.t).toBeGreaterThanOrEqual(96);
    expect(head!.t).toBeLessThanOrEqual(140);
    expect(head!.b).toBeLessThan(tr!.t);
    expect(head!.b).toBeLessThan(th!.t);

    // 4. Captions share one baseline: bottom between 700 and 760, within 2px of each other, width <= column width
    expect(labelTr!.b).toBeGreaterThanOrEqual(700);
    expect(labelTr!.b).toBeLessThanOrEqual(760);
    expect(labelTh!.b).toBeGreaterThanOrEqual(700);
    expect(labelTh!.b).toBeLessThanOrEqual(760);
    expect(Math.abs(labelTr!.b - labelTh!.b)).toBeLessThanOrEqual(2);

    expect(labelTr!.w).toBeLessThanOrEqual(colTr!.w + 1);
    expect(labelTh!.w).toBeLessThanOrEqual(colTh!.w + 1);
    expect(Math.abs(labelTr!.l - colTr!.l)).toBeLessThanOrEqual(1);
    expect(Math.abs(labelTh!.l - colTh!.l)).toBeLessThanOrEqual(1);

    // 5. Icons become inline emblems inside caption row: 24-32px, inside caption bbox
    expect(iconTr!.w).toBeGreaterThanOrEqual(24);
    expect(iconTr!.w).toBeLessThanOrEqual(32);
    expect(iconTh!.w).toBeGreaterThanOrEqual(24);
    expect(iconTh!.w).toBeLessThanOrEqual(32);

    expect(iconTr!.l).toBeGreaterThanOrEqual(labelTr!.l - 1);
    expect(iconTr!.r).toBeLessThanOrEqual(labelTr!.r + 1);
    expect(iconTr!.t).toBeGreaterThanOrEqual(labelTr!.t - 1);
    expect(iconTr!.b).toBeLessThanOrEqual(labelTr!.b + 1);

    expect(iconTh!.l).toBeGreaterThanOrEqual(labelTh!.l - 1);
    expect(iconTh!.r).toBeLessThanOrEqual(labelTh!.r + 1);
    expect(iconTh!.t).toBeGreaterThanOrEqual(labelTh!.t - 1);
    expect(iconTh!.b).toBeLessThanOrEqual(labelTh!.b + 1);

    // 6. Bottom gap below captions 48-140; no element outside 0...900
    const bottomGap = 900 - Math.max(labelTr!.b, labelTh!.b);
    expect(bottomGap).toBeGreaterThanOrEqual(48);
    expect(bottomGap).toBeLessThanOrEqual(140);

    const elements = [head!, tr!, th!, labelTr!, labelTh!, iconTr!, iconTh!];
    for (const el of elements) {
      expect(el.t).toBeGreaterThanOrEqual(0);
      expect(el.b).toBeLessThanOrEqual(900);
    }

    // 7. Footer assertion: no country row renders the same source label twice, and 15 rows * >=2 links
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);

    const footerCheck = await page.evaluate(() => {
      const rows = [...document.querySelectorAll('.landing-footer__source-item')];
      const rowDetails = rows.map((row) => {
        const country = row.querySelector('.landing-footer__source-country')?.textContent?.trim();
        const links = [...row.querySelectorAll('a')].map((a) => a.textContent?.trim());
        return { country, links };
      });
      return rowDetails;
    });

    expect(footerCheck.length).toBe(15);
    for (const row of footerCheck) {
      expect(row.links.length).toBeGreaterThanOrEqual(2);
      const uniqueLinks = new Set(row.links);
      expect(uniqueLinks.size).toBe(row.links.length);
    }
  });

  test('footer reachability at max scroll: 15 buttons and mark visible (1440 & 375)', async ({
    page,
    isMobile,
  }) => {
    test.setTimeout(45_000);
    if (!isMobile) {
      await page.setViewportSize({ width: 1440, height: 900 });
    }
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 30_000 },
    );

    // Scroll to the absolute maximum of the document
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(500);

    const footerReach = await page.evaluate(() => {
      const stage = document.querySelector('.landing-stage--footer');
      const buttons = [...document.querySelectorAll('.landing-footer__index-button')].map((b) => {
        const rect = b.getBoundingClientRect();
        return { bottom: rect.bottom, top: rect.top };
      });
      const mark = document.querySelector('.landing-footer__mark')?.getBoundingClientRect();
      const vh = window.innerHeight;
      const scrollDiff = stage ? stage.scrollHeight - stage.clientHeight : 999;

      // Acceptance: every button has bottom <= innerHeight at max scroll
      const allButtonsReached = buttons.every((b) => b.bottom <= vh);
      const markReached = mark ? mark.bottom <= vh : false;

      return {
        scrollDiff,
        buttonCount: buttons.length,
        allButtonsReached,
        markReached,
        lastButtonBottom: buttons[buttons.length - 1]?.bottom,
        markBottom: mark?.bottom,
        vh,
      };
    });

    expect(footerReach.scrollDiff).toBeLessThanOrEqual(1);
    expect(footerReach.buttonCount).toBe(15);
    expect(footerReach.allButtonsReached).toBe(true);
    expect(footerReach.markReached).toBe(true);
  });
});

test.describe('gates P2.3 — reveal mengikuti geometri nyata', () => {
  type Lane = { width: number; height: number; label: string };
  const LANES: Lane[] = [
    { width: 375, height: 812, label: '375' },
    { width: 768, height: 1024, label: '768' },
  ];
  const SCENES = [
    'scale',
    'language',
    'script',
    'regional',
    'cultural',
    'invitation',
    'footer',
  ];

  type RevealSample = {
    copyTop: number;
    copyOpacity: number;
    minReveal: number;
    revealCount: number;
  };

  /** Fungsi browser-side self-contained: tanpa closure Node di dalamnya. */
  const sampleScene = (name: string): RevealSample | null => {
    const selector =
      name === 'footer'
        ? '.landing-scene--footer .landing-footer__copy'
        : `.landing-scene--${name} .landing-stage__copy`;
    const section = document.querySelector(`.landing-scene--${name}`);
    const copy = document.querySelector(selector);
    if (!section || !copy) return null;
    const rect = copy.getBoundingClientRect();
    const copyOpacity = Number(getComputedStyle(copy).opacity);
    const reveals = [...section.querySelectorAll('[data-reveal]')].map((el) =>
      Number(getComputedStyle(el).opacity),
    );
    const minReveal = Math.min(...reveals, copyOpacity);
    return {
      copyTop: Math.round(rect.top),
      copyOpacity,
      minReveal,
      revealCount: reveals.length,
    };
  };

  /** Predikat yang sama, self-contained untuk waitForFunction. */
  const revealSettled = (name: string): boolean => {
    const selector =
      name === 'footer'
        ? '.landing-scene--footer .landing-footer__copy'
        : `.landing-scene--${name} .landing-stage__copy`;
    const section = document.querySelector(`.landing-scene--${name}`);
    const copy = document.querySelector(selector);
    if (!section || !copy) return false;
    const rect = copy.getBoundingClientRect();
    if (Math.abs(rect.top - 160) > 40) return false;
    const copyOpacity = Number(getComputedStyle(copy).opacity);
    if (copyOpacity < 0.95) return false;
    for (const el of section.querySelectorAll('[data-reveal]')) {
      if (Number(getComputedStyle(el).opacity) < 0.95) return false;
    }
    return true;
  };

  test('mobile reveal: copy opacity ≥0.95 saat copy top ≈160 di 375 & 768', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Kedua viewport diatur eksplisit di dalam tes.');
    test.setTimeout(180_000);

    for (const lane of LANES) {
      await page.setViewportSize({ width: lane.width, height: lane.height });
      await page.goto('/');
      await page.waitForFunction(
        () => window.__asiakin_scene?.ready === true,
        null,
        { timeout: 45_000 },
      );

      // Sapu gulir sekali supaya semua tween berhenti pada kondisi akhir,
      // lalu pengukuran offset tidak terdistorsi transform sisa reveal.
      const max = await page.evaluate(
        () => document.documentElement.scrollHeight - window.innerHeight,
      );
      const STEPS = 24;
      for (let i = 0; i <= STEPS; i += 1) {
        await page.evaluate(
          (y) => window.scrollTo(0, y),
          Math.round((max * i) / STEPS),
        );
        await page.waitForTimeout(50);
      }

      for (const scene of SCENES) {
        const target = await page.evaluate((name) => {
          const copySelector =
            name === 'footer'
              ? '.landing-scene--footer .landing-footer__copy'
              : `.landing-scene--${name} .landing-stage__copy`;
          const section = document.querySelector(`.landing-scene--${name}`);
          const stage = section?.querySelector('.landing-stage') ?? null;
          const copy = document.querySelector(copySelector);
          if (!section || !stage || !copy) return null;
          const sTop =
            section.getBoundingClientRect().top + window.scrollY;
          const rel =
            copy.getBoundingClientRect().top -
            stage.getBoundingClientRect().top;
          const limit =
            document.documentElement.scrollHeight - window.innerHeight;
          return Math.max(0, Math.min(limit, Math.round(sTop + rel - 160)));
        }, scene);
        expect(target, `${lane.label} target ${scene}`).not.toBeNull();

        // Koreksi sticky: `.landing-stage` bisa menempel/lepas di dalam
        // scene sehingga copyTop tidak linear terhadap scrollY. Ukur
        // copyTop nyata dan geser target selisihnya (slope -1 di luar
        // fase menempel) sampai |copyTop - 160| kecil.
        let scrollTarget = target!;
        let copyTopNow: number | null = null;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
          await page.waitForTimeout(250);
          copyTopNow = await page.evaluate((name) => {
            const copySelector =
              name === 'footer'
                ? '.landing-scene--footer .landing-footer__copy'
                : `.landing-scene--${name} .landing-stage__copy`;
            const copy = document.querySelector(copySelector);
            return copy ? Math.round(copy.getBoundingClientRect().top) : null;
          }, scene);
          if (copyTopNow === null || Math.abs(copyTopNow - 160) <= 4) {
            break;
          }
          scrollTarget = Math.max(
            0,
            scrollTarget + copyTopNow - 160,
          );
        }

        // Syarat gate dijawab ≤800 ms: kondisi sempat false, lalu true.
        let settled = await page
          .waitForFunction(revealSettled, scene, { timeout: 800 })
          .then(() => true)
          .catch(() => false);
        if (!settled) {
          // Race ScrollTrigger pada resize/refresh: coba satu kali lagi,
          // dan kalau tetap gagal lampirkan diagnosis lengkap pada assert.
          await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
          await page.waitForTimeout(400);
          settled = await page
            .waitForFunction(revealSettled, scene, { timeout: 800 })
            .then(() => true)
            .catch(() => false);
        }
        if (!settled) {
          const why = await page.evaluate((name) => {
            const copySelector =
              name === 'footer'
                ? '.landing-scene--footer .landing-footer__copy'
                : `.landing-scene--${name} .landing-stage__copy`;
            const section = document.querySelector(`.landing-scene--${name}`);
            const copy = document.querySelector(copySelector);
            const items = [
              ...(section?.querySelectorAll('[data-reveal]') ?? []),
            ].map(
              (el) =>
                [el.className, Number(getComputedStyle(el).opacity)] as const,
            );
            return {
              scrollY: Math.round(window.scrollY),
              copyTop: copy
                ? Math.round(copy.getBoundingClientRect().top)
                : null,
              copyOp: copy ? Number(getComputedStyle(copy).opacity) : null,
              items,
            };
          }, scene);
          expect(
            settled,
            `${lane.label} ${scene} belum settle: ${JSON.stringify(why)}`,
          ).toBe(true);
        }

        const sample = await page.evaluate(sampleScene, scene);
        expect(sample, `${lane.label} sampel ${scene}`).not.toBeNull();
        expect(
          Math.abs(sample!.copyTop - 160),
          `${lane.label} ${scene} copyTop ${sample!.copyTop}`,
        ).toBeLessThanOrEqual(40);
        expect(
          sample!.copyOpacity,
          `${lane.label} ${scene} copy opacity`,
        ).toBeGreaterThanOrEqual(0.95);
        expect(
          sample!.minReveal,
          `${lane.label} ${scene} min reveal (${sample!.revealCount} elemen)`,
        ).toBeGreaterThanOrEqual(0.95);
        expect(
          settled,
          `${lane.label} ${scene} belum settle dalam 800 ms`,
        ).toBe(true);
      }
    }
  });

  test('negative reveal: tidak ada scene blank saat section menutup ≥60% viewport (375 & 768)', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Kedua viewport diatur eksplisit di dalam tes.');
    test.setTimeout(180_000);

    for (const lane of LANES) {
      await page.setViewportSize({ width: lane.width, height: lane.height });
      await page.goto('/');
      await page.waitForFunction(
        () => window.__asiakin_scene?.ready === true,
        null,
        { timeout: 45_000 },
      );

      const allScenes = [...['hero', ...SCENES]];
      for (const scene of allScenes) {
        const targets = await page.evaluate((name) => {
          const section = document.querySelector(`.landing-scene--${name}`);
          const copySelector =
            name === 'hero'
              ? '.landing-scene--hero .landing-hero__copy'
              : name === 'footer'
                ? '.landing-scene--footer .landing-footer__copy'
                : `.landing-scene--${name} .landing-stage__copy`;
          const copy = document.querySelector(copySelector);
          if (!section || !copy) return null;
          const sTop = section.getBoundingClientRect().top + window.scrollY;
          const sH = section.getBoundingClientRect().height;
          const vh = window.innerHeight;
          const limit =
            document.documentElement.scrollHeight - window.innerHeight;
          const coverScroll = (coverage: number) =>
            Math.round(sTop + sH - coverage * vh);
          return [1, 0.8, 0.6]
            .map((c) => coverScroll(c))
            .filter((y) => y >= 0 && y <= limit && sH >= 0.6 * vh);
        }, scene);
        if (targets === null || targets.length === 0) {
          continue;
        }

        for (const y of targets) {
          await page.evaluate((pos) => window.scrollTo(0, pos), y);
          // Beri waktu animasi scrub mencapai nilai akhir pada posisi ini.
          await page.waitForTimeout(500);
          const opacity = await page.evaluate((name) => {
            const copySelector =
              name === 'hero'
                ? '.landing-scene--hero .landing-hero__copy'
                : name === 'footer'
                  ? '.landing-scene--footer .landing-footer__copy'
                  : `.landing-scene--${name} .landing-stage__copy`;
            const copy = document.querySelector(copySelector);
            return copy ? Number(getComputedStyle(copy).opacity) : 1;
          }, scene);
          expect(
            opacity,
            `${lane.label} ${scene} copy opacity di scrollY ${y} (section ≥60% viewport)`,
          ).toBeGreaterThanOrEqual(0.05);
        }
      }
    }
  });

  test('cultural mobile 375: dua vignette tampil, tanpa bleed, tanpa tabrakan, caption di gutter 16', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Viewport 375 disediakan proyek mobile.');
    test.setTimeout(90_000);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scene?.ready === true,
      null,
      { timeout: 45_000 },
    );

    const target = await page.evaluate(() => {
      const section = document.querySelector('.landing-scene--cultural');
      const stage = section?.querySelector('.landing-stage') ?? null;
      const copy = document.querySelector(
        '.landing-scene--cultural .landing-stage__copy',
      );
      if (!section || !stage || !copy) return null;
      const sTop = section.getBoundingClientRect().top + window.scrollY;
      const rel =
        copy.getBoundingClientRect().top - stage.getBoundingClientRect().top;
      const limit =
        document.documentElement.scrollHeight - window.innerHeight;
      return Math.max(0, Math.min(limit, Math.round(sTop + rel - 160)));
    });
    expect(target).not.toBeNull();
    await page.evaluate((y) => window.scrollTo(0, y), target!);

    const gate = await page
      .waitForFunction(
        () => {
          const copy = document.querySelector(
            '.landing-scene--cultural .landing-stage__copy',
          );
          if (!copy) return false;
          if (Math.abs(copy.getBoundingClientRect().top - 160) > 40) {
            return false;
          }
          return Number(getComputedStyle(copy).opacity) >= 0.95;
        },
        null,
        { timeout: 3_000 },
      )
      .then(() => true)
      .catch(() => false);
    expect(gate, 'copy cultural belum ter-reveal').toBe(true);

    const cultural = await page.evaluate(() => {
      const rect = (el: Element | null) => {
        if (!el) return null;
        const b = el.getBoundingClientRect();
        return {
          left: b.left,
          right: b.right,
          top: b.top,
          bottom: b.bottom,
          width: b.width,
          height: b.height,
        };
      };
      const display = (el: Element | null) =>
        el ? getComputedStyle(el).display : 'none';
      const inter = (
        a: ReturnType<typeof rect> | null,
        b: ReturnType<typeof rect> | null,
      ) => {
        if (!a || !b) return null;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        return w > 0 && h > 0 ? Math.round(w * h) : 0;
      };
      const head = rect(
        document.querySelector('.landing-scene--cultural .landing-display'),
      );
      const tr = rect(document.querySelector('.landing-cultural__layer--tr'));
      const th = rect(document.querySelector('.landing-cultural__layer--th'));
      const trDisplay = display(
        document.querySelector('.landing-cultural__layer--tr'),
      );
      const thDisplay = display(
        document.querySelector('.landing-cultural__layer--th'),
      );
      const labelTr = rect(
        document.querySelector('.landing-cultural__label--tr'),
      );
      const labelTh = rect(
        document.querySelector('.landing-cultural__label--th'),
      );
      return {
        head,
        tr,
        th,
        trDisplay,
        thDisplay,
        labelTr,
        labelTh,
        headTrOverlap: inter(head, tr),
        headThOverlap: inter(head, th),
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });

    // 1. Kedua vignette dirender (non-zero box, display != none).
    expect(cultural.tr).not.toBeNull();
    expect(cultural.th).not.toBeNull();
    expect(cultural.trDisplay).not.toBe('none');
    expect(cultural.thDisplay).not.toBe('none');
    expect(cultural.tr!.width).toBeGreaterThan(0);
    expect(cultural.tr!.height).toBeGreaterThan(0);
    expect(cultural.th!.width).toBeGreaterThan(0);
    expect(cultural.th!.height).toBeGreaterThan(0);

    // 2. Tidak ada horizontal bleed: left ≥ 0, right ≤ innerWidth.
    expect(cultural.tr!.left).toBeGreaterThanOrEqual(0);
    expect(cultural.tr!.right).toBeLessThanOrEqual(cultural.innerWidth + 1);
    expect(cultural.th!.left).toBeGreaterThanOrEqual(0);
    expect(cultural.th!.right).toBeLessThanOrEqual(cultural.innerWidth + 1);

    // 3. Headline ∩ layer = 0 px².
    expect(cultural.headTrOverlap).toBe(0);
    expect(cultural.headThOverlap).toBe(0);

    // 4. Caption rata kiri pada gutter 16 ±1.
    expect(Math.abs(cultural.labelTr!.left - 16)).toBeLessThanOrEqual(1);
    expect(Math.abs(cultural.labelTh!.left - 16)).toBeLessThanOrEqual(1);

    // 5. Tanpa overflow horizontal.
    expect(cultural.scrollWidth).toBe(cultural.innerWidth);
  });
});
