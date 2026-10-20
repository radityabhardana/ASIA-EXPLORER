# PRD v2.3 DELTA — ASIAKIN (menggantikan bagian yang bertentangan di V2.1/V2.2)

Tanggal: 21 Oktober 2026
Status: mengikat. Bila bertentangan dengan `ASIAKIN_PRD_MVP_V2_1 (1).md` atau `prd/PRD_V2_2_DELTA.md`, dokumen ini menang.
Basis kode: `C:\Users\raso8\asiakin-v3` (baru). `C:\Users\raso8\Asiakin` lama berstatus **arsip referensi**, bukan target pengembangan.

---

## 0. Keputusan yang mengunci arah

| ID | Keputusan | Alasan | Konsekuensi |
|---|---|---|---|
| D1 | **Fokus fase 1: landing page saja.** Tidak ada auth, quest, AI, dashboard dikerjakan sebelum landing lulus gate. | Permintaan langsung user. Landing adalah satu-satunya permukaan yang dinilai lebih dulu. | Semua task non-landing berstatus `deferred`, bukan `blocked`. |
| D2 | **Analisis AI memakai LLM nyata (Gemini)** via backend tipis, API key disediakan user saat fase itu dimulai. | User memilih LLM nyata, bukan rule-based. | Wajib BFF + kredensial server-side + rate limit + consent + biaya. **Tidak boleh satu baris pun di klien.** |
| D3 | **Cakupan konten: 15 negara Asia, kedalaman tipis** (bukan 3-5 negara dalam). | User memilih globe terasa penuh. | Wajib kontrak konten minimum per negara supaya "tipis" tetap konsisten, dan label jujur untuk bagian yang belum ada. |
| D4 | **Bangun ulang dari nol.** Tidak ada copy-paste kode dari `Asiakin` lama. | User menolak melanjutkan basis yang gagal. | Data konten 15 negara boleh dipakai sebagai *seed* setelah diverifikasi sumbernya; kode ditulis baru dengan test. |
| D5 | **Tema terang.** Dark theme `DESIGN.md` lama dibatalkan. | Permintaan langsung user. | Semua token warna ditulis ulang; kontras diverifikasi. |
| D6 | **Tanpa navbar / header menu / template chrome.** | Permintaan langsung user. | Navigasi lewat scroll + globe; wajib ada indikator progres, affordance kembali, dan akses keyboard penuh. |
| D7 | **Scroll adalah narasi utama.** Animasi terikat progres scroll. | Permintaan langsung user. | Library: GSAP ScrollTrigger + Lenis (pola resmi Lenis+GSAP ticker). Dilarang memakai `ScrollControls` R3F bersamaan. |
| D8 | **Globe Asia-only sebagai pusat layar**, dirender dari GeoJSON bergaya, bukan foto bumi. | Permintaan user + kualitas light theme. | Tekstur dibuat dari `world-atlas` (ISC) / Natural Earth (public domain), picking via color-ID. |

---

## 1. Yang dinyatakan ULANG (supersede)

| Bagian lama | Status | Diganti oleh |
|---|---|---|
| `DESIGN.md` §2 palette dark `#0A0E1A` | **Dibatalkan** | DESIGN.md v3 (light) |
| `BUILD_BRIEF:15` "Tanpa LLM runtime/endpoint/SDK" | **Dibatalkan untuk fase 4** | D2 + §6 |
| `PRD_V2_2_DELTA:25-32` "3D hanya jika terverifikasi, fallback jujur" | **Diperketat** | 3D wajib ada; fallback hanya untuk perangkat tanpa WebGL / reduced-motion |
| `PRD_V2_2_DELTA:72-76` "semua negara snapshot Asia, jumlah belum ditetapkan" | **Dikunci** | 15 negara (§5) |
| `EXPERIENCE_BLUEPRINT` §4 "3 beat country page" | **Diganti** | Country page v2 (§5.3) |
| `AppShell.tsx` (header + nav) | **Dilarang** | Tanpa navbar (§3.3) |
| `V2.1 §7` AI Coach deferred tanpa rencana | **Diganti** | Fase 4 dengan Gemini via BFF |
| Taskboard/PLAN status `blocked` | **Tidak berlaku** | Status nyata per fase di §7 |

---

## 2. Fase & definisi selesai

| Fase | Lingkup | Gate lulus |
|---|---|---|
| **F1 — Landing** | 5-7 section scrollytelling, globe Asia, popup negara, fallback | §4 |
| F2 — Country page | 15 halaman negara, konten minimum §5.3, transisi dari popup | Konten tervalidasi + screenshot 3 breakpoint |
| F3 — Auth + Dashboard | Provider nyata, guard semua route, progress satu sumber | `security-reviewer` lolos, tidak ada login demo |
| F4 — Quest + AI | Skema quest, engine evaluasi, Gemini via BFF | Analisis keluar dari server, key tidak pernah di klien |

