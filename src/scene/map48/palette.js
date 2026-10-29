// deep import: landing tidak perlu ikut mengunduh seluruh three.js
import { Color } from 'three/src/math/Color.js';

/**
 * Palet Mineral 3D Benua Asia (Archival Mineral Palette):
 * - Asia Tenggara: Celadon / Giok Tropis (#2f6854 hover #3a8067)
 * - Asia Timur: Lacquer Cinnabar / Merah Kekaisaran (#8c3832 hover #a6423b)
 * - Asia Selatan: Saffron Terracotta / Rempah Purba (#94582b hover #ad6733)
 * - Asia Barat: Lapis Lazuli & Gurun Pasir (#465a73 hover #556d8c)
 * - Asia Tengah: Steppe Bronze / Perunggu Jalur Sutra (#665c3b hover #7d7048)
 * - Garis batas negara (borders): kontras tajam dengan opasitas dan garis halus yang jelas.
 */
export const PAPER = new Color('#f9f7f3');
export const PAPER_BRIGHT = new Color('#fffef9'); // tujuan hover highlight
export const INK = new Color('#14181f'); // garis batas kartografi kontras tajam & ring dekoratif
export const ACCENT = '#176b68'; // warna UI (string)

export const REGION_TONES = {
  'Southeast Asia': '#2f6854', // Celadon / Giok Tropis
  'East Asia': '#8c3832', // Lacquer Cinnabar / Merah Kekaisaran
  'South Asia': '#94582b', // Saffron Terracotta / Rempah Purba
  'West Asia': '#465a73', // Lapis Lazuli & Gurun Pasir
  'Central Asia': '#665c3b', // Steppe Bronze / Perunggu Jalur Sutra
  // Dukungan alias ID
  'Asia Tenggara': '#2f6854',
  'Asia Timur': '#8c3832',
  'Asia Selatan': '#94582b',
  'Asia Barat': '#465a73',
  'Asia Tengah': '#665c3b',
};

export const REGION_HOVER = {
  'Southeast Asia': '#3a8067',
  'East Asia': '#a6423b',
  'South Asia': '#ad6733',
  'West Asia': '#556d8c',
  'Central Asia': '#7d7048',
  // Dukungan alias ID
  'Asia Tenggara': '#3a8067',
  'Asia Timur': '#a6423b',
  'Asia Selatan': '#ad6733',
  'Asia Barat': '#556d8c',
  'Asia Tengah': '#7d7048',
};

/**
 * Versi "night" untuk landing gelap. Lightness + saturasi disesuaikan
 * menyala di latar #080d16.
 */
export const NIGHT_BG = '#080d16';

export const REGION_NIGHT = {
  'West Asia': '#5f7c9e',
  'Central Asia': '#8a7d51',
  'South Asia': '#bf743d',
  'Southeast Asia': '#418b71',
  'East Asia': '#bd4d45',
  'Asia Barat': '#5f7c9e',
  'Asia Tengah': '#8a7d51',
  'Asia Selatan': '#bf743d',
  'Asia Tenggara': '#418b71',
  'Asia Timur': '#bd4d45',
};

// Variasi halus per negara: hue/lightness nilaian deterministik dari kode ISO3,
// jadi negara dalam satu region satu keluarga warna tapi tidak identik.
function jitter(base, code, lightRange = 0.05) {
  const color = new Color(base);
  if (!code) return color;
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  color.offsetHSL(
    ((hash % 97) / 97 - 0.5) * 0.03,
    0,
    ((Math.floor(hash / 97) % 89) / 89 - 0.5) * lightRange,
  );
  return color;
}

export function countryColor(region, code) {
  return jitter(REGION_TONES[region] || '#665c3b', code);
}

/** Tone wilayah yang sama, tapi versi menyala untuk latar gelap. */
export function countryColorNight(region, code) {
  return jitter(REGION_NIGHT[region] || '#8a7d51', code);
}

/**
 * Versi "sun" untuk landing terang: tone pekat mineral berbobot.
 */
export const REGION_SUN = {
  'West Asia': '#3d4f66',
  'Central Asia': '#5c5233',
  'South Asia': '#854d24',
  'Southeast Asia': '#265746',
  'East Asia': '#7a2f2a',
  'Asia Barat': '#3d4f66',
  'Asia Tengah': '#5c5233',
  'Asia Selatan': '#854d24',
  'Asia Tenggara': '#265746',
  'Asia Timur': '#7a2f2a',
};

export function countryColorSun(region, code) {
  return jitter(REGION_SUN[region] || '#5c5233', code, 0.03);
}

export function hoverTint(base, region, code) {
  if (region && REGION_HOVER[region]) {
    return jitter(REGION_HOVER[region], code, 0.03);
  }
  return base.clone().lerp(PAPER_BRIGHT, 0.3);
}
