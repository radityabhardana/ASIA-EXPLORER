# TODO MASTER — ASIA EXPLORER (V3.0)
**Rencana Eksekusi Terstruktur & Status Pelacakan Pekerjaan**  
*Basis PRD Master (`docs/PRD_MASTER.md`) & Audit Putaran 4*

---

## 🚦 Status Ringkas Proyek
- [ ] **Tahap A**: Penyelesaian Celah Dasar Landing & Gate 1–4 (Status: In Review / Koreksi Desain)
- [ ] **Tahap B**: 3D Drone Intro, Relief Geometri 3D, Latar Topografi Tanah & Navbar Absolute
- [ ] **Tahap C**: Mesin Ekstraksi Tema Foto & Palet Adaptif (`themes.json`)
- [ ] **Tahap D**: Marquee Aksara 15 Negara & Regional Asia Tenggara 6 Negara (0px Overlap)
- [ ] **Tahap E**: Halaman Negara Editorial, Latar Kontur Adaptif & Galeri
- [ ] **Tahap F**: Dukungan Bahasa Penuh ID/EN (`i18n.ts` & Paritas Kunci)
- [ ] **Tahap G**: Arsitektur Local-First Dashboard, IndexedDB, Pelajaran & Quest
- [ ] **Tahap H**: Optimalisasi Belajar Leitner 5-Box, Audit Keamanan, & Verifikasi Final

---

## 📋 Dekomposisi Task Detail per Tahap

### TAHAP A — Penyelesaian Celah Dasar Landing & Gate 1–4
*Tujuan: Memastikan fondasi layout, ink bounding box, zero overlap, dan mobile framing lulus gate ketat.*
- [x] **A.1**: Audit dan eliminasi blok sumber/referensi dari seluruh UI permukaan (`LandingPage.tsx`).
- [ ] **A.2**: Koreksi grid 48px desktop / 24px mobile agar posisi elemen presisi. *(Owner: @designer)*
- [ ] **A.3**: Perbaiki mobile reveal opacity (wajib ≥ 0.95 pada viewport 375px). *(Owner: @designer)*
- [ ] **A.4**: Restyle link "Lewati ke peta" menjadi inline text underline tanpa container card. *(Owner: @designer)*
- [ ] **A.5**: Verifikasi suite E2E `e2e/gates.spec.ts` dan `e2e/landing.spec.ts` (0 failed). *(Owner: @fixer)*

### TAHAP B — 3D Hero, Relief Geometri, Latar Topografi Tanah & Navbar
*Tujuan: Mewujudkan estetika visual highlands/earthy relief dan navigasi editorial.*
- [ ] **B.1**: Desain layer latar landing page: SVG vector contour isolines + gradasi hipsometrik oker/cokelat tanah (`--paper-warm: #f4ede1`). *(Owner: @designer)*
- [ ] **B.2**: Implementasi 3D relief mesh daratan di bawah benua Asia (`AsiaScene.tsx`) menggantikan disc elips pucat. *(Owner: @fixer)*
- [ ] **B.3**: Kamera drone intro: orbit ±120°, descending 2.2–2.8s mendarat tepat pada pose kanonik hero; bypass saat scroll/Esc/prefers-reduced-motion. *(Owner: @fixer)*
- [ ] **B.4**: Panel info hover samping pada benua 3D (tanpa modal popup); tap ganda di mobile. *(Owner: @fixer)*
- [ ] **B.5**: Navbar transparan `position: absolute` (scrolls away, tidak sticky), 3 link navigasi, switch ID/EN, tombol profil lokal. *(Owner: @designer)*

### TAHAP C — Mesin Ekstraksi Tema Foto & Palet Adaptif
*Tujuan: Mengotomatisasi palet warna rendah-kroma dari foto hero untuk latar adaptif halaman negara.*
- [ ] **C.1**: Skrip `tools/build-themes.mjs` mengekstrak warna dominan foto hero 15 negara menjadi palet `base`, `soil`, `accent`, dan `ink`. *(Owner: @fixer)*
- [ ] **C.2**: Validasi kontras otomatis (`check-contrast.mjs`) memastikan teks pada latar adaptif ≥ 4.5:1. *(Owner: @fixer)*
- [ ] **C.3**: Output terstruktur di `src/content/themes.json` diintegrasikan ke build pipeline. *(Owner: @fixer)*

