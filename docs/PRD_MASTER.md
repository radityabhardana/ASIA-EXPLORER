# PRD MASTER — ASIA EXPLORER (V3.0)
**Dokumen Induk & Sumber Kebenaran Tunggal Proyek**  
*Tanggal: 23 Oktober 2026 | Status: BINDING / MENGURUNG SEMUA TAHAP*  
*Konsolidasi: PRD v2.3–v2.6 Delta, Audit Putaran 4, Dokumen Arsitektur & Brief Pengguna*

---

## 1. Visi Produk & Filosofi Inti

**Asia Explorer** adalah atlas budaya interaktif dan aplikasi pembelajaran adaptif berstandar editorial tinggi mengenai 15 bangsa di Asia.

### Prinsip Desain & Anti-Slop (Aturan Mutlak)
1. **Light Theme Only**: Latar hangat bergaya kertas peta tua (`#f4ede1` / `--paper-warm`). Tidak ada dark mode.
2. **Zero AI Slop**: 
   - DILARANG gradasi ungu-biru, neon, glassmorphism, floating drop-shadows, dan card rounded-corner klise.
   - DILARANG copy marketing kosong ("Elevate", "Seamless", "Powerful", "Unleash").
   - DILARANG emoji di antarmuka publik.
3. **No Cards**: Larangan tegas terhadap kontainer konten berkotak dengan background berwarna, border, border-radius, dan shadow. Konten bernapas langsung di atas canvas/latar editorial dengan hierarki tipografi dan garis hairline (`--line`).
4. **Honesty & Provenance**: Label status eksplisit (`Lengkap` untuk 10 negara, `Penjelajahan` untuk 5 negara). Semua data kutipan memiliki `sourceRef` valid di data internal, namun **tidak merender blok daftar referensi di UI** (K1).
5. **Real Verification**: Setiap klaim selesai wajib dibuktikan dengan output eksekusi terminal asli dan screenshot browser nyata di 3 viewport (1440px desktop, 768px tablet, 375px mobile).

---

## 2. Arsitektur Background: "Highlands & Earthy Relief" (Solusi Brief)

Menjawab kebutuhan: latar belakang tidak boleh berupa bidang flat/polos, melainkan memiliki tekstur dataran tinggi (highlands), elevasi, dan nuansa tanah cokelat/oker hangat.

### A. Landing Page Background System
Latar belakang landing page bukan warna flat `#ffffff` atau gradasi CSS generik, melainkan sistem multi-layer terintegrasi:

1. **Base Layer — Warm Sand Paper (`--paper-warm: #f4ede1`)**:
   - Nilai tunggal off-white hangat bernuansa kertas litografi/kartografi kuno.
   - Kontras teks `--ink: #1a1f24` terhadap base terverifikasi ≥ 11:1 (WCAG AAA).
2. **Topographic Elevation Isolines (SVG Vector Contour)**:
   - Garis kontur ketinggian topografi organik (vektor SVG halus) yang mengalir lembut di belakang konten dari hero hingga footer.
   - Stroke garis: `--topo-line: #c8b7a6` dengan ketebalan 1px dan opasitas 15%–35%.
   - Menggambarkan punggung bukit dan dataran tinggi Asia Tengah/Tibet secara stilistik tanpa mengganggu keterbacaan teks.
3. **Hypsometric Earth Shading (Nuansa Dataran Tinggi Cokelat/Oker)**:
   - Gradasi elevasi hipsometrik alami berbasis palet tanah:
     - Lembah/Dataran Rendah: Ochre lembut (`#e2d2be`)
     - Dataran Tinggi (Plateau): Warm Terra Cotta (`#c49a72`)
     - Puncak Pegunungan: Earth Umber (`#8a6242`)
   - Diterapkan sebagai layer bayangan lereng (*hillshade*) beropasitas rendah (8%–18%) dengan arah pencahayaan konsisten dari Barat Laut (Northwest, 315°), mengikuti standar kartografi internasional.
4. **3D Relief Geometry Mesh (Scene Canvas)**:
   - Di dalam viewport 3D, daratan di bawah benua Asia berupa mesh geometri relief 3D nyata dengan deformasi ketinggian (bukit dan lembah berbayang nyata), bukan bidang elips datar atau piringan abu-abu pucat.

