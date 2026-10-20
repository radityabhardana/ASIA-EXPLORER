# ASIAKIN v3

Fondasi proyek landing ASIAKIN: React 19 + TypeScript strict + Vite, dengan gate verifikasi tunggal.
Belum ada UI. Landing, globe, dan routing sengaja belum dibangun karena menunggu `DESIGN.md` v3.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173
```

## Gate resmi

```bash
npm run verify     # typecheck -> lint -> unit test -> build
```

Perintah lain: `npm run typecheck`, `npm run lint`, `npm run test`, `npm run e2e`, `npm run format`.

E2E memerlukan browser Playwright: `npx playwright install chromium`.

## Status jujur

Repo ini baru berisi scaffold konfigurasi, satu smoke test unit, dan satu smoke test E2E.
Tidak ada section landing, tidak ada aset visual, tidak ada token warna; `src/styles/tokens.css` masih kosong.
