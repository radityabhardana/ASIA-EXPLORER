import { spawnSync } from 'node:child_process';

const entry = (path) => `node_modules/${path}`;

const steps = [
  { name: 'typecheck (tsc --noEmit)', entry: entry('typescript/bin/tsc'), args: ['--noEmit'] },
  {
    name: 'lint (eslint . --max-warnings=0)',
    entry: entry('eslint/bin/eslint.js'),
    args: ['.', '--max-warnings=0'],
  },
  { name: 'test (vitest run)', entry: entry('vitest/vitest.mjs'), args: ['run'] },
  { name: 'build (vite build)', entry: entry('vite/bin/vite.js'), args: ['build'] },
];

for (const step of steps) {
  console.log(`\n[verify] mulai: ${step.name}`);

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
