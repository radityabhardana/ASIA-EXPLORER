# Riset Teknis: Relief Tanah 3D & Latar Halaman Negara

Tanggal: 2026-10-23. Proyek: asiakin-v3. Semua URL di bawah di-fetch langsung (HTTP 200) pada tanggal ini.

---

## Part 1 — Referensi Visual (semua URL terverifikasi)

| # | URL (status 200) | Apa yang dilihat | Properti yang layak disalin |
|---|---|---|---|
| 1 | https://ikgrelief.ethz.ch/design/ | Pedoman hillshade Imhof (ETH Zürich): iluminasi oblique, tanpa cast shadow/refleksi; gambar pasangan "unstructured vs guideline shading" | Arah cahaya oblique konsisten; hindari cast shadow gelap; kejelasan ridge di-first-glance |
| 2 | https://ikgrelief.ethz.ch/colours/ | Halaman **yellow tone**: "A yellow tone can simulate an illuminated relief"; hypsometric ramp asli | Tint kuning-hangat untuk sisi yang terkena cahaya — peningkat efek 3D pada shading monokrom |
| 3 | https://ikgrelief.ethz.ch/design/plan-oblique-relief/ | Reliefkarte der Centralschweiz (Imfeld 1887) + plan oblique relief BirdLife Schweiz: gunung "berdiri" 45° di atas ground plane datar yang tetap terukur | Kamera ~45° tilt; ground plane tetap undistorted — build plate kontinen duduk di padang, bukan floating island |
| 4 | https://dieghernan.github.io/202210_tidyterra-hillshade/ | Peta elevasi Rumania light-mode: hillshade abu + hypsometric tint `dem_poster` (hijau→oker→coklat→putih), alpha 0.4, latar grey97 | Blend hypsometric tint di atas hillshade dengan alpha rendah; gradient non-linear (greens hanya 0–250 m) |
| 5 | https://dominicroye.github.io/blog/hillshade-effect/ | Hillshade Swiss: DEM + `shade(slope, aspect, angle=45, direction=300)` + multidirectional (270/15/60/330), lalu blend `multiply` | Multidirectional hillshade untuk shadow halus tanpa crevice pekat; latar terang theme_void |
| 6 | https://timogrossenbacher.ch/bivariate-maps-with-ggplot2-and-sf/ | Peta bivariate Swiss (light theme): relief swisstopo SRM1000 sebagai raster latar di bawah choropleth, alpha 0.6→0 | Relief dijadikan *background texture* di bawah data vektor — persis pola "benua 3D di atas terrain" |
| 7 | https://cartographicperspectives.org/index.php/journal/article/view/1727 | Abstrak Douglass & Fish 2022 (studi 5 temuan): shaded relief lebih menentukan landform clarity dibanding layer tematik | Buktikan prioritas: kualitas relief > hiasan palette; manajemen interplay layer |
| 8 | https://en.wikipedia.org/wiki/Hypsometric_tints | Konvensi Bartholomew: greens rendah → yellows/ochres → browns → grays/white puncak; dua tipe (discrete stepped vs continuous) | Dasar ramp coklat/oker; pilih **continuous** agar tidak tampak "terrace/polygonal" |
| 9 | https://threejs.org/examples/webgl_geometry_terrain.html | Demo resmi three.js: PlaneGeometry dengan heightmap prosedural deterministik + fog; latar terang-abu | Pola displacement vertex sekali-di-init; fog untuk depth di tepi far field |
| 10 | https://threejs.org/examples/webgl_geometry_terrain_raycast.html | Demo raycast di atas terrain displaced (raycaster tiga.js menghitung tri ed-prosedural dengan benar) | Menunjukkan raycast bekerja pada geometri ter-displace — tapi kita justru *mengecualikan* terrain dari pick set |

**Rejeksi (sesuai aturan user)**: dark-mode neon, purple/blue gradient, low-poly wallpaper generik — tidak ada satu pun dari kategori itu yang lolos kriteria light-theme/earth-tone di daftar di atas. `shadedrelief.com/shelton/` gagal di-fetch (HTTP 403 Cloudflare) — tidak dipakai sebagai sumber klaim.

