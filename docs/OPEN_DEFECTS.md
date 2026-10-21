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

## Scene — menunggu eksekusi

D21 di `docs/SCENE_GEOMETRY.md`: alas konteks datar + ekstrusi 1,2–1,8 unit. Belum
dijalankan karena dua lane berat sudah memakai kuota.
