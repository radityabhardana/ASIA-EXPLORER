/**
 * Region classification for Asian countries.
 * Standard geographic classification, no invented facts.
 */

export interface RegionInfo {
  id: string
  nameId: string
  nameNative: string
  region: string
}

/**
 * Region mapping based on UN geoscheme for Asia.
 * https://unstats.un.org/unsd/methodology/m49/
 */
export const regionByCountryId: ReadonlyMap<string, string> = new Map([
  // Asia Tenggara
  ['id', 'Asia Tenggara'],
  ['my', 'Asia Tenggara'],
  ['sg', 'Asia Tenggara'],
  ['th', 'Asia Tenggara'],
  ['vn', 'Asia Tenggara'],
  ['ph', 'Asia Tenggara'],

  // Asia Timur
  ['cn', 'Asia Timur'],
  ['jp', 'Asia Timur'],
  ['kr', 'Asia Timur'],
  ['mn', 'Asia Timur'],

  // Asia Selatan
  ['in', 'Asia Selatan'],

  // Asia Barat
  ['sa', 'Asia Barat'],
  ['tr', 'Asia Barat'],

  // Asia Tengah
  ['kz', 'Asia Tengah'],
  ['uz', 'Asia Tengah'],
])

export function getRegion(countryId: string): string | undefined {
  return regionByCountryId.get(countryId)
}
