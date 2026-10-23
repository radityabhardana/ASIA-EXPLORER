# SPEC_DASHBOARD — Dashboard, Pelajaran, Quest, Hasil, Leitner

Status: spesifikasi mengikat turunan `PRD_V2_6_DELTA.md` K16, K17, K19–K22; melengkapi `PRD_V2_3_DELTA.md` §5.2 & §6.
Basis kode hari ini: 3 rute (`/`, `/negara/:id`, `/lab/scene` DEV) + redirect `/country/:id` (`src/app/routes.tsx:7-9,22-36`); belum ada `/dashboard`, `/negara`, profil, maupun `i18n.ts`.
Dilarang di seluruh dokumen ini: kartu (blok berlatar/border/radius/shadow), emoji, XP/streak/leaderboard/lencana, server untuk fitur inti, string hardcoded (semua lewat i18n). Tema terang saja; warna dari token `src/styles/tokens.css`, tanpa varian gelap.

## 1. IA & Rute

Semua path di bawah punya kembaran `/en` (K11). Router memasang segmen locale opsional `'' | '/en'`; path di tabel adalah bentuk ID.

| Path | Render | Gate |
|---|---|---|
| `/dashboard` | 4 blok: (1) satu tugas berikutnya, (2) frasa jatuh tempo, (3) daftar negara + progres, (4) data & cadangan | `RequireProfile` |
| `/dashboard/pelajaran/:countryId/:step` | Langkah pelajaran, `step ∈ {kenali,etiket,bahasa,quest}`; step lain → redirect ke step terjauh yang boleh diakses | `RequireProfile` + `RequireLengkap` |
| `/dashboard/quest/:countryId` | Mulai/lanjutkan attempt berjalan; membuat `attemptId` baru bila tidak ada attempt `inProgress` | `RequireProfile` + `RequireLengkap` |
| `/dashboard/quest/:countryId/:attemptId` | **Halaman hasil** (K21), bukan popup | `RequireProfile` |
| `/dashboard/ulas` | Sesi ulas frasa: frasa `dueDay ≤ today`, satu per satu | `RequireProfile` |
| `/negara` | Indeks negara (mosaik foto, K15). Satu-satunya daftar negara kanonik | publik |
| `/negara/:id` | Halaman negara; `Lengkap` menampilkan tautan pelajaran, `Penjelajahan` menampilkan "Belum ada pelajaran" | publik |

Tidak dibuat `/dashboard/negara`: blok (3) di `/dashboard` adalah daftar ringkas yang menaut ke `/negara/:id`; duplikasi IA ditolak.

**Gerbang profil (K17).** `ProfileProvider` mengekspos `status: 'loading'|'none'|'ready'`, `signIn(name)`, `signOut()`, `useProfile()`.
- `loading` → satu baris teks "Memuat profil…" (tanpa spinner berputar saat reduced-motion).
- `none` → `<Navigate to="/?profil=buat" replace />`; `LandingPage` membaca `profil=buat` dan membuka dialog profil; menutup dialog memakai `replace` untuk menghapus param.
- Dialog menyatakan verbatim: "Dashboard menyimpan progresmu di peramban ini." Tidak ada kata "akun", "login", "masuk akun".
- `ready` → render.

**Deep link hasil tanpa attempt.** `/dashboard/quest/:countryId/:attemptId` dengan `attemptId` tak dikenal untuk `profileId` aktif → render keadaan `not-found` (bukan redirect, bukan 404 global): teks "Hasil ini tidak ada di peramban ini", dua tautan `/dashboard` dan `/dashboard/quest/:countryId`. Tanpa profil → gerbang profil di atas (dialog, bukan halaman kosong).

## 2. Model Data

Tipe konten lama tetap dipakai: `Country`, `Phrase`, `Source` (`src/content/countries.ts:11-42`), `CountryDepth` (`:9`).

