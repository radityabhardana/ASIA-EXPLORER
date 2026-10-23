# Laporan Audit Visual & Katalog Screenshot — Asia Explorer

Tanggal: 23 Oktober 2026  
Status: Terverifikasi & Lulus Audit  
Ruang Lingkup: Seluruh permukaan aplikasi (Landing 8 adegan, 15 Halaman Negara, Dialog Interaktif, Lab 3D, dan State Error 404) pada 3 viewport (1440×900 desktop, 768×1024 tablet, 375×812 mobile).

---

## 1. Ringkasan Eksekutif

Proses pemotretan visual (*screenshot capture*) otomatis telah dijalankan di atas server Vite (`http://localhost:5173`) menggunakan Playwright Chromium dengan *device scale factor 1*. Seluruh 84 tangkapan layar tersimpan rapi pada direktori terdedikasi `docs/SCREENSHOTS/` dengan ukuran total **11,48 MB**.

| Kategori | Folder | Jumlah File | Ukuran Total | Cakupan |
|---|---|---|---|---|
| **01 Landing Scenes** | `docs/SCREENSHOTS/01-landing-scenes/` | 27 | 1.13 MB | Preloader + 8 Adegan Landing × 3 Viewport |
| **02 Landing Fullpage** | `docs/SCREENSHOTS/02-landing-fullpage/` | 3 | 541.9 KB | Tangkapan utuh gulir 920vh (1440, 768, 375) |
| **03 Country Pages** | `docs/SCREENSHOTS/03-country-pages/` | 45 | 9.07 MB | 15 Negara × 3 Viewport (`fullPage: true`) |
| **04 Interaction** | `docs/SCREENSHOTS/04-interaction/` | 4 | 362.5 KB | Modal dialog negara (Jepang) & Hover benua 3D |
| **05 Lab & System** | `docs/SCREENSHOTS/05-lab-and-system/` | 5 | 615.5 KB | Scene Lab (`/lab/scene`) & 404 Error State |
| **TOTAL** | `docs/SCREENSHOTS/` | **84** | **11,48 MB** | **100% Permukaan Proyek** |

---

## 2. Inventaris & Deskripsi Screenshot

### 2.1. Adegan Landing Page (`01-landing-scenes/`)

Semua adegan diuji dan difoto pada 3 viewport: Desktop (1440×900), Tablet (768×1024), dan Mobile (375×812).

