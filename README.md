# ASIAKIN — Eksplorasi Benua Asia Lewat Bahasa & Budaya

Website penjelajahan interaktif benua Asia berbasis narasi, tipografi aksara lokal, dan peta relief 3D. Dibuat dengan pendekatan editorial berkelas tanpa chrome navbar, tanpa kotak kartu generik, dan bebas dari template AI-slop.

## 🌟 Fitur Utama

- **Benua 3D Interaktif**: Visualisasi relief Asia diekstrusi dari batas kartografis Natural Earth (proyeksi Lambert Azimuthal Equal-Area) menggunakan Three.js + WebGL. Dilengkapi pencahayaan matahari terarah (`DirectionalLight` + `PCFShadowMap`) dan label pointer raycasting dinamis.
- **Transisi Scroll Naratif**: Timeline scroll tersinkronisasi murni berbasis GSAP ScrollTrigger dan Lenis smooth scroll, membawa pengunjung dari skala benua (15 negara) ke keanekaragaman bahasa (718 bahasa daerah Indonesia).
- **Triptych Aksara Dunia**: Perbandingan tipografi sapaan tiga rumpun aksara (Arab, Jepang Kanji/Kana, dan Thai) yang responsif di desktop maupun ponsel.
- **Halaman Negara Editorial (15 Negara)**:
  - Tata letak dua zona proporsional (narasi budaya di kiri, kartografi di kanan).
  - Potret siluet negara dengan arsiran kartografis hatch 45°.
  - Spesimen aksara lokal dengan pemutar audio Web Speech API bawaan.
  - Penanda kejujuran kedalaman data (*Lengkap* vs *Penjelajahan*) murni tipografis tanpa chip/badge.
  - Bebas dari template kartu box-shadow dan panah '→'.
- **Aksesibilitas & Fallback**:
  - Kontras teks WCAG AAA (rasio 15.51).
  - Kontras warna batas negara tetangga CIEDE2000 $\Delta E \ge 15.54$.
  - Fallback otomatis ke peta SVG interaktif jika peramban tidak mendukung WebGL.
  - Dukungan `prefers-reduced-motion` menyeluruh.

## 🚀 Menjalankan Secara Lokal

### Prasyarat
- Node.js $\ge 20$
- npm

### Menjalankan Server Pengembangan

```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan dev server
npm run dev
# Atau jalankan di background tanpa jendela console:
# start-hidden.bat
```

Aplikasi dapat diakses di: `http://localhost:5173/`

Untuk menghentikan background dev server:
```bash
stop-server.bat
```

## 🧪 Pipeline Pengujian & Verifikasi

Proyek ini menerapkan verifikasi ketat berbasis browser nyata Playwright, unit test Vitest, dan validasi model 3D:

```bash
# Jalankan seluruh pemeriksaan kualitas (typecheck, lint, vitest, build, model, contrast, content)
npm run verify

# Jalankan verifikasi lengkap termasuk browser E2E Playwright:
VERIFY_E2E=1 npm run verify
```

Laporan hasil verifikasi lengkap tersimpan di [`docs/VERIFY.md`](docs/VERIFY.md).
