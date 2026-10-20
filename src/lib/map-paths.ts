/*
 * Generator geometri peta 2D — dipakai `scripts/gen-map-paths.mjs` (build step)
 * dan unit test. Tidak ada dependency: proyeksi + simplifikasi ditulis di sini.
 *
 * Proyeksi: Lambert azimuthal equal-area, pusat 90°E / 32°N — rumus identik
 * dengan `tools/build-asia.py` supaya peta SVG dan mesh GLB punya bentuk sama.
 *
 * Hasil akhir dinormalisasi ke kotak `0 0 1000 1000` (viewBox tetap), dengan
 * padding 20 unit di sisi terpendek.
 */

export type GeoPosition = [number, number];
export type GeoRing = GeoPosition[];
export type GeoPolygon = GeoRing[];
export type GeoGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: GeoPolygon[] | GeoPolygon;
};
export type GeoFeature = {
  properties?: Record<string, unknown> | null;
  geometry?: GeoGeometry | null;
};
export type GeoCollection = { type?: string; features?: GeoFeature[] };

export type Point = [number, number];

export type MapPathEntry = {
  id: string;
  iso3: string;
  name_id: string;
  paletteKey: string;
  d: string;
  centroid: [number, number];
  bbox: [number, number, number, number];
};

export const MAP_VIEW_BOX = 1000;
const PADDING = 20;
const EARTH_RADIUS = 100;
const LON0 = 90;
const LAT0 = 32;

/** Toleransi Douglas-Peucker dalam satuan proyeksi (1 unit ≈ 63.7 km). */
const TOLERANCE_STEPS = [0.05, 0.08, 0.12] as const;
const MAX_TOTAL_POINTS = 9000;

/** Pulau di bawah ambang ini tidak terlihat pada skala peta. */
const MIN_ISLAND_AREA = 0.01;

/** Ring pendek tidak disederhanakan — Singapura kehilangan bentuk. */
const KEEP_UNSIMPLIFIED_ABOVE = 32;

/** Urutan mengikuti tabel DESIGN.md §3 (daftar PRD v2.3 §5.1). */
export const MAP_COUNTRIES = [
  { id: 'id', iso3: 'IDN', name_id: 'Indonesia' },
  { id: 'my', iso3: 'MYS', name_id: 'Malaysia' },
  { id: 'sg', iso3: 'SGP', name_id: 'Singapura' },
  { id: 'th', iso3: 'THA', name_id: 'Thailand' },
  { id: 'vn', iso3: 'VNM', name_id: 'Vietnam' },
  { id: 'ph', iso3: 'PHL', name_id: 'Filipina' },
  { id: 'cn', iso3: 'CHN', name_id: 'Tiongkok' },
  { id: 'jp', iso3: 'JPN', name_id: 'Jepang' },
  { id: 'kr', iso3: 'KOR', name_id: 'Korea Selatan' },
  { id: 'in', iso3: 'IND', name_id: 'India' },
  { id: 'sa', iso3: 'SAU', name_id: 'Arab Saudi' },
  { id: 'tr', iso3: 'TUR', name_id: 'Turki' },
  { id: 'kz', iso3: 'KAZ', name_id: 'Kazakhstan' },
  { id: 'uz', iso3: 'UZB', name_id: 'Uzbekistan' },
  { id: 'mn', iso3: 'MNG', name_id: 'Mongolia' },
] as const;

export type MapCountryId = (typeof MAP_COUNTRIES)[number]['id'];

const PHI0 = (LAT0 * Math.PI) / 180;
const RAD = Math.PI / 180;

type RawPolygon = { outer: Point[]; holes: Point[][] };
type RawCountry = {
  id: string;
  iso3: string;
  name_id: string;
  polygons: RawPolygon[];
};

export function project(lon: number, lat: number): Point {
  const lam = (lon - LON0) * RAD;
  const phi = lat * RAD;
  let denominator =
    1 +
    Math.sin(PHI0) * Math.sin(phi) +
    Math.cos(PHI0) * Math.cos(phi) * Math.cos(lam);
  if (denominator <= 1e-9) {
    denominator = 1e-9;
  }
  const k = Math.sqrt(2 / denominator);
  const x = EARTH_RADIUS * k * Math.cos(phi) * Math.sin(lam);
  const y =
    EARTH_RADIUS *
    k *
    (Math.cos(PHI0) * Math.sin(phi) -
      Math.sin(PHI0) * Math.cos(phi) * Math.cos(lam));
  return [x, y];
}

