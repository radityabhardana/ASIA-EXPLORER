import raw from './countries.json'

/**
 * Konten 15 negara. Berkas JSON dihasilkan oleh `node scripts/build-content.mjs`
 * dari `docs/content/raw-*.json`; jangan menyunting JSON itu manual — sunting
 * berkas mentahnya lalu jalankan ulang skrip tersebut.
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

/** Urutan tampil mengikuti PRD v2.3 dan urutan di `countries.json`. */
export const countries: readonly Country[] = raw as readonly Country[]

if (import.meta.env.DEV && countries.length !== 15) {
  throw new Error(`countries.json harus berisi 15 negara, dapat ${countries.length}`)
}

const byId = new Map(countries.map((c) => [c.id, c]))
const byIso3 = new Map(countries.map((c) => [c.iso3, c]))

export function getCountry(id: string): Country | undefined {
  return byId.get(id)
}

export function getCountryByIso3(iso3: string): Country | undefined {
  return byIso3.get(iso3.toUpperCase())
}

export function isCountryId(id: string): boolean {
  return byId.has(id)
}
