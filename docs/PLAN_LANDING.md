# PLAN — Landing Page + Country Page (v3)

Status: aktif. Dokumen ini yang mengikat urutan kerja. PRD: `docs/PRD_V2_3_DELTA.md`. Desain: `DESIGN.md`.

Ruang lingkup **hanya** dua permukaan:

1. Landing page — narasi scroll, benua Asia 3D di tengah layar pertama, klik negara → popup → lanjut.
2. Country page — satu halaman per negara, kedalaman dangkal: cerita, budaya, orang, bahasa.

Di luar lingkup (ditunda, jangan dikerjakan): login, dashboard, lesson, quest, AI, progress.

---

## Gate definisi selesai

Tidak boleh dinyatakan selesai kalau salah satu belum terpenuhi:

| # | Gate | Bukti yang harus ada |
|---|---|---|
| G1 | `node scripts/verify.mjs` exit 0 | output mentah ditempel |
| G2 | `npm run e2e` exit 0 di port 5173 | output mentah, bukan ringkasan |
| G3 | Screenshot 375 / 768 / 1440 dari browser sungguhan | 3 file, dibaca ulang |
| G4 | Nol error konsol, nol warning React di ketiga viewport | dari listener e2e |
| G5 | Tidak ada layout shift saat GLB selesai dimuat | ruang direservasi, bukan `display:none` |
| G6 | Keyboard: Tab mencapai 15 negara, Enter memilih, Esc menutup popup, fokus kembali | test Playwright, bukan klaim |
| G7 | `prefers-reduced-motion` mematikan scroll-scrub dan idle motion, konten tetap terbaca | test + screenshot |
| G8 | Fallback tanpa WebGL menampilkan peta SVG yang tetap bisa dipilih | test dengan flag |
| G9 | Copy Indonesia, tanpa kata terlarang (Elevate/Seamless/Powerful/Unleash/dst) | grep + baca manual |
| G10 | Budget: JS awal ≤ 180 KB gz, chunk 3D ≤ 350 KB gz, GLB ≤ 500 KB | output build |

Gate G1–G10 harus lulus **sebelum** gua menyatakan pekerjaan ini selesai ke user.

---

## Standar visual & copy (dari user, mengikat)

Landing tidak boleh berhenti di satu objek 3D di layar pertama. Tuntutan eksplisit:

- Scroll berikutnya harus **interaktif dan beranimasi** — bukan teks yang cuma lewat.
- Rasa seperti presentasi berjalan: tiap layar menampilkan satu gagasan, transisinya disutradarai.
- Ada **gambar yang ditata**, bukan gambar ditempel asal. Layout harus terasa disusun, bukan template.
- Hover punya respons nyata, bukan sekadar kursor berubah.
- Teks seminimal mungkin tapi tetap cukup: satu gagasan per layar, tanpa paragraf penjelasan.
- Acuan kelas: awwwards parallax, motion.dev, threejs.org.

Konsekuensi teknis: minimal 3 *set-piece* scroll (pin/sticky scene atau transisi horizontal) dengan tinggi section terkontrol, scrub memakai satu timeline, dan setiap set-piece punya alasan naratif — bukan efek tempelan.

### Copy budget

| Permukaan | Batas |
|---|---|
| Hero | 1 judul + 1 baris tagline, ≤ 12 kata |
| Set-piece | ≤ 3 elemen teks per layar |
| Section editorial | 1 caption ≤ 18 kata |
| Popup negara | sapaan + arti + 1 metadata + 1 aksi |
| Country page | 1 paragraf per blok, ≤ 45 kata |

---

## Verifikasi visual (bukan cuma build)

Selain gate G1–G10:

- Screenshot per posisi scroll (0/25/50/75/100%) di 375, 768, 1440 — bukan hanya layar pertama.
- Instrumentasi di dalam halaman: `PerformanceObserver` untuk LCP dan CLS, plus frame budget saat scroll cepat.
- `axe-core` untuk pelanggaran a11y otomatis, dilengkapi cek manual keyboard.
- Tiap temuan ditulis di `docs/VERIFY.md` dengan file bukti.

---

## Lane

| Lane | Pemilik | Cakupan tulis | Status |
|---|---|---|---|
| L1 Desain | @designer | `DESIGN.md` | jalan (v3.2) |
| L2 Model GLB | @fixer | `tools/`, `public/models/`, `scripts/*model*` | jalan |
| L3 Konten A | @researcher | tidak menulis file; hasil dikembalikan | jalan |
| L4 Konten B | @researcher | tidak menulis file; hasil dikembalikan | jalan |
| L5 Fondasi | @fixer | `src/app/`, `src/styles/`, `src/lib/` | menunggu L1 |
| L6 Hero 3D | @fixer | `src/scene/` | menunggu L2+L5 |
| L7 Narasi scroll | @fixer | `src/sections/`, `src/content/` | menunggu L1+L5 |
| L8 Country page | @fixer | `src/pages/` | menunggu L3+L4+L5 |
| L9 Verifikasi | orchestrator | `docs/VERIFY.md` | menunggu L6–L8 |
| L10 Riset visual | @fixer | `docs/research/` | jalan |

Aturan lane paralel: L6, L7, L8 tidak boleh menulis file yang sama. `src/app/routes.tsx` dan `src/styles/tokens.css` **hanya** milik L5.

---

## Urutan

1. Kunci desain (L1) + model (L2). Tanpa keduanya, lane implementasi tidak boleh mulai.
2. L5 fondasi: router, token warna, shell layout, Lenis + GSAP ticker, feature detect WebGL, reduced-motion.
3. L6/L7/L8 paralel di direktori masing-masing.
4. Integrasi: popup dua langkah → navigasi country page; deep link `/negara/:id` harus bisa dibuka langsung.
5. L9 verifikasi penuh, lalu perbaikan (maksimal 2 putaran per temuan).

---

## Keputusan yang sudah dikunci

- Proyeksi mesh: LAEA pusat 90°E/32°N. Bukan equirectangular, bukan Mercator — keduanya merusak luas dan hierarki tinggi.
- Data batas: Natural Earth 1:50m, public domain. Bukan GADM (non-komersial), bukan OSM (ODbL).
- Picking: raycast per mesh negara, bukan color-ID texture. ID kanonik dari `extras.iso_a3`.
- Tidak ada navbar. Progress scroll menggantikan posisi navigasi.
- Tema terang hanya. Tidak ada dark mode.
- Semua copy Indonesia. Nama negara memakai ejaan Indonesia.

## Risiko terbuka

- Akurasi batas Natural Earth untuk wilayah sengketa: copy tidak boleh mengklaim kepemilikan wilayah.
- Model GLB bisa punya artefak di semenanjung tipis setelah bevel; harus diperiksa visual.
- Scroll-scrub + three.js bisa jank di perangkat low-end; DPR dikunci 1.5 dan jumlah draw call dijaga.
- Konten budaya bisa jatuh ke stereotip; setiap `people_note` wajib norma, bukan sifat.
