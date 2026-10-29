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
 * Cakupan penuh 48 negara id app (2 huruf).
 */
export const regionByCountryId: ReadonlyMap<string, string> = new Map([
  // Asia Tenggara
  ['id', 'Asia Tenggara'],
  ['my', 'Asia Tenggara'],
  ['sg', 'Asia Tenggara'],
  ['th', 'Asia Tenggara'],
  ['vn', 'Asia Tenggara'],
  ['ph', 'Asia Tenggara'],
  ['bn', 'Asia Tenggara'],
  ['kh', 'Asia Tenggara'],
  ['la', 'Asia Tenggara'],
  ['mm', 'Asia Tenggara'],
  ['tl', 'Asia Tenggara'],

  // Asia Timur
  ['cn', 'Asia Timur'],
  ['jp', 'Asia Timur'],
  ['kr', 'Asia Timur'],
  ['mn', 'Asia Timur'],
  ['kp', 'Asia Timur'],

  // Asia Selatan
  ['in', 'Asia Selatan'],
  ['af', 'Asia Selatan'],
  ['bd', 'Asia Selatan'],
  ['bt', 'Asia Selatan'],
  ['ir', 'Asia Selatan'],
  ['lk', 'Asia Selatan'],
  ['mv', 'Asia Selatan'],
  ['np', 'Asia Selatan'],
  ['pk', 'Asia Selatan'],

  // Asia Barat
  ['sa', 'Asia Barat'],
  ['tr', 'Asia Barat'],
  ['am', 'Asia Barat'],
  ['az', 'Asia Barat'],
  ['bh', 'Asia Barat'],
  ['cy', 'Asia Barat'],
  ['ge', 'Asia Barat'],
  ['il', 'Asia Barat'],
  ['iq', 'Asia Barat'],
  ['jo', 'Asia Barat'],
  ['kw', 'Asia Barat'],
  ['lb', 'Asia Barat'],
  ['om', 'Asia Barat'],
  ['ps', 'Asia Barat'],
  ['qa', 'Asia Barat'],
  ['sy', 'Asia Barat'],
  ['ae', 'Asia Barat'],
  ['ye', 'Asia Barat'],

  // Asia Tengah
  ['kz', 'Asia Tengah'],
  ['uz', 'Asia Tengah'],
  ['kg', 'Asia Tengah'],
  ['tj', 'Asia Tengah'],
  ['tm', 'Asia Tengah'],
])

export function getRegion(countryId: string): string | undefined {
  return regionByCountryId.get(countryId)
}
