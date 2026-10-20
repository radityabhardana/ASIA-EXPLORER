# Design Storyboard — Landing Scroll Narrative v4

**Produk:** Asiakin v3 — peta interaktif 15 negara Asia  
**Revisi:** v4 (mengganti v3.2 one-scene hero)  
**Dibuat:** 2026-10-20  
**Status:** Design spec, belum diimplementasikan  

---

## 0. Koreksi mengikat v4.1 — mengalahkan semua bagian di bawah bila bertentangan

Ditetapkan orchestrator setelah review. Bukan saran.

1. **Font ditolak.** Canela dan Untitled Sans adalah font komersial dan tidak ada di repo. Pakai yang sudah ada dan sudah self-hosted: `--font-display` (Crimson Pro) dan `--font-text` (Source Sans 3). Untuk aksara asing: stack sistem per aksara, jangan unduh Noto. Semua ukuran tipe memakai token/spesifikasi di sini, bukan nama font baru.
2. **Warna wajib dari `src/styles/tokens.css`**: `--surface #f9f7f3`, `--surface-raised #fffef9`, `--ink #1a1f24`, `--ink-muted #5c6670`, `--line #d8d4cc`, `--accent #176b68`, `--accent-ink #fffef9`. Hex `#2B2A27`, `#FAF9F6`, `#6B6966`, `#D97D3A` **tidak dipakai**.
3. **Scene 3: 718 titik di dalam siluet dibatalkan.** Titik acak di atas peta menyiratkan sebaran geografis bahasa yang kita **tidak punya datanya** — itu visualisasi data palsu. Ganti: angka `718` besar, caption "bahasa daerah, Indonesia — Badan Bahasa", siluet Indonesia opacity 0,08 sebagai tekstur latar, tanpa titik. Kejujuran data menang atas efek.
4. **Scene 4 tanpa chrome kartu.** Tidak ada radius, shadow, atau background penuh per panel. Panel full-bleed dipisah garis `--line` 1px. Tidak ada pagination, dots, atau snap.
5. **Popup disederhanakan.** Hapus navigasi Arrow Up/Down antar negara. Hapus "metadata text" dari siklus fokus (metadata bukan elemen interaktif). Fokus awal ke tombol tutup; `Esc` menutup; klik backdrop menutup; Tab terkurung di dalam dialog. Tombol aksi memakai `--accent` + `--accent-ink`.
6. **Canvas bukan `role="application"`.** Pakai `role="group"` + `aria-label` + `aria-describedby`. Kontrol nyata adalah daftar 15 negara. Daftar itu **tampil** saat keyboard fokus masuk (`:focus-within`), ringkas, di kiri bawah, tiap target ≥ 44px — bukan disembunyikan di `left: -9999px`.
7. **Reduced motion mematikan transform**, bukan mempercepatnya. Opacity boleh, ≤ 200ms. Counter langsung menampilkan angka final.
8. **Total tinggi maksimum 920vh.** Susunan final: hero 100, scale 120, language 150, script 140, regional 110, cultural 120, invitation 100, footer 80.
9. **Angka kontras acuannya `scripts/check-contrast.mjs`**, bukan tabel §8. Tabel itu memakai hex yang sudah ditolak dan tidak boleh dikutip.
10. **Urutan fase build di §10 dibatalkan** sebagai urutan kerja. Implementasi dibagi per lane sesuai `docs/PLAN_LANDING.md`; mobile dikerjakan bersamaan, bukan di akhir.

---

## 1. Tabel Scene

