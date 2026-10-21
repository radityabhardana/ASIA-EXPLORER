#!/usr/bin/env node
/**
 * Acceptance evidence (a) for D21:
 * - Node count, total triangles, GLB file size
 * - Per-mesh extrusion height
 * - Confirm exactly 15 meshes carry extras.iso_a3
 * - Confirm context mesh carries none
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const MODEL_PATH = join(ROOT, 'public/models/asia.glb');
const MANIFEST_PATH = join(ROOT, 'public/models/asia.manifest.json');

const GLB_MAGIC = 0x46546c67;
const CHUNK_JSON = 0x4e4f534a;

function readGlb(path) {
  const buffer = readFileSync(path);
  if (buffer.length < 20) {
    throw new Error(`file too small: ${buffer.length} bytes`);
  }
  const magic = buffer.readUInt32LE(0);
  if (magic !== GLB_MAGIC) {
    throw new Error(`not a GLB: 0x${magic.toString(16)}`);
  }
  const version = buffer.readUInt32LE(4);
  if (version !== 2) {
    throw new Error(`unsupported version: ${version}`);
  }
  let offset = 12;
  let json = null;
  while (offset + 8 <= buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const dataStart = offset + 8;
    if (chunkType === CHUNK_JSON && json === null) {
      json = JSON.parse(buffer.subarray(dataStart, dataStart + chunkLength).toString('utf8'));
    }
    offset = dataStart + chunkLength;
  }
  if (json === null) {
    throw new Error('no JSON chunk');
  }
  return json;
}

function trianglesForMesh(gltf, mesh) {
  let triangles = 0;
  for (const primitive of mesh.primitives ?? []) {
    const mode = primitive.mode ?? 4;
    if (mode !== 4) continue;
    const accessorIndex = primitive.indices ?? primitive.attributes?.POSITION;
    const accessor = accessorIndex === undefined ? undefined : gltf.accessors?.[accessorIndex];
    if (!accessor) continue;
    triangles += Math.floor(accessor.count / 3);
  }
  return triangles;
}

function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function main() {
  if (!existsSync(MODEL_PATH)) {
    console.error(`Model not found: ${MODEL_PATH}`);
    process.exit(1);
  }

  const size = statSync(MODEL_PATH).size;
  const gltf = readGlb(MODEL_PATH);

  const nodes = Array.isArray(gltf.nodes) ? gltf.nodes : [];
  const meshNodes = nodes.filter((node) => typeof node.mesh === 'number');
  const meshes = Array.isArray(gltf.meshes) ? gltf.meshes : [];

  console.log('\n=== D21 ACCEPTANCE EVIDENCE (a) ===\n');

  // File size
  console.log(`GLB file: ${fmtBytes(size)}`);
  console.log(`Total nodes: ${nodes.length}`);
  console.log(`Mesh nodes: ${meshNodes.length}`);

  // Triangle count
  let totalTriangles = 0;
  const meshData = [];

  for (const node of meshNodes) {
    const mesh = meshes[node.mesh] ?? { primitives: [] };
    const triangles = trianglesForMesh(gltf, mesh);
    totalTriangles += triangles;
    meshData.push({
      name: node.name ?? '(unnamed)',
      iso3: node.extras?.iso_a3,
      height: node.extras?.height,
      triangles,
    });
  }

  console.log(`Total triangles: ${totalTriangles.toLocaleString('en-US')}`);
  console.log('');

  // Per-mesh breakdown
  console.log('Per-mesh data:');
  console.log('  node          iso3    height  triangles');
  console.log('  ------------- ------- ------- ---------');

  const contextMesh = meshData.find((m) => m.name === 'context');
  const pickableMeshes = meshData.filter((m) => m.iso3);

  if (contextMesh) {
    console.log(
      `  ${contextMesh.name.padEnd(13)} ${'(none)'.padEnd(7)} ${'flat'.padStart(7)} ${contextMesh.triangles.toLocaleString('en-US').padStart(9)}`,
    );
  }

  for (const m of pickableMeshes.sort((a, b) => (a.iso3 || '').localeCompare(b.iso3 || ''))) {
    console.log(
      `  ${m.name.padEnd(13)} ${m.iso3.padEnd(7)} ${String(m.height).padStart(7)} ${m.triangles.toLocaleString('en-US').padStart(9)}`,
    );
  }

  console.log('');

  // Confirmation checks
  const withIso3 = meshData.filter((m) => m.iso3);
  const withoutIso3 = meshData.filter((m) => !m.iso3);

  console.log('CONFIRMATION:');
  console.log(`  ✓ Exactly 15 meshes carry extras.iso_a3: ${withIso3.length === 15 ? 'YES' : 'NO (' + withIso3.length + ')'}`);
  console.log(`  ✓ Context mesh carries no iso_a3: ${contextMesh && !contextMesh.iso3 ? 'YES' : 'NO'}`);
  console.log(`  ✓ Total triangles ≤ 60,000: ${totalTriangles <= 60000 ? 'YES' : 'NO'}`);
  console.log(`  ✓ File size ≤ 600 KB: ${size <= 600 * 1024 ? 'YES' : 'NO'}`);

  // Extrusion height verification (D21: island 1.2, mainland 1.8)
  const islandNations = ['id', 'ph', 'my', 'sg', 'jp'];
  const expectedHeights = {
    CHN: 1.8, IND: 1.8, IDN: 1.2, JPN: 1.2, KOR: 1.8,
    MYS: 1.2, PHL: 1.2, SGP: 1.2, THA: 1.8, VNM: 1.8,
    SAU: 1.8, TUR: 1.8, KAZ: 1.8, UZB: 1.8, MNG: 1.8,
  };

  let heightsCorrect = true;
  for (const m of pickableMeshes) {
    const expected = expectedHeights[m.iso3];
    if (m.height !== expected) {
      heightsCorrect = false;
      console.log(`  ✗ Height mismatch: ${m.iso3} has ${m.height}, expected ${expected}`);
    }
  }
  console.log(`  ✓ Extrusion heights per D21: ${heightsCorrect ? 'YES' : 'NO'}`);

  // Manifest check
  if (existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
    console.log(`  ✓ Manifest entries: ${manifest.length}`);
  }

  console.log('\n=== END EVIDENCE ===\n');
}

main();
