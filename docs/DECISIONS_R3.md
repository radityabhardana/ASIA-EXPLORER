# DECISIONS_R3.md — aturan mengikat putaran 3

Tanggal: 21 Oktober 2026. Sumber: instruksi pengguna + pengukuran sendiri di browser.
Dokumen ini menambah, bukan menggantikan, `docs/DESIGN_LANDING_V4.md` §0.

---

## D28 — Nama wilayah muncul saat hover, bukan label permanen

Pengguna memilih "label saat hover saja". Label kawasan/negara tidak boleh menetap di
layar. Saat kursor mendekat, tampil nama Indonesia + nama asli + kawasan, mengikuti
pointer, tanpa kotak, tanpa panah, tanpa pemisah strip.

Pemetaan kawasan (klasifikasi geografis standar, bukan data karangan):

| Kawasan | Negara |
|---|---|
| Asia Tenggara | id, my, sg, th, vn, ph |
| Asia Timur | cn, jp, kr, mn |
| Asia Selatan | in |
| Asia Barat | sa, tr |
| Asia Tengah | kz, uz |

## D29 — Layar muat sebelum masuk situs

Ada loading awal sebelum landing tampil: tanda merek Asiakin + garis progres tipografis,
tanpa spinner generik, tanpa kartu, durasi mengikuti kesiapan aset nyata (model GLB siap
atau batas waktu), lalu keluar dengan transisi transform/klip. Wajib:
`prefers-reduced-motion` melewati animasi, tidak menahan LCP lebih dari 1,2 detik setelah
aset siap, dan tidak pernah muncul dua kali dalam satu sesi.

## D30 — Larangan global: kartu, strip pemisah, panah

Berlaku di landing dan halaman negara:

1. Tidak ada kotak kartu: tanpa bingkai penuh, tanpa isian latar, tanpa sudut membulat,
   tanpa bayangan panel. Pemisah memakai ruang, skala tipografi, dan hairline satu sisi.
2. Tidak ada strip `-` / `—` / `–` sebagai pemisah dekoratif.
3. Tidak ada glyph panah `→` `←` untuk "lanjut"/"kembali". Label teks biasa.

Pengecualian: tanda minus pada data angka nyata, dan hairline yang bukan pembungkus.

## D31 — Halaman negara bukan dinding teks

Halaman `/negara/:id` wajib punya modul visual yang diturunkan dari data peta
(`src/content/map-paths.json`), bukan foto stok:

1. Peta locator kawasan (negara aktif bertinta, tetangga pucat, gratikula, skala).
2. Potret negara: perlakuan kontur/hatch deterministik dari outline (bukan dot acak).
3. Spesimen aksara: sapaan asli ukuran besar, reveal transform/klip.

Data fiktif dilarang; hanya field yang ada di `countries.json`.

## D32 — Bug yang harus ditutup di landing (terukur)

1. Kartu aksara ketiga: kotak x=1066→1642 pada viewport 1440 (terpotong 202 px).
2. Indeks 15 negara dirender sebagai 15 tombol berbingkai 218x60 px di blok 920 px
   (melanggar D30, menyisakan ±500 px kosong).
3. Scene budaya 75%: headline menembus siluet Turki dan menimpa label "Turki — kopi
   Turki, cezve".
4. Benua tidak mengisi bidang: elemen 893x595 px, siluet hanya ±580 px.
5. Caption debug "Terpilih: - Hover: -" terlihat di tangkapan (melanggar D30).
6. Garis potong artifisial di tepi utara context landmass (lat 65).

## D33 — Verifikasi tidak boleh memalsukan bukti

Harness wajib menggulir bertahap dan menunggu scrub selesai sebelum memotret
(`e2e/landing.spec.ts`, commit `99a852c`). Tangkapan lama sempat merekam penghitung "0"
padahal nilainya 15.
