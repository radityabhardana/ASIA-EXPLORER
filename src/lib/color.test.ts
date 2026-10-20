import { describe, expect, it } from 'vitest';

import {
  contrastRatio,
  deltaE00,
  deltaE00Hex,
  hexToRgb,
  relativeLuminance,
} from './color';

describe('konversi warna', () => {
  it('memecah hex menjadi kanal 0..255', () => {
    expect(hexToRgb('#1A1F24')).toEqual({ r: 26, g: 31, b: 36 });
    expect(hexToRgb('f9f7f3')).toEqual({ r: 249, g: 247, b: 243 });
  });

  it('menolak hex yang tidak valid', () => {
    expect(() => hexToRgb('#12345')).toThrow();
    expect(() => hexToRgb('bukan-warna')).toThrow();
  });

  it('relative luminance ekstrem: hitam 0, putih 1', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBe(1);
  });

  it('relative luminance ink #1A1F24 sesuai hitungan manual', () => {
    // r=26/255 -> 0.010330, g=31/255 -> 0.013702, b=36/255 -> 0.017642
    // 0.2126*0.010330 + 0.7152*0.013702 + 0.0722*0.017642 = 0.013270
    expect(relativeLuminance('#1A1F24')).toBeCloseTo(0.01327, 5);
  });

  it('rasio kontras ink di surface', () => {
    // (0.931394 + 0.05) / (0.013270 + 0.05) = 15.510
    expect(contrastRatio('#1A1F24', '#F9F7F3')).toBeCloseTo(15.51, 2);
  });

  it('rasio kontras simetris dan minimal 1', () => {
    const ratio = contrastRatio('#176B68', '#F9F7F3');
    expect(contrastRatio('#F9F7F3', '#176B68')).toBeCloseTo(ratio, 10);
    expect(ratio).toBeGreaterThanOrEqual(1);
  });
});

describe('CIEDE2000', () => {
  // Data referensi Sharma, Wu & Dalal (2005) — dipakai sebagai patokan resmi
  // rumus CIEDE2000, dihitung manual di luar implementasi ini.
  it('pasangan referensi 1 = 2.0425', () => {
    const first = { L: 50, a: 2.6772, b: -79.7751 };
    const second = { L: 50, a: 0, b: -82.7485 };
    expect(deltaE00(first, second)).toBeCloseTo(2.0425, 4);
  });

  it('pasangan referensi 2 = 2.8615', () => {
    const first = { L: 50, a: 3.1571, b: -77.2803 };
    const second = { L: 50, a: 0, b: -82.7485 };
    expect(deltaE00(first, second)).toBeCloseTo(2.8615, 4);
  });

  it('hitam vs putih = 100', () => {
    // Nilai terukur 100.00000386666865 — pembulatan floating point, bukan galat rumus.
    expect(deltaE00Hex('#000000', '#FFFFFF')).toBeCloseTo(100, 3);
  });

  it('warna identik = 0', () => {
    expect(deltaE00Hex('#C97A5F', '#C97A5F')).toBe(0);
  });
});
