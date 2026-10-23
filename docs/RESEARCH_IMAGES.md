# RESEARCH_IMAGES.md — Riset Fotografi Berlisensi (Wikimedia Commons + sharp)

Tanggal riset: 2026-10-23. Semua klaim diverifikasi ke dokumentasi resmi per tanggal ini.
Konteks: situs statis Vite + React + Three.js (`asiakin-v3`), 15 negara Asia. Keputusan mengikat (PRD_V2_5_DELTA): hanya Wikimedia Commons API, CC0/PD dipilih duluan, CC BY / CC BY-SA boleh dengan kredit satu baris di bawah foto, NC/ND/tanpa-lisensi ditolak, Unsplash/Pexels hanya fallback (dicatat). Semua blok source/reference dihapus dari UI (K1). Foto diunduh, dioptimasi jadi derivative sizes, disimpan di folder khusus agar bundle tetap ringan.

---

## 1. Wikimedia Commons API — `prop=imageinfo`

Sumber: https://www.mediawiki.org/wiki/API:Imageinfo (diperiksa 2026-10-23)

- Endpoint Wikimedia Commons: `https://commons.wikimedia.org/w/api.php`
- `action=query&prop=imageinfo` menerima `titles=File:...` (bisa batch dengan pemisah `|`).
- `iiprop` yang relevan: `url|size|extmetadata|mime`.
  - `url` → URL file asli (`upload.wikimedia.org/...`), URL halaman deskripsi (`descriptionurl`), dan thumbnail bila `iiurlwidth` diisi.
  - `size` → `size` (byte), `width`, `height`.
  - `extmetadata` → metadata lisensi/atribusi terformat **HTML** (lihat poin 2). Catatan resmi: *expensive property* — jangan minta banyak file sekaligus dalam satu request; filter dengan `iiextmetadatafilter`.
  - `mime` → tipe MIME file (mis. `image/jpeg`); tolak non-foto (SVG/PDF bisa jadi peta/gambar garis).
