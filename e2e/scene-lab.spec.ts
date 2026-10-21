import { expect, test } from '@playwright/test';

/*
 * Bukti visual + fungsional scene 3D (lane L6).
 * Hanya dijalankan sekali (project desktop); ukuran viewport diatur eksplisit
 * supaya tiga screenshot punya ukuran yang diminta tanpa saling menimpa.
 */

const SETTLE = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

test.skip(({ isMobile }) => Boolean(isMobile), 'Screenshot memakai viewport eksplisit.');

test('lab scene: picking raycast, 15 negara, screenshot 3 ukuran', async ({ page }) => {
  test.setTimeout(90_000);
  const consoleErrors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    consoleErrors.push(error.message);
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/lab/scene');

  await page.waitForFunction(() => window.__asiakin_scene?.ready === true, null, {
    timeout: 45_000,
  });

  const countryCount = await page.evaluate(
    () => window.__asiakin_scene?.countryCount ?? -1,
  );
  expect(countryCount).toBe(15);

  const projected = await page.evaluate(
    () => window.__asiakin_scene?.projected('jp') ?? null,
  );
  expect(projected).not.toBeNull();
  if (!projected) {
    throw new Error('projected(jp) null');
  }
  expect(projected.x).toBeGreaterThan(0);
  expect(projected.x).toBeLessThan(1440);
  expect(projected.y).toBeGreaterThan(0);
  expect(projected.y).toBeLessThan(900);

  await page.mouse.click(projected.x, projected.y);
  await expect(page.getByTestId('scene-selection')).toHaveText('jp');

  await page.evaluate(SETTLE);
  const desktop = await page.screenshot({
    path: 'docs/VERIFY_SCENE/scene-1440x900.png',
  });
  expect(desktop.byteLength).toBeGreaterThan(10_000);

  await page.setViewportSize({ width: 768, height: 1024 });
  await page.evaluate(SETTLE);
  const tablet = await page.screenshot({
    path: 'docs/VERIFY_SCENE/scene-768x1024.png',
  });
  expect(tablet.byteLength).toBeGreaterThan(10_000);

  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(SETTLE);
  const mobile = await page.screenshot({
    path: 'docs/VERIFY_SCENE/scene-375x812.png',
  });
  expect(mobile.byteLength).toBeGreaterThan(10_000);

  expect(consoleErrors).toEqual([]);
});