| Tipe | Bentuk (TS) | Catatan |
|---|---|---|
| `Profile` | `{ id: string; displayName: string; createdAt: number; locale: 'id'\|'en' }` | `id = crypto.randomUUID()` |
| `LessonProgress` | `{ profileId; countryId; stepsDone: LessonStep[]; startedAt; completedAt: number \| null }` | `LessonStep = 'kenali'\|'etiket'\|'bahasa'\|'quest'` |
| `QuestItem` | union 3 kind, lihat bawah | `id` = `countryId.order`, `order: 1..6` |
| `Attempt` | `{ id; profileId; countryId; itemIds: string[]; answers: Answer[]; startedAt; finishedAt: number\|null; durationMs: number\|null; mode: 'full'\|'retry-wrong' }` | `mode` menentukan penyebut skor |
| `Answer` | `{ itemId; given: string\|string[]; correct: boolean; elapsedMs: number }` | `given` untuk match = pasangan `phraseId→meaningId` |
| `PhraseReview` | `{ profileId; phraseId; box: 1..5; dueDay: string; lastReviewedDay: string\|null; lapses: number; reviews: number }` | `phraseId` = `countryId:index`; `dueDay` = `YYYY-MM-DD` lokal, bukan epoch (bebas DST) |
| `Progress` | `{ profileId; countries: Record<string, { openedAt; lastSeenAt; lessonCompletedAt: number\|null; storySeen: boolean }>; lastAttemptId?: string }` | satu record per profil |

`QuestItem`:
- `etiquetteMcq`: `{ kind:'etiquette'; order; prompt; options: [string,string,string]; correctIndex: 0|1|2; reason: string; sourceRef: string }`
- `phraseMatch`: `{ kind:'match'; order; prompt; pairs: [{ phraseIndex: 0|1|2; meaningId: string }] (3); reason; sourceRef }`
- `branchScenario`: `{ kind:'branch'; order; scenario: string; options: [{ id; label; correct: boolean }] (3, tepat satu true); reason; sourceRef }`

`sourceRef` = `url` persis yang sudah ada di `country.sources[]` atau `country.story.sources[]`; URL di luar itu menolak build.

**IndexedDB** — database `asiakin`, versi diturunkan dari `schemaVersion`.

| Store | keyPath | Index |
|---|---|---|
| `profiles` | `id` | — |
| `progress` | `profileId` | `byLastActive` → `lastSeenAt` |
| `lessons` | `[profileId, countryId]` | `byProfile` → `profileId` |
| `attempts` | `id` | `byProfile` → `[profileId, startedAt]`; `byCountry` → `[profileId, countryId, startedAt]`; `byOpen` → `[profileId, finishedAt]` |
| `reviews` | `[profileId, phraseId]` | `byDue` → `[profileId, dueDay]` |
| `meta` | `key` | — (`schemaVersion`, `persistAskedAt`, `locale`) |

**Versi & migrasi.** `meta.schemaVersion` integer, konstanta `CURRENT_SCHEMA = 1`. Buka DB: `stored < CURRENT` → jalankan `migrations[n]` berurutan di satu `readwrite` transaction, lalu tulis versi; `stored > CURRENT` → mode baca-saja: banner "Data dibuat versi lebih baru", blokir tulis, tawarkan ekspor, tanpa downgrade destruktif.

**Ekspor/impor JSON.** Berkas `asiakin-backup-<YYYY-MM-DD>.json` = `{ schemaVersion, exportedAt, profiles, progress, lessons, attempts, reviews }` (seluruh isi kelima store untuk profil aktif). Impor: validasi zod, tolak `schemaVersion > CURRENT`, migrasi bila lebih lama, lalu **replace per `profileId`** (bukan merge). Round-trip wajib setara: `export → import → export` menghasilkan array identik kecuali `exportedAt`.

## 3. Alur Pelajaran (4 langkah, offline, keyboard-only)

