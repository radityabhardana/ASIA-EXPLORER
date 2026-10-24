import { describe, expect, it } from 'vitest';
import {
  addDays,
  computeNextReview,
  createInitialReview,
  formatDate,
  getBoxIntervalDays,
  isPhraseDue,
  LEITNER_INTERVALS,
  todayDateString,
} from './leitner';
import type { PhraseReview } from './types';

describe('Leitner Spaced Repetition (SPEC_DASHBOARD.md §6)', () => {
  it('memiliki 5 interval kanonik [1, 3, 7, 16, 35] hari', () => {
    expect(LEITNER_INTERVALS).toEqual([1, 3, 7, 16, 35]);
    expect(getBoxIntervalDays(1)).toBe(1);
    expect(getBoxIntervalDays(2)).toBe(3);
    expect(getBoxIntervalDays(3)).toBe(7);
    expect(getBoxIntervalDays(4)).toBe(16);
    expect(getBoxIntervalDays(5)).toBe(35);
  });

  it('formatDate dan todayDateString menghasilkan format kalender YYYY-MM-DD', () => {
    expect(formatDate(new Date(2026, 9, 24))).toBe('2026-10-24');
    expect(todayDateString()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('addDays menghitung kalender YYYY-MM-DD secara deterministik', () => {
    expect(addDays('2026-10-24', 1)).toBe('2026-10-25');
    expect(addDays('2026-10-24', 3)).toBe('2026-10-27');
    expect(addDays('2026-10-24', 7)).toBe('2026-10-31');
    expect(addDays('2026-10-24', 16)).toBe('2026-11-09');
    expect(addDays('2026-10-24', 35)).toBe('2026-11-28');
  });

  it('frasa baru mulai di kotak 1 dengan interval +1 hari', () => {
    const today = '2026-10-24';
    const initial = createInitialReview('prof-1', 'jp:0', today);
    expect(initial.profileId).toBe('prof-1');
    expect(initial.phraseId).toBe('jp:0');
    expect(initial.box).toBe(1);
    expect(initial.dueDay).toBe('2026-10-25');
    expect(initial.lapses).toBe(0);
    expect(initial.reviews).toBe(0);
    expect(initial.lastReviewedDay).toBeNull();
  });

  it('jawaban benar menaikkan kotak (1->2->3->4->5) dan menghitung dueDay sesuai interval', () => {
    const today = '2026-10-24';
    let review: PhraseReview = createInitialReview('prof-1', 'jp:0', today);

    // Kotak 1 -> Kotak 2 (+3 hari)
    review = computeNextReview(review, true, today);
    expect(review.box).toBe(2);
    expect(review.dueDay).toBe('2026-10-27');
    expect(review.reviews).toBe(1);
    expect(review.lastReviewedDay).toBe(today);

    // Kotak 2 -> Kotak 3 (+7 hari)
    review = computeNextReview(review, true, today);
    expect(review.box).toBe(3);
    expect(review.dueDay).toBe('2026-10-31');
    expect(review.reviews).toBe(2);

    // Kotak 3 -> Kotak 4 (+16 hari)
    review = computeNextReview(review, true, today);
    expect(review.box).toBe(4);
    expect(review.dueDay).toBe('2026-11-09');
    expect(review.reviews).toBe(3);

    // Kotak 4 -> Kotak 5 (+35 hari)
    review = computeNextReview(review, true, today);
    expect(review.box).toBe(5);
    expect(review.dueDay).toBe('2026-11-28');
    expect(review.reviews).toBe(4);
  });

  it('frasa di kotak 5 yang dijawab benar TETAP di kotak 5 dengan interval +35 hari (tidak permanen mati)', () => {
    const today = '2026-10-24';
    const box5Review: PhraseReview = {
      profileId: 'prof-1',
      phraseId: 'jp:0',
      box: 5,
      dueDay: today,
      lastReviewedDay: '2026-09-19',
      lapses: 0,
      reviews: 5,
    };

    const next = computeNextReview(box5Review, true, today);
    expect(next.box).toBe(5);
    expect(next.dueDay).toBe('2026-11-28');
    expect(next.reviews).toBe(6);
    expect(next.lapses).toBe(0);
  });

  it('jawaban salah dari kotak 3 turun langsung ke kotak 1 dengan lapses bertambah 1', () => {
    const today = '2026-10-24';
    const box3Review: PhraseReview = {
      profileId: 'prof-1',
      phraseId: 'jp:0',
      box: 3,
      dueDay: today,
      lastReviewedDay: '2026-10-17',
      lapses: 1,
      reviews: 3,
    };

    const next = computeNextReview(box3Review, false, today);
    expect(next.box).toBe(1);
    expect(next.dueDay).toBe('2026-10-25');
    expect(next.lapses).toBe(2);
    expect(next.reviews).toBe(4);
    expect(next.lastReviewedDay).toBe(today);
  });

  it('isPhraseDue inklusif (dueDay <= todayStr)', () => {
    const today = '2026-10-24';
    const pastReview: PhraseReview = {
      profileId: 'p1',
      phraseId: 'id:0',
      box: 1,
      dueDay: '2026-10-23',
      lastReviewedDay: null,
      lapses: 0,
      reviews: 0,
    };
    const todayReview: PhraseReview = { ...pastReview, dueDay: '2026-10-24' };
    const futureReview: PhraseReview = { ...pastReview, dueDay: '2026-10-25' };

    expect(isPhraseDue(pastReview, today)).toBe(true);
    expect(isPhraseDue(todayReview, today)).toBe(true);
    expect(isPhraseDue(futureReview, today)).toBe(false);
  });
});
