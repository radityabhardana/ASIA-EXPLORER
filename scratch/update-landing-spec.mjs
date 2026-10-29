import fs from 'fs';

let content = fs.readFileSync('e2e/landing.spec.ts', 'utf8');

// Normalize line breaks to \n for replacement
content = content.replace(/\r\n/g, '\n');

// 1. Update sceneCount from 5 to 2 and height check
content = content.replace(
  /expect\(height\.sceneCount\)\.toBe\(5\);\s*expect\(height\.scrollHeight\)\.toBeGreaterThanOrEqual\(\s*Math\.floor\(height\.vh \* 4\.4\),\s*\);/,
  'expect(height.sceneCount).toBe(2);\n      expect(height.scrollHeight).toBeGreaterThanOrEqual(\n        Math.floor(height.vh * 1.5),\n      );'
);

// 2. Remove markers check
content = content.replace(
  /\/\/ Check completion markers at 100% scroll \(footer visible\)\.[\s\S]*?expect\(markers\.penjelajahan\)\.toBe\(5\);\s*\}/,
  '// 48-nation streamlined architecture (Hero + Daily Challenge)'
);

// 3. Replace old mosaic test with modern 48-nation navigation test
const oldTestRegex = /test\('skip link, 15 kartu negara di mosaik, dan navigasi'[\s\S]*?expect\(errors\)\.toEqual\(\[\]\);\s*\}\);/;
const newTest = `test('skip link dan navigasi ekspedisi 48 negara', async ({ page }) => {
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

  await expect(page).toHaveURL(/\\/negara\\/id$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Indonesia');

  expect(errors).toEqual([]);
});`;

content = content.replace(oldTestRegex, newTest);

fs.writeFileSync('e2e/landing.spec.ts', content, 'utf8');
console.log('e2e/landing.spec.ts updated successfully!');
