# PRD V2.5 — Delta Putaran 4

Status: **mengikat**. Dokumen ini menggantikan bagian mana pun dari `PRD_V2_4_DELTA.md`, `DESIGN_LANDING_V4.md`, dan `DESIGN_COUNTRY.md` yang bertentangan.
Dasar: `docs/Asia Explorer Audit, Riset, dan Rencana Build Putaran 4.docx` + keputusan user 23 Oktober 2026 (K1–K6).
Basis kode: `59efc43`. Commit remote `59d12bb` (map48) **tidak** dipakai — **dicabut 28 Okt 2026, lihat bagian 0**.

---

## 0. Amandemen 28 Oktober 2026 — cakupan 48 negara

Status: **mengikat**. Bagian ini menggantikan bagian mana pun dari dokumen ini, `PRD_MASTER.md`,
`PRD_V2_3_DELTA.md`, `DESIGN_LANDING_V4.md`, `DESIGN_COUNTRY.md`, dan `ROADMAP_DYNAMIC.md` yang
bertentangan — khususnya setiap lock "15 negara" dan baris "map48 tidak dipakai" di atas.

| # | Keputusan user 28 Okt 2026 | Konsekuensi teknis |
|---|---|---|
| A1 | **Hero memakai peta 48 negara** (port dari `assets/3d-48-negara/` ke `src/scene/map48/*`). | `AsiaSceneLazy.tsx` menjadi pembungkus peta 48 dengan kontrak props lama, jadi `LandingPage` tidak berubah. Snapshot `assets/3d-48-negara/` tetap tidak disentuh. |
| A2 | **Semua 48 negara dapat halaman penuh, ID + EN penuh.** K4 naik dari 15 → 48. | `scripts/build-content.mjs` meng-glob `docs/content/raw-*.json` / `raw-*-en.json`; gate paritas ID/EN tetap menggagalkan build bila tidak seimbang. Rute `/en/negara/:id` berlaku untuk 48. |
| A3 | **Foto dicari agen dari Wikimedia Commons** untuk 33 negara baru. | Aturan K2 tidak berubah: CC0/PD/CC BY/CC BY-SA saja, `tools/fetch-images.mjs --check` wajib hijau sebelum build, kredit satu baris untuk CC BY/BY-SA. |

**Tidak berubah:** galeri/mosaik tetap **15 negara pilihan** (`FEATURED_IDS`); eyebrow hero menyebut
48 karena itu jumlah negara di peta, bukan jumlah kartu galeri. Label jujur `Lengkap` /
`Penjelajahan` tetap diturunkan dari `confidence` konten — saat ini 34 `Lengkap` / 14 `Penjelajahan`.
Aturan K1 (tanpa blok sumber di UI), K3 (navbar), K5 (lokal dulu), K6 (tanpa AI) tetap berlaku.
Tidak ada ambang gate yang dilonggarkan: e2e gate membaca `window.__asiakin_map48`
(`ready`, `countryCount`, `projected(ISO3)`, `measureInk`).

---

## 1. Keputusan terkunci (K1–K6)