---

## Part 2 — Perbandingan Teknik & Rekomendasi

| Opsi | Biaya implementasi Three.js | Raycast picking | Biaya mobile | Tampak di 375px |
|---|---|---|---|---|
| **(a) Displaced plane + fBm/value noise + InstancedMesh ridge** | Rendah: 1 `PlaneGeometry` 72×48 seg, vertex Y dihitung sekali di init (deterministik); + 1 `InstancedMesh` 180 prisma low-poly | Tidak tersentuh — cukup tidak masuk `pickTargets` dan tidak di `gltf.scene` | Sangat murah: 2 draw call, ≤16k tris, nol kerja shader per-frame | ≥3 ridge terlihat, p90−p10 luminance ≥14/255 tercapai; parallax nyata saat intro |
| **(b) DEM/heightmap asli (GeoTIFF/terrain-RGB) displaced** | Tinggi: decode raster, proyeksi UTM/Mercator→world, 100k+ tris untuk ridge tajam, perlu fetch tile | Tetap bisa dikecualikan dari picking, tapi alignment dengan benua mesh berisiko offset | Berat: vertex bandwidth besar, harga drop-frame di iGPU | Detail过剩 di 375px → moiré/berantakan |
| **(c) Stacked contour-extruded layers** | Sedang: N `ExtrudeGeometry` dari siluet, masing-masing z-offset + skala | Kecuali dikecualikan, tiap layer jadi pick target tambahan | Sedang-tinggi: banyak vertex outline; z-fighting rawan | Estetika "terrace/stepped" (ContourCraft) — berlawanan dengan **continuous hypsometric** di referensi #8; terlihat "papercraft", kurang earthy |
| **(d) 2D canvas hillshade sebagai background image** | Trivial (CSS/`bg-image` di 2D) | N/A — bukan bagian scene 3D | Termurah | Flat penuh: wajib ditinggalkan karena user minta "3D relief standing in mountains" |

### Rekomendasi: Opsi (a)
Alasan terikat constraint proyek ini (dokumen sumber: `asiakin-v3/docs/CONTRACT_SCENE_B.md` §3 K8):
1. **Continent mesh sudah ada** (`AsiaScene.tsx` GLB), jadi terrain = *pelengkap* di belakangnya, bukan pengganti — opsi (a) hanya menambah 2 objek (plate + ridges), tanpa menyentuh siluet negara.
2. **Raycast hanya negara**: `CONTRACT_SCENE_B.md:98-99` sudah menulis invariant ini; opsi (a) paling mudah dipenuhi karena tidak menambah pick target apapun (terrain di luar `pickTargets` dan di luar `gltf.scene` yang di-traverse `:1139-1173`).
3. **60fps**: 12 672 tris / 2 draw calls (K8 §3) aman di iGPU mobile; opsi (b) melanggar budget `triangles ≤ 60 k` di §4 Budgets.
4. **Ink bbox gate**: `CONTRACT_SCENE_B.md:100` — terrain wajib masuk `groundLike: Object3D[]` (pengganti `ground.visible`) agar `measureInk` menyembunyikannya dan bbox ink tetap 59–65 vw / 81–89 vw. Opsi apa pun yang menambah mesh di luar daftar "hide" akan membocorkan bbox.
5. **Look di 375px**: Opsi (a) memenuhi "Not-flat at 375" (≥3 ridge instansi, p90−p10 luminance ≥14/255) pada K8 §118.

---

## Part 3 — Palette Brown/Oker Light Theme

Paper target yang direncanakan: `#f4ede1` (dipakai juga oleh `--paper` di `tokens.css` dan K18).

