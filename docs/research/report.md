# Riset Referensi Visual — Parallax & Scroll Narrative

Digenerate oleh `docs/research/capture.mjs` pada 2026-10-20T17:42:59.606Z (Playwright/Chromium, desktop 1440×900 & mobile 390×844, deviceScaleFactor 1, reducedMotion `no-preference`).
Screenshot: 60 file di `docs/research/shots/`. Data mentah: `docs/research/metrics.json`.

Target yang dipakai (situs nyata dari daftar awwwards/parallax): **Apricode** dan **Lenval Properties**. Halaman koleksi ikut direkam sebagai bukti sumber seleksi.

---

## 1. Metrik per halaman

| URL | viewport | tinggi (vh) | sticky | pinned | video | canvas | matrix3d | data-scroll* | HTTP | catatan |
|---|---|---|---|---|---|---|---|---|---|---|
| https://www.awwwards.com/websites/parallax/ | desktop | 10.69 | 0 | 0 | 0 | 0 | 0 | 0 | 200 | 1 console error |
| https://apricode.agency/ | desktop | 15.89 | 4 | 3 | 2 | 3 | 1 | 0 | 200 | - |
| https://lenvalproperties.com/ | desktop | 14.69 | 8 | 6 | 5 | 4 | 7 | 13 | 200 | 1 video autoplay |
| https://motion.dev/ | desktop | 14.25 | 0 | 0 | 15 | 1 | 24 | 0 | 200 | 1 console error |
| https://threejs.org/ | desktop | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 200 | - |
| https://threejs.org/examples/ | desktop | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 200 | - |
| https://www.awwwards.com/websites/parallax/ | mobile | 26.82 | 1 | 1 | 0 | 0 | 0 | 0 | 200 | 1 console error |
| https://apricode.agency/ | mobile | 15.92 | 4 | 3 | 2 | 3 | 0 | 0 | 200 | - |
| https://lenvalproperties.com/ | mobile | 9.1 | 8 | 0 | 5 | 4 | 7 | 13 | 200 | 1 video autoplay |
| https://motion.dev/ | mobile | 16.87 | 0 | 0 | 15 | 1 | 24 | 0 | 200 | 1 console error |
| https://threejs.org/ | mobile | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 200 | - |
| https://threejs.org/examples/ | mobile | 1 | 0 | 0 | 0 | 0 | 0 | 0 | 200 | - |

> `pinned` = elemen `position: sticky` yang tinggi parent-nya > 105% viewport (satu section mengunci satu elemen untuk beberapa layar). `matrix3d` = elemen dengan transform 3D aktif saat metric dibaca (indikatif; nilai bisa 0 kalau transform di-set hanya saat scroll).

### Detail section pinned


### apricode — desktop — pinned
- `div.visual-stage` — top: 0px, parent 7vh
- `div.portfolio-surface` — top: 0px, parent 5.89vh
- `section.reel-screen` — top: 0px, parent 1.8vh

### lenval — desktop — pinned
- `div.project-card_img` — top: 0px, parent 2.88vh
- `div.project-card_video-screen` — top: 0px, parent 2.88vh
- `div.project-card_info` — top: auto, parent 2.88vh
- `div.project-card_img` — top: 0px, parent 2.88vh
- `div.project-card_video-screen` — top: 0px, parent 2.88vh
- `div.project-card_info` — top: auto, parent 2.88vh

### awwwards-parallax — mobile — pinned
- `header._(tanpa class)_` — top: 0px, parent 26.82vh

### apricode — mobile — pinned
- `div.visual-stage` — top: 0px, parent 6.8vh
- `div.portfolio-surface` — top: 0px, parent 5.93vh
- `section.reel-screen` — top: 0px, parent 1.8vh

## 2. Bukti transform scroll-linked


### apricode (desktop)