| # | Keputusan | Konsekuensi teknis |
|---|---|---|
| K1 | **Tidak ada blok sumber/referensi di UI mana pun.** Tidak di landing, tidak di halaman negara, tidak di footer. | Sumber tetap disimpan di data sebagai provenance internal untuk audit konten, tetapi **tidak dirender**. Foto CC BY/CC BY-SA tetap menampilkan satu baris kredit di bawah foto karena itu syarat lisensi, bukan blok sumber. Foto CC0/PD tanpa kredit. |
| K2 | Foto hanya dari **Wikimedia Commons API**; CC0/PD diutamakan, CC BY/CC BY-SA boleh, NC/ND/tanpa lisensi ditolak. Unsplash/Pexels hanya cadangan dan dicatat. | `tools/fetch-images.mjs` + `src/content/images.manifest.json` + `src/content/images.json`; `--check` wajib hijau sebelum build. |
| K3 | **Navbar absolute**, 3 item (Jelajah, Dashboard, Negara) + Masuk, Daftar, pengalih bahasa. Tidak ikut scroll. Tanpa kotak, blur, shadow. | D6 lama **dicabut**. Mobile: wordmark + tombol "Menu" membuka lembar penuh, fokus terperangkap. |
| K4 | ~~**ID + EN penuh, 15 negara.**~~ **Digantikan A2: 48 negara.** | Mesin i18n, rute `/en/...`, `<html lang>`, hreflang, tes paritas kunci yang menggagalkan build. Tidak ada terjemahan mesin diam-diam. |
| K5 | **Lokal dulu, akun opsional.** | IndexedDB per perangkat, `navigator.storage.persist()`, ekspor/impor JSON, status penyimpanan jujur. Tanpa server pada rilis ini. |
| K6 | **Analisis AI ditunda**, slot roadmap dekat. | Tidak ada panggilan LLM, tidak ada kunci API di bundle, tidak ada UI AI pada rilis ini. |

### Amandemen aturan lama

| Aturan lama | Status baru |
|---|---|
| D6 "tanpa navbar" | **Dicabut**, diganti K3. |
| "Tanpa kartu" | Dipertajam: yang dilarang adalah **kotak berbingkai, sudut membulat, dan drop-shadow**. Galeri foto, panel datar, dan mosaik tanpa bingkai **diizinkan**. |
| PRD 5.3 "sumber wajib tampil" | **Dicabut untuk UI**; kewajiban provenance tetap di data (K1). |
| Struktur landing 8 scene | Menjadi **9 blok** (bagian 3). |
| Halaman negara 6 blok | Menjadi **7 blok** dengan galeri (bagian 4). |

---

## 2. Yang tidak berubah

Tema terang; tanpa gradasi ungu-biru; tanpa glassmorphism; tanpa emoji; copy Indonesia (kecuali EN pada rute `/en`); ~~15 negara~~ 48 negara dan ~~label `Lengkap` (10) / `Penjelajahan` (5)~~ `Lengkap` (34) / `Penjelajahan` (14) (A2); rute `/negara/:id`; benua mesh LAEA 90°E/32°N dengan utara di atas; satu aksi bermakna per layar; teks cerita tidak dianimasikan per kata.

---

## 3. Struktur landing (9 blok)

1. **Hero** — medan cokelat, benua, intro kamera drone, judul kiri atas.
2. **Skala** — peta 3D yang sama, counter terikat jumlah negara menyala (15).
3. **Bahasa** — angka 718 + siluet Indonesia, terpusat vertikal.
4. **Aksara** — tiga sapaan, satu ketukan untuk suara.
5. **Asia Tenggara** — peta dan judul tidak berbagi ruang.
6. **Pilih negara** — benua interaktif, tanpa kalimat "atau pakai daftar di bawah halaman".
7. **Dashboard** — empat adegan ter-pin, label "Segera hadir".
8. **Galeri 15 negara** — mosaik foto tanpa bingkai, sekaligus daftar aksesibel.
9. **Footer** — wordmark + sedikit tautan. Tanpa dinding sumber.

Scene "Setiap negara punya caranya sendiri" **dihapus**. Aturan isi layar: ink bbox setiap scene ≥ 70% tinggi viewport, konten dipusatkan vertikal.

---

## 4. Halaman negara v2

Urutan: **Hero foto → Cerita → Budaya → Orang → Bahasa → Galeri → Referensi**.
Tidak ada blok "Referensi" yang terlihat; lipatan referensi **dihapus** sesuai K1. Sumber tetap di data.

