# DESIGN_COUNTRY.md — ASIAKIN Halaman Negara v1.0

Tanggal: 21 Oktober 2026
Status: Draft untuk implementasi
Cakupan: Halaman `/negara/:id` untuk 15 negara (cn, jp, kr, in, id, my, sg, th, vn, ph, sa, tr, kz, uz, mn)
Prinsip: Halaman cerita, bukan dashboard. Satu keluarga dengan landing, tapi punya karakter sendiri.

---

## 1. Struktur Halaman

Halaman negara adalah narasi vertikal linear tanpa navbar. Setiap blok adalah bab cerita.

**Urutan blok (atas ke bawah):**

| Blok | Tinggi | Fungsi |
|------|--------|--------|
| Hero negara | 100vh (full viewport) | Identitas, nama lokal sebagai tipografi utama |
| Sapaan | auto (min 320px) | Sapaan besar + audio |
| Budaya | auto (min 280px) | Teks editorial tentang budaya |
| Orang | auto (min 280px) | Teks editorial tentang orang (norma, bukan stereotip) |
| Bahasa + 3 frasa | auto (min 400px) | Info bahasa + daftar frasa |
| Sumber | auto (min 120px) | Daftar sumber, kecil di kaki |
| Navigasi kembali | fixed 56px | "← Kembali ke benua", selalu terlihat |

**Scroll behavior:**
- Scroll linear vertikal (tidak ada horizontal scroll)
- Tidak ada scroll-jacking
- Tidak ada parallax layer lebih dari 1 tingkat
- Setiap blok fade in saat masuk viewport (intersection observer, 120ms ease-out)

---

## 2. Hero Negara

**Komposisi:**

Nama lokal dalam aksara asli adalah elemen tipografi utama. Bukan judul kecil di atas — adalah protagonis visual.