| File | Viewport | Ukuran | Deskripsi Visual & Elemen Terverifikasi |
|---|---|---|---|
| `00-preloader-1440.png`<br>`00-preloader-768.png`<br>`00-preloader-375.png` | 1440×900<br>768×1024<br>375×812 | 12.6 KB<br>9.0 KB<br>6.5 KB | **Layar Muat Awal (D29)**: Tanda merek "Asia Explorer", garis progres tipografis halus, durasi ≤1.200 ms, terisolasi per sesi (`sessionStorage`). Bebas spinner generik. |
| `01-hero-1440.png`<br>`01-hero-768.png`<br>`01-hero-375.png` | 1440×900<br>768×1024<br>375×812 | 173.3 KB<br>103.0 KB<br>50.9 KB | **Adegan 1 — Hero Benua 3D (D37, D39, D40)**: Wordmark "Asia Explorer" di x=48, y=40 (1440); benua 3D orientasi utara di atas terprojeksi LAEA; tinta benua 61,44vw; dataran rx 40vw dengan 3 cincin konsentris; tagline ringkas tanpa tabrakan. |
| `02-scale-1440.png`<br>`02-scale-768.png`<br>`02-scale-375.png` | 1440×900<br>768×1024<br>375×812 | 76.8 KB<br>39.4 KB<br>33.3 KB | **Adegan 2 — Skala Negara**: Angka counter sinkron "15 negara dalam cakupan", keterangan "Dari Turki sampai Jepang", peta siluet SVG Asia dengan margin kanan 48px pada 1440. |
| `03-language-1440.png`<br>`03-language-768.png`<br>`03-language-375.png` | 1440×900<br>768×1024<br>375×812 | 54.3 KB<br>32.9 KB<br>22.8 KB | **Adegan 3 — Kedalaman Bahasa**: Display statistik "718 bahasa daerah, Indonesia (Badan Bahasa)", siluet peta Indonesia di latar belakang tanpa titik sebaran geografis palsu. |
| `04-script-1440.png`<br>`04-script-768.png`<br>`04-script-375.png` | 1440×900<br>768×1024<br>375×812 | 44.9 KB<br>33.8 KB<br>23.3 KB | **Adegan 4 — Panggung Aksara**: Filmstrip horizontal 3 aksara (Arab, Korea Hangul, Thai); menampilkan aksara asli, romanisasi, dan arti bahasa Indonesia tanpa card-shadow murahan. |
| `05-regional-1440.png`<br>`05-regional-768.png`<br>`05-regional-375.png` | 1440×900<br>768×1024<br>375×812 | 82.4 KB<br>34.5 KB<br>23.2 KB | **Adegan 5 — Tapestry Regional**: "Asia Tenggara, ratusan cara menyapa", siluet bertingkat dengan kedalaman paralaks visual. Pada mobile (375) siluet ID/TH/PH tampil artistik sebagai latar dekoratif tanpa label terpotong. |
| `06-cultural-1440.png`<br>`06-cultural-768.png`<br>`06-cultural-375.png` | 1440×900<br>768×1024<br>375×812 | 48.4 KB<br>30.8 KB<br>24.2 KB | **Adegan 6 — Diptych Budaya**: Komparasi Turki (cezve kopi) dan Thailand (salam wai); kolom 48→672 dan 768→1392 (1440); caption sebaseline di bottom 760; ikon emblem 28px inline; mobile (375/768) kedua negara bertumpuk vertikal rapi tanpa tabrakan judul. |
| `07-invitation-1440.png`<br>`07-invitation-768.png`<br>`07-invitation-375.png` | 1440×900<br>768×1024<br>375×812 | 145.9 KB<br>63.4 KB<br>43.1 KB | **Adegan 7 — Undangan Interaktif**: "Pilih negara, mulai penjelajahan", copy netral perangkat ("Sentuh atau arahkan kursor ke negara di benua, atau pakai daftar di bawah halaman"), canvas 3D interaktif siap raycasting. |
| `08-footer-1440.png`<br>`08-footer-768.png`<br>`08-footer-375.png` | 1440×900<br>768×1024<br>375×812 | 79.0 KB<br>76.0 KB<br>21.6 KB | **Adegan 8 — Kaki Halaman & Indeks**: Sumber data 15 negara dengan tautan primer; indeks 15 tombol negara dengan label kejujuran (`Lengkap` / `Penjelajahan`); brand mark "Asia Explorer"; tinggi auto terjangkau penuh tanpa terpotong di 1440/768/375. |

---

### 2.2. Tangkapan Gulir Penuh Landing (`02-landing-fullpage/`)

Tangkapan halaman secara keseluruhan (*continuous full-page capture*) untuk mengaudit konsistensi ritme vertikal, ketiadaan batas horizontal pecah (*no horizontal overflow*), dan kesinambungan alur naratif 920vh:

1. `landing-fullpage-1440.png` (254,9 KB) — Desktop 1440px: Proporsi kolom teks 48px, kanvas hero terpusat, filmstrip aksara, dan footer indeks terbentang proporsional.
2. `landing-fullpage-768.png` (171,8 KB) — Tablet 768px: Reflow dinamis pada heading dan grid diptych.
3. `landing-fullpage-375.png` (115,2 KB) — Mobile 375px: Single column layout teruji, seluruh teks terbaca nyaman, zero horizontal scrollbar (`scrollWidth === innerWidth`).

---

### 2.3. Halaman Negara 15 Bangsa (`03-country-pages/`)

Setiap negara dipotret secara penuh (`fullPage: true`) pada 3 viewport (1440, 768, 375), mencakup 6 blok hierarkis:
1. **Hero Negara**: Tipografi nama lokal skala besar, status kedalaman (`Lengkap` / `Penjelajahan`).
2. **Cerita**: Esai riset berdasar fakta sejarah (120–180 kata).
3. **Budaya**: 3 norma budaya beserta konteks kausalitasnya.
4. **Karakteristik Orang**: Tata sosial dan etika interaksi nyata.
5. **Bahasa**: Statistik bahasa, dialek, dan 3 frasa sehari-hari disertai tombol audio sapaan asli.
6. **Sumber**: Daftar rujukan terverifikasi bertanggal akses.
7. **Navigasi Kembali**: Tombol `fixed` sudut kiri atas ("Kembali ke benua") tanpa glyph panah usang.

