# Sumber data aset peta

## Natural Earth 1:50m admin-0 countries

- URL: `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson`
- Tanggal unduh: 2026-10-21
- Ukuran: 3.083.490 byte
- SHA256: `3E458FC036AD0A66411F2C1E6CAC49C5D7BFB81CB1123BC513B22511A2B7FDEB`
- Lisensi: public domain (Natural Earth, <https://www.naturalearthdata.com/about/terms-of-use/>)
- Proyeksi asal: WGS84 (EPSG:4326), koordinat lon/lat

File GeoJSON **tidak di-commit** (lihat `.gitignore`: `assets/source/*.geojson`). Unduh ulang dengan:

```powershell
Invoke-WebRequest `
  -Uri 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson' `
  -OutFile 'assets/source/ne_50m_admin_0_countries.geojson'
```

Lalu cocokkan hash:

```powershell
(Get-FileHash assets/source/ne_50m_admin_0_countries.geojson -Algorithm SHA256).Hash
```

## Palet warna (opsional)

`assets/palette.json` berisi `{"cn": "#RRGGBB", ...}` (kunci = id internal, bukan ISO3).
Kalau file tidak ada, `tools/build-asia.py` memakai warna netral `#d9d6cf` dan mencatatnya di log.

## Negara yang dipakai

| ISO3 | id | Nama | Tinggi ekstrusi (placeholder) |
| ---- | -- | ---- | ----------------------------- |
| CHN  | cn | China | 6.0 |
| IND  | in | India | 5.4 |
| IDN  | id | Indonesia | 3.2 |
| JPN  | jp | Japan | 4.2 |
| KOR  | kr | South Korea | 3.6 |
| MYS  | my | Malaysia | 3.0 |
| PHL  | ph | Philippines | 3.0 |
| SGP  | sg | Singapore | 1.8 |
| THA  | th | Thailand | 3.8 |
| VNM  | vn | Vietnam | 3.4 |
| SAU  | sa | Saudi Arabia | 4.6 |
| TUR  | tr | Turkey | 4.4 |
| KAZ  | kz | Kazakhstan | 4.8 |
| UZB  | uz | Uzbekistan | 3.0 |
| MNG  | mn | Mongolia | 4.0 |

Tinggi belum ditetapkan desain; nilainya ada di `COUNTRIES` pada `tools/build-asia.py`.

## Keputusan: bevel tepi dibatalkan

Bevel satu segmen pada rim atas pernah dicoba (commit `96e0769`, di-revert di `6038ae7`)
dan dibatalkan karena tidak memberi efek visual sama sekali:

- Lebar yang diminta: 10% tinggi ekstrusi = **0,18–0,60 unit**.
- Jarak antar vertex garis pantai Natural Earth 1:50m pada tolerance 0.03 (≈1,9 km)
  hanya **0,01–0,05 unit**.
- `use_clamp_overlap` memotong lebar chamfer sampai **0,001–0,028 unit** (diukur dari
  selisih z vertex GLB; 0% vertex mencapai lebar penuh).
- Pada model selebar ~200 unit di viewport 1200 px, itu setara **0,02–0,15 px** — tidak terlihat.
- Biayanya tetap +18.320 triangle (35.472 → 53.792, +51,6%) dan +167 KB.

Kesimpulan: chamfer geometris tidak bisa terlihat pada kepadatan garis pantai 1:50m tanpa
menurunkan detail siluet secara drastis. Definisi tepi dikerjakan di three.js, bukan di aset:
`EdgesGeometry` + `LineSegments` untuk outline ±1,5 px, ditambah shading flat pada sisi.
