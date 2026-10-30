import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. Desktop - 3D mode
  const pageDesk = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageDesk.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await pageDesk.waitForTimeout(3000);
  await pageDesk.screenshot({ path: 'scratch/desktop_3d_mode.png' });

  // 2. Desktop - Switch to 2D mode
  const btn2D = pageDesk.locator('.map48-hud__mode-pill:has-text("2D")');
  await btn2D.click();
  await pageDesk.waitForTimeout(800);
  await pageDesk.screenshot({ path: 'scratch/desktop_2d_mode.png' });

  // 3. Desktop - Hover Japan in 2D mode
  const jpPath = pageDesk.locator('path[aria-label*="Jepang"]');
  await jpPath.hover({ force: true });
  await pageDesk.waitForTimeout(400);
  await pageDesk.screenshot({ path: 'scratch/desktop_2d_hover_japan.png' });

  // 4. Desktop - Click Japan to open drawer
  await jpPath.click({ force: true });
  await pageDesk.waitForTimeout(800);
  await pageDesk.screenshot({ path: 'scratch/desktop_2d_click_drawer.png' });

  // 5. Mobile - Switch to 2D mode on phone viewport (390 x 844)
  const pageMob = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await pageMob.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await pageMob.waitForTimeout(3000);
  
  const mob2D = pageMob.locator('.map48-hud__mode-pill:has-text("2D")');
  await mob2D.click();
  await pageMob.waitForTimeout(800);
  await pageMob.screenshot({ path: 'scratch/mobile_2d_mode.png' });

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch(console.error);
