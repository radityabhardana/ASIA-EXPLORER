# OPEN_DEFECTS.md — cacat yang belum tertutup

Diperbarui: 21 Oktober 2026. Setiap butir punya bukti visual dan angka. Hapus butir
hanya setelah tangkapan layar baru membuktikan hilang.

---

## Halaman negara — cacat terbuka (putaran 3)

Bukti: `docs/VERIFY_COUNTRY/jp-1440-full.png` (1440), `docs/VERIFY_COUNTRY/sa-375-full.png` (375, **lulus**).

1. **Grid dua zona salah tempat, bukan sekadar sempit.** Di 1440 kolom teks terukur
   ±246 px (x=24→270), bukan 68ch/±680 px. Blok mengalir bergantian: hero, こんにちは,
   Budaya, Orang di kiri; siluet, Bahasa, Tiga frasa, Sumber di kanan. Penyebab paling
   mungkin: item grid ditempatkan otomatis, sehingga tiap `<section>` mengisi kolom
   berikutnya. Perbaikan: satu wadah untuk seluruh blok konten dengan `grid-column: 1`,
   sidebar `grid-column: 2; grid-row: 1 / -1`, `grid-template-columns: minmax(0, 68ch) 1fr`.
2. **Klaim desainer tidak cocok dengan gambar.** Laporan menyebut "text column 68ch
   (≈680px) + margin zone 420px, 81% viewport terpakai"; tangkapan menunjukkan kolom
   246 px dan dua zona isi, bukan zona teks + margin. Angka di laporan tidak diukur.

Lulus di putaran ini: tipografi sumber 14 px dengan kontras 5,47:1, entrance tanpa
opacity 0 (teks tajam di tangkapan full-page), mobile 375 rapi satu kolom tanpa overflow.

## Landing — status terukur setelah putaran 1 (`67143f4`)

Diukur sendiri lewat Playwright di `localhost:5192`, 1440x900, gulir bertahap 9 langkah.

1. **Tutup.** H1 terlihat di gulir 0 (`docs/VERIFY_LANDING/landing-1440x900-000.png`).
2. **Sebagian.** Elemen `.landing-hero__scene` = 893x595 px = 62,0vw, tetapi siluet
   benua di dalamnya hanya menempati ±580 px dari 893 px (64% isi kanvas), jadi yang
   terbaca tetap ±40vw. Ini urusan camera fit di `AsiaScene.tsx`, bukan CSS lebar.
   Geometri juga masih rusak: bilah vertikal di kepulauan, celah krem antar-negara.
3. **Bukan cacat.** Penghitung berjalan: `15=10` di 13%, `15=15` di 20%, `718=718` di
   30%. Angka "0" di tangkapan lama adalah artefak harness: skrip melompat langsung ke
   fraksi gulir lalu memotret sebelum tween GSAP sempat jalan. **Aturan verifikasi baru:
   gulir bertahap (≥20 langkah, jeda) sebelum memotret, jangan lompat-lalu- shoot.**
4. **Terbuka.** Kartu aksara ketiga: kotak terukur x=1066→1642 pada viewport 1440, jadi
   terpotong 202 px (lebar kartu 576 px = 40% viewport, mustahil tiga sejajar). Label
   bahasa + arti sudah ada dan terbaca.
5. **Terbuka, terukur di `landing-1440x900-075.png`.** Siluet Turki (x≈180–670,
   y≈150–630) dan Thailand (x≈1000–1275, y≈225–710) ditembus headline
   "Setiap negara punya caranya sendiri" yang duduk di y≈480–530, sehingga label
   "Turki — kopi Turki, cezve" (y≈523) tertimpa descender headline dan terbaca
   setengah. Ikon 24 px melayang di dalam bentuk tanpa kaitan visual. Ruang mati
   atas 150 px dan bawah 190 px.
6. **Terbuka, sekarang berbentuk kartu.** Indeks 15 negara ada, tetapi dirender sebagai
   15 tombol berbingkai 218x60 px (border 1px `rgb(216,212,204)`) di blok 920 px pada
   x=24 — melanggar aturan tanpa-kartu dan menyisakan ±500 px kosong di kanan.
7. **Tutup.** `.landing-country-list` sudah in-flow di kaki halaman; suite unit 27/27
   hijau (tes larangan landmark navigasi sudah disesuaikan ke nav in-flow).
8. **Sebagian.** Tidak ada gulir horizontal (`scrollWidth == clientWidth == 1440` di
   semua posisi), tetapi kaki halaman masih menyisakan ±200 px ruang mati di atas judul.

## Scene — putaran 2 (`53df049`), hasil ukur sendiri

Bukti: `docs/VERIFY_SCENE/r3-hero-1440.png`, `r3-hero-375.png`, `r3-hover-projected.png`.
Skrip ukur: `tmp-scene-check.mjs`, `tmp-hover-check.mjs` (gitignored).

**Tutup (diukur, bukan diklaim):**

1. **Bidang terisi.** Bbox tinta di dalam `.landing-hero__scene` = 892x346 px dari elemen
   893x595 px → **61,9vw** pada 1440 (target 62vw); 319 px dari 375 → **85,1vw** (target
   85vw). Klaim lane bahwa ini "belum diukur" ternyata lulus.
