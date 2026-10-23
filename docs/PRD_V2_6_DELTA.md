# PRD v2.6 — Delta Brief Pengguna (23 Okt 2026)

Dokumen ini **mengikat** dan melengkapi `docs/PRD_V2_5_DELTA.md`. Jika bertentangan, v2.6 menang.
Sumber: brief pengguna + 4 tangkapan layar (`hero`, `aksara`, `regional`, `footer/pilih negara`).

---

## 1. Keputusan baru (K7–K16)

### K7 — Intro kamera drone, bukan "dataran naik"
Setelah preloader selesai, kamera 3D memulai dari posisi luar-sumbu di ketinggian, **mengorbit ±120°** sambil turun perlahan, lalu mendarat tepat di framing hero kanonik (posisi akhir = frame yang dipakai gate L1).

- Durasi 2200–2800 ms, easing tunggal (tanpa bounce, tanpa overshoot).
- Dapat dilewati: scroll, klik, `Esc`, atau `Space` → langsung ke frame akhir.
- `prefers-reduced-motion: reduce` → tanpa orbit, langsung frame akhir.
- Tidak ada fade-to-black, tidak ada logo, tidak ada partikel.
- Animasi lama "permukaan naik dari bawah" **dihapus**.

### K8 — Latar berupa relief, bukan bidang datar
Bidang ellips pucat di bawah benua diganti **relief daratan** bergaya peta timbul:

- Warna tanah: coklat/oker (skala `--terrain-*` baru), bukan abu, bukan ungu.
- Ada perbedaan tinggi nyata (bukit/pegunungan dengan bayangan lereng), bukan tekstur cat.
- Geometri 3D sungguhan di bawah benua; tidak boleh menutupi siluet negara.
- Latar halaman tetap terang (off-white hangat). Relief menempati bidang bawah, bukan seluruh viewport.
- Dilarang: gradient mesh, glow, noise overlay, gambar latar raster.

### K9 — Hover = informasi, tanpa popup
Di scene 3D mana pun (hero, skala, invitation):

- Hover/fokus negara menampilkan **panel informasi** ringkas: nama negara, sapaan asli + romanisasi, nama bahasa, label kedalaman.
- Panel menempel pada sisi benua (bukan mengikuti kursor), tidak menutupi negara yang sedang disorot.
- Negara lain diredupkan; negara aktif tetap warna aslinya.
- **Tidak ada dialog/popup di landing.** Klik negara → langsung `navigate('/negara/:id')`.
- `CountryDialog` tidak lagi dipakai di landing. Tetap boleh dipakai di `/dashboard` bila diperlukan.
- Sentuh (mobile): tap pertama menyorot + menampilkan panel, tap kedua membuka halaman negara. Target sentuh ≥44×44 px.

### K10 — Navbar transparan, tidak menempel
- Posisi `absolute` di atas scene pertama; **hilang saat scroll** (bukan sticky, bukan fixed).
- Tanpa latar, tanpa border, tanpa bayangan, tanpa blur.
- Kiri: wordmark. Tengah/kiri: tiga tautan — **3D Scroll** (`#peta`), **Dashboard** (`/dashboard`), **Negara** (`/negara`).
- Kanan: pengalih bahasa (ID/EN) + **Masuk** (teks) + **Daftar** (satu-satunya aksi utama).
- Kontras teks ≥4.5:1 terhadap relief di belakangnya, diukur di 1440/768/375.
- Tinggi 64 px desktop, 56 px mobile; padding horizontal mengikuti grid 48/24.

### K11 — Dua bahasa penuh (ID/EN)
- Pengalih bahasa di navbar, ikon globe + label teks (bukan hanya ikon).
- Rute: `/` (ID) dan `/en` (EN), semua halaman punya padanan.
- Semua string dari kamus tunggal `src/content/i18n.ts`; tidak ada string ID yang tertinggal di komponen.
- Tes paritas kunci: jumlah dan nama kunci ID === EN; gagal build jika tidak.
- Pilihan bahasa disimpan di `localStorage` dan dihormati saat kembali.
- `<html lang>` ikut berubah.

### K12 — Scene aksara: marquee berjalan, tanpa kartu
- **Semua 15 negara** tampil, bukan tiga.
- Satu baris horizontal yang bergerak terus ke kiri, melingkar tanpa jeda (durasi satu putaran ±45 s).
- Tiap item: aksara asli (besar), nama bahasa, romanisasi. Tanpa bingkai, tanpa latar, tanpa sudut membulat, tanpa bayangan.
- Berhenti saat hover/fokus; item dapat difokus keyboard; `aria-live` tidak dipakai (dekoratif, tapi daftar lengkap tetap ada di DOM untuk pembaca layar).
- `prefers-reduced-motion` → dua baris statis yang membungkus, tanpa animasi.
- Tidak ada klaim jumlah yang tidak benar. Judul baru: **"Aksara yang bergerak"**, subjudul: "Limabelas negara, limabelas cara menuliskan sapaan."
- Foto tidak dipakai di scene ini.