### B. Country Page Adaptive Background System
Setiap halaman negara memiliki latar belakang adaptif yang mencerminkan identitas bentang alamnya:
1. **Dynamic Low-Chroma Base**: Warna dasar diturunkan langsung dari foto hero negara tersebut (`images.json`), dinormalisasi secara algoritmik ke rentang L: 0.92–0.96 dan S: 0.06–0.14 (menghindari warna kotor/muddy atau terlalu mencolok).
2. **Silhouette Contour Isolines**: Latar belakang dirender dengan 4–6 cincin garis kontur konsentris yang diekstrusi ke dalam dari siluet geografis negara tersebut (`Silhouette.tsx`), menciptakan kedalaman spasial yang unik per negara.
3. **Contrast Lock**: Skrip `check-contrast.mjs` memvalidasi bahwa kontras `--ink` terhadap base adaptif tiap negara selalu ≥ 4.5:1 (WCAG AA).

---

## 3. Cakupan 15 Negara & Tingkat Kedalaman

| Kode | Negara | Kawasan | Bahasa Resmi | Label Kedalaman | Quest/Pelajaran |
|---|---|---|---|---|---|
| `id` | Indonesia | Asia Tenggara | Bahasa Indonesia | Lengkap | Ya (6 butir) |
| `my` | Malaysia | Asia Tenggara | Bahasa Melayu | Penjelajahan | Tidak |
| `sg` | Singapura | Asia Tenggara | English / Melayu / Mandarin / Tamil | Lengkap | Ya (6 butir) |
| `th` | Thailand | Asia Tenggara | Bahasa Thai | Lengkap | Ya (6 butir) |
| `vn` | Vietnam | Asia Tenggara | Tiếng Việt | Penjelajahan | Tidak |
| `ph` | Filipina | Asia Tenggara | Filipino / Tagalog | Lengkap | Ya (6 butir) |
| `cn` | Tiongkok | Asia Timur | Putonghua (Mandarin) | Lengkap | Ya (6 butir) |
| `jp` | Jepang | Asia Timur | Nihongo (Jepang) | Lengkap | Ya (6 butir) |
| `kr` | Korea Selatan | Asia Timur | Hangugeo (Korea) | Lengkap | Ya (6 butir) |
| `in` | India | Asia Selatan | Hindi / English | Penjelajahan | Tidak |
| `sa` | Arab Saudi | Asia Barat | Bahasa Arab | Lengkap | Ya (6 butir) |
| `tr` | Turki | Asia Barat | Türkçe | Lengkap | Ya (6 butir) |
| `kz` | Kazakhstan | Asia Tengah | Qazaqşa | Penjelajahan | Tidak |
| `uz` | Uzbekistan | Asia Tengah | Oʻzbekcha | Lengkap | Ya (6 butir) |
| `mn` | Mongolia | Asia Timur | Mongol Hel | Penjelajahan | Tidak |

---

## 4. Struktur Antarmuka & Alur Navigasi

### A. Landing Page (9 Blok Editorial Terarah)
1. **Hero**: 
   - Drone camera intro (orbit ±120°, descending 2.2–2.8s ke hero pose kanonik).
   - Benua 3D di atas relief tanah cokelat 3D nyata. Latar belakang topo-isolines.
   - Navbar transparan absolute (scrolls away, tidak sticky).
2. **Skala**:
   - Peta 3D sinkron dengan counter angka 15 negara menyala (1:1 ink to number).
3. **Bahasa**:
   - Angka "718" bahasa daerah Indonesia + siluet kepulauan, terpusat vertikal.
4. **Aksara ("Aksara yang bergerak")**:
   - Marquee horizontal tanpa henti (±45s per putaran) memuat seluruh 15 negara.
   - Tanpa kartu, tanpa latar warna; jeda otomatis saat kursor hover atau keyboard focus.
5. **Regional ("Satu kawasan, enam negara")**:
   - Menampilkan 6 negara Asia Tenggara (ID, MY, SG, TH, VN, PH) berjejer rapi dengan label jelas, 0px overlap.
6. **Undangan Interaktif (Scene 3D)**:
   - Hover memunculkan panel info samping (nama, sapaan asli, romanisasi, bahasa, kedalaman).
   - Klik langsung navigasi ke `/negara/:id`. TIDAK ada popup modal di landing.
7. **Lanjutkan Penjelajahan (Dashboard Link)**:
   - Blok editorial 1 hairline. Menampilkan progres tersimpan jika profil ada, atau ajakan membuat profil lokal.
8. **Mosaik 15 Negara**:
   - Grid foto editorial tidak beraturan (AVIF 960/1600 dari `images.json`), tanpa border, tanpa shadow.
   - Teks nama negara dengan scrim lembut hanya di belakang teks.
