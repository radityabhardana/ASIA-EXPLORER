import { countries as allCountries } from '@/content/countries';
import type { Country } from '@/content/countries';
import { COUNTRIES as COUNTRIES_48 } from '@/content/countries48';
import mapPathData from '@/content/map-paths.json';
import type { MapPathEntry } from '@/lib/map-paths';

/**
 * Data landing membaca 15 negara terverifikasi serta 48 negara lengkap
 * untuk eksplorasi peta 3D interaktif.
 */
export const countries: readonly Country[] = allCountries;

/** `map-paths.json` adalah array 15 entri dari `scripts/gen-map-paths.mjs`. */
export const mapPaths = mapPathData as unknown as readonly MapPathEntry[];

const mapById = new Map(mapPaths.map((entry) => [entry.id, entry]));
const countryById = new Map(countries.map((country) => [country.id, country]));
const countryByIso = new Map(countries.map((country) => [country.iso3.toUpperCase(), country]));

const REGION_LABEL: Record<string, string> = {
  'West Asia': 'Asia Barat',
  'Central Asia': 'Asia Tengah',
  'South Asia': 'Asia Selatan',
  'Southeast Asia': 'Asia Tenggara',
  'East Asia': 'Asia Timur',
};

export function mapEntry(id: string): MapPathEntry | undefined {
  return mapById.get(id);
}

export function countryEntry(idOrIso: string): Country | undefined {
  const norm = idOrIso.toLowerCase();
  const upper = idOrIso.toUpperCase();
  const direct = countryById.get(norm) || countryByIso.get(upper);
  if (direct) {
    return { ...direct, hasPage: true };
  }
  const item48 = COUNTRIES_48[upper];
  if (!item48) return undefined;

  return {
    id: norm,
    iso3: upper,
    nameId: item48.name,
    nameLocal: item48.name,
    region: REGION_LABEL[item48.region] || item48.region,
    capital: item48.capital,
    hasPage: false,
    greeting: {
      native: item48.greet.text,
      roman: item48.greet.latin,
      meaningId: item48.culture,
      register: item48.fact,
    },
    language: {
      nameId: item48.languages.join(', '),
      nativeName: item48.languages[0] || '',
      script: 'Lokal',
      family: 'Asia',
      note: item48.fact,
    },
    phrases: [],
    cultureNote: item48.culture,
    peopleNote: item48.fact,
    depth: 'Penjelajahan',
    story: { text: item48.culture, sources: [] },
    sources: [],
    needsVerification: [],
  };
}

/** Tiga aksara yang ditampilkan di scene 4: Arab, Jepang/CJK, Thailand (§1 tabel scene). */
export const SCRIPT_COUNTRY_IDS = ['sa', 'jp', 'th'] as const;

export type RegionalLayer = 'back' | 'mid' | 'front';

/**
 * Enam siluet Asia Tenggara (§5). Rasio parallax 0.85 / 1.0 / 1.15.
 * `sg` ikut di desktop saja; mobile memakai tiga siluet (§7).
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

export interface CountrySourceItem {
  id: string;
  nameId: string;
  sources: ReadonlyArray<{ url: string; what?: string }>;
}

export function sourceDomainLabel(url: string, what?: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const pathname = parsed.pathname;

    const lastSlug = pathname.split('/').filter(Boolean).pop() ?? '';
    const cleanSlug = decodeURIComponent(lastSlug).replace(/[-_]+/g, ' ').trim();

    if (host.includes('britannica.com')) {
      if (cleanSlug) {
        const formatted = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1);
        return `Britannica · ${formatted}`;
      }
      return 'Britannica';
    }

    if (host.includes('wikipedia.org')) return 'Wikipedia';
    if (host.includes('wiktionary.org')) return 'Wiktionary';
    if (host.includes('badanbahasa')) return 'Badan Bahasa';
    if (host.includes('unesco.org')) return 'UNESCO';
    if (host.includes('ethnologue.com')) return 'Ethnologue';
    if (host.includes('loc.gov')) return 'Library of Congress';
    if (host.includes('cia.gov')) return 'CIA Factbook';
    if (host.includes('omniglot.com')) return 'Omniglot';
    if (host.includes('culturalatlas')) return 'Cultural Atlas';
    if (host.includes('uiii.ac.id')) return 'UIII';
    if (host.includes('dbp.gov.my')) return 'DBP Malaysia';
    if (host.includes('nhb.gov.sg')) return 'NHB Singapore';
    if (host.includes('kwf.gov.ph')) return 'KWF Filipina';
    if (host.includes('glottolog.org')) return 'Glottolog';
    if (host.includes('moe.gov.cn')) return 'MOE Tiongkok';
    if (host.includes('my.gov.sa')) return 'Portal Arab Saudi';
    if (host.includes('tdk.gov.tr')) return 'TDK Turki';
    if (host.includes('welcome.kz')) return 'Welcome KZ';
    if (host.includes('lex.uz')) return 'Lex UZ';

    return host;
  } catch {
    return what || 'Sumber';
  }
}

export const COUNTRY_SOURCES: readonly CountrySourceItem[] = countries.map((c) => {
  const list = c.sources?.length ? c.sources : (c.story?.sources ?? []);
  return {
    id: c.id,
    nameId: c.nameId,
    sources: list.slice(0, 2),
  };
});
