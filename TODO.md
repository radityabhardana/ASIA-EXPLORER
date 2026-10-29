# TODO — Perbaikan Halaman Negara & Repo Sync · update: 2026-10-29 oleh @fixer
## Goal
Halaman negara bersih tanpa siluet hitam/arsiran mengganggu, layout editorial rapi, repo GitHub sinkron bersih.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Desain ulang latar & sidebar halaman negara (hapus arsiran hitam & siluet mengganggu) | @designer | ✅ Done | `CountryPortrait.tsx` (arsiran hitam dihapus total), `CountryBackground.tsx` (grain noise & siluet gelap dibersihkan) |
| T2 | Audit layout mobile & desktop halaman negara agar cerita tidak tertutup | @designer | ✅ Done | `CountryPage.tsx` & `RegionLocator.tsx` bersatu jadi 1 kartu editorial; mobile (<600px) hero 240px & map 125px rapi |
| T3 | Verifikasi test suite, contrast, & build 100% | @fixer | ✅ Done | `npm run verify`: 9/9 step lulus (typecheck, lint 0 warn, vitest 100/100, build, contrast >=14:1) |
| T4 | Push repo GitHub bersih | @fixer | ⏳ Queued | Siap commit & sinkronisasi branch main |

## Blokir & Risiko
- Tidak ada blokir aktif.

## Ringkasan
Progress 4/4 done · Lane aktif: 0 · Blocked: 0