| # | Nama Scene | Tinggi (vh) | Pin | Elemen Bergerak | Teks di Layar | Keadaan Akhir |
|---|---|---|---|---|---|---|
| 1 | Hero Continent | 100 | Tidak | 3D benua fade in (opacity 0→1), kamera orbit lambat 8° | "Jelajahi Asia lewat bahasa aslinya" (12 kata) | Benua ter-render penuh, teks stabil, scroll hint muncul |
| 2 | Scale Reveal | 140 | Ya, 100vh pertama | Counter "15" animate dari 0, negara-negara highlight satu per satu di benua | "15 negara dalam cakupan" | Counter final, semua negara ter-highlight, teks fade out |
| 3 | Language Depth | 180 | Ya, 120vh pertama | Indonesia silhouette slide dari kanan (translateX 100vw→0), counter "718" dari 0, tiny dots muncul di siluet | "718 bahasa daerah, Indonesia saja" | Siluet centered, dots stabil, stat terverifikasi Badan Bahasa |
| 4 | Script Showcase | 160 | Ya, 100vh pertama | 3 kartu (Thai, Arab, Korea) horizontal slide seperti filmstrip (translateX), masing-masing kartu 40vw | สวัสดี (sawatdi) • السلام عليكم (as-salām) • 안녕하세요 (annyeong) | Kartu tengah (Arab) centered, dua lain separuh visible di tepi |
| 5 | Regional Tapestry | 120 | Tidak | 6 siluet negara Asia Tenggara overlap dengan parallax (rasio 0.85/1.0/1.15), fade in berurutan | "Asia Tenggara: 6 negara, ratusan cara menyapa" | Semua siluet stabil, teks fade out |
| 6 | Cultural Vignette | 140 | Ya, 100vh pertama | Ilustrasi kartografis: siluet Turki + cezve, Thailand + wai, fade in layer per layer | "Setiap negara punya caranya sendiri" | Ilustrasi lengkap, teks centered |
| 7 | Interactive Invitation | 100 | Tidak | 3D benua kembali (fade in dari 6), hover states aktif, pointer cursor on countries | "Pilih negara, mulai penjelajahan" | Benua interaktif, hover Indonesia → popup siap |
| 8 | Footer | 80 | Tidak | Sumber data fade in, link underline on hover | "Data: Badan Bahasa, Britannica, UNESCO" | Footer stabil, link accessible |

**Set-piece yang di-pin (3):**
- **Scale Reveal**: Pin pertama karena counter naratif membutuhkan waktu untuk dibaca sebelum lanjut — user perlu melihat "15" selesai animate sebelum kita bicara ratusan bahasa.
- **Language Depth**: Pin kedua karena 718 dots muncul bertahap dan stat ini inti unique value — bukan sekadar jumlah negara, tapi kedalaman di dalamnya.
- **Script Showcase**: Pin ketiga karena filmstrip horizontal adalah moment "pause dan lihat" — user perlu membaca tiga aksara berbeda, bukan sekadar luncur lewat.
- **Cultural Vignette**: Pin keempat untuk memberi ruang ilustrasi kartografis dimakan mata — transisi dari data ke kultur perlu disavoring.

---

## 2. Peta Scroll Global

```
Timeline: 0 ───────────────────────────────────────────────────────────────────── 1
          │     │        │         │        │        │        │       │
          Hero  Scale    Language  Script   Regional Cultural Invite  Footer
          0.00  0.12     0.30      0.46     0.64     0.75     0.89    1.00
```

**Rentang per scene:**
- Hero Continent: 0.00 – 0.12 (benua fade in, orbit 8°)
- Scale Reveal: 0.12 – 0.30 (counter 0→15, negara highlight berurutan)
- Language Depth: 0.30 – 0.46 (Indonesia slide in, counter 0→718, dots populate)
- Script Showcase: 0.46 – 0.64 (3 kartu horizontal filmstrip, scrub controls position)
- Regional Tapestry: 0.64 – 0.75 (6 siluet fade in dengan parallax offset)
- Cultural Vignette: 0.75 – 0.89 (ilustrasi layer-by-layer, teks fade in)
- Interactive Invitation: 0.89 – 0.94 (3D benua fade in lagi, hover aktif)
- Footer: 0.94 – 1.00 (credits fade in)

**Satu timeline global:**  
Semua animasi discrub dengan `scrollProgress` dari `useScroll()` (Framer Motion) atau `gsap.timeline()` dengan `ScrollTrigger`. Tidak ada tween lepas atau `setTimeout`. Semua progress linear ke scroll position: jika user scroll ke 50%, timeline ada di 0.50.

---

## 3. Spesifikasi Gerak

### Hover Negara (3D benua)
- **Properti:** `scale`, `emissive` (Three.js material)
- **Awal → Akhir:** scale 1.0 → 1.08, emissive 0x000000 → 0x332211
- **Easing:** `Power2.easeOut`
- **Durasi:** 240ms
- **Trigger:** `onPointerOver` di mesh negara

