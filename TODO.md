# TODO — Eliminasi AI-Slop Visual & Copywriting · update: 2026-10-30 00:30 oleh @fixer
## Goal
Membersihkan total seluruh elemen AI-slop (UI template generic 3-card bento, kotak centang hijau/merah SaaS generic, bullet point hero шаблон, tombol kotak merah clunky) dan kata-kata AI slop ("embark", "mahakarya", "keajaiban", "menyelami") menjadi tampilan arsip kultural litograf editorial berkelas Awwwards.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Audit & katalog seluruh titik AI-slop visual & teks di codebase | orchestrator | ✅ Done | scan-slop.mjs, scan-comments.mjs, visual review |
| T2 | Redesain `EtiquetteFieldGuide.tsx`: hapus kotak centang hijau/merah cliché SaaS, ganti ke Risalah Adab Lapangan | @designer | ✅ Done | EtiquetteFieldGuide.tsx, etiquette-guide.css, field protocol plates |
| T3 | Redesain `ExpeditionMasterySection.tsx`: hapus 3-card bento generic, ubah ke Konsol Litograf Metodologi Retensi | @designer | ✅ Done | ExpeditionMasterySection.tsx, mastery-console, retention-instrument |
| T4 | Bersihkan copy slop ("embark", "mahakarya", "keajaiban", "menyelami") di `RegionExpeditionGallery`, `i18n.ts`, `cultural-matrix-data` | @fixer | ✅ Done | RegionExpeditionGallery.tsx, cultural-matrix-data.ts, vitest 148/148 pass |
| T5 | Perbarui Hero Index Karakter Benua (gantikan 3 bullet point template dengan metrik kartografis riil) | @designer | ✅ Done | LandingPage.tsx:456-494 [ARC · 48] census grid |
| T6 | Hapus tombol kotak merah "Mulai Tantangan Harian" di Hero agar tampilan clean & tenang | @designer | ✅ Done | LandingPage.tsx:321-356 removed, landing.css cleaned |
| T7 | Jalankan seluruh unit test (18 test files) & Playwright screenshot visual audit | orchestrator | ✅ Done | scratch/verified-antislop-*.png, 0 console errors |
| T8 | Final verify 10 gate (verify.mjs exit 0) & push git ke remote | @fixer | ✅ Done | verify.mjs 10/10 gates pass exit 0 (typecheck, lint, test, build, model, contrast, content, images, themes, e2e) |

## Blokir & Risiko
- Semua tugas selesai dan seluruh 10 gate terverifikasi bersih exit code 0.

## Ringkasan
Progress 8/8 done · Lane aktif: 0 · Blocked: 0
