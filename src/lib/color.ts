/*
 * Matematika warna — dipakai `scripts/check-contrast.mjs` dan unit test.
 * Tidak ada dependency; rumus mengikuti WCAG 2.1 dan CIEDE2000 (Sharma et al.,
 * "The CIEDE2000 Color-Difference Formula", 2005).
 */

export type Rgb = { r: number; g: number; b: number };
export type Lab = { L: number; a: number; b: number };

const D65 = { x: 0.95047, y: 1, z: 1.08883 } as const;
const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

const HEX_PATTERN = /^#?([0-9a-f]{6})$/i;

/** `#RRGGBB` atau `RRGGBB` -> kanal 0..255. Melempar untuk nilai tidak valid. */
export function hexToRgb(hex: string): Rgb {
  const match = HEX_PATTERN.exec(hex.trim());
  if (!match?.[1]) {
    throw new Error(`warna hex tidak valid: ${JSON.stringify(hex)}`);
  }
  const value = match[1];
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

/** Kanal sRGB 0..255 -> linear 0..1 (WCAG 2.1, langkah 2). */
export function srgbToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

/** Relative luminance WCAG 2.1 (0 untuk hitam, 1 untuk putih). */
export function relativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * srgbToLinear(r) +
    0.7152 * srgbToLinear(g) +
    0.0722 * srgbToLinear(b)
  );
}

/** Rasio kontras WCAG 2.1, selalu >= 1. */
export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

/** sRGB (D65) -> CIELAB. */
export function rgbToLab({ r, g, b }: Rgb): Lab {
  const lr = srgbToLinear(r);
  const lg = srgbToLinear(g);
  const lb = srgbToLinear(b);

  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = 0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb;

  const fx = labF(x / D65.x);
  const fy = labF(y / D65.y);
  const fz = labF(z / D65.z);

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

function labF(value: number): number {
  return value > EPSILON ? Math.cbrt(value) : (KAPPA * value + 16) / 116;
}

export function hexToLab(hex: string): Lab {
  return rgbToLab(hexToRgb(hex));
}

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

function hueAngle(lab: Lab): number {
  if (lab.a === 0 && lab.b === 0) {
    return 0;
  }
  const angle = Math.atan2(lab.b, lab.a) * DEG;
  return angle >= 0 ? angle : angle + 360;
}

/** CIEDE2000 antara dua warna LAB. */
export function deltaE00(first: Lab, second: Lab): number {
  const { L: l1, a: a1, b: b1 } = first;
  const { L: l2, a: a2, b: b2 } = second;

  const c1 = Math.hypot(a1, b1);
  const c2 = Math.hypot(a2, b2);
  const cBar = (c1 + c2) / 2;
  const cBarPow7 = cBar ** 7;
  const g =
    0.5 * (1 - Math.sqrt(cBarPow7 / (cBarPow7 + 25 ** 7)));

  const a1p = a1 * (1 + g);
  const a2p = a2 * (1 + g);
  const c1p = Math.hypot(a1p, b1);
  const c2p = Math.hypot(a2p, b2);

  const h1p = hueAngle({ L: l1, a: a1p, b: b1 });
  const h2p = hueAngle({ L: l2, a: a2p, b: b2 });

  const deltaLp = l2 - l1;
  const deltaCp = c2p - c1p;

  let deltaHp = 0;
  if (c1p * c2p !== 0) {
    const rawHue = h2p - h1p;
    if (rawHue > 180) {
      deltaHp = rawHue - 360;
    } else if (rawHue < -180) {
      deltaHp = rawHue + 360;
    } else {
      deltaHp = rawHue;
    }
  }
  const deltaBigHp = 2 * Math.sqrt(c1p * c2p) * Math.sin((deltaHp * RAD) / 2);

  const lBarP = (l1 + l2) / 2;
  const cBarP = (c1p + c2p) / 2;

  let hBarP = 0;
  if (c1p * c2p !== 0) {
    const sum = h1p + h2p;
    if (Math.abs(h1p - h2p) <= 180) {
      hBarP = sum / 2;
    } else if (sum < 360) {
      hBarP = (sum + 360) / 2;
    } else {
      hBarP = (sum - 360) / 2;
    }
  }

  const t =
    1 -
    0.17 * Math.cos((hBarP - 30) * RAD) +
    0.24 * Math.cos(2 * hBarP * RAD) +
    0.32 * Math.cos((3 * hBarP + 6) * RAD) -
    0.2 * Math.cos((4 * hBarP - 63) * RAD);

  const deltaTheta = 30 * Math.exp(-(((hBarP - 275) / 25) ** 2));
  const rc = 2 * Math.sqrt(cBarP ** 7 / (cBarP ** 7 + 25 ** 7));

  const lBarMinus50Sq = (lBarP - 50) ** 2;
  const sl = 1 + (0.015 * lBarMinus50Sq) / Math.sqrt(20 + lBarMinus50Sq);
  const sc = 1 + 0.045 * cBarP;
  const sh = 1 + 0.015 * cBarP * t;
  const rt = -Math.sin(2 * deltaTheta * RAD) * rc;

  const lTerm = deltaLp / sl;
  const cTerm = deltaCp / sc;
  const hTerm = deltaBigHp / sh;

  return Math.sqrt(lTerm ** 2 + cTerm ** 2 + hTerm ** 2 + rt * cTerm * hTerm);
}

/** CIEDE2000 antara dua warna hex. */
export function deltaE00Hex(first: string, second: string): number {
  return deltaE00(hexToLab(first), hexToLab(second));
}