- `iiurlwidth=<W>` → meminta thumbnail selebar W. Gotcha resmi (T360589, tercantum di halaman API:Imageinfo): URL thumbnail yang kembali **tidak dijamin** sama persis dengan W — bisa lebih besar, diambil dari daftar pra-generate (di praktik: 1600 mengembalikan `1920px-...jpg`). Untuk pipeline kita ini tidak masalah karena kita resize sendiri dengan sharp.
- `format=json` wajib; `origin=*` mengaktifkan CORS anonim (untuk pemanggilan dari browser, lihat https://www.mediawiki.org/wiki/API:CORS). Untuk fetch di Node (build-time), `origin=*` tidak diperlukan tapi tidak berbahaya.
- Pola respons: `query.pages` dipetakan per `pageid`; data terbaru ada di `imageinfo[0]` (array). Udah `query.normalized` untuk normalisasi judul.

**Contoh request (DIUJI LANGSUNG, live, 2026-10-23, dengan User-Agent proper):**

```
https://commons.wikimedia.org/w/api.php?action=query
  &titles=File:Borobudur-Nothwest-view.jpg|File:Taj Mahal, Agra, India edit3.jpg
  &prop=imageinfo&iiprop=url|size|extmetadata|mime
  &iiurlwidth=1600&format=json&origin=*
```

Praktik tambahan resmi yang disarankan untuk produksi:
`&iiextmetadatafilter=ObjectName|ImageDescription|Artist|Credit|LicenseShortName|License|LicenseUrl|UsageTerms|AttributionRequired|Copyrighted|Restrictions` (maks 50 nilai) agar respons ringkas.

**Contoh respons (asli, dipangkas):**

```jsonc
{
  "batchcomplete": "",
  "query": {
    "normalized": [{ "from": "File:Borobudur-Nothwest-view.jpg", "to": "File:Borobudur-Nothwest-view.jpg" }],
    "pages": {
      "4838861": {
        "pageid": 4838861, "ns": 6, "title": "File:Borobudur-Nothwest-view.jpg",
        "imagerepository": "local",
        "imageinfo": [{
          "size": 819896, "width": 2816, "height": 1108,
          "thumburl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Borobudur-Nothwest-view.jpg/1920px-Borobudur-Nothwest-view.jpg",
          "thumbwidth": 1600, "thumbheight": 630,   // minta 1600, URL-nya 1920px (T360589)
          "url": "https://upload.wikimedia.org/wikipedia/commons/8/8c/Borobudur-Nothwest-view.jpg",
          "descriptionurl": "https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg",
          "mime": "image/jpeg",
          "extmetadata": {
            "ObjectName": { "value": "Borobudur-Nothwest-view" },
            "ImageDescription": { "value": "Borobudur temple view from northwest plateau, Central Java, Indonesia." },
            "Artist": { "value": "<a href=\"//commons.wikimedia.org/wiki/User:Gunkarta\" title=\"User:Gunkarta\">Gunawan Kartapranata</a>" },
            "Credit": { "value": "<span class=\"int-own-work\" lang=\"en\">Own work</span>" },
            "LicenseShortName": { "value": "Public domain" },
            "UsageTerms": { "value": "Public domain" },
            "AttributionRequired": { "value": "false" },
            "Copyrighted": { "value": "False" },
            "Restrictions": { "value": "" },
            "License": { "value": "pd" }
          }
        }]
      }
    }
  }
}
```

Field ber-URL (`url`, `thumburl`) kini disertakan parameter pelacak `?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&...` — buang query-nya saat memakai URL.

Source kedua untuk anatomi respons: https://commons.wikimedia.org/wiki/Commons:Machine-readable_data

---

## 2. Field `extmetadata` untuk lisensi & atribusi

Sumber: https://commons.wikimedia.org/wiki/Commons:Machine-readable_data (didokumentasikan via kelas template `licensetpl_*`), diverifikasi silang dengan respons live spt di atas.

| Field | Isi | Sumber di Commons | Catatan |
|---|---|---|---|
| `LicenseShortName` | `"Public domain"`, `"CC BY-SA 3.0"` | `licensetpl_short` | Nama lisensi "pendek" utk parsing allowlist |
| `License` | `pd`, `cc-by-sa-3.0`, `cc-by-sa-4.0`, `cc-zero`, `gfdl` | `commons-templates` | Kode internal; berguna sbg sinyal kedua |
| `LicenseUrl` | `https://creativecommons.org/licenses/by-sa/3.0` | halaman deskripsi | Deed URL untuk kredit |
| `Artist` | HTML: `<div class="fn value">…</div>` atau `<ul><li>…` (file turunan) yang membungkus `<a href>` ke halaman pengguna | microformat `{{Information}}` | **HTML**, harus di-strip |
| `Credit` | Bisa berupa `<table class="layouttemplate sourcetemplate">` HTML penuh | `{{Information}}/source` | Sering jelek formatnya; utamakan `Artist` |
| `AttributionRequired` | `"true"` / `"false"` | `licensetpl_attr_req` | PD → biasanya `false` |
| `Copyrighted` | `"True"` / `"False"` | halaman deskripsi | `False` ≈ PD |
| `Restrictions` | `""` atau kode pembatasan | template pembatasan | Kode: `trademarked`, `personality`, `insignia`, `nazi`, `aus-reserve`, `ita-mibac`, `communist`, `2257`, dll. — **tolak jika tidak kosong** kecuali dipahami |
| `UsageTerms` | `"Public domain"`, `"Creative Commons Attribution-Share Alike 3.0"` | halaman deskripsi | Nama panjang lisensi |
| `ObjectName` | Base nama file | MediaWiki metadata | Bisa dipakai sbg Title di kredit |
| `ImageDescription` | Teks/HTML, sering multi-bahasa dengan markup `{{Lang}}` | microformat | Sumber kandidat alt; wajib strip + cek bahasa |

**HTML di `Artist` (dan cara strip aman).** Nilai `extmetadata` adalah JSON berisi HTML hasil render halaman deskripsi (contoh nyata di poin 1: `Artist` berisi `<a href="//commons.wikimedia.org/wiki/User:Gunkarta">Gunawan Kartapranata</a>`; contoh Taj Mahal justru `<ul><li>` panjang untuk karya turunan). Strip aman:

```ts
// Untrusted input: hanya hapus tag + kumpulkan href pertama.
// JANGAN pernah render HTML extmetadata langsung ke DOM.
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#160;|&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function firstHref(html: string): string | null {
  return html.match(/href="([^"]+)"/)?.[1] ?? null; // → tambahkan https: bila diawali "//"
}
```

Fallback author: bila `Artist` kosong setelah strip, gunakan `user` pada `imageinfo[0]` (pengunggah) — catatan resmi Commons: atribusi ditujukan ke **pencipta** ("author" pada bagian summary), bukan selalu pengunggah.

---

## 3. Etiket API — User-Agent & rate limit

Sumber: https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy dan https://www.mediawiki.org/wiki/API:Etiquette (keduanya diperiksa 2026-10-23)

- Sejak 2010 semua request ke situs Wikimedia wajib membawa header `User-Agent` deskriptif. UA kosong/generik (`curl`, `python-requests/x`, default Node) **dianggap malicious dan bisa diblokir**; di wiki Wikimedia request tanpa UA jelas gagal dengan **HTTP 403**.
- Format resmi yang direkomendasikan Wikimedia:

```
<client name>/<version> (<contact information>) <library/framework name>/<version> [ ... ]
```

Contoh resmi dari halaman policy:

```
User-Agent: CoolBot/0.0 (https://example.org/coolbot/; coolbot@example.org) generic-library/0.0
```

- Contact information harus nyata: email, situs, atau akun wiki dalam format `(wikipedia:en; User:Nama)`. Untuk proyek ini (ganti kontak ke nilai asli):

```
User-Agent: asiakin-v3-image-fetch/1.0 (https://github.com/<org>/asiakin-v3; <email-rekanan>) node/20
```

- Khusus JS di browser (yang tidak bisa menimpa UA): pakai header `Api-User-Agent` — ini tidak melanggar policy.
- Rate limit (API:Etiquette):
  - "No hard speed limit on read requests, but be considerate" — namun wiki Wikimedia menerapkan batas rate tersendiri (lihat https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits).
  - **Serilisasi wajib**: tunggu satu request selesai sebelum berikutnya, jangan paralel.
  - Batch: gabung judul dengan `|` (satu `titles=A|B|C`) dan pakai `iiextmetadatafilter`; `extmetadata` mahal — minta terbatas.
  - Error `ratelimited` → retry dengan exponential backoff.
  - Cache hasil API ke disk manifest Anda supaya tidak request ulang (data lisensi boleh berubah — cek ulang saat regenerasi).

---

## 4. Allowlist lisensi — mapping `LicenseShortName` / `License`

Sumber: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia ("if a file has multiple licenses, you can use any" — dari multi-lisensi cukup pakai satu), https://commons.wikimedia.org/wiki/Commons:Machine-readable_data (kelas `licensetpl_short`), respons live di poin 1.

Keputusan PRD: CC0/PD lebih disukai; CC BY/CC BY-SA diizinkan dengan kredit satu baris; NC/ND/GFDL-only/tanpa-lisensi ditolak.

| `LicenseShortName` (contoh nilai nyata) | Value `License` terkait | Keputusan | Diaudit jadi |
|---|---|---|---|
| `Public domain` (varian PD-US, PD-old, dsb. → biasanya juga `"Public domain"`) | `pd` | ✅ pilih duluan | PD |
| `PD-US`, `PD-US-expired`, `PD-old-100` | `pd` + Label biasanya `Public domain` | ✅ tapi catat jenis PD (lihat poin 10) | PD |
| `CC0` | `cc-zero` | ✅ | CC0 |
| `CC BY 4.0`, `CC BY 3.0`, `CC BY 2.5`, `CC BY 2.0`, `CC BY 1.0` | `cc-by-4.0` dst. | ✅ kredit wajib | CC BY |
| `CC BY-SA 4.0`, `CC BY-SA 3.0`, dst. | `cc-by-sa-4.0` dst. | ✅ kredit wajib (+ShareAlike) | CC BY-SA |
| Dual `GFDL` + `CC BY-SA (x.y)` (sangat umum di Commons, mis. Taj Mahal: `CC-BY-SA-3.0,2.5,2.0,1.0` + GFDL) | `cc-by-sa-3.0`, `gfdl` | ✅ lewat sisi CC (pilih salah satu lisensi dari multi-lisensi) | CC BY-SA |
| `CC BY-NC*`, `CC BY-SA-NC*` (ada `-nc` / `NC` manapun) | `cc-by-nc-*` | ❌ | NC |
| `CC BY-ND`, `CC BY-NC-ND` | `cc-by-nd-*` | ❌ | ND |
| `GFDL` (tanpa co-lisensi CC) | `gfdl` | ❌ (keputusan PRD; invarian bagian + kewajiban salin lisensi penuh) | GFDL-only |
| `Fair use` / `non-free` | — | ❌ (di Commons memang tidak diizinkan; hanya wiki lokal) | non-free |
| Kosong / tidak ada `LicenseShortName` | — | ❌ reject-on-unknown | tanpa-lisensi |

`LicenseShortName` juga bisa berupa teks lain (`GFDL|disclaimers`, `FAL`, `attribution` dsb.). **Aturan aman: parser hanya menerima nilai yang cocok pola di atas, sisanya tolak.** Normalisasi ke huruf kecil sebelum match agar variasi kapitalisasi tidak lolos.

Implementasi parser:

```ts
type LicenseGroup = 'pd' | 'cc0' | 'cc-by' | 'cc-by-sa' | 'REJECT';
export function classifyLicense(fileName: string, licenseCode: string, short: string): LicenseGroup {
  const s = short.toLowerCase(); const l = licenseCode.toLowerCase();
  if (/nc|nd/.test(s) || /-nc|-nd/.test(l)) return 'REJECT';
  if (s.includes('cc0') || l.includes('cc-zero') || s.includes('cc zero')) return 'cc0';
  if (s.includes('public domain') || l === 'pd' || s.startsWith('pd-')) return 'pd';
  if (/^cc by-sa \d/.test(s) || /^cc-by-sa-\d/.test(l)) return 'cc-by-sa';
  if (/^cc by \d/.test(s) || /^cc-by-\d/.test(l)) return 'cc-by';
  // multi-lisensi GFDL+CC: bila lisensi field hanya satu, tepatnya regex atas sdh menangani
  if (l.includes('gfdl') || s.includes('gfdl')) return 'REJECT'; // GFDL-only → tolak
  return 'REJECT'; // unknown → tolak (fail-closed)
}
```

Catatan kejujuran: beberapa file menaruh lisensi ganda dalam **kategori** (mis. GFDL + CC di category), dan `License`/`LicenseShortName` hanya melaporkan lisensi utama template. Untuk audit ketat, cek juga kategori `Categories` di `extmetadata` dan alamat `LicenseUrl` yang dihasilkan. (Caveat, tidak sepenuhnya didokumentasikan resmi satu persatu — uji dengan sampel 15 negara sebelum finalisasi.)

---

## 5. String atribusi (TASL) & versi satu baris

Sumber: https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution (redirect dari Best_practices_for_attribution; TASL), https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia, https://commons.wikimedia.org/wiki/Commons:Credit_line, https://creativecommons.org/licenses/by-sa/4.0/legalcode

CC menyatakan: "You may satisfy the attribution requirement in any reasonable manner based on the medium, means and context". Komponen yang disarankan CC (TASL):

- **T**itle (4.0 opsional; 1.0–3.0 wajib)
- **A**uthor (nama yang dipilih pencipta, boleh pseudonim)
- **S**ource (URL asal — pakai halaman deskripsi Commons)
- **L**icense (nama + link deed)

Format satu-baris penuh (di bawah foto):

```
Photo: <Title> — <Author> — via <Wikimedia Commons link> — <CC BY-SA 4.0 link>
```

Versi minimum yang tetap akurat untuk caption (hyperlink pada Author, Source, License — sesuai rekomendasi CC):

```
Photo: Gunawan Kartapranata, via Wikimedia Commons, CC BY-SA 4.0
↑ link nama → https://commons.wikimedia.org/wiki/User:Gunkarta
↑ link "Wikimedia Commons" → https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg
↑ link "CC BY-SA 4.0" → https://creativecommons.org/licenses/by-sa/4.0/
```

Poin tambahan:
- Bila foto di-crop secara artistic (modifikasi), CC wiki menyarankan mencatat bahwa itu adaptasi → tambah `(crop)` / `(edited)`. Resize/re-encode untuk deliverability umumnya dianggap perubahan teknis, bukan adaptasi kreatif (klaim praktik umum, bukan klausul legal eksplisit — catat bila ingin sangat kaku).
- Untuk PD/CC0, atribusi tidak diwajibkan hukum secara ketat (PD) / tidak sama sekali (CC0), tapi Commons menyarankan tetap memberi kredit provenance — lakukan: `Photo: <Author>, via Wikimedia Commons (public domain)`.
- Sumber `AttributionRequired=false` (PD) vs `true` (CC) dari `extmetadata` bisa dipakai sebagai sinyal otomatis.

---

## 6. Pipeline sharp (Node 20+, Windows)

Sumber: https://sharp.pixelplumbing.com/api-output , https://sharp.pixelplumbing.com/api-resize , definisi tipe https://github.com/lovell/sharp/blob/master/lib/index.d.ts (semua diperiksa 2026-10-23: `AvifOptions`, `WebpOptions`, `ResizeOptions`, `Stats`).

sharp ≥ 0.33 menyertakan prebuilt binary untuk win32-x64 — `npm i sharp` di Node 20 tanpa compiler. Minimalkan ukuran bundle: hanya jalankan sharp di **build-time script** (`scripts/generate-images.ts` pakai tsx), tidak pernah di client.

```ts
import sharp from 'sharp';

const WIDTHS = [480, 960, 1600] as const;

// resize() — https://sharp.pixelplumbing.com/api-resize
const resizeOpts = (width: number) => ({
  width,                                  // tinggi otomatis (jaga aspect)
  fit: 'inside' as const,                 // preserve aspect, ≤ target; tanpa crop
  withoutEnlargement: true,               // jangan perbesar file sumber kecil
  kernel: 'lanczos3' as const,            // default downsampling kernel
});

// avif() — https://sharp.pixelplumbing.com/api-output
const avifOpts = {
  quality: 50,                            // default sharp AVIF; dekoratif: 45–55 (lihat poin 7)
  effort: 6,                              // 0 tercpt – 9 terseduh; build-time → 6 masih realistis
  chromaSubsampling: '4:2:0',             // default AVIF sharp '4:4:4'; photo → 4:2:0 lebih kecil
  tune: 'auto' as const,                  // 'iq'|'psnr'|'ssim' tersedia
} as const;

// webp() — fallback browser tanpa AVIF
const webpOpts = {
  quality: 60,
  effort: 4,
  smartSubsample: true,                   // chroma subsampling berkualitas utk ukuran kecil
} as const;
```

Pipeline per file:

```ts
export async function derive(input: Buffer) {
  const meta = await sharp(input).metadata();
  const sizes = [];
  for (const width of WIDTHS) {
    if (meta.width && meta.width < width && width !== WIDTHS[0]) continue; // hindari upsampling manual
    const base = sharp(input).resize(resizeOpts(width));
    // tanpa .withMetadata()/keepMetadata → default sharp MEMBUANG semua metadata (EXIF/XMP/ICC)
    // → atribusi tersimpan di manifest, bukan EXIF (keputusan PRD) — default justru yang diinginkan
    const buf = await base.toBuffer();
    sizes.push({
      width,
      avif: await sharp(buf).avif(avifOpts).toBuffer(),
      webp: await sharp(buf).webp(webpOpts).toBuffer(),
    });
  }
  return sizes;
}
```

LQIP (placeholder blur kecil, via base64, tanpa paket luar):

```ts
const lqip = await sharp(input)
  .resize({ width: 24, fit: 'inside' })
  .webp({ quality: 40, effort: 0, smartSubsample: true })
  .toBuffer();
const lqipBase64 = `data:image/webp;base64,${lqip.toString('base64')}`; // ~0.3–1 KB inline
// CSS: .ph-blur { filter: blur(12px); }  → dipasang sebagai background dengan animasi transisi
```

Alternatif lain: paket Blurhash (https://github.com/woltapp/blurhash) murni juga bisa; LQIP WebP via sharp tidak butuh decoder runtime tambahan — kita pilih LQIP WebP untuk simpelnya (tidak ada library runtime baru di bundle).

Dominant colour:

```ts
const stats = await sharp(input).stats();
// dari index.d.ts: dominant: { r: number; g: number; b: number }
// — sRGB, 4096-bin 3D histogram; field lain: channels, isOpaque, entropy, sharpness
const dominant = rgbToHex(stats.dominant); // "#8a7d5a" utk CSS placeholder
```

Metadata stripping: perilaku default toFile/toBuffer adalah "all metadata will be removed, which includes EXIF-based orientation" (kutipan resmi api-output). Tidak perlu `.withMetadata()` untuk gambar dekoratif — justru kecilkan file.

---

## 7. Ukuran realistis AVIF di 1600w (landscape)

Peringatan kejujuran: sharp tidak menerbitkan tabel ukuran resmi per-kualitas. Data kuantitatif resmi yang ada: MDN (https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types) — "lossy AVIF ~50% smaller than JPEG for visually similar levels" dan "median 50% vs. 30% compression for the same JPG set" (AVIF vs WebP). Nilai di bawah adalah **estimasi proyeksi** dari angka itu, bukan garansi:

| Format @1600w landscape | Perkiraan KB |
|---|---|
| JPEG q80 titik acuan (setara visual; umumnya ~250–350 KB pada 1600w hasil turun dari master 2816w) | 250–350 KB |
| AVIF q50 (default sharp) | 120–180 KB |
| AVIF q60 | 170–260 KB (≈1.3–1.5× q50) |
| WebP q60 | 160–220 KB |

Angka aktual Borobudur (asli 2816×1108 = 820 KB JPEG): estimasi turun ke 1600w AVIF q50 ≈ 90–150 KB (banyak area langit/tekstur halus — jenis konten yang paling diuntungkan AVIF). Baca `filesize` hasil konversi saat build untuk angka aktual; sesuaikan `quality` per negara bila melebihi budget.

Rekomendasi `quality` untuk foto **dekoratif background** (di-overlay/di-gelapkan dengan teks): AVIF **q45–q55** sangat aman; default sharp avif `quality: 50` memang pas di situ. Tambah `effort: 6` untuk kompresi lebih dari `effort: 4` (default).

Budget per negara (foto dekoratif, 3 ukuran):

```
480.avif  ~40–60 KB  │  960.avif  ~90–130 KB  │  1600.avif ~130–200 KB   (q50)
webp fallback: hormati ukuran yang lebih ekspensif → hanya generate 480.webp + 960.webp (~70–110 KB)
LQIP base64: ~1 KB (inline di manifest)
TOTAL: ~350–500 KB per negara → ≤ 600 KB ✅
```

Simpan `<id>.webp` hanya di 480/960; `<img>` fallback di-pick browser by type via `<picture>` (poin 9). Bila butuh fallback 1600 (jarang — semua browser modern besar mendukung AVIF sejak lama), generate sekalian tapi naikkan budget.

---

## 8. Struktur folder & schema manifest (Vite statis)

Derivative TIDAK diimpor sebagai modul (agar tidak masuk bundle graph) — mereka aset publik murni:

```
public/
  images/
    countries/
      <id>/            # id = kode negara Asia (mis. "indonesia", "jepang")
        480.avif  480.webp
        960.avif  960.webp
        1600.avif
src/
  data/
    images.manifest.json     # import statis biasa → tree-shakable bila per negara
scripts/
  commons-fetch.mjs          # unduh + klasifikasi lisensi + tulis manifest (Node)
  validate-images.mjs        # Gate: gagalkan build bila lisensi/alt hilang
```

Schema manifest (`src/data/images.manifest.json`) — satu entri per foto dipakai:

```jsonc
{
  "id": "indonesia",
  "file": "countries/indonesia",          // path relatif terhadap /images
  "width": 1600,
  "height": 900,
  "lqip": "data:image/webp;base64,UklGR...", // ~0.3–1 KB placeholder
  "dominant": "#8a7d5a",
  "author": "Gunawan Kartapranata",
  "authorUrl": "https://commons.wikimedia.org/wiki/User:Gunkarta",
  "license": "CC BY-SA 4.0",              // label tampil di UI (kredit 1 baris)
  "licenseGroup": "cc-by-sa",             // pd | cc0 | cc-by | cc-by-sa
  "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
  "sourceUrl": "https://commons.wikimedia.org/wiki/File:Borobudur-Nothwest-view.jpg",
  "credit": "Photo: Gunawan Kartapranata, via Wikimedia Commons, CC BY-SA 4.0",
  "alt": {
    "id": "Candi Borobudur tampak dari barat laut saat matahari terbit",
    "en": "Borobudur temple seen from the northwest at sunrise"
  },
  "focus": { "x": 0.5, "y": 0.45 },       // titik fokus 0–1 → object-position CSS
  "fetchedAt": "2026-10-23"
}
```

`credit` disimpan **sudah final bentuknya** supaya UI tidak menyusun string sendiri (konsisten dengan keputusan K1: blok sumber dihapus dari UI; hanya baris kredit di bawah foto yang tampil).

Gate build (lisensi/alt wajib — fail-closed):

```js
// scripts/validate-images.mjs
import { readFileSync, existsSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('src/data/images.manifest.json', 'utf8'));
const ALLOWED = ['pd', 'cc0', 'cc-by', 'cc-by-sa'];
const errors = [];
for (const img of manifest) {
  if (!ALLOWED.includes(img.licenseGroup)) errors.push(`${img.id}: licenseGroup "${img.licenseGroup}" tidak diizinkan`);
  if (!img.licenseUrl?.startsWith('http')) errors.push(`${img.id}: licenseUrl kosong`);
  for (const lang of ['id', 'en']) {
    if (!img.alt?.[lang]?.trim()) errors.push(`${img.id}: alt.${lang} kosong`);
  }
  if (!img.credit?.includes(img.author)) errors.push(`${img.id}: credit tidak memuat nama author`);
  for (const f of ['480.avif', '960.avif', '1600.avif', '480.webp', '960.webp']) {
    if (!existsSync(`public/images/${img.file}/${f}`)) errors.push(`${img.id}: file hilang ${f}`);
  }
}
if (errors.length) { console.error('MANIFEST INVALID:\n' + errors.join('\n')); process.exit(1); }
```

package.json: `"build": "node scripts/validate-images.mjs && vite build"`.

Tambahan disiplin (opsional tapi disarankan):
- Setiap entri manifest menyimpan `sourcePageRevId` (dari `imageinfo[0]` bila tersedia / `descriptionurl`) agar audit lisensi bisa ditelusuri.
- Warning bila `licenseGroup !== 'pd' && licenseGroup !== 'cc0'` — ingatkan bahwa kredit wajib tampil (CC BY/BY-SA).

---

## 9. CWV — format `<picture>` mendukung performa

Sumber: https://web.dev/articles/optimize-lcp (diperiksa 2026-10-23), MDN image formats (https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types), caniuse (https://caniuse.com/avif, data mentah https://github.com/Fyrd/caniuse/blob/main/features-json/avif.json).

Dukungan browser AVIF 2026 (caniuse): **96.33% global**. Chrome 85+, Edge 121+, Firefox 93+, Safari 16.1 (parsial) / 16.4+ penuh, Safari iOS 16+, Opera 71+, Samsung Internet 14+; versi terkini semua didukung (Chrome 155–159, Safari 26–27, Firefox 158–161). Yang tertinggal: Opera Mini, IE, KaiOS, QQ Browser, Safari/iOS < 16.0. → **fallback `<picture>` ke WebP wajib** (WebP didukung semua mayor, Safari 14+).

Pattern komponen React `<CountryPhoto>`:

```tsx
const isLCP = /* true hanya utk 1 gambar hero per halaman */ false;

<picture>
  <source type="image/avif"
          srcSet={`/images/${m.file}/480.avif 480w, /images/${m.file}/960.avif 960w, /images/${m.file}/1600.avif 1600w`}
          sizes="(max-width: 480px) 100vw, (max-width: 960px) 100vw, 1600px" />
  <source type="image/webp"
          srcSet={`/images/${m.file}/480.webp 480w, /images/${m.file}/960.webp 960w`}
          sizes="(max-width: 960px) 100vw, 960px" />
  <img
    src={`/images/${m.file}/960.webp`}
    width={m.width} height={m.height}          // CLS = 0, wajib eksplisit
    alt={lang === 'id' ? m.alt.id : m.alt.en}
    decoding="async"
    loading={isLCP ? 'eager' : 'lazy'}          // LCP TIDAK boleh lazy
    fetchPriority={isLCP ? 'high' : undefined}  // high HANYA di LCP (>1 = tidak guna)
    style={{ objectPosition: `${m.focus.x * 100}% ${m.focus.y * 100}%` }}
  />
</picture>
```

Aturan dari web.dev/articles/optimize-lcp (wajib dipatuhi):
1. `fetchpriority="high"` hanya pada 1–2 kandidat LCP; menanamkannya di semua gambar menghilangkan efeknya.
2. Jangan `loading="lazy"` pada LCP — request gambar tertunda sampai layout yakin ia masuk viewport.
3. Bila LCP hanya direferensikan via CSS/JS boundary, gunakan `<link rel="preload" fetchpriority="high" as="image" ...>`; preload scanner menemukan `<img src/srcset>` di HTML awal — pastikan hero ada di markup, bukan hasil render CSR terlambat (situs ini Vite statis → prerender/SSG atau markup img tetap di HTML).
4. Format AVIF/WebP memotong resource load duration (komponen ke-3 LCP).

LQIP memastikan percepatan persepsi: render `background: m.lqip` + `m.dominant` saat blur memudar — tanpa menghalangi `fetchpriority` hero.

---

## 10. Jebakan legal di Commons & aturan pemilihan paling aman

Sumber: https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia , https://commons.wikimedia.org/wiki/Commons:Freedom_of_panorama , https://commons.wikimedia.org/wiki/Commons:Non-copyright_restrictions / Commons:Personality_rights (dirujuk dari halaman Reusing), keduanya diperiksa 2026-10-23. Commons TIDAK memberi garansi status hak cipta — audit tetap tugas kita.

1. **PD terbatas yurisdiksi.** `PD-US` berarti PD di AS (sering karena aturan tanggal publikasi AS), belum tentu di negara asal karya. Commons menerima file bila PD di AS **atau** negara asal — jadi file bisa di-host PD-partial. Untuk site publik global: utamakan **PD-old-100** (pencipta meninggal >100 th, PD hampir di semua yurisdiksi Berne) atau **CC0**; record jenis PD di manifest.
2. **Freedom of panorama (FOP).** Foto bangunan/patung/seni publik modern = karya derivatif → butuh FOP negara terkait atau lisensi pencipta. Negara **tanpa** FOP: Prancis, Italia, Yunani, Belgia (bangunan ✔, dll. — cek per kasus), Indonesia (masuk daftar no-FOP di halaman FOP), dsb. Negara FOP **non-komersial saja** (Korea Selatan, Vietnam pasca-2023, Nigeria pasca-2023): Commons menganggap tidak cukup → jangan dipakai situs komersial mana pun.
   Menghindari masalah ini: bisa memilih situs yang HANYA berisi foto monumen **kuno/UNESCO World Heritage dengan pencipta >100 tahun meninggal** (Borobudur, Angkor Wat, Taj Mahal, Gyeongbokgung dilihat dari jauh bendahara) atau **pemandangan alam** — bukan patung ideal kota modern.
3. **Orang yang dapat diidentifikasi.** Hak pribadi/personality rights berdiri sendiri di luar hak cipta (Commons:Personality rights). Wajah close-up orang perorangan tanpa model release = rawan. Hindari; lebih aman: kerumunan jauh/dari belakang, bentang alam.
4. **Peta dengan perbatasan sengketa.** Commons menampung peta ber-POV nasional (India/Pakistan, Tiongkok/India, dll.). Untuk site edukasi netral: **jangan pakai peta politik** dari Commons; pakai foto/geomatik statis lain, atau buat peta sendiri (klaim Kuil/geojson sederhana). Tambah rule validator: tolak mime `image/svg+xml` (ciri peta/grafis) — sudah di poin 1.
5. **Rule pemilihan paling aman untuk situs edukasi publik:**
   - `licenseGroup` awal pencarian: **PD (PD-old-100) atau CC0 saja** → fallback CC BY / CC BY-SA bila tidak ketemu; **tolak otomatis** NC/ND/GFDL-only/fair-use/no-license.
   - Subjek: monumen bersejarah (pencipta >100 th) atau pemandangan alam — bebas persoalan FOP modern.
   - Tanpa wajah close-up, tanpa peta politik sengketa, `Restrictions` kosong.
   - `mime === 'image/jpeg'` (atau PNG untuk foto) — buang SVG/PDF.
   - Tiap foto dicatat `sourceUrl` + tanggal fetch di manifest → audit trail siap kapan pun diklaim.

---

## Lampiran — daftar sumber (semua diakses 2026-10-23)

| # | URL |
|---|---|
| API | https://www.mediawiki.org/wiki/API:Imageinfo |
| CORS/origin | https://www.mediawiki.org/wiki/API:CORS |
| U-Agent | https://foundation.wikimedia.org/wiki/Policy:User-Agent_policy |
| Etiquette | https://www.mediawiki.org/wiki/API:Etiquette |
| Rate limits | https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits |
| metadata | https://commons.wikimedia.org/wiki/Commons:Machine-readable_data |
| Reuse | https://commons.wikimedia.org/wiki/Commons:Reusing_content_outside_Wikimedia |
| Credit line | https://commons.wikimedia.org/wiki/Commons:Credit_line |
| TASL / attribution | https://wiki.creativecommons.org/wiki/Recommended_practices_for_attribution |
| CC BY-SA 4.0 legal | https://creativecommons.org/licenses/by-sa/4.0/legalcode |
| sharp output | https://sharp.pixelplumbing.com/api-output |
| sharp resize | https://sharp.pixelplumbing.com/api-resize |
| sharp .d.ts | https://github.com/lovell/sharp/blob/master/lib/index.d.ts |
| MDN format | https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Image_types |
| caniuse AVIF | https://caniuse.com/avif (+ https://github.com/Fyrd/caniuse/blob/main/features-json/avif.json) |
| LCP | https://web.dev/articles/optimize-lcp |
| FOP | https://commons.wikimedia.org/wiki/Commons:Freedom_of_panorama |
| Personality | https://commons.wikimedia.org/wiki/Commons:Personality_rights |
| Blurhash (alternatif) | https://github.com/woltapp/blurhash |

## Catatan risiko & yang tidak diketahui

- Nilai KB di poin 7 = **proyeksi** dari statistik kompresi resmi MDN (AVIF ≈ 50% lebih kecil dari JPEG), bukan benchmark aktual proyek; benchmark aktual wajib dijalankan saat implementasi (`await stat(size)` hasil toBuffer).
- Multi-lisensi Commons (GFDL+CC, dua CC berbeda) tidak selalu terekspos lengkap di `License`/`LicenseShortName` — perlu audit manual 15 negara; regex di poin 4 didesain fail-closed untuk ini.
- Halaman `Commons:Personality_rights` & `Commons:Credit_line` hanya dirujuk dari halaman resmi lain (belum di-fetch penuh); ditandai bila implementator perlu audit lebih dalam.
- `origin=*` diperlukan hanya bila ada rencana fetch di browser; pipeline kita berjalan Node build-time (UA header yang menentukan, bukan origin).