**Aturan:** fase berikutnya tidak dimulai sebelum gate fase sebelumnya lulus. F1 adalah satu-satunya yang dikerjakan sekarang.

---

## 3. F1 — Spesifikasi landing

### 3.1 Struktur naratif
5-7 section, urutan dan animasi ditetapkan di `DESIGN.md` v3 (storyboard bernilai numerik). Batasan yang mengikat:

1. **Pembuka:** nama ASIAKIN muncul sebagai bagian narasi, bukan logo di navbar.
2. **Asia sebagai subjek:** globe Asia masuk sebagai pusat layar, bukan ilustrasi samping.
3. **Penjelajahan:** scroll menggerakkan kamera/rotasi globe. Klik negara membuka popup.
4. **Popup:** nama negara, satu baris konteks, satu aksi `Lanjut`. Escape menutup dan mengembalikan fokus.
5. **Penutup:** satu aksi menuju penjelajahan penuh atau halaman negara terpilih. Tidak ada footer berisi 4 kolom link.

### 3.2 Larangan visual
- Tanpa card grid (3-card hero, 6-card features).
- Tanpa navbar, header menu, hamburger, atau sidebar.
- Tanpa copy "Elevate / Seamless / Powerful / Unlock / Embark / Dive in".
- Tanpa gradient ungu-biru, glassmorphism, blob dekoratif, emoji sebagai ikon.
- Tanpa angka statistik karangan ("10.000+ pelajar").

### 3.3 Navigasi tanpa chrome
Wajib ada, karena navbar dihapus:
- Indikator progres scroll (tipis, non-blokir, `aria-hidden` kecuali diberi label).
- Affordance kembali di halaman negara dan dari popup.
- Semua tujuan tetap bisa dicapai keyboard: globe dapat difokus, negara dapat dipilih lewat Tab/Enter, dan ada daftar negara alternatif yang dapat difokus (boleh tersembunyi secara visual, tidak boleh `display:none`).
- Deep link `/country/:id` harus membuka halaman negara langsung tanpa lewat animasi pembuka.

### 3.4 Globe — requirement teknis
| Aspek | Ketentuan |
|---|---|
| Geometri | `SphereGeometry` ≤96×64 segmen |
| Tekstur | Dibuat dari GeoJSON (`world-atlas` countries-50m) → kanvas 4096×2048, warna flat palette terang, garis batas 1px. **Tanpa tekstur foto.** |
| Picking | Raycast → UV → `getImageData` pada kanvas color-ID. Satu negara = satu RGB unik. |
| Fokus Asia | Kamera default pada lat 34, lon 100; negara di luar bbox Asia tidak diberi pin/warna aksen |
| Marker | `InstancedMesh`, bukan 15 mesh terpisah |
| Render loop | `requestAnimationFrame` tunggal; berhenti saat tab tidak aktif dan saat elemen keluar viewport |
| Dispose | Semua geometry/material/texture/renderer di-dispose saat unmount |
| DPR | clamp 1.5 mobile, 2 desktop |
| Fallback | Tanpa WebGL → poster AVIF + daftar negara yang bisa diklik; `prefers-reduced-motion` → globe statis + daftar, transisi hanya opacity |

### 3.5 Performance budget (hard)
| Metrik | Batas |
|---|---|
| LCP (mobile 4G, p75) | ≤ 2.5 s; elemen LCP = poster/teks, **bukan canvas** |
| INP | ≤ 200 ms |
| CLS | ≤ 0.1 |
| JS awal (shell + hero, gzip) | ≤ 180 KB |
| Chunk 3D (gzip, lazy) | ≤ 350 KB |
| Poster/fallback | ≤ 120 KB AVIF |
| Frame rate | ≥ 30 fps saat scroll; < 24 fps selama 2 s → turunkan DPR, lalu fallback poster |
| Console | 0 error, 0 warning React |

### 3.6 Acceptance criteria F1
| ID | Kriteria | Cara verifikasi |
|---|---|---|
| L-01 | Tidak ada elemen `<nav>`/header tetap di viewport | Inspeksi DOM + screenshot |
| L-02 | 5-7 section, tiap section punya animasi terikat scroll | Screenshot per 10% progres scroll |
| L-03 | Globe Asia terlihat sebagai pusat layar pada section 2-3 | Screenshot 1440/768/375 |
| L-04 | Klik negara membuka popup berisi nama + aksi `Lanjut` | Playwright: klik → popup terlihat |
| L-05 | Escape menutup popup dan fokus kembali ke pemicu | Playwright keyboard |
| L-06 | Popup tidak auto-open saat mount | Playwright: muat halaman → tidak ada dialog |
| L-07 | `Lanjut` menuju `/country/:id` yang benar | Playwright: assert URL |
| L-08 | Deep link `/country/sg` merender tanpa animasi pembuka | Playwright: navigasi langsung |
| L-09 | `prefers-reduced-motion` menghasilkan versi statis yang tetap bisa memilih negara | Emulasi media + Playwright |
| L-10 | Tanpa WebGL tetap bisa memilih negara | Context mati disimulasikan |
| L-11 | Semua section dapat dicapai dengan Tab, tanpa jebakan fokus | Playwright keyboard walk |
| L-12 | Kontras teks ≥ 4.5:1, teks besar ≥ 3:1 | `scripts/check-contrast` |
| L-13 | Budget §3.5 terukur | `report:bundle` + Lighthouse/Playwright trace |
| L-14 | 0 error console di 3 breakpoint | Playwright console listener |