| Step | Yang dilihat | Syarat maju | Dipersist |
|---|---|---|---|
| `kenali` | Nama negara + `story.text` (2 kalimat pertama, teks penuh di `/negara/:id`) | tombol "Lanjut" aktif setelah 1 interaksi fokus/klik; tanpa timer | `stepsDone += 'kenali'`, `startedAt` |
| `etiket` | 3 aturan dari `peopleNote` + `cultureNote`, tiap aturan diikuti "sebabnya" (`reason`) | ketiga aturan dibuka (accordion `<details>`, bukan kartu) | `stepsDone += 'etiket'` |
| `bahasa` | `greeting.native`/`roman`/`meaningId` + 3 frasa; tombol dengar hanya bila `isSpeechSupported()` (`src/lib/speech.ts:15-23`) | ketiga frasa ditandai "sudah dibaca" (checkbox native) | `stepsDone += 'bahasa'`; 3 `PhraseReview` box 1 `dueDay = today+1` bila belum ada |
| `quest` | Redirect ke `/dashboard/quest/:countryId` | 6 butir selesai → hasil | `stepsDone += 'quest'`, `lessonCompletedAt` |

Aturan keras: tidak ada langkah yang bisa dilompati lewat URL (step > terjauh → redirect); tidak ada fetch runtime (konten bundled); tidak ada animasi wajib — `prefers-reduced-motion` mematikan transisi dan accordion tetap berfungsi; seluruh alur Tab/Enter/Space, urutan fokus mengikuti DOM, `Esc` tidak menutup apa pun (tidak ada modal).
Breakpoint: 375 satu kolom, 768 dua kolom untuk etiket, 1440 teks maks 68ch. Tanpa blok berlatar.

## 4. Engine Quest

**Penulis butir.** 6 butir per negara: `order 1-3` MCQ etiket (opsi 3, tepat 1 benar, `reason` menjelaskan sebab budaya, bukan "karena itu sopan"), `order 4-5` match (tiga frasa ke tiga arti dari `phrases[]` negara itu), `order 6` skenario bercabang (`options` 3, tepat 1 `correct`).
Urutan **tetap** (bukan acak): `order` adalah field penulis; opsi juga tidak diacak. Alasan: skor dan review harus reproducible di Playwright dan saat impor/ekspor; pengacakan tidak menambah nilai belajar karena opsi tidak bisa dihafal posisinya dalam satu sesi.

**Satu per satu, umpan balik langsung setelah submit.** Alasan: `reason` adalah inti belajar (K20) dan harus dibaca sebelum butir berikutnya menggeser konteks; state yang harus disimpan hanya `answers[]`; keyboard dan 375 px tetap tanpa scroll panjang. Kebocoran antar-butir tidak ada karena ketiga jenis butir tidak berbagi jawaban.

| Momen | Perilaku |
|---|---|
| Render butir | 1 butir, penghitung "3 dari 6", progress berupa garis hairline (bukan bar berwarna) |
| Submit | opsi terkunci, `correct` dihitung, `reason` + `sourceRef` tampil sebagai teks; tombol "Lanjut" muncul, fokus pindah ke `reason` (bukan auto-advance) |
| Butir 6 submit | `finishedAt`, `durationMs`, `score` dihitung, `navigate('/dashboard/quest/:countryId/:attemptId', {replace:true})` |
| Muat ulang di tengah | attempt `inProgress` dilanjutkan pada butir pertama yang belum dijawab; `startedAt` tidak direset |

**Benar/salah.** MCQ: `given === correctIndex`. Match: benar hanya bila **ketiga** pasangan tepat (tanpa kredit sebagian — penyebut 6 harus tetap utuh, K21). Branch: benar bila `option.correct === true`; jawaban "masuk akal tapi salah" tetap salah dan `reason` menyebut akibatnya.

**Anti-pola yang ditolak saat review konten:** trivia angka/tanggal; butir yang jawabannya tidak ada di langkah 1-3 negara itu; stereotip ("orang X selalu …"); opsi yang semuanya benar atau ambigu; `reason` yang mengulang prompt; butir yang butuh pengetahuan luar; lebih dari satu `correct: true`.

## 5. Skor & Halaman Hasil

`score = answers.filter(correct).length`, `denominator = attempt.itemIds.length` (6 untuk `full`, jumlah butir salah untuk `retry-wrong`), `percent = Math.round(100*score/denominator)`.
Tampil: `"5/6"` + `"83%"` + durasi `m:ss` (tabular-nums). Tanpa bintang, tanpa count-up, tanpa warna perayaan.

