# Asia Explorer: Roadmap Build Website Dinamis, Awal sampai Akhir

Disusun oleh Claude, 23 Oktober 2026. Dokumen ini menggabungkan PRD v2.3, PLAN_LANDING, DECISIONS_R3, audit dan rencana putaran 4, serta spesifikasi dashboard terbaru. Semua estimasi waktu adalah perkiraan kasar untuk satu pengembang yang bekerja dengan AI agent, bukan janji; angka asli baru terlihat setelah Fase 1 selesai. Harga, batas gratis, dan kebijakan layanan pihak ketiga di bawah belum diverifikasi hari ini dan harus dicek saat memilih.

---

## 0. Cara Membaca Dokumen Ini
- **Fase** adalah satu blok pekerjaan dengan gerbang lulus. Fase berikutnya tidak dimulai sebelum gerbang sebelumnya lulus dengan bukti nyata (screenshot yang dibaca ulang, keluaran perintah mentah).
- **Rilis (M1 sampai M4)** adalah titik di mana situs boleh dilihat publik. Tiap rilis berguna sendiri, jadi tidak perlu menunggu semuanya selesai.
- **Jalur kritis**: yang paling lambat bukan kode, melainkan konten bersumber dan terjemahan 15 negara. Mulai riset konten sekarang, paralel dengan kode.
- Istilah teknis dijelaskan di bagian 13.

---

## 1. Apa Itu Website Dinamis di Proyek Ini
Sekarang situs sebagian besar statis: konten negara berupa berkas JSON, tidak ada akun, tidak ada data pengguna. Versi akhir disebut dinamis karena:
1. **Akun**: pengguna masuk dan daftar; halaman dashboard dijaga login.
2. **Data per pengguna**: progres, frasa tersimpan, jadwal ulas, hasil skenario, catatan budaya.
3. **Konten terstruktur**: negara, pelajaran, skenario dibaca dari data berskema, bukan ditulis di komponen.
4. **Dua bahasa**: Indonesia dan English dipilih pengguna.
5. **Logika berjalan**: mesin tugas berikutnya, jadwal ulas berjarak, evaluasi skenario, dan (fase akhir) analisis AI lewat server.

---

## 2. Status Sekarang
| Area | Status | Catatan |
|---|---|---|
| Landing, 3D benua, popup | Ada, sedang diperbaiki | Medan cokelat putaran terakhir ditolak (tepi persegi, butiran melayang). Aturan perbaikan sudah diberikan. |
| Navbar dan pengalih bahasa | Ada, perlu direvisi | Wordmark ganda dihapus, tombol Daftar diubah ke teks editorial. |
| Halaman negara | Ada, teks saja | Tanpa gambar, Cerita berupa daftar fakta, ada penanda Perlu verifikasi. |
| Konten 15 negara | Seed ada, 10 Lengkap dan 5 Penjelajahan | Belum terverifikasi sumber (OI-L2). |
| Dua bahasa | Kerangka baru dimulai | Konten belum dua bahasa. |
| Akun, dashboard, quest, AI | Belum ada | Spesifikasi dashboard sudah ditulis; penyedia autentikasi belum dipilih (OI-L3). |
| Hosting, domain | Belum | OI-L1. |

---

