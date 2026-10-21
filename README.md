# Asia Explorer

Situs penjelajahan benua Asia: satu benua 3D di landing page, lima belas halaman negara yang
dibaca seperti esai. Tanpa navbar, tanpa kartu, tanpa menu. Navigasi lewat gulir dan benua itu
sendiri.

Nama produk di layar: **Asia Explorer**. Nama paket dan folder tetap `asiakin`/`asiakin-v3`
(lihat `docs/PRD_V2_4_DELTA.md`, D37).

## Isi

- **Landing** (`/`) — delapan adegan yang dijalankan satu timeline gulir: hero benua, skala,
  bahasa, aksara, peta regional, budaya, undangan, indeks 15 negara.
- **Halaman negara** (`/negara/:id`) — urutan Hero → Cerita → Budaya → Orang → Bahasa → Sumber,
  satu kolom teks 68ch dengan sidebar sticky. Rute lama `/country/:id` dialihkan ke sini.
- **Tema terang saja.** `--ground`, `--surface`, `--ink` di `src/styles/tokens.css`.

## Bentuk data

| Berkas | Isi |
|---|---|
| `docs/content/raw-{asean,west,east}.json` | sumber yang diedit manusia: cerita, budaya, orang, sapaan, sumber |
| `src/content/countries.json` | keluaran `npm run content:build`, divalidasi skema |
| `src/content/countries.ts` | tipe dan pembacaan; label kejujuran `Lengkap` untuk `confidence === 'tinggi'` (10 negara), `Penjelajahan` untuk 5 sisanya |

Lima belas negara: `id, my, sg, th, vn, ph, cn, jp, kr, in, sa, tr, kz, uz, mn`.

Setiap negara punya minimal dua sumber dengan URL dan tanggal akses. Angka penduduk dan ibu kota
sengaja tidak ditampilkan.

## Benua 3D

Model GLB dibangun dari batas Natural Earth 1:50m dengan proyeksi Lambert Azimuthal Equal-Area
(90°E, 32°N), diekstrusi di Blender lewat CLI, lalu dipilih dengan raycast memakai `extras.iso3`.
Dataran (`--ground`) memakai `ShadowMaterial` dan tiga cincin rambut sebagai penanda skala.

Tanpa WebGL, saat chunk gagal dimuat, atau setelah 5 detik tanpa frame, `AsiaSceneLazy` jatuh ke
peta SVG yang tetap bisa diklik. Preloader berjalan paling lama 1,2 detik dan hanya sekali per
sesi; muat langsung ke `/negara/:id` tidak memakai preloader.

## Menjalankan

Node.js ≥ 22.

```bash
npm install
npm run dev          # http://localhost:5173/ (port dikunci)
start-hidden.bat     # alternatif tanpa jendela konsol
stop-server.bat      # hentikan server latar
```

## Verifikasi

```bash
npm run verify              # typecheck, lint, vitest, build, model, kontras warna, konten
set VERIFY_E2E=1 && npm run verify   # ikut menjalankan Playwright (butuh port 5173 bebas)
```

`scripts/verify.mjs` menjalankan langkah berurutan dan berhenti pada kegagalan pertama. Playwright
dijalankan dengan `--workers=2`; jumlah worker lebih tinggi terbukti membuat gate waktu gagal
secara acak. Hentikan server yang sedang berjalan lebih dulu (`stop-server.bat`) karena suite
memakai `reuseExistingServer: false`.

Gate yang mengikat ada di `e2e/gates.spec.ts`: orientasi utara-atas, tanpa kedip peta SVG,
preloader, ukuran tinta benua, grid 48px, tabrakan headline, counter, diptych budaya,
keterjangkauan indeks kaki halaman, dan reveal per adegan di 375/768.

`docs/VERIFY.md` memuat angka hasil pengukuran terakhir, `docs/OPEN_DEFECTS.md` memuat cacat yang
masih terbuka. Tangkapan layar tersimpan lokal di `docs/VERIFY/` (diabaikan git).

## Model dan peta

```bash
npm run model:build    # butuh Blender 5.2 di jalur baku; GLB tidak byte-reproducible
npm run model:verify
npm run map:build      # regenerasi path SVG dari GeoJSON
npm run contrast       # rasio teks dan ΔE2000 antarnegara bertetangga
```

## Susunan

```
src/app/         shell, rute, preloader
src/scene/       AsiaScene (Three.js): kamera, dataran, intro, measureInk()
src/sections/    landing (8 adegan) dan country (6 blok)
src/content/     data mentah (docs/content) dan countries.json hasil build
src/styles/      tokens, shell, landing, country
docs/            audit, PRD delta, cacat terbuka, laporan verifikasi
```
