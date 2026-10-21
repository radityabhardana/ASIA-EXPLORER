# Verifikasi — Asia Explorer

Diperbarui 22 Oktober 2026. Lingkup: landing page dan 15 halaman negara di `asiakin-v3`.
Semua angka berasal dari pengukuran sendiri lewat Playwright pada server bersih (`localhost`,
Vite 8.3.4, Chromium 1.64.1), bukan dari laporan lane.

---

## 1. Perintah dan hasil

| Langkah | Perintah | Hasil |
|---|---|---|
| Typecheck | `npx tsc --noEmit` | `TSC_EXIT=0` |
| Lint | `npx eslint src e2e --max-warnings 0` | `ESLINT_EXIT=0` |
| Unit test | `npm test` | `Test Files 5 passed (5)`, `Tests 30 passed (30)` |
| Pipeline penuh | `VERIFY_E2E=1 npm run verify` | `VERIFY_EXIT=0` (8 langkah: typecheck, lint, vitest, build, model, kontras, konten, e2e) |

Cuplikan keluaran pipeline:

```text
  ok 31 [chromium-mobile-375] › e2e\country.spec.ts:33:3 › /negara/mn utuh di 375, 768, 1440 (3.1s)
  ok 32 [chromium-mobile-375] › e2e\country.spec.ts:104:1 › navigasi kembali tetap terlihat dan menuju beranda (1.4s)
  ok 22 [chromium-desktop] › e2e\landing.spec.ts:84:3 › landing visual › 15 tangkapan 5 posisi scroll tanpa error konsol (1.2m)
  ok 40 [chromium-mobile-375] › e2e\gates.spec.ts:196:3 › gates P0 › pixel size: measureInk().widthVw 62 ±3 at 1440 dan 85 ±4 at 375
```

`e2e/gates.spec.ts` dijalankan ulang terpisah setelah perbaikan P2.3: `13 skipped, 23 passed`
(`PW_EXIT=0`). `e2e/scene-lab.spec.ts` dijalankan sendiri setelah perbaikan harness:
`1 skipped, 1 passed`.

---

## 2. Gate yang mengikat

| Gate | Definisi lulus | Hasil terukur |
|---|---|---|
| Orientasi | `x(JP) − x(SA) > 20` dan `y(ID) − y(CN) > 20` | Jepang x 943,9 > Arab Saudi 355,6; Indonesia y 647,5 > Tiongkok 382,0 — north-up |
| No-flash | tidak ada `.country-map-svg` di DOM saat memuat; tinggi kotak hero berubah ≤4 px | lulus (sampling 100/300/600/1200/2000 ms) |
| Preloader | ≤1200 ms, sekali per sesi; muat langsung `/negara/:id` tanpa preloader | lulus di dua arah navigasi |
| Fallback | WebGL absen → `CountryMapSvg` 15 area bisa dipilih | lulus |
| Ukuran tinta | `measureInk().widthVw` 62 ±3 (1440), 85 ±4 (375) | 61,44 vw di 1440 |
| Grid | tepi kiri konten tiap `.landing-stage` 48 ±1 pada 1440 | 48 di 8 adegan |
| Overlap | judul × siluet = 0 px² | 0 px² (cultural, 1440) |
| Counter | teks counter = jumlah mark menyala; final 15/15 | 0/0, 4/4, 9/9, 13/13, 15/15, 15/15 |
| Diptych | kolom 48→672 dan 768→1392; caption sebaseline; ikon inline 28 px | lulus (1440) |
| Kaki halaman | `scrollHeight − clientHeight ≤ 1`; 15 tombol + mark terjangkau | 1000/1000 (1440), 1203/1203 (768), 2165/2165 (375) |
| Reveal mobile (D48) | copy ≥0,95 saat `copyTop ≈160` di 375 dan 768 | lulus 8 adegan × 2 viewport |
| Reveal negatif (D48) | tidak ada copy <0,05 saat section menutup ≥60% viewport | 0 pelanggaran |
| Cultural mobile (D48) | dua layer tampil, `left ≥ 0`, tabrakan 0 px², caption 16 ±1 | lulus (375) |

---

## 3. Reveal mengikuti geometri nyata (P2.3)

Penyebab cacat sebelumnya: satu ScrollTrigger global dengan pecahan `SCENE_RANGES` berbasis vh
desktop (cultural `620/920`). Di 375 dokumen 8986 px, pecahan itu jatuh 476 px setelah tepi atas
adegan, sehingga teks selesai muncul setelah keluar layar. Kini jendela reveal diturunkan dari
`offsetTop`/`offsetHeight` nyata dan dibangun ulang saat resize/pergantian breakpoint.

Diukur pada 375×812, posisi gulir yang menempatkan blok copy di `top 160`:

| Adegan | scrollY | copyTop | opacity copy | min `[data-reveal]` |
|---|---|---|---|---|
| scale | 778 | 160 | 1 | 1 (2 node) |
| language | 1939 | 160 | 1 | 1 (1 node) |
| script | 2775 | 160 | 1 | 1 (4 node) |
| regional | 4392 | 160 | 1 | 1 (7 node) |
| cultural | 4947 | 160 | 1 | 1 (5 node) |
| invitation | 5947 | 160 | 1 | 1 (2 node) |

Sebelum perbaikan, cultural di `scrollY 5074` menunjukkan opacity 0 yang stabil sampai 2,5 detik
(bukan lag animasi) dan regional menampilkan tujuh `[data-reveal]` dengan opacity 0.

## 4. Cultural mobile

| Viewport | Layer TR | Layer TH | Tabrakan judul | Caption kiri |
|---|---|---|---|---|
| 375 | left 16, top 248, bottom 459 (217,5 × 211) | left 171,5, top 511, bottom 833,7 (187,5 × 322,5) | 0 px² / 0 px² | 16 / 16 |
| 768 | left 24, top 199, bottom 432 (240 × 233) | left 524, top 513, bottom 891 (220 × 378) | 0 px² / 0 px² | 24 / 24 |

Sebelum perbaikan: `.landing-cultural__layer--th` `display: none` (isi hilang) dan
`--tr` `left: −20` (bleed 127,5 px keluar tepi, bertumpuk judul).

Angka desktop 1440 tidak berubah: kolom 48→672 dan 768→1392, caption sebaseline, ikon 28 px
inline, headline 110→181 tanpa tabrakan.

---

## 5. Halaman negara

- Urutan blok: Hero → Cerita → Budaya → Karakteristik Orang → Bahasa → Sumber.
- Kolom teks 540,7 px = 68ch; sidebar kanan berakhir di 1392 pada 1440.
- `h1` top 116,2 (375) / 124,7 (768); navigasi kembali `fixed` tanpa glyph panah.
- Nama negara dan nama lokal muncul sekali; 5 `h2` per halaman.
- Cerita 131–156 kata per negara (batas gate 120–180); setiap negara ≥2 sumber bertanggal akses.
- Label kejujuran: `Lengkap` untuk 10 negara `confidence === 'tinggi'`, `Penjelajahan` untuk 5.

---

## 6. Yang tidak diverifikasi

- Fallback font non-Latin berbeda per sistem operasi; risiko tofu di CI Linux belum diuji.
- Cakupan `speechSynthesis` untuk Kazakh dan Uzbek tidak diketahui (tombol audio hanya dirender
  bila voice tersedia — kondisi tanpa voice diuji, kualitas suara tidak).
- Fotografi berlisensi, auth, kuis, AI, dan dashboard di luar lingkup putaran ini.
- GLB tidak byte-reproducible; verifikasi model memeriksa struktur dan jumlah node, bukan hash.