## 3. Arsitektur Target
| Lapisan | Pilihan yang disarankan | Alasan | Verifikasi sebelum pakai |
|---|---|---|---|
| Antarmuka | React, Vite, TypeScript (sudah ada), React Router | Sudah berjalan; tidak perlu dibangun ulang | Tidak ada |
| Gerak dan 3D | Three.js, GSAP ScrollTrigger, Lenis | Sesuai PRD D7; Lenis dan GSAP dalam satu ticker | Ukuran chunk 3D di bawah 350 KB gzip |
| Bahasa | Pustaka i18n ringan, kamus ID dan EN | Satu sumber teks UI | Tes paritas kunci |
| Data lokal | IndexedDB lewat Dexie | Progres dan frasa tersimpan di perangkat | Kebijakan penghapusan data Safari iOS |
| Backend | Layanan terkelola: Postgres, autentikasi, aturan akses per baris (RLS), fungsi server. Kandidat: Supabase. Alternatif: Firebase, atau server Node sendiri. | Cocok untuk pemula, tidak perlu mengelola server; RLS menjaga data tiap pengguna | Harga, batas gratis, wilayah server terdekat (Singapura atau Jakarta jika ada) |
| Server tipis (BFF) | Fungsi server di penyedia yang sama | Menyimpan kunci Gemini dan membatasi laju; klien tidak pernah memegang kunci | Batas waktu eksekusi fungsi |
| Validasi | Zod untuk skema konten dan permintaan API | Satu skema dipakai klien dan server | Tidak ada |
| Hosting statis | Cloudflare Pages atau Vercel | Hosting statis plus CDN gambar | Harga, lokasi edge untuk Indonesia |
| Gambar | AVIF dan WebP hasil pipeline sendiri | Legal dan ringan | Lisensi per foto |
| Tes | Vitest, Playwright, axe-core, Lighthouse CI | Cakup unit, e2e, aksesibilitas, performa | Tidak ada |
| Pemantauan | Pelacak galat (misalnya Sentry) dan analitik ramah privasi (misalnya Plausible atau Umami) | Tahu bug dan pemakaian tanpa melacak pribadi | Harga dan opsi hosting sendiri |

**Prinsip yang tidak boleh dilanggar**: kunci rahasia hanya di server; tidak ada endpoint yang menerima prompt bebas; progres hanya tampil jujur (x dari y); konten tanpa sumber tidak rilis; tema terang; tanpa XP, leaderboard, dan lencana.

---

## 4. Peta Rilis dan Jalur Kritis
| Rilis | Isi | Fase | Perkiraan akumulatif |
|---|---|---|---|
| **M1 Situs Publik** | Landing sinematik, 15 halaman negara berfoto, popup carousel, ID dan EN, bagian dashboard bertanda Segera hadir | 0 sampai 4 | 7 sampai 10 minggu |
| **M2 Akun dan Dashboard Inti** | Masuk dan daftar, dashboard, mesin tugas berikutnya, Phrase Vault dan ulas berjarak | 5 sampai 7 | tambah 6 sampai 8 minggu |
| **M3 Belajar Penuh** | Pelajaran, skenario budaya bercabang, ledger kompetensi, ekspor dan impor, sinkronisasi | 8 sampai 9 | tambah 5 sampai 7 minggu |
| **M4 Analisis AI** | Gemini lewat server, persetujuan, fallback lokal | 10 | tambah 2 sampai 3 minggu |
| **Peluncuran** | Hardening, legal, beta, rilis | 11 | tambah sekitar 2 minggu |

Total perkiraan: sekitar 22 sampai 30 minggu. M1 sudah layak diluncurkan sebagai situs penjelajahan tanpa akun, jadi disarankan soft launch di M1 untuk mengumpulkan umpan balik sebelum membangun backend.

---

## 5. Roadmap per Fase

### Fase 0: Fondasi dan Keputusan (3 sampai 5 hari)
Tujuan: tidak ada pekerjaan yang dibangun di atas keputusan yang belum jelas.
- Jawab keputusan K1 sampai K6 dan D7 sampai D12 (bagian 11).
- Tulis PRD v2.4 (atau delta): rute `/negara/:id`, benua mesh menggantikan globe, navbar diizinkan, foto diizinkan, aturan tanpa kartu hanya melarang kotak berbingkai, dashboard dan AI masuk lingkup.
- Rapikan repo: struktur `src/{app,scene,sections,pages,content,i18n,lib}`, `.env.example`, aturan rahasia (tidak ada kunci di repo), cabang `main` dan `staging`.
- Siapkan CI: typecheck, lint, vitest, playwright, build-content --check, fetch-images --check, check-contrast, build-themes --check.
- Pasang hosting staging dan pemantauan galat.
- Perbarui aturan verifikasi: scroll bertahap, bukan tangkapan full-page.
**Gerbang**: CI hijau pada main; PRD v2.4 disetujui; staging dapat diakses.

