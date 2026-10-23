# Riset Referensi: worldly.academy — Pola Country-Pick (untuk Asia Explorer)

Tanggal: 2026-10-23.
Sumber: fetch langsung (markdown + raw HTML via `Invoke-WebRequest`); CSS dimuat: `8196c999b164a163.css` & `ddbebeb484db349e.css` (dpl `dpl_HHEKZgN1BMfq15oKdjnBQy8aAv8M`).
Halaman dianalisis: `/` (home), `/guides` (listing; `/atlas` → 308 → `/guides`), `/atlas/japan`, `/atlas/turkey`, `/words`.
Raw HTML & CSS tersimpan lokal: `%TEMP%\opencode\worldly\` (guides.html 341.618 B, japan.html 640.593 B, 2 file CSS).
Legenda bukti: **[T]** = terverifikasi dari raw HTML/CSS; **[R]** = rancangan sendiri karena worldly tidak punya presedennya.

## Jawaban 8 Pertanyaan Riset

| # | Pertanyaan | Jawaban ringkas | Bukti (URL + kutipan verbatim) |
|---|---|---|---|
| 1 | Interaksi pemilih negara | **[T]** Daftar teks bergrup per benua (bukan tile gambar/grid/map/carousel): kolom kartu teks dalam kontainer `max-width:900px`, anchor per benua + mega-menu nav per benua di halaman detail | guides.html: `<div style="display:grid;gap:16px"><a style="display:block;padding:24px;…" href="/atlas/albania">…`; `<section id="europe" style="scroll-margin-top:80px">`; japan.html: mega-menu 6 trigger `/maps?continent=…` + 37 sublink |
| 2 | Tile vs kartu | **[T]** Worldly = kartu penuh (border + radius + permukaan terisi). Tanpa shadow di tile listing. `/guides` memuat 0 gambar konten (satu-satunya `<img>` = logo SVG). Ini contoh LAWAN dari constraint no-card | guides.html: `padding:24px;border-radius:var(--radius);border:1px solid var(--border);background:var(--surface)`; token `:root{--radius:4px;--surface:#ffffff94}` (ddbebeb…css) |
| 3 | Hierarki info di sel | **[T]** Baris atas flex: [bendera emoji `aria-hidden`] → [nama 1.05rem/w500] → [label "Complete guide" via `margin-left:auto`]; bawah: deskripsi 1 kalimat `0.85rem/w300/line-height 1.7`; lalu CTA "Explore X →" | guides.html: `<span aria-hidden="true" style="font-size:1.5rem">…</span><span style="font-size:1.05rem;font-weight:500">Albania</span><span class="w-eyebrow-dim" style="margin-left:auto">Complete guide</span>` |
| 4 | Hover / fokus | **[T]** Tile listing (inline style, tanpa class): tidak ada rule hover khusus (0 match `a:hover` generik di CSS). Elemen berkelas: hover = `border-color:var(--border-hi)` / bg `--surface-hi` / `translateY(-1px)`; fokus = `outline:2px solid var(--accent);outline-offset:2–3px`; dibungkus `@media (hover:hover) and (pointer:fine)`; transisi dimatikan lewat `prefers-reduced-motion` (41 blok di CSS) | ddbebeb…css: `.flag-option:not(:disabled):hover{border-color:var(--border-hi);…transform:translateY(-1px)}`; `.btn.btn-together:focus-visible{…outline:2px solid var(--accent);outline-offset:3px}`; `@media (prefers-reduced-motion:reduce){.btn.btn-together{transition:none}}` |
| 5 | Navigasi | **[T]** Sticky: `top:0;z-index:100`, tinggi `calc(58px + env(safe-area-inset-top))`, bg `--nav-bg:#eaf5ffd6` (biru-muda translusen) + `backdrop-filter:blur(18px)` + `border-bottom:1px solid var(--border)`. Isi: 5 link (Maps/Facts/Play/Flags/Words) uppercase `0.75rem`, letter-spacing `.05em`, warna `--text-dim`; Sign in/Sign up; toggle "Night mode" `role="switch"`. Desktop `grid 1fr auto 1fr`; mobile: pita geser horizontal `overflow-x:auto` (class `no-scrollbar`). Tidak ada language switcher (0 match hreflang/locale) | guides.html: `<nav style="position:sticky;top:0;z-index:100;background:var(--nav-bg);backdrop-filter:blur(18px);…">`; `<div class="hidden md:grid" style=…grid-template-columns:1fr auto 1fr…>`; `<div class="grid md:hidden">…<div class="no-scrollbar" style="overflow-x:auto…">` |
| 6 | Scroll storytelling / marquee | **[T]** Tidak ada pada halaman yang diteliti: tanpa pinned scene, marquee, stacking, atau hero animasi (`marquee`: 0 match di HTML+CSS). Motion yang ada: latar SVG `earth-bg` fixed di `-z-10` dengan bintang `.eb-twinkle` berkedip (animation-delay); transisi interaktif `0.15–0.18s ease`; hover `translateY(-1px)` | guides.html: `<div aria-hidden="true" class="earth-bg pointer-events-none fixed inset-0 -z-10…">` + `<circle … class="eb-twinkle" style="animation-delay:3.2s">`; ddbebeb…css: `.btn-together{transition:background-color .18s ease,border-color .18s ease,…}` |
| 7 | Performa gambar | **[T]** Hero detail: 1 JPEG Wikimedia tunggal, tanpa srcset/AVIF/WebP/LQIP. LCP manual: `loading="eager"` + `fetchPriority="high"` + `decoding="sync"`, `object-fit:cover`. Gambar non-LCP: `loading="lazy"`. Alt = kalimat deskriptif utuh. Kredit terstruktur di payload RSC: `hero:{src, creditHref, creditLabel}`. → Asia Explorer ungguli dengan manifest sendiri **[R]** | japan.html: `<div class="country-hub-hero"><img alt="Mount Fuji seen across Lake Kawaguchi in cherry blossom season" …fetchPriority="high" loading="eager" decoding="sync" data-nimg="fill" style="…object-fit:cover" src="…/1920px-…4.JPG"/></div>` + `<figcaption style="font-size:0.66rem;color:var(--text-dim)…">…Midori, CC BY 3.0, via Wikimedia Commons</a></figcaption>` |
| 8 | Aksesibilitas | **[T]** Landmark semantik `<main>`/`<footer>`/`<nav>`; breadcrumb `<nav class="breadcrumbs" aria-label="Breadcrumb">` + `aria-current="page"`; emoji dekoratif `aria-hidden="true"`; toggle `role="switch" aria-checked` + `aria-label="Night mode"`; footer `aria-labelledby="footer-europe"`; outline fokus `2px solid var(--accent)`. Celah: tidak ada skip-link (0 match) | guides.html: `<nav class="breadcrumbs" aria-label="Breadcrumb"><ol><li><a href="/">Worldly</a></li><li><span aria-current="page">Country guides</span>`; grep `Skip to` → 0 match |

## Token Desain Terverifikasi (tema terang default; malam via `html[data-theme=night]`)

| Token / selektor | Nilai | Catatan |
|---|---|---|
| `--text` / `--text-dim` | `#0b1c34` / `#0b1c349e` | Tinta navy gelap di atas latar terang; dim = versi alfa |
| `--surface` / `--border` / `--border-hi` | `#ffffff94` / `#4682be29` / `#4682be52` | Putih semi-transparan; border biru sangat tipis |
| `--accent` (+hover) | `#b84718` → `#c24a16` | Jingga-bakar; tidak ada ungu |
| `--radius` / `--radius-control` | `4px` / `8px` | Radius kecil, bersih |
| `--nav-bg` | `#eaf5ffd6` (terang) / `#050a16cc` (malam) | Nav translusen + blur 18px |
| `.country-hub-hero` | `height:clamp(200px,31vw,380px)`, `border:1px solid var(--border)`, bg `linear-gradient(160deg,var(--surface) 0,#c8501a0d 55%,var(--surface) 100%)` | Hero hanya ~31vw; gradient aksen alfa 5% |
| `.guide-head` | `grid-template-columns:minmax(0,1fr) minmax(260px,330px)`; 1 kolom di `@media (max-width:900px)` | Layout detail 2 kolom → 1 |
| `.w-eyebrow` / `.w-eyebrow-dim` | `.78rem`, w400; warna `--accent` / `--text-dim` | Gaya label kecil di dalam sel |

## Yang Layak Diadaptasi untuk Asia Explorer

1. **[R] Listing negara tanpa kartu**: Worldly justru contoh lawan (kartu terisi+border+radius+padding). Untuk 15 tile foto: *edge-to-edge*, tanpa blok terisi/border/radius/shadow; konsistensi tinggi lewat CSS Grid (`grid-auto-rows`); identitas dari foto + tipografi, bukan kotak kertas.
2. **[T] Hierarki satu-baris di atas foto** (overlay teks, bukan bagian terisi): baris atas = [bendera emoji `aria-hidden`] [nama negara] [label `margin-left:auto`]; bawah = 1 kalimat deskripsi weight-300; CTA "Jelajahi X →". Jangan stack meta vertikal.
3. **[T] Sub-grup pakai eyebrow uppercase**: `0.78rem; letter-spacing:.12em; uppercase; warna dim` + counter + `scroll-margin-top` = tinggi nav. Cocok untuk pemisah Asia Selatan/Tenggara/Timur dalam satu blok pemilih.
4. **[T/R] Nav sticky 58px tetap, gaya diubah**: maksimal 5 item uppercase di desktop, pita geser horizontal `no-scrollbar` di mobile — tapi pakai bg solid terang (tanpa kaca-biru gelap), teks `#0b1c34`.
5. **[T] Fokus & hover murah**: `outline:2px solid var(--accent); offset 2px` (a11y nyata), hover = perubahan border/permukaan halus + `translateY(-1px)`, seluruhnya dalam `@media (hover:hover) and (pointer:fine)` dan dinonaktifkan penuh oleh `prefers-reduced-motion`.
6. **[T] LCP manual + [R] upgrade kita**: gambar pertama = `loading="eager"` + `fetchPriority="high"` + `decoding="sync"` + `object-fit:cover`; sisanya `loading="lazy"`. Ungguli Worldly (yang tak punya srcset/LQIP): AVIF/WebP srcset + LQIP dari manifest foto (AVIF 960/1600, WebP 640/960).
7. **[T] Attribution terstruktur**: `alt` kalimat deskriptif utuh (bukan "photo of") + caption kredit kecil (0.66rem) + `creditHref`/`creditLabel`, dan titik fokus negara di `object-position` — mirror pola `hero:{src,creditHref,creditLabel}` japan.html.
8. **[R] Marquee 15 sapaan (rancangan sendiri)**: referensi tidak punya preseden marquee (tabel #6), jadi: keyframes `translateX` loop CSS-only, duplikasi track untuk seamlessness; disiplin motion dari referensi (seluruh animasi mati via `prefers-reduced-motion`; interaksi khusus `hover:hover and pointer:fine`).
9. **[R] Tutup celah referensi**: Worldly tanpa skip-link — Asia Explorer wajib skip-link "Lewati ke pemilih negara" sebagai elemen fokus pertama.

---

### 📚 Librarian Technical Reference: Kontrak Laporan

**Ringkasan**
worldly.academy (Next.js, SSR, EN satu bahasa) memilih negara lewat daftar kartu teks per benua, bukan tile gambar; foto negara hanya tampil sebagai hero halaman detail (1 raster Wikimedia, LCP manual, tanpa srcset/AVIF/WebP/LQIP); nav sticky 58px blur-biru-muda dengan 5 item; tidak ada marquee/scroll-storytelling, tidak ada language switcher, tidak ada skip-link. Untuk Asia Explorer: ambil struktur hierarki, hierarki-dalam-sel, token warna terang navy+jingga-bakar, disiplin a11y/motion — dan tolak seluruh "kartu bertisi"-nya sesuai constraint no-card.

**Klaim**
(a) `/guides` 0 gambar konten selain logo SVG; (b) tile listing = kartu border 1px + radius 4px + surface `#ffffff94`, tanpa shadow; (c) tanpa marquee/pinned/stacking pada halaman yang diteliti; (d) nav sticky + blur, tanpa language switcher; (e) tanpa skip-link; (f) hero = 1 JPEG 1920px `loading=eager` + `fetchPriority=high`, tanpa srcset/AVIF/WebP/LQIP; (g) focus ring `2px solid var(--accent)`; (h) motion dimatikan via `prefers-reduced-motion`.

**Bukti**
- https://worldly.academy/guides — HTML raw & CSS disimpan: `%TEMP%\opencode\worldly\guides.html` (341.618 B), `ddbebeb484db349e.css` (148.201 B), `8196c999b164a163.css` (2.839 B); semua kutipan verbatim berasal dari grep regex atas file tersebut.
- https://worldly.academy/atlas/japan — `japan.html` (640.593 B): hero `<img>`, `fetchPriority`, `figcaption` kredit, payload RSC `hero:{src,creditHref,creditLabel}`.
- https://worldly.academy/ (markdown): heading "Learn every country on Earth.", bagian per benua; "Travel phrases in 107 languages".
- `/atlas` → 308 → `/guides` (terverifikasi saat fetch).

**Tidak diketahui**
- Pola motion marquee/carousel di sub-halaman `/words/<lang>` tidak dapat diverifikasi (ekstraksi markdown merata semua markup; tidak ada indikasi di teks) — aturan #8 karena itu rancangan sendiri, bukan penyalinan.
- Jumlah tile per baris responsif tidak bisa disimpulkan: listing Worldly memang 1 kolom kartu, bukan grid multi-kolom.
- Perilaku interaktif JS (efek hover tambahan non-CSS) tidak terlihat dari SSR HTML.

**Risiko**
- Worldly = situs content-guide, bukan pemilih visual: tidak ada preseden edge-to-edge photo-tiles; pola tile foto 15 negara dibangun dari manifest sendiri + hierarki yang dipinjam → perlu uji visual 375/768/1440 saat implementasi.
- Referensi memakai kartu (constraint melarang): disiplin penuh diperlukan agar tidak menyelundupkan "card-ness" (border/radius/fill/shadow) saat menerjemahkan hierarki ke overlay foto.
- Tanpa srcset/LQIP di referensi: perbandingan performa 1:1 tidak tersedia; klaim "kita lebih baik" baru bisa dibuktikan dengan Lighthouse pada hasil implementasi.
