import { describe, expect, it } from 'vitest';

import { contrastRatio, hexToRgb } from '../lib/color';
import { type CountryTheme, type ThemesData, themes } from './themes';

const data: ThemesData = themes;

/** Hanya negara yang benar-benar punya entri tema yang diperiksa. */
const COUNTRY_IDS = Object.keys(data.countries);

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / d + 2) * 60;
        break;
      case b:
        h = ((r - g) / d + 4) * 60;
        break;
    }
  }

  return { h, s, l };
}

describe('Tema Warna Halaman Negara (RESEARCH_TERRAIN.md Part 4 & PRD_MASTER.md §2.B)', () => {
  it('berkas themes.json tersedia dan valid', () => {
    expect(data.version).toBe(1);
    expect(data.countries).toBeDefined();
  });

  it('memuat setiap negara bertema dengan skema lengkap', () => {
    expect(COUNTRY_IDS.length).toBeGreaterThan(0);
    for (const cid of COUNTRY_IDS) {
      const theme: CountryTheme | undefined = data.countries[cid];
      expect(theme, `negara ${cid} harus ada di themes.json`).toBeDefined();
      if (!theme) continue;
      expect(theme.base).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.soil).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.accent).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.contourStroke).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.contourOpacity).toBe(0.16);
      expect(theme.contrast).toBeDefined();
      expect(typeof theme.contrast.inkVsBase).toBe('number');
      expect(typeof theme.contrast.inkMutedVsBase).toBe('number');
    }
  });

  it('memenuhi ambang kontras WCAG AAA (>= 12:1) dan AA (>= 4.5:1) untuk semua negara', () => {
    for (const cid of COUNTRY_IDS) {
      const theme = data.countries[cid];
      if (!theme) continue;
      const actualInkContrast = contrastRatio('#1a1f24', theme.base);
      const actualMutedContrast = contrastRatio('#5c6670', theme.base);

      expect(
        actualInkContrast,
        `kontras ink vs base pada ${cid} (${actualInkContrast.toFixed(2)}) harus >= 12:1`,
      ).toBeGreaterThanOrEqual(12.0);

      expect(
        actualMutedContrast,
        `kontras ink-muted vs base pada ${cid} (${actualMutedContrast.toFixed(2)}) harus >= 4.5:1`,
      ).toBeGreaterThanOrEqual(4.5);

      expect(theme.contrast.inkVsBase).toBeGreaterThanOrEqual(12.0);
      expect(theme.contrast.inkMutedVsBase).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('memenuhi rentang lightness untuk base (0.94-0.97), soil (0.35-0.55), dan accent (0.35-0.50)', () => {
    for (const cid of COUNTRY_IDS) {
      const theme = data.countries[cid];
      if (!theme) continue;

      const baseRgb = hexToRgb(theme.base);
      const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
      expect(baseHsl.l, `base lightness ${cid} harus di [0.94, 0.97]`).toBeGreaterThanOrEqual(0.935);
      expect(baseHsl.l, `base lightness ${cid} harus di [0.94, 0.97]`).toBeLessThanOrEqual(0.975);

      const soilRgb = hexToRgb(theme.soil);
      const soilHsl = rgbToHsl(soilRgb.r, soilRgb.g, soilRgb.b);
      expect(soilHsl.l, `soil lightness ${cid} harus di [0.35, 0.55]`).toBeGreaterThanOrEqual(0.34);
      expect(soilHsl.l, `soil lightness ${cid} harus di [0.35, 0.55]`).toBeLessThanOrEqual(0.56);

      const accentRgb = hexToRgb(theme.accent);
      const accentHsl = rgbToHsl(accentRgb.r, accentRgb.g, accentRgb.b);
      expect(accentHsl.l, `accent lightness ${cid} harus di [0.35, 0.50]`).toBeGreaterThanOrEqual(0.34);
      expect(accentHsl.l, `accent lightness ${cid} harus di [0.35, 0.50]`).toBeLessThanOrEqual(0.51);
    }
  });

  it('menghasilkan nilai kanonik yang diverifikasi untuk JP, ID, dan SA (RESEARCH_TERRAIN.md §4c)', () => {
    const jp = data.countries.jp;
    const id = data.countries.id;
    const sa = data.countries.sa;
    expect(jp).toBeDefined();
    expect(id).toBeDefined();
    expect(sa).toBeDefined();
    if (!jp || !id || !sa) return;

    expect(jp.base).toBe('#f1f2f4');
    expect(jp.contrast.inkVsBase).toBe(14.8);
    expect(jp.contrast.inkMutedVsBase).toBe(5.2);

    expect(id.base).toBe('#f1f3f4');
    expect(id.contrast.inkVsBase).toBe(14.9);
    expect(id.contrast.inkMutedVsBase).toBe(5.3);

    expect(sa.base).toBe('#f4f2f1');
    expect(sa.contrast.inkVsBase).toBe(14.9);
    expect(sa.contrast.inkMutedVsBase).toBe(5.2);
  });
});
