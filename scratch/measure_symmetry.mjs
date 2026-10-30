import { chromium } from 'playwright';

async function measureContinentCenter(viewportWidth, viewportHeight) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: viewportWidth, height: viewportHeight } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const analysis = await page.evaluate(() => {
    const copy = document.querySelector('.landing-hero__copy');
    const copyRect = copy.getBoundingClientRect();

    // Take screenshot of canvas or inspect pixels
    const canvas = document.querySelector('.landing-hero__scene canvas');
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    const ctx = c.getContext('2d');
    ctx.drawImage(canvas, 0, 0);
    const data = ctx.getImageData(0, 0, c.width, c.height).data;

    let minX = c.width, maxX = 0;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const idx = (y * c.width + x) * 4;
        const alpha = data[idx + 3];
        // 3D meshes have non-zero alpha on transparent canvas
        if (alpha > 30) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }

    // Convert canvas coords (if canvas has different devicePixelRatio) to CSS pixels
    const dpr = window.devicePixelRatio || 1;
    const cssMinX = minX / dpr;
    const cssMaxX = maxX / dpr;
    const cssCenter = (cssMinX + cssMaxX) / 2;

    const leftColRight = copyRect.right;
    const rightEdge = window.innerWidth;
    const availableSpace = rightEdge - leftColRight;
    const targetMidpoint = leftColRight + availableSpace / 2;
    const distanceToLeftCol = cssMinX - leftColRight;
    const distanceToRightEdge = rightEdge - cssMaxX;

    return {
      windowWidth: window.innerWidth,
      leftColRight,
      rightEdge,
      availableSpace,
      targetMidpoint,
      continent: {
        minX: cssMinX,
        maxX: cssMaxX,
        width: cssMaxX - cssMinX,
        center: cssCenter,
        centerPercent: (cssCenter / window.innerWidth * 100).toFixed(1) + '%'
      },
      gapLeft: distanceToLeftCol,
      gapRight: distanceToRightEdge,
      symmetryDelta: distanceToRightEdge - distanceToLeftCol // if positive, gapRight > gapLeft (shifted left!)
    };
  });

  console.log(`Viewport ${viewportWidth}x${viewportHeight}:`, JSON.stringify(analysis, null, 2));
  await browser.close();
}

async function run() {
  await measureContinentCenter(1440, 900);
  await measureContinentCenter(1280, 800);
}

run().catch(console.error);

