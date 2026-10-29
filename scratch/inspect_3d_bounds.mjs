import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  const bounds = await page.evaluate(() => {
    // Check if THREE canvas has any way to project, or sample pixel colors
    const canvas = document.querySelector('.landing-hero__scene canvas');
    if (!canvas) return { error: 'No canvas' };

    const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    // We can also find screen coordinates of country labels or sample pixel data!
    const labels = Array.from(document.querySelectorAll('.map48-label, [data-iso3]'));
    
    // Let's inspect canvas width / height
    const rect = canvas.getBoundingClientRect();
    
    return {
      canvasRect: { left: rect.left, width: rect.width, right: rect.right },
      labelsCount: labels.length,
      labelPositions: labels.map(l => {
        const r = l.getBoundingClientRect();
        return { text: l.textContent, left: r.left, top: r.top };
      })
    };
  });

  console.log('Canvas & labels:', JSON.stringify(bounds, null, 2));
  await browser.close();
}

run().catch(console.error);

