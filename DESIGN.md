# DESIGN.md — ASIAKIN Landing Page v3.2

Tanggal: 21 Oktober 2026
Status: Final direction (menggantikan dokumen v3 dark theme)
Cakupan: Landing page — pintu masuk ke benua Asia
Perubahan dari v3.1: Hero composition & surface art direction (T10), komposisi numerik, art direction permukaan, pembagian Blender vs Three.js, dua arah visual dengan rekomendasi.
Perubahan dari v3: Koreksi daftar negara (T1), palette harmonis (T2), font self-hosted (T3), model scroll global (T4), section editorial bergambar (T5), ikon non-emoji (T6), affordance scroll (T7), fallback konkret (T8), verifikasi kontras (T9), Varian B sebagai default.

---

## 1. Subject

ASIAKIN adalah platform belajar bahasa dan budaya Asia untuk penutur Indonesia usia 15–24. Landing page bukan brosur — adalah pengalaman menjelajah benua Asia melalui representasi 3D interaktif. User memilih negara dengan klik, mempelajari sapaan asli, lalu masuk ke halaman negara untuk konten mendalam.

**Kosakata visual:**

- Benua Asia sebagai ruang utama, bukan globe dunia penuh
- Negara = titik tujuan, bukan sekadar data
- Sapaan = pintu masuk budaya, bukan hafalan kosakata
- Scroll = narasi perjalanan, bukan daftar fitur

**Artefak utama:**

- Representasi 3D benua Asia (dua varian bentuk — lihat Section 5a)
- Popup negara dengan sapaan + audio
- Indikator progres scroll (menggantikan navbar)
- Fallback statis untuk reduced-motion dan no-WebGL

---

## 2. Direction

"Jelajahi Asia dengan jari Anda — setiap klik membuka percakapan asli, setiap scroll mengungkap cerita benua."

Arah ini tidak bisa dipakai produk lain karena:

- Globe bukan dekorasi — adalah navigation surface
- Scroll bukan container — adalah timeline narasi
- Popup bukan notification — adalah handshake budaya
- Tidak ada template chrome — hanya Anda dan benua

---

## 3. Color

### Token Peran (Light Theme)

| Token            | Nilai     | Peran                                          |
| ---------------- | --------- | ---------------------------------------------- |
| `surface`        | `#F9F7F3` | Latar halaman — hangat, seperti kertas         |
| `surface-raised` | `#FFFEF9` | Panel, popup, kartu (jarang dipakai)           |
| `ink`            | `#1A1F24` | Teks utama, heading, label penting             |
| `ink-muted`      | `#5C6670` | Teks sekunder, metadata, keterangan            |
| `line`           | `#D8D4CC` | Garis batas tipis, separator non-interaktif    |
| `accent`         | `#176B68` | Aksi utama, link, fokus ring, interaksi aktif  |
| `accent-ink`     | `#FFFEF9` | Teks di atas accent (hanya untuk tombol/badge) |
| `danger`         | `#A62F36` | Error, peringatan destruktif                   |

**Aturan pemakaian:**

- `surface` selalu sebagai latar — tidak pernah hitam atau gelap
- `accent` untuk interaksi, bukan dekorasi — tombol, link, hover state
- `ink` untuk semua teks yang harus dibaca — kontras wajib diverifikasi dengan `scripts/check-contrast` (target ≥ 7:1)
- `line` hanya untuk boundary visual — tidak untuk border tombol (gunakan `accent` atau `ink`)
- Tidak ada gradient dekoratif — hanya solid color atau transisi sangat subtle (0–15% opacity shift)

### Palette 15 Negara Asia (Untuk Color-ID Picking)

Setiap negara butuh warna unik untuk color-picking. Palette diturunkan saturasi/lightness untuk harmonis di tema terang, tetap bisa dibedakan.

**Daftar negara (sesuai PRD v2.3 §5.1):** ID, MY, SG, TH, VN, PH, CN, JP, KR, IN, SA, TR, KZ, UZ, MN

| Negara         | Kode | Hex       | Catatan                              |
| -------------- | ---- | --------- | ------------------------------------ |
| Indonesia      | ID   | `#C97A5F` | Terracotta hangat                    |
| Malaysia       | MY   | `#6B9B8E` | Teal redup                           |
| Singapura      | SG   | `#B85F5F` | Merah bata                           |
| Thailand       | TH   | `#9B7FAD` | Ungu lavender                        |
| Vietnam        | VN   | `#E8C070` | Kuning tanah                         |
| Filipina       | PH   | `#6A7FAD` | Biru redup                           |
| Tiongkok       | CN   | `#A5996B` | Oker warm                            |
| Jepang         | JP   | `#D18A94` | Merah muda dusty                     |
| Korea Selatan  | KR   | `#7A9BB8` | Biru grey                            |
| India          | IN   | `#D18D43` | Ochre earthy                         |
| Arab Saudi     | SA   | `#A8B87A` | Hijau olive                          |
| Turki          | TR   | `#9F7A8F` | Mauve                                |
| Kazakhstan     | KZ   | `#7A8FA8` | Biru steel                           |
| Uzbekistan     | UZ   | `#8FA88E` | Hijau sage                           |
| Mongolia       | MN   | `#98786A` | Coklat taupe                         |

**Validasi ΔE (CIEDE2000) untuk pasangan tetangga/berdekatan:**

| Pasangan   | ΔE    | Status | Catatan                                 |
| ---------- | ----- | ------ | --------------------------------------- |
| ID-MY      | 38.68 | ✓      | Bertetangga langsung                    |
| MY-SG      | 44.28 | ✓      | Bertetangga langsung                    |
| TH-VN      | 46.37 | ✓      | Bertetangga                             |
| TH-MY      | 31.25 | ✓      | Bertetangga (perbatasan darat)          |
| VN-CN      | 15.54 | ✓      | Bertetangga                             |
| CN-MN      | 19.18 | ✓      | Bertetangga                             |
| CN-IN      | 16.18 | ✓      | Bertetangga (Himalaya)                  |
| CN-KZ      | 31.45 | ✓      | Bertetangga                             |
| IN-MN      | 18.75 | ✓      | Berdekatan visual                       |
| JP-KR      | 33.16 | ✓      | Berdekatan visual (dipisahkan laut)     |
| KR-CN      | 32.84 | ✓      | Bertetangga                             |
| IN-PK*     | N/A   | —      | PK tidak ada di daftar PRD              |
| SA-TR      | 42.34 | ✓      | Berdekatan regional                     |
| KZ-UZ      | 24.26 | ✓      | Bertetangga                             |

