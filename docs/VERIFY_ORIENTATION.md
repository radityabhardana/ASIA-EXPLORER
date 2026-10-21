# Bukti Verifikasi Orientasi 3D Benua Asia (P0a)

- Tanggal: 2026-10-21 (UTC)
- Viewport: 1440 × 900 px
- Canvas hero: 892.8 × 595.2 px (rasio 3:2)
- Screenshot: `docs/VERIFY/p0/canvas-hero-1440.png`

## 1. Centroid proyeksi layar (`window.__asiakin_scene.projected`)

| Kode | Negara | Centroid (x, y) | Posisi yang diharapkan |
|---|---|---|---|
| `jp` | Jepang | 920.05, 7185.48 | timur / kanan |
| `sa` | Arab Saudi | 531.49, 7204.61 | barat / kiri |
| `id` | Indonesia | 914.97, 7335.92 | selatan / bawah |
| `cn` | Tiongkok | 791.65, 7185.57 | utara relatif Indonesia |

y memakai koordinat dokumen karena canvas berada di luar viewport saat diukur; yang dinilai adalah selisih relatif.

## 2. Evaluasi gate (PRD v2.4 §4)

1. Sumbu X: `x(JP) − x(SA) = 388.56 px > 20 px` → PASS
2. Sumbu Y: `y(ID) − y(CN) = 150.35 px > 20 px` → PASS

## 3. Kesimpulan

Klaim audit bahwa benua terputar 180° **tidak terbukti** pada HEAD `408e486`: proyeksi sudah north-up (Jepang di timur, Arab Saudi di barat, Indonesia di selatan Tiongkok). Tidak ada rotasi model yang diubah. Aturan ini dikunci sebagai tes otomatis di `e2e/gates.spec.ts` supaya tidak bisa regresi.

Catatan: angka di atas adalah pengukuran ulang lane P0. Pengukuran pertama (orchestrator) memberi `jp.x 918.9`, `sa.x 531.3`, `id.y 7334.0`, `cn.y 7185.0` — selisih ±2 px karena canvas belum berada pada posisi final saat pengambilan.
