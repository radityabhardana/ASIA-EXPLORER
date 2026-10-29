import {
  BufferAttribute,
  BufferGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  MeshBasicMaterial,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Path,
  Shape,
  Vector2,
  Vector3,
} from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { INK, countryColor, hoverTint } from './palette.js';

/**
 * GeoJSON -> geometri 3D per negara (Archival Architectural Relief).
 * - Ketebalan presisi (DEPTH = 0.16) memangkas dinding samping agar ramping seperti pelat kartografi arsitektural.
 * - Micro-bevel halus (bevelThickness: 0.02, bevelSize: 0.018) menangkap rim light di pesisir pantai & teluk maritim.
 * - Material PBR MeshStandardMaterial (matte refined relief) dengan roughness 0.44 dan metalness 0.04
 *   membuat benua tampak hidup bercahaya tanpa bayangan kotor antar-perbatasan.
 * - Self-shadowing antar negara dimatikan (receiveShadow = false) agar hanya bayangan benua jatuh ke tanah,
 *   mencegah dinding samping tampak tebal/kusam.
 * - Garis batas kartografi warm charcoal 0.5px memisahkan tiap negara secara tegas.
 * - Elevasi mikro bertingkat pada dataran tinggi (Himalaya/Pamir/Kaukasus).
 */
export const DEPTH = 0.16;
export const BEVEL_THICKNESS = 0.02;
export const BEVEL_SIZE = 0.018;
export const INTRO_DROP = 3.2; // jarak negara "tenggelam" sebelum intro naik

const HIGHLAND_CODES = new Set(['NPL', 'BTN', 'TJK', 'KGZ', 'AFG', 'MNG', 'GEO', 'ARM']);
const MIN_DIAGONAL = 3.2;
const MAX_INFLATE = 4.6;
const MIN_PIECE_DIAG = 0.12; // ring di bawah ini cuma noise sub-pixel
const MIN_HOLE_DIAG = 0.8;
const MIN_HOLE_AREA = 0.5;
const REGION_DELAY = 0.18;
const STEP_DELAY = 0.032;
const RISE_TIME = 0.95;
const REGION_ORDER = ['West Asia', 'Central Asia', 'South Asia', 'Southeast Asia', 'East Asia'];

function polygonsOf(geometry) {
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry.coordinates];
  if (geometry.type === 'MultiPolygon') return geometry.coordinates;
  return [];
}

/** Buang titik duplikat berturut-turut & titik penutup (GeoJSON rings closed). */
function normalizeRing(ring) {
  const out = [];
  for (const p of ring) {
    const last = out[out.length - 1];
    if (!last || last[0] !== p[0] || last[1] !== p[1]) out.push(p);
  }
  if (out.length > 1) {
    const a = out[0];
    const b = out[out.length - 1];
    if (a[0] === b[0] && a[1] === b[1]) out.pop();
  }
  return out;
}

function planeRing(ring, project) {
  const pts = [];
  for (const p of ring) {
    if (!Number.isFinite(p[0]) || !Number.isFinite(p[1])) continue;
    pts.push(project(p[0], p[1]));
  }
  return pts;
}

function bounds2(pts) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [x, y] of pts) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const w = maxX - minX;
  const h = maxY - minY;
  return {
    minX,
    minY,
    maxX,
    maxY,
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    diag: Math.hypot(w, h),
  };
}

function scaleAbout(pts, cx, cy, f) {
  return pts.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f]);
}

function ringArea(pts) {
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    sum += a[0] * b[1] - b[0] * a[1];
  }
  return Math.abs(sum) / 2;
}

/** Ring yang lolos filter visual: minimal 3 titik & bukan noise sub-pixel. */
function buildRing(ring, project) {
  const pts = planeRing(normalizeRing(ring), project);
  if (pts.length < 3) return null;
  const bounds = bounds2(pts);
  if (bounds.diag < MIN_PIECE_DIAG) return null;
  return { pts, bounds };
}

/** Union bbox seluruh piece satu negara, dipakai untuk keputusan inflate. */
function countryBounds(pieces) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const { bounds: b } of pieces) {
    if (b.minX < minX) minX = b.minX;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxY > maxY) maxY = b.maxY;
  }
  return {
    cx: (minX + maxX) / 2,
    cy: (minY + maxY) / 2,
    diag: Math.hypot(maxX - minX, maxY - minY),
  };
}