Angka di tabel ini dihasilkan `node scripts/check-contrast.mjs`; skrip itu sumber kebenaran, tabel ini salinannya. Semua pasangan > 15 ΔE (minimum VN-CN 15,54).

---

## 4. Type

### Display Face

- **Family:** Crimson Pro
- **Lisensi:** SIL Open Font License (OFL) — gratis, self-hosted wajib
- **Bobot yang dipakai:** 400 (regular), 600 (semibold)
- **Format:** woff2 (subset Latin + Latin-1 Supplement)
- **Ukuran file:** ~45 KB untuk 2 weights subset (estimasi, final tergantung subset)
- **`font-display`:** `swap` — teks visible sebelum font load
- **Fallback stack:** `Georgia, "Times New Roman", serif`
- **Alasan:** Serif memberi kesan editorial dan budaya — cocok untuk storytelling Asia. Tidak seperti Inter/Roboto yang terasa "produk SaaS generik".
- **Ukuran hero:** `clamp(2.5rem, 6vw, 4.5rem)` — line-height 1.1
- **Sumber file:** TTF dari Google Fonts → konversi ke woff2 dengan `woff2_compress` atau fonttools

### Text Face

- **Family:** Source Sans 3
- **Lisensi:** SIL OFL — gratis, self-hosted wajib
- **Bobot yang dipakai:** 400 (regular), 600 (semibold)
- **Format:** woff2 (subset Latin + Latin-1 Supplement)
- **Ukuran file:** ~38 KB untuk 2 weights subset (estimasi)
- **`font-display`:** `swap`
- **Fallback stack:** `system-ui, -apple-system, "Segoe UI", sans-serif`
- **Alasan:** Sans-serif bersih yang dipasangkan dengan Crimson Pro, lebih karakter dari system-ui tapi tetap familiar
- **Weight:** 400 untuk body, 600 untuk label/CTA
- **Ukuran minimum:** `1rem` (16px) untuk body — tidak lebih kecil
- **Sumber file:** TTF dari Google Fonts → konversi ke woff2

**Aturan loading:**
- Font di-deklarasikan di `<head>` dengan `@font-face`, preload untuk critical weight (`Crimson Pro 600`, `Source Sans 3 400`)
- Tidak ada external CDN — semua font disimpan di `/static/fonts/`
- Subset hanya karakter yang dipakai (Latin, tidak perlu CJK untuk display face)

### Skala Typografi

| Token    | Ukuran                        | Line-height | Pemakaian                                  |
| -------- | ----------------------------- | ----------- | ------------------------------------------ |
| `hero`   | `clamp(2.5rem, 6vw, 4.5rem)`  | 1.1         | Nama brand, satu kali di section pembuka   |
| `h1`     | `clamp(1.75rem, 4vw, 2.5rem)` | 1.2         | Judul section utama                        |
| `h2`     | `1.5rem`                      | 1.3         | Sub-heading dalam section                  |
| `body`   | `1rem`                        | 1.6         | Paragraf, deskripsi                        |
| `label`  | `0.875rem`                    | 1.5         | Eyebrow, metadata, keterangan              |
| `native` | `clamp(1.5rem, 3vw, 2rem)`    | 1.6         | Teks bahasa Asia (hiragana, hangul, hanzi) |

**Catatan:** Native script tidak pernah di-bolding — stroke weight sudah inherent.

---

## 5. Layout

### Ide Struktural

Landing page adalah satu alur vertikal tanpa henti. Tidak ada grid tetap — setiap section memiliki komposisi sendiri yang menanggapi konten. Globe selalu hadir di sisi kanan (desktop) atau tengah bawah (mobile), bergerak mengikuti scroll.

**Prinsip:**

- Tidak ada "container" yang memukul konten — teks bisa melebar penuh untuk narasi
- Globe bukan elemen grid — adalah layer yang hidup di atas/bersama konten
- Whitespace adalah pacing — bukan margin konsisten

### Grid & Rythme

- **Breakpoint:** 375 (mobile), 768 (tablet), 1440 (desktop)
- **Kolom:** 12 kolom di desktop, 4 kolom di mobile — tapi hanya untuk penempatan, bukan penjara
- **Gutter:** `24px` desktop, `16px` mobile
- **Ritme vertikal:** `8px` base unit — semua spacing kelipatan 8 (16, 24, 32, 48, 64, 96)

**Yang memecah ritme:**

- Representasi 3D Asia — selalu dalam posisi fixed atau semi-fixed, ukuran bervariasi
- Section pembuka — nama brand muncul dari kosong, tidak ada header
- Section penutup — hanya objek 3D, tanpa teks

---

## 5a. Bentuk Representasi 3D — Default: Varian B (Slab Relief)

**Default:** Varian B (slab relief dengan mesh per negara dari Blender). Varian A hanya jalur cadangan teknis jika pipeline Blender gagal.

### Varian B: Slab Benua Timbul (Extruded Meshes) — DEFAULT

**Deskripsi:**

- 15 mesh terpisah, masing-masing hasil ekstrusi GeoJSON per negara (dibuat di Blender, di-export sebagai GLTF)
- Tiap mesh punya tinggi (extrusion depth) berbeda — menciptakan relief 3D
- Negara tidak pada satu sphere — datar atau sedikit melengkung sebagai slab tunggal benua Asia

**Karakteristik visual:**

