# OPEN_DEFECTS.md — cacat yang belum tertutup

Diperbarui: 22 Oktober 2026. Setiap butir punya bukti visual dan angka. Hapus butir
hanya setelah tangkapan layar baru membuktikan hilang.

---

## Putaran 5 — audit 21 Okt (`docs/AUDIT_2026-10-21.md`), status terukur

Semua angka di bawah diukur sendiri lewat Playwright (`scripts/audit-p2.mjs`,
`scripts/audit-p3.mjs`) pada server bersih, 1440x900 / 768x1024 / 375x812, gulir bertahap
60 langkah. Klaim lane yang tidak cocok dengan gambar dicatat sebagai cacat tersendiri.

**Tutup — P0 (bukti angka):**

1. **Orientasi.** `projected()` di 1440: Jepang x=943,9 > Arab Saudi x=355,6; Indonesia
   y=647,5 > Tiongkok y=382,0. North-up, tanpa rotasi. Gate regresi masuk `e2e/gates.spec.ts`.
2. **Kedip SVG.** `AsiaSceneLazy` merender placeholder 3:2 + `data-state`, WebGL absen /
   chunk error / timeout 5 s jatuh ke `CountryMapSvg`. Preloader ≤1200 ms, sekali per sesi.

**Tutup — P1 (bukti angka, 1440):** tinta benua 884,8 px = **61,44vw** (target 62±3);
tinta top 299,4 / bottom 749,6 → pusat **58,3%** (target 58%); wordmark left 48 / top 40,
tagline bottom 150,8; dataran 144→1296, bibir atas 185 (34 px di bawah tagline);
0 error konsol. 768: tinta 76,2vw, pusat 56,8%. 375: tinta 83,9vw, pusat 54,5%, tanpa overflow.

**Tutup — P3 sebagian (diukur):** kolom teks `/negara/jp` 1440 = x 48→588,7 (**540,7 px**
= 68ch); urutan blok Cerita → Budaya → Orang → Bahasa → Sumber; kontras stroke locator
5,47:1 (ambang 3:1); tidak ada overflow horizontal di 375/768/1440; celah antar blok ≤65 px.

**Tutup — P2 (diukur sendiri, 1440):** grid `.landing-stage` 48 px di 8 adegan, blok rata
kiri (hero, scale, script, footer) di x=48,0; counter satu sumber (tabel 0/0, 4/4, 9/9,
13/13, 15/15, 15/15 counter === menyala); tabrakan headline ∩ siluet = 0 px²; peta scene 2
bermargin kanan 48 px; celah vertikal scene 3 maksimum 16 px; footer "Sumber data" 18 px,
30 tautan per negara, mark "Asia Explorer".

**Tutup — P2 sisa (putaran 2.2, diukur ulang sendiri):**

3. **Ikon scene 6 melayang** → ikon kini emblem inline 28x28 di dalam baris caption, 12 px
   di kiri nama; `iconTr` 48–76 x 732–760, `iconTh` 768–796 x 732–760, keduanya di dalam
   bbox caption masing-masing.
4. **Scene 6 dua gumpalan di tepi** → diptych 1440: Col A 48→672, Col B 768→1392 (gutter
   96), siluet TR 390x380 (l 48..555), TH 308x400 (l 926..1234), tinggi selisih 20 px,
   caption sebaseline `bottom 760,0` (selisih 0,0), headline 110→181 tanpa tabrakan
   (0 px²), celah bawah 140.
5. **Kaki halaman terpotong** → `.landing-stage--footer` kini `height:auto; overflow:visible`.
   Diukur pada gulir maksimum: 1440 `scrollHeight 1000 = clientHeight 1000` (tombol terakhir
   bottom 776,9, mark 835,5 dari 900); 768 `1203 = 1203` (901,5 / 960,1 dari 1024);
   375 `2165 = 2165` (689,5 / 748,1 dari 812), `scrollWidth === innerWidth`, horizontal
   overflow false. Catatan: di 375 lima belas tombol tidak mungkin tampak serentak (stage
   2165 > viewport 812) — yang diuji adalah keterjangkauan, bukan keserentakan.

**Tutup — P2.3 (ditemukan sendiri setelah 2.2, diukur ulang setelah perbaikan):**

