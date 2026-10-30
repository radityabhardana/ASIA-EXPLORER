import type { StoryPanel } from './StoryPhase';

export interface RenderedSpread {
  url: string;
  title: string;
  place: string;
}

const ACCENT_COLORS: Record<string, { primary: string; light: string; border: string }> = {
  kenali:  { primary: '#176b68', light: 'rgba(23, 107, 104, 0.08)', border: 'rgba(23, 107, 104, 0.28)' },
  budaya:  { primary: '#a6442e', light: 'rgba(166, 68, 46, 0.08)',  border: 'rgba(166, 68, 46, 0.28)' },
  bahasa:  { primary: '#a3722e', light: 'rgba(163, 114, 46, 0.08)', border: 'rgba(163, 114, 46, 0.28)' },
  kuliner: { primary: '#3d734e', light: 'rgba(61, 115, 78, 0.08)',  border: 'rgba(61, 115, 78, 0.28)' },
};

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  lineHeight: number,
  maxLines = 12
): { lines: string[]; height: number } {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }
    const words = para.split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
        if (lines.length >= maxLines - 1) break;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
  }

  return { lines, height: lines.length * lineHeight };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

/**
 * Renders an authentic Meng To sketchbook open spread.
 * Canvas size: 1760x1240 with transparent margins matching --pg: 21.8% and --span: 0.449.
 * Outer stacked paper block, physical spine crease, stitching, warm watercolor paper,
 * left watercolor artwork plate, and right editorial typography.
 */