| scroll | scrollY | selector | transform | opacity | rect.top |
|---|---|---|---|---|---|
| 0% | 0 | `main h1` | `none` | 1 | 438 |
| 0% | 0 | `[class*="hero"]` | `none` | 1 | 0 |
| 0% | 0 | `canvas` | `none` | 1 | 0 |
| 50% | 6699 | `main h1` | `none` | 1 | -861 |
| 50% | 6699 | `[class*="hero"]` | `none` | 1 | -1299 |
| 50% | 6699 | `canvas` | `none` | 1 | -1299 |
| 90% | 12057 | `main h1` | `none` | 1 | -6219 |
| 90% | 12057 | `[class*="hero"]` | `none` | 1 | -6657 |
| 90% | 12057 | `canvas` | `none` | 1 | -6657 |

### lenval (desktop)

| scroll | scrollY | selector | transform | opacity | rect.top |
|---|---|---|---|---|---|
| 0% | 9605 | `main h1` | `none` | 1 | -8464 |
| 0% | 9605 | `[class*="hero"]` | `none` | 1 | -9155 |
| 0% | 9605 | `section:first-of-type` | `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 450, 10, 1)` | 0.3 | -9155 |
| 0% | 9605 | `canvas` | `none` | 0.25 | 0 |
| 50% | 9605 | `main h1` | `none` | 1 | -8464 |
| 50% | 9605 | `[class*="hero"]` | `none` | 1 | -9155 |
| 50% | 9605 | `section:first-of-type` | `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 450, 10, 1)` | 0.3 | -9155 |
| 50% | 9605 | `canvas` | `none` | 0.25 | 0 |
| 90% | 11087 | `main h1` | `none` | 1 | -9946 |
| 90% | 11087 | `[class*="hero"]` | `none` | 1 | -10637 |
| 90% | 11087 | `section:first-of-type` | `matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 450, 10, 1)` | 0.3 | -10637 |
| 90% | 11087 | `canvas` | `none` | 0.25 | 0 |

## 3. Console error & pageerror


### awwwards-parallax — desktop

- console.error: `requestStorageAccess: Permission denied.`

### motion-dev — desktop

- console.error: `Failed to load resource: the server responded with a status of 401 ()`

### awwwards-parallax — mobile

- console.error: `requestStorageAccess: Permission denied.`

### motion-dev — mobile

- console.error: `Failed to load resource: the server responded with a status of 401 ()`

---

_(Analisis kualitatif tidak diselesaikan di sesi ini: proses capture mati dua kali karena ECONNRESET. Lihat bagian koreksi di bawah.)_

---

## Koreksi dari orchestrator — bagian yang **tidak boleh** dikutip

1. **Bagian 2 tidak membuktikan apa pun.** Kolom `transform` berisi `none` untuk semua selector, dan pada Lenval nilai `scrollY` sudah 9.605 px saat posisi yang dilaporkan "0%". Artinya skrip gagal me-reset posisi scroll sebelum mengukur (kemungkinan karena scroll restoration atau Lenis mengambil alih `scrollTo`). Angka di tabel itu **bukan** bukti animasi scroll-linked. Jangan dipakai sebagai rujukan.
2. **Kolom `matrix3d` dan `pinned` tetap berguna sebagai indikasi struktur**, bukan sebagai bukti perilaku: keduanya dibaca saat halaman diam, bukan saat bergerak.
3. **Yang tetap sah:** 60 file screenshot di `docs/research/shots/`. Semua klaim visual harus merujuk ke file gambar, bukan ke tabel metrik.
4. **Bagian 3 (console error) sah** dan relevan: dua situs referensi sendiri mencatat error konsol (`requestStorageAccess` di awwwards, 401 di motion.dev). Itu alasan tambahan untuk tidak menormalkan error konsol di proyek ini.

Analisis pola layout/motion yang dipakai sebagai dasar keputusan ada di `docs/DESIGN_LANDING_V4.md`, disusun dari pembacaan langsung screenshot tersebut.
