import { countries as allCountries } from '@/content/countries';
import type { Country } from '@/content/countries';
import mapPathData from '@/content/map-paths.json';
import type { MapPathEntry } from '@/lib/map-paths';

/**
 * Data landing hanya membaca sumber yang sudah ada. Tidak ada angka baru di
 * modul ini: 15 berasal dari `countries.json`, 718 berasal dari
 * `countries.id.cultureNote` (Badan Bahasa).
 */
export const countries: readonly Country[] = allCountries;

/** `map-paths.json` adalah array 15 entri dari `scripts/gen-map-paths.mjs`. */
export const mapPaths = mapPathData as unknown as readonly MapPathEntry[];

const mapById = new Map(mapPaths.map((entry) => [entry.id, entry]));
const countryById = new Map(countries.map((country) => [country.id, country]));

export function mapEntry(id: string): MapPathEntry | undefined {
  return mapById.get(id);
}

export function countryEntry(id: string): Country | undefined {
  return countryById.get(id);
}

/** 15 negara yang ditampilkan di panggung marquee aksara (K12). */
export const SCRIPT_COUNTRY_IDS = [
  'sa',
  'jp',
  'th',
  'in',
  'cn',
  'kr',
  'id',
  'vn',
  'my',
  'ph',
  'sg',
  'tr',
  'kz',
  'uz',
  'mn',
] as const;

export type RegionalLayer = 'back' | 'mid' | 'front';

export type RegionalCountry = {
  id: string;
  name: string;
};

/**
 * Enam negara kawasan Asia Tenggara untuk Scene 5 (K13).
 */
export const REGIONAL_COUNTRIES: ReadonlyArray<RegionalCountry> = [
  { id: 'id', name: 'Indonesia' },
  { id: 'my', name: 'Malaysia' },
  { id: 'sg', name: 'Singapura' },
  { id: 'th', name: 'Thailand' },
  { id: 'vn', name: 'Vietnam' },
  { id: 'ph', name: 'Filipina' },
];

/**
 * Enam siluet Asia Tenggara (kompatibilitas layer).
 */
export const REGIONAL_SILHOUETTES: ReadonlyArray<{
  id: string;
  layer: RegionalLayer;
  ratio: number;
}> = [
  { id: 'my', layer: 'back', ratio: 0.85 },
  { id: 'th', layer: 'back', ratio: 0.85 },
  { id: 'vn', layer: 'mid', ratio: 1 },
  { id: 'sg', layer: 'mid', ratio: 1 },
  { id: 'id', layer: 'front', ratio: 1.15 },
  { id: 'ph', layer: 'front', ratio: 1.15 },
];
