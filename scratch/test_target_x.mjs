import { chromium } from 'playwright';

async function testTargetX(targetXValues) {
  const browser = await chromium.launch();
  
  for (const tX of targetXValues) {
    const page = await browser.newPage({ viewport: { width: 1024, height: 602 } });
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Evaluate in page: modify camera targetX and check pixel positions
    const res = await page.evaluate((val) => {
      // Find the copy right edge
      const copy = document.querySelector('.landing-hero__copy');
      const copyRect = copy.getBoundingClientRect();

      return {
        copyRight: copyRect.right,
      };
    }, tX);

    await page.screenshot({ path: `scratch/test_1024_current.png` });
    console.log(`Current on 1024x602: copyRight=${res.copyRight}`);
    break;
  }

  await browser.close();
}

testTargetX([-16]).catch(console.error);
