import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const SHOT_DIR = 'docs/VERIFY_LANDING';

/** Tiga viewport §0.9: desktop, tablet, ponsel. */
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
] as const;

/** Lima titik scroll untuk bukti visual. */
const FRACTIONS = [0, 0.25, 0.5, 0.75, 1] as const;

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => {
    errors.push(`pageerror: ${error.message}`);
  });
  return errors;
}

/**
 * Scroll programatik lalu tunggu sampai ScrollTrigger benar-benar selesai.
 * 400 ms tidak cukup: harness lama merekam penghitung "0" di posisi 25%
 * padahal nilainya sudah 15 saat diukur dengan jeda 900 ms. Jeda 400 ms
 * menghasilkan bukti palsu, jadi jangan diturunkan tanpa mengukur ulang.
 */
async function goToFraction(page: Page, fraction: number): Promise<void> {
  const target = await page.evaluate((value) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const y = Math.round(max * value);
    window.scrollTo({ top: y, behavior: 'instant' });
    return y;
  }, fraction);
  await page.waitForFunction((y) => Math.abs(window.scrollY - y) <= 12, target, {
    timeout: 15_000,
  }).catch(async () => {
    await page.evaluate((y) => window.scrollTo(0, y), target);
  });
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      }),
  );
  await page.waitForTimeout(600);
}

async function waitForScene(page: Page): Promise<void> {
  // Peta hero 48 negara memasang debug hook `__asiakin_map48`; scene lama
  // (`__asiakin_scene`) hanya dipakai di /lab/scene.
  await page
    .waitForFunction(() => window.__asiakin_map48?.ready === true, null, {
      timeout: 45_000,
    })
    .catch(() => {
      // WebGL bisa tidak tersedia di runner; fallback daftar tetap harus lulus.
    });
  await page
    .waitForFunction(
      () => document.documentElement.dataset.ready === 'true',
      null,
      { timeout: 10_000 },
    )
    .catch(() => {});
  await page
    .locator('.preloader')
    .waitFor({ state: 'detached', timeout: 10_000 })
    .catch(() => {});
}

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const widths = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    inner: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.inner + 1);
}

test.describe('landing visual', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'Viewport diatur eksplisit di dalam test; proyek mobile akan menduplikasi.',
  );

  test('15 tangkapan 5 posisi scroll tanpa error konsol', async ({ page }) => {
    test.setTimeout(180_000);
    const errors = collectErrors(page);

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto('/');

      // Preloader verification (D29): must appear, then disappear.
      if (viewport.width === 1440) {
        const preloaderCheck = await Promise.race([
          page.waitForTimeout(120).then(async () => {
            const exists = await page.evaluate(() => {
              return document.querySelectorAll('[class*="preloader"]').length > 0;
            });
            return { exists, timeout: false };
          }),
          page.waitForTimeout(3000).then(() => ({ exists: false, timeout: true })),
        ]);
        
        if (!preloaderCheck.timeout) {
          expect(preloaderCheck.exists).toBe(true);
        }

        await page.waitForFunction(
          () => document.documentElement.dataset.ready === 'true',
          null,
          { timeout: 5000 },
        );
        const readySet = await page.evaluate(
          () => document.documentElement.dataset.ready,
        );
        expect(readySet).toBe('true');
        
        // Wait for intro animation to settle.
        await page.waitForTimeout(1200);
      }

      await expect(
        page.getByRole('heading', { level: 1 }),
      ).toHaveText(/Jelajahi 48 Bangsa|Asia Explorer/);
      await waitForScene(page);

      // Lima scene tersisa setelah peta undangan dilebur ke hero. Ambang
      // tinggi sengaja longgar: isi mosaik mengalir dan tingginya berbeda
      // per viewport; yang penting halaman tetap panjang dan bisa di-scroll.
      const height = await page.evaluate(() => {
        const vh = window.innerHeight;
        return {
          scrollHeight: document.documentElement.scrollHeight,
          vh,
          sceneCount: document.querySelectorAll('.landing-scene').length,
        };
      });
      expect(height.sceneCount).toBe(2);
      expect(height.scrollHeight).toBeGreaterThanOrEqual(
        Math.floor(height.vh * 1.5),
      );

      for (const fraction of FRACTIONS) {
        await goToFraction(page, fraction);
        await expectNoHorizontalScroll(page);

        const percent = String(Math.round(fraction * 100)).padStart(3, '0');
        await page.screenshot({
          path: `${SHOT_DIR}/landing-${viewport.width}x${viewport.height}-${percent}.png`,
        });
      }

      // 48-nation streamlined architecture (Hero + Daily Challenge)
    }

    expect(errors).toEqual([]);
  });
});

