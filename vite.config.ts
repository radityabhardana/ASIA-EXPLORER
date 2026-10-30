import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rawSrcPath = new URL('./src', import.meta.url).pathname;
const srcPath = /^\/[A-Za-z]:/.test(rawSrcPath) ? rawSrcPath.slice(1) : rawSrcPath;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
      '@designcodeio/threeui/style.css': /^\/[A-Za-z]:/.test(new URL('./src/shaders/threeui.css', import.meta.url).pathname)
        ? new URL('./src/shaders/threeui.css', import.meta.url).pathname.slice(1)
        : new URL('./src/shaders/threeui.css', import.meta.url).pathname,
      '@designcodeio/threeui': /^\/[A-Za-z]:/.test(new URL('./src/shaders/landing-pages/LandingPages.tsx', import.meta.url).pathname)
        ? new URL('./src/shaders/landing-pages/LandingPages.tsx', import.meta.url).pathname.slice(1)
        : new URL('./src/shaders/landing-pages/LandingPages.tsx', import.meta.url).pathname,
    },
  },
  build: {
    target: 'es2022',
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/node_modules/three/')) {
            return 'three';
          }
          return undefined;
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
