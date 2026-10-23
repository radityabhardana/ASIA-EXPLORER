# PRD v2.4 DELTA — Asia Explorer: Website Dinamis

Tanggal: 23 Oktober 2026  
Status: Mengikat. Menyelaraskan seluruh fase pembangunan dari situs statis menjadi website dinamis bertahap (M1 sampai M4).  
Referensi Induk: `docs/ROADMAP_DYNAMIC.md` & `docs/PRD_MASTER.md`.

---

## 0. Mandat Arsitektur & Prinsip Utama
1. **Tema Terang Mutlak**: Hanya latar kertas hangat (`--paper: #f4ede1`), tanpa dark mode, tanpa gradasi ungu-biru, tanpa glassmorphism, tanpa kartu berbingkai, dan tanpa drop-shadow melayang.
2. **Anti-Slop Editorial**: Semua kartu kotak berbingkai dilarang. Komposisi menggunakan ritme editorial, garis kontur hairline, dan whitespace terukur. Tanpa emoji, tanpa gamifikasi murahan (tanpa XP, streak, leaderboard, badge).
3. **Kedaulatan Data Pengguna (Local-First)**: Progres, frasa, dan riwayat disimpan di IndexedDB lokal pengguna. Sinkronisasi server bersifat opsional/tahap lanjut.
4. **Verifikasi Bukti Riil**: Tidak ada fitur yang dinyatakan selesai tanpa bukti terminal mentah, tes Playwright 3 ukuran viewport (375, 768, 1440), dan screenshot bertahap (scroll bertahap, bukan full-page screenshot).
5. **Kunci Rahasia & Backend**: Tidak ada secret di klien. Panggilan AI (Gemini) ditunda ke M4 lewat server tipis (BFF) dengan template prompt terkunci di server.

---

## 1. Peta Rilis & Tahapan (M1 – M4)
- **M1 — Situs Publik Eksplorasi (Fase 0 s/d 4)**:
  - Landing sinematik dengan drone intro, panggung medan dataran bergradasi radial ke kertas (tanpa tepi persegi/biji beras).
  - Navbar absolute transparan dengan 3 link (Jelajah, Dashboard, Negara), switch ID/EN, Masuk & Daftar (teks editorial).
  - 15 halaman negara berfoto resmi Wikimedia Commons (AVIF/WebP), tema warna per negara adaptif dari foto hero.
  - Popup carousel foto dua panel dan galeri mosaik 15 negara tanpa bingkai di landing page.
  - Dua bahasa (ID dan EN) dengan pengujian paritas kunci.
- **M2 — Akun & Dashboard Inti (Fase 5 s/d 7)**:
  - Masuk/Daftar (auth aman, RLS PostgreSQL), Dashboard lokal-first, mesin penentu tugas deterministik, Phrase Vault dengan spaced repetition 5-kotak Leitner.
- **M3 — Pembelajaran Budaya Penuh (Fase 8 s/d 9)**:
  - Pelajaran 4 langkah, skenario budaya bercabang dengan alasan budaya bersumber sah, Cultural Field Notes, ekspor/impor JSON tervalidasi skema.
- **M4 — Analisis AI Terkendali (Fase 10)**:
  - Analisis attempt via BFF server Gemini berbatas waktu & biaya, persetujuan eksplisit, fallback lokal deterministik.
- **Peluncuran & Hardening (Fase 11 s/d 12)**:
  - Audit OWASP, audit aksesibilitas WCAG 2.2 AA, kepatuhan UU PDP No. 27/2022.

---

## 2. Gate Verifikasi Fase 0
Sebelum melangkah ke Fase 1 atau implementasi fitur berikutnya:
1. `npm run typecheck` (`tsc --noEmit`): 0 error.
2. `npm run lint` (`eslint . --max-warnings=0`): 0 error, 0 warning.
3. `npm run test` (`vitest run`): semua unit test lulus (35/35 passing).
4. `node scripts/check-contrast.mjs`: semua token warna lulus ambang WCAG AA/AAA dan CIEDE2000.
5. `node tools/fetch-images.mjs --check`: 60 entri, 240 derivative AVIF/WebP sah lisensi Wikimedia Commons.
6. `node tools/build-themes.mjs --check`: 15 tema negara tervalidasi kontras.
7. Keputusan K1 sampai K6 serta D7 dan D8 telah dijawab dan dikonfirmasi oleh pengguna.

---

## 3. Matriks Keputusan Terbuka (Wajib Konfirmasi User)
1. **K1**: Blok info sumber data dihapus dari landing, diletakkan sebagai tautan referensi yang dilipat di halaman negara? (Rekomendasi: Ya).
2. **K2**: Foto hanya dari Wikimedia Commons via API resmi, lisensi whitelisted, tanpa scraping ilegal? (Rekomendasi: Ya).
3. **K3**: Navbar diam di puncak halaman (`position: absolute`, ikut tergulung scroll, tidak sticky)? (Rekomendasi: Ya).
4. **K4**: Dua bahasa (ID/EN) dibangun dari kerangka i18n, terjemahan diprioritaskan untuk 10 negara Lengkap? (Rekomendasi: Ya).
5. **K5**: Penyimpanan data: Lokal dulu di IndexedDB (Dexie) dengan akun opsional, atau langsung akun + cloud database sejak awal? (Rekomendasi: Lokal dulu, sinkronisasi di Fase 9).
6. **K6**: Analisis AI Gemini: Ditunda ke M4 dan hanya via backend server tipis? (Rekomendasi: Ya).
7. **D7**: Penyedia backend & autentikasi saat tiba Fase 5: Supabase, Firebase, atau server Node mandiri? (Rekomendasi: Supabase).
8. **D8**: Platform hosting produksi & staging: Cloudflare Pages atau Vercel? (Rekomendasi: Cloudflare Pages / Vercel).