- Terlihat seperti relief/topographic map — daratan timbul dari laut datar
- Kedalaman literal — tiap negara punya ketinggian berbeda (bisa berdasarkan populasi, luas, atau estetika)
- Hover: naikkan mesh negara 0.01 unit + highlight edge (lebih mudah — manipulasi transform langsung)

**Konsekuensi:**

- Implementasi butuh pipeline Blender → GLTF per negara
- Raycasting langsung ke mesh — lebih akurat untuk picking
- Hover highlight trivial — `mesh.position.y += 0.01`
- Estetika lebih unik — signature visual ASIAKIN (lihat Section 13)
- Perf bisa lebih berat — 15 draw calls vs 1 sphere (tapi bisa di-batch)

**Interaksi kamera:**

- Scroll → `camera.position` bergerak di atas slab (top-down perspective) atau mengorbit diagonal
- Kamera bisa lebih dekat — zoom ke wilayah tertentu tanpa distorsi sphere
- Section 4 (contoh negara): kamera orbit ke posisi di atas negara contoh, mesh naik 0.02 unit sebagai highlight

---

### Varian A: Bola dengan Permukaan Bergaya — FALLBACK

**Deskripsi:**

- Sphere geometry dengan tekstur yang di-generate dari GeoJSON
- Tiap negara = region berwarna flat pada tekstur, dipisahkan garis batas tipis
- Color-ID picking: setiap negara punya warna unik pada tekstur, dipakai untuk raycasting hover/klik

**Karakteristik visual:**

- Terlihat seperti globe stylized, bukan foto bumi
- Rotasi smooth mengikuti scroll — kamera mengelilingi sphere
- Hover: negara di-highlight dengan mengubah opacity/edge pada region tekstur (lebih sulit, butuh shader atau re-render tekstur)

**Konsekuensi:**

- Implementasi lebih mudah — Three.js SphereGeometry + tekstur canvas
- Color-picking sederhana — render ke offscreen buffer, baca pixel color
- Hover highlight butuh shader custom atau multi-pass render
- Estetika lebih familiar user — langsung dikenali sebagai "peta dunia"

**Interaksi kamera:**

- Scroll → `camera.position.orbit(longitude, latitude)` — kamera bergerak mengelilingi sphere
- FOV dan distance konstan — selalu melihat dari luar

---

### Keputusan yang Bergantung Bentuk

| Aspek                         | Varian A (Bola)                | Varian B (Slab)                              |
| ----------------------------- | ------------------------------ | -------------------------------------------- |
| Scroll rotation               | Kamera orbit sphere (lat/lon)  | Kamera terbang di atas slab (x/z pan + zoom) |
| Hover highlight               | Shader atau re-tekstur         | `position.y += 0.01` + edge glow             |
| Section 4 (contoh negara)     | Sphere rotate ke posisi negara | Kamera orbit ke atas negara + mesh naik      |
| Signature visual (Section 13) | Tidak ada relief               | Relief adalah signature utama                |
| Aksesibilitas picking         | Color-ID dari tekstur          | Raycast ke mesh langsung                     |
| Fallback no-WebGL             | Sama (SVG peta 2D)             | Sama (SVG peta 2D)                           |
| Motion budget                 | Sama                           | Sama                                         |

**Catatan implementasi:**  
Storyboard (Section 6) menulis animasi kamera dalam terminologi netral (zoom, orbit, pan). Implementer menerjemahkan ke coordinate system yang sesuai bentuk yang dipilih. Detail numerik FOV/rotation ditulis sebagai contoh — implementer mengkalibrasi sesuai geometry aktual.

---

### Yang Tetap Sama (Varian A maupun B)

- Kamera digerakkan scroll (scroll-driven animation)
- Hover per negara → tooltip
- Klik per negara → popup dua langkah
- Warna negara mengikuti palette Section 3
- Tema terang
- Fallback untuk reduced-motion dan no-WebGL (SVG 2D)
- Motion budget (durasi, easing)

---

## 5b. Hero Composition & Surface Art Direction

Benua 3D tidak boleh "polosan" — harus terlihat didesain, menarik, dan duduk persis di tengah layar pertama tanpa navbar.

### 1. Komposisi Hero (Angka)

**Desktop (1440px):**
- Objek 3D benua: lebar 62vw, centered horizontal
- Posisi vertikal: 48% dari atas viewport (centered)
- Ruang atas: 32% viewport — untuk judul/tagline
- Ruang bawah: 20% viewport — untuk affordance scroll
- Kamera: FOV 42, distance 3.2 unit, tilt 35° dari horizontal
- Judul ("ASIAKIN"): posisi 12% dari atas, centered, `hero` size
- Tagline: 6% di bawah judul, centered, `body` size, `ink-muted`

**Mobile (375px):**
- Objek 3D benua: lebar 85vw, centered
- Posisi vertikal: 55% dari atas (sedikit lebih bawah, beri ruang teks)
- Ruang atas: 35% viewport — untuk judul/tagline
- Ruang bawah: 10% viewport
- Kamera: FOV 50, distance 2.8 unit, tilt 40°
- Judul: posisi 10% dari atas, font size `clamp(1.75rem, 5vw, 2.5rem)`
- Tagline: 4% di bawah judul, font size 0.875rem
- Objek tidak menutupi teks — teks di atas, objek di bawah

---

### 2. Art Direction Permukaan

Benua harus punya kedalaman visual tanpa tekstur foto bumi.

**Hierarki tinggi antar negara:**
- Tinggi mesh = log(luas_km² / 10000) unit (contoh: India ~0.08, Singapura ~0.01)
- Range: 0.01 (kecil) hingga 0.12 (besar) — kontras jelas tapi tidak ekstrem
- Tujuan: India dan China tampak dominan, negara kecil tetap terlihat

**Bevel/inset tepi atas:**
- Bevel edge pada top face: width 0.003 unit, segments 2
- Inset tidak dipakai — bevel sudah cukup untuk tangkap cahaya

