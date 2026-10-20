#!/usr/bin/env node
/**
 * Verifies public/models/asia.glb without third-party dependencies.
 *
 * Reads the GLB container header + JSON chunk directly, then checks:
 *  - 15 mesh nodes, each carrying extras.iso_a3 for the expected country set
 *  - KHR_draco_mesh_compression listed in extensionsUsed
 *  - file size <= 500 KB, total triangles <= 60,000
 *  - manifest (asia.manifest.json) matches the GLB
 *
 * Usage: node scripts/verify-model.mjs [path/to/model.glb]
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_PATH = process.argv[2]
  ? resolve(process.argv[2])
  : join(ROOT, 'public/models/asia.glb');
const MANIFEST_PATH = join(dirname(MODEL_PATH), 'asia.manifest.json');

const MAX_BYTES = 500 * 1024;
const MAX_TRIANGLES = 60000;

const EXPECTED = [
  { id: 'cn', iso3: 'CHN', name: 'China' },
  { id: 'in', iso3: 'IND', name: 'India' },
  { id: 'id', iso3: 'IDN', name: 'Indonesia' },
  { id: 'jp', iso3: 'JPN', name: 'Japan' },
  { id: 'kr', iso3: 'KOR', name: 'South Korea' },
  { id: 'my', iso3: 'MYS', name: 'Malaysia' },
  { id: 'ph', iso3: 'PHL', name: 'Philippines' },
  { id: 'sg', iso3: 'SGP', name: 'Singapore' },
  { id: 'th', iso3: 'THA', name: 'Thailand' },
  { id: 'vn', iso3: 'VNM', name: 'Vietnam' },
  { id: 'sa', iso3: 'SAU', name: 'Saudi Arabia' },
  { id: 'tr', iso3: 'TUR', name: 'Turkey' },
  { id: 'kz', iso3: 'KAZ', name: 'Kazakhstan' },
  { id: 'uz', iso3: 'UZB', name: 'Uzbekistan' },
  { id: 'mn', iso3: 'MNG', name: 'Mongolia' },
];

const GLB_MAGIC = 0x46546c67; // "glTF"
const CHUNK_JSON = 0x4e4f534a; // "JSON"
const CHUNK_BIN = 0x004e4942; // "BIN\0"

const checks = [];

function check(name, passed, detail) {
  checks.push({ name, passed: Boolean(passed), detail });
}

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function readGlb(path) {
  const buffer = readFileSync(path);

  if (buffer.length < 20) {
    throw new Error(`file terlalu kecil untuk GLB (${buffer.length} byte)`);
  }
  const magic = buffer.readUInt32LE(0);
  if (magic !== GLB_MAGIC) {
    throw new Error(`magic bukan glTF: 0x${magic.toString(16)}`);
  }
  const version = buffer.readUInt32LE(4);
  const declaredLength = buffer.readUInt32LE(8);
  if (version !== 2) throw new Error(`versi glTF ${version} tidak didukung`);
  if (declaredLength !== buffer.length) {
    throw new Error(`panjang header ${declaredLength} != ukuran file ${buffer.length}`);
  }

  let offset = 12;
  let json = null;
  let chunkTypes = [];
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    if (dataStart + chunkLength > buffer.length) {
      throw new Error(`chunk @${offset} melewati akhir file`);
    }
    chunkTypes.push(
      chunkType === CHUNK_JSON
        ? 'JSON'
        : chunkType === CHUNK_BIN
          ? 'BIN'
          : `0x${chunkType.toString(16)}`,
    );
    if (chunkType === CHUNK_JSON && json === null) {
      json = JSON.parse(buffer.subarray(dataStart, dataStart + chunkLength).toString('utf8'));
    }
    offset = dataStart + chunkLength;
  }

  if (json === null) throw new Error('chunk JSON tidak ditemukan');
  return { json, chunkTypes };
}

function trianglesForMesh(gltf, mesh) {
  let triangles = 0;
  for (const primitive of mesh.primitives ?? []) {
    const mode = primitive.mode ?? 4;
    if (mode !== 4) continue; // only TRIANGLES contribute to the budget
    const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION;
    const accessor = accessorIndex === undefined ? undefined : gltf.accessors?.[accessorIndex];
    if (!accessor) continue;
    triangles += Math.floor(accessor.count / 3);
  }
  return triangles;
}

function main() {
  if (!existsSync(MODEL_PATH)) {
    console.error(`[model:verify] GAGAL: file tidak ditemukan — ${MODEL_PATH}`);
    console.error('[model:verify] jalankan `npm run model:build` lebih dulu.');
    process.exit(1);
  }

  const size = statSync(MODEL_PATH).size;
  let gltf;
  let chunkTypes;
  try {
    ({ json: gltf, chunkTypes } = readGlb(MODEL_PATH));
  } catch (error) {
    console.error(`[model:verify] GAGAL membaca GLB: ${error.message}`);
    process.exit(1);
  }

  const nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  const meshNodes = nodes.filter((node) => typeof node.mesh === 'number');
  const meshes = Array.isArray(gltf.meshes) ? gltf.meshes : [];
  const extensionsUsed = Array.isArray(gltf.extensionsUsed) ? gltf.extensionsUsed : [];

  const rows = meshNodes.map((node) => {
    const mesh = meshes[node.mesh] ?? { primitives: [] };
    return {
      node: node.name ?? '(tanpa nama)',
      iso3: node.extras?.iso_a3,
      country: node.extras?.country,
      height: node.extras?.height,
      triangles: trianglesForMesh(gltf, mesh),
    };
  });

  const totalTriangles = rows.reduce((sum, row) => sum + row.triangles, 0);
  const presentIso3 = new Set(rows.map((row) => row.iso3).filter(Boolean));
  const missingIso3 = EXPECTED.filter((entry) => !presentIso3.has(entry.iso3));
  const unexpectedIso3 = [...presentIso3].filter(
    (iso3) => !EXPECTED.some((entry) => entry.iso3 === iso3),
  );
  const nodesWithoutExtras = rows.filter((row) => !row.iso3);

  check('15 node mesh', meshNodes.length === 15, `ditemukan ${meshNodes.length}`);
  check(
    'semua ISO3 lengkap',
    missingIso3.length === 0 && unexpectedIso3.length === 0,
    missingIso3.length || unexpectedIso3.length
      ? `hilang: ${missingIso3.map((entry) => entry.iso3).join(', ') || '-'}; asing: ${
          unexpectedIso3.join(', ') || '-'
        }`
      : '15/15',
  );
  check(
    'Draco aktif',
    extensionsUsed.includes('KHR_draco_mesh_compression'),
    extensionsUsed.length ? extensionsUsed.join(', ') : '(extensionsUsed kosong)',
  );
  check(`ukuran <= ${fmtBytes(MAX_BYTES)}`, size <= MAX_BYTES, fmtBytes(size));
  check(
    `total triangle <= ${MAX_TRIANGLES.toLocaleString('en-US')}`,
    totalTriangles <= MAX_TRIANGLES,
    totalTriangles.toLocaleString('en-US'),
  );
  check(
    'extras.iso_a3 di setiap node',
    nodesWithoutExtras.length === 0,
    nodesWithoutExtras.length
      ? `tanpa extras: ${nodesWithoutExtras.map((row) => row.node).join(', ')}`
      : '15/15',
  );

  // Manifest must describe exactly the geometry that shipped in the GLB.
  let manifestProblem = null;
  let manifest = null;
  if (!existsSync(MANIFEST_PATH)) {
    manifestProblem = `manifest tidak ada: ${relative(ROOT, MANIFEST_PATH)}`;
  } else {
    try {
      manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
      if (!Array.isArray(manifest) || manifest.length !== 15) {
        manifestProblem = `manifest berisi ${Array.isArray(manifest) ? manifest.length : 'non-array'} entri`;
      } else {
        for (const entry of manifest) {
          const row = rows.find((candidate) => candidate.iso3 === entry.iso3);
          if (!row) {
            manifestProblem = `manifest memuat ${entry.iso3} yang tidak ada di GLB`;
            break;
          }
          if (row.triangles !== entry.triangles) {
            manifestProblem = `triangle ${entry.iso3}: manifest ${entry.triangles} != GLB ${row.triangles}`;
            break;
          }
          if (entry.id !== EXPECTED.find((expected) => expected.iso3 === entry.iso3)?.id) {
            manifestProblem = `id ${entry.iso3} tidak sesuai (${entry.id})`;
            break;
          }
        }
      }
    } catch (error) {
      manifestProblem = `manifest tidak bisa dibaca: ${error.message}`;
    }
  }
  check('manifest sinkron', manifestProblem === null, manifestProblem ?? '15 entri cocok');

  const width = Math.max(...rows.map((row) => row.node.length), 6);
  console.log(
    `\n[model:verify] ${relative(ROOT, MODEL_PATH)} (${fmtBytes(size)}, chunk: ${chunkTypes.join(' + ')})`,
  );
  console.log(
    `${'node'.padEnd(width)}  ${'iso3'}  ${'id'}  ${'tris'.padStart(7)}  ${'height'.padStart(6)}  country`,
  );
  const order = EXPECTED.map((entry) => entry.iso3);
  const sorted = [...rows].sort((a, b) => order.indexOf(a.iso3) - order.indexOf(b.iso3));
  for (const row of sorted) {
    const expected = EXPECTED.find((entry) => entry.iso3 === row.iso3);
    console.log(
      `${row.node.padEnd(width)}  ${(row.iso3 ?? '?').padEnd(4)}  ${(expected?.id ?? '?').padEnd(2)}  ` +
        `${String(row.triangles).padStart(7)}  ${String(row.height ?? '?').padStart(6)}  ${row.country ?? '?'}`,
    );
  }
  console.log(
    `${'TOTAL'.padEnd(width)}  ${''.padEnd(4)}  ${''.padEnd(2)}  ${String(totalTriangles).padStart(7)}`,
  );

  console.log('');
  let failed = 0;
  for (const result of checks) {
    const label = result.passed ? 'OK  ' : 'GAGAL';
    console.log(`[model:verify] ${label} ${result.name} — ${result.detail}`);
    if (!result.passed) failed += 1;
  }

  if (failed > 0) {
    console.error(`\n[model:verify] ${failed} pemeriksaan gagal.`);
    process.exit(1);
  }
  console.log('\n[model:verify] semua pemeriksaan lulus.');
}

main();