test('skip link dan navigasi ekspedisi 48 negara', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.waitForFunction(
    () => document.documentElement.dataset.ready === 'true',
    null,
    { timeout: 5000 },
  );

  // Skip link halaman menuju satu-satunya peta interaktif (hero).
  const skip = page.getByRole('link', { name: 'Lewati ke pilihan negara' });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#peta')).toBeFocused();
  await expect(page.locator('#peta')).toHaveCount(1);

  // Navigasi ekspedisi 48 negara via pintas kawasan
  const seaBtn = page.getByRole('button', { name: 'Asia Tenggara' });
  await expect(seaBtn).toBeVisible();
  await seaBtn.click();

  const preview = page.locator('.country-preview');
  await expect(preview).toHaveAttribute('data-open', 'true');
  await expect(preview.locator('.country-preview__name')).toHaveText('Indonesia');

  // Klik tombol buka cerita menuju detail negara
  const cta = preview.getByRole('link', { name: /Buka cerita|Lihat sekilas/ });
  await expect(cta).toBeVisible();
  await cta.click();

  await expect(page).toHaveURL(/\/negara\/id$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Indonesia');

  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tanpa pin, teks kunci terlihat di 5 posisi', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Tidak ada stage yang menempel.
    const positions = await page
      .locator('.landing-scene--pinned .landing-stage')
      .evaluateAll((nodes) =>
        nodes.map((node) => getComputedStyle(node).position),
      );
    for (const position of positions) {
      expect(position).toBe('relative');
    }

    for (const fraction of FRACTIONS) {
      await goToFraction(page, fraction);
      await expectNoHorizontalScroll(page);

      const state = await page.evaluate(() => {
        const headings = Array.from(
          document.querySelectorAll<HTMLElement>(
            'h1, h2, h3, .landing-display, .landing-hero__title, .landing-script__card, .landing-footer__mark',
          ),
        );
        return headings.map((node) => {
          const rect = node.getBoundingClientRect();
          return {
            opacity: Number(getComputedStyle(node).opacity),
            inViewport:
              rect.bottom > 0 &&
              rect.top < window.innerHeight &&
              rect.width > 0 &&
              rect.height > 0,
          };
        });
      });

      expect(state.length).toBeGreaterThan(0);
      for (const item of state) {
        expect(item.opacity).toBe(1);
      }
      expect(state.some((item) => item.inViewport)).toBe(true);
    }

    expect(errors).toEqual([]);
  });
});

test('tanpa WebGL, daftar 48 negara tetap bisa dipilih', async ({
  page,
}) => {
  const errors = collectErrors(page);
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
  await expect(
    page.getByRole('heading', { level: 1 }),
  ).toHaveText(/Jelajahi 48 Bangsa|Asia Explorer/);

  const fallback = page.locator('.landing-map--interactive');
  await expect(fallback).toBeVisible({ timeout: 15_000 });
  await expect(fallback.locator('[role="button"]')).toHaveCount(48);

  // Area peta juga keyboard-operable: fokus + Enter membuka pratinjau,
  // bukan dialog modal lagi.
  const area = fallback.locator('[role="button"]').first();
  await area.focus();
  await page.keyboard.press('Enter');

  const panel = page.locator('.country-preview');
  await expect(panel).toHaveAttribute('data-open', 'true');
  await expect(panel.getByRole('button', { name: 'Tutup pratinjau negara' })).toBeFocused();
  await expect(panel.locator('.country-preview__name')).not.toBeEmpty();

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator('#peta')).toBeFocused();

  await expectNoHorizontalScroll(page);
  expect(errors).toEqual([]);
});

