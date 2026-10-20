import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rawSrcPath = new URL('./src', import.meta.url).pathname;
const srcPath = /^\/[A-Za-z]:/.test(rawSrcPath) ? rawSrcPath.slice(1) : rawSrcPath;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': srcPath,
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
