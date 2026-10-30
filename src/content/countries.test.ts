import { describe, expect, it } from 'vitest';

import { countries, countriesEn, FEATURED_IDS } from './countries';
import type { Country } from './countries';

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

const LOCALES: ReadonlyArray<readonly [string, readonly Country[]]> = [
  ['id', countries],
  ['en', countriesEn],
];

describe('konten cerita negara (PRD v2.4 §3 / D45)', () => {
  it('setiap negara memiliki cerita dengan panjang 120–180 kata di tiap locale', () => {
    for (const [locale, list] of LOCALES) {
      for (const country of list) {
        const words = wordCount(country.story.text);
        expect(
          words,
          `${locale}/${country.id} (${country.nameId}) memiliki ${words} kata, harus di antara 120–180`,
        ).toBeGreaterThanOrEqual(120);
        expect(
          words,
          `${locale}/${country.id} (${country.nameId}) memiliki ${words} kata, harus di antara 120–180`,
        ).toBeLessThanOrEqual(180);
      }
    }
  });

  it('setiap negara punya tepat 3 frasa, minimal 3 sumber, dan minimal 2 sumber cerita', () => {
    for (const [locale, list] of LOCALES) {
      for (const country of list) {
        expect(country.phrases.length, `${locale}/${country.id} punya ${country.phrases.length} frasa`).toBe(3);
        expect(
          country.sources.length,
          `${locale}/${country.id} (${country.nameId}) memiliki kurang dari 3 sumber`,
        ).toBeGreaterThanOrEqual(3);
        expect(
          country.story.sources.length,
          `${locale}/${country.id} (${country.nameId}) memiliki kurang dari 2 sumber cerita`,
        ).toBeGreaterThanOrEqual(2);
        for (const source of country.story.sources) {
          expect(source.url.trim().length).toBeGreaterThan(0);
          expect(source.what.trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('tidak ada teks cerita yang duplikat di dalam locale yang sama', () => {
    for (const [locale, list] of LOCALES) {
      const stories = list.map((country) => country.story.text.trim());
      expect(new Set(stories).size, `cerita ${locale} duplikat`).toBe(list.length);
    }
  });

  it('set ID berisi minimal 15 negara', () => {
    expect(countries.length).toBeGreaterThanOrEqual(15);
  });

  it('15 id kurasi semuanya ada di konten', () => {
    expect(FEATURED_IDS).toHaveLength(15);
    const ids = new Set(countries.map((country) => country.id));
    for (const id of FEATURED_IDS) {
      expect(ids.has(id), `id kurasi ${id} hilang dari countries.json`).toBe(true);
    }
  });

  it('set EN adalah subset set ID yang mengikuti urutan ID (parity)', () => {
    const idOrder = new Map(countries.map((country, index) => [country.id, index]));
    let cursor = -1;
    for (const country of countriesEn) {
      const index = idOrder.get(country.id);
      expect(index, `EN id ${country.id} tidak ada di set ID`).toBeDefined();
      if (index === undefined) continue;
      expect(index, `EN id ${country.id} keluar urutan ID`).toBeGreaterThan(cursor);
      cursor = index;
    }
  });
});