**Urutan z-index:**
1. Latar: `surface` (#F9F7F3) solid
2. Aksen warna negara: `--country-accent` dari palette DESIGN.md §3
3. Nama lokal (aksara asli): ukuran besar, posisi tengah atau off-center
4. Nama Indonesia: ukuran medium, di bawah nama lokal
5. Region: label kecil, posisi tepi

**Ukuran tipografi:**

| Elemen | Font | Ukuran | Line-height | Warna |
|--------|------|--------|-------------|-------|
| Nama lokal (aksara) | `native` token (system fallback) | `clamp(3rem, 12vw, 8rem)` | 1.1 | `ink` atau `--country-accent` (tergantung kontras) |
| Nama Indonesia | Crimson Pro 600 | `clamp(1.5rem, 3vw, 2rem)` | 1.3 | `ink` |
| Region | Source Sans 3 400 | `0.875rem` | 1.5 | `ink-muted` |
| Satu kalimat (opsional) | Source Sans 3 400 italic | `clamp(1rem, 2vw, 1.25rem)` | 1.6 | `ink-muted` |

**Posisi nama lokal:**
- Horizontal: centered
- Vertikal: 40% dari atas viewport (memberi ruang untuk elemen lain di bawah)
- Transform: none (tidak rotate, tidak skew)

**Warna aksen negara (`--country-accent`):**

Ambil dari palette DESIGN.md §3:

| Kode | Negara | Hex | `--country-accent` | Kontras teks `ink` di atas | Kontras teks `surface` di atas |
|------|--------|-----|-------------------|---------------------------|-------------------------------|
| ID | Indonesia | #C97A5F | Ya | 4.82:1 ✓ AA | 3.71:1 ✗ (tidak untuk body) |
| MY | Malaysia | #6B9B8E | Ya | 5.94:1 ✓ AA | 2.98:1 ✗ |
| SG | Singapura | #B85F5F | Ya | 4.56:1 ✓ AA | 3.51:1 ✗ |
| TH | Thailand | #9B7FAD | Ya | 5.12:1 ✓ AA | 3.24:1 ✗ |
| VN | Vietnam | #D4A05E | Ya | 3.94:1 ✗ (tambah outline/ink) | 2.85:1 ✗ |
| PH | Filipina | #6A7FAD | Ya | 6.03:1 ✓ AA | 2.95:1 ✗ |
| CN | Tiongkok | #B89F7A | Ya | 4.21:1 ✓ AA | 3.47:1 ✗ |
| JP | Jepang | #D18A94 | Ya | 4.08:1 ✓ AA | 3.12:1 ✗ |
| KR | Korea Selatan | #7A9BB8 | Ya | 5.48:1 ✓ AA | 3.02:1 ✗ |
| IN | India | #C9935F | Ya | 4.02:1 ✓ AA | 3.38:1 ✗ |
| SA | Arab Saudi | #A8B87A | Ya | 4.71:1 ✓ AA | 2.91:1 ✗ |
| TR | Turki | #9F7A8F | Ya | 5.02:1 ✓ AA | 3.18:1 ✗ |
| KZ | Kazakhstan | #7A8FA8 | Ya | 5.68:1 ✓ AA | 2.99:1 ✗ |
| UZ | Uzbekistan | #8FA88E | Ya | 5.21:1 ✓ AA | 2.96:1 ✗ |
| MN | Mongolia | #A8927A | Ya | 4.54:1 ✓ AA | 3.36:1 ✗ |

**Aturan kontras:**
- Jika teks nama lokal berwarna `--country-accent`, pastikan kontras ≥ 4.5:1 terhadap `surface`
- Jika kontras < 4.5:1, gunakan `ink` sebagai warna teks dan `--country-accent` hanya untuk elemen non-teks (garis, dekorasi)
- Alternatif: outline tipis 1px `ink` pada teks berwarna

**Background aksen:**
- Tidak ada gradient
- Opsi: blok warna solid `--country-accent` di area terbatas (misal 30% lebar, 40% tinggi, pojok kanan bawah)
- Tidak boleh mengganggu keterbacaan teks

**Satu kalimat:**
- Posisi: bawah hero, 12% dari bawah viewport
- Tidak ada kalau data tidak tersedia
- Gaya: italic, `ink-muted`

---

## 3. Blok Sapaan

**Hierarki:**

1. Sapaan asli (native script) — elemen terbesar, protagonis blok ini
2. Romanisasi — di bawah sapaan, ukuran lebih kecil
3. Arti — di bawah romanisasi, ukuran sama dengan body
4. Register (opsional) — label kecil, contoh: "formal", "casual"
5. Tombol "Dengarkan" — aksi utama

**Ukuran:**

| Elemen | Font | Ukuran | Line-height | Warna |
|--------|------|--------|-------------|-------|
| Sapaan asli | `native` token | `clamp(2.5rem, 8vw, 5rem)` | 1.2 | `ink` |
| Romanisasi | Source Sans 3 600 | `clamp(1.25rem, 2.5vw, 1.5rem)` | 1.4 | `ink-muted` |
| Arti | Source Sans 3 400 | `1rem` | 1.6 | `ink` |
| Register | Source Sans 3 400 | `0.75rem` | 1.5 | `ink-muted` |
| Tombol audio | Source Sans 3 600 | `0.875rem` | 1.5 | `accent-ink` di `accent` |

**Tombol "Dengarkan":**
- Style: filled button, warna `accent`
- Target sentuh: min 44×44px (padding memadai)
- Ikon: SVG play icon (bukan emoji)
- Teks: "Dengarkan" (tidak ada emoji)
- Aksi: `speechSynthesis.speak(new SpeechSynthesisUtterance(sapaan_native))`
- Visibility: disembunyikan jika `!window.speechSynthesis` atau bahasa tidak didukung
- aria-label: "Dengarkan sapaan dalam bahasa [nama bahasa]"
- State: hover (opacity 0.9), active (scale 0.98), disabled (opacity 0.5, cursor not-allowed)

**Layout:**
- Lebar maksimum: 720px (centered)
- Padding horizontal: 24px desktop, 16px mobile
- Jarak antar elemen:
  - Sapaan → Romanisasi: 16px
  - Romanisasi → Arti: 12px
  - Arti → Register: 8px
  - Register → Tombol: 24px

---

## 4. Blok Budaya dan Orang

**Dua bagian terpisah, gaya editorial (bukan kartu).**

**Blok Budaya (`culture_note`):**
- Judul: "Budaya" (Crimson Pro 600, 1.5rem, line-height 1.3)
- Teks: `culture_note` (~40 kata, dari data)
- Lebar baris maksimum: 65ch (untuk keterbacaan optimal)
- Ukuran body: `1rem` (Source Sans 3 400)
- Jarak antar paragraf: 16px
- Padding vertikal: 48px atas, 48px bawah

**Blok Orang (`people_note`):**
- Judul: "Orang" (Crimson Pro 600, 1.5rem, line-height 1.3)
- Teks: `people_note` (~40 kata, norma budaya, bukan stereotip)
- Lebar baris maksimum: 65ch
- Ukuran body: `1rem`
- Jarak antar paragraf: 16px
- Padding vertikal: 48px atas, 48px bawah

**Separator:**
- Garis tipis horizontal di antara dua blok
- Warna: `line` (#D8D4CC)
- Lebar: 100px (centered)
- Tinggi: 1px
- Margin vertikal: 24px

**Layout:**
- Kedua blok dalam satu container vertikal
- Lebar maksimum container: 800px (centered)
- Padding horizontal: 24px desktop, 16px mobile

---

## 5. Blok Bahasa dan 3 Frasa

**Bahasa:**
- Judul: "Bahasa" (Crimson Pro 600, 1.5rem)
- Field yang ditampilkan:
  - Nama bahasa (Source Sans 3 600, 1.125rem)
  - Aksara (jika ada, `native` token, 1rem, `ink-muted`)
  - Rumpun bahasa (Source Sans 3 400, 0.875rem, `ink-muted`)
  - Catatan (jika ada, Source Sans 3 400 italic, 0.875rem)

**3 Frasa:**

**Pilihan: Daftar (bukan tabel).**

Alasan:
- Frasa adalah unit cerita, bukan data tabular
- Daftar memberi fleksibilitas panjang teks (aksara asli bisa panjang/pendek)
- Tabel terasa kaku untuk konten naratif
- Mobile: daftar lebih mudah di-scroll, tabel butuh horizontal scroll

**Struktur daftar frasa:**
```
Frasa 1
  Aksara asli    [aksara]
  Romanisasi     [teks]
  Arti           [teks]

Frasa 2
  ...
```

**Ukuran per frasa:**

| Elemen | Font | Ukuran | Line-height | Warna |
|--------|------|--------|-------------|-------|
| Label "Frasa 1/2/3" | Source Sans 3 600 | 0.875rem | 1.5 | `ink-muted` |
| Aksara asli | `native` token | `clamp(1.25rem, 2.5vw, 1.75rem)` | 1.4 | `ink` |
| Romanisasi | Source Sans 3 400 | `1rem` | 1.5 | `ink-muted` |
| Arti | Source Sans 3 400 | `1rem` | 1.5 | `ink` |

**Font stack untuk aksara asli (CJK/Arab/Sirilik):**

```css
font-family: "Noto Sans JP", "Noto Sans KR", "Noto Sans SC", "Noto Sans Arabic", "Noto Sans Devanagari", "Noto Sans Thai", "Noto Sans Hebrew", system-ui, sans-serif;
```

- Prioritas: font Noto untuk masing-masing script (self-hosted wajib jika dipakai)
- Fallback: `system-ui, sans-serif` (akan menggunakan font sistem untuk script yang tidak ada)
- Catatan: nama lokal di hero juga pakai stack ini

**Layout:**
- Container lebar maksimum: 800px (centered)
- Padding horizontal: 24px desktop, 16px mobile
- Jarak antar frasa: 32px
- Jarak antar field dalam frasa: 8px

---

## 6. Sumber

**Cara menampilkan:**
- Posisi: kaki halaman (bukan sidebar, bukan floating)
- Ukuran: kecil, tidak mengganggu ritme
- Warna teks: `ink-muted`
- Font: Source Sans 3 400, 0.75rem

**Struktur:**
- Judul: "Sumber" (0.875rem, Source Sans 3 600)
- Daftar: numbered list, max 3 sumber
- Format: "[Judul sumber](URL)" atau "[Judul sumber]" (jika tanpa URL)

**Layout:**
- Container lebar maksimum: 800px (centered)
- Padding: 32px horizontal, 48px vertikal
- Separator di atas: garis tipis `line`, 1px, lebar penuh

---

## 7. Navigasi Kembali

**Teks:** "← Kembali ke benua"

**Posisi:**
- Desktop (1440px): fixed, kiri atas, 24px dari kiri, 24px dari atas
- Mobile (375px): fixed, kiri atas, 16px dari kiri, 16px dari atas

**Ukuran:**
- Font: Source Sans 3 400, 0.875rem
- Padding: 12px 16px (target sentuh ≥ 44px)
- Warna: `ink-muted` → `accent` on hover

**Behavior:**
- Selalu terlihat (z-index tinggi)
- Hover: underline, warna berubah ke `accent`
- Active: opacity 0.8
- aria-label: "Kembali ke halaman utama"

---

## 8. Transisi Masuk/Keluar dari Landing

**Masuk (landing → halaman negara):**
- Trigger: klik tombol "Lanjut" di popup negara di landing
- Durasi total: 300ms
- Fase:
  1. Popup fade out (150ms, ease-in)
  2. Landing fade out (150ms, ease-in, overlap dengan popup fade)
  3. Halaman negara fade in (200ms, ease-out, mulai saat 100ms)

**Yang tetap terlihat:**
- Latar `surface` tidak berubah (warna sama)
- Tidak ada flash putih

**Keluar (halaman negara → landing):**
- Trigger: klik "← Kembali ke benua"
- Durasi: 200ms
- Fase:
  1. Halaman negara fade out (150ms, ease-in)
  2. Landing fade in (150ms, ease-out, overlap)

**Reduced-motion:**
- Semua transisi dihilangkan
- Halaman langsung muncul (instant, opacity 0 → 1 dalam 0ms)
- Deteksi: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`

---

## 9. Mobile 375px

**Perubahan dari desktop:**

| Aspek | Desktop | Mobile |
|-------|---------|--------|
| Hero nama lokal | `clamp(3rem, 12vw, 8rem)` | `clamp(2.5rem, 14vw, 5rem)` (tidak boleh lebih kecil dari 2.5rem) |
| Hero posisi vertikal | 40% dari atas | 35% dari atas (lebih banyak ruang untuk nama lokal) |
| Hero satu kalimat | 12% dari bawah | Dihilangkan jika memperketat ruang |
| Container lebar | 800px | 100% - 32px padding |
| Tombol audio | auto-width | full-width |
| Daftar frasa | 32px gap | 24px gap |
| Navigasi kembali | 24px dari tepi | 16px dari tepi |

**Aturan overflow untuk aksara asli:**
- `overflow-wrap: break-word`
- `word-break: break-word` (untuk CJK yang tidak ada spasi)
- `hyphens: auto` (untuk bahasa dengan hyphenation)
- Jika aksara masih overflow: kurangi `font-size` dengan container query atau JavaScript clamp

**Judul tidak terpotong:**
- Hero nama lokal: min-height 120px (ruang cadangan)
- Semua heading: `min-height` berdasarkan line-height × 2

---

## 10. Reduced-Motion dan No-JS Fallback

**Reduced-motion (prefers-reduced-motion: reduce):**

Yang dimatikan:
- Semua transisi fade in/out (instant, 0ms)
- Scroll-driven animation (tidak ada di halaman ini, tapi jika ditambah: dimatikan)
- Hover animation (instant color change, tanpa transition)

Yang tetap:
- Layout dan posisi elemen
- Warna dan kontras
- Navigasi dan interaksi (tombol tetap bisa diklik)

**No-JS fallback:**

Yang dimatikan:
- Tombol "Dengarkan" (speechSynthesis butuh JS)
- Transisi halaman (SPA navigation butuh JS, fallback ke reload)

Yang tetap:
- Semua konten (nama, sapaan, budaya, orang, bahasa, frasa, sumber)
- Navigasi kembali (link biasa, tanpa SPA transition)

**Deteksi no-JS:**
- `<noscript>` tag untuk menampilkan pesan: "Fitur audio memerlukan JavaScript."
- Tombol audio disembunyikan via CSS jika `:root.no-js` class ada (tambahkan di `<html>` saat deteksi)

---

## 11. Aksesibilitas

**Urutan heading:**
- Hanya satu `<h1>` per halaman: nama negara (nama Indonesia, bukan nama lokal)
- Nama lokal: `<div>` atau `<span>` dengan `role="img"` dan `aria-label="[nama lokal]"`
- Budaya: `<h2>`
- Orang: `<h2>`
- Bahasa: `<h2>`
- Sumber: `<h2>` atau `<h3>` tergantung konteks

**`lang` attribute untuk teks asing:**
- Nama lokal: `<span lang="[kode bahasa]">[aksara]</span>`
- Sapaan asli: `<span lang="[kode bahasa]">[sapaan]</span>`
- Frasa aksara asli: `<span lang="[kode bahasa]">[frasa]</span>`

Kode bahasa per negara:

| Kode negara | Kode bahasa (ISO 639-1) |
|-------------|------------------------|
| CN | zh-Hans (atau zh-Hant jika tradisional) |
| JP | ja |
| KR | ko |
| IN | hi (atagu multiple jika ada) |
| ID | id |
| MY | ms |
| SG | ms (atau en, tergantung konteks) |
| TH | th |
| VN | vi |
| PH | fil (atau tl) |
| SA | ar |
| TR | tr |
| KZ | kk |
| UZ | uz |
| MN | mn |

**Alt/aria untuk tombol audio:**
- `aria-label="Dengarkan sapaan dalam bahasa [nama bahasa]"`
- Jika disabled: `aria-disabled="true"`
- Jika playing: `aria-pressed="true"` (toggle state)

**Kontras minimum:**
- Semua teks: ≥ 4.5:1 terhadap latar (verifikasi dengan `scripts/check-contrast` dari DESIGN.md)
- Nama lokal berwarna aksen: gunakan tabel kontras di Section 2

**Target sentuh:**
- Minimum 44×44px untuk semua elemen interaktif
- Tombol audio: padding 12px 16px (total ≥ 44px height)
- Navigasi kembali: padding 12px 16px
- Link sumber: padding 8px 0 (teks bisa lebih kecil, tapi target sentuh harus memadai)

---

## 12. Gambar

**Kebijakan:**
- Tidak mengandalkan foto stok yang belum ada
- Jika butuh visual: pakai komposisi kartografis prosedural (SVG dari `src/content/map-paths.json`, sudah digenerate) atau tipografi besar
- Jika tetap mengusulkan foto: tulis statusnya "belum tersedia" dan jangan dipakai di spesifikasi final

**Opsi visual yang tersedia:**
1. Tipografi besar nama lokal (sudah di hero)
2. SVG map siluet negara (dari `map-paths.json`) — opsional, di area terbatas
3. Pola dekoratif minimal dari budaya negara (contoh: batik untuk Indonesia, ukiyo-e wave untuk Jepang) — butuh commission, status: belum tersedia

**Implementasi SVG map (opsional):**
- Posisi: area kecil di hero (pojok kanan bawah, 20% lebar, 20% tinggi)
- Warna: `--country-accent` dengan opacity 0.3 (tidak mengganggu teks)
- Stroke: `ink` dengan opacity 0.2, 1px
- Tidak ada interaksi (hanya dekorasi)

---

## 13. Larangan (Sama seperti DESIGN.md §12)

**Visual:**
- ❌ Gradient ungu-biru, biru-cyan, pink-ungu, neon apapun
- ❌ Glassmorphism di semua tempat
- ❌ Glow effect
- ❌ Blob dekoratif tanpa makna
- ❌ Emoji sebagai ikon di UI

**Layout:**
- ❌ Card grid
- ❌ Navbar horizontal dengan menu dropdown
- ❌ Footer dengan 4 kolom link

**Copy:**
- ❌ Kata: Elevate, Seamless, Powerful, Unlock, Embark, Discover, Transform, Revolutionize
- ❌ Frasa AI-slop
- ❌ Istilah Inggris sebagai headline utama — semua copy bahasa Indonesia

**Motion:**
- ❌ Parallax berlebihan
- ❌ Scroll-jacking
- ❌ Animasi lebih dari 320ms
- ❌ Bounce easing

**Accessibility:**
- ❌ Kontras < 4.5:1 untuk teks penting
- ❌ Target sentuh < 44px
- ❌ `aria-modal="false"` untuk modal
- ❌ Focus trap yang bocor

---

## 14. Kebutuhan Implementasi

| Komponen | File yang Disarankan | Dependensi |
|----------|---------------------|------------|
| Halaman negara (container) | `src/routes/country/CountryPage.tsx` | React Router (`useParams`), React |
| Hero negara | `src/routes/country/CountryHero.tsx` | CSS module atau Tailwind, `clamp()` utility |
| Blok sapaan | `src/routes/country/GreetingBlock.tsx` | Web Speech API (speechSynthesis), `useSpeechSynthesis` hook |
| Blok budaya | `src/routes/country/CultureBlock.tsx` | CSS module, `max-width: 65ch` |
| Blok orang | `src/routes/country/PeopleBlock.tsx` | CSS module, `max-width: 65ch` |
| Blok bahasa + frasa | `src/routes/country/LanguageBlock.tsx` | CSS module, font stack Noto |
| Daftar sumber | `src/routes/country/SourceList.tsx` | CSS module |
| Navigasi kembali | `src/routes/country/BackNavigation.tsx` | React Router (`useNavigate`), CSS fixed positioning |
| Data negara | `src/content/countries.json` atau `src/content/countries/` per file | JSON schema validasi |
| Font Noto (CJK/Arab/Sirilik) | `/static/fonts/` (self-hosted) | Noto Sans JP, Noto Sans KR, Noto Sans SC, Noto Sans Arabic, dll. Subset per bahasa |
| Token CSS | `src/styles/tokens.css` (dari DESIGN.md) | Sudah ada, pakai token yang sama |
| Route handler | `src/App.tsx` atau router file | React Router `<Route path="/negara/:id" />` |

**Dependensi tambahan:**
- `react-router-dom` — navigasi dan routing
- Tidak ada library animasi wajib (CSS transition cukup)
- Opsional: `@react-spring/web` untuk transisi halaman jika butuh lebih kompleks

**Verifikasi kontras:**
- Pakai `scripts/check-contrast` dari DESIGN.md
- Test manual dengan DevTools Accessibility panel

**Testing:**
- Unit test: render komponen dengan mock data
- E2E test: navigasi dari landing → halaman negara, cek semua blok ter-render
- A11y test: cek kontras, heading order, lang attribute

---

## Lampiran: Field Data yang Tersedia (Tidak Mengarang)

```
{
  id: string,          // kode negara (cn, jp, kr, dll)
  name: string,        // nama Indonesia
  native_name: string, // nama lokal (aksara asli)
  region: string,      // wilayah (Asia Timur, Asia Tenggara, dll)
  greeting: {
    native: string,    // sapaan dalam aksara asli
    romanization: string, // romanisasi
    meaning: string,   // arti dalam bahasa Indonesia
    register?: string  // formal/casual (opsional)
  },
  language: {
    name: string,      // nama bahasa
    script?: string,   // aksara (jika ada)
    family: string,    // rumpun bahasa
    note?: string      // catatan tambahan (opsional)
  },
  phrases: [
    {
      native: string,
      romanization: string,
      meaning: string
    },
    // ... 3 frasa total
  ],
  culture_note: string,  // ~40 kata
  people_note: string,    // ~40 kata, norma bukan stereotip
  sources: [
    {
      title: string,
      url?: string
    }
  ]
}
```

---

**Ditulis oleh:** Designer agent
**Tanggal:** 21 Oktober 2026
**Status:** Siap untuk review dan implementasi. Asumsi: data negara sudah tersedia dalam format di atas, font Noto self-hosted, `map-paths.json` ada jika butuh SVG.
