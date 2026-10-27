# Asia Explorer — Dashboard & Auth System Design Spec
**Date:** 2026-10-27  
**Status:** Approved

---

## Overview

Full dashboard system dengan auth (Email+Password + Google OAuth), halaman belajar per negara, quest + skor, feedback AI/manual optimizer, dan peta interaktif. Dibangun di atas codebase yang sudah ada: IndexedDB storage, Leitner 5-box, i18n, TTS speech, ProfileContext.

---

## 1. Auth Page (`/login`)

**Layout:** Split 55/45 — kiri visual, kanan form.

**Kiri:**
- Full-height collage animasi Asia: landmark, aksara, warna budaya
- Slide rotate tiap 4 detik: JP → KR → ID → IN → dst.
- Tagline berganti per negara ("Pelajari Aksara Jepang", "Kenali Budaya Korea", dst.)

**Kanan:**
- Form: Email + Password + tombol Login
- Divider "atau"
- Tombol "Lanjutkan dengan Google" (Google OAuth via Firebase Auth atau Supabase)
- Link "Belum punya akun? Daftar"
- Register form: Nama + Email + Password

**Routes:** `/login`, `/register`  
**Guard:** Jika sudah login → redirect ke `/dashboard`

---

## 2. Auth Backend

**Pilihan:** Firebase Authentication (recommended — gratis, OAuth built-in, mudah integrasi)
- Email/Password provider
- Google OAuth provider
- `onAuthStateChanged` → sync ke ProfileContext
- Profile data tetap di IndexedDB lokal (sudah ada), auth hanya untuk identitas

**ProfileContext extension:**
- Tambah `authUser` (Firebase User | null)
- `signInWithEmail(email, password)`
- `signInWithGoogle()`
- `registerWithEmail(name, email, password)`
- `signOut()` → clear Firebase session + localStorage

---

## 3. Main Dashboard (`/dashboard`)

**Layout:** Sidebar 240px + main content

**Sidebar:**
- Avatar (initial huruf nama) + nama + level badge ("Penjelajah Lv.7")
- XP bar: current/next level, angka XP
- Nav links: Beranda, Negara, Quest, Ulasan, Peta, Profil
- Logout di bawah

**Main Content — 3 zona:**

### 3a. Resume Card (top, full width)
- Negara terakhir dipelajari, progress bar, estimasi waktu selesai
- CTA: "Lanjut Belajar →"

### 3b. Grid Negara
- Card per negara: foto landmark, nama, bahasa, progress ring (%), status badge
- Status: Tersedia / Sedang Belajar / Selesai / Terkunci
- Click → `/dashboard/pelajaran/:countryId`

### 3c. Stats & Widget
- Streak kalender mini
- Total XP, quest hari ini, rata-rata akurasi
- **"Kata Hari Ini":** satu kata random, tombol 🔊 TTS, animasi aksara

---

## 4. Halaman Materi per Negara (`/dashboard/pelajaran/:countryId/:step`)

**Steps:** `kenali` | `dengarkan` | `baca` | `quiz-kilat`

### Kenali
- Kartu info: bahasa resmi, aksara, sapaan, populasi, fakta unik
- Photo gallery (gambar yang sudah ada di `/public/images/countries/`)
- **Culture Snapshot:** storytelling singkat 1 hal unik yang jarang diketahui

### Dengarkan (Listening)
- Daftar 5–10 frasa/kata
- Audio player TTS (sudah ada `speech.ts`)
- Kontrol: play, slow-down (0.7x), replay
- Tiap sesi selesai: +10 XP

### Baca & Aksara
- Tampilan karakter aksara besar
- Cara baca dengan romanisasi
- Animasi stroke order sederhana (CSS animation)
- Contoh kata yang pakai aksara itu

### Quiz Kilat
- 5 soal checkpoint sebelum Quest penuh
- Tipe: pilihan ganda
- Langsung feedback per soal
- Skor → lanjut ke Quest atau ulangi