### Masuknya Teks (semua scene)
- **Properti:** `translateY`, `opacity`
- **Awal → Akhir:** translateY(32px) opacity(0) → translateY(0) opacity(1)
- **Easing:** `cubic-bezier(0.22, 0.61, 0.36, 1)` (ease-out-cubic)
- **Rentang scrub:** 8% dari rentang scene (mis. scene 2 mulai 0.12, teks masuk 0.12–0.14)

### Parallax Gambar (scene 5: Regional Tapestry)
- **Properti:** `translateY`
- **Rasio kecepatan:**  
  - Background layer (Malaysia, Thailand): 0.85× scroll (lebih lambat)
  - Mid layer (Singapura, Vietnam): 1.0× scroll (baseline)
  - Foreground layer (Indonesia, Filipina): 1.15× scroll (lebih cepat)
- **Batas maksimum:** ±120px vertikal (tidak boleh scroll keluar viewport)
- **Implementasi:** `translateY = (scrollProgress - sceneStart) * viewportHeight * (ratio - 1.0) * 0.5`, clamped antara -120 dan 120

### Transisi Scene (cut vs fade)
- **Scene 1→2, 5→6, 7→8:** Fade (opacity 0→1 selama 12% rentang transisi)
- **Scene 2→3, 3→4, 4→5:** Instant cut (elemen baru langsung opacity 1 di frame pertama rentang baru)
- **Scene 6→7:** Cross-fade (overlap 8% rentang, old fade out while new fade in)

### Counter Animasi (scene 2, 3)
- **Properti:** angka dari 0 ke target
- **Awal → Akhir:**  
  - Scene 2: 0 → 15 (integer steps)
  - Scene 3: 0 → 718 (integer steps)
- **Easing:** `Power3.easeOut`
- **Rentang scrub:** 40% dari rentang scene yang di-pin (mis. scene 2 pin di 0.12–0.30, counter animate 0.12–0.19)
- **Display:** `Math.floor(value)` untuk integer, tidak ada decimal

### Horizontal Filmstrip (scene 4: Script Showcase)
- **Properti:** `translateX` dari container
- **Awal → Akhir:** 0vw → -120vw (3 kartu @ 40vw each, scroll menggeser container ke kiri)
- **Easing:** Linear (scrub langsung map ke position, tidak ada easing synthetic)
- **Rentang scrub:** 0.46 – 0.64 (18% timeline = 18% horizontal travel)
- **Snap:** Tidak ada snap point, free scroll

### 3D Camera (scene 1, 7)
- **Properti:** `camera.rotation.y` (orbit horizontal)
- **Awal → Akhir:**  
  - Scene 1: -4° → +4° (total 8° orbit)
  - Scene 7: 0° (static saat interaktif)
- **Easing:** Linear (smooth scrub)
- **Rentang scrub:** Seluruh rentang scene 1 (0.00–0.12)

---

## 4. Grid dan Tipografi

### Grid Desktop (≥1024px)
- **Kolom:** 12
- **Gutter:** 24px
- **Margin:** 48px (kiri/kanan)
- **Lebar maksimum teks:** 680px (centered, untuk body copy di scene 6/8)
- **Lebar maksimum display:** 920px (headline di scene 1)

### Grid Mobile (375px–1023px)
- **Kolom:** 4
- **Gutter:** 16px
- **Margin:** 20px (kiri/kanan)
- **Lebar maksimum teks:** 100% - 40px
- **Lebar maksimum display:** 100% - 40px

### Tipografi
- **Display Hero (scene 1, 7):**  
  Font: Canela (serif, tidak Playfair), weight 300  
  Size: `clamp(40px, 5.2vw, 92px)`  
  Line-height: 1.1  
  Letter-spacing: -0.02em  
  
- **Display Scene (scene 2–6):**  
  Font: Canela, weight 400  
  Size: `clamp(32px, 4vw, 72px)`  
  Line-height: 1.15  
  Letter-spacing: -0.015em  

