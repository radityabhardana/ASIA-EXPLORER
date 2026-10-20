import { describe, expect, it } from 'vitest';

import {
  computeProgress,
  getScrollProgress,
  resetScrollProgressForTests,
  setScrollProgress,
  subscribeScrollProgress,
} from './scroll-progress';

describe('progres scroll global', () => {
  it('dijepit ke 0 saat scroll di atas awal halaman', () => {
    expect(computeProgress(-120, 5000, 1000)).toBe(0);
    expect(computeProgress(0, 5000, 1000)).toBe(0);
  });

  it('dijepit ke 1 saat scroll melewati akhir halaman', () => {
    expect(computeProgress(4000, 5000, 1000)).toBe(1);
    expect(computeProgress(99999, 5000, 1000)).toBe(1);
  });

  it('linear di tengah halaman', () => {
    expect(computeProgress(2000, 5000, 1000)).toBeCloseTo(0.5, 10);
  });

  it('halaman lebih pendek dari viewport dianggap progres 0', () => {
    expect(computeProgress(500, 800, 1000)).toBe(0);
    expect(computeProgress(0, 1000, 1000)).toBe(0);
  });

  it('nilai tidak terdefinisi tidak menghasilkan NaN', () => {
    expect(computeProgress(Number.NaN, 5000, 1000)).toBe(0);
    expect(computeProgress(100, Number.NaN, 1000)).toBe(0);
  });
});

describe('penyebaran progres', () => {
  it('subscriber menerima nilai saat ini lalu setiap perubahan', () => {
    resetScrollProgressForTests();
    const received: number[] = [];
    const unsubscribe = subscribeScrollProgress((progress) => {
      received.push(progress);
    });

    expect(received).toEqual([0]);
    setScrollProgress(0.25);
    setScrollProgress(0.5);
    expect(received).toEqual([0, 0.25, 0.5]);

    unsubscribe();
    setScrollProgress(0.75);
    expect(received).toEqual([0, 0.25, 0.5]);
    expect(getScrollProgress()).toBe(0.75);
    resetScrollProgressForTests();
  });

  it('tidak mengumumkan nilai yang sama dua kali', () => {
    resetScrollProgressForTests();
    let calls = 0;
    const unsubscribe = subscribeScrollProgress(() => {
      calls += 1;
    });
    expect(calls).toBe(1);
    setScrollProgress(0.4);
    setScrollProgress(0.4000001);
    expect(calls).toBe(2);
    unsubscribe();
    resetScrollProgressForTests();
  });
});
