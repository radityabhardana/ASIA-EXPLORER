import { describe, expect, it } from 'vitest';

import {
  buildMapPaths,
  MAP_COUNTRIES,
  MAP_VIEW_BOX,
  type GeoCollection,
  type GeoPosition,
  type GeoRing,
} from './map-paths';

const APPROX_CENTERS: Record<string, GeoPosition> = {
  IDN: [117, -2],
  MYS: [102, 4],
  SGP: [103.8, 1.3],
  THA: [101, 15],
  VNM: [106, 16],
  PHL: [122, 12],
  CHN: [105, 35],
  JPN: [138, 36],
  KOR: [127.5, 36],
  IND: [79, 22],
  SAU: [45, 24],
  TUR: [35, 39],
  KAZ: [68, 48],
  UZB: [64, 41],
  MNG: [103, 46],
};

function squareAround([lon, lat]: GeoPosition): GeoRing {
  const size = 1.2;
  return [
    [lon - size, lat - size],
    [lon + size, lat - size],
    [lon + size, lat + size],
    [lon - size, lat + size],
    [lon - size, lat - size],
  ];
}

function fixture(): GeoCollection {
  return {
    type: 'FeatureCollection',
    features: MAP_COUNTRIES.map((country) => ({
      type: 'Feature',
      properties: { ISO_A3: country.iso3 },
      geometry: {
        type: 'Polygon',
        coordinates: [squareAround(APPROX_CENTERS[country.iso3] ?? [100, 20])],
      },
    })),
  };
}

describe('generator map-paths', () => {
  it('deterministik: dua kali jalan menghasilkan string identik', () => {
    const first = JSON.stringify(buildMapPaths(fixture()));
    const second = JSON.stringify(buildMapPaths(fixture()));
    expect(second).toBe(first);
  });

  it('menghasilkan 15 entri sesuai urutan daftar negara', () => {
    const entries = buildMapPaths(fixture());
    expect(entries.map((entry) => entry.iso3)).toEqual(
      MAP_COUNTRIES.map((country) => country.iso3),
    );
    expect(entries.map((entry) => entry.name_id)).toEqual(
      MAP_COUNTRIES.map((country) => country.name_id),
    );
  });

  it('setiap entri punya path tertutup dan paletteKey yang cocok dengan token', () => {
    for (const entry of buildMapPaths(fixture())) {
      expect(entry.d.startsWith('M')).toBe(true);
      expect(entry.d.endsWith('Z')).toBe(true);
      expect(entry.paletteKey).toBe(`--country-${entry.id}`);
      expect(entry.d).not.toContain('NaN');
    }
  });

  it('koordinat masuk ke viewBox 0 0 1000 1000 dan centroid di dalam bbox', () => {
    const entries = buildMapPaths(fixture());
    for (const entry of entries) {
      const [minX, minY, maxX, maxY] = entry.bbox;
      expect(minX).toBeGreaterThanOrEqual(0);
      expect(minY).toBeGreaterThanOrEqual(0);
      expect(maxX).toBeLessThanOrEqual(MAP_VIEW_BOX);
      expect(maxY).toBeLessThanOrEqual(MAP_VIEW_BOX);
      expect(entry.centroid[0]).toBeGreaterThanOrEqual(minX);
      expect(entry.centroid[0]).toBeLessThanOrEqual(maxX);
      expect(entry.centroid[1]).toBeGreaterThanOrEqual(minY);
      expect(entry.centroid[1]).toBeLessThanOrEqual(maxY);
    }
  });

  it('melempar kalau ada negara yang hilang dari sumber', () => {
    const collection = fixture();
    collection.features = collection.features?.filter(
      (feature) => feature.properties?.ISO_A3 !== 'SGP',
    );
    expect(() => buildMapPaths(collection)).toThrow(/SGP/);
  });
});