### K13 — Scene regional: jelas, tidak menabrak
- Judul "Asia Tenggara, ratusan cara menyapa" **dihapus** (klaim tidak terverifikasi + membingungkan).
- Judul baru: **"Satu kawasan, enam negara"**, subjudul menyebut enam negara: Indonesia, Malaysia, Singapura, Thailand, Vietnam, Filipina.
- Siluet diberi label nama negara; tidak ada tumpang tindih judul ↔ siluet (0 px²).
- Siluet disusun satu baris dengan jarak antar-negara, bukan tumpang tindih dekoratif.

### K14 — Skip link bukan kartu
- "Lewati ke konten" hanya tampil saat `:focus-visible`, berupa **teks bergaris bawah**, tanpa latar, tanpa padding blok, tanpa sudut membulat.
- Tidak boleh menerima fokus otomatis saat halaman dimuat.
- Tidak ada elemen berwarna solid yang menempel di tepi kiri layar.

### K15 — Pemilihan negara lewat foto, bukan daftar teks
Blok "Pilih negara" (daftar teks 15 baris) diganti **mosaik foto**:

- 15 petak memakai `hero` dari `src/content/images.json` (AVIF, `srcset` 960/1600, `loading="lazy"` kecuali 3 pertama).
- Grid editorial tidak beraturan (variasi lebar/tinggi), tanpa border, tanpa radius, tanpa shadow; gambar menyentuh tepi petaknya.
- Tiap petak: nama negara + label kedalaman di atas foto; kontras dijaga dengan scrim tipis **hanya di area teks** (bukan card).
- Hover/fokus: zoom ≤1.04 dan garis bawah nama; klik → `/negara/:id`.
- Kredit lisensi satu baris di bawah mosaik bila ada foto `credit.required` (K1).
- Mobile 375: satu kolom, rasio 4:3, tetap tanpa card.
- Alternatif daftar tetap ada untuk pembaca layar (`<ul>` tersembunyi yang sama isinya).

### K16 — Dashboard di landing
- Navbar menautkan `/dashboard`, dan landing punya **satu blok ringkas** "Lanjutkan penjelajahan".
- Sudah punya profil: tampilkan progres lokal (negara dibuka, terakhir dilihat) dari IndexedDB + tautan "Buka dashboard".
- Belum punya profil: tampilkan satu kalimat + tombol "Buat profil lokal" (membuka dialog K17), tanpa angka palsu.
- Blok ini bukan kartu: teks + satu garis hairline + tautan.

### K17 — "Masuk / Daftar" = profil lokal, gerbang menuju dashboard
K5 tetap berlaku: tidak ada server, tidak ada kata sandi, tidak ada email.
Tujuan tombol ini jelas: **membuka `/dashboard`** yang berisi progres penjelajahan milik pengguna.

- Tanpa profil: `/dashboard` tidak merender isi; pengguna diarahkan kembali ke landing dengan dialog profil terbuka, plus satu kalimat "Dashboard menyimpan progresmu di peramban ini".
- Tombol "Masuk" dan "Daftar" sama-sama membuka dialog yang menyatakan terang-terangan: profil disimpan di peramban ini saja.
- Isi: satu kolom nama tampilan + tombol "Simpan profil". Tanpa kata sandi, tanpa verifikasi email.
- Setelah tersimpan: tombol berubah jadi nama pengguna + menu "Dashboard", "Ekspor data", "Impor data", "Hapus profil".
- Data: IndexedDB, `navigator.storage.persist()` diminta sekali, ekspor/impor JSON. Progres disimpan per `profileId`.
- Dilarang mengklaim "akun" atau "login" di UI; istilah yang dipakai "profil lokal".
- Struktur kode: satu `AuthProvider` dengan antarmuka `signIn(name)`, `signOut()`, `useProfile()`. Hari ini implementasinya lokal; jika nanti butuh akun server, hanya provider ini yang diganti, bukan halaman.

### K18 — Latar halaman hangat, bukan putih datar
- `--paper` bergerak dari off-white netral ke pasir hangat (sekitar `#f4ede1`), satu nilai, tanpa gradient.
- Relief coklat (K8) duduk di atas latar ini sehingga transisi langit→tanah tidak terlihat sebagai bidang datar.
- Kontras teks tetap ≥4.5:1; semua token dihitung ulang di `scripts/check-contrast.mjs`.
- Tidak ada tekstur noise, tidak ada vignette, tidak ada gambar latar.

---

## 2b. Dashboard nyata (K19–K22)

