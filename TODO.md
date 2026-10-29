# TODO — 3D Mobile Center & Popup 4-Photo Carousel · update: 2026-10-29 22:50 oleh @orchestrator
## Goal
1. Perbaiki 3D model di mobile agar tidak offside saat diputar: jadikan titik pusat benua (0, 0, 0) sebagai pivot rotasi tunggal, sesuaikan radius & framing agar benua berputar di tempat (on-axis) tanpa terpotong ke kanan/kiri.
2. Tambahkan carousel galeri minimal 4 foto lokal per negara pada popup Lembar Lapangan (CountryPreviewPanel) dengan tombol prev/next (< >), counter (1/4), badge peran (Lansekap, Kehidupan, Kuliner, Pusaka), tanpa aset external HTTPS.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Fix 3D mobile camera pivot (target (0,0,0) & vertical framing) di `camera-rig.js` & `controls.js` | @fixer | ✅ Done | target (0,0,0), radius 168/aspect, polar bounds, vitest 147/147 |
| T2 | Ekspor `getCountryPhotos(countryId)` di `photos.ts` untuk memuat ke-4 foto lokal | @designer | ✅ Done | photos.ts: getCountryPhotos() return 4 curated photos per country |
| T3 | Bangun Photo Carousel di `CountryPreviewPanel.tsx` (< > prev/next, dot indicators, badge peran, keyboard arrow) | @designer | ✅ Done | CountryPreviewPanel.tsx, tactile arrows, category badge, dynamic credits |
| T4 | Styling carousel tombol & transisi analog di `src/styles/landing.css` | @designer | ✅ Done | landing.css, archival circular buttons, crossfade, mobile sheet |
| T5 | Test Playwright mobile rotation (iPhone 16, 393px) & verifikasi carousel 4 foto | orchestrator | ✅ Done | scratch/verified-mobile-rotated-*.png & verified-carousel-photo*.png |
| T6 | Jalankan seluruh verifikasi (verify.mjs 10 gate) & git push ke remote | @fixer | ✅ Done | node scripts/verify.mjs 10/10 gates exit 0, git push origin main |

## Blokir & Risiko
- Tidak ada blokir. Seluruh task T1-T6 selesai terverifikasi.

## Ringkasan
Progress 6/6 done · Lane aktif: 0 · Blocked: 0
