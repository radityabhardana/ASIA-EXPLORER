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
  // Registry debugKey mempertahankan scene hero di window.__asiakin_scene
  // meski scene lain mount kemudian; cukup menunggu hero siap.
  await page
    .waitForFunction(() => window.__asiakin_scene?.ready === true, null, {
      timeout: 45_000,
    })
    .catch(() => {
      // WebGL bisa tidak tersedia di runner; fallback SVG tetap harus lulus.
    });
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
      ).toHaveText('Asia Explorer');
      await waitForScene(page);

      // Tahap A: 7 scene = 100+120+100+190+120+100 vh (730) + footer ~80 vh.
      const height = await page.evaluate(() => {
        const vh = window.innerHeight;
        return { scrollHeight: document.documentElement.scrollHeight, vh };
      });
      expect(height.scrollHeight).toBeGreaterThanOrEqual(Math.floor(height.vh * 7.8));

      for (const fraction of FRACTIONS) {
        await goToFraction(page, fraction);
        await expectNoHorizontalScroll(page);

        const percent = String(Math.round(fraction * 100)).padStart(3, '0');
        await page.screenshot({
          path: `${SHOT_DIR}/landing-${viewport.width}x${viewport.height}-${percent}.png`,
        });
      }

      // Check completion markers at 100% scroll (footer visible).
      if (viewport.width === 1440) {
        const markers = await page.evaluate(() => {
          const text = document.body.innerText;
          const lengkap = (text.match(/Lengkap/g) || []).length;
          const penjelajahan = (text.match(/Penjelajahan/g) || []).length;
          const arrows = (text.match(/[→←]/g) || []).length;
          return { lengkap, penjelajahan, arrows };
        });
        expect(markers.lengkap).toBe(10);
        expect(markers.penjelajahan).toBe(5);
        expect(markers.arrows).toBe(0);
      }
    }

    expect(errors).toEqual([]);
  });
});

test('skip link, 15 tombol negara di footer, dialog, dan navigasi', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = collectErrors(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');

  // "Lewati ke peta" adalah target fokus pertama milik halaman ini (setelah
  // skip link global milik App shell).
  const skip = page.getByRole('link', { name: 'Lewati ke peta' });
  await skip.focus();
  await expect(skip).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#peta')).toBeFocused();

  // Country index sekarang di footer (in-flow), bukan panel fixed.
  const buttons = page.locator('.landing-footer__index-button');
  await expect(buttons).toHaveCount(15);

  const heights = await buttons.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().height),
  );
  for (const height of heights) {
    expect(height).toBeGreaterThanOrEqual(44);
  }

  // Enter membuka popup; fokus awal di tombol tutup.
  const indonesia = page.locator('.landing-footer__index-button[data-country="id"]');
  await indonesia.click();
  const dialog = page.locator('dialog.landing-dialog');
  await expect(dialog).toBeVisible();
  await expect(page.locator('.landing-dialog__close')).toBeFocused();
  await expect(dialog.locator('.landing-dialog__title')).toHaveText('Indonesia');

  // Esc menutup dan mengembalikan fokus ke pemicu.
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(indonesia).toBeFocused();

  // Aksi di dalam popup menuju halaman negara.
  await page.keyboard.press('Enter');
  await expect(dialog).toBeVisible();
  await page.locator('.landing-dialog__action').click();
  await expect(page).toHaveURL(/\/negara\/id$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Indonesia');

  expect(errors).toEqual([]);
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('tanpa pin, counter final, teks kunci terlihat di 5 posisi', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Counter langsung final, bukan 0.
    await expect(
      page.locator('.landing-scene--scale .landing-display__number'),
    ).toHaveText('15');

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

test('tanpa WebGL, peta SVG menampilkan 15 area yang bisa dipilih', async ({
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
  ).toHaveText('Asia Explorer');

  const fallback = page.locator('.landing-map--interactive');
  await expect(fallback).toBeVisible({ timeout: 15_000 });
  await expect(fallback.locator('[role="button"]')).toHaveCount(15);

  // Area peta juga keyboard-operable: fokus + Enter membuka popup.
  const area = fallback.locator('[role="button"]').first();
  await area.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.landing-dialog')).toBeVisible();

  await expectNoHorizontalScroll(page);
  expect(errors).toEqual([]);
});
