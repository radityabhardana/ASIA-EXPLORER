import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const SHOT_DIR = 'docs/VERIFY_COUNTRY';

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1440, height: 900 },
] as const;

// `local` untuk `id` sengaja identik dengan `name`: hero menyembunyikan baris nama
// lokal saat ia hanya mengulang nama negara (dedup, commit aabbace), jadi baris itu
// justru di-assert tidak ada oleh loop di bawah. Nilai dipertahankan agar bentuk
// tabel seragam, bukan karena dipakai sebagai teks yang diharapkan.
const COUNTRIES = [
  { id: 'jp', name: 'Jepang', local: '日本', greeting: 'こんにちは' },
  { id: 'id', name: 'Indonesia', local: 'Indonesia', greeting: 'Selamat pagi' },
  { id: 'sa', name: 'Arab Saudi', local: 'المملكة العربية السعودية', greeting: 'السلام عليكم' },
  { id: 'mn', name: 'Mongolia', local: 'Монгол улс', greeting: 'Сайн байна уу?' },
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

for (const country of COUNTRIES) {
  test(`/negara/${country.id} utuh di 375, 768, 1440`, async ({ page }) => {
    test.setTimeout(60_000);
    const errors = collectErrors(page);

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      const response = await page.goto(`/negara/${country.id}`);
      expect(response?.status()).toBe(200);

      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(country.name);
      expect(await page.evaluate(() => window.scrollY)).toBe(0);

      const local = page.locator('.country-hero__local');
      if (country.local === country.name) {
        // Dedup (commit aabbace): `CountryHero` menyembunyikan `.country-hero__local`
        // bila nama lokal sama persis dengan nama negara (`id` hari ini); `h1` di atas
        // sudah menampilkan nama itu, jadi baris lokal tidak boleh dirender.
        await expect(local).toHaveCount(0);
      } else {
        await expect(local).toBeVisible();
        await expect(local).toHaveText(country.local);
      }

      const greeting = page.locator('.country-specimen__greeting');
      await greeting.scrollIntoViewIfNeeded();
      await expect(greeting).toBeVisible();
      await expect(greeting).toContainText(country.greeting);
      await expect(greeting).toBeInViewport();

      const widths = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        inner: window.innerWidth,
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.inner + 1);

      const overflowingText = await page.evaluate(() => {
        const nodes = Array.from(document.querySelectorAll<HTMLElement>('.country-native'));
        return nodes
          .map((node) => {
            const rect = node.getBoundingClientRect();
            return { text: node.textContent ?? '', left: rect.left, right: rect.right };
          })
          .filter((rect) => rect.left < -1 || rect.right > window.innerWidth + 1);
      });
      expect(overflowingText).toEqual([]);

      const noteWords = await page
        .locator('.country-specimen__register, .country-note__text')
        .evaluateAll((nodes) =>
          nodes.map((node) =>
            (node.textContent ?? '')
              .trim()
              .split(/\s+/)
              .filter((word) => word.length > 0)
              .length,
          ),
        );
      for (const words of noteWords) {
        expect(words).toBeLessThanOrEqual(45);
      }

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(150);

      const back = page.getByRole('link', { name: 'Kembali ke halaman utama' });
      await expect(back).toBeVisible();
      const backBox = await back.boundingBox();
      expect(backBox?.height ?? 0).toBeGreaterThanOrEqual(44);
      await page.screenshot({
        path: `${SHOT_DIR}/${country.id}-${viewport.width}x${viewport.height}.png`,
        fullPage: true,
      });
    }

    expect(errors).toEqual([]);
  });
}

test('navigasi kembali tetap terlihat dan menuju beranda', async ({ page }) => {
  const errors = collectErrors(page);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/negara/mn');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Mongolia');

  const back = page.getByRole('link', { name: 'Kembali ke halaman utama' });
  expect(await back.evaluate((node) => getComputedStyle(node).position)).toBe('fixed');
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(back).toBeInViewport();

  await back.click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    /Jelajahi 48 Bangsa|Asia Explorer/,
  );

  expect(errors).toEqual([]);
});

test('/negara/xx menampilkan negara tidak ditemukan tanpa error', async ({ page }) => {
  const errors = collectErrors(page);

  const response = await page.goto('/negara/xx');
  expect(response?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Negara tidak ditemukan');
  await expect(page.getByRole('link', { name: 'Kembali ke beranda' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('tombol audio hanya dirender bila voice bahasa tersedia', async ({ page }) => {
  const errors = collectErrors(page);

  await page.goto('/negara/jp');
  // getVoices() diisi asinkron oleh peramban; beri satu tick sebelum memeriksa.
  await page.waitForTimeout(400);

  const speech = await page.evaluate(() => {
    const supported =
      'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
    const voices = supported ? window.speechSynthesis.getVoices() : [];
    return { supported, langs: voices.map((voice) => voice.lang) };
  });

  const hasJapaneseVoice = speech.langs.some((lang) => lang.toLowerCase().startsWith('ja'));
  const button = page.getByRole('button', { name: /Dengarkan sapaan/ });

  if (speech.supported && hasJapaneseVoice) {
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  } else {
    await expect(button).toHaveCount(0);
  }

  const verdict = `speechSynthesis=${speech.supported} voices=${speech.langs.length} ja=${hasJapaneseVoice}`;
  console.log(`[audio] ${verdict}`);
  test.info().annotations.push({ type: 'audio-voice', description: verdict });

  expect(errors).toEqual([]);
});