6. **375/768: isi adegan tidak terlihat saat adegan di layar.** Sebab: satu ScrollTrigger
   global dengan `SCENE_RANGES` pecahan vh desktop (cultural 620/920 = 0,674); di 375
   dokumen 8986 px sehingga 0,674 jatuh di y≈5510 — 476 px setelah tepi atas section 5034.
   Kini jendela reveal diturunkan dari `offsetTop`/`offsetHeight` nyata dan dibangun ulang
   pada resize/pergantian breakpoint. Diukur di `copyTop = 160` pada 375: scale 1/1 (778),
   language 1/1 (1939), script 1/1 (2775), regional 1/1 (4392), cultural 1/1 (4947),
   invitation 1/1 (5947) — copy dan seluruh `[data-reveal]` sudah 1,00. Gate negatif
   (copy <0,05 saat section menutup ≥60% viewport) 0 pelanggaran di 375 dan 768.
7. **375: separuh isi scene 6 hilang dan bocor ke kiri.** Kini kedua layer tampil:
   TR left 16 / top 248 / 217,5×211, TH left 171,5 / top 511 / 187,5×322,5; tabrakan judul
   0 px² pada dua layer; caption kiri 16 (375) dan 24 (768). Gate cultural mobile menyertainya
   di `e2e/gates.spec.ts` (reveal mobile, reveal negatif, cultural mobile).

**Bukan cacat — peta regional di 375 (keputusan desain, bukan kehilangan isi).** Adegan 5
menampilkan tiga siluet (ID/TH/PH) pada ≤767 dengan bleed tepi (`--th left −6vw`,
`--ph right −6vw`). Adegan ini latar dekoratif tanpa label negara; 15 negara tetap lengkap di
indeks kaki halaman. Diverifikasi visual pada `docs/VERIFY/p2/orch3-regional-375-center.png`.

**Tutup — instruksi adegan undangan (copy):** "Arahkan kursor ke benua, atau tekan Tab untuk
daftar negara." tidak berlaku di layar sentuh. Diganti dengan kalimat netral perangkat:
"Sentuh atau arahkan kursor ke negara di benua, atau pakai daftar di bawah halaman."
Diukur 375: note 292 px, di dalam 16–359, tanpa overflow.

**Tutup — harness `e2e/scene-lab.spec.ts`:** `ready` menyala sebelum intro selesai, sehingga
klik pada proyeksi yang diambil terlalu dini bisa jatuh di laut (gagal sekali di pipeline
penuh). Kini tes menunggu proyeksi `jp` stabil (<0,5 px selama 120 ms) sebelum klik; suite
penuh `VERIFY_EXIT=0`.

**Tutup — P2 (putaran 2.1):** label sumber kini terbedakan ("Britannica · Hindi language"
vs "Britannica · India"; "Britannica · Mongol language" vs "· Mongolian languages"),
15 baris tanpa label ganda, judul "Rujukan 15 negara:" (klaim "primer" dicabut),
`FOOTER_SOURCES` dihapus.

**Tutup — copy 15 cerita:** ditulis ulang 131–156 kata per negara (dihitung dari
`src/content/countries.json`), pembuka konkret tanpa nama negara, istilah asing diberi gloss
("membungkuk (ojigi)", "ambang pintu (genkan)"), "Japonic" → "Japonik". Fakta diuji silang
dengan `docs/research/stories.json` untuk sg/my/jp (Pasal 153A, Perkara 152, empat bahasa
resmi, 15/30 derajat, genkan, tatami) — tidak ada angka atau klaim baru. Catatan:
`docs/research/stories.json` kini menyimpang dari teks final dan disimpan sebagai arsip riset.

**Tutup — P3 (diukur sendiri):** sidebar 1440 x 1032→1392 (tepi grid); 375 h1 top 116,2,
768 h1 top 124,7 (di atas lipatan); urutan visual back → hero → aside → body; tombol kembali
border 0 / radius 0 / 44 px; h2 hanya 5 (Lokasi bukan heading); tanpa overflow horizontal
di tiga lebar; kolom teks 540,7 px = 68ch.

**Bukan cacat (klaim saya sendiri yang salah):** hitungan teks "日本" = 2 di `/negara/jp`
bukan duplikasi nama; kemunculan kedua berasal dari `language.nativeName` "日本語".
Komponen `nameLocal` hanya dipakai sekali (`CountryHero.tsx:15-16`).

## Halaman negara — putaran 3 (ditutup putaran 5)

Kedua butir di bawah sudah tidak berlaku: grid kini satu kolom 68ch + sidebar sticky
(lihat "Tutup — P3" di atas, angka 540,7 px / sidebar 1032→1392). Bagian ini disimpan
sebagai catatan riwayat.

Bukti lama: `docs/VERIFY_COUNTRY/jp-1440-full.png` (1440), `docs/VERIFY_COUNTRY/sa-375-full.png` (375, **lulus**).

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

Bagian ini riwayat. Butir 2 dan 4 sudah ditutup di putaran 5 (tinta 61,44 vw; blok aksara
tiga kolom tanpa potongan) — lihat status putaran 5 di atas.

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

