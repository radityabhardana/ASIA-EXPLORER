import { describe, expect, it } from 'vitest';
import {
  calculateBearing,
  formatDMS,
  formatDistanceKm,
  getHeadingDirection,
  haversineDistanceKm,
} from './geo-coords';

describe('geo-coords utility', () => {
  it('formats coordinates to DMS notation properly', () => {
    // Tokyo (35.6762° N, 139.6503° E)
    expect(formatDMS(35.6762, 139.6503)).toBe('35°40′N · 139°39′E');
    // Jakarta (6.2088° S, 106.8456° E)
    expect(formatDMS(-6.2088, 106.8456)).toBe('6°12′S · 106°50′E');
  });

  it('calculates geodesic distance between Jakarta and Tokyo accurately (~5780-5800 km)', () => {
    const jkt = { lat: -6.2088, lon: 106.8456 };
    const tyo = { lat: 35.6762, lon: 139.6503 };
    const dist = haversineDistanceKm(jkt.lat, jkt.lon, tyo.lat, tyo.lon);
    expect(dist).toBeGreaterThan(5750);
    expect(dist).toBeLessThan(5850);
  });

  it('determines heading direction from Jakarta to Tokyo as Northeastbound', () => {
    const jkt = { lat: -6.2088, lon: 106.8456 };
    const tyo = { lat: 35.6762, lon: 139.6503 };
    const bearing = calculateBearing(jkt.lat, jkt.lon, tyo.lat, tyo.lon);
    expect(bearing).toBeGreaterThan(20);
    expect(bearing).toBeLessThan(60);
    expect(getHeadingDirection(jkt.lat, jkt.lon, tyo.lat, tyo.lon, 'en')).toBe('NORTHEASTBOUND');
    expect(getHeadingDirection(jkt.lat, jkt.lon, tyo.lat, tyo.lon, 'id')).toBe('ARAH TIMUR LAUT');
  });

  it('formats distance in km according to locale', () => {
    expect(formatDistanceKm(5790, 'id')).toContain('5.790');
    expect(formatDistanceKm(5790, 'en')).toContain('5,790');
  });
});