/** Area bertanda sebuah ring (positif = berlawanan jarum jam). */
export function signedArea(points: Point[]): number {
  let total = 0;
  for (let index = 0; index < points.length; index += 1) {
    const current = points[index];
    const next = points[(index + 1) % points.length];
    if (!current || !next) {
      continue;
    }
    total += current[0] * next[1] - next[0] * current[1];
  }
  return total / 2;
}

/** Douglas-Peucker pada ring tertutup. Deterministik, tanpa random. */
export function simplifyRing(points: Point[], tolerance: number): Point[] {
  if (points.length < 4) {
    return points.map((point) => [point[0], point[1]]);
  }
  const first = points[0];
  if (!first) {
    return [];
  }
  const ring: Point[] = [...points, [first[0], first[1]]];
  const keep = new Array<boolean>(ring.length).fill(false);
  keep[0] = true;
  keep[ring.length - 1] = true;

  const toleranceSq = tolerance * tolerance;
  const stack: Array<[number, number]> = [[0, ring.length - 1]];

  while (stack.length > 0) {
    const segment = stack.pop();
    if (!segment) {
      break;
    }
    const [start, end] = segment;
    if (end <= start + 1) {
      continue;
    }
    const startPoint = ring[start];
    const endPoint = ring[end];
    if (!startPoint || !endPoint) {
      continue;
    }
    const dx = endPoint[0] - startPoint[0];
    const dy = endPoint[1] - startPoint[1];
    const lengthSq = dx * dx + dy * dy;

    let bestDistanceSq = -1;
    let bestIndex = -1;
    for (let index = start + 1; index < end; index += 1) {
      const point = ring[index];
      if (!point) {
        continue;
      }
      let distanceSq: number;
      if (lengthSq <= 1e-18) {
        distanceSq = (point[0] - startPoint[0]) ** 2 + (point[1] - startPoint[1]) ** 2;
      } else {
        let t =
          ((point[0] - startPoint[0]) * dx + (point[1] - startPoint[1]) * dy) /
          lengthSq;
        t = t < 0 ? 0 : t > 1 ? 1 : t;
        const qx = startPoint[0] + t * dx;
        const qy = startPoint[1] + t * dy;
        distanceSq = (point[0] - qx) ** 2 + (point[1] - qy) ** 2;
      }
      if (distanceSq > bestDistanceSq) {
        bestDistanceSq = distanceSq;
        bestIndex = index;
      }
    }

    if (bestDistanceSq > toleranceSq && bestIndex > 0) {
      keep[bestIndex] = true;
      stack.push([start, bestIndex]);
      stack.push([bestIndex, end]);
    }
  }

  const simplified: Point[] = [];
  for (let index = 0; index < ring.length - 1; index += 1) {
    const point = ring[index];
    if (point && keep[index]) {
      simplified.push([point[0], point[1]]);
    }
  }
  return simplified;
}

function projectRing(ring: GeoRing, tolerance: number): Point[] | null {
  const projected: Point[] = [];
  for (const coordinate of ring) {
    if (!Array.isArray(coordinate) || coordinate.length < 2) {
      continue;
    }
    const lon = coordinate[0];
    const lat = coordinate[1];
    if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
      continue;
    }
    projected.push(project(lon, lat));
  }

  const first = projected[0];
  const last = projected[projected.length - 1];
  if (first && last && first[0] === last[0] && first[1] === last[1]) {
    projected.pop();
  }
  if (projected.length < 3) {
    return null;
  }

  const shaped =
    projected.length > KEEP_UNSIMPLIFIED_ABOVE
      ? simplifyRing(projected, tolerance)
      : projected;
  return shaped.length >= 3 ? shaped : null;
}

