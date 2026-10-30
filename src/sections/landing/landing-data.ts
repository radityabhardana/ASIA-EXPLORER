import { countries as allCountries, FEATURED_IDS } from '@/content/countries';
import type { Country } from '@/content/countries';
import mapPathData from '@/content/map-paths.json';
import type { MapPathEntry } from '@/lib/map-paths';

const featured = new Set(FEATURED_IDS);

/**
 * Data landing hanya membaca sumber yang sudah ada. Mosaik & pita aksara
 * memakai 15 negara kurasi saja (FEATURED_IDS), sehingga pertumbuhan
 * `countries.json` ke 48 tidak memperluas panggung landing.
 */
export const countries: readonly Country[] = allCountries.filter((country) =>
  featured.has(country.id),
);

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

/** 15 negara kurasi yang ditampilkan di panggung marquee aksara (K12). */
export const SCRIPT_COUNTRY_IDS = FEATURED_IDS;