**Progression:**
- Tiap step punya bintang 1–3
- Semua step selesai → negara "Complete" → badge
- XP: Listening +10, Quiz benar +15, Perfect +25 bonus

---

## 5. Quest (`/dashboard/quest/:countryId`)

- 20 soal per sesi, tipe campuran: pilihan ganda, dengar & pilih, cocokkan aksara
- Progress bar top, timer opsional (toggle)
- Feedback instant per soal: ✅ animasi / ❌ tampil jawaban benar

**Quest Result (`/dashboard/quest/:countryId/:attemptId`):**
- Animasi skor naik (count-up)
- Breakdown: benar/salah/skip, akurasi %, XP earned
- Level-up animation jika naik level
- Weak spots visual: topik mana yang sering salah (bar chart mini)
- CTA: Ulangi / Lanjut ke negara berikutnya

---

## 6. Feedback & Learning Optimizer

**Toggle di Dashboard/Profil:** user pilih mode.

### Mode Manual (Smart Algorithm — default)
- Data: skor quiz, pattern jawaban salah, frekuensi belajar
- Leitner 5-box sudah ada di `leitner.ts` — kartu salah muncul lebih sering
- `decision.ts` sudah ada — dipakai untuk `resolveNextTaskFromState`
- Tampil rekomendasi: "Lo sering salah di aksara Korea → ulangi modul Baca"
- 100% lokal, no API

### Mode AI (External API — opt-in)
- User enable di Settings → masukkan OpenAI API key (disimpan lokal, tidak ke server)
- AI analisis: pola belajar, waktu fokus, tipe soal efektif
- Generate custom learning path (urutan negara + modul)
- Feedback narasi personal
- Fallback ke Manual jika API key tidak ada

### Learning DNA (visualisasi profil belajar)
- Radar chart: Listening / Reading / Cultural Knowledge / Quiz Speed / Consistency
- Update otomatis setiap quiz selesai
- Jadi "identity card" user

---

## 7. Peta Interaktif (`/dashboard/peta`)

- Pakai `AsiaScene.tsx` / `CountryMapSvg.tsx` yang sudah ada
- Negara selesai: warna solid + glow effect
- Negara in-progress: pulse animation
- Negara terkunci: abu-abu desaturated
- Hover/tap → mini popup: progress %, last activity, tombol "Lanjut"

---

## 8. XP & Level System

| Level | Nama | XP Dibutuhkan |
|-------|------|---------------|
| 1 | Pemula | 0 |
| 2 | Penasaran | 100 |
| 3 | Penjelajah | 300 |
| 4 | Pelancong | 600 |
| 5 | Petualang | 1000 |
| 6 | Ahli Budaya | 1500 |
| 7 | Master Asia | 2500 |

XP sources: Lesson complete +50, Quest perfect +100, Daily streak +20, Kata Hari Ini +5

---

## 9. Data Model Extensions

Tambahan ke `types.ts` yang sudah ada:
```ts
interface UserAuth {
  uid: string;          // Firebase UID
  email: string;
  displayName: string;
  provider: 'email' | 'google';
  photoURL?: string;
}

interface XPLog {
  profileId: string;
  source: string;       // 'lesson' | 'quest' | 'streak' | 'word-of-day'
  amount: number;
  timestamp: number;
}

interface LearningDNA {
  profileId: string;
  listening: number;    // 0-100
  reading: number;
  cultural: number;
  quizSpeed: number;
  consistency: number;
  updatedAt: number;
}
```

---

## 10. Routes Baru

```
/login              → AuthPage (split layout)
/register           → AuthPage (register tab)
/dashboard/peta     → MapPage
/dashboard/profil   → ProfilePage (learning DNA, settings, AI toggle)
```

---

## Tech Stack Additions

- **Firebase Auth** (email + Google OAuth) — atau Supabase Auth sebagai alternatif
- **Recharts / Chart.js** untuk radar chart Learning DNA
- Semua storage tetap IndexedDB (sudah ada `db.ts`)
- AI: user-provided OpenAI key, call dari browser (tidak ada backend baru)
