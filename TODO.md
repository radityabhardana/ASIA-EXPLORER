# TODO MASTER — ASIA EXPLORER (V3.0)
**Rencana Eksekusi Terstruktur & Status Pelacakan Pekerjaan**  
*Basis PRD Master (`docs/PRD_MASTER.md`), SPEC_DASHBOARD (`docs/SPEC_DASHBOARD.md`), & ROADMAP_DYNAMIC (`docs/ROADMAP_DYNAMIC.md`)*

---

## 🚦 Status Ringkas Proyek
- [x] **Tahap A**: Penyelesaian Celah Dasar Landing & Gate 1–4 (Status: Selesai & Terverifikasi)
- [x] **Tahap B**: 3D Hero, Panggung Kartografi, Latar Topografi Kertas Washi & Navbar Absolute (Status: Selesai)
- [x] **Tahap C**: Mesin Ekstraksi Tema Foto & Palet Adaptif (`themes.json`) (Status: Selesai)
- [x] **Tahap D**: Marquee Aksara 15 Negara dengan Audio Fonetik & Mosaik 15 Negara (Status: Selesai)
- [x] **Tahap E**: Halaman Negara Editorial, Latar Kontur Adaptif & Galeri (Status: Selesai)
- [x] **Tahap F**: Dukungan Bahasa Penuh ID/EN (`i18n.ts` & Paritas Kunci 100%) (Status: Selesai)
- [x] **Tahap G**: Arsitektur Local-First Dashboard, IndexedDB, Pelajaran & Quest (Status: Selesai)
- [x] **Tahap H**: Spaced Repetition Leitner 5-Box, Tabel Keputusan Deterministik & Verifikasi Final (Status: Selesai)

---

## 📋 Dekomposisi Task Detail per Tahap

### TAHAP A — Fondasi & Stabilitas Layout
- [x] **A.1**: Audit dan eliminasi blok sumber/referensi dari landing page.
- [x] **A.2**: Presisi grid 48px desktop / 24px mobile.
- [x] **A.3**: Perbaiki mobile reveal opacity (≥ 0.95 pada viewport 375px).
- [x] **A.4**: Restyle link "Lewati ke pilihan negara" tanpa container card.
- [x] **A.5**: Suite E2E gates lolos tanpa cacat.

### TAHAP B — 3D Hero, Relief Geometri, Latar Topografi Tanah & Navbar
- [x] **B.1**: Desain layer latar landing page: SVG vector contour + texture paper grain washi + paralaks rAF.
- [x] **B.2**: Model benua 3D bersih dengan 15 palet warna identitas nasional, pencahayaan NW sun + warm SE fill.
- [x] **B.3**: Cincin kompas kuningan ganda dengan 72 ticks derajat & crossbar kardinal.
- [x] **B.4**: Floating cursor label (`Negara · Aksara`) dengan halo blur warna kertas; wheel scroll bebas tanpa pembajakan.
- [x] **B.5**: Navbar transparan `position: absolute`, tautan anchor langsung (`#peta`, `#dashboard-showcase`, `#galeri-mosaik`).

### TAHAP C — Mesin Ekstraksi Tema Foto & Palet Adaptif
- [x] **C.1**: Skrip `tools/build-themes.mjs` mengekstrak warna dominan foto hero 15 negara menjadi palet `base`, `soil`, `accent`, dan `contourStroke`.
- [x] **C.2**: Validasi kontras otomatis (`check-contrast.mjs`) memastikan teks pada latar adaptif ≥ 12:1 (AAA).
- [x] **C.3**: Output terstruktur di `src/content/themes.json` diintegrasikan ke build pipeline.

### TAHAP D — Marquee Aksara 15 Negara & Mosaik Foto 15 Negara
- [x] **D.1**: Horizontal marquee 15 negara dengan plakat perkamen editorial bernuansa hangat, audio pelafalan asli + gelombang suara.
- [x] **D.2**: Mosaik galeri foto 15 negara dari Wikimedia Commons dengan tautan langsung ke `/negara/:id`.
- [x] **D.3**: Hapus scene 6 negara yang membingungkan; alur visual mengalir mulus tanpa void raksasa.

### TAHAP E — Halaman Negara Editorial & Latar Adaptif
- [x] **E.1**: Mesin latar adaptif per negara: gradasi halus dari `themes.json` + cincin kontur konsentris siluet negara (`CountryBackground.tsx`).
- [x] **E.2**: Layout editorial: Hero foto paralaks, Narasi cerita bersumber, 3 norma Budaya, 3 etika Orang, Bahasa & frasa + audio TTS multi-tier.
- [x] **E.3**: Galeri foto asli Wikimedia Commons 2 kolom asimetris dengan atribusi lisensi CC.
- [x] **E.4**: Modul callout belajar menuju `/dashboard` untuk 10 negara berlabel `Lengkap`.
- [x] **E.5**: Bar navigasi kembali kapsul (`← Kembali ke benua`) terlindungi top bar pelindung saat digulir.
- [x] **E.6**: Referensi dilipat rapi dalam drawer `<details>` dengan chevron.

### TAHAP F — Dukungan Bahasa Penuh ID & EN
- [x] **F.1**: Kamus tunggal `src/lib/i18n.ts` mencakup seluruh konten UI (Navbar, Hero, Skala, Aksara, Peta 3D, Mosaik, Dashboard, Footer, Halaman Negara).
- [x] **F.2**: Pengalih bahasa reaktif ID/EN di navbar, tersinkronisasi ke `localStorage` dan atribut `lang` dokumen.
- [x] **F.3**: Paritas kunci 100% (175 entri ID = 175 entri EN).

### TAHAP G & H — Arsitektur Local-First Dashboard, IndexedDB, Pelajaran, Quest & Leitner
- [x] **G.1**: Database IndexedDB `asiakin` v1 (`profiles`, `progress`, `lessons`, `attempts`, `reviews`, `meta`).
- [x] **G.2**: UI Dashboard 4 blok: Satu tugas berikutnya, Phrase Vault, status 15 negara, cadangan JSON.
- [x] **G.3**: Alur 4 langkah pelajaran (`Kenali` → `Etiket` → `Bahasa` → `Quest`).
- [x] **G.4**: Engine Quest: 60 butir untuk 10 negara Lengkap (MCQ etiket, pencocokan frasa, skenario bercabang) dengan umpan balik edukatif dan `sourceRef` valid.
- [x] **G.5**: Halaman evaluasi hasil `/dashboard/quest/:countryId/:attemptId` dengan skor tabel (`5/6`, `83%`) dan aksi retry-wrong.
- [x] **G.6**: Sesi ulas cepat Leitner 5-kotak `/dashboard/ulas` (interval 1, 3, 7, 16, 35 hari).
- [x] **G.7**: Tabel keputusan tugas berikutnya 16 baris deterministik tervalidasi 100% tes vitest.
- [x] **G.8**: Skema ekspor dan impor cadangan JSON tervalidasi Zod.
