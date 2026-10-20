# SCENE_GEOMETRY.md — Kenapa geometri benua harus dibangun ulang

Tanggal: 21 Oktober 2026
Status: keputusan menunggu eksekusi (Blender), lane L6
Bukti: `docs/VERIFY_SCENE/scene-1440x900.png`, `docs/VERIFY_SCENE/scene-375x812.png`, `public/models/asia.manifest.json`, `tools/build-asia.py:41`, `tools/build-asia.py:60-75`

---

## Temuan dari tangkapan scene

1. **15 potongan, bukan benua.** Hanya negara di daftar PRD yang ada di geometri. Ruang
   Pakistan–Iran–Afghanistan, Laos–Kamboja, Bangladesh–Nepal–Bhutan, dan Rusia dibiarkan
   kosong, sehingga Arab Saudi dan India tampak terpisah jauh, Kazakhstan mengambang, dan
   Turki berdiri sendiri di kiri. Pada 62vw ini terbaca sebagai puzzle belum disusun,
   bukan sebagai Asia.

2. **Dinding ekstrusi terlalu tebal.** `EARTH_RADIUS = 100` (`tools/build-asia.py:41`),
   sedangkan tinggi ekstrusi 3,0–6,0 unit (`tools/build-asia.py:60-75`). Jadi tinggi
   dinding 3–6% lebar benua — di render ±900 px itu 30–50 px dinding gelap. Hasilnya
   benda seperti potongan triplek dicat, bukan peta timbul.

3. **Pulau-pulau jadi bilah.** Indonesia dan Filipina punya pulau selebar 1–2 px tapi
   diekstrusi 3,0–3,2 unit, sehingga yang terlihat adalah bilah vertikal tipis
   (x≈900–1200, y≈560–680 pada tangkapan 1440). Ini artefak, bukan karakter.

4. **Jarak antar-negara tetangga terlihat sebagai celah krem** karena tiap negara mesh
   terpisah dengan dinding sendiri-sendiri.

## Keputusan

**D21 — Benua butuh alas konteks, dan relief harus tipis.**

- Tambah **satu mesh `context`**: seluruh negara lain yang masuk bingkai peta
  (Natural Earth 1:50m, proyeksi LAEA 90°E/32°N yang sama), digabung jadi satu objek,
  **datar tanpa ekstrusi**, material netral `#E7E1D6` (≈4% lebih gelap dari `--surface`).
  Tidak bisa dipilih, tidak punya `extras.iso_a3`, tidak masuk manifest 15 negara.
- **15 negara PRD**: tinggi ekstrusi diturunkan ke **1,2 unit untuk negara kepulauan**
  (id, ph, my, sg, jp) dan **1,8 unit untuk negara daratan**, bukan 3,0–6,0. Dinding jadi
  ±1–2% lebar benua: relief masih terbaca, bilah hilang.
- Celah antar-tetangga ditutup oleh alas konteks: negara tetangga yang tidak ada di daftar
  PRD mengisi ruang di antaranya dengan warna netral, sehingga siluet Asia utuh dan 15
  negara PRD terbaca sebagai bagian yang disorot.
- Definisi tepi tetap `EdgesGeometry` + `LineSegments` (D13), bukan bevel.
- Bingkai peta dipotong di batas proyeksi supaya Rusia tidak mendominasi bagian atas:
  context hanya menyertakan geometri yang irisannya dengan bingkai ≥ 0,5 unit².

## Anggaran

| Metrik | Sebelum | Batas setelah |
| --- | --- | --- |
| Triangles | 35.472 | ≤ 60.000 (`scripts/verify-model.mjs`) |
| Ukuran GLB | 247,0 KB | ≤ 500 KB |
| Node | 15 negara | 15 negara + 1 `context` |

Context tidak butuh detail 50m: toleransi simplifikasi boleh 0,12 (tangga terakhir di
`TOLERANCE_STEPS`) karena tidak pernah dipilih dan selalu di belakang.

## Bukti yang harus dihasilkan lane

- `public/models/asia.glb` + `asia.manifest.json` baru, `npm run model:verify` exit 0,
  `npm run verify` exit 0.
- Tangkapan `/lab/scene` di 1440×900 dan 375×812: siluet Asia utuh, tidak ada bilah,
  tinggi dinding terukur ≤ 2% lebar benua (laporkan px), 15 negara tetap bisa dipilih
  lewat raycast (`extras.iso_a3`), context tidak pernah jadi target hover.
- Angka triangles/size sebelum–sesudah ditempel di laporan.
