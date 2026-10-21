import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const entry = (path) => `node_modules/${path}`;

const modelPath = 'public/models/asia.glb';

const steps = [
  { name: 'typecheck (tsc --noEmit)', entry: entry('typescript/bin/tsc'), args: ['--noEmit'] },
  {
    name: 'lint (eslint . --max-warnings=0)',
    entry: entry('eslint/bin/eslint.js'),
    args: ['.', '--max-warnings=0'],
  },
  { name: 'test (vitest run)', entry: entry('vitest/vitest.mjs'), args: ['run'] },
  { name: 'build (vite build)', entry: entry('vite/bin/vite.js'), args: ['build'] },
  {
    name: 'model (scripts/verify-model.mjs)',
    entry: 'scripts/verify-model.mjs',
    args: [],
    skipReason: () =>
      existsSync(modelPath)
        ? null
        : `${modelPath} belum ada — jalankan \`npm run model:build\` untuk membuatnya`,
  },
  {
    name: 'contrast (scripts/check-contrast.mjs)',
    entry: 'scripts/check-contrast.mjs',
    args: [],
  },
  {
    name: 'content (scripts/build-content.mjs --check)',
    entry: 'scripts/build-content.mjs',
    args: ['--check'],
  },
  {
    name: 'e2e (playwright test)',
    entry: entry('@playwright/test/cli.js'),
    args: ['test'],
    // E2E butuh browser + port bebas; jangan dijalankan diam-diam di gate cepat.
    skipReason: () =>
      process.env.VERIFY_E2E === '1'
        ? null
        : 'opt-in: jalankan `VERIFY_E2E=1 npm run verify` (butuh browser + PW_PORT bebas)',
  },
];

for (const step of steps) {
  console.log(`\n[verify] mulai: ${step.name}`);

  const skipReason = step.skipReason?.();
  if (skipReason) {
    console.log(`[verify] LEWATI: ${step.name} — ${skipReason}`);
    continue;
  }

  const result = spawnSync(process.execPath, [step.entry, ...step.args], { stdio: 'inherit' });

  if (result.error) {
    console.error(`[verify] gagal menjalankan: ${step.name} - ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    console.error(`[verify] GAGAL: ${step.name} (exit ${result.status ?? 'null'})`);
    process.exit(1);
  }

  console.log(`[verify] lulus: ${step.name}`);
}

console.log('\n[verify] semua langkah lulus.');