### Fase 1: Landing Stabil dan Sinematik (1 sampai 2 minggu)
Tujuan: layar pertama yang menahan orang.
- Tutup temuan L1 sampai L8 dari audit: kanvas terpotong, mobile, scene tidak terpusat, peta 2D di Skala, tumpang tindih Asia Tenggara, label hover berhalo dan tidak patah.
- Medan dataran: panggung bertingkat dengan pemudaran radial ke warna kertas (aturan perbaikan terakhir). Batas 2 putaran; bila gagal pakai cakram datar dan lapisan kontur SVG berparallax.
- Drone intro: orbit kamera 3,4 detik ke pose hero, sekali per sesi, tidak memuat LCP.
- Placeholder SVG yang sama komposisinya lalu crossfade, sehingga tidak ada loncatan.
- Navbar: Jelajah, Dashboard, Negara; ID/EN, Masuk, Daftar sebagai teks; diam di puncak halaman; satu wordmark (H1).
- Tipografi baru dan hook; hapus scene Setiap negara punya caranya sendiri, kalimat daftar di bawah halaman, dan blok Sumber data dari landing.
**Gerbang**: tidak ada tepi lurus di kanvas pada 375, 768, 1440; tiap scene mengisi minimal 70 persen tinggi viewport; hover 8 negara dalam 600 ms tanpa kedipan; LCP elemen teks; reduced-motion statis; 0 galat konsol.

### Fase 2: Gambar dan Interaksi Negara (1 sampai 2 minggu)
- Pipeline gambar `tools/fetch-images.mjs`: hanya dari Wikimedia Commons lewat API, daftar izin lisensi (CC0, domain publik, CC BY, CC BY-SA), simpan penulis dan lisensi, AVIF dan WebP tiga ukuran, warna dominan, teks alternatif dua bahasa, `--check`.
- Popup dua panel: carousel foto yang bisa digeser (sentuh, drag, panah keyboard) dan ringkasan dengan aksi Lanjut; FLIP dari posisi negara; lembar bawah di mobile; fokus terperangkap dan kembali ke pemicu.
- Galeri 15 negara berfoto di bawah landing: mosaik penuh tanpa bingkai, tiap ubin tautan yang bisa difokus.
- Kredit foto sebagai keterangan kecil.
**Gerbang**: semua lisensi lolos; setiap foto punya alt dua bahasa; bobot maksimal 600 KB AVIF per negara; uji keyboard (Tab, Enter, Escape, panah); uji swipe di perangkat sentuh nyata.

### Fase 3: Halaman Negara v2 (2 minggu kode, konten paralel)
- Template: hero foto, Cerita, Budaya, Orang, Bahasa, Galeri, Referensi (dilipat).
- Tema per negara (warna rendah-kroma dari foto hero, aksen, gradien dan kontur dari siluet). Tanpa motif budaya.
- Transisi dari popup: foto aktif menjadi hero (View Transitions API, fallback fade).
- Grid 12 kolom, teks 68ch, sidebar sticky, tombol Kembali besar.
- Konten (paralel, penulis konten): tulis ulang Cerita sebagai adegan 120 sampai 180 kata dengan sumber nyata; Budaya dan Orang masing-masing tiga butir (norma dan sebabnya); Bahasa dengan sapaan dan tiga frasa; hapus penanda Perlu verifikasi hanya setelah diverifikasi.
**Gerbang**: 15 halaman x 3 lebar lolos kontras per tema; 0 konten tanpa sumber; tinggi dokumen tidak ada pita kosong lebih dari 120 px; tes Lighthouse mobile terukur dan dilaporkan.

### Fase 4: Dua Bahasa (1 sampai 2 minggu kode, terjemahan paralel)
- Kamus `id.json` dan `en.json`; URL `/en/...`; `<html lang>`; hreflang; judul halaman dua bahasa.
- Skema konten `{ id, en }` per bidang; nama negara mengikuti eksonim tiap bahasa; aksara dan romanisasi tidak diterjemahkan.
- Tes paritas: build gagal bila kunci hilang. Konten yang belum diterjemahkan tampil dalam Indonesia dengan penanda jelas; tidak ada terjemahan mesin diam-diam.
- Terjemahkan 10 negara Lengkap dulu; 5 negara lain menyusul.
**Gerbang M1**: tinjau penutur asli untuk klaim sensitif; semua gerbang fase 1 sampai 3 tetap hijau di EN; staging diuji oleh 5 orang di luar tim; rilis M1 (soft launch).

