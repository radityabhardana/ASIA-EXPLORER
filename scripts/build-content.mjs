/**
 * Gabungkan berkas riset mentah (docs/content/raw-*.json) menjadi
 * `src/content/countries.json` (Indonesia) dan `src/content/countries.en.json`
 * (Inggris), lalu validasi terhadap geojson 48 negara Asia
 * (`src/data/asia-countries.geo.json`) sebagai sumber kebenaran peta.
 *
 * Aturan berkas:
 *  - `raw-*.json` (tanpa akhiran `-en`)  -> set ID
 *  - `raw-*-en.json`                     -> set EN
 * Berkas mentah baru boleh ditambah kapan saja; urutan tampil diturunkan di
 * sini (15 negara kurasi PRD v2.3 lebih dulu, sisanya dikelompokkan per
 * wilayah lalu nama). Set EN wajib memakai id yang sama dengan set ID.
 *
 * Jalankan: node scripts/build-content.mjs
 * Exit 1 kalau ada yang tidak konsisten — jangan pernah menulis output parsial.
 */
import { readFile, writeFile, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const CONTENT_DIR = path.join(root, 'docs', 'content')
const OUT_ID = path.join(root, 'src', 'content', 'countries.json')
const OUT_EN = path.join(root, 'src', 'content', 'countries.en.json')
const GEO = path.join(root, 'src', 'data', 'asia-countries.geo.json')

/** Id 15 negara kurasi PRD v2.3 — selalu tampil lebih dulu, urutannya tetap. */
const FEATURED = ['id', 'my', 'sg', 'th', 'vn', 'ph', 'cn', 'jp', 'kr', 'in', 'sa', 'tr', 'kz', 'uz', 'mn']

/** Urutan grup wilayah untuk negara di luar kurasi. */
const REGION_ORDER = ['Asia Tenggara', 'Asia Timur', 'Asia Selatan', 'Asia Barat', 'Asia Tengah']

const errors = []
const fail = (msg) => errors.push(msg)
const warn = (msg) => console.warn(`[content:build] PERINGATAN — ${msg}`)

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const nonEmpty = (v, where) => {
  const s = str(v)
  if (!s) fail(`${where}: kosong`)
  return s
}

/** Daftar berkas mentah sesuai jenis set (`id` atau `en`). */
async function listRaw(kind) {
  if (!existsSync(CONTENT_DIR)) return []
  const names = await readdir(CONTENT_DIR)
  return names
    .filter((f) => f.startsWith('raw-') && f.endsWith('.json'))
    .filter((f) => (kind === 'en' ? f.endsWith('-en.json') : !f.endsWith('-en.json')))
    .sort()
    .map((f) => path.join(CONTENT_DIR, f))
}

/** Baca + validasi seluruh berkas mentah, hasilkan entri `Country`. */
async function parseCountries(files, tag) {
  const out = []
  for (const file of files) {
    const rel = path.relative(root, file)
    let parsed
    try {
      parsed = JSON.parse(await readFile(file, 'utf8'))
    } catch (e) {
      fail(`${rel} bukan JSON valid: ${e.message}`)
      continue
    }
    if (!Array.isArray(parsed)) {
      fail(`${rel} harus array`)
      continue
    }
    for (const entry of parsed) {
      const at = `${rel}:${entry?.id ?? '?'}`
      const id = nonEmpty(entry?.id, `${at}.id`)
      const iso3 = nonEmpty(entry?.iso3, `${at}.iso3`).toUpperCase()
      const greeting = entry?.greeting ?? {}
      const language = entry?.language ?? {}
      const phrases = Array.isArray(entry?.phrases) ? entry.phrases : []
      const sources = Array.isArray(entry?.sources) ? entry.sources : []

      if (phrases.length !== 3) fail(`${at}.phrases: harus 3, dapat ${phrases.length}`)
      if (sources.length < 3) fail(`${at}.sources: minimal 3, dapat ${sources.length}`)
      const confidence = entry?.confidence
      if (confidence !== 'tinggi' && confidence !== 'sedang') {
        fail(`${at}.confidence: harus "tinggi" atau "sedang", dapat ${JSON.stringify(confidence)}`)
      }

      const storyText = str(entry?.story?.text)
      if (!storyText) {
        fail(`${at}.story.text: kosong`)
      } else {
        const words = storyText.split(/\s+/).length
        if (words < 120 || words > 180) {
          fail(`${at}.story.text: harus 120–180 kata, dapat ${words}`)
        }
      }

      const storySources = Array.isArray(entry?.story?.sources) ? entry.story.sources : []
      if (storySources.length < 2) {
        fail(`${at}.story.sources: minimal 2, dapat ${storySources.length}`)
      }
      const cleanStorySources = storySources.map((s, i) => ({
        url: nonEmpty(s?.url, `${at}.story.sources[${i}].url`),
        what: nonEmpty(s?.what, `${at}.story.sources[${i}].what`),
      }))

      out.push({
        id,
        iso3,
        nameId: nonEmpty(entry?.name_id, `${at}.name_id`),
        nameLocal: nonEmpty(entry?.name_local, `${at}.name_local`),
        region: nonEmpty(entry?.region, `${at}.region`),
        greeting: {
          native: nonEmpty(greeting.native, `${at}.greeting.native`),
          roman: nonEmpty(greeting.roman, `${at}.greeting.roman`),
          meaningId: nonEmpty(greeting.meaning_id, `${at}.greeting.meaning_id`),
          register: nonEmpty(greeting.register, `${at}.greeting.register`),
        },
        language: {
          nameId: nonEmpty(language.name_id, `${at}.language.name_id`),
          nativeName: nonEmpty(language.native_name, `${at}.language.native_name`),
          script: nonEmpty(language.script, `${at}.language.script`),
          family: nonEmpty(language.family, `${at}.language.family`),
          note: nonEmpty(language.note, `${at}.language.note`),
        },
        phrases: phrases.map((p, i) => ({
          id: nonEmpty(p?.id, `${at}.phrases[${i}].id`),
          native: nonEmpty(p?.native, `${at}.phrases[${i}].native`),
          roman: nonEmpty(p?.roman, `${at}.phrases[${i}].roman`),
        })),
        cultureNote: nonEmpty(entry?.culture_note, `${at}.culture_note`),
        peopleNote: nonEmpty(entry?.people_note, `${at}.people_note`),
        // Label kejujuran: hanya negara dengan sumber yang cukup untuk semua blok
        // yang diberi label "Lengkap". Sisanya "Penjelajahan" apa adanya.
        depth: confidence === 'tinggi' ? 'Lengkap' : 'Penjelajahan',
        story: {
          text: storyText,
          sources: cleanStorySources,
        },
        sources: sources.map((s, i) => ({
          url: nonEmpty(s?.url, `${at}.sources[${i}].url`),
          what: nonEmpty(s?.what, `${at}.sources[${i}].what`),
        })),
        needsVerification: (Array.isArray(entry?.perlu_verifikasi) ? entry.perlu_verifikasi : [])
          .map((n, i) => nonEmpty(n, `${at}.perlu_verifikasi[${i}]`))
          .filter(Boolean),
        _tag: tag,
      })
    }
  }
  return out
}

/** Hilangkan field internal, cek id ganda. */
function finalize(list) {
  const seen = new Set()
  for (const c of list) {
    if (seen.has(c.id)) fail(`id ganda di set ${c._tag}: ${c.id}`)
    seen.add(c.id)
  }
  return list.map(({ _tag, ...country }) => country)
}

/** 15 kurasi lebih dulu, sisanya per wilayah lalu nama (deterministik). */
function orderCountries(list) {
  const byId = new Map(list.map((c) => [c.id, c]))
  const featured = FEATURED.filter((id) => byId.has(id)).map((id) => byId.get(id))
  const rank = (r) => {
    const i = REGION_ORDER.indexOf(r)
    return i === -1 ? REGION_ORDER.length : i
  }
  const rest = list
    .filter((c) => !FEATURED.includes(c.id))
    .sort(
      (a, b) =>
        rank(a.region) - rank(b.region) ||
        a.nameId.localeCompare(b.nameId, 'id') ||
        a.id.localeCompare(b.id),
    )
  return [...featured, ...rest]
}

const idList = finalize(await parseCountries(await listRaw('id'), 'id'))
const enList = finalize(await parseCountries(await listRaw('en'), 'en'))

const orderedId = orderCountries(idList)
const idOrder = orderedId.map((c) => c.id)
const idSet = new Set(idOrder)

// Set EN wajib memakai id yang sama dengan set ID, tanpa id asing.
const enById = new Map(enList.map((c) => [c.id, c]))
for (const c of enList) {
  if (!idSet.has(c.id)) fail(`[EN] id ${c.id} tidak ada di set ID`)
}
// Output EN selalu mengikuti urutan ID yang sudah diturunkan.
const orderedEn = idOrder.filter((id) => enById.has(id)).map((id) => enById.get(id))

const parity = orderedEn.length === idOrder.length

// Sumber kebenaran 48 negara adalah geojson, bukan manifest GLB lagi.
if (!existsSync(GEO)) {
  fail(`geojson negara tidak ada: ${path.relative(root, GEO)}`)
} else {
  const geo = JSON.parse(await readFile(GEO, 'utf8'))
  const features = Array.isArray(geo?.features) ? geo.features : []
  const geoCodes = new Set(
    features.map((f) => String(f?.properties?.code ?? '').toUpperCase()).filter(Boolean),
  )
  const contentIso = new Set([...orderedId, ...orderedEn].map((c) => c.iso3))
  for (const iso of contentIso) {
    if (!geoCodes.has(iso)) fail(`iso3 ${iso} tidak ada di geojson 48 negara`)
  }
  // Konten tumbuh bertahap; subset dari 48 hanya peringatan, bukan kegagalan.
  if (contentIso.size < geoCodes.size) {
    warn(`konten masih subset: ${contentIso.size}/${geoCodes.size} iso3 terisi`)
  }
}

if (errors.length) {
  console.error(`[content:build] GAGAL — ${errors.length} masalah:`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

const serializedId = `${JSON.stringify(orderedId, null, 2)}\n`
const serializedEn = `${JSON.stringify(orderedEn, null, 2)}\n`

// `--check` dipakai gate verify: pastikan JSON yang ter-commit memang hasil
// build dari berkas mentah, tanpa menulis ulang sumber.
if (process.argv.includes('--check')) {
  const outputs = [
    [OUT_ID, serializedId, 'ID'],
    [OUT_EN, serializedEn, 'EN'],
  ]
  let stale = false
  for (const [out, serialized, label] of outputs) {
    const current = existsSync(out) ? (await readFile(out, 'utf8')).replace(/\r\n/g, '\n') : ''
    if (current !== serialized) {
      stale = true
      console.error(
        `[content:build] GAGAL: ${path.relative(root, out)} (${label}) tidak sinkron dengan docs/content/raw-*.json`,
      )
    }
  }
  if (stale) {
    console.error('[content:build] jalankan `npm run content:build` lalu commit hasilnya.')
    process.exit(1)
  }
  console.log(
    `[content:build] OK  ID ${orderedId.length} negara / EN ${orderedEn.length} negara — parity ${parity ? 'ok' : 'subset (EN menyusul)'}`,
  )
  process.exit(0)
}

await writeFile(OUT_ID, serializedId, 'utf8')
await writeFile(OUT_EN, serializedEn, 'utf8')
console.log(
  `[content:build] OK  ID ${orderedId.length} / EN ${orderedEn.length} — parity ${parity ? 'ok' : 'subset (EN menyusul)'}`,
)
for (const c of orderedId) {
  console.log(
    `  ${c.id.padEnd(3)} ${c.iso3}  ${c.depth.padEnd(12)} sumber=${String(c.sources.length).padStart(2)} cerita=${String(c.story.sources.length).padStart(2)} (${String(c.story.text.trim().split(/\s+/).length).padStart(3)}k)  ${c.nameId}`,
  )
}