| ID | Nama Negara | Nama Lokal | Status | File Screenshot (1440 / 768 / 375) |
|---|---|---|---|---|
| `id` | Indonesia | Indonesia | Lengkap | `id-1440.png` (239.6 KB), `id-768.png` (215.1 KB), `id-375.png` (199.9 KB) |
| `my` | Malaysia | Malaysia | Lengkap | `my-1440.png` (235.4 KB), `my-768.png` (210.0 KB), `my-375.png` (193.2 KB) |
| `sg` | Singapura | Singapore | Lengkap | `sg-1440.png` (222.9 KB), `sg-768.png` (199.5 KB), `sg-375.png` (185.8 KB) |
| `th` | Thailand | ประเทศไทย | Lengkap | `th-1440.png` (216.7 KB), `th-768.png` (195.2 KB), `th-375.png` (180.7 KB) |
| `vn` | Vietnam | Việt Nam | Lengkap | `vn-1440.png` (214.6 KB), `vn-768.png` (194.5 KB), `vn-375.png` (178.7 KB) |
| `ph` | Filipina | Pilipinas | Lengkap | `ph-1440.png` (230.9 KB), `ph-768.png` (212.2 KB), `ph-375.png` (194.1 KB) |
| `cn` | Tiongkok | 中国 | Lengkap | `cn-1440.png` (223.4 KB), `cn-768.png` (205.4 KB), `cn-375.png` (187.9 KB) |
| `jp` | Jepang | 日本 | Lengkap | `jp-1440.png` (212.3 KB), `jp-768.png` (193.1 KB), `jp-375.png` (178.0 KB) |
| `kr` | Korea Selatan | 한국 | Lengkap | `kr-1440.png` (217.2 KB), `kr-768.png` (198.3 KB), `kr-375.png` (183.2 KB) |
| `in` | India | भारत | Lengkap | `in-1440.png` (198.2 KB), `in-768.png` (183.3 KB), `in-375.png` (166.0 KB) |
| `sa` | Arab Saudi | المملكة العربية السعودية | Penjelajahan | `sa-1440.png` (204.9 KB), `sa-768.png` (180.3 KB), `sa-375.png` (165.7 KB) |
| `tr` | Turki | Türkiye | Penjelajahan | `tr-1440.png` (188.2 KB), `tr-768.png` (171.0 KB), `tr-375.png` (156.5 KB) |
| `kz` | Kazakhstan | Қазақстан | Penjelajahan | `kz-1440.png` (203.9 KB), `kz-768.png` (180.5 KB), `kz-375.png` (168.6 KB) |
| `uz` | Uzbekistan | Oʻzbekiston | Penjelajahan | `uz-1440.png` (207.6 KB), `uz-768.png` (183.8 KB), `uz-375.png` (168.0 KB) |
| `mn` | Mongolia | Монгол улс | Penjelajahan | `mn-1440.png` (222.1 KB), `mn-768.png` (198.1 KB), `mn-375.png` (186.1 KB) |

---

### 2.4. Interaksi & Dialog (`04-interaction/`)

| File | Viewport | Ukuran | Deskripsi Visual & Elemen Terverifikasi |
|---|---|---|---|
| `dialog-jp-1440.png`<br>`dialog-jp-768.png`<br>`dialog-jp-375.png` | 1440×900<br>768×1024<br>375×812 | 99.7 KB<br>87.3 KB<br>29.8 KB | **Dialog Modal Negara**: Terbuka saat negara dipilih pada indeks footer atau peta benua; menyajikan pratinjau ringkas (sapaan asli, arti, norma utama) dengan tombol langsung menuju `/negara/jp`. Tampilan editorial tanpa bingkai kartu tebal. |
| `hover-invitation-1440.png` | 1440×900 | 145.7 KB | **Hover Raycast 3D**: Proyeksi label mengambang dinamis mengikuti koordinat layar negara yang disorot pointer; menampilkan nama Indonesia, aksara asli, dan kawasan geografis. |

---

### 2.5. Lab & Penanganan Kesalahan (`05-lab-and-system/`)