### Fase 5: Fondasi Backend dan Akun (1 sampai 2 minggu)
Prasyarat: keputusan K5 dan penyedia autentikasi (OI-L3).
- Proyek backend di wilayah terdekat; skema dasar; RLS aktif di semua tabel milik pengguna; pengujian kebijakan RLS (pengguna A tidak bisa membaca data B).
- Autentikasi: daftar, masuk, keluar, verifikasi email, atur ulang kata sandi; pembatasan percobaan; sesi aman.
- Penjaga rute untuk semua halaman dashboard; tidak ada akun demo.
- Halaman Masuk dan Daftar bertema, dua bahasa, aksesibel; pesan galat jelas.
- Halaman privasi dan persetujuan dasar.
**Gerbang**: uji RLS lulus; uji penetrasi dasar (akses tanpa token ditolak); alur daftar sampai masuk diuji e2e; security-reviewer lolos untuk fase ini.

### Fase 6: Dashboard Inti (2 sampai 3 minggu)
- Header konteks: negara fokus (nama, aksara asli, siluet atau bendera SVG berlisensi), progres jujur x dari y, pemilih negara (15, tidak menghapus riwayat), profil, sesi, status penyimpanan, keluar.
- Mesin tugas berikutnya: tabel keputusan deterministik. Usul urutan: Lanjutkan (ada sesi tergantung) lalu Ulas (frasa jatuh tempo mencapai ambang, misalnya 3) lalu Pelajaran baru lalu Cerita lalu Tuntas. Satu tugas saja yang tampil. Uji unit untuk setiap kombinasi.
- Keadaan kosong, memuat, dan galat yang jujur (tidak ada halaman kosong).
- Navigasi dari benua 3D ke dashboard dan kembali.
**Gerbang**: tabel keputusan 100 persen tercakup tes; dashboard berfungsi tanpa jaringan setelah dimuat (data lokal); keyboard dan pembaca layar lolos axe tanpa pelanggaran serius.

### Fase 7: Phrase Vault dan Ulas Berjarak (2 minggu)
- Simpan frasa dari halaman negara dan pelajaran: aksara asli, romanisasi, arti, label situasi (formal, kasual, hormat), audio.
- Mesin ulas: kotak Leitner lima tingkat (misalnya 1, 3, 7, 16, 35 hari), kembali ke tingkat 1 saat Ulas lagi; interval disetel setelah ada data nyata. Waktu dihitung dari tanggal lokal.
- Antarmuka ulas cepat: kartu buka-tutup dengan dua tombol Ingat dan Ulas lagi; sesi 2 menit.
- Audio: rekaman berlisensi untuk frasa inti; suara sintesis hanya cadangan dan tombol disembunyikan bila tidak tersedia.
**Gerbang M2**: uji unit mesin jadwal (batas hari, zona waktu, ganti tanggal); uji data tidak hilang saat refresh dan tutup tab; rilis M2 (beta tertutup).

### Fase 8: Pelajaran dan Skenario Budaya (3 minggu kode, konten paralel)
- Mesin pelajaran: langkah bertahap, titik pemulihan (Langkah 3 dari 6), progres jujur.
- Mesin skenario bercabang: simpul, pilihan, konsekuensi, umpan balik berisi alasan budaya. Setiap alasan budaya wajib bersumber.
- Cultural Field Notes: butir etika yang terbuka otomatis masuk buku saku.
- Ledger kompetensi: daftar keterampilan terverifikasi dengan status Belum, Sedang dilatih, Tuntas; riwayat aktivitas; salin atau cetak ringkasan.
- Konten: minimal dua pelajaran dan satu skenario per negara Lengkap; negara Penjelajahan tidak menampilkan tombol belajar.
**Gerbang**: tiap skenario punya jalur yang dapat diselesaikan dan teruji; tidak ada klaim budaya tanpa sumber; peninjauan sensitivitas oleh penutur asli.

