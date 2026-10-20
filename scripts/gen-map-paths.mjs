#!/usr/bin/env node
/*
 * Bangun src/content/map-paths.json dari Natural Earth 1:50m.
 *
 *   node scripts/gen-map-paths.mjs
 *
 * Tanpa dependency. Proyeksi + simplifikasi ada di src/lib/map-paths.ts (Node
 * mengeksekusi TypeScript secara native; tidak ada library proyeksi di runtime).
 * Output deterministik — jalankan dua kali, hash harus sama.
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildMapPaths, countEntryPoints } from '../src/lib/map-paths.ts';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const SOURCE = path.join(ROOT, 'assets', 'source', 'ne_50m_admin_0_countries.geojson');
const OUTPUT = path.join(ROOT, 'src', 'content', 'map-paths.json');

function fail(message) {
  console.error(`[map:build] GAGAL: ${message}`);
  process.exit(1);
}

let raw;
try {
  raw = readFileSync(SOURCE, 'utf8');
} catch (error) {
  fail(`tidak bisa membaca ${path.relative(ROOT, SOURCE)}: ${error.message}`);
}

let collection;
try {
  collection = JSON.parse(raw);
} catch (error) {
  fail(`GeoJSON tidak valid: ${error.message}`);
}

let entries;
try {
  entries = buildMapPaths(collection);
} catch (error) {
  fail(error.message);
}

if (entries.length !== 15) {
  fail(`jumlah negara ${entries.length} != 15`);
}

const serialized = `${JSON.stringify(entries, null, 2)}\n`;
mkdirSync(path.dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, serialized, 'utf8');

const bytes = Buffer.byteLength(serialized, 'utf8');
console.log(`[map:build] sumber: ${path.relative(ROOT, SOURCE)}`);
console.log(`[map:build] viewBox: 0 0 1000 1000 (padding 20)`);
console.log('[map:build] negara  titik  byte-d  id');
for (const entry of entries) {
  const points = entry.d.split(/[ML]/).length - 1;
  console.log(
    `[map:build] ${entry.iso3.padEnd(6)} ${String(points).padStart(5)}  ${String(
      Buffer.byteLength(entry.d, 'utf8'),
    ).padStart(6)}  ${entry.id}`,
  );
}
console.log(
  `[map:build] total ${countEntryPoints(entries)} titik, ${entries.length} negara, ${bytes} byte -> ${path.relative(
    ROOT,
    OUTPUT,
  )}`,
);