### TAHAP D — Marquee Aksara 15 Negara & Regional Asia Tenggara
*Tujuan: Panggung narasi interaktif tanpa container card atau klaim palsu.*
- [x] **D.1**: Implementasi horizontal marquee 15 negara ("Aksara yang bergerak"), loop kontinu ±45s, pause on hover/focus, fallback statis reduced-motion. *(Owner: @designer)*
- [x] **D.2**: Redesign scene regional "Satu kawasan, enam negara" (ID, MY, SG, TH, VN, PH) berjejer rapi, zero text-silhouette overlap. *(Owner: @designer)*
- [ ] **D.3**: Blok landing "Lanjutkan penjelajahan" membaca state profil lokal dari IndexedDB. *(Owner: @fixer)*

### TAHAP E — Halaman Negara Editorial & Latar Adaptif
*Tujuan: Membangun halaman negara berkualitas editorial dengan kedalaman kultural dan latar dinamis.*
- [ ] **E.1**: Mesin latar adaptif per negara: gradasi halus dari `themes.json` + cincin kontur konsentris siluet negara (`CountrySilhouette.tsx`). *(Owner: @designer)*
- [ ] **E.2**: Layout 7 blok editorial: Hero foto, Narasi cerita (120–180 kata), 3 norma Budaya, 3 etika Orang, Bahasa & frasa + audio TTS, Galeri foto. *(Owner: @designer)*
- [ ] **E.3**: Mosaik galeri foto dari `src/content/images.json` dengan atribusi lisensi Wikimedia legal satu baris. *(Owner: @fixer)*
- [ ] **E.4**: CTA navigasi pelajaran untuk 10 negara berlabel `Lengkap`. *(Owner: @fixer)*

### TAHAP F — Dukungan Bahasa Penuh ID & EN
*Tujuan: Paritas bilingual sempurna tanpa string hardcoded.*
- [ ] **F.1**: Kamus tunggal `src/content/i18n.ts` mencakup seluruh konten landing, negara, dan dashboard. *(Owner: @fixer)*
- [ ] **F.2**: Routing bilingual `/` (ID) dan `/en` (EN) dengan sinkronisasi `<html lang>`. *(Owner: @fixer)*
- [ ] **F.3**: Test paritas kunci i18n wajib menggagalkan build jika ada kunci yang hilang di salah satu bahasa. *(Owner: @fixer)*

### TAHAP G — Engine Dashboard, Pelajaran & Quest
*Tujuan: Membangun aplikasi pembelajaran lokal berkinerja tinggi tanpa ketergantungan server.*
- [ ] **G.1**: Database IndexedDB `asiakin` (stores: `profiles`, `progress`, `lessons`, `attempts`, `reviews`, `meta`). *(Owner: @fixer)*
- [ ] **G.2**: UI Dashboard 4 blok: Tugas berikutnya, frasa jatuh tempo, status negara, cadangan/ekspor. *(Owner: @designer)*
- [ ] **G.3**: Alur 4 langkah pelajaran (`Kenali` → `Etiket` → `Bahasa` → `Quest`). *(Owner: @designer + @fixer)*
- [ ] **G.4**: Engine Quest: 6 butir per negara (3 MCQ etiket, 2 pencocokan frasa, 1 skenario bercabang) dengan umpan balik edukatif berdasar sumber nyata. *(Owner: @fixer)*
- [ ] **G.5**: Halaman hasil `/dashboard/quest/:countryId/:attemptId` menampilkan evaluasi mendalam tanpa elemen gamifikasi murahan. *(Owner: @designer)*

### TAHAP H — Optimalisasi Belajar, Audit Keamanan & Gate Final
*Tujuan: Penjaminan mutu menyeluruh sebelum peluncuran.*
- [ ] **H.1**: Implementasi algoritma Spaced Repetition Leitner 5-kotak (1, 3, 7, 16, 35 hari) untuk review frasa bahasa. *(Owner: @fixer)*
- [ ] **H.2**: Audit keamanan data lokal, ekspor/impor JSON, dan proteksi IDOR / sanitasi input. *(Owner: @security-reviewer)*
- [ ] **H.3**: Eksekusi suite verifikasi penuh Playwright di 3 viewport (1440, 768, 375), `scripts/verify.mjs` exit 0, dan tangkapan layar bukti nyata. *(Owner: Orchestrator)*

---

## 🔒 Aturan Gerbang Kualitas (Quality Gate)
- Setiap pekerjaan yang selesai wajib menyertakan log eksekusi terminal asli.
- Dilarang merge kode jika `scripts/verify.mjs` gagal atau lint/typecheck menghasilkan warning.