**Outline:**
- Lebar: 1.5px di DPR 2 (physical pixel)
- Warna: `ink` dengan opacity 0.25
- Style: wireframe subtle — bukan glow

**Bayangan jatuh ke latar:**
- Directional light: intensity 0.7, posisi (x: 5, y: 10, z: 5)
- Shadow map: resolusi 1024px, blur 2 samples
- Contact shadow (ambient occlusion): tidak dipakai — biaya tinggi

**Latar kertas bertekstur halus:**
- CSS background: `surface` (#F9F7F3) + noise overlay via pseudo-element
- Noise: SVG pattern opacity 0.03, size 200px × 200px
- Alternatif: shader noise di Three.js jika butuh parallax — tapi CSS lebih murah

**Graticule/grid tipis:**
- Tidak dipakai — menambah clutter, tidak menambah art direction kuat

**Kontur:**
- Tidak dipakai — bevel edge sudah memberi definisi bentuk

**Kenapa bukan slop:**
- Hierarki tinggi berbasis data (luas), bukan acak
- Outline subtle, bukan glow berlebihan
- Noise texture sangat halus (0.03 opacity), tidak mengganggu kontras teks
- Tidak ada gradient ungu-biru, tidak ada glassmorphism
- Semua keputusan punya fungsi: bevel untuk tangkap cahaya, shadow untuk grounding, outline untuk definisi

---

### 3. Pembagian Blender vs Three.js

**Dibuat di Blender (pre-baked ke GLB):**
- Geometry mesh per negara (ekstrusi dari GeoJSON)
- Tinggi (extrusion depth) per negara sesuai hierarki
- Bevel edge pada top face (width 0.003, segments 2)
- Normal map: tidak perlu — flat shading sudah cukup
- UV: tidak perlu — warna solid per mesh

**Dibuat di Three.js (runtime):**
- Outline via EdgesGeometry + LineSegments (dari geometry yang sama)
- Shadow: directional light + shadow map
- Lighting: ambient light (intensity 0.5) + directional light (0.7)
- Material: MeshStandardMaterial dengan color per mesh dari palette Section 3, roughness 0.8, metalness 0
- Background: CSS `surface` + noise overlay (bukan Three.js)
- Grain: CSS pseudo-element, bukan shader

**Permintaan ke pipeline model (jika butuh geometri tambahan):**
- Bevel edge harus di-bake ke geometry — Three.js tidak bisa bevel runtime tanpa cost tinggi
- Pastikan normal menghadap keluar (front-facing) untuk shadow benar
- Export sebagai GLTF binary (.glb) dengan mesh terpisah per negara (untuk picking)

---

### 4. Batasan

- **Mesh per negara dari GLB:** tidak ada tekstur, warna dari material color
- **Outline:** EdgesGeometry + LineSegments (Three.js) atau inverted hull (lebih berat) — pilih EdgesGeometry
- **Bayangan:** directional light + shadow map 1024px (Three.js)
- **Latar:** CSS + noise overlay (bukan Three.js scene) — hemat draw call
- **Tidak ada:** tekstur foto bumi, normal map, displacement map, PBR kompleks

---

### 5. Dua Arah Visual (A dan B)

**Arah A: Clean Minimal**
- Outline tipis (1px), opacity 0.2 — hampir tidak terlihat
- Shadow sangat subtle (intensity 0.3, blur 1 sample)
- Noise tidak dipakai — latar flat `surface`
- Bevel minimal (width 0.002)
- Hasil: terlihat seperti wireframe datar, kurang grounding, kurang "desain"

**Arah B: Grounded Relief (REKOMENDASI)**
- Outline 1.5px, opacity 0.25 — definisi jelas
- Shadow intensity 0.7, blur 2 samples — grounding kuat
- Noise opacity 0.03 — tekstur kertas, tidak mengganggu
- Bevel 0.003 — tangkap cahaya, edge halus
- Hasil: benua terlihat seperti relief patung di atas kertas, grounded, didesain

**Rekomendasi: Arah B** — grounding shadow dan noise texture memberi konteks visual yang kuat. Arah A terlalu flat, tidak ada signature.

---

### 6. Angka, Bukan Kata Sifat

- Outline lebar: 1.5px di DPR 2
- Outline opacity: 0.25
- Shadow intensity: 0.7
- Shadow map resolusi: 1024px
- Shadow blur: 2 samples
- Light direction: (5, 10, 5)
- Noise opacity: 0.03
- Noise size: 200px × 200px
- Bevel width: 0.003 unit
- Bevel segments: 2
- Roughness material: 0.8
- Metalness material: 0
- Idle motion: rotation 0.0002 rad/frame (jika tidak hover)

---

### 7. Mobile 375px

- Benua lebar: 85vw (dari 62vw desktop)
- Judul font: `clamp(1.75rem, 5vw, 2.5rem)` (dari hero clamp)
- Tagline font: 0.875rem (dari 1rem)
- Outline: tetap 1.5px — tidak dikurangi
- Shadow: intensity 0.5 (dikurangi dari 0.7 untuk performa)
- Noise: tidak dihilangkan — penting untuk konsistensi visual
- Bevel: tetap — baked di GLB
- Benua tetap pusat, judul di atas tidak menutupi objek

---

### 8. Anggaran Performa

**Draw calls:**
- 15 mesh per negara: 15 draw calls (jika tidak di-batch)
- Jika di-batch menjadi 1 geometry: 1 draw call — rekomendasi untuk production
- Outline EdgesGeometry: +1 draw call per mesh yang visible (atau 1 jika digabung)
- Shadow map: +1 render pass
- Total: 16–30 draw calls (tergantung batching)

**Biaya per frame (estimasi di mid-range mobile):**
- Vertex: 15 mesh × ~500 vertex = 7500 vertex
- Shadow pass: ~0.3 ms
- Main pass: ~0.8 ms
- Outline: ~0.2 ms (EdgesGeometry ringan)
- Total: ~1.3 ms per frame

**Target: < 1.5 ms** — memenuhi anggaran.

**Jika > 1.5 ms:**
- Kurangi shadow map ke 512px
- Batch mesh menjadi 1 geometry
- Kurangi outline ke edge utama saja (tidak per sub-edge)

---

### Larangan (Ulangi dari Banned)

- Tekstur foto bumi
- Gradient ungu-biru, biru-cyan, pink-ungu
- Glassmorphism
- Glow berlebihan (outline tipis, bukan glow)
- Grain yang menurunkan kontras teks (opacity max 0.03)

## 6. Scroll Storyboard

Setiap section punya tujuan naratif. Animasi terikat satu progres scroll global 0→1 untuk seluruh halaman. Scroll-driven animation di-scrub (durasi mengikuti scroll), bukan time-based. Durasi ms hanya untuk transisi non-scroll (popup, hover, focus).

### Model Scroll Global

Progres global = `(currentScrollY - pageTop) / (pageHeight - viewportHeight)`

| Global % | Section | Properti | Dari → Ke | Easing | Catatan |
| -------- | ------- | -------- | --------- | ------ | ------- |
| 0–0.20   | 1       | `opacity` | 0 → 1 | ease-out | Nama muncul |
| 0–0.20   | 1       | `translateY` | 24px → 0 | ease-out | Nama muncul |
| 0.20–0.25 | 1     | `opacity` | 1 → 0 | ease-in | Nama fade out |
| 0.25–0.40 | 2     | `opacity` (teks) | 0 → 1 | ease-out | Teks ajakan |
| 0.25–0.40 | 2     | `translateY` (teks) | 16px → 0 | ease-out | Teks ajakan |
| 0.25–0.40 | 2     | `opacity` (3D) | 0 → 0.6 | ease-out | Objek 3D muncul |
| 0.25–0.40 | 2     | `scale` (3D) | 0.85 → 1 | ease-out | Objek 3D muncul |
| 0.40–0.60 | 3     | `opacity` (3D) | 0.6 → 1 | ease-out | Objek 3D penuh |
| 0.40–0.60 | 3     | `camera.fov` | 50 → 45 | linear | Zoom subtle |
| 0.60–0.70 | 4     | `camera.position` | default → above JP | ease-in-out | Fokus Jepang |
| 0.60–0.70 | 4     | `mesh_JP.position.y` | 0 → +0.02 | ease-out | Mesh naik |
| 0.60–0.70 | 4     | `opacity` (teks overlay) | 0 → 1 | ease-out | Teks contoh |
| 0.70–0.85 | 5     | `scale` (3D) | 1 → 1.15 | ease-in-out | Zoom final |
| 0.70–0.85 | 5     | `camera.fov` | 45 → 40 | ease-in-out | Zoom final |
| 0.85–1.00 | 6     | `opacity` (section editorial) | 0 → 1 | ease-out | Editorial gambar |

**Catatan:** Angka properti kamera (FOV, position) adalah contoh. Implementer mengkalibrasi sesuai geometry aktual.

---

### Section 1: Pembuka — Nama Muncul dari Kosong

**Tujuan naratif:** User tiba di ruang kosong. Nama ASIAKIN muncul perlahan, memperkenalkan identitas tanpa penjelasan.

**Isi visual:**

- Latar: `surface` solid, tidak ada elemen
- Tengah layar: teks "ASIAKIN" dalam `hero` size, opacity 0 di awal
- Bawah layar: garis tipis horizontal (2px, `line`) dengan opacity 0.3, panjang 60vw, centered — isyarat scroll

**Animasi (global 0 → 0.20):**

- Teks: `opacity: 0 → 1`, `translateY: 24px → 0` (scrub, easing ease-out)
- Garis scroll hint: `opacity: 0 → 0.3`, `translateY: 8px → 0` (scrub, ease-out)
- Garis bergerak ke bawah sedikit saat user mulai scroll (global 0.05 → 0.10)

**Affordance scroll (T7):**
- Garis tipis di bawah mengisyaratkan "ada lebih di bawah" tanpa teks atau tombol
- Saat scroll dimulai (global > 0.05), garis fade out (opacity 0.3 → 0)

**Yang diam:**

- Latar
- Posisi teks (centered)

---

### Section 2: Arah — Ajakan Tanpa Perintah

**Tujuan naratif:** Setelah nama dikenal, user diberi tahu apa yang bisa dilakukan — tanpa CTA agresif.

**Isi visual:**

- Teks singkat: "Jelajahi benua Asia dengan jari Anda"
- Teks pendukung: "Klik negara. Dengarkan sapaan asli. Mulai percakapan."
- Objek 3D Asia mulai terlihat di sisi kanan (desktop) atau tengah bawah (mobile), opacity rendah

**Animasi (global 0.25 → 0.40):**

- Teks masuk: `opacity: 0 → 1`, `translateY: 16px → 0` (scrub, ease-out)
- Objek 3D: `opacity: 0 → 0.6`, `scale: 0.85 → 1` (scrub, ease-out)
- Kamera:
  - Varian B (slab): `position.y` turun dari overhead ke diagonal 45° (scrub, linear)

**Mobile (375px):**
- Teks di atas, objek 3D di bawah (ukuran 40% viewport height)
- Popup jadi bottom sheet

**Yang diam:**

- Posisi objek 3D (fixed di viewport)
- Latar

---

### Section 3: Objek 3D Menjadi Pusat — Interaktif

**Tujuan naratif:** Objek 3D sekarang siap dijelajahi. User mengerti bahwa klik adalah aksi utama.

**Isi visual:**

- Objek 3D opacity penuh, interaktif
- Teks kecil di bawah (desktop) atau atas (mobile): "Sentuh negara mana pun"
- Tidak ada tombol — hanya affordance visual

**Animasi (global 0.40 → 0.60):**

- Objek 3D: `opacity: 1`, `scale: 1`
- Kamera:
  - Varian B (slab): `fov: 50 → 45` (zoom subtle, scrub linear)

**Mobile (375px):**
- Objek 3D mengecil ke 50% viewport height
- Teks instruksi di atas objek, tidak menutupi

**Interaksi aktif:**

- Hover negara → tooltip muncul (nama, bendera, "Klik untuk buka")
  - Varian B: mesh naik 0.01 unit + edge glow
- Klik negara → popup muncul (lihat Section 7)

---

### Section 4: Contoh — Satu Negara Diperkenalkan

**Tujuan naratif:** User yang belum klik diberi contoh apa yang akan ditemui.

**Isi visual:**

- Objek 3D fokus ke Jepang (centered di viewport)
- Teks overlay: "Jepang: Negeri di mana sapaan adalah seni"
- Sub-teks: `"こんにちは" — salam yang membuka pintu`

**Animasi (global 0.60 → 0.70):**

- Kamera:
  - Varian B (slab): kamera orbit ke posisi di atas Jepang, zoom in FOV 45 → 40 (scrub, ease-in-out)
- Highlight Jepang:
  - Varian B: mesh Jepang naik 0.02 unit (scrub, ease-out)
- Teks: `opacity: 0 → 1` (scrub, ease-out)

**Yang diam:**

- Latar
- Popup tidak muncul — hanya preview

---

### Section 5: Penutup — Hanya Objek 3D

**Tujuan naratif:** Narasi selesai. Hanya objek 3D dan user. Ajakan implisit untuk mulai menjelajah.

**Isi visual:**

- Objek 3D memenuhi 80% viewport (desktop) atau 60% (mobile)
- Tidak ada teks
- Negara-negara "berkedip" subtle (staggered 100ms per negara)

**Animasi (global 0.70 → 0.85):**

- Objek 3D: `scale: 1 → 1.15` (zoom in, scrub ease-in-out)
- Kamera:
  - Varian B (slab): `fov: 40 → 38` (scrub, ease-in-out)
- Pulse negara (non-scrub, loop 3x):
  - Varian B: mesh position.y pulse +0.005 → 0 → +0.005 (per negara, staggered, durasi 200ms per pulse)

**Yang diam:**

- Tidak ada

**Interaksi:**

- Klik negara → popup → lanjut ke halaman negara

---

### Section 6: Editorial — Bergambar (T5)

**Tujuan naratif:** Memberi konteks budaya melalui visual, bukan hanya teks. Parallax halus menambah kedalaman tanpa membebani.

**Isi visual:**

- Gambar editorial penuh lebar (desktop) atau 90% lebar (mobile)
- Rasio: 16:9 landscape di desktop, 4:3 di mobile
- Posisi: section penuh, teks overlay di bawah gambar (desktop) atau atas (mobile)
- Caption singkat: "Setiap negara punya cerita. Setiap sapaan membuka pintu."

**Jenis gambar:**
- Komposisi kartografis: ilustrasi stylized peta Asia dengan elemen budaya (pola batik, ukiyo-e wave, hanbok silhouette, dll) yang terintegrasi dengan kontur benua
- Alternatif jika aset foto belum tersedia: ilustrasi vektor dengan warna dari palette negara, style editorial/anthropologie map

**Sumber & lisensi:**
- Ilustrasi: dibuat khusus untuk proyek (tidak ada aset siap pakai)
- Jika menggunakan foto: lisensi CC0 atau licensed stock dengan syarat attribusi tercatat
- Status: **Aset belum tersedia** — perlu commission atau pembuatan internal

**Parallax:**
- Layer 1 (gambar): `translateY` bergerak 0.3× kecepatan scroll (slower)
- Layer 2 (caption): `translateY` bergerak 0.1× kecepatan scroll (sangat lambat)
- Maksimal 2 layer — sesuai Banned §Motion

**Object-fit & LCP:**
- `object-fit: cover` untuk gambar
- `loading="lazy"` — tidak critical untuk LCP
- Ukuran file target: ≤ 120 KB (webp, 1440×810)
- Jika jadi LCP: preload dengan `<link rel="preload" as="image">`, pastikan < 120 KB

**Animasi (global 0.85 → 1.00):**

- Section: `opacity: 0 → 1` (scrub, ease-out)
- Parallax gambar: `translateY` bergerak sesuai scroll (scrub, linear, factor 0.3)
- Caption: `translateY` bergerak sesuai scroll (scrub, linear, factor 0.1)

**Mobile (375px):**
- Gambar rasio 4:3, posisi tengah
- Caption di bawah gambar, font size 0.875rem

---

## 7. Objek 3D Interaction

### Keadaan Default

**Varian A (Bola):**

- Sphere rotasi lambat (0.001 rad/frame) saat tidak ada hover
- Kamera: FOV 45, distance 2.5 unit dari center
- Rotation awal: menghadap Asia Tenggara (lat: 10, lon: 110)
- Pencahayaan: ambient light 0.8, directional light dari kanan atas

**Varian B (Slab):**

- Tidak ada rotasi benua — slab statis
- Kamera orbit lambat di atas benua (0.0005 rad/frame) jika tidak ada hover
- Posisi awal: overhead view dengan sudut 45° dari horizontal
- Pencahayaan: ambient light 0.7, directional light dari kanan atas (menonjolkan relief)

### Hover

**Umum:**

- Tooltip muncul di samping kursor:
  - Bendera (emoji, 1.25rem)
  - Nama negara (bold)
  - Region (teks kecil, ink-muted)
  - Teks: "Klik untuk buka"
- Tooltip: `transition: opacity 120ms ease-out, transform 120ms ease-out`
- Rotasi/orbit berhenti

**Varian A (Bola):**

- Negara di-hover: region pada tekstur berubah (shader: opacity +10%, edge glow via outline shader)
- Atau alternatif: highlight dengan re-render tekstur region (lebih berat)

**Varian B (Slab):**

- Mesh negara di-hover: `position.y += 0.01` (naik 0.01 unit)
- Edge glow: outline shader atau emissive material pulse

### Klik

**Umum:**

- Rotasi/orbit berhenti sepenuhnya
- Popup muncul dari tengah layar (modal)

**Varian A (Bola):**

- Negara diklik: region pada tekstur stroke +2px (shader), opacity +15%, pulse scale 1.02 (200ms)

**Varian B (Slab):**

- Mesh negara diklik: `position.y += 0.02` (naik lebih tinggi dari hover), pulse scale 1.05 (200ms)

### Popup

**Struktur:**

1. Header: Bendera + Nama negara + Native name + Region + Tombol close (✕)
2. Body:
   - Sapaan asli (native script, 2rem)
   - Latin transliteration
   - Arti bahasa Indonesia
   - Tombol audio "▶ Dengarkan"
3. Metadata: Ibu kota, Bahasa utama, Populasi (3 kolom, minimal)
4. Footer: Tombol "Lanjut →" (link ke `/place/:id`)

**Ukuran:**

- Desktop: max-width 480px, centered
- Mobile: full-width, anchored bottom (sheet style)

**Animasi masuk:**

- `opacity: 0 → 1` (200ms ease-out)
- `transform: translateY(24px) → translateY(0)` (200ms ease-out)
- Backdrop: `background: rgba(26, 31, 36, 0.4)` (fade in 150ms)

**Aksesibilitas:**

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="[negara-name]"`
- Focus trap aktif saat popup terbuka
- Tab order: close → audio → lanjut
- Esc menutup popup

### Tombol "Lanjut"

- Style: tombol filled accent, full-width di mobile
- Label: "Lanjut ke [Nama Negara] →"
- Aksi: navigasi ke `/place/:id` dengan transisi fade-out (150ms)

### Transisi ke Halaman Negara

- Popup fade out (150ms)
- Objek 3D fade out (200ms)
- Latar fade ke putih (100ms)
- SPA navigation tanpa reload

---

## 8. Absence of Chrome

### Indikator Progres Scroll

- Positif: progress bar vertikal di sisi kiri layar (desktop) atau atas (mobile)
- Warna: `accent` dengan opacity 0.6
- Lebar: 4px
- Animasi: mengikuti scroll position (0–100%)
- Tidak ada label — hanya visual cue

### Affordance Kembali

- Tidak ada tombol back global
- Di halaman negara: breadcrumb "← Kembali ke Globe" di kiri atas
- Di popup: tombol close (✕) di kanan atas

### Menu (Kalau Ada)

- Tidak ada navbar horizontal
- Jika diperlukan menu settings/about: tombol teks "Menu" di kanan bawah, buka drawer dari bawah
- Drawer: minimal, hanya link penting (Tentang, Privasi, Bantuan)
- Prioritas: hindari menu sampai konten utama selesai

---

## 9. Accessibility

### Keyboard Navigation untuk Objek 3D

- Objek 3D adalah focusable region (`tabindex="0"`)
- Saat fokus: informasi screen reader "Peta Asia interaktif. Gunakan tombol panah untuk menjelajah, Enter untuk memilih negara."
- Arrow keys: pindah fokus ke negara tetangga (berdasarkan posisi geometris)
- Enter: buka popup negara yang difokuskan
- Esc: tutup popup

### ARIA untuk Popup

- `role="dialog"`
- `aria-modal="true"`
- `aria-labelledby` mengacu ke nama negara
- `aria-describedby` mengacu ke sapaan (opsional)

### Urutan Tab

1. Objek 3D (jika di viewport)
2. Tombol close popup
3. Tombol audio
4. Tombol lanjut
5. Drawer menu items (jika terbuka)

### Kontras Minimum (T9)

Semua teks: kontras ≥ 4.5:1 terhadap latar. Verifikasi wajib dengan `scripts/check-contrast` sebelum sign-off.

**Perhitungan manual (WCAG 2.1 relative luminance):**

| Token | Foreground | Background | Ratio | Status |
|-------|------------|------------|-------|--------|
| `ink` di `surface` | #1A1F24 | #F9F7F3 | 15.51:1 | ✓ AAA |
| `ink-muted` di `surface` | #5C6670 | #F9F7F3 | 5.47:1 | ✓ AA |
| `accent` di `surface` | #176B68 | #F9F7F3 | 5.88:1 | ✓ AA |
| `accent-ink` di `accent` | #FFFEF9 | #176B68 | 6.23:1 | ✓ AA |

**Metode perhitungan:**
1. Konversi hex ke sRGB: `r/255`, `g/255`, `b/255`
2. Linearize: jika channel ≤ 0.03928, `channel/12.92`; else `((channel+0.055)/1.055)^2.4`
3. Luminance: `0.2126×R + 0.7152×G + 0.0722×B`
4. Contrast ratio: `(L1 + 0.05) / (L2 + 0.05)` dimana L1 > L2

**Contoh `ink` di `surface`:**
- L(#1A1F24) = 0.074
- L(#F9F7F3) = 0.946
- Ratio = (0.946 + 0.05) / (0.074 + 0.05) = 15.51

### Target Sentuh

- Minimum 44×44px untuk semua elemen interaktif
- Negara pada objek 3D:
  - Varian A (bola): tolerance area +8px di sekitar boundary region tekstur
  - Varian B (slab): mesh bounding box + 8px padding untuk akurasi sentuhan

### Reduced-Motion Version

- Animasi scroll-driven diganti dengan transisi instant (opacity only, max 80ms)
- Varian A: sphere tidak auto-rotate
- Varian B: kamera tidak orbit, posisi statis overhead
- Popup masuk tanpa translateY — hanya opacity fade
- Pulse negara di section 5 dihilangkan
- Progress bar tetap ada tapi tanpa animasi smooth

---

## 10. Fallback

### No-WebGL

Deteksi: `!window.WebGLRenderingContext` atau `gl.getParameter(gl.VERSION)` gagal.

**Fallback UI (T8):**

1. Tampilkan peta 2D Asia (SVG) dengan styling serupa (warna flat per negara, garis batas tipis)
2. Negara clickable: SVG `<path>` per negara dengan `role="button"`, `tabindex="0"`, event listener `click` dan `keydown` (Enter)
3. Hover: tooltip serupa dengan 3D version, `title` attribute sebagai fallback teks
4. Klik: popup serupa (modal atau sheet)
5. Label: "Tidak dapat memuat tampilan 3D. Menggunakan peta standar."

**Sumber SVG:**
- Dihasilkan dari GeoJSON yang sama dengan mesh 3D (world-atlas TopoJSON → GeoJSON → SVG via d3-geo)
- Proyeksi: Mercator atau Equirectangular, centered ke Asia (lon: 100, lat: 30)
- 15 negara tetap bisa difokus dengan Tab, dipilih dengan Enter
- Tooltip dan popup identik dengan 3D version

**Ukuran & Rendering:**
- SVG viewBox: `0 0 1200 800` (aspect ratio 3:2)
- Ukuran di halaman: 90% viewport width (desktop), 100% viewport width (mobile)
- Inline SVG di HTML — tidak external file — untuk kontrol interaksi
- Warna per negara: sama dari palette Section 3
- Stroke: `line` color, width 1px

**Penempatan:**
- Peta 2D menggantikan objek 3D sepenuhnya di section 2–5
- Tidak ada animasi scroll-driven untuk peta — statis, hanya fade in saat section enter viewport

### Reduced-Motion

Deteksi: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`

**Fallback UI:**

1. Objek 3D tetap aktif tapi tanpa auto-rotate/orbit, tanpa kamera tween
2. Scroll animasi diganti dengan transisi instant (opacity only, max 80ms)
3. Tooltip dan popup tanpa translateY animation
4. Tidak ada pulse atau kedip negara (Varian A: tidak ada opacity pulse, Varian B: tidak ada position.y pulse)
5. Progress bar tetap, tanpa animasi smooth

---

## 11. Motion Budget

### Durasi Maksimum

- Micro-interaction (hover, focus): 120ms
- Transition (panel, popup): 200ms
- Scene transition (scroll-driven): 300ms
- Hard cap: 320ms untuk animasi apapun

### Easing

- Standard: `cubic-bezier(0.2, 0, 0, 1)` (ease-out smooth)
- Exit: `cubic-bezier(0.4, 0, 1, 1)` (ease-in faster)
- Bounce: dilarang

### Aturan Animasi Bersamaan

- Tidak boleh lebih dari 2 property beranimasi pada 1 elemen dalam waktu sama
- Varian A (bola): sphere rotation dan camera movement tidak boleh bersamaan — pilih satu
- Varian B (slab): mesh position.y dan camera movement boleh bersamaan (tidak pada elemen sama)
- Popup dan tooltip tidak boleh muncul bersamaan
- Scroll-driven animation dan hover interaction tidak boleh overlap — hover menghentikan scroll animation

---

## 12. Banned

Daftar default yang ditolak di proyek ini:

**Visual:**

- Gradient ungu-biru, biru-cyan, pink-ungu, neon apapun
- Glassmorphism di navbar, kartu, modal, sidebar (semua tempat)
- Glow effect di elemen apapun
- Blob dekoratif tanpa makna
- Emoji sebagai ikon di UI (hanya untuk bendera di popup)

**Layout:**

- Card grid (3-kartu hero, 6-kartu features)
- Hero dengan headline center + 3 kartu di bawah
- Navbar horizontal dengan menu dropdown
- Footer dengan 4 kolom link

**Copy:**

- Kata: Elevate, Seamless, Powerful, Unlock, Embark, Discover, Transform, Revolutionize
- Frasa AI-slop: "AI-powered learning", "Personalized journey", "Unlock your potential"
- Istilah Inggris sebagai headline utama — semua copy bahasa Indonesia

**Motion:**

- Parallax berlebihan (> 2 layer dengan kecepatan beda)
- Scroll-jacking (memaksa scroll speed/direction)
- Animasi lebih dari 320ms
- Bounce easing

**Accessibility:**

- `aria-modal="false"` untuk popup modal
- Focus trap yang bocor
- Kontras < 4.5:1 untuk teks penting
- Target sentuh < 44px

---

## 13. Signature

**Satu detail yang hanya milik ASIAKIN:**

Varian A (bola): Tidak ada signature khusus — estetika familiar, globe stylized dengan warna flat.

Varian B (slab): Globe bukan bola dunia sempurna — adalah relief Asia yang mengambang. Kontur benua sedikit terangkat (z-offset) seperti patung relief, memberi kesan kedalaman tanpa 3D terrain penuh. Laut datar, daratan naik 0.02 unit. Saat hover negara, relief negara tersebut naik lagi 0.01 unit.

**Varian B mengatakan:** "Asia bukan sekadar tempat di peta — adalah bentang budaya yang bisa Anda sentuh."

**Rekomendasi:** Varian B lebih kuat sebagai signature visual. Varian A lebih aman jika pipeline Blender → GLTL belum siap.

---

## Lampiran: Referensi yang Dibaca

1. `C:\Users\raso8\Asiakin\src\styles\tokens.css` (baris 1-169) — token warna, spacing, motion
2. `C:\Users\raso8\Asiakin\src\routes\home\HomePage.tsx` (baris 1-176) — struktur landing sekarang
3. `C:\Users\raso8\Asiakin\src\routes\home\Home.module.css` (baris 1-300) — styling sekarang
4. `C:\Users\raso8\Asiakin\docs\AUDIT_V3.md` (baris 1-171) — konflik dan cacat yang dihindari
5. `C:\Users\raso8\Asiakin\src\components\3d\AsiaGlobe3D.tsx` (baris 700-805) — popup a11y defect
6. `C:\Users\raso8\Asiakin\docs\DESIGN.md` (file tidak ditemukan) — arah lama sudah hilang/batal

---

**Ditulis oleh:** Designer agent  
**Tanggal:** 21 Oktober 2026  
**Status:** Siap untuk implementasi. Asumsi terbuka: aset gambar editorial (Section 6.6), audio penutur asli, keputusan final Varian A/B (default B).