export function buildCountries(featureCollection, projection) {
  const project = projection.project.bind(projection);
  // ---- pass 1: kumpulkan semua titik mentah untuk fit proyeksi
  const raw = [];
  for (const feature of featureCollection.features || []) {
    for (const poly of polygonsOf(feature.geometry)) {
      for (const ring of poly) {
        for (const p of normalizeRing(ring)) {
          if (Number.isFinite(p[0]) && Number.isFinite(p[1])) raw.push(projection.raw(p[0], p[1]));
        }
      }
    }
  }
  const world = projection.fit(raw);

  // ---- pass 2: bangun geometri
  const countries = [];
  const group = new Group();
  group.name = 'asia-countries';

  for (const feature of featureCollection.features || []) {
    const props = feature.properties || {};
    if (!props.code) continue;

    const pieces = [];
    for (const poly of polygonsOf(feature.geometry)) {
      const outer = buildRing(poly[0] || [], project);
      if (!outer) continue;
      const holes = [];
      for (let i = 1; i < poly.length; i++) {
        const hole = buildRing(poly[i], project);
        if (hole) holes.push(hole.pts);
      }
      pieces.push({ outer: outer.pts, holes, bounds: outer.bounds });
    }
    if (!pieces.length) continue;

    // inflate hanya kalau SELURUH negara mikro; pulau di negara besar dibiarkan asli
    const cb = countryBounds(pieces);
    const factor =
      cb.diag < MIN_DIAGONAL ? Math.min(MAX_INFLATE, MIN_DIAGONAL / Math.max(cb.diag, 1e-6)) : 1;
    if (factor > 1) {
      for (const piece of pieces) {
        piece.outer = scaleAbout(piece.outer, cb.cx, cb.cy, factor);
        piece.holes = piece.holes.map((h) => scaleAbout(h, cb.cx, cb.cy, factor));
        piece.bounds = bounds2(piece.outer);
      }
    }

    // lubang asli saja: sliver <0.8 unit / area <0.5 unit^2 dibuang
    for (const piece of pieces) {
      piece.holes = piece.holes.filter(
        (h) => bounds2(h).diag >= MIN_HOLE_DIAG && ringArea(h) >= MIN_HOLE_AREA,
      );
    }

    // extrude: micro-bevel presisi untuk rim highlight, curveSegments rendah, triangulasi default
    const pieceGeoms = pieces.map(({ outer, holes }) => {
      const shape = new Shape(outer.map((p) => new Vector2(p[0], p[1])));
      for (const h of holes) {
        shape.holes.push(new Path(h.map((p) => new Vector2(p[0], p[1]))));
      }
      return new ExtrudeGeometry(shape, {
        depth: DEPTH,
        bevelEnabled: true,
        bevelThickness: BEVEL_THICKNESS,
        bevelSize: BEVEL_SIZE,
        bevelSegments: 1,
        curveSegments: 1,
        steps: 1,
      });
    });
    let geom;
    if (pieceGeoms.length === 1) {
      geom = pieceGeoms[0];
    } else {
      geom = mergeGeometries(pieceGeoms, false);
      if (geom) {
        for (const g of pieceGeoms) g.dispose();
      } else {
        // fallback: merge gagal -> pakai piece pertama, sisanya dibuang
        geom = pieceGeoms[0];
        for (let i = 1; i < pieceGeoms.length; i++) pieceGeoms[i].dispose();
      }
    }
    geom.rotateX(-Math.PI / 2); // bidang XY peta -> bidang XZ dunia, extrude ke atas

    // garis negara: ring kartografi di permukaan atas, tipis & rapi memisahkan tiap bangsa
    const lineArr = [];
    const lineY = DEPTH + BEVEL_THICKNESS + 0.006;
    for (const { outer, holes } of pieces) {
      for (const ring of [outer, ...holes]) {
        for (let i = 0; i < ring.length; i++) {
          const a = ring[i];
          const b = ring[(i + 1) % ring.length];
          lineArr.push(a[0], lineY, -a[1], b[0], lineY, -b[1]);
        }
      }
    }
    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute('position', new BufferAttribute(new Float32Array(lineArr), 3));
    const line = new LineSegments(
      lineGeo,
      new LineBasicMaterial({
        color: 0x222a35,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      }),
    );

    // pusat & ukuran negara untuk fokus kamera + anchor label
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const { bounds: b } of pieces) {
      if (b.minX < minX) minX = b.minX;
      if (b.maxX > maxX) maxX = b.maxX;
      if (b.minY < minY) minY = b.minY;
      if (b.maxY > maxY) maxY = b.maxY;
    }
    const diag = Math.hypot(maxX - minX, maxY - minY);
    const center = new Vector3((minX + maxX) / 2, 0, -(minY + maxY) / 2);
    const anchor = new Vector3(center.x, DEPTH + BEVEL_THICKNESS + 0.9, center.z);

    const baseColor = countryColor(props.region, props.code);
    // Material PBR MeshStandardMaterial (tekstur relief kartografi halus & hidup)
    const material = new MeshStandardMaterial({
      color: baseColor.clone(),
      roughness: 0.44,
      metalness: 0.04,
      flatShading: false,
    });
    const mesh = new Mesh(geom, material);
    mesh.castShadow = true;
    // Nonaktifkan receiveShadow agar antar-negara tidak saling menembakkan bayangan kotor
    mesh.receiveShadow = false;

    const cGroup = new Group();
    cGroup.add(mesh, line);

    let proxyMesh = null;
    if (diag < 8.5 || ['SGP', 'BHR', 'QAT', 'LBN', 'KWT', 'BRN', 'MDV', 'CYP', 'PSE'].includes(props.code)) {
      const radius = Math.max(3.2, (8.5 - diag) * 0.75);
      const proxyGeo = new CylinderGeometry(radius, radius, DEPTH + 1.2, 12);
      proxyGeo.rotateX(Math.PI / 2);
      const proxyMat = new MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      proxyMesh = new Mesh(proxyGeo, proxyMat);
      proxyMesh.position.set(center.x, DEPTH * 0.5, center.z);
      cGroup.add(proxyMesh);
    }

    group.add(cGroup);

    const meta = {
      code: props.code,
      name: props.name || props.code,
      region: props.region || 'Other',
      elevation: HIGHLAND_CODES.has(props.code) ? 0.09 : 0,
      group: cGroup,
      mesh,
      proxyMesh,
      line,
      material,
      baseColor,
      hoverColor: hoverTint(baseColor),
      center,
      anchor,
      focusDist: diag * 1.35,
      hoverS: 0, // smoothing hover (0..1)
      liftS: 0, // ketinggian lift halus
      riseK: 0, // 0 = tenggelam, 1 = muncul
      riseDelay: 0,
      riseDuration: RISE_TIME,
    };
    mesh.userData.country = meta;
    if (proxyMesh) proxyMesh.userData.country = meta;
    countries.push(meta);
  }

  // ---- jadwal intro: per region (barat->timur) + sweep barat->timur dalam region
  const buckets = new Map();
  for (const c of countries) {
    const list = buckets.get(c.region) || [];
    list.push(c);
    buckets.set(c.region, list);
  }
  REGION_ORDER.forEach((region, ri) => {
    const bucket = (buckets.get(region) || []).sort((a, b) => a.center.x - b.center.x);
    bucket.forEach((c, i) => {
      c.riseDelay = REGION_DELAY * ri + STEP_DELAY * i;
    });
  });

  return { group, countries, world };
}

/**
 * Animasi per-frame negara: rise intro (drop -> 0), lift hover/fokus,
 * dan transisi warna (base -> hover). Semua smoothing eksponensial.
 */
export function animateCountries(countries, dt, hover, focus) {
  for (const c of countries) {
    const lit = c === hover || c === focus;
    c.hoverS += ((lit ? 1 : 0) - c.hoverS) * Math.min(1, dt * 9);
    const liftTarget = c === focus ? 0.8 : lit ? 0.45 : 0;
    c.liftS += (liftTarget - c.liftS) * Math.min(1, dt * 10);
    c.group.position.y = -INTRO_DROP * (1 - c.riseK) + c.liftS + (c.elevation || 0) * c.riseK;

    c.material.color.lerpColors(c.baseColor, c.hoverColor, c.hoverS);
    c.material.emissive.copy(c.baseColor).multiplyScalar(0.24 * c.hoverS);
    c.line.material.opacity = 0.42 * c.riseK + 0.45 * c.hoverS;
  }
}
