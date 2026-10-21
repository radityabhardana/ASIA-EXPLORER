# PRD v2.4 DELTA — Asia Explorer

Tanggal: 21 Oktober 2026
Status: mengikat. Bertentangan dengan `PRD_V2_3_DELTA.md`, `DESIGN_LANDING_V4.md`, atau `DESIGN_COUNTRY.md` → dokumen ini menang.
Basis kode: `C:\Users\raso8\asiakin-v3`, HEAD `408e486`.
Sumber revisi: `docs/AUDIT_2026-10-21.md` (audit 21 Oktober 2026 atas sepuluh screenshot nyata).

---

## 0. Mengapa delta ini ada

Empat dokumen lama saling bertentangan dan tiga di antaranya sudah mati secara teknis: globe bola, rute `/country/:id`, preloader yang dilarang, dan lebar halaman negara 800px. Agent membaca spesifikasi mati itu dan menghasilkan verifikasi yang lulus di atas kertas tetapi rusak di browser. Delta ini menghapus kontradiksinya, bukan menambah lapisan baru.

---

## 1. Keputusan yang menggantikan

| ID | Keputusan | Menggantikan | Konsekuensi |
|---|---|---|---|
| **D37** | Nama produk **Asia Explorer**. Berlaku di title tab, wordmark hero, preloader, README, dan dokumen. Kode internal tetap memakai `asiakin` (nama paket, prefix CSS, event). | "ASIAKIN" sebagai nama tampil | Tidak ada rename direktori/paket; hanya string tampil. |
| **D38** | Rute negara **`/negara/:id`**. `/country/:id` dialihkan permanen ke `/negara/:id` (redirect replace, tanpa animasi). | v2.3 §3.3, tes L-07/L-08 | Semua tautan internal memakai `COUNTRY_PATH`; tidak ada dua rute yang merender halaman yang sama. |
| **D39** | Objek pusat adalah **mesh benua Asia** hasil proyeksi LAEA (90°E, 32°N) dari Natural Earth 1:50m, diekstrusi tipis, dipilih lewat raycast pada `extras.iso3`. | D8 + §3.4 "globe bola + color-ID texture" | Globe, `SphereGeometry`, tekstur 4096×2048, dan color-ID **dihapus dari spesifikasi**. Tidak ada teks PRD yang boleh menyebut globe lagi. |
| **D40** | Orientasi **utara di atas**, diverifikasi sebagai gate: `x(JP) > x(SA)` dan `y(ID) > y(CN)` pada koordinat layar. | Klaim VERIFY yang hanya mengukur lebar bbox | Orientasi menjadi tes otomatis, bukan asumsi. |
| **D41** | Tinggi scroll landing **920vh, satu angka**. | 920vh (§0.8) vs 1020vh (tabel §1) vs 1120vh (§4) | Semua rentang timeline diturunkan dari 920; tabel lama tidak boleh dipakai. |
| **D42** | **3 set-piece** yang di-pin: skala/kamera, filmstrip aksara, undangan. Scene lain bergerak tanpa pin. | "3 pin" yang tabelnya menjabarkan 4 | Tidak ada pin keempat. |
| **D43** | Scope landing **8 scene** (bukan 5–7 section). | v2.3 §3.1 | Daftar scene = sumber urutan copy. |
| **D44** | Halaman negara memakai **satu grid**: kolom teks `minmax(0, 68ch)` + sidebar sticky (siluet + locator). | DESIGN_COUNTRY 800px | Tidak ada kolom kedua yang mengulang nama/bahasa. |
| **D45** | Halaman negara memiliki blok **Cerita** 120–180 kata, dengan field schema `story: { text, sources[] }`. Cerita wajib berasal dari riset bersumber; tidak boleh dikarang agent. | DESIGN_COUNTRY tanpa cerita | Schema, builder konten, tipe, dan halaman berubah bersama. |
| **D46** | Loader: **tidak ada peta SVG saat WebGL tersedia**. Placeholder kotak benua + judul tampil sejak frame pertama; SVG hanya untuk tanpa-WebGL, chunk gagal, atau timeout 5.000 ms. Preloader D29 menang atas V4 §9.15, maksimum 1.200 ms, sekali per sesi. | V4 §9.15 (fallback list langsung) | Flash 2D → 3D dinyatakan cacat, bukan pilihan desain. |
| **D47** | Gate verifikasi baru: orientasi, no-flash, tumpang tindih, grid 48px, counter, ukuran benua dari piksel. | VERIFY yang hanya mengukur proxy | `npm run verify` gagal bila salah satu gate merah. |

---

## 2. Hero (1440 × 900) — spesifikasi mengikat

| Aspek | Nilai |
|---|---|
| Wordmark | "Asia Explorer", Crimson Pro, `clamp(40px, 5vw, 72px)`, x = 48, y = 40 |
| Tagline | satu baris, maksimum 12 kata, `--ink-muted`, selesai sebelum y = 230 |
| Benua | lebar **62vw diukur dari piksel render** (bukan dari lebar container), utara di atas |
| Posisi benua | titik tengah ≈ 58% tinggi viewport, tepi atas ≥ y = 288 |
| Tumpang tindih | bbox blok judul dan bbox benua **tidak boleh** berpotongan |
| Dataran | cakram radius ≈ 52vw, token `--ground` (3–4% lebih gelap dari `--surface`), 2–3 cincin hairline, `ShadowMaterial` opacity ≈ 0.12 |
| Kamera | perspektif FOV 35–40, elevasi 50–55° dari horizontal |
| Ekstrusi | tetap tipis (1,2 dan 1,8 satuan) sesuai `SCENE_GEOMETRY.md` |
| Intro | 0–0,3 s judul lewat clip; 0,3–0,9 s cincin tergambar; 0,6–1,6 s negara naik bergantian barat → timur; lalu idle ≤ 2° |
| Reduced motion | langsung ke kondisi akhir, statis, tanpa idle |
| Mobile | benua 85vw, judul satu kolom, tanpa ground plane bila tinggi viewport < 620px |

