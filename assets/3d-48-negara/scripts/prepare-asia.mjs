// Downloads world GeoJSON and filters it to the 48 Asian countries (UN geoscheme).
// Primary source: johan/world.geo.json (small). Fallback: Natural Earth 50m (all small nations).
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

// Region -> ISO3 codes
const REGIONS = {
  'Central Asia': ['KAZ', 'KGZ', 'TJK', 'TKM', 'UZB'],
  'East Asia': ['CHN', 'JPN', 'MNG', 'PRK', 'KOR'],
  'South Asia': ['AFG', 'BGD', 'BTN', 'IND', 'IRN', 'MDV', 'NPL', 'PAK', 'LKA'],
  'Southeast Asia': ['BRN', 'KHM', 'IDN', 'LAO', 'MYS', 'MMR', 'PHL', 'SGP', 'THA', 'TLS', 'VNM'],
  'West Asia': ['ARM', 'AZE', 'BHR', 'CYP', 'GEO', 'IRQ', 'ISR', 'JOR', 'KWT', 'LBN', 'OMN', 'PSE', 'QAT', 'SAU', 'SYR', 'TUR', 'ARE', 'YEM'],
}
const WANTED = new Set(Object.values(REGIONS).flat())
// Palestine may be coded PSX or PSE depending on dataset
const ALIASES = { PSX: 'PSE' }

function featureCode(feature) {
  const p = feature.properties || {}
  let code = feature.id || p.ISO_A3 || p.ADM0_A3 || p.iso_a3 || p.iso3 || null
  if (typeof code === 'string') code = code.toUpperCase()
  if (code && ALIASES[code]) code = ALIASES[code]
  return code === '-99' || code === 'ISO_A3' ? (p.ADM0_A3 ? p.ADM0_A3.toUpperCase() : null) : code
}

function applyRegion(features) {
  const codeToRegion = new Map()
  for (const [region, codes] of Object.entries(REGIONS)) {
    for (const c of codes) codeToRegion.set(c, region)
  }
  return features.map((f) => {
    const code = featureCode(f)
    const p = f.properties || {}
    p.code = code
    p.name = p.name || p.NAME || p.ADMIN || p.NAME_EN || code
    p.region = code ? codeToRegion.get(code) || 'Other' : 'Other'
    f.id = code
    return f
  })
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`)
  return res.json()
}

async function main() {
  const wantMissing = (feats) => {
    const got = new Set(feats.map(featureCode).filter(Boolean))
    return [...WANTED].filter((c) => !got.has(c))
  }

  let features = null
  let missing = null
  let source = null

  const primaryUrl = 'https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json'
  try {
    const world = await fetchJson(primaryUrl)
    features = world.features || []
    missing = wantMissing(features)
    source = primaryUrl
    if (missing.length > 0) throw new Error(`primary source missing ${missing.length} countries: ${missing.join(', ')}`)
  } catch (err) {
    console.warn('[prep] primary source inadequate:', err.message)
    console.log('[prep] falling back to Natural Earth 50m (bigger download)…')
    const fallbackUrl = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson'
    const world = await fetchJson(fallbackUrl)
    features = (world.features || []).filter((f) => {
      const c = featureCode(f)
      return c && WANTED.has(c)
    })
    missing = wantMissing(applyRegion(features))
    source = fallbackUrl
  }

  // Properties ordering: ship only code/name/region (+ original name)
  features = applyRegion(features).map((f) => ({ type: 'Feature', id: f.id, geometry: f.geometry, properties: { code: f.properties.code, name: f.properties.name, region: f.properties.region } }))

  const outDir = resolve(ROOT, 'src', 'data')
  mkdirSync(outDir, { recursive: true })
  const fc = { type: 'FeatureCollection', features }
  const outFile = resolve(outDir, 'asia-countries.geo.json')
  writeFileSync(outFile, JSON.stringify(fc))

  const counts = {}
  for (const f of features) counts[f.properties.region] = (counts[f.properties.region] || 0) + 1
  console.log('[prep] source:', source)
  console.log('[prep] written:', outFile, `(${features.length} features)`)
  console.log('[prep] by region:', JSON.stringify(counts))
  if (missing.length) {
    console.error('[prep] MISSING CODES:', missing.join(', '))
    process.exitCode = 2
  } else {
    console.log('[prep] all 48 countries present ✔')
  }
}

if (!existsSync(resolve(ROOT, 'src', 'data', 'asia-countries.geo.json')) || process.env.PREP_FORCE) main().catch((e) => { console.error('[prep] failed:', e.message); process.exit(1) })
else console.log('[prep] output already exists; set PREP_FORCE=1 to regenerate')
