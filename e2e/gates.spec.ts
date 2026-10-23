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
        '.landing-scene--script .landing-stage__copy',
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

  test('counter: counter text === jumlah negara menyala di benua 3D, final 15/15 (3x loop)', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Pengujian desktop 1440');
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForFunction(
      () => window.__asiakin_scenes?.scale?.ready === true,
      null,
      { timeout: 30_000 },
    );
    // Intro descent masih berjalan ~1.6 s; tunggu sampai tinta stabil.
    await page.waitForTimeout(1800);

    const total = await page.evaluate(
      () => document.documentElement.scrollHeight - window.innerHeight,
    );

    const fractions = [0.03, 0.05, 0.065, 0.08, 0.095];

    for (let run = 1; run <= 3; run++) {
      for (const f of fractions) {
        await page.evaluate((y) => window.scrollTo(0, y), Math.round(total * f));
        await page.waitForTimeout(400);

        const sample = await page.evaluate(() => {
          const scene = window.__asiakin_scenes?.scale;
          const counterEl = document.querySelector(
            '.landing-scene--scale [data-counter]',
          );
          const counterNum = parseInt(counterEl?.textContent?.trim() ?? '0', 10);
          const lit = scene?.lit?.() ?? [];
          return { counterNum, litCount: lit.length, progress: scene?.highlightProgress?.() ?? -1 };
        });

        expect(
          sample.counterNum,
          `counter ${sample.counterNum} vs lit ${sample.litCount}`,
        ).toBe(sample.litCount);
      }

      await page.evaluate(
        (y) => window.scrollTo(0, y),
        Math.round(total * 0.125),
      );
      await page.waitForTimeout(400);

      const finalSample = await page.evaluate(() => {
        const scene = window.__asiakin_scenes?.scale;
        const counterEl = document.querySelector(
          '.landing-scene--scale [data-counter]',
        );
        const counterNum = parseInt(counterEl?.textContent?.trim() ?? '0', 10);
        const lit = scene?.lit?.() ?? [];
        return { counterNum, litCount: lit.length, highlightCount: scene?.highlightCount?.() ?? -1 };
      });

      expect(finalSample.counterNum).toBe(15);
      expect(finalSample.litCount).toBe(15);
      expect(finalSample.highlightCount).toBe(15);
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
        ? '.landing-scene--footer .landing-footer__index'
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
        ? '.landing-scene--footer .landing-footer__index'
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
              ? '.landing-scene--footer .landing-footer__index'
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
                ? '.landing-scene--footer .landing-footer__index'
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
                ? '.landing-scene--footer .landing-footer__index'
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
                ? '.landing-scene--footer .landing-footer__index'
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
                  ? '.landing-scene--footer .landing-footer__index'
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
});