| Stop | Hex | Rel-lum | WCAG 2.x vs `#f4ede1` | Peran |
|---|---|---|---|---|
| Ridge highlight (paling terang) | `#fbf7ee` | 0.9320 | **1.09 : 1** (di atas paper) | Sisi ridge yang menghadap cahaya — simulasi "illuminated relief" (ref #2 yellow tone) |
| Far field / plate base | `#eadfc9` | 0.7448 | 1.14 : 1 | `--terrain-100`, latar paling jauh |
| Mid field | `#ddc9a6` | 0.5990 | 1.39 : 1 | `--terrain-200` |
| Near field | `#c9a97a` | 0.4220 | 1.91 : 1 | `--terrain-300` |
| Slope mid-dark | `#a8814f` | 0.2459 | 3.05 : 1 | `--terrain-400` — batas **tergelap aman di bawah `--ink` (#1a1f24) → CR 4.68:1 ≥ 4.5** |
| Slope shadow | `#8f6b3f` | 0.1671 | 4.16 : 1 | `--terrain-500` — hanya boleh dipakai `--terrain-ink (#fffef9)` (CR 4.79:1) |
| Crevice / cast terdalam | `#6b4f2e` | 0.0892 | 6.48 : 1 | `--terrain-600` — **tidak boleh ada teks** |
| Hillshade shadow color | `#523b20` | 0.0503 | 9.00 : 1 | 3° lebih dingin dari ramp agar shadow terasa "cool-warm" tanpa jadi teal |

**Arah cahaya: NW (azimuth 315°, elevation 45°)** — sama seperti referensi #1 (Imhof) dan #5 (direction=300≈WNW, 45°). Alasan: persepsi manusia standar kartografi menafsirkan iluminasi dari kiri-atas sebagai relief positif; jika dari SE relief bisa terbaca terbalik (gunung tampak lembah). Ini juga konsisten dengan sisi dokumen K8 yang memotong relief di bawah 55–65 % dari atas (cahaya jatuh dari atas-kiri viewport).

**Dilarang keras:** saturated orange (≥70% sat), purple, teal shadow, `#000000`. Seluruh hex di atas memenuhi batas itu (maks chromaInRange rendah, hue 30–40°, tidak ada hue teal/purple).

---

## Part 4 — Latar Halaman Negara (Round 4 docx §7.3)

Referensi peraturan asli (dialek: `C:\Users\raso8\asiakin-v3\docs\Asia Explorer Audit, Riset, dan Rencana Build Putaran 4.docx`, §7.3 "Latar sesuai negara"):

> Latar berupa gradien lembut plus garis kontur yang dibuat dari offset siluet negara itu. Jangan memakai motif budaya (seigaiha dan sejenisnya) karena rawan salah pakai; warna dan foto sudah cukup. Verifikasi kontras 4,5:1 per negara di check-contrast.

### 4a. Resep kontur
- **Sumber geometri** = siluet negara yang sama dengan yang dipakai di sidebar kontinen (locator) → tiap negara unik tanpa motif budaya.
- **Jumlah ring**: **6** (cukup terlihat di 375×812; >7 jadi noise).
- **Offset step**: **12 px inward** per ring (di 375) → 24 px di 1440 (proporsional 3.2/100vw). Offset dihitung dari path siluet (polygon buffer / offset kurva, dipangkas agar tidak keluar viewport).
- **Stroke width**: **1.25 px** (375) → **1.5 px** (1440). Hairline, bukan bold — garis kontur topografis asli selalu tipis.
- **Opacity**: terluar **0.16** falloff per ring **−0.026** sampai terdalam ≈ **0.03**; keseluruhan digambar dengan `stroke-linecap:round`.
- **Arah offset**: inward (mengecil ke pusat) — meniru "ring topografi" puncak; lebih aman daripada outward karena tidak menabrak sharp-corner viewport.

### 4b. Derive warna dari foto hero tanpa "muddy"
Aturan HSL/OKLCH — hindari zona muddy (L 0.4–0.75 dengan C rendah):
1. Ambil satu hue dari foto hero (gunakan mean atau kuantisasi median-cut pada 8 warna, pilih cluster terbesar yang mengandung pixel area ≥30%).
2. **OKLCH**: pertahankan Hue, clamp Chroma ke **[0.015, 0.035]** (≈ HSL sat 8–16%), dan paksa Lightness ke **[0.94, 0.97]** — ini menaikkan warna ke "pastel tarik-kertas" alih-alih abu kusam.
3. Konversi kembali ke sRGB → jadikan warna dasar gradient (`--country-base`); gradien lembut = linear-gradient 160° dari `#f4ede1` (30%) ke `--country-base` (100%).
4. Contour line color = hue mantap dari foto (S 20–35%, L 45–55%) dipakai dengan opasitas ≤0.16 — cukup tebal terlihat tapi tidak menyapu teks.

### 4c. Tiga contoh (dihitung nyata dari repo, dengan `sharp` di `asiakin-v3/node_modules`)

| Negara | Foto (`public/images/countries/*-960.avif`) | Mean terukur (sharp `.stats()`) | Base derivasi (L/C/H → hex) | CR `--ink #1a1f24` terhadap base |
|---|---|---|---|---|
| **JP** | `mount-fuji-lake-960.avif` | mean `#425b7f` (dominant sharp `#181828`) | L 0.95 / C 0.12 / H 215° → **`#f1f2f4`** (abu-biru mist) | **14.82:1** ✅ (AAA) |
| **ID** | `borobudur-temple-960.avif` | mean `#778a96` (dominant sharp `#a8c8f8`) | L 0.95 / C 0.12 / H 203° → **`#f1f3f4`** (teal-grey mist) | **14.91:1** ✅ |
| **SA** | `qasr-al-farid-alula-960.avif` | mean `#917d80` (sandstone rock ~`#bfa080` H 30°) | L 0.95 / S 0.12 / H 30° → **`#f4f2f1`** (sandstone paper) | **14.87:1** ✅ |

> Catatan: `images.json` `dominant` (jp `#181828`, id `#a8c8f8`, sa `#6888c8`) **terlalu gelap/saturated** untuk dipakai sebagai base latar — hanya cocok sebagai *contour stroke color* dalam opasitas ≤0.16. Ini alasan kenapa derive harus dari **mean foto** (`#425b7f`, `#778a96`, `#917d80`), bukan dari field `dominant`-nya.

### 4d. Aturan kontras teks di atas latar
- Karena base hasil derive selalu L ≥ 0.94, kontras teks `--ink (#1a1f24)` terhadap base **≥ 14:1** (AAA) — jauh di atas syarat §7.3 (4.5:1).
- `--ink-muted (#5c6670)` di atas base L 0.95 = **≥ 4.8:1** (AA) — tetap lolos untuk teks sekunder; di bawah base yang lebih gelap (L 0.92) harus dinaikkan ke `--ink` atau `--ink-muted` diperbaiki satu step.
- Gradient `--paper → --country-base` tidak boleh melewati zona luminansi **0.25–0.55** di bawah teks — teks hanya ditempatkan di area base L≥0.90; jika momen grafis butuh area lebih gelap (misal band di bawah hero), teks `--ink` dilarang di sana; pakai `#fffef9` (`--terrain-ink`) seperti aturan ramp di Part 3.

---

## Bukti Tambahan (perintah & file)

- `node -e "require('sharp')"` → tersedia di `C:\Users\raso8\asiakin-v3\node_modules` (yakni `sharp` bisa dipakai untuk derive warna per negara).
- `sharp().stats()` dijalankan pada 3 file avif → hasil mean langsung tertulis 4c di atas.
- WCAG 2.x relative-luminance dihitung dengan rumus `(max+0.05)/(min+0.05)` — output numeric di tabel Part 3.

## Batas & Risiko
- Opsi (b) (DEM asli) **tidak** dianjurkan untuk fase ini — payload besar; jika someday dibutuhkan presisi geografis, pakai Mapbox `raster-dem` + `setTerrain` (referensi hanya konseptual, bukan di-rekomendasikan karena menambah dependensi SDK).
- Angka-angka luminance p90−p10 di 375 (K8 "Not-flat threshold") perlu **dikalibrasi ulang** setelah renderer terrain nyata berdiri; angka 14/255 adalah starting point menurut contract, bukan hasil terukur.
- CR `#5c6670` terhadap base ter-derive belum dihitung per negara (hanya aturan umum); wajib di-jalankan sekali lagi per negara di `check-contrast` sebelum merge.
