# PALETTE_FIX.md — Koreksi Warna Negara Bertetangga

Tanggal: 21 Oktober 2026
Status: Diterapkan ke `src/styles/tokens.css` dan diverifikasi `node scripts/check-contrast.mjs` (exit 0)

---

## Ringkasan

Empat warna negara (VN, CN, MN, IN) diubah untuk memenuhi ambang ΔE2000 ≥ 15 pada pasangan bertetangga. Masalah awal: palet lama menghasilkan VN-CN = 8.87 dan CN-MN = 5.81. Saat gate diperluas ke seluruh perbatasan darat, CN-IN = 13.43 ikut gagal — IN disesuaikan agar semuanya lulus dengan margin.

---

## Perubahan Warna

| Negara | Lama | Baru | Alasan |
|--------|------|------|--------|
| Vietnam (VN) | `#D4A05E` | `#E8C070` | Terlalu dekat dengan CN. Geser lebih terang + saturated yellow untuk pisahkan di ruang warna. |
| China (CN) | `#B89F7A` | `#A5996B` | Terlalu mirip VN dan MN. Geser lebih gelap + cooler + desaturate untuk bedakan dari kedua tetangga. |
| Mongolia (MN) | `#A8927A` | `#98786A` | Terlalu dekat dengan CN. Geser lebih gelap + tambah red undertone untuk pisahkan. |
| India (IN) | `#C9935F` | `#D18D43` | CN-IN hanya 13,43 setelah gate diperluas ke perbatasan Himalaya. Digeser lebih kuning-oker agar terpisah; semua pasangan lain tetap ≥ 14,5. |

---

## Hasil Verifikasi

### ΔE2000 Pasangan Bertetangga

| Pasangan | ΔE Lama | ΔE Baru | Status |
|----------|---------|---------|--------|
| ID-MY | 38.68 | 38.68 | ✓ tidak diubah |
| MY-SG | 44.28 | 44.28 | ✓ tidak diubah |
| TH-VN | 40.31 | **46.37** | ✓ membaik |
| VN-CN | **8.87** | **15.54** | ✓ LULUS (gagal → lulus) |
| CN-MN | **5.81** | **19.18** | ✓ LULUS (gagal → lulus) |
| JP-KR | 33.16 | 33.16 | ✓ tidak diubah |
| KR-CN | 31.17 | **32.84** | ✓ membaik sedikit |
| SA-TR | 42.34 | 42.34 | ✓ tidak diubah |
| KZ-UZ | 24.26 | 24.26 | ✓ tidak diubah |
| TH-MY | tidak diukur | 31.25 | ✓ perbatasan darat |
| CN-IN | 13.43 | **16.18** | ✓ LULUS (gagal → lulus) |
| CN-KZ | tidak diukur | 31.45 | ✓ perbatasan darat |
| IN-MN | tidak diukur | 18.75 | ✓ berdekatan visual |

**Semua pasangan ≥ 15.54 ΔE — memenuhi target.** Angka di tabel ini keluaran `scripts/check-contrast.mjs`, bukan estimasi.

### Kontras WCAG 2.1 (tidak berubah)

| Token | Ratio | Minimum | Status |
|-------|-------|---------|--------|
| `--ink` di `--surface` | 15.51 | 7.0 | ✓ AAA |
| `--ink-muted` di `--surface` | 5.47 | 4.5 | ✓ AA |
| `--accent` di `--surface` | 5.88 | 4.5 | ✓ AA |
| `--accent-ink` di `--accent` | 6.23 | 4.5 | ✓ AA |

---

## Arah Artistik Tetap Terjaga

Perubahan mempertahankan karakter muted, earthy, harmonis:

- **VN `#E8C070`**: Tetap golden yellow earthy, lebih terang tapi tidak neon
- **CN `#A5996B`**: Tetap ocher warm, lebih muted dan grounded
- **MN `#98786A`**: Tetap brown taupe, lebih gelap dengan hint red

Tidak ada warna yang jadi saturated/neon atau keluar dari palet earthy.

---

## Penerapan

Nilai di `src/styles/tokens.css` (sudah diterapkan):

```css
--country-vn: #e8c070;
--country-cn: #a5996b;
--country-mn: #98786a;
--country-in: #d18d43;
```

Verifikasi: `node scripts/check-contrast.mjs` → exit 0, 4 pemeriksaan WCAG lulus, 13 pasangan ΔE lulus.

---

## Bukti

Skrip verifikasi: `scripts/check-contrast.mjs` (satu-satunya sumber kebenaran; membaca langsung `src/styles/tokens.css`).
Skrip sementara yang dipakai saat pencarian kandidat sudah dihapus agar tidak ada sumber kebenaran kedua.
