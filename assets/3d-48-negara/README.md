# 3D 48 Negara

Snapshot 3D benua Asia berisi **48 negara**, diambil dari proyek
`C:\projects\IDN\eksplorerradit`. Nama internal: **"3D 48 Negara"**.

Status: **disimpan, belum diintegrasikan**. Tidak ada satu pun file aplikasi
Asia Explorer yang diubah. Folder ini ada di `assets/`, jadi tidak diproses
Vite, tidak ikut build, dan tidak tampil di website.

## Asal snapshot

| Item | Nilai |
|---|---|
| Repo sumber | `C:\projects\IDN\eksplorerradit` |
| Paket | `asia-explorer@0.1.0` |
| Branch | `main` |
| Commit | `f45536689df72d151faf2e08e5c301f0b3ff829f` |
| Tanggal commit | 2026-10-22 04:53:20 +07:00 |
| Diambil | 2026-10-27 |
| Kondisi | working tree sumber sedang dirty; snapshot memakai versi working tree |
| File sumber yang dirty | `src/three/environment.js`, `src/three/palette.js`, `src/views/explore.js`, `src/three/panel-map.js` (untracked), `src/styles/panel-map.css` (untracked) |

Hash SHA-256 tiap file ada di `SNAPSHOT.json`.

## Isi

```
src/data/asia-countries.geo.json   48 FeatureCollection (521 KB)
src/three/projection.js            Lambert azimuthal equal-area
src/three/countries.js             GeoJSON -> ExtrudeGeometry per negara
src/three/environment.js           renderer, scene, kamera, cahaya, tanah
src/three/camera-rig.js            tween kamera + pose overview
src/three/controls.js              OrbitControls + clamp target
src/three/labels.js                label CSS2D
src/interactions.js*               raycast hover/klik
src/three/palette.js               warna kertas, tinta, tone per wilayah
src/three/panel-map.js             varian mini untuk panel samping
src/views/explore.js               consumer asli: mount, UI, pencarian, quest
src/views/flat-map.js              fallback SVG saat WebGL mati
src/geo.js                         builder shape SVG (dipakai fallback)
src/styles/explore.css             layout halaman explore
src/styles/panel-map.css           layout panel mini
src/content/countries.js*          konten 48 negara (dipakai explore.js)
src/quests.js*                     quest + progres (dipakai explore.js)
scripts/prepare-asia.mjs           regenerasi GeoJSON 48 negara
```

`*` Bukan inti 3D, tapi diperlukan kalau `views/explore.js` mau dijalankan apa
adanya.

## Cara kerja 3D-nya

- **Tidak ada file GLB/GLTF.** Model dibentuk saat runtime dari GeoJSON:
  tiap ring polygon menjadi `THREE.Shape` (ring dalam menjadi hole), lalu
  di-`ExtrudeGeometry` dengan kedalaman `0.62`. Semua polygon satu negara
  di-merge menjadi satu mesh supaya raycast murah.
- Proyeksi: **Lambert azimuthal equal-area** manual, pusat `lon 49, lat 42`,
  lalu di-fit ke `mapSpan 118`. Utara mengarah ke `-z`.
- 48 negara, 5 wilayah: West Asia 18, Southeast Asia 11, South Asia 9,
  Central Asia 5, East Asia 5.
- Interaksi: hover raycast (throttle), klik vs drag, OrbitControls,
  label CSS2D, intro drop + animasi naik per wilayah.
- Fallback: `explore.js` memakai `flat-map.js` + `geo.js` untuk SVG 2D bila
  WebGL tidak tersedia.
- Runtime: `three@0.186.x`. Tidak ada tekstur untuk inti 3D. `bumi-2048.jpg`
  tidak disertakan karena hanya dipakai `src/art/satellite-map.js`, bukan
  scene ini.

## Jangan diintegrasikan dulu

Sesuai permintaan, snapshot ini sengaja belum disentuh:

- tidak ada import dari `src/` Asia Explorer
- tidak ada route, navbar, CSS, atau dependency baru
- tidak ada file di `public/`
- `git status` hanya menampilkan folder ini sebagai tambahan

`assets/` bukan folder yang di-serve Vite. Jadi menyimpan di sini aman dan
tidak akan bocor ke bundle produksi.

## Kalau nanti mau dipakai

Inti yang perlu dipindahkan adalah `src/three/*` + `asia-countries.geo.json`.
Alur mount aslinya ada di `src/views/explore.js`:

1. `createProjection()`
2. `createScene(container, labelsElement)`
3. `buildCountries(geojson, projection)`
4. `attachLabels(countries)`
5. `createControls(camera, canvas, worldHalf)`
6. loop: `animateCountries(countries, dt, hover, focus)`, `updateTweens(dt)`,
   render

Catatan integrasi:

- `explore.js` adalah vanilla JS dengan hash routing, bukan React. Untuk
  masuk ke Asia Explorer, lebih aman ambil `three/*` lalu bungkus di
  komponen React sendiri, bukan memanggil `mountExplore` langsung.
- `panel-map.js` adalah varian mini yang sudah punya sizing provider sendiri.
- Saat dipindah, wajib tambahkan cleanup: `renderer.dispose()`,
  `controls.dispose()`, hapus canvas dan label DOM, hentikan loop saat
  offscreen.
- Asia Explorer sekarang punya model 15 negara; snapshot ini 48 negara.
  Palet, label, dan data kontennya belum tentu cocok dengan `themes.json`
  atau `countries.json` yang ada.

## Verifikasi snapshot

- `asia-countries.geo.json`: 48 feature, 5 region, semua `properties.code`
  terisi.
- 18 file sumber, total sekitar 642 KB (belum termasuk README dan
  `SNAPSHOT.json`).
- Tidak ada perubahan di luar `assets/3d-48-negara/`.