9. **Footer**:
   - Wordmark "Asia Explorer", indeks tautan esensial, tanpa dinding daftar referensi.

### B. Halaman Negara (`/negara/:id`)
1. **Hero Visual**: Foto panorama berkualitas tinggi (Wikimedia Commons), nama lokal besar, romanisasi, kawasan.
2. **Cerita**: Esai naratif 120–180 kata dengan latar belakang kontur tematik adaptif.
3. **Budaya**: 3 norma budaya esensial + rasional kulturalnya.
4. **Masyarakat**: 3 etika sosial praktis.
5. **Bahasa & Audio**: Sapaan asli, romanisasi, arti, tombol dengar Web Speech API, 3 frasa kunci.
6. **Galeri Foto**: Mosaik 3–6 foto kurasi dengan kredit satu baris legal.
7. **Navigasi Pelajaran**: Tombol langsung menuju `/dashboard/pelajaran/:id/kenali` (untuk 10 negara `Lengkap`).

### C. Dashboard & Sistem Belajar (`/dashboard`)
1. **Local-First Architecture (K17)**:
   - IndexedDB database `asiakin` (stores: `profiles`, `progress`, `lessons`, `attempts`, `reviews`, `meta`).
   - Tanpa registrasi email/password. Profil lokal tersimpan di browser dengan fitur Ekspor/Impor JSON.
2. **Alur Pelajaran (4 Langkah)**:
   - `Kenali`: Ringkasan esensial dan konteks geografis.
   - `Etiket`: 3 aturan perilaku sosial disertai alasan kultural (accordion `<details>` native).
   - `Bahasa`: Pelafalan sapaan dan frasa penting.
   - `Quest`: Evaluasi interaktif.
3. **Engine Quest (6 Butir Terverifikasi per Negara)**:
   - 3 Soal Pilihan Ganda Etiket (umpan balik rasional kultural).
   - 2 Soal Pencocokan Frasa.
   - 1 Skenario Percabangan Situasional.
   - Validasi ketat: setiap butir wajib memiliki `sourceRef` yang sah di `countries.json`.
4. **Halaman Hasil (`/dashboard/quest/:countryId/:attemptId`)**:
   - Skor transparan (`5/6`, `83%`) tanpa gamifikasi kekanak-kanakan (tanpa XP, streak, koin, kembang api).
   - Review butir jawaban benar vs salah beserta alasannya.
   - Aksi: "Ulangi yang salah" dan "Lanjut ke negara berikutnya".
5. **Optimalisasi Belajar (Sistem Leitner 5 Kotak)**:
   - Interval pengulangan berjarak: 1, 3, 7, 16, 35 hari.
   - Tabel keputusan deterministik untuk rekomendasi tugas berikutnya.

---

## 5. Roadmap Eksekusi & Urutan Tahap (Phases A–H)

```
[Tahap A: Perbaikan Dasar & Gate 1-4]
                ↓
[Tahap B: Hero 3D, Relief Geometri, Topo Background & Navbar]
                ↓
[Tahap C: Asset Pipeline Wikimedia & Theme Engine]
                ↓
[Tahap D: Scene Aksara Marquee & Regional 6 Negara]
                ↓
[Tahap E: Halaman Negara Redesign & Latar Adaptif]
                ↓
       ┌────────┴────────┐
       ↓                 ↓
[Tahap F: Paritas EN]  [Tahap G: Engine Dashboard & Quest]
       └────────┬────────┘
                ↓
[Tahap H: Verifikasi Menyeluruh & Ship Ready]
```

---

## 6. Standar Verifikasi & Definisi Selesai (DoD)

Proyek ini hanya boleh dinyatakan selesai jika seluruh kriteria berikut terpenuhi dan dibuktikan dengan log mentah:
1. `npm run test` (Vitest): 100% lulus tanpa kegagalan.
2. `npm run typecheck` (`tsc --noEmit`): Nol error.
3. `npm run lint`: Nol warning, nol error.
4. `node scripts/verify.mjs`: Exit code 0 (termasuk verifikasi integritas gambar dan kontras warna).
5. `npx playwright test`: Seluruh skenario E2E (gates, landing, country, dashboard) lulus di 1440px, 768px, dan 375px.
6. Bukti visual browser nyata terlampir di direktori verifikasi.
7. Tidak ada file kerja yang tertinggal dalam keadaan uncommitted saat penutupan fase.