Di bawah hero, kamera mundur dan negara menyala satu per satu. **Counter dan highlight dibaca dari satu nilai progres yang sama**; tidak boleh ada dua animasi terpisah.

---

## 3. Halaman negara — struktur mengikat

Urutan blok: **Hero → Cerita → Budaya → Orang → Bahasa → Sumber**.

1. Nama negara dan nama lokal muncul **sekali**, di hero.
2. Cerita 120–180 kata; tiga aturan budaya beserta sebabnya; tiga norma orang; sapaan + 3 frasa + audio (bila voice tersedia); minimal 2 sumber per negara, ditampilkan sebagai daftar URL bertanggal akses.
3. Locator memakai stroke dengan kontras grafis ≥ 3:1 terhadap latar.
4. Tombol kembali `position: fixed`, latar `--surface`, tanpa glyph panah, konten diberi offset atas 72px.
5. Tidak ada celah kosong > 120px antar blok pada 1440; tidak ada duplikasi teks nama/bahasa.

---

## 4. Gate verifikasi (menggantikan §5 VERIFY lama)

| Gate | Definisi lulus | Cara ukur |
|---|---|---|
| Orientasi | `x(JP) − x(SA) > 20px` dan `y(ID) − y(CN) > 20px` | `window.__asiakin_scene.projected()` pada canvas hero |
| No-flash | tidak ada `.country-map-svg` di DOM pada 100/300/600/1200/2000 ms; tinggi kotak benua berubah ≤ 4px | sampling DOM + bbox |
| Tumpang tindih | tidak ada irisan bbox judul/caption dengan siluet/gambar | `getBoundingClientRect` seluruh pasangan yang terlihat |
| Grid | setiap `.landing-stage` memiliki tepi kiri konten 48px ±1 pada 1440; blok teks rata kiri (hero, scale, script, footer) mulai di 48px ±1; tampilan terpusat tetap terpusat di dalam grid itu | bbox stage + bbox elemen teks rata kiri |
| Counter | teks counter === jumlah negara menyala pada setiap progres uji | 5 fraksi scroll, nilai dibaca dari DOM |
| Ukuran benua | lebar piksel render 62vw ±3 pada 1440, 85vw ±4 pada 375 | `measureInk()` membaca `gl.readPixels` |

Gate grid mengukur tepi kiri kontainer, bukan elemen teks pertama pada adegan terpusat: adegan yang memang terpusat (718 bahasa, filmstrip, vignette, undangan) tidak boleh dipaksa rata kiri hanya demi angka.

Gate dijalankan di `npm run verify` melalui `e2e/gates.spec.ts`. Gate yang gagal memblokir klaim selesai, bukan dicatat sebagai "catatan".

---

## 4a. D48 — Reveal mengikuti geometri nyata, bukan pecahan desktop

Satu timeline global boleh dipertahankan, tetapi posisi tween tiap adegan harus diturunkan
dari `offsetTop`/`offsetHeight` adegan dan `scrollHeight − innerHeight` pada saat runtime,
lalu dibangun ulang saat resize atau pergantian breakpoint. Pecahan tetap berbasis vh desktop
(cultural = 620/920) tidak boleh dipakai lagi: di 375 dokumen 8986 px, pecahan itu jatuh
476 px setelah tepi atas adegan sehingga teks baru muncul setelah keluar layar.

Aturan lulus:

1. Saat blok copy sebuah adegan berada di `top ∈ [120, 400]` pada viewport 375 dan 768,
   opacity copy dan seluruh `[data-reveal]` di adegan itu ≥ 0,95.
2. Tidak boleh ada adegan dengan copy `opacity < 0,05` saat section menutup ≥ 60% viewport.
3. Adegan cultural di ≤899 px menampilkan kedua layer (tanpa `display: none`), tidak ada
   elemen dengan `left < 0`, tabrakan headline ∩ layer = 0 px², caption rata kiri 16 ±1,
   dan `scrollWidth === innerWidth`.
4. Angka desktop 1440 (diptych 48→672 / 768→1392, caption bottom 760, ikon 28 px inline,
   kaki halaman `height:auto`) tidak berubah oleh perbaikan ini.

Gate D48 dijalankan di `e2e/gates.spec.ts` bersama gate lain; kegagalan memblokir klaim selesai.

## 5. Yang tetap mati (jangan dihidupkan)

- Globe bola, tekstur bumi, color-ID picking, `SphereGeometry`.
- Navbar, header, hamburger, sidebar, footer 4 kolom.
- Kartu (border + radius + shadow), pemisah garis putus, glyph panah.
- Foto tanpa lisensi tercatat di `docs/ASSETS.md`.
- Auth, dashboard, quest, AI: F3–F4, dimulai hanya setelah gate F1 dan F2 lulus.