- Hero: foto penuh, parallax ringan, nama asli besar, nama Indonesia/English, kawasan, label kedalaman sebagai teks kecil.
- Tema per negara: warna dasar rendah-kroma dari foto hero + aksen + rona tanah. Tanpa motif budaya dekoratif.
- Cerita: narasi 120–180 kata, adegan konkret, bukan daftar fakta.
- Budaya & Orang: masing-masing tiga butir norma + sebabnya. Norma perilaku, bukan sifat bangsa.
- Bahasa: sapaan besar + audio (tombol disembunyikan bila suara tidak tersedia), tiga frasa dengan cara baca dan konteks.
- Galeri: 3–6 foto, ritme tata letak berbeda, kredit satu baris bila lisensi menuntut.
- Grid 12 kolom, teks 68ch, foto boleh melewati kolom, sidebar siluet + locator sticky, tombol kembali ≥44 px.

---

## 5. Tahap build dan gerbang

| Tahap | Isi | Gerbang lulus |
|---|---|---|
| **A** | L1 tepi lurus kanvas, L2 mobile, L4 noda konteks, L5 scene terpusat, L6 Skala 3D, L7 overlap, L8 label hover; hapus scene & kalimat & blok sumber | 4 gate baru hijau; screenshot bertahap 375/768/1440 |
| **B** | Medan cokelat, drone intro, placeholder SVG crossfade, navbar, shell i18n, tipografi, hook, palet per kawasan | 60 fps mid-range, tanpa loncatan >2%, reduced-motion statis, LCP teks |
| **C** | `fetch-images.mjs`, manifest 15 negara × 3–6 foto, `--check` | 0 foto tanpa lisensi sah, 0 foto tanpa alt dua bahasa, ≤600 KB AVIF per negara |
| **D** | Popup dua panel + carousel, FLIP, galeri mosaik | Tab/Enter/Escape/panah, swipe sentuh, fokus kembali ke pemicu |
| **E** | Halaman negara v2 + tema per negara + transisi popup→hero | Kontras 4,5:1 per negara, 15 halaman × 3 lebar |
| **F** | EN penuh 15 negara | Build gagal pada kunci hilang; paritas kunci identik |
| **G** | Scene dashboard di landing | Terbaca tanpa JS gerak; reduced-motion statis |
| **H** | Dashboard nyata (lokal) | security-reviewer, uji tanpa jaringan, uji kehilangan data, tabel keputusan lulus |

Urutan: **A → B → C → D → E → (F ∥ G) → H**. Tidak ada tahap yang dimulai sebelum gerbang sebelumnya hijau dengan bukti tempelan.

---

## 6. Sepuluh gerbang verifikasi baru

1. **Tanpa tepi lurus** — deteksi kolom piksel tinta yang terpotong pada batas elemen kanvas di semua scene.
2. **Tanpa overlap** — tidak ada kotak teks beririsan dengan siluet, foto, atau teks lain.
3. **Isi layar** — ink bbox setiap scene ≥ 70% tinggi viewport.
4. **Hover stabil** — pointer melewati 8 negara dalam 600 ms; maksimal 1 perubahan label per 80 ms; label akhir = negara terakhir.
5. **Tanpa loncatan** — tangkapan tiap 100 ms dari 0–4 s dengan jaringan throttle; ukuran/posisi benua tidak berubah > 2% antara placeholder dan hasil akhir.
6. **Lisensi foto** — `fetch-images --check` hijau; setiap foto tampil punya kredit bila lisensi menuntut.
7. **Kontras** — per negara dan per tema ≥ 4,5:1 untuk teks; kontrol ≥ 3:1.
8. **Paritas bahasa** — kunci ID dan EN identik.
9. **Performa nyata** — LCP ≤ 2,5 s, INP ≤ 200 ms, CLS ≤ 0,1; JS awal ≤ 180 KB gzip; chunk 3D lazy ≤ 350 KB gzip.
10. **Bukti jujur** — screenshot dibaca ulang, scroll bertahap, tanpa tangkapan full-page sebagai bukti.

---

## 7. Di luar lingkup rilis ini

Server/auth produksi, sinkronisasi lintas perangkat, analisis AI, kuis, leaderboard, XP/streak, notifikasi, pembayaran, lebih dari 15 negara.