Brief pengguna 23 Okt: dashboard berisi pelajaran, materi per negara, quest, halaman hasil dengan nilai, dan optimalisasi belajar opsional. Spesifikasi lama hanya mencakup *teaser* dashboard di landing (docx Putaran 4 §6) dan kontrak quest+AI di `PRD_V2_3_DELTA.md` §6. Rinciannya ditulis di `docs/SPEC_DASHBOARD.md`.

### K19 — Dashboard nyata menggantikan teaser
Empat blok tetap, tapi berisi data nyata, bukan tiruan: (1) satu tugas berikutnya, (2) frasa yang jatuh tempo, (3) daftar negara + progres, (4) data & cadangan.
Label "Segera hadir" dihapus. Tanpa XP, streak, leaderboard, lencana, atau mata uang.

### K20 — Pelajaran dan quest
- **Pelajaran** per negara = 4 langkah berurutan: Kenali (2 kalimat), Etiket (3 aturan + sebab), Bahasa (sapaan + 3 frasa), Quest.
- **Quest** = 6 butir per negara: 3 pilihan ganda etiket (umpan balik menjelaskan sebab budaya), 2 memasangkan frasa, 1 skenario bercabang. Setiap butir punya `sourceRef` ke sumber yang sudah ada di `countries.json`.
- Hanya negara berlabel `Lengkap` (10) yang punya pelajaran+quest. `Penjelajahan` (5) menampilkan "Belum ada pelajaran" tanpa progres palsu.
- Butir quest tidak boleh menguji stereotip, bukan hafalan angka, dan tidak menanyakan hal yang tidak ada di materi.

### K21 — Skor dan halaman hasil
- Skor per attempt = butir benar / 6, ditampilkan sebagai `5/6` dan persentase; tanpa bintang, tanpa animasi count-up.
- Halaman hasil: `/dashboard/quest/:countryId/:attemptId` (halaman, bukan popup) berisi skor, waktu, dan review tiap butir (jawabanmu, jawaban benar, alasan).
- Dua aksi: "Ulangi yang salah" dan "Lanjut ke pelajaran berikutnya".
- Attempt disimpan di IndexedDB dengan `profileId`, `countryId`, `answers[]`, `startedAt`, `finishedAt`, `durationMs`.

### K22 — Optimalisasi belajar (opsional, deterministik dulu)
- Inti: Leitner 5 kotak (1, 3, 7, 16, 35 hari) untuk frasa; jawaban salah menurunkan kotak, benar menaikkan.
- Rekomendasi tugas berikutnya deterministik lewat tabel keputusan: Lanjutkan sesi tergantung → Ulas bila ≥3 frasa jatuh tempo → Pelajaran baru → Cerita → Tuntas.
- Analisis AI **mati secara bawaan**. Bila diaktifkan, hanya lewat server (BFF) dengan consent; tanpa server, dashboard memakai analisis lokal (pola kesalahan per jenis butir). Tidak ada API key di bundle klien.

---

## 3. Pemetaan ke tahap

| Tahap | Item |
|---|---|
| A (berjalan) | L1–L8, grid 48, reveal, reduced motion, hapus sumber |
| B | K7 intro drone, K8 relief coklat, K9 hover-informasi, K10 navbar, K11 kerangka i18n, K14 skip link, tipografi |
| D | K12 marquee aksara, K13 scene regional, K16 blok dashboard |
| E | Halaman negara: galeri foto `images.json`, kredit, 7 blok |
| F | K15 mosaik foto pemilihan negara + `/negara` index |
| G | Dashboard fungsional (IndexedDB, progres) |
| H | Audit akhir: gate 1–4 + aksesibilitas + performa |

---

## 3. Gate tambahan (masuk `e2e/round4-gates.spec.ts`)

5. **Intro**: bingkai akhir setelah intro identik dengan bingkai tanpa intro (delta piksel < 2%); intro selesai ≤2.8 s; `Esc`/scroll memotong intro.
6. **Navbar**: tidak menempel saat scroll (`position` absolute; `top < 0` setelah scroll 600 px); kontras ≥4.5:1; tiga tautan + pengalih bahasa ada.
7. **Marquee**: 15 item ada di DOM; posisi berubah antar 500 ms; berhenti saat hover; reduced motion → statis.
8. **Mosaik**: 15 petak, semuanya `<img>` dengan `srcset` AVIF, tanpa `border-radius` >0 dan tanpa `box-shadow`, `alt` terisi, tinggi tiap petak ≥180 px di 1440.

---

## 4. Larangan yang diperkuat

- Tidak ada kartu: larangan mencakup **blok berisi latar warna**, border, sudut membulat, bayangan, dan "chip/pill" untuk konten.
- Tidak ada angka yang tidak terverifikasi di judul ("ratusan", "ribuan").
- Tidak ada elemen dekoratif menempel di tepi viewport.
- Tidak ada popup di landing.