Review per butir (selalu 4 baris): prompt · "Jawabanmu: X" · "Benar: Y" · `reason` + tautan `sourceRef`.
Aksi: **"Ulangi yang salah"** → tulis attempt baru di IndexedDB (`mode:'retry-wrong'`), `itemIds` = butir salah saja, `startedAt` baru; **"Lanjut ke pelajaran berikutnya"** → negara `Lengkap` berikutnya menurut urutan `countries.json`; bila tidak ada → `/dashboard`.

Riwayat: attempt lama tidak pernah ditimpa. Retry = record baru; `byCountry` menampilkan attempt terakhir per negara + jumlah attempt.

| Keadaan | Tampilan |
|---|---|
| `loading` | satu baris "Memuat hasil…" (tanpa skeleton berkedip) |
| `not-found` | teks + 2 tautan (§1) |
| `partial` (itemIds memuat id tak dikenal / item dihapus dari konten) | hasil tetap tampil untuk butir yang dikenal + banner "1 butir tidak lagi tersedia", skor dihitung dari butir yang dikenal dan penyebut disesuaikan |
| `error` (IndexedDB gagal dibuka / kuota) | teks sebab + tombol "Coba lagi" + tautan ekspor; tidak ada data palsu |
| `empty` (attempt ada, `answers` kosong) | "Attempt ini belum dijawab" + "Mulai ulang" |

## 6. Optimalisasi Belajar

**Leitner.** `INTERVALS = [1,3,7,16,35]` hari. `dueDay(box, day) = day + INTERVALS[box-1]` (aritmetika kalender `YYYY-MM-DD`, bukan ms).
Benar → `box = min(5, box+1)`; salah → `box = 1`, `lapses += 1`; `reviews += 1`; `lastReviewedDay = today`; `dueDay` dihitung ulang dari box baru. Frasa baru: `box 1`, `dueDay = today+1`. Frasa `box 5` yang benar tetap `box 5`, `dueDay = today+35` (tidak pernah "permanen" — menutup celah audit §6).
Ambang ulas: `dueCount = COUNT(reviews WHERE profileId=? AND dueDay <= today)`.

**Tabel keputusan tugas berikutnya** (deterministik, dievaluasi baris demi baris; kolom `S`=attempt `inProgress`, `D`=dueCount≥3, `L`=ada pelajaran `Lengkap` belum selesai, `C`=ada cerita belum dilihat).

| # | S | D | L | C | Tugas |
|---|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 | Lanjutkan sesi |
| 2 | 1 | 1 | 1 | 0 | Lanjutkan sesi |
| 3 | 1 | 1 | 0 | 1 | Lanjutkan sesi |
| 4 | 1 | 1 | 0 | 0 | Lanjutkan sesi |
| 5 | 1 | 0 | 1 | 1 | Lanjutkan sesi |
| 6 | 1 | 0 | 1 | 0 | Lanjutkan sesi |
| 7 | 1 | 0 | 0 | 1 | Lanjutkan sesi |
| 8 | 1 | 0 | 0 | 0 | Lanjutkan sesi |
| 9 | 0 | 1 | 1 | 1 | Ulas frasa |
| 10 | 0 | 1 | 1 | 0 | Ulas frasa |
| 11 | 0 | 1 | 0 | 1 | Ulas frasa |
| 12 | 0 | 1 | 0 | 0 | Ulas frasa |
| 13 | 0 | 0 | 1 | 1 | Pelajaran baru |
| 14 | 0 | 0 | 1 | 0 | Pelajaran baru |
| 15 | 0 | 0 | 0 | 1 | Cerita |
| 16 | 0 | 0 | 0 | 0 | Tuntas |

Prioritas: sesi > ulas > pelajaran > cerita > tuntas (K22). `Cerita` menaut ke negara `Lengkap` dengan `storySeen=false` yang `lastSeenAt` paling lama; bila semua `Penjelajahan`, baris 15 tidak tercapai karena `L`/`C` dihitung hanya dari `Lengkap`.

