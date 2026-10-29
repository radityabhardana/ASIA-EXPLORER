import { chromium } from 'playwright';
import path from 'path';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const filePath = 'file:///C:/Users/rexna/.gemini/antigravity/brain/24834c64-0c27-4174-81fa-6c895b597e9d/.user_uploaded/media_1793241053614_72a6180a.png';
  
  await page.goto(filePath);
  const res = await page.evaluate(() => {
    const img = document.querySelector('img');
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;

    let minX = c.width, maxX = 0;
    let minY = c.height, maxY = 0;
    // Sample pixels in continent region
    for (let y = 150; y < c.height - 150; y++) {
      for (let x = 400; x < c.width - 20; x++) {
        const idx = (y * c.width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        if (r < 220 && g < 220 && b < 220) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Also find where the text on the left ends:
    // Search bar, buttons etc. end around x = 450 - 520
    let textMaxX = 0;
    for (let y = 350; y < 550; y++) {
      for (let x = 400; x < 600; x++) {
        const idx = (y * c.width + x) * 4;
        const r = data[idx], g = data[idx + 1], b = data[idx + 2];
        // Look for buttons border or text
        if (r < 200 || g < 200 || b < 200) {
          if (x > textMaxX && x < 520) textMaxX = x;
        }
      }
    }

    return {
      imageWidth: c.width,
      imageHeight: c.height,
      continentMinX: minX,
      continentMaxX: maxX,
      continentWidth: maxX - minX,
      continentCenter: (minX + maxX) / 2,
      continentCenterPercent: ((minX + maxX) / 2 / c.width * 100).toFixed(1) + '%',
      distanceFromTextCol: minX - 485,
      distanceFromRightEdge: c.width - maxX,
    };
  });

  console.log('User image analysis:', res);
  await browser.close();
}

run().catch(console.error);