### Fase 9: Kedaulatan Data dan Sinkronisasi (1 sampai 2 minggu)
- Ekspor dan impor JSON dengan versi skema dan validasi; impor tidak merusak data yang ada (gabung atau ganti dengan konfirmasi).
- `navigator.storage.persist()`, indikator penyimpanan, pengingat cadangan.
- Reset progres per negara dan hapus semua data dengan konfirmasi dua langkah.
- Sinkronisasi: unggah perubahan ke server dengan strategi konflik yang jelas (terakhir menang per bidang atau gabungan), uji dua perangkat.
- Hapus akun: menghapus data server dan memberi unduhan terakhir.
**Gerbang M3**: uji kehilangan data, uji dua perangkat, uji impor berkas rusak; rilis M3.

### Fase 10: Analisis AI (2 sampai 3 minggu)
Prasyarat: keputusan K6 dan kunci Gemini beserta hosting server (OI-L4).
- Skema attempt terstruktur: jawaban, waktu, jumlah percobaan, pola kesalahan; tanpa data pribadi.
- Fungsi server menerima ringkasan attempt saja, memanggil model, memvalidasi keluaran sebagai JSON berskema, mengembalikan analisis dan satu rekomendasi langkah.
- Persetujuan eksplisit sebelum data dikirim; menolak berarti analisis deterministik lokal, bukan halaman kosong.
- Batas: satu panggilan per attempt, timeout 8 detik, fallback lokal saat gagal, pembatasan laju per pengguna, pemantauan biaya.
- Tidak ada endpoint yang menerima prompt bebas dari klien; prompt berupa templat tetap di server.
**Gerbang M4**: security-reviewer lolos; uji tanpa kunci tetap berfungsi dengan fallback; uji injeksi prompt lewat teks jawaban; kunci tidak ditemukan di berkas bundel; rilis M4.

### Fase 11: Hardening dan Peluncuran (sekitar 2 minggu)
- Keamanan: tinjauan penuh, CSP, CORS ketat, pembatasan laju, rotasi rahasia, uji backup DB.
- Aksesibilitas: audit keyboard & screen reader, kontras, zoom 200%.
- Performa: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1, JS awal <= 180 KB gzip, 3D chunk <= 350 KB gzip.
- Legal: Kebijakan privasi selaras UU PDP No. 27/2022.
**Gerbang Peluncuran**: Semua gerbang 1-10 hijau di produksi, rollback diuji.

---

## 6. Model Data
- **Konten** (publik, read-only): `countries`, `country_content`, `images`, `phrases`, `lessons`, `lesson_steps`, `scenarios`, `scenario_nodes`.
- **Pengguna** (RLS protected): `profiles`, `lesson_progress`, `saved_phrases`, `scenario_attempts`, `field_notes`, `competencies`, `consents`, `ai_analyses`.

---

## 11. Daftar Keputusan Terbuka
| # | Keputusan | Dibutuhkan sebelum | Rekomendasi |
|---|---|---|---|
| **K1** | Info sumber data: hapus dari landing, simpan di halaman negara (Referensi dilipat) | Fase 1 | Ya, sesuai permintaan |
| **K2** | Gambar hanya dari Wikimedia Commons lewat API; tidak scrape situs lain | Fase 2 | Ya |
| **K3** | Navbar diam di puncak halaman (position absolute, scrolls away) | Fase 1 | Ya |
| **K4** | Dua bahasa, terjemahan bertahap mulai 10 negara Lengkap | Fase 4 | Ya |
| **K5** | Data lokal dulu dengan akun opsional, atau akun plus server sejak awal | Fase 5 | Lokal dulu, sinkronisasi di Fase 9 |
| **K6** | Analisis AI: ditunda ke M4 | Fase 6 | Ya |
| **D7** | Penyedia backend dan autentikasi (OI-L3) | Fase 5 | Supabase (Postgres + RLS + Auth) |
| **D8** | Hosting dan domain (OI-L1) | Fase 0 | Cloudflare Pages atau Vercel |
| **D9** | Audio pengucapan: rekaman berlisensi atau sintesis | Fase 7 | Rekaman untuk frasa inti, sintesis cadangan |
| **D10** | Bendera: set SVG berlisensi atau siluet | Fase 6 | Siluet sudah ada; bendera opsional |
| **D11** | Analitik: ramah privasi, atau tanpa analitik | Fase 11 | Ramah privasi (Plausible / Umami) |
| **D12** | Penutur asli atau pakar untuk tinjauan konten | Fase 3 | Wajib untuk klaim sensitif |
