import { describe, expect, it } from 'vitest';

import { countries } from './countries';

describe('konten cerita 15 negara (PRD v2.4 §3 / D45)', () => {
  it('semua 15 negara memiliki cerita dengan panjang 120–180 kata', () => {
    expect(countries).toHaveLength(15);
    for (const country of countries) {
      const words = country.story.text.trim().split(/\s+/).length;
      expect(
        words,
        `negara ${country.id} (${country.nameId}) memiliki ${words} kata, harus di antara 120–180`,
      ).toBeGreaterThanOrEqual(120);
      expect(
        words,
        `negara ${country.id} (${country.nameId}) memiliki ${words} kata, harus di antara 120–180`,
      ).toBeLessThanOrEqual(180);
    }
  });

  it('setiap negara memiliki minimal 2 sumber cerita dengan url dan deskripsi valid', () => {
    for (const country of countries) {
      expect(
        country.story.sources.length,
        `negara ${country.id} (${country.nameId}) memiliki kurang dari 2 sumber cerita`,
      ).toBeGreaterThanOrEqual(2);
      for (const source of country.story.sources) {
        expect(source.url.trim().length).toBeGreaterThan(0);
        expect(source.what.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('tidak ada teks cerita yang duplikat antar negara', () => {
    const stories = countries.map((country) => country.story.text.trim());
    const uniqueStories = new Set(stories);
    expect(uniqueStories.size).toBe(countries.length);
  });
});