function iso3Of(properties: Record<string, unknown> | null | undefined): string {
  if (!properties) {
    return '';
  }
  for (const key of ['ISO_A3', 'ADM0_A3', 'ISO_A3_EH']) {
    const value = properties[key];
    if (typeof value === 'string' && value.length === 3 && value !== '-99') {
      return value;
    }
  }
  return '';
}

function collectShapes(
  collection: GeoCollection,
  tolerance: number,
): RawCountry[] {
  const byIso3 = new Map<string, RawPolygon[]>();
  for (const country of MAP_COUNTRIES) {
    byIso3.set(country.iso3, []);
  }

  for (const feature of collection.features ?? []) {
    const iso3 = iso3Of(feature.properties);
    const polygons = byIso3.get(iso3);
    const geometry = feature.geometry;
    if (!polygons || !geometry) {
      continue;
    }

    const rawPolygons: GeoPolygon[] =
      geometry.type === 'MultiPolygon'
        ? (geometry.coordinates as GeoPolygon[])
        : [geometry.coordinates as GeoPolygon];

    for (const rawPolygon of rawPolygons) {
      if (!Array.isArray(rawPolygon) || rawPolygon.length === 0) {
        continue;
      }
      const outerRing = rawPolygon[0];
      if (!outerRing) {
        continue;
      }
      const outer = projectRing(outerRing, tolerance);
      if (!outer || Math.abs(signedArea(outer)) < MIN_ISLAND_AREA) {
        continue;
      }

      const holes: Point[][] = [];
      for (let index = 1; index < rawPolygon.length; index += 1) {
        const rawHole = rawPolygon[index];
        if (!rawHole) {
          continue;
        }
        const hole = projectRing(rawHole, tolerance);
        if (!hole || Math.abs(signedArea(hole)) < MIN_ISLAND_AREA * 0.05) {
          continue;
        }
        holes.push(hole);
      }

      polygons.push({ outer, holes });
    }
  }

  const missing = MAP_COUNTRIES.filter(
    (country) => (byIso3.get(country.iso3) ?? []).length === 0,
  );
  if (missing.length > 0) {
    throw new Error(
      `negara tidak ditemukan di GeoJSON: ${missing
        .map((country) => country.iso3)
        .join(', ')}`,
    );
  }

  return MAP_COUNTRIES.map((country) => ({
    id: country.id,
    iso3: country.iso3,
    name_id: country.name_id,
    polygons: byIso3.get(country.iso3) ?? [],
  }));
}

function countPoints(countries: RawCountry[]): number {
  let total = 0;
  for (const country of countries) {
    for (const polygon of country.polygons) {
      total += polygon.outer.length;
      for (const hole of polygon.holes) {
        total += hole.length;
      }
    }
  }
  return total;
}

