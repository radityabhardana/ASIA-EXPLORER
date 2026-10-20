import { expect, test } from '@playwright/test';

test('halaman awal tampil tanpa error konsol', async ({ page }) => {
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  const response = await page.goto('/');

  expect(response?.ok()).toBe(true);
  await expect(page.locator('#app-root')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});
