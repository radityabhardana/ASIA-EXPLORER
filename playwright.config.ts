import { defineConfig, devices } from '@playwright/test';

// Proyek ini tidak memasang @types/node; deklarasi minimum untuk membaca env.
declare const process: { env: Record<string, string | undefined> };

// Port bisa di-override lewat PW_PORT supaya beberapa lane bisa menjalankan E2E
// bersamaan tanpa saling menabrak port 5173.
const port = Number(process.env.PW_PORT ?? 5173);
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npx vite --port ${port} --strictPort`,
    url: baseURL,
    // Port harus kosong: server lain di port itu akan membuat E2E menguji aplikasi yang salah.
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile-375',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 375, height: 812 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
});
