import { chromium } from 'playwright';

async function testScene3() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Scroll to #kawasan
  const section = page.locator('#kawasan');
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);

  // Screenshot default (Asia Tenggara active)
  await page.screenshot({ path: 'scratch/scene3_sea.png' });
  console.log('Saved scratch/scene3_sea.png');

  // Click Asia Timur tab
  await page.locator('.region-expedition__tab-btn:has-text("Asia Timur")').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/scene3_east_asia.png' });
  console.log('Saved scratch/scene3_east_asia.png');

  // Click Asia Barat tab
  await page.locator('.region-expedition__tab-btn:has-text("Asia Barat")').click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'scratch/scene3_west_asia.png' });
  console.log('Saved scratch/scene3_west_asia.png');

  // Click one of the cards (Turki) to test drawer opening!
  const trCard = page.locator('.region-card:has-text("Turki")');
  console.log('Turki card count:', await trCard.count());
  await trCard.click();
  await page.waitForTimeout(800);
  
  const drawerCount = await page.locator('.country-preview').count();
  console.log('Drawer count after clicking card:', drawerCount);
  await page.screenshot({ path: 'scratch/scene3_drawer_opened.png' });

  await browser.close();
  console.log('Scene 3 tests completed successfully!');
}

testScene3().catch(console.error);

