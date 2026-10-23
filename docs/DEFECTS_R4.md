# Ledger Defect — Putaran 4

Sumber: audit 23 Okt 2026 (L1–L12 landing, C1–C7 halaman negara) + keputusan K1–K6.
Otoritas aturan: `docs/PRD_V2_5_DELTA.md`. Basis kode: `59efc43`.
Status: `open` · `wip` · `closed` (butuh bukti terukur) · `deferred` (keluar lingkup).

## Landing

| ID | Temuan | Tahap | Pemilik | Status |
|---|---|---|---|---|
| L1 | Tepi lurus vertikal memotong kanvas 3D (x≈264 dan x≈1125 di 1440). Akar: `targetSpan=1.98` (`AsiaScene.tsx:716`) melebihi frustum, dipotong `overflow:hidden` (`landing.css:1000`). | A | designer | wip |
| L2 | Mobile 375: benua terpotong kiri (Arab Saudi), peta ~300 px dengan celah kosong besar. | A | designer | wip |
| L3 | Dataran polos (elips abu rata, 3 cincin tipis), tagline menyilang cincin, kata "Gulir" menimpa tepi elips. | B | designer | open |
| L4 | Landmass konteks terbaca sebagai noda: serpihan krem mengambang, sisa Asia kosong. | A | designer | wip |
| L5 | Isi scene menumpuk di separuh atas, bawah 45–55% kosong. | A | designer | wip |
| L6 | Scene Skala memakai peta 2D datar, beda gaya dengan hero 3D. | A | designer | wip |
| L7 | Scene Asia Tenggara tumpang tindih: headline di atas peta, judul scene berikut samar muncul. Struktural (S5 tidak pinned). | A | designer | wip |
| L8 | Label hover tanpa latar, kontras rendah, terpotong tepi negara; berkedip saat pointer cepat. | A | designer | wip |
| L9 | Popup polos: kartu putih, 4 baris teks, tanpa gambar, scrim abu mati. | D | designer | open |
| L10 | Footer dinding ~30 tautan sumber + 15 nama. | A | designer | wip |
| L11 | Tipografi datar: satu serif untuk semua judul, tubuh 13–14 px, tanpa eyebrow/angka besar/pull quote. | B | designer | open |
| L12 | 15 warna negara acak tanpa makna; perlu palet per kawasan di atas dataran cokelat. | B | designer | open |

## Halaman negara

| ID | Temuan | Tahap | Pemilik | Status |
|---|---|---|---|---|
| C1 | Nol gambar di 15 halaman. | C/E | fixer + designer | open |
| C2 | "Cerita" bukan storytelling (fakta etiket padat); Budaya dan Orang masing-masing satu kalimat. | E | librarian + designer | open |
| C3 | Tata letak sempit: kolom teks ~540 px, sidebar siluet ~200 px, celah kosong di tengah. | E | designer | open |
| C4 | "Sumber" berisi label klaim + penanda "Perlu verifikasi" di 15/15 negara; sumber dihapus dari UI (K1), provenance pindah ke data. | E | fixer | open |
| C5 | Latar identik 15 negara; tidak ada identitas per negara. | E | designer | open |
| C6 | Tombol "Kembali ke benua" hanya tautan bergaris 11 px. | E | designer | open |
| C7 | Siluet dan locator garis hairline tipis; lemah di mobile. | E | designer | open |

## Temuan struktural lain

| ID | Temuan | Tahap | Status |
|---|---|---|---|
| S1 | Tidak ada pipeline gambar sama sekali (`public/` hanya draco, fonts, models). | C | open |
| S2 | Tidak ada i18n; seluruh copy hard-coded Indonesia. | B/F | open |
| S3 | Footer sources dikunci e2e (`gates.spec.ts:532-541`); tes harus diubah setelah K1. | A | wip |
| S4 | `CountryPage` memakai `SourceBlock`; `SourceList` (versi lipat) dead code. Sumber dihapus dari UI → keduanya dibuang. | E | open |
| S5 | `countries.ts` cast `raw as readonly Country[]` tanpa validasi runtime tipe. | E | open |
| S6 | Belum ada gate untuk tepi lurus, overlap, ink bbox, hover stabil, loncatan, lisensi, kontras per negara, paritas bahasa, performa. | A–F | open |

## Aturan penutupan

Sebuah baris hanya boleh jadi `closed` bila ada bukti yang ditempel: path:line, angka terukur, atau keluaran perintah. Klaim tanpa bukti tetap `open`.