2. **Caption debug hilang.** Query seluruh teks "Terpilih:/Hover:" → 0 elemen.
3. **Potongan utara hilang.** `lat_max` 75 (`tools/build-asia.py:86`); garis horizontal
   lat-65 tidak lagi terlihat pada tangkapan 1440 maupun 375.

**Terbuka:**

4. **Label hover ganda.** Scene 7 merender dua label sekaligus: `.asia-scene__label`
   (Jepang / 日本 / Asia Timur) dan `.landing-invitation__label` ("Jepang", y=789).
5. **Label tidak mengikuti kursor.** Kotak `.asia-scene__label` = x=274, w=893 (selebar
   kanvas) di y=254 — `left`/`top` tidak terpasang, teks menempel di tepi kiri kanvas
   ±600 px dari Jepang.
6. **Label bocor ke scene dekoratif.** Instance hero ikut merender label, padahal hero
   `decorative` dan tidak boleh interaktif.
7. **Chip berbingkai** pada `.landing-invitation__label` melanggar larangan kartu (D30).
8. **Benua masih terbaca datar.** Ekstrusi 1,8 unit tidak menghasilkan relief yang terlihat;
   tidak ada bayangan directional maupun hierarki terang-gelap. `r3-hover-projected.png`
   terbaca sebagai peta vektor berwarna, bukan objek 3D.
9. **Konteks mengotori bingkai.** Context abu-abu menyertakan Afrika timur, Jazirah Arab,
   Eropa timur, dan pulau lepas (Madagaskar/Comoros) di tepi kiri.
10. **Jepang nyaris tak terbaca** pada 1440 (sliver ±14 px) meski labelnya aktif.

## Halaman negara — putaran 2 (bukti `art-jp-1440.png`, `art-sa-1440.png`)

1. **Siluet ganda.** `CountryPage.tsx:59` (`CountrySilhouette`) dan `:62`
   (`CountryPortrait`) menggambar outline negara yang sama dua kali.
2. **Sapaan ganda.** `:63` (`ScriptSpecimen`) dan `:64` (`GreetingBlock`).
3. **Penanda berbingkai.** "Lengkap" dirender sebagai chip berbingkai, melanggar aturan
   tanpa-kartu.
4. **Caption yatim.** Nama asli diletakkan jauh dari bentuk yang diberi nama (Arab Saudi:
   caption di bawah siluet kanan atas, judul besar di kiri).
5. **Kontur palsu.** Efek topografi hanya lima stroke identik pada path yang sama, bukan
   garis offset; terbaca sebagai outline tebal.
6. **Ruang mati.** Dokumen sangat tinggi dengan pita kosong besar; zona margin kanan
   kosong sementara locator terlalu besar relatif informasinya.

## Landing — putaran 2 (bukti `r2-1440x900-050.png`, `r2-1440x900-100.png`)

1. **Triptych belum jadi.** Di 50% hanya dua aksara terlihat (Arab + Korea); Thai keluar
   layar. Ada dua pasang garis warna (hijau + biru) dengan panjang tak sama yang terbaca
   sebagai sisa, bukan desain.
2. **Indeks kehilangan penanda kejujuran.** Klaim lane "honesty marker intact" tidak
   terlihat di tangkapan; 15 nama tampil tanpa Lengkap/Penjelajahan.
3. **Pita kosong** ±250 px di atas judul kaki halaman, plus siluet terpotong di tepi atas.
4. **Popup masih modal kartu** (`CountryDialog.tsx`) — belum editorial, belum memenuhi D30.

## Landing — putaran 3 (13dca3d), hasil ukur sendiri

Bukti: docs/VERIFY_LANDING/r3v-00-preloader.png, r3v-030.png, r3v-040.png, r3v-050.png, r3v-dialog.png; skrip tmp-landing-check.mjs.

1. **Preloader tidak terpasang.** Preloader.tsx ada, App.tsx tidak mengimpornya. Pada t=120ms jumlah elemen [class*="preloader"] = 0; html[data-ready] = null setelah 4 detik.
2. **Intro hero tidak ada.** Grep asiakin:ready hanya menemukan pengirim di Preloader; tidak ada listener di seluruh src.
3. **Penanda kejujuran nol.** body.innerText setelah scroll penuh: 'Lengkap' = 0, 'Penjelajahan' = 0.
4. **Triptych 2 dari 3.** r3v-050.png: hanya Arab dan Korea; Thai tidak dirender. Dua garis warna (olive, biru) masih ada di y=278.
5. **Viewport kosong.** r3v-040.png: seluruh bidang kosong kecuali potongan '- Badan Bahasa' terpotong di tepi atas.
6. **Em dash.** '- Badan Bahasa' dan '— Badan Bahasa' muncul sebagai pemisah (melanggar D30).
7. **Dialog berpanah.** Teks: 'Jelajahi Jepang →'; panel 418x343 px.
8. **Label hover ganda.** .landing-invitation__label (chip berbingkai) dan .asia-scene__label tampil bersamaan.

