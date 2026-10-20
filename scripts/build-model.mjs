#!/usr/bin/env node
/**
 * Runs the headless Blender build for public/models/asia.glb, then verifies it.
 *
 * Usage: node scripts/build-model.mjs
 * Override the Blender binary with BLENDER_PATH if it lives elsewhere.
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BLENDER =
  process.env.BLENDER_PATH ?? 'C:\\Program Files\\Blender Foundation\\Blender 5.2\\blender.exe';
const BUILD_SCRIPT = join(ROOT, 'tools/build-asia.py');
const VERIFY_SCRIPT = join(ROOT, 'scripts/verify-model.mjs');

const quote = (value) => `"${value}"`;

if (!existsSync(BLENDER)) {
  console.error(`[model:build] GAGAL: Blender tidak ditemukan di ${BLENDER}`);
  console.error('[model:build] set BLENDER_PATH ke path blender.exe yang benar.');
  process.exit(1);
}

if (!existsSync(BUILD_SCRIPT)) {
  console.error(`[model:build] GAGAL: script build tidak ditemukan di ${BUILD_SCRIPT}`);
  process.exit(1);
}

const args = ['-b', '--factory-startup', '--python', BUILD_SCRIPT];
console.log(`[model:build] jalankan: ${quote(BLENDER)} ${args.map(quote).join(' ')}`);

const build = spawnSync(BLENDER, args, { stdio: 'inherit' });

if (build.error) {
  console.error(`[model:build] GAGAL menjalankan Blender: ${build.error.message}`);
  process.exit(1);
}

if (build.status !== 0) {
  console.error(`[model:build] GAGAL: Blender keluar dengan kode ${build.status ?? 'null'}`);
  process.exit(build.status ?? 1);
}

console.log('[model:build] Blender selesai, menjalankan verifikasi model...');

const verify = spawnSync(process.execPath, [VERIFY_SCRIPT], { stdio: 'inherit' });

if (verify.error) {
  console.error(`[model:build] GAGAL menjalankan verifikasi: ${verify.error.message}`);
  process.exit(1);
}

if (verify.status !== 0) {
  console.error(
    `[model:build] GAGAL: verifikasi model keluar dengan kode ${verify.status ?? 'null'}`,
  );
  process.exit(verify.status ?? 1);
}

console.log('[model:build] selesai: GLB dibangun dan lolos verifikasi.');
