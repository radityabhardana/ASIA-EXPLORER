import raw from './countries.json'
import rawEn from './countries.en.json'

/**
 * Konten negara. Berkas JSON dihasilkan oleh `node scripts/build-content.mjs`
 * dari `docs/content/raw-*.json`; jangan menyunting JSON itu manual — sunting
 * berkas mentahnya lalu jalankan ulang skrip tersebut.
 *
 * `countries.json` = set Indonesia, `countries.en.json` = set Inggris. Set EN
 * tumbuh bertahap mengikuti set ID; entri yang belum diterjemahkan jatuh
 * kembali ke konten ID lewat `countryById`/`countriesFor`.
 */

export type CountryDepth = 'Lengkap' | 'Penjelajahan'

export interface Greeting {
  native: string
  roman: string
  meaningId: string
  register: string
}

export interface Language {
  nameId: string
  nativeName: string
  script: string
  family: string
  note: string
}

export interface Phrase {
  id: string
  native: string
  roman: string
}

export interface Source {
  url: string
  what: string
}

export interface Story {
  text: string
  sources: readonly Source[]
}

export interface Country {
  id: string
  iso3: string
  nameId: string
  nameLocal: string
  region: string
  greeting: Greeting
  language: Language
  phrases: Phrase[]
  cultureNote: string
  peopleNote: string
  depth: CountryDepth
  story: Story
  sources: Source[]
  needsVerification: string[]
}

/** Id 15 negara kurasi (PRD v2.3) — dasar mosaik & pita aksara. */
export const FEATURED_IDS: readonly string[] = [
  'id',
  'my',
  'sg',
  'th',
  'vn',
  'ph',
  'cn',
  'jp',
  'kr',
  'in',
  'sa',
  'tr',
  'kz',
  'uz',
  'mn',
]

/** Konten set Indonesia, urut sesuai `countries.json`. */
export const countries: readonly Country[] = raw as readonly Country[]

/** Konten set Inggris; subset dari `countries` saat masih tumbuh. */
export const countriesEn: readonly Country[] = rawEn as readonly Country[]

if (import.meta.env.DEV) {
  if (countries.length < 15) {
    throw new Error(`countries.json minimal berisi 15 negara, dapat ${countries.length}`)
  }
  // Set EN boleh lebih sedikit (terjemahan menyusul), tetapi tidak boleh memuat
  // id asing dan harus mengikuti urutan set ID.
  const idOrder = new Map(countries.map((c, index) => [c.id, index]))
  let cursor = -1
  for (const entry of countriesEn) {
    const index = idOrder.get(entry.id)
    if (index === undefined) {
      throw new Error(`countries.en.json memuat id ${entry.id} yang tidak ada di countries.json`)
    }
    if (index <= cursor) {
      throw new Error(`urutan countries.en.json tidak mengikuti countries.json (id ${entry.id})`)
    }
    cursor = index
  }
}

const byId = new Map(countries.map((c) => [c.id, c]))
const byIso3 = new Map(countries.map((c) => [c.iso3, c]))
const byIdEn = new Map(countriesEn.map((c) => [c.id, c]))

export function getCountry(id: string): Country | undefined {
  return byId.get(id)
}

export function getCountryByIso3(iso3: string): Country | undefined {
  return byIso3.get(iso3.toUpperCase())
}

export function isCountryId(id: string): boolean {
  return byId.has(id)
}

/** Konten sesuai locale; EN jatuh kembali ke ID kalau terjemahannya belum ada. */
export function countryById(id: string, locale: 'id' | 'en' = 'id'): Country | undefined {
  const base = byId.get(id)
  if (!base) return undefined
  return (locale === 'en' ? byIdEn.get(id) : undefined) ?? base
}

/** Daftar konten untuk locale, panjang & urutan tetap mengikuti set ID. */
export function countriesFor(locale: 'id' | 'en'): readonly Country[] {
  if (locale !== 'en' || countriesEn.length === 0) return countries
  return countries.map((country) => byIdEn.get(country.id) ?? country)
}
