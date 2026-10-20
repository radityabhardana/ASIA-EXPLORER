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

## Landing — cacat terbuka (lane implementer, sesi `ses_ea4665641ffebFV6S3gjt5U7nf`)

1. Gulir 0 tanpa headline (H1 opacity 0).
2. Benua ±33vw; target 62vw desktop / 85vw mobile.
3. Penghitung berhenti di "0".
4. Kolom aksara ketiga terpotong tepi kanan; sapaan tanpa arti dan tanpa label bahasa.
5. Scene 75%: siluet terpotong, ikon 24 px melayang, headline menabrak bentuk.
6. Kaki halaman 80% kosong; belum ada indeks 15 negara.
7. `.landing-country-list` masih `position: fixed` (chrome menu) + tes unit mengunci
   larangan landmark navigasi.
8. Void 300–600 px di semua tangkapan.

## Scene — menunggu eksekusi

D21 di `docs/SCENE_GEOMETRY.md`: alas konteks datar + ekstrusi 1,2–1,8 unit. Belum
dijalankan karena dua lane berat sudah memakai kuota.
