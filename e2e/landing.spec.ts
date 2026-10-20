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

/**
 * 15 negara dalam urutan `countries.json`; urutan ini juga urutan Tab di
 * daftar negara. Hard-code di sini supaya perubahan urutan data terdeteksi.
 */
const COUNTRY_IDS = [
  'id',
  'my',
  'sg',
  'th',
  'vn',
  'ph',
  'cn',
  'jp',
  'kr',
  'in',
  'sa',
  'tr',
  'kz',
  'uz',
  'mn',
] as const;

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

/** Scroll programatik + dua frame + jeda, supaya tween scrub sempat selesai. */
async function goToFraction(page: Page, fraction: number): Promise<void> {
  await page.evaluate((value) => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    window.scrollTo(0, Math.round(max * value));
  }, fraction);
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      }),
  );
  await page.waitForTimeout(400);
}

async function waitForScene(page: Page): Promise<void> {
  // Scene 1 dan 7 memakai satu modul; global debug ditulis ulang oleh mount
  // terakhir, jadi cukup menunggu salah satunya siap.
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
      await expect(
        page.getByRole('heading', { level: 1 }),
      ).toHaveText('Jelajahi Asia lewat bahasa aslinya');
      await waitForScene(page);

      // §0.8: tinggi total 920vh, bukan 1120vh.
      const height = await page.evaluate(() => {
        const vh = window.innerHeight;
        return { scrollHeight: document.documentElement.scrollHeight, vh };
      });
      expect(Math.abs(height.scrollHeight - height.vh * 9.2)).toBeLessThan(4);

      for (const fraction of FRACTIONS) {
        await goToFraction(page, fraction);
        await expectNoHorizontalScroll(page);

        const percent = String(Math.round(fraction * 100)).padStart(3, '0');
        await page.screenshot({
          path: `${SHOT_DIR}/landing-${viewport.width}x${viewport.height}-${percent}.png`,
        });
      }
    }

    expect(errors).toEqual([]);
  });
});

test('skip link, 15 tombol negara, dialog, dan navigasi', async ({ page }) => {
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

  // Target 44px (§0.6) diukur sebelum daftar muncul.
  const buttons = page.locator('.landing-country-list [data-country]');
  await expect(buttons).toHaveCount(15);

  const focusedIds: string[] = [];
  for (let index = 0; index < COUNTRY_IDS.length; index += 1) {
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => {
      const active = document.activeElement;
      return active instanceof HTMLElement
        ? (active.dataset.country ?? null)
        : null;
    });
    focusedIds.push(focused ?? 'bukan-tombol-negara');
  }
  expect(focusedIds).toEqual([...COUNTRY_IDS]);

  // Daftar muncul karena fokus ada di dalamnya, bukan karena class tambahan.
  const list = page.locator('.landing-country-list');
  await expect(list).toHaveCSS('opacity', '1');
  const heights = await buttons.evaluateAll((nodes) =>
    nodes.map((node) => node.getBoundingClientRect().height),
  );
  for (const height of heights) {
    expect(height).toBeGreaterThanOrEqual(44);
  }

  // Enter membuka popup; fokus awal di tombol tutup.
  const indonesia = page.locator('[data-country="id"]');
  await indonesia.focus();
  await page.keyboard.press('Enter');
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
    await expect(
      page.locator('.landing-scene--language .landing-display__number'),
    ).toHaveText('718');

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
            '.landing-display, .landing-hero__title',
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
  ).toHaveText('Jelajahi Asia lewat bahasa aslinya');

  const fallback = page.locator('.landing-map--interactive');
  await expect(fallback).toBeVisible();
  await expect(fallback.locator('[role="button"]')).toHaveCount(15);

  // Area peta juga keyboard-operable: fokus + Enter membuka popup.
  const area = fallback.locator('[role="button"]').first();
  await area.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('dialog.landing-dialog')).toBeVisible();

  await expectNoHorizontalScroll(page);
  expect(errors).toEqual([]);
});
