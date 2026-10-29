// deep import: landing tidak perlu ikut mengunduh seluruh three.js
import { Color } from 'three/src/math/Color.js'

/**
 * Palet editorial: kertas ivory hangat + tinta + lima tone wilayah.
 * Nilai tone dipilih supaya tiap wilayah kontras >= 3:1 terhadap kertas
 * dan jarak antar wilayah >= 25 deltaE (CIE76), jadi kebaca di peta 3D
 * maupun atlas 2D. Hue tetap keluarga bumi: bata, amber, mauve, sage, slate.
 */
export const PAPER = new Color('#F9F7F3')
export const PAPER_BRIGHT = new Color('#FFFFFF') // tujuan hover highlight
export const INK = new Color('#1A1917')          // garis negara & ring dekoratif
export const ACCENT = '#C85A32'                  // warna UI (string)

export const REGION_TONES = {
  'West Asia': '#96503a',      // bata
  'Central Asia': '#a17818',   // amber tua
  'South Asia': '#9f6577',     // mauve
  'Southeast Asia': '#648559', // sage
  'East Asia': '#5a7899',      // slate
}

/**
 * Versi "night" untuk landing gelap. Hue tetap keluarga yang sama
 * (bata/amber/mauve/sage/slate) tapi lightness + saturasi dinaikkan supaya
 * menyala di latar #080d16: kontras minimum 6.6:1, deltaE antar wilayah >= 26.
 */
export const NIGHT_BG = '#080d16'

export const REGION_NIGHT = {
  'West Asia': '#d2846c',
  'Central Asia': '#f4c046',
  'South Asia': '#bc8999',
  'Southeast Asia': '#94b689',
  'East Asia': '#84a0be',
}

// Variasi halus per negara: hue/lightness nilaian deterministik dari kode ISO3,
// jadi negara dalam satu region satu keluarga warna tapi tidak identik.
function jitter(base, code, lightRange = 0.07) {
  const color = new Color(base)
  let hash = 0
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0
  // jitter dijaga kecil: kalau terlalu lebar, tone amber/sage bisa luntur ke warna kertas
  color.offsetHSL(((hash % 97) / 97 - 0.5) * 0.04, 0, ((Math.floor(hash / 97) % 89) / 89 - 0.5) * lightRange)
  return color
}

export function countryColor(region, code) {
  return jitter(REGION_TONES[region] || '#b3a98f', code)
}

/** Tone wilayah yang sama, tapi versi menyala untuk latar gelap. */
export function countryColorNight(region, code) {
  return jitter(REGION_NIGHT[region] || '#b3a98f', code)
}

/**
 * Versi "sun" untuk landing terang (latar krem #fff6e6): tone lebih pekat
 * supaya kontras fill >= 3.25:1 dan deltaE antar wilayah >= 39.
 */
export const REGION_SUN = {
  'West Asia': '#c93f26',
  'Central Asia': '#b06f00',
  'South Asia': '#b02b62',
  'Southeast Asia': '#177a4b',
  'East Asia': '#1f55ad',
}

export function countryColorSun(region, code) {
  // jitter lightness dipersempit: tone pekat tidak boleh naik ke arah krem
  return jitter(REGION_SUN[region] || '#8a7c66', code, 0.03)
}

export function hoverTint(base) {
  return base.clone().lerp(PAPER_BRIGHT, 0.3)
}
