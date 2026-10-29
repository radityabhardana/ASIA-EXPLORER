# TODO — Komparasi Peradaban & Audio Sapaan 48 Bangsa · update: 2026-10-29 22:15 oleh @orchestrator
## Goal
1. Implementasi Audio Sapaan Asli Bahasa Daerah (Web Speech BCP-47 + Harmonic Fallback) pada Drawer 48 Negara, Hero Preview Panel, dan Halaman Negara.
2. Implementasi Matriks Komparasi Lintas Peradaban (Side-by-Side Cultural Comparison Matrix) untuk membandingkan 2 bangsa (etiket, jamuan, falsafah, bahasa) dengan preset kurasi dan pemilihan bebas.
3. Perbaikan estetika mobile header kicker agar tidak mepet pill navbar di layar <400px.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Fix mobile header kicker spacing di layar <400px (`landing.css`) | @designer | ✅ Done | landing.css:858 clamp(14px, 3.5vw, 24px) |
| T2 | Desain & bangun `CulturalComparisonMatrix.tsx` (side-by-side peradaban, preset kurasi, kartu etiket komparatif) | @designer | ✅ Done | CulturalComparisonMatrix.tsx, cultural-matrix.css, 4 preset kurasi |
| T3 | Integrasikan tombol audio sapaan asli pada `CountryDirectoryDrawer.tsx`, `CountryPreviewPanel.tsx`, dan `CountryFactsheet.tsx` | @fixer | ✅ Done | speak() BCP-47 + roman fallback + harmonic tone, 18 test files 142/142 tests pass |
| T4 | Pasang trigger "Bandingkan Peradaban" di Navbar, Landing Page, dan Country Page | @designer | ✅ Done | Navbar.tsx, LandingPage.tsx, CountryPage.tsx compare callout |
| T5 | Unit test komparasi budaya & audio speech (`cultural-matrix.test.tsx`) | @fixer | ✅ Done | 18 test files, 142 tests passing exit 0 |
| T6 | Audit visual Playwright 375px/768px/1440px & verify.mjs exit 0 | @fixer | ✅ Done | 10/10 gate lulus exit code 0 (typecheck, lint, test, build, model, contrast, content, images, themes, e2e) |

## Blokir & Risiko
- Nihil. Seluruh pengujian pipeline lulus exit 0.

## Ringkasan
Progress 6/6 done · Lane aktif: 0 · Blocked: 0