test('negara dulu "brief" (ae) kini punya CTA dan halaman EN', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await waitForScene(page);

  const ready = await page.evaluate(
    () => window.__asiakin_map48?.ready === true,
  );
  test.skip(!ready, 'WebGL tidak tersedia; jalur pratinjau 3D tidak bisa diuji.');

  const clickCountry = async (id: string, iso3: string): Promise<boolean> => {
    await page.evaluate(() => window.__asiakin_map48?.setAutoRotate?.(false));
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const point = await page.evaluate(
        (code) => window.__asiakin_map48?.projected(code) ?? null,
        iso3,
      );
      if (!point) {
        await page.waitForTimeout(250);
        continue;
      }
      await page.mouse.click(point.x, point.y);
      const opened = await page
        .locator(`.country-preview[data-country="${id}"][data-open="true"]`)
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      if (opened) return true;
      await page.waitForTimeout(300);
    }
    return false;
  };

  // `ae` (UAE) dulu jatuh ke ringkasan 48 negara tanpa halaman; sekarang
  // resolve lewat content layer dan tampil penuh dengan CTA.
  await expect(await clickCountry('ae', 'ARE')).toBe(true);

  const panel = page.locator('.country-preview');
  await expect(panel).toHaveAttribute('data-country', 'ae');
  await expect(panel).not.toHaveAttribute('data-depth', 'brief');
  await expect(
    panel.getByRole('heading', { name: 'Uni Emirat Arab' }),
  ).toBeVisible();

  const cta = panel.locator('.country-preview__cta');
  await expect(cta).toHaveCount(1);
  await expect(cta).toHaveAttribute('href', '/negara/ae');
  await expect(
    panel.getByText(/Halaman lengkap negara ini sedang disiapkan/),
  ).toHaveCount(0);

  await cta.click();
  await expect(page).toHaveURL(/\/negara\/ae$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Uni Emirat Arab',
  );

  // Versi Inggris menyajikan prosa EN, bukan fallback ke konten ID.
  await page.goto('/en/negara/ae');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'United Arab Emirates',
  );

  expect(errors).toEqual([]);
});

test('klik negara di peta 3D membuka pratinjau, Esc menutup, CTA ke halaman negara', async ({
  page,
}) => {
  test.setTimeout(120_000);
  const errors = collectErrors(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await waitForScene(page);

  const ready = await page.evaluate(
    () => window.__asiakin_map48?.ready === true,
  );
  test.skip(!ready, 'WebGL tidak tersedia; jalur pratinjau 3D tidak bisa diuji.');

  const clickCountry = async (id: string, iso3: string): Promise<boolean> => {
    await page.evaluate(() => window.__asiakin_map48?.setAutoRotate?.(false));
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const point = await page.evaluate(
        (code) => window.__asiakin_map48?.projected(code) ?? null,
        iso3,
      );
      if (!point) {
        await page.waitForTimeout(250);
        continue;
      }
      // Klik sekali: fly-to ~560 ms menahan onSelect; klik ulang akan
      // mencuri fokus dari panel yang sudah terbuka.
      await page.mouse.click(point.x, point.y);
      const opened = await page
        .locator(`.country-preview[data-country="${id}"][data-open="true"]`)
        .waitFor({ state: 'visible', timeout: 3000 })
        .then(() => true)
        .catch(() => false);
      if (opened) {
        return true;
      }
      await page.waitForTimeout(300);
    }
    return false;
  };

  await expect(await clickCountry('jp', 'JPN')).toBe(true);

  const panel = page.locator('.country-preview');
  await expect(panel).toHaveAttribute('data-country', 'jp');
  await expect(panel.getByRole('heading', { name: 'Jepang' })).toBeVisible();
  await expect(
    panel.getByRole('button', { name: 'Tutup pratinjau negara' }),
  ).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator('#peta')).toBeFocused();

  // Buka ulang lalu masuk ke halaman negara lewat CTA.
  await page.waitForTimeout(1400);
  await expect(await clickCountry('jp', 'JPN')).toBe(true);
  await page
    .locator('.country-preview')
    .getByRole('link', { name: /Buka cerita/ })
    .click();
  await expect(page).toHaveURL(/\/negara\/jp$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Jepang');

  expect(errors).toEqual([]);
});

test('pratinjau ponsel tampil sebagai bottom sheet tanpa overflow', async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors = collectErrors(page);

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

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');

  const fallback = page.locator('.landing-map--interactive');
  await expect(fallback).toBeVisible({ timeout: 15_000 });
  // Path pertama (Turki) punya siluet ringkas, jadi titik tengah kotaknya
  // benar-benar berada di dalam area yang bisa diklik.
  await fallback.locator('[role="button"]').first().click();

  const panel = page.locator('.country-preview');
  await expect(panel).toHaveAttribute('data-open', 'true');
  await expect(panel.locator('.country-preview__name')).not.toBeEmpty();
  // Tunggu animasi masuk selesai sebelum mengukur tepi bawah.
  await page.waitForTimeout(400);

  const box = await panel.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThan(812 * 0.2);
  expect(box!.y + box!.height).toBeLessThanOrEqual(812 + 1);

  await expectNoHorizontalScroll(page);

  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0, { timeout: 2000 });
  await expectNoHorizontalScroll(page);

  expect(errors).toEqual([]);
});
