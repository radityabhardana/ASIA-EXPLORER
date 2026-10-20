#!/usr/bin/env node
/*
 * Verifikasi kontras + keterbedaan warna negara dari src/styles/tokens.css.
 *
 *   node scripts/check-contrast.mjs
 *
 * - WCAG 2.1 untuk pasangan teks (ambang di bawah).
 * - CIEDE2000 untuk negara bertetangga (ambang ΔE >= 15).
 * - Angka klaim DESIGN.md dicetak sebagai pembanding; selisih dilaporkan,
 *   token TIDAK diubah otomatis.
 * Exit non-zero kalau ada ambang yang gagal atau token hilang.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { contrastRatio, deltaE00Hex } from '../src/lib/color.ts';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TOKENS_PATH = path.join(ROOT, 'src', 'styles', 'tokens.css');

const CONTRAST_CHECKS = [
  { foreground: '--ink', background: '--surface', minimum: 7, design: 15.51 },
  { foreground: '--ink-muted', background: '--surface', minimum: 4.5, design: 5.47 },
  { foreground: '--accent', background: '--surface', minimum: 4.5, design: 5.88 },
  { foreground: '--accent-ink', background: '--accent', minimum: 4.5, design: 6.23 },
];

const DISTANCE_CHECKS = [
  { first: 'id', second: 'my', design: 38.68 },
  { first: 'my', second: 'sg', design: 44.28 },
  { first: 'th', second: 'vn', design: 46.37 },
  { first: 'vn', second: 'cn', design: 15.54 },
  { first: 'cn', second: 'mn', design: 19.18 },
  { first: 'jp', second: 'kr', design: 33.16 },
  { first: 'kr', second: 'cn', design: 32.84 },
  { first: 'sa', second: 'tr', design: 42.34 },
  { first: 'kz', second: 'uz', design: 24.26 },
  // Perbatasan darat yang belum tercakup daftar awal. Tanpa ini, dua negara
  // yang bersebelahan di peta SVG bisa tampil nyaris satu warna.
  { first: 'th', second: 'my', design: 31.25 },
  { first: 'cn', second: 'in', design: 16.18 },
  { first: 'cn', second: 'kz', design: 31.45 },
  { first: 'in', second: 'mn', design: 18.75 },
];

const MINIMUM_DELTA_E = 15;
const COUNTRY_IDS = [
  'id',
  'my',
  'sg',
  'th',
  'vn',
  'ph',
  'cn',
  'jp',
  'kr',
  'in',
  'sa',
  'tr',
  'kz',
  'uz',
  'mn',
];

function readTokens(filePath) {
  const css = readFileSync(filePath, 'utf8');
  const tokens = new Map();
  const pattern = /^\s*(--[a-z0-9-]+)\s*:\s*(#[0-9a-f]{6})\s*;/i;
  for (const line of css.split(/\r?\n/)) {
    const match = pattern.exec(line);
    if (match?.[1] && match[2]) {
      tokens.set(match[1], match[2].toLowerCase());
    }
  }
  return tokens;
}

function format(value, digits = 2) {
  return value.toFixed(digits).padStart(8);
}

const tokens = readTokens(TOKENS_PATH);
const problems = [];

if (tokens.size === 0) {
  problems.push(`tidak ada token warna yang terbaca di ${path.relative(ROOT, TOKENS_PATH)}`);
}

function requireToken(name) {
  const value = tokens.get(name);
  if (!value) {
    problems.push(`token ${name} tidak ditemukan di tokens.css`);
    return null;
  }
  return value;
}

console.log(`[contrast] sumber: ${path.relative(ROOT, TOKENS_PATH)} (${tokens.size} token warna)`);
console.log('');
console.log('[contrast] WCAG 2.1 — teks');
console.log('  pasangan                        rasio    ambang  status');
for (const check of CONTRAST_CHECKS) {
  const foreground = requireToken(check.foreground);
  const background = requireToken(check.background);
  if (!foreground || !background) {
    console.log(`  ${`${check.foreground} di ${check.background}`.padEnd(30)}       -  ${check.minimum.toFixed(1)}   TOKEN HILANG`);
    continue;
  }
  const ratio = contrastRatio(foreground, background);
  const passed = ratio >= check.minimum;
  if (!passed) {
    problems.push(
      `kontras ${check.foreground} di ${check.background} = ${ratio.toFixed(2)} < ${check.minimum}`,
    );
  }
  console.log(
    `  ${`${check.foreground} di ${check.background}`.padEnd(30)}${format(ratio)}  ${check.minimum
      .toFixed(1)
      .padStart(6)}  ${passed ? 'lulus' : 'GAGAL'}`,
  );
}

console.log('');
console.log('[contrast] CIEDE2000 — negara bertetangga (ambang >= 15)');
console.log('  pasangan          deltaE   ambang  status');
for (const check of DISTANCE_CHECKS) {
  const first = requireToken(`--country-${check.first}`);
  const second = requireToken(`--country-${check.second}`);
  if (!first || !second) {
    continue;
  }
  const delta = deltaE00Hex(first, second);
  const passed = delta >= MINIMUM_DELTA_E;
  if (!passed) {
    problems.push(
      `ΔE ${check.first.toUpperCase()}-${check.second.toUpperCase()} = ${delta.toFixed(2)} < ${MINIMUM_DELTA_E}`,
    );
  }
  console.log(
    `  ${`${check.first.toUpperCase()}-${check.second.toUpperCase()}`.padEnd(12)}${format(delta)}  ${String(
      MINIMUM_DELTA_E,
    ).padStart(6)}  ${passed ? 'lulus' : 'GAGAL'}`,
  );
}

const missingCountries = COUNTRY_IDS.filter((id) => !tokens.has(`--country-${id}`));
if (missingCountries.length > 0) {
  problems.push(
    `warna negara hilang: ${missingCountries.map((id) => `--country-${id}`).join(', ')}`,
  );
}

// --- Selisih terhadap angka DESIGN.md --------------------------------------
const contrastDeltas = [];
for (const check of CONTRAST_CHECKS) {
  const foreground = tokens.get(check.foreground);
  const background = tokens.get(check.background);
  if (!foreground || !background) {
    continue;
  }
  contrastDeltas.push({
    label: `${check.foreground} di ${check.background}`,
    measured: contrastRatio(foreground, background),
    design: check.design,
  });
}

const distanceDeltas = [];
for (const check of DISTANCE_CHECKS) {
  const first = tokens.get(`--country-${check.first}`);
  const second = tokens.get(`--country-${check.second}`);
  if (!first || !second) {
    continue;
  }
  distanceDeltas.push({
    label: `${check.first.toUpperCase()}-${check.second.toUpperCase()}`,
    measured: deltaE00Hex(first, second),
    design: check.design,
  });
}

console.log('');
console.log('[contrast] selisih vs angka DESIGN.md (DESIGN tidak diubah)');
console.log('  metrik                       hitung   DESIGN   selisih');
for (const item of [...contrastDeltas, ...distanceDeltas]) {
  const hasDesign = typeof item.design === 'number';
  const delta = hasDesign ? item.measured - item.design : null;
  console.log(
    `  ${item.label.padEnd(28)}${format(item.measured)}${hasDesign ? format(item.design) : '     —  '}${
      delta === null ? '     —' : format(delta, 2)
    }`,
  );
}

const drift = [...contrastDeltas, ...distanceDeltas].filter(
  (item) => typeof item.design === 'number' && Math.abs(item.measured - item.design) >= 0.05,
);
if (drift.length > 0) {
  console.log('');
  console.log(
    `[contrast] CATATAN: ${drift.length} angka DESIGN.md berbeda dari hasil hitung di atas.`,
  );
  console.log('[contrast] Token tidak diubah; laporkan selisih ini ke pemilik DESIGN.md.');
}

console.log('');
if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`[contrast] GAGAL: ${problem}`);
  }
  process.exit(1);
}

console.log('[contrast] semua ambang lulus.');
