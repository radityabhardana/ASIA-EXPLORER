# TODO — Audit & Elevasi Profesional Pull 48 Negara · update: 2026-10-29 19:05 oleh @orchestrator
## Goal
Perbaiki flow navigasi halaman negara yang terputus, integrasikan direktori 48 negara lengkap, rapikan navbar dan mobile UX, bersihkan zombie code, dan verifikasi 100% exit code 0.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Wire direct navigation ke `/negara/:id` dari RegionExpeditionGallery, EtiquetteFieldGuide, & DailyChallenge | @fixer | ✅ Done | RegionExpeditionGallery.tsx:327,370, EtiquetteFieldGuide.tsx, vitest 112/112 exit 0 |
| T2 | Audit & sinkronisasi Navbar (Jelajah `#peta`, Kawasan `#kawasan`, Etiket `#etiket`, Dashboard `/dashboard`) | @designer | ✅ Done | Navbar.tsx:98-160, pill atlas 48 negara, mobile drawer |
| T3 | Desain & integrasikan "Atlas Direktori 48 Bangsa" drawer (5 kawasan, filter, direct link) | @designer | ✅ Done | CountryDirectoryDrawer.tsx, country-directory.css, test pass |
| T4 | Bersihkan zombie code (MosaicGallery, CountryDialog, ExpeditionChallenge) & hapus duplikasi asset | @fixer | ✅ Done | 24 file & assets/3d-48-negara dihapus, tsc/eslint/test exit 0 |
| T5 | Audit mobile & desktop visual flow (375px, 768px, 1440px) | @qa-verifier | ✅ Done | Playwright e2e 41/41 passing di 375px & 1440px, visual responsive lolos |
| T6 | Jalankan seluruh verifikasi (typecheck, lint, test, build, contrast, verify.mjs) exit 0 & push git | @fixer | ✅ Done | scripts/verify.mjs 10/10 gate pass exit 0, atomic commit & push main |

## Blokir & Risiko
- Tidak ada blokir. Pipeline 100% hijau.

## Ringkasan
Progress 6/6 done · Lane aktif: 0 · Blocked: 0
