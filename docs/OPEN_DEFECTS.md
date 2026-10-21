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

## Scene — D21 sudah dieksekusi, cacat lanjutan terbuka

`85634b4` membangun ulang GLB: 16 node, 43.044 tris, 270,7 KB, 15 mesh ber-`iso_a3`,
`context` tanpa `iso_a3`, ekstrusi 1,2 (pulau) / 1,8 (daratan). Cacat yang masih terlihat
di `docs/VERIFY_SCENE/hero-1440-after.png`:

1. **Garis potong artifisial.** Context difilter `CONTEXT_BBOX` (`tools/build-asia.py:84-90`,
   lat maksimum 65) sehingga Rusia/Arktik terbelah lurus di tepi utara; terlihat sebagai
   garis horizontal di sekitar y≈292 pada 1440x900.
2. **Pulau masih terbaca bilah.** Ekstrusi 1,2 unit pada data 50m membuat dinding lebih
   tinggi daripada lebar pulau (id, ph, my, sg, jp).
3. **Benua tidak mengisi bidang.** Elemen `.landing-hero__scene` 893x595 px (62,0vw),
   siluet hanya ±580 px.
4. **Caption debug bocor.** "Terpilih: - Hover: -" tampil di tangkapan (melanggar D30).

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