---

## 4. Data & aset

| Kebutuhan | Sumber | Lisensi |
|---|---|---|
| Batas negara | `world-atlas@2.0.2` (`countries-50m.json`) atau Natural Earth 1:50m | ISC / public domain |
| Nama & kode negara | world-atlas `properties.name` + ISO numeric `id` | ISC |
| Font | self-hosted, maksimum 2 keluarga | lisensi OFL/komersial yang jelas |
| Ikon | digambar sendiri atau set berlisensi | wajib dicatat |

**Dilarang:** tekstur dari Google Earth/Mapbox satellite, model Sketchfab tanpa bukti lisensi, font dari CDN pihak ketiga.

---

## 5. Konten

### 5.1 Cakupan
15 negara (id, my, sg, th, vn, ph, cn, jp, kr, in, sa, tr, kz, uz, mn). Semua dapat dipilih dan punya halaman.

### 5.2 Label kejujuran
Setiap halaman negara menampilkan status: `Lengkap` (punya lesson+quest) atau `Penjelajahan` (hanya profil). Tidak boleh menampilkan progres atau tombol belajar untuk negara yang belum punya konten.

### 5.3 Kontrak minimum per negara (kedalaman tipis, konsisten)
| Bagian | Isi minimum | Batas |
|---|---|---|
| Pembuka | nama, nama asli, satu kalimat posisi budaya | ≤ 25 kata |
| Storytelling | satu momen/adegan konkret, bukan daftar fakta | 120-180 kata |
| Budaya | 3 aturan etiket, masing-masing sebabnya | ≤ 20 kata/aturan |
| Karakteristik orang | 3 sifat dengan contoh perilaku nyata | ≤ 20 kata/sifat |
| Bahasa | sapaan + 3 frasa dengan cara baca + konteks pakai | 4 item |
| Sumber | daftar rujukan yang benar-benar dibaca | minimal 2 |

**Aturan:** tidak boleh ada klaim faktual tanpa rujukan di field `sources`. Konten tanpa sumber tidak boleh rilis.

---

## 6. Fase 4 — Quest + AI (dikunci sekarang, dikerjakan nanti)

- **Quest** = satu set tugas per negara (pilih respons, susun frasa, tentukan etiket) yang menghasilkan `attempt` terstruktur: jawaban, waktu, jumlah percobaan, pola kesalahan.
- **AI** = Gemini dipanggil dari BFF (server), menerima ringkasan `attempt` (bukan PII), mengembalikan analisis + 1 rekomendasi langkah berikutnya.
- **Klien tidak pernah** memegang API key. Tidak ada endpoint yang menerima prompt bebas dari klien.
- **Consent** wajib sebelum pengiriman data ke model; decline = analisis deterministik lokal, bukan halaman kosong.
- **Budget:** maksimum 1 panggilan per attempt, timeout 8 s, fallback ke analisis lokal saat gagal/timeout.
- **Gate:** `security-reviewer` + uji tanpa key (harus tetap berfungsi dengan fallback).

---

## 7. Status nyata saat ini

| Area | Status |
|---|---|
| `asiakin-v3` | repo kosong, baru `git init` |
| DESIGN v3 | sedang ditulis (@designer) |
| Landing | belum ada |
| Country page (15) | konten seed ada di `Asiakin/src/domain/countries/asia-data.ts`, belum diverifikasi sumber |
| Auth | belum diputuskan provider (dibutuhkan di F3) |
| Quest/AI | spesifikasi §6 terkunci, implementasi ditunda |

---

## 8. Open items

| ID | Item | Pemilik | Blocker untuk |
|---|---|---|---|
| OI-L1 | Nama domain & kredensial hosting | user | deploy |
| OI-L2 | Sumber konten 15 negara (rujukan per negara) | penulis konten | F2 |
| OI-L3 | Provider auth | user | F3 |
| OI-L4 | Kunci Gemini + hosting BFF | user | F4 |
| OI-L5 | Set font berlisensi | desainer | F1 finalisasi tipografi |