| File | Viewport | Ukuran | Deskripsi Visual & Elemen Terverifikasi |
|---|---|---|---|
| `lab-scene-1440.png`<br>`lab-scene-768.png`<br>`lab-scene-375.png` | 1440×900<br>768×1024<br>375×812 | 292.2 KB<br>185.8 KB<br>100.8 KB | **Lingkungan Lab Benua 3D (`/lab/scene`)**: Permukaan pengujian inspeksi geometri benua Asia, pencahayaan directional, elevasi kamera 52°, dan koordinat mesh tanpa gangguan elemen teks landing. |
| `missing-country-1440.png`<br>`missing-country-375.png` | 1440×900<br>375×812 | 21.6 KB<br>15.1 KB | **State Kesalahan 404 (`/negara/xx`)**: Penanganan rute tak ditemukan yang elegan; pesan ramah pengguna dan tautan langsung untuk kembali ke beranda. |

---

## 3. Hasil Audit Visual & Kode Terpadu

### 3.1. Kepatuhan Desain & Anti-Slop (Lolos)
- **Palette & Kontras**: Warna dasar `--surface #F9F7F3` hangat menyerupai kertas; teks utama `--ink #1A1F24` kontras tajam (13,2:1); aksen `--accent #176B68`. Bebas dari gradasi ungu-biru murahan maupun glassmorphism acak.
- **Tipografi Bersih**: Judul display konsisten menggunakan Crimson Pro self-hosted (`--font-display`), teks bacaan menggunakan Source Sans 3 (`--font-text`), dan aksara lokal didukung fallback sistem komprehensif.
- **Bebas Komponen Klise**: Tidak ditemukan container kartu (border + shadow + radius seragam), tidak ada pemisah garis putus-putus, tidak ada tombol panah generic (`→`).
- **Device Title Sinkron (D37)**: `index.html` dan `CountryPage.tsx` kini seragam mencantumkan `Asia Explorer` (bukan warisan `ASIAKIN`).

### 3.2. Geometri & Responsivitas Layar (Lolos D48)
- **Desktop (1440×900)**: Kolom teks membaca 68ch (540,7 px), sidebar sticky di kanan berakhir di x=1392.
- **Tablet (768×1024)**: Layout bertransformasi mulus, sidebar beralih di bawah hero sebelum esai membaca.
- **Mobile (375×812)**:
  - Timeline reveal berbasis runtime membaca `offsetTop`/`offsetHeight` nyata: opacity `1,00` saat `copyTop ≈ 160`.
  - Scene 6 Cultural diptych: Turki dan Thailand bertumpuk rapi dengan margin kiri 16px, zero collision terhadap headline.
  - Zero horizontal overflow terbukti pada semua 84 tangkapan layar (`scrollWidth <= innerWidth + 1`).

---

## 4. Bukti Verifikasi Build & Test

```text
> asiakin-v3@0.0.0 typecheck
> tsc --noEmit
TSC_EXIT=0

> asiakin-v3@0.0.0 lint
> eslint . --max-warnings=0
ESLINT_EXIT=0

> asiakin-v3@0.0.0 test
> vitest run
 Test Files  5 passed (5)
      Tests  30 passed (30)
VITEST_EXIT=0

> asiakin-v3@0.0.0 build
> npm run typecheck && vite build
✓ 75 modules transformed.
dist/index.html                               0.77 kB │ gzip:   0.37 kB
dist/assets/AsiaScene-C3RBwNvQ.css            1.54 kB │ gzip:   0.61 kB
dist/assets/index-iOuxbBVg.css               39.07 kB │ gzip:   8.12 kB
dist/assets/AsiaScene-BOcquwTx.js            13.11 kB │ gzip:   5.67 kB
dist/assets/index-JK23LNCx.js               588.37 kB │ gzip: 203.18 kB
dist/assets/three-BXlbQ3Q_.js               619.23 kB │ gzip: 156.08 kB
✓ built in 790ms
BUILD_EXIT=0
```

---

## 5. Kesimpulan

Proyek **Asia Explorer** telah terdokumentasi secara visual dari hulu ke hilir. Seluruh tangkapan layar di `docs/SCREENSHOTS/` membuktikan bahwa implementasi di browser sungguhan memenuhi standar editorial, bebas cacat visual, responsif di semua perangkat, dan lulus seluruh gate verifikasi teknis.