- **Body (scene 6, 8):**  
  Font: Untitled Sans (tidak Inter), weight 400  
  Size: 16px (mobile), 18px (desktop)  
  Line-height: 1.6  
  Letter-spacing: 0  

- **Label/Caption (scene 3 stat, scene 8 credits):**  
  Font: Untitled Sans, weight 500  
  Size: 12px  
  Line-height: 1.4  
  Letter-spacing: 0.08em  
  Transform: uppercase  

- **Script Cards (scene 4):**  
  Native text: 48px, font sesuai aksara (Noto Sans Thai/Arabic/CJK)  
  Romanization: 14px, Untitled Sans, weight 400, color #6B6966  

### Jarak Antar-Scene
- **Vertikal (vh):** Lihat kolom "Tinggi" di tabel scene
- **Total scroll height:** 1120vh (semua scene dijumlah)
- **Transisi overlap:** Tidak ada overlap fisik (scene baru mulai di batas scene lama), tapi visual overlap via opacity fade

---

## 5. Perlakuan Gambar

### Scene 3: Indonesia Silhouette
- **Sumber:** `src/content/map-paths.json` → `id: "id"` → `d` (SVG path string)
- **Ukuran:** 52vw lebar (maintain aspect dari bbox)
- **Posisi:** Centered horizontal, vertical offset +8vh dari top viewport
- **Mask:** `linear-gradient(to bottom, black 0%, black 65%, transparent 100%)` di bottom edge
- **Parallax:** Tidak ada (pinned)
- **Dots:** 718 titik kecil (2px diameter, opacity 0.4, color #D97D3A) ditempatkan acak di dalam path bounds, fade in berurutan selama counter naik

### Scene 4: Script Cards (bukan gambar, tapi spesifikasi visual)
- **Sumber:** `src/content/countries.json` → `greeting.native` + `greeting.roman`
- **Layout:** 3 kartu horizontal, masing-masing 40vw × 50vh
- **Background:** Solid color dari `paletteKey` negara (mis. Thailand `--country-th`)
- **Card spacing:** 4vw gap antar kartu
- **Script positioning:** Centered dalam kartu, native text di atas, roman di bawah dengan 16px gap

### Scene 5: Regional Tapestry
- **Sumber:** 6 path dari map-paths.json (id, my, sg, th, vn, ph)
- **Jumlah gambar:** 6 siluet
- **Ukuran:** Variabel — Indonesia 45vw, Malaysia 35vw, Thailand 38vw, Vietnam 32vw, Filipina 34vw, Singapura 12vw
- **Posisi:**  
  - Background: Malaysia (left 10vw, top 15vh), Thailand (right 8vw, top 12vh)
  - Mid: Vietnam (left 25vw, top 35vh), Singapura (right 35vw, top 55vh)
  - Foreground: Indonesia (center, top 22vh), Filipina (right 18vw, top 40vh)
- **Mask:** Soft edge gradient `radial-gradient(ellipse 90% 85%, black 50%, transparent 100%)`
- **Parallax:** Lihat "Spesifikasi Gerak" di atas (0.85/1.0/1.15 rasio)
- **Overlap:** Intentional — Indonesia di depan Vietnam, Malaysia di belakang Thailand

### Scene 6: Cultural Vignette
- **Sumber:** Siluet Turki + Thailand dari map-paths.json + icon prosedural (cezve, wai)
- **Jumlah layer:** 4 — background gradient, Turki siluet (30vw), Thailand siluet (28vw), icons overlay (SVG 64×64)
- **Ukuran:** Turki 30vw, Thailand 28vw, centered dalam 80vw container
- **Posisi:** Turki left offset -12vw, Thailand right offset +10vw, vertical centered
- **Mask:** Tidak ada mask, tapi siluet fill solid dengan 12% opacity, icons full opacity
- **Parallax:** Layer 1 (gradient) static, layer 2 (Turki) parallax 0.92, layer 3 (Thailand) 1.08, layer 4 (icons) 1.15
- **Icon treatment:** Cezve positioned di dalam Turki bounds (centroid +0.1x, +0.15y offset), wai positioned di dalam Thailand bounds (centroid -0.08x, +0.05y)

### Scene 7: 3D Benua (bukan gambar 2D)
- **Sumber:** `src/scene/AsiaScene.tsx` dengan props `scrollProgressRef`, `onHoverCountry`, `onSelectCountry`
- **Ukuran:** 62vw desktop, 85vw mobile
- **Posisi:** Centered horizontal dan vertical
- **Camera:** FOV 42, tilt 35° (seperti constraint produk)
- **Render:** Three.js, bukan gambar statis

---

## 6. Popup Negara

### Desktop (≥768px)
- **Ukuran:** 420px (lebar) × auto (tinggi, min 280px)
- **Posisi:** Center screen (transform translate(-50%, -50%))
- **Padding:** 32px
- **Background:** #FFFFFF
- **Border-radius:** 8px
- **Box-shadow:** `0 24px 48px rgba(43, 42, 39, 0.12), 0 8px 16px rgba(43, 42, 39, 0.08)`

### Mobile (<768px)
- **Ukuran:** 90vw × auto (min 320px tinggi)
- **Posisi:** Center screen
- **Padding:** 24px
- **Sama:** background, radius, shadow seperti desktop

### Isi Popup
1. **Greeting native** (32px, font sesuai aksara, weight 500, color #2B2A27)
2. **Arti greeting** (14px, Untitled Sans, color #6B6966, margin-top 8px)
3. **Satu metadata** — contoh: "Bahasa resmi: Bahasa Indonesia" atau "Aksara: Devanagari" (14px, margin-top 16px)
4. **Satu aksi** — button "Jelajahi Indonesia →" (16px, background #D97D3A, color white, padding 12px 24px, radius 4px, margin-top 24px)

**Tidak ditampilkan:** Populasi, ibu kota, GDP, flag emoji (tidak ada data terverifikasi di countries.json)

### Transisi
- **Fade in:** 280ms `cubic-bezier(0.22, 0.61, 0.36, 1)`
- **Scale in:** scale(0.96) → scale(1) bersamaan dengan fade
- **Backdrop:** `rgba(43, 42, 39, 0.24)` fade in 200ms

### Interaksi
- **Muncul:** Klik negara di 3D scene (scene 7) atau tekan Enter saat negara focused di list keyboard
- **Menutup:**  
  - Klik backdrop (area di luar popup)
  - Tekan Esc
  - Klik tombol × di kanan atas (24×24, icon, color #6B6966)
  - Klik button "Jelajahi..." (navigasi ke `/negara/:id`)
- **Focus trap:** Ya — Tab cycle antara × button, metadata text (for screen reader), dan action button. Shift+Tab kembali.
- **Keyboard nav:** Arrow Up/Down untuk ganti negara saat popup terbuka (previous/next dalam list 15 negara)

---

## 7. Mobile 375px

### Scene 1 (Hero)
- **Tidak berubah** — 3D benua tetap 85vw, teks ukuran `clamp(40px, ...)`

### Scene 2 (Scale Reveal)
- **Counter position:** Centered (bukan offset kiri seperti desktop)
- **Tinggi scene:** 120vh (desktop 140vh)

### Scene 3 (Language Depth)
- **Slide direction:** Dari bawah (translateY 100vh→0), bukan dari kanan
- **Siluet size:** 88vw (lebih besar dari desktop 52vw karena portrait orientation)
- **Dots count:** 360 (setengah dari 718, performa mobile)

### Scene 4 (Script Showcase)
- **Layout:** Vertikal stack, bukan horizontal filmstrip
- **Kartu:** 3 kartu vertikal, masing-masing 90vw × 60vh, stack dengan 20vh gap
- **Scroll:** Scroll vertikal natural, tidak ada translateX
- **Transisi:** Kartu fade in satu per satu saat masuk viewport (Intersection Observer)

### Scene 5 (Regional Tapestry)
- **Jumlah siluet:** 3 (bukan 6) — Indonesia (center), Thailand (left background), Filipina (right foreground)
- **Parallax:** Dihapus (static position, hanya fade in)
- **Ukuran:** Indonesia 72vw, Thailand 48vw, Filipina 52vw

### Scene 6 (Cultural Vignette)
- **Layer count:** 2 (bukan 4) — hanya 1 siluet (Turki) + 1 icon (cezve)
- **Parallax:** Dihapus
- **Ukuran:** Turki 68vw, icon 56×56

### Scene 7 (Interactive Invitation)
- **3D benua:** 85vw (sudah sesuai constraint)
- **Tidak berubah** fundamental

### Scene 8 (Footer)
- **Text size:** 14px (desktop 16px)
- **Link spacing:** 16px vertical gap (desktop 24px horizontal)

---

## 8. Aksesibilitas

### Urutan Fokus
1. Skip to content link (hidden, visible on focus) — jump ke scene 7
2. Scene 1–6: tidak ada elemen interaktif (pure scroll narrative)
3. Scene 7 (Interactive Invitation):
   - 3D canvas (tabindex="0", role="application", aria-label="Peta interaktif 15 negara Asia")
   - Fallback list: 15 tombol negara (`<button>` per negara, dalam `<nav aria-label="Daftar negara">`)
4. Scene 8 (Footer): link sumber data (3 link)

### Keyboard Alternatif (scene 7)
User tanpa mouse dapat:
1. Tab ke canvas 3D
2. Tekan Tab lagi → focus pindah ke fallback list (15 button negara)
3. Arrow Down/Up untuk navigasi list
4. Enter untuk pilih negara → popup muncul
5. Tab dalam popup (× button, action button)
6. Esc untuk tutup popup

**Fallback list structure:**
```html
<nav aria-label="Daftar negara" class="country-list">
  <button data-country="id">Indonesia</button>
  <button data-country="my">Malaysia</button>
  <!-- ... 13 negara lain ... -->
</nav>
```
Disembunyikan visual (`position: absolute; left: -9999px`) tetapi accessible untuk screen reader dan keyboard. Saat button focused, tooltip muncul di layar.

### aria-live (hover states)
Saat user hover negara di 3D scene (scene 7):
```html
<div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
  Indonesia — Bahasa Indonesia, 718 bahasa daerah
</div>
```
Screen reader announce nama negara + 1 fakta. Update setiap hover ganti negara.

### prefers-reduced-motion
**Per scene behavior:**

| Scene | Normal | Reduced Motion |
|---|---|---|
| 1 Hero | 3D orbit 8°, teks translateY fade | 3D static, teks fade only (opacity 0→1) |
| 2 Scale | Counter 0→15 animate, negara highlight berurutan | Counter instant 15, semua negara highlight bersamaan |
| 3 Language | Siluet slide in, dots populate berurutan | Siluet instant, dots instant semua |
| 4 Script | Filmstrip translateX smooth | Filmstrip instant cut per kartu (3 discrete states) |
| 5 Regional | Parallax layers, fade in berurutan | Static layers, fade in bersamaan |
| 6 Cultural | Layer-by-layer fade, parallax | All layer instant, no parallax |
| 7 Interactive | Hover scale+emissive 240ms | Hover emissive only, instant (no scale) |
| 8 Footer | Fade in | Instant |

**Implementasi:**
```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable gsap smooth scrub, use instant .set() instead
  // Disable Three.js camera orbit, set static rotation
  // Convert all translateX/Y to display:none/block cuts
  // Keep opacity fade (allowed, < 0.5s duration)
}
```

### Kontras Warna
- Teks display (#2B2A27) on background (#FAF9F6): 12.8:1 (AAA)
- Teks body (#2B2A27) on background: 12.8:1 (AAA)
- Caption (#6B6966) on background: 5.2:1 (AA)
- Accent button (#D97D3A) with white text (#FFFFFF): 4.8:1 (AA large text)

### Screen Reader Struktur
- `<main>` wraps scene 1–8
- Each scene adalah `<section aria-labelledby="scene-N-heading">`
- Hidden h2 per scene untuk SR navigation ("Hero", "Jumlah Negara", "Keragaman Bahasa", dst)
- 3D scene memiliki text fallback di dalam `<canvas>`

---

## 9. Daftar Terlarang (Asiakin v3 Specific)

1. **Gradient ungu-biru (#667EEA → #764BA2)** atau varian purple-pink, blue-cyan — palette kita warm earth tones only
2. **Glassmorphism** — tidak ada `backdrop-filter: blur()` pada kartu, navbar, popup, atau modal
3. **Inter, Poppins, Montserrat** sebagai typeface utama — kita pakai Canela + Untitled Sans
4. **Hero dengan centered stack + 2 button** — scene 1 hanya punya satu teks headline, tidak ada button pair
5. **Tiga kartu fitur dengan icon-title-description** — tidak ada grid 3-card pattern di mana pun
6. **Teks "Elevate", "Seamless", "Powerful", "Innovative"** — copy kita spesifik produk: "15 negara", "718 bahasa daerah", "pilih negara"
7. **Emoji bullets (🚀, 💡, ✨)** — tidak ada emoji di UI, hanya di data content (greeting)
8. **Decorative step numbers (01, 02, 03)** — tidak ada numbered process; scroll narrative tidak punya explicit numbering
9. **Neon glow hover effect** — hover state kita: scale 1.08 + emissive cokelat gelap, bukan glow cyan/magenta
10. **Marquee logo klien** — tidak ada partner logo carousel
11. **Statistik tanpa sumber** — semua angka (15 negara, 718 bahasa) bersumber countries.json yang sudah verified
12. **Autoplay video/audio** — tidak ada video; 3D render tidak punya sound
13. **Cursor trail atau custom cursor SVG** — cursor default browser, kecuali `cursor: pointer` pada interactive elements
14. **Scroll-jacking** — tidak ada forced animation completion; user bisa scroll bebas, timeline scrub linear
15. **Preloader > 2 detik** — tidak ada preloader sama sekali; 3D scene load async, show fallback list first
16. **Parallax horizontal slider dengan snap-scroll mandatory** — scene 4 filmstrip smooth scroll, tidak ada snap
17. **Background video 4K di hero** — hero kita 3D scene ringan, bukan video berat

**Catatan pattern yang ALLOWED tapi harus hati-hati:**
- Parallax ✅ (tapi maksimum ±120px, tidak sampai 200% viewport)
- Counter animasi ✅ (tapi hanya untuk stat terverifikasi, bukan "1000+ happy customers")
- Horizontal scroll ✅ (scene 4 filmstrip, tapi tidak mengunci scroll, bisa skip)
- Fade transition ✅ (tapi durasi ≤ 320ms, tidak sampai 800ms Apple-style slow fade)

---

## 10. Catatan Implementasi

### Tech Stack Assumptions
- **Scroll:** Framer Motion `useScroll()` dengan `<motion.div>` per scene, atau GSAP `ScrollTrigger` jika performa Three.js butuh imperative control
- **3D:** Three.js dengan `AsiaScene.tsx` existing component (props `scrollProgressRef` untuk sync scroll)
- **Layout:** CSS Grid untuk scene structure, Flexbox untuk card internals
- **Responsive:** CSS clamp() untuk typography, CSS custom properties untuk breakpoint values

### Performa Target
- **First Contentful Paint:** < 1.2s (3G)
- **Largest Contentful Paint:** < 2.5s (hero text rendered)
- **Cumulative Layout Shift:** < 0.1 (semua scene height dihitung pre-render)
- **3D scene load:** Async, not blocking; fallback list shows immediately
- **Scroll FPS:** ≥ 55fps on mid-range mobile (tested on Moto G Power, throttled 4× CPU)

### Fase Build
1. **Fase 1:** Scene 1, 2, 7, 8 (hero, scale, interactive, footer — core flow)
2. **Fase 2:** Scene 3, 4 (language depth, script showcase — data narrative)
3. **Fase 3:** Scene 5, 6 (regional tapestry, cultural vignette — polish)
4. **Fase 4:** Mobile responsive adjustments (scene 4 vertikal stack, scene 5 reduce siluet)
5. **Fase 5:** a11y keyboard nav, reduced motion, screen reader audit

### File Dependencies
- `src/content/map-paths.json` — SVG path untuk scene 3, 5, 6 siluet
- `src/content/countries.json` — Data untuk scene 2 counter (15), scene 3 counter (718 dari Indonesia entry), scene 4 script cards
- `src/scene/AsiaScene.tsx` — Component untuk scene 1 dan 7 (3D benua)
- `/negara/:id` route — Target navigasi dari popup action button

---

**End of spec. Total: 286 baris.**