function bounds(countries: RawCountry[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (const country of countries) {
    for (const polygon of country.polygons) {
      for (const point of polygon.outer) {
        if (point[0] < minX) minX = point[0];
        if (point[0] > maxX) maxX = point[0];
        if (point[1] < minY) minY = point[1];
        if (point[1] > maxY) maxY = point[1];
      }
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    throw new Error('bbox gabungan tidak valid — tidak ada titik terproyeksi');
  }
  return { minX, minY, maxX, maxY };
}

function round2(value: number): number {
  const rounded = Math.round(value * 100) / 100;
  return Object.is(rounded, -0) ? 0 : rounded;
}

function pathData(rings: Point[][]): string {
  const parts: string[] = [];
  for (const ring of rings) {
    if (ring.length === 0) {
      continue;
    }
    let part = '';
    for (let index = 0; index < ring.length; index += 1) {
      const point = ring[index];
      if (!point) {
        continue;
      }
      part += `${index === 0 ? 'M' : 'L'}${round2(point[0])} ${round2(point[1])}`;
    }
    parts.push(`${part}Z`);
  }
  return parts.join(' ');
}

function polygonCentroid(ring: Point[]): { x: number; y: number; area: number } {
  let twiceArea = 0;
  let weightedX = 0;
  let weightedY = 0;
  for (let index = 0; index < ring.length; index += 1) {
    const current = ring[index];
    const next = ring[(index + 1) % ring.length];
    if (!current || !next) {
      continue;
    }
    const cross = current[0] * next[1] - next[0] * current[1];
    twiceArea += cross;
    weightedX += (current[0] + next[0]) * cross;
    weightedY += (current[1] + next[1]) * cross;
  }
  const area = twiceArea / 2;
  if (Math.abs(area) < 1e-9) {
    const mean = ring.reduce<[number, number]>(
      (accumulator, point) => [
        accumulator[0] + point[0] / ring.length,
        accumulator[1] + point[1] / ring.length,
      ],
      [0, 0],
    );
    return { x: mean[0], y: mean[1], area: 0 };
  }
  return {
    x: weightedX / (6 * area),
    y: weightedY / (6 * area),
    area,
  };
}

function normalizeToBox(countries: RawCountry[]): MapPathEntry[] {
  const box = bounds(countries);
  const available = MAP_VIEW_BOX - PADDING * 2;
  const width = Math.max(box.maxX - box.minX, 1e-6);
  const height = Math.max(box.maxY - box.minY, 1e-6);
  const scale = available / Math.max(width, height);
  const offsetX = PADDING + (available - width * scale) / 2;
  const offsetY = PADDING + (available - height * scale) / 2;

  const transform = (point: Point): Point => [
    offsetX + (point[0] - box.minX) * scale,
    // Sumbu Y SVG tumbuh ke bawah, proyeksi tumbuh ke utara.
    offsetY + (box.maxY - point[1]) * scale,
  ];

  return countries.map((country) => {
    const transformed = country.polygons.map((polygon) => ({
      outer: polygon.outer.map(transform),
      holes: polygon.holes.map((hole) => hole.map(transform)),
    }));

    let areaSum = 0;
    let centroidX = 0;
    let centroidY = 0;
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    for (const polygon of transformed) {
      const outerCentroid = polygonCentroid(polygon.outer);
      areaSum += Math.abs(outerCentroid.area);
      centroidX += outerCentroid.x * Math.abs(outerCentroid.area);
      centroidY += outerCentroid.y * Math.abs(outerCentroid.area);

      for (const hole of polygon.holes) {
        const holeCentroid = polygonCentroid(hole);
        areaSum -= Math.abs(holeCentroid.area);
        centroidX -= holeCentroid.x * Math.abs(holeCentroid.area);
        centroidY -= holeCentroid.y * Math.abs(holeCentroid.area);
      }

      for (const point of polygon.outer) {
        if (point[0] < minX) minX = point[0];
        if (point[0] > maxX) maxX = point[0];
        if (point[1] < minY) minY = point[1];
        if (point[1] > maxY) maxY = point[1];
      }
    }

    const denominator = Math.abs(areaSum) < 1e-9 ? 1 : areaSum;
    const centroid: [number, number] = [
      round2(centroidX / denominator),
      round2(centroidY / denominator),
    ];

    return {
      id: country.id,
      iso3: country.iso3,
      name_id: country.name_id,
      paletteKey: `--country-${country.id}`,
      d: pathData(transformed.flatMap((polygon) => [polygon.outer, ...polygon.holes])),
      centroid,
      bbox: [round2(minX), round2(minY), round2(maxX), round2(maxY)],
    };
  });
}

/**
 * Bangun 15 path SVG dari GeoJSON Natural Earth.
 * Determinstik: input sama -> output sama, byte per byte.
 */
export function buildMapPaths(collection: GeoCollection): MapPathEntry[] {
  let last: RawCountry[] | null = null;

  for (const tolerance of TOLERANCE_STEPS) {
    const countries = collectShapes(collection, tolerance);
    last = countries;
    if (countPoints(countries) <= MAX_TOTAL_POINTS) {
      return normalizeToBox(countries);
    }
  }

  if (!last) {
    throw new Error('tidak ada geometri yang bisa dibangun');
  }
  return normalizeToBox(last);
}

/** Jumlah titik pada output — dipakai laporan generator, bukan runtime. */
export function countEntryPoints(entries: MapPathEntry[]): number {
  let total = 0;
  for (const entry of entries) {
    total += entry.d.split(/[ML]/).length - 1;
  }
  return total;
}
