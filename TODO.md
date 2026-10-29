# TODO — Elevasi Penjelasan Negara & 3D Model Auto-Recenter · update: 2026-10-29 20:55 oleh @orchestrator
## Goal
1. Standardisasi penjelasan seluruh 48 negara menjadi layout editorial profesional yang seragam (lead paragraph, pull-quote budaya, 3 kaidah etiket konsisten, kartu arsip budaya & masyarakat).
2. Implementasi auto-recenter spring pada model 3D (saat dilepas user, kamera otomatis kembali ke posisi home), elevasi taktil hover relief pada poligon negara, dan sinkronisasi kompas.

## Task Board
| ID | Task | Owner Agent | Status | Bukti / Verifikasi |
|---|---|---|---|---|
| T1 | Standarisasi editorial `StoryBlock`, `CountryEtiquette` (48 negara konsisten), dan `NoteBlock` | @designer | ✅ Done | StoryBlock lead+quote, CountryEtiquette 3 pilar baku 48 negara, NoteBlock plat arsip litograf, vitest 124/124 |
| T2 | Implementasi auto-recenter timer pada 3D model (`interactions.js` / `panel-map.js`) saat mouse dilepas | @fixer | ✅ Done | interactions.js: timer 1400ms, camera-rig overview(), batal saat drag baru |
| T3 | Elevasi taktil 3D: hover relief lift Y pada poligon negara & sinkronisasi rotasi kompas | @fixer | ✅ Done | countries.js: lerp Y=1.0, roughness 0.32, AsiaSceneLazy compass heading sync |
| T4 | Audit visual Playwright browser 3D auto-recenter & periksa keseragaman halaman negara | orchestrator | ✅ Done | scratch/uniform-*.png (JP, SA, AF, KZ, ID identik), scratch/3d-auto-recentered.png |
| T5 | Jalankan seluruh suite tes (typecheck, lint, test, build, verify.mjs) & push git ke remote | @fixer | ✅ Done | Commit 5789d94 pushed to origin main, verify.mjs 10/10 gates pass exit 0 |

## Blokir & Risiko
- Semua tugas selesai dan terverifikasi bersih.

## Ringkasan
Progress 5/5 done · Lane aktif: 0 · Blocked: 0
