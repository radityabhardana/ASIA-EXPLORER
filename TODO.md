# TODO — Perbaikan Halaman Negara & Repo Sync · update: 2026-10-29 oleh @fixer
## Goal
Halaman negara bersih tanpa siluet hitam/arsiran mengganggu, layout editorial rapi, repo GitHub sinkron bersih.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Desain ulang latar & sidebar halaman negara (hapus arsiran hitam & siluet mengganggu) | @designer | ✅ Done | `5f9a3de` & `docs/shots_intro_verify/121-country-in-no-black-blob.png` |
| T2 | Audit layout mobile & desktop halaman negara agar cerita tidak tertutup | @designer | ✅ Done | `docs/shots_intro_verify/122-country-in-text-clean.png` & `123-country-in-mobile-clean.png` (Playwright 14/14 pass) |
| T3 | Verifikasi test suite, contrast, & build 100% | @fixer | ✅ Done | `typecheck`, `lint` (0 warn), `vitest` (10/10 files, 92 tests pass), `scripts/verify.mjs` (9/9 steps pass) |
| T4 | Push repo GitHub bersih | @fixer | ✅ Done | `origin/main` sinkron di GitHub |

## Blokir & Risiko
- Tidak ada blokir aktif.

## Ringkasan
Progress 4/4 done · Lane aktif: 0 · Blocked: 0
