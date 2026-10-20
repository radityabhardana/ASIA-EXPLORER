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

## Bevel tepi atas

`tools/build-asia.py` menambahkan chamfer satu segmen pada rim atas tiap negara
(`BEVEL_WIDTH_RATIO = 0.10` dari tinggi ekstrusi, `BEVEL_WEIGHT_ATTR = "bevel_top"`).
Rim ditandai lewat edge attribute, jadi hanya tepi atas yang di-bevel; tepi bawah
tidak terlihat dan kalau ikut di-bevel jumlah triangle naik ~2x.

`use_clamp_overlap = True` membatasi lebar chamfer sesuai jarak vertex garis pantai.
Pada data 1:50m dengan tolerance 0.03 (≈1,9 km), jarak antar vertex rim ~0,01–0,05 unit,
sehingga lebar efektif ter-clamp ke ~0,001–0,028 unit (bukan 0,18–0,60). Artinya chamfer
ada secara geometri tapi praktis tidak terlihat pada skala peta penuh.
