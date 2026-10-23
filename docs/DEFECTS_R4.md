# Ledger Defect — Putaran 4

Sumber: audit 23 Okt 2026 (L1–L12 landing, C1–C7 halaman negara) + keputusan K1–K6, diperluas brief pengguna 23 Okt (K7–K18).
Otoritas aturan: `docs/PRD_V2_6_DELTA.md` (menang atas v2.5). Basis kode: `59efc43` + `27e9260` (pipeline gambar).
Status: `open` · `wip` · `closed` (butuh bukti terukur) · `deferred` (keluar lingkup).

## Landing

| ID | Temuan | Tahap | Pemilik | Status |
|---|---|---|---|---|
| L1 | Tepi lurus vertikal memotong kanvas 3D. Akar awal `targetSpan=1.98` + `overflow:hidden` **sudah basi** — konstanta itu tak ada lagi (`AsiaScene.tsx:829-831`). Status akhir harus dibuktikan gate tepi (piksel 2 px terluar), bukan asumsi. | A | designer | wip |
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
| S1 | Tidak ada pipeline gambar sama sekali (`public/` hanya draco, fonts, models). | C | closed — 60 foto, 240 file, `images:check` exit 0, commit `27e9260` |
| S2 | Tidak ada i18n; seluruh copy hard-coded Indonesia. | B/F | open |
| S3 | Footer sources dikunci e2e (`gates.spec.ts:532-541`); tes harus diubah setelah K1. | A | wip |
| S4 | `CountryPage` memakai `SourceBlock`; `SourceList` (versi lipat) dead code. Sumber dihapus dari UI → keduanya dibuang. | E | open |
| S5 | `countries.ts` cast `raw as readonly Country[]` tanpa validasi runtime tipe. | E | open |
| S6 | Gate baru ditulis: `e2e/round4-gates.spec.ts` (tepi, overlap, ink bbox, hover). Gate lama `gates.spec.ts`/`landing.spec.ts` sedang disesuaikan tanpa pelonggaran. | A–F | wip |

## Putaran 4b — brief pengguna 23 Okt

| ID | Kebutuhan | Acuan | Tahap | Status |
|---|---|---|---|---|
| N1 | Intro kamera drone (orbit → tengah), bukan animasi dataran naik | K7 | B | open |
| N2 | Latar relief coklat/oker dengan tinggi nyata, bukan bidang datar | K8 | B | open |
| N3 | Hover = panel info, tanpa popup; klik langsung ke halaman negara | K9 | B | open |
| N4 | Navbar transparan, `absolute`, 3 tautan + bahasa + Masuk/Daftar | K10 | B | open |
| N5 | i18n ID/EN penuh dengan paritas kunci | K11 | B/F | open |
| N6 | Marquee aksara 15 negara, tanpa kartu | K12 | D | open |
| N7 | "Asia Tenggara, ratusan cara menyapa" → "Satu kawasan, enam negara", nol overlap | K13 | D | open |
| N8 | Skip link bukan pill; strip progres tepi kiri dihapus | K14 | A | wip |
| N9 | Pemilihan negara lewat mosaik 15 foto dari `images.json` | K15 | F | open |
| N10 | Blok dashboard di landing + rute `/dashboard`, `/negara` | K16 | F/G | open |
| N11 | "Masuk/Daftar" = profil lokal (IndexedDB), bukan akun server | K17 | G | open |
| N12 | Latar halaman pasir hangat, kontras dihitung ulang | K18 | B | open |

## Aturan penutupan

Sebuah baris hanya boleh jadi `closed` bila ada bukti yang ditempel: path:line, angka terukur, atau keluaran perintah. Klaim tanpa bukti tetap `open`.