export async function renderStorySpread(
  panel: StoryPanel,
  index: number,
  total: number,
  countryName: string,
  photoUrl: string
): Promise<string> {
  const W = 1760;
  const H = 1240;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Ensure fonts are ready
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Continue if fonts check is unavailable
    }
  }

  // Clear background to 100% transparent (book floats realistically on desk)
  ctx.clearRect(0, 0, W, H);

  // Exact Meng To sketchbook geometry
  const top = 265;
  const bottom = 975;
  const left = 85;
  const right = 1675;
  const bookW = right - left; // 1590
  const bookH = bottom - top; // 710
  const midX = W / 2;         // 880
  const cornerR = 26;

  // ── 1. Physical 3D paper stack / notebook edges ────────────────────────────
  // Darkest backing cover rim
  ctx.fillStyle = 'rgba(78, 62, 42, 0.28)';
  roundRectPath(ctx, left - 7, top + 5, bookW + 14, bookH + 4, cornerR + 3);
  ctx.fill();

  // Stacked paper block edges (multiple sheets visible underneath)
  ctx.fillStyle = 'rgba(218, 206, 188, 0.70)';
  roundRectPath(ctx, left - 4, top + 3, bookW + 8, bookH + 2, cornerR + 1);
  ctx.fill();

  ctx.fillStyle = 'rgba(235, 226, 212, 0.88)';
  roundRectPath(ctx, left - 2, top + 1.5, bookW + 4, bookH + 1, cornerR);
  ctx.fill();

  // ── 2. Main Open Book Pages ────────────────────────────────────────────────
  ctx.save();
  roundRectPath(ctx, left, top, bookW, bookH, cornerR);
  ctx.clip();

  // Base warm watercolor paper tone
  const paperGrad = ctx.createLinearGradient(left, top, right, bottom);
  paperGrad.addColorStop(0, '#faf6ee');
  paperGrad.addColorStop(0.5, '#fdfbf7');
  paperGrad.addColorStop(1, '#f7f2e7');
  ctx.fillStyle = paperGrad;
  ctx.fillRect(left, top, bookW, bookH);

  // Organic aging vignette on paper edges
  const edgeVignette = ctx.createRadialGradient(midX, (top + bottom) / 2, 220, midX, (top + bottom) / 2, 850);
  edgeVignette.addColorStop(0, 'rgba(255, 255, 255, 0.42)');
  edgeVignette.addColorStop(0.7, 'rgba(240, 230, 215, 0.12)');
  edgeVignette.addColorStop(1, 'rgba(195, 175, 145, 0.32)');
  ctx.fillStyle = edgeVignette;
  ctx.fillRect(left, top, bookW, bookH);

  // Spine gutter depth (authentic center 3D crease)
  const spineGrad = ctx.createLinearGradient(midX - 55, 0, midX + 55, 0);
  spineGrad.addColorStop(0, 'rgba(45, 32, 16, 0)');
  spineGrad.addColorStop(0.3, 'rgba(45, 32, 16, 0.08)');
  spineGrad.addColorStop(0.48, 'rgba(35, 24, 12, 0.28)');
  spineGrad.addColorStop(0.5, 'rgba(28, 18, 8, 0.35)');
  spineGrad.addColorStop(0.52, 'rgba(35, 24, 12, 0.28)');
  spineGrad.addColorStop(0.7, 'rgba(45, 32, 16, 0.08)');
  spineGrad.addColorStop(1, 'rgba(45, 32, 16, 0)');
  ctx.fillStyle = spineGrad;
  ctx.fillRect(midX - 55, top, 110, bookH);

  // Center binding stitch line
  ctx.strokeStyle = 'rgba(75, 55, 35, 0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(midX, top + 15);
  ctx.lineTo(midX, bottom - 15);
  ctx.stroke();

  // Needle stitch punctures down the spine
  ctx.fillStyle = 'rgba(60, 42, 22, 0.55)';
  for (let sy = top + 45; sy < bottom - 30; sy += 48) {
    ctx.beginPath();
    ctx.arc(midX, sy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── LEFT PAGE: Watercolor Illustration Plate ───────────────────────────────
  const plLeft = left + 45;
  const plTop = top + 42;
  const plW = midX - left - 85;
  const plH = bookH - 84;

  const artX = plLeft + 15;
  const artY = plTop + 12;
  const artW = plW - 30;
  const artH = plH - 96;

  // Draw Artwork Plate
  try {
    const photo = await loadImage(photoUrl);
    ctx.save();
    roundRectPath(ctx, artX, artY, artW, artH, 10);
    ctx.clip();

    // Cover aspect-ratio math
    const imgAspect = photo.naturalWidth / photo.naturalHeight;
    const boxAspect = artW / artH;
    let sx = 0, sy = 0, sw = photo.naturalWidth, sh = photo.naturalHeight;
    if (imgAspect > boxAspect) {
      sw = photo.naturalHeight * boxAspect;
      sx = (photo.naturalWidth - sw) / 2;
    } else {
      sh = photo.naturalWidth / boxAspect;
      sy = (photo.naturalHeight - sh) / 2;
    }

    ctx.drawImage(photo, sx, sy, sw, sh, artX, artY, artW, artH);

    // Warm sepia & watercolor vignette wash over photo
    const vig = ctx.createRadialGradient(
      artX + artW / 2,
      artY + artH / 2,
      artW * 0.28,
      artX + artW / 2,
      artY + artH / 2,
      artW * 0.72
    );
    vig.addColorStop(0, 'rgba(240, 230, 212, 0.02)');
    vig.addColorStop(0.7, 'rgba(45, 36, 26, 0.16)');
    vig.addColorStop(1, 'rgba(32, 22, 14, 0.45)');
    ctx.fillStyle = vig;
    ctx.fillRect(artX, artY, artW, artH);

    ctx.restore();

    // Delicate artistic border around plate
    ctx.strokeStyle = 'rgba(70, 52, 32, 0.18)';
    ctx.lineWidth = 1;
    roundRectPath(ctx, artX, artY, artW, artH, 10);
    ctx.stroke();
  } catch {
    // Fallback sketch plate
    ctx.fillStyle = '#dfd5c4';
    roundRectPath(ctx, artX, artY, artW, artH, 10);
    ctx.fill();
  }

  // Artistic Plate Caption underneath
  ctx.font = 'italic 20px "Instrument Serif", "Newsreader", "Crimson Pro", Georgia, serif';
  ctx.fillStyle = '#6b533b';
  ctx.textAlign = 'center';
  ctx.fillText(
    `Plate ${(index + 1).toString().padStart(2, '0')} · ${panel.title} · ${countryName}`,
    plLeft + plW / 2,
    plTop + plH - 45
  );

  ctx.font = '600 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2px';
  ctx.fillStyle = '#9b846e';
  ctx.fillText('SKETCHBOOK FIELD NOTES · ARCHIVES OF ASIA', plLeft + plW / 2, plTop + plH - 22);
  ctx.letterSpacing = '0px';

  // ── RIGHT PAGE: Editorial Typography ───────────────────────────────────────
  const prLeft = midX + 65;
  const prTop = top + 52;
  const prW = right - midX - 110;

  const accent = ACCENT_COLORS[panel.backgroundVariant] ?? ACCENT_COLORS.kenali!;

  // 1. Eyebrow Tag Pill
  ctx.font = '700 12px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '2.5px';
  ctx.fillStyle = accent.primary;
  ctx.textAlign = 'left';
  ctx.fillText(`${countryName.toUpperCase()} · LEMBAR ${(index + 1).toString().padStart(2, '0')} / ${total.toString().padStart(2, '0')}`, prLeft, prTop + 10);
  ctx.letterSpacing = '0px';

  // 2. Headline in Instrument Serif
  ctx.font = '400 46px "Instrument Serif", "Newsreader", "Crimson Pro", Georgia, serif';
  ctx.fillStyle = '#22180e';
  const titleWrap = wrapText(ctx, panel.title, prW, 48, 2);
  let curY = prTop + 56;
  for (const line of titleWrap.lines) {
    ctx.fillText(line, prLeft, curY);
    curY += 48;
  }
  curY += 8;

  // 3. Delicate Divider Line
  ctx.strokeStyle = accent.primary;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(prLeft, curY);
  ctx.lineTo(prLeft + 140, curY);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(75, 55, 35, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(prLeft + 150, curY);
  ctx.lineTo(prLeft + prW, curY);
  ctx.stroke();
  curY += 34;

  // 4. Story Body in Newsreader
  ctx.font = '400 21px "Newsreader", "Source Sans 3", Georgia, serif';
  ctx.fillStyle = '#2e2318';
  const bodyWrap = wrapText(ctx, panel.body, prW, 31, 8);
  for (const line of bodyWrap.lines) {
    ctx.fillText(line, prLeft, curY);
    curY += 31;
  }
  curY += 22;

  // 5. "Tahukah Kamu?" Field Notes Callout Box
  const cardY = Math.max(curY, prTop + 375);
  const cardH = 135;
  roundRectPath(ctx, prLeft, cardY, prW, cardH, 8);
  ctx.fillStyle = 'rgba(238, 230, 215, 0.65)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(150, 120, 85, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.font = '700 13px system-ui, -apple-system, sans-serif';
  ctx.letterSpacing = '1.5px';
  ctx.fillStyle = accent.primary;
  ctx.fillText(`✦ ${panel.funFactLabel.toUpperCase()}`, prLeft + 18, cardY + 28);
  ctx.letterSpacing = '0px';

  ctx.font = 'italic 18px "Newsreader", "Crimson Pro", Georgia, serif';
  ctx.fillStyle = '#443220';
  const ffWrap = wrapText(ctx, panel.funFact, prW - 36, 25, 3);
  let ffLineY = cardY + 56;
  for (const line of ffWrap.lines) {
    ctx.fillText(line, prLeft + 18, ffLineY);
    ffLineY += 25;
  }

  // 6. Authentic Red Vermillion Chop/Seal (印) & Date Stamp
  const sealX = right - 110;
  const sealY = bottom - 95;
  roundRectPath(ctx, sealX, sealY, 44, 44, 6);
  ctx.fillStyle = '#a63426';
  ctx.fill();
  ctx.strokeStyle = '#852418';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.font = 'bold 18px "Instrument Serif", Georgia, serif';
  ctx.fillStyle = '#fcefe8';
  ctx.textAlign = 'center';
  ctx.fillText('亞', sealX + 22, sealY + 26);
  ctx.font = '600 8px system-ui, sans-serif';
  ctx.fillText('ASIA', sealX + 22, sealY + 37);

  // Date Stamp
  ctx.font = '500 13px system-ui, sans-serif';
  ctx.fillStyle = '#8c7660';
  ctx.textAlign = 'right';
  ctx.fillText('OCT 2026', sealX - 14, sealY + 28);

  ctx.restore(); // Restore book clip

  return new Promise<string>((resolve) => {
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          resolve(canvas.toDataURL('image/webp', 0.92));
          return;
        }
        const url = URL.createObjectURL(blob);
        try {
          const img = new Image();
          img.src = url;
          await img.decode();
        } catch {
          // ignore decode errors if browser handles it on-the-fly
        }
        resolve(url);
      },
      'image/webp',
      0.92
    );
  });
}
