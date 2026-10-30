/**
 * Utilitas Geodesi & Koordinat Kartografi (FŪDO-inspired Geodetic Transit Engine).
 * Menghitung koordinat derajat-menit-detik (DMS), jarak lingkaran besar (Haversine),
 * serta arah lintasan penerbangan (azimuth/bearing).
 */

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const EARTH_RADIUS_KM = 6371;

export interface GeoPoint {
  lat: number;
  lon: number;
}

/**
 * Centroid geografis terverifikasi untuk 48 bangsa Asia (ISO3 key).
 */
export const COUNTRY_COORDINATES: Record<string, GeoPoint> = {
  AFG: { lat: 34.94, lon: 67.56 },
  ARM: { lat: 40.16, lon: 45.24 },
  AZE: { lat: 40.17, lon: 46.89 },
  BHR: { lat: 26.05, lon: 50.55 },
  BGD: { lat: 23.51, lon: 90.5 },
  BTN: { lat: 27.4, lon: 90.58 },
  BRN: { lat: 4.55, lon: 114.78 },
  KHM: { lat: 12.62, lon: 105.13 },
  CHN: { lat: 35.3, lon: 106.71 },
  CYP: { lat: 34.95, lon: 33.21 },
  GEO: { lat: 42.06, lon: 43.85 },
  IND: { lat: 23.38, lon: 83.51 },
  IDN: { lat: -3.0, lon: 119.49 },
  IRN: { lat: 33.29, lon: 53.16 },
  IRQ: { lat: 33.79, lon: 44.58 },
  ISR: { lat: 31.89, lon: 35.21 },
  JPN: { lat: 35.47, lon: 135.29 },
  JOR: { lat: 31.34, lon: 36.71 },
  KAZ: { lat: 47.9, lon: 65.82 },
  KWT: { lat: 29.45, lon: 47.82 },
  KGZ: { lat: 41.02, lon: 73.36 },
  LAO: { lat: 18.44, lon: 103.8 },
  LBN: { lat: 33.86, lon: 35.97 },
  MYS: { lat: 3.97, lon: 110.86 },
  MDV: { lat: 3.81, lon: 73.47 },
  MNG: { lat: 47.78, lon: 102.88 },
  MMR: { lat: 18.8, lon: 96.92 },
  NPL: { lat: 28.1, lon: 84.32 },
  PRK: { lat: 40.39, lon: 127.35 },
  OMN: { lat: 21.71, lon: 56.0 },
  PAK: { lat: 30.18, lon: 69.8 },
  PSE: { lat: 31.83, lon: 35.03 },
  PHL: { lat: 11.46, lon: 122.68 },
  QAT: { lat: 25.2, lon: 51.19 },
  SAU: { lat: 23.15, lon: 44.88 },
  SGP: { lat: 1.37, lon: 103.87 },
  KOR: { lat: 35.73, lon: 127.33 },
  LKA: { lat: 8.47, lon: 80.51 },
  SYR: { lat: 35.09, lon: 38.0 },
  TJK: { lat: 38.95, lon: 70.74 },
  THA: { lat: 13.25, lon: 100.71 },
  TLS: { lat: -8.91, lon: 125.52 },
  TUR: { lat: 39.07, lon: 34.29 },
  TKM: { lat: 39.51, lon: 58.33 },
  ARE: { lat: 24.21, lon: 54.3 },
  UZB: { lat: 41.2, lon: 66.01 },
  VNM: { lat: 16.53, lon: 106.11 },
  YEM: { lat: 15.63, lon: 47.23 },
};

/**
 * Konversi desimal lat/lon menjadi format DMS ringkas kartografi.
 * Contoh: (35.6762, 139.6503) -> "35°40′N · 139°39′E"
 */
export function formatDMS(lat: number, lon: number): string {
  const latHemi = lat >= 0 ? 'N' : 'S';
  const lonHemi = lon >= 0 ? 'E' : 'W';

  const absLat = Math.abs(lat);
  const absLon = Math.abs(lon);

  const latDeg = Math.floor(absLat);
  const latMin = Math.floor((absLat - latDeg) * 60);

  const lonDeg = Math.floor(absLon);
  const lonMin = Math.floor((absLon - lonDeg) * 60);

  return `${latDeg}°${latMin.toString().padStart(2, '0')}′${latHemi} · ${lonDeg}°${lonMin.toString().padStart(2, '0')}′${lonHemi}`;
}

/**
 * Menghitung jarak geodesic (lingkaran besar) antara dua koordinat bola bumi (dalam km).
 */
export function haversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const dLat = (lat2 - lat1) * DEG2RAD;
  const dLon = (lon2 - lon1) * DEG2RAD;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * DEG2RAD) *
      Math.cos(lat2 * DEG2RAD) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(EARTH_RADIUS_KM * c);
}

const CARDINALS = [
  'NORTHBOUND',
  'NORTHEASTBOUND',
  'EASTBOUND',
  'SOUTHEASTBOUND',
  'SOUTHBOUND',
  'SOUTHWESTBOUND',
  'WESTBOUND',
  'NORTHWESTBOUND',
];

const CARDINALS_ID = [
  'ARAH UTARA',
  'ARAH TIMUR LAUT',
  'ARAH TIMUR',
  'ARAH TENGGARA',
  'ARAH SELATAN',
  'ARAH BARAT DAYA',
  'ARAH BARAT',
  'ARAH BARAT LAUT',
];

/**
 * Menghitung azimuth sudut awal dari titik 1 ke titik 2 (0° - 360°).
 */
export function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = lat1 * DEG2RAD;
  const φ2 = lat2 * DEG2RAD;
  const Δλ = (lon2 - lon1) * DEG2RAD;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x =
    Math.cos(φ1) * Math.sin(φ2) -
    Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  const θ = Math.atan2(y, x);
  return (θ * RAD2DEG + 360) % 360;
}

/**
 * Mengembalikan label arah navigasi (misal: "NORTHEASTBOUND" atau "ARAH TIMUR LAUT").
 */
export function getHeadingDirection(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  locale: 'id' | 'en' = 'id',
): string {
  const bearing = calculateBearing(lat1, lon1, lat2, lon2);
  const index = Math.round(bearing / 45) % 8;
  const list = locale === 'id' ? CARDINALS_ID : CARDINALS;
  const val = list[index];
  return typeof val === 'string' ? val : (locale === 'id' ? 'ARAH UTARA' : 'NORTHBOUND');
}

/**
 * Format jarak dalam kilometer dengan pemisah ribuan lokal.
 * Contoh: 5790 -> "5.790 km" (id) atau "5,790 km" (en).
 */
export function formatDistanceKm(km: number, locale: 'id' | 'en' = 'id'): string {
  const formatted = new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-US').format(km);
  return `${formatted} km`;
}