**Tes unit (vitest), satu baris per aturan.** `decideNext` 16 baris tabel di atas (uji tabel, satu kasus per baris) · `dueDay` +1/+3/+7/+16/+35 · box 5 benar tetap 5 dan `dueDay=+35` · salah dari box 3 → box 1, `lapses+1` · frasa baru box 1 `dueDay=today+1` · `dueCount` inklusif (`<= today`, bukan `<`) · skor `full` penyebut 6 · skor `retry-wrong` penyebut `itemIds.length` · match sebagian = salah · branch salah tetap salah · migrasi v0→v1 mempertahankan attempt · impor `schemaVersion` lebih tinggi ditolak.

**Lapisan AI — mati bawaan.** `aiEnabled` = false, tanpa toggle di UI Fase H. Yang tampil: analisis lokal deterministik dari `attempts.answers`: akurasi per `kind` (etiquette/match/branch), jenis terlemah, frasa paling sering `lapses`, jumlah attempt 7 hari terakhir — sebagai baris teks + angka, bukan grafik/kartu.
Kontrak bila diaktifkan kelak (server-only, K22/§6 v2.3): `POST /api/analysis` menerima `{ attemptId, kindAccuracy, items: [{kind, correct}], locale }` — **tanpa** nama, tanpa `profileId`; API key hanya di server; consent eksplisit per attempt; timeout 8 s; gagal/timeout → analisis lokal (bukan halaman kosong); 1 panggilan per attempt. Klien tidak punya SDK/endpoint prompt bebas.

## 7. Rencana Konten

Volume: 10 negara `Lengkap` (id, sg, th, ph, cn, jp, kr, sa, tr, uz) × (4 langkah + 6 butir) = **40 langkah + 60 butir**. 5 `Penjelajahan` (my, vn, in, kz, mn): 0 butir, hanya teks "Belum ada pelajaran".
Per negara turunan otomatis dari data yang ada: `kenali` ← `story.text`; `etiket` ← `peopleNote` (3 aturan) + sebab dari `cultureNote`/`story.sources`; `bahasa` ← `greeting` + `phrases[3]`; MCQ 1-3 ← 3 aturan etiket; match 4-5 ← `phrases`; branch 6 ← satu norma dari `peopleNote`.

Checklist penulis per butir: (1) satu klaim budaya saja; (2) `reason` menyebut sebab, ≤ 40 kata; (3) `sourceRef` = URL yang ada di `country.sources`/`story.sources`; (4) pengecoh masuk akal dan salah karena sebab yang bisa disebut; (5) tidak ada angka hafalan; (6) tidak ada stereotip; (7) ID + EN ada di kamus; (8) lolos `content:build` yang menolak butir tanpa `sourceRef` valid.
Manusia vs mesin: MCQ + match boleh **draf mesin, wajib review manusia** (fakta dari data yang sudah ada); **skenario bercabang ditulis manusia** (nuansa akibat sosial tidak bisa diturunkan mekanis); semua `reason` dibaca manusia sebelum rilis.

## 8. Fase Build

| Fase | Deliverable | Dependensi | Gate lulus |
|---|---|---|---|
| **F** | Rute `/dashboard`, `/negara`, guard profil, `ProfileProvider`, IndexedDB + migrasi, ekspor/impor, kerangka `i18n.ts` bila belum ada | `i18n.ts` (K11) — belum ada di repo | G1, G2, G3, G9, G10 hijau; `npm run verify` exit 0 |
| **G** | 4 langkah pelajaran, engine quest, halaman hasil, review + retry, konten 10 negara | F | G4, G5, G6, G8, G10 hijau; 60 butir lolos `content:build` |
| **H** | Leitner, sesi ulas, tabel keputusan, blok dashboard nyata, analisis lokal (AI off) | G | G7 + seluruh G1-G10; `security-reviewer` APPROVED (tanpa fetch keluar) |

## 9. Gates (Playwright `e2e/dashboard.spec.ts` + vitest)

