/**
 * Gabungkan tiga berkas riset mentah (docs/content/raw-*.json) menjadi satu
 * `src/content/countries.json` yang terurut sesuai PRD v2.3, lalu validasi
 * terhadap manifest model 3D supaya id negara di konten dan di GLB tidak
 * pernah bisa berbeda.
 *
 * Jalankan: node scripts/build-content.mjs
 * Exit 1 kalau ada yang tidak konsisten — jangan pernah menulis output parsial.
 */
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const root = process.cwd()
const RAW = ['raw-asean.json', 'raw-west.json', 'raw-east.json'].map((f) =>
  path.join(root, 'docs', 'content', f),
)
const OUT = path.join(root, 'src', 'content', 'countries.json')
const MANIFEST = path.join(root, 'public', 'models', 'asia.manifest.json')

/** Urutan dan daftar negara dikunci PRD v2.3. */
const ORDER = ['id', 'my', 'sg', 'th', 'vn', 'ph', 'cn', 'jp', 'kr', 'in', 'sa', 'tr', 'kz', 'uz', 'mn']

const errors = []
const fail = (msg) => errors.push(msg)

const str = (v) => (typeof v === 'string' ? v.trim() : '')
const nonEmpty = (v, where) => {
  const s = str(v)
  if (!s) fail(`${where}: kosong`)
  return s
}

const countries = []
for (const file of RAW) {
  if (!existsSync(file)) {
    fail(`berkas mentah tidak ada: ${path.relative(root, file)}`)
    continue
  }
  let parsed
  try {
    parsed = JSON.parse(await readFile(file, 'utf8'))
  } catch (e) {
    fail(`${path.relative(root, file)} bukan JSON valid: ${e.message}`)
    continue
  }
  if (!Array.isArray(parsed)) {
    fail(`${path.relative(root, file)} harus array`)
    continue
  }
  for (const entry of parsed) {
    const at = `${path.relative(root, file)}:${entry?.id ?? '?'}`
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

    countries.push({
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
      sources: sources.map((s, i) => ({
        url: nonEmpty(s?.url, `${at}.sources[${i}].url`),
        what: nonEmpty(s?.what, `${at}.sources[${i}].what`),
      })),
      needsVerification: (Array.isArray(entry?.perlu_verifikasi) ? entry.perlu_verifikasi : [])
        .map((n, i) => nonEmpty(n, `${at}.perlu_verifikasi[${i}]`))
        .filter(Boolean),
    })
  }
}

const seen = new Set()
for (const c of countries) {
  if (seen.has(c.id)) fail(`id ganda: ${c.id}`)
  seen.add(c.id)
}

const missing = ORDER.filter((id) => !seen.has(id))
const extra = [...seen].filter((id) => !ORDER.includes(id))
if (missing.length) fail(`negara hilang: ${missing.join(', ')}`)
if (extra.length) fail(`negara di luar PRD: ${extra.join(', ')}`)

if (!existsSync(MANIFEST)) {
  fail(`manifest model tidak ada: ${path.relative(root, MANIFEST)}`)
} else {
  const manifest = JSON.parse(await readFile(MANIFEST, 'utf8'))
  const entries = Array.isArray(manifest) ? manifest : (manifest.countries ?? [])
  const modelIso = new Set(entries.map((e) => String(e.iso3 ?? e.iso_a3 ?? '').toUpperCase()))
  const contentIso = new Set(countries.map((c) => c.iso3))
  for (const iso of contentIso) if (!modelIso.has(iso)) fail(`iso3 ${iso} tidak ada di GLB manifest`)
  for (const iso of modelIso) if (!contentIso.has(iso)) fail(`iso3 ${iso} ada di GLB tapi tidak punya konten`)
}

if (errors.length) {
  console.error(`[content:build] GAGAL — ${errors.length} masalah:`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

const ordered = ORDER.map((id) => countries.find((c) => c.id === id))
const serialized = `${JSON.stringify(ordered, null, 2)}\n`

// `--check` dipakai gate verify: pastikan JSON yang ter-commit memang hasil
// build dari berkas mentah, tanpa menulis ulang sumber.
if (process.argv.includes('--check')) {
  const current = existsSync(OUT) ? (await readFile(OUT, 'utf8')).replace(/\r\n/g, '\n') : ''
  if (current !== serialized) {
    console.error(
      `[content:build] GAGAL: ${path.relative(root, OUT)} tidak sinkron dengan docs/content/raw-*.json`,
    )
    console.error('[content:build] jalankan `npm run content:build` lalu commit hasilnya.')
    process.exit(1)
  }
  console.log(`[content:build] OK  ${ordered.length} negara — ${path.relative(root, OUT)} sinkron`)
  process.exit(0)
}

await writeFile(OUT, serialized, 'utf8')
console.log(`[content:build] OK  ${ordered.length} negara -> ${path.relative(root, OUT)}`)
for (const c of ordered) {
  console.log(
    `  ${c.id.padEnd(3)} ${c.iso3}  ${c.depth.padEnd(12)} sumber=${String(c.sources.length).padStart(2)}  ${c.nameId}`,
  )
}