| # | Gate | Menegaskan | Mencegah |
|---|---|---|---|
| G1 | Route guard | `/dashboard`, `/dashboard/pelajaran/jp/kenali`, `/dashboard/quest/jp/abc` tanpa profil → URL `/?profil=buat` **dan** dialog profil terlihat + fokus di input nama | Dashboard kosong / render data palsu |
| G2 | Ekspor/impor round-trip | ekspor → hapus profil → impor → state (progress, lessons, attempts, reviews) identik; `export→import→export` sama kecuali `exportedAt` | Kehilangan progres saat pindah peramban |
| G3 | Deep link tanpa profil & attempt asing | deep link hasil tanpa profil → dialog; dengan profil tapi attempt asing → keadaan `not-found`, tanpa exception konsol | Halaman putih / crash |
| G4 | Persistensi pelajaran | selesaikan `kenali` → reload → step tetap, `stepsDone` benar; URL step yang dilompati → redirect | Progres hilang saat refresh, lompat langkah |
| G5 | Determinisme skor | dua run jawaban identik → `score`, `itemIds`, urutan butir identik; match sebagian = salah | Skor berubah-ubah / kredit separuh |
| G6 | Review hasil benar | halaman hasil menampilkan untuk tiap butir: jawabanmu, jawaban benar, `reason`; `5/6` + `83%`; retry membuat attempt baru (jumlah attempt +1, lama utuh) | Review salah pasangan, riwayat tertimpa |
| G7 | Matematika Leitner | vitest tabel interval + due inklusif + box 5 tidak permanen; UI sesi ulas hanya menampilkan `dueDay <= today` | Frasa hilang permanen / ulang terlalu awal |
| G8 | Reduced motion | `emulateMedia({reducedMotion:'reduce'})` → tidak ada transisi >0 ms, alur pelajaran+quest tetap tuntas | Animasi memblokir alur |
| G9 | Keyboard-only penuh | Tab/Enter/Space menyelesaikan 1 pelajaran + 1 quest + retry tanpa mouse; fokus terlihat; tanpa focus trap di halaman | Alur hanya bisa dengan tetikus |
| G10 | Paritas i18n + tanpa jaringan | jumlah & nama kunci ID === EN (gagal build bila tidak); `context.setOffline(true)` → 1 quest penuh selesai, 0 request keluar | String tertinggal, fitur inti butuh server |

Tambahan non-gate: kontras ≥4.5:1 di 375/768/1440 (`scripts/check-contrast.mjs`), nol `border-radius`/`box-shadow`/latar blok pada elemen dashboard (assert computed style).

## 10. Keputusan Terbuka (default dipilih, tidak menunggu jawaban)

| # | Isu | Default | Alasan |
|---|---|---|---|
| O1 | `i18n.ts` belum ada (K11), dashboard butuh string | Tulis kamus minimal di Fase F dengan kunci `dashboard.*`, `lesson.*`, `quest.*`, `result.*` | Tanpa ini G10 mustahil; menunda berarti string ID tersebar |
| O2 | Rute pelajaran lazy vs statis | **Statis** (bukan `React.lazy`) untuk `/dashboard/pelajaran`, `/dashboard/quest`, `/dashboard/ulas` | Deep link offline tidak boleh memicu fetch chunk; risiko bundle dibayar dengan memisah scene 3D (sudah lazy) |
| O3 | Acak urutan butir/opsi | Tidak diacak, `order` dari penulis | Determinisme G5 dan review yang stabil; nilai belajar tidak bertambah dengan acak |
| O4 | Kredit sebagian butir match | Tidak ada; semua-atau-tidak | Penyebut 6 harus utuh (K21) |
| O5 | `storySeen` | `IntersectionObserver` 50% pada blok cerita `/negara/:id`, minimal 1 s, sekali per negara | Sinyal "cerita" harus nyata, bukan asumsi kunjungan |
| O6 | Sesi ulas: 1 frasa per layar + tombol "Ulang lagi" | Ya, tanpa timer | Konsisten dengan alur quest; mengurangi state |
| O7 | Retry-wrong sebagai attempt terpisah | Ya, `mode:'retry-wrong'`, tidak menimpa | Riwayat jujur; penyebut menyesuaikan |
