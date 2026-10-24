import { describe, expect, it } from 'vitest';
import {
  decideNextTask,
  decideNextTaskKind,
  resolveNextTaskFromState,
  type DecisionInputs,
} from './decision';

describe('Tabel Keputusan Tugas Berikutnya (16 baris kanonik - SPEC_DASHBOARD.md §6)', () => {
  // Matriks 16 kasus: [Row, S, D, L, C, ExpectedKind]
  const TEST_CASES: [number, boolean, boolean, boolean, boolean, string][] = [
    [1, true, true, true, true, 'continue-session'],
    [2, true, true, true, false, 'continue-session'],
    [3, true, true, false, true, 'continue-session'],
    [4, true, true, false, false, 'continue-session'],
    [5, true, false, true, true, 'continue-session'],
    [6, true, false, true, false, 'continue-session'],
    [7, true, false, false, true, 'continue-session'],
    [8, true, false, false, false, 'continue-session'],
    [9, false, true, true, true, 'review-phrases'],
    [10, false, true, true, false, 'review-phrases'],
    [11, false, true, false, true, 'review-phrases'],
    [12, false, true, false, false, 'review-phrases'],
    [13, false, false, true, true, 'new-lesson'],
    [14, false, false, true, false, 'new-lesson'],
    [15, false, false, false, true, 'read-story'],
    [16, false, false, false, false, 'completed'],
  ];

  for (const [row, s, d, l, c, expectedKind] of TEST_CASES) {
    it(`Baris #${row}: S=${s ? 1 : 0}, D=${d ? 1 : 0}, L=${l ? 1 : 0}, C=${c ? 1 : 0} -> ${expectedKind}`, () => {
      const inputs: DecisionInputs = {
        hasInProgressSession: s,
        hasDueReviewsThreshold: d,
        hasIncompleteLesson: l,
        hasUnreadStory: c,
        inProgressCountryId: 'jp',
        nextLessonCountryId: 'th',
        nextStoryCountryId: 'sa',
      };

      const kind = decideNextTaskKind(inputs);
      expect(kind).toBe(expectedKind);

      const decision = decideNextTask(inputs, 'id');
      expect(decision.kind).toBe(expectedKind);
      expect(decision.title).toBeDefined();
      expect(decision.href).toBeDefined();

      if (expectedKind === 'continue-session') {
        expect(decision.href).toBe('/dashboard/quest/jp');
      } else if (expectedKind === 'review-phrases') {
        expect(decision.href).toBe('/dashboard/ulas');
      } else if (expectedKind === 'new-lesson') {
        expect(decision.href).toBe('/dashboard/pelajaran/th/kenali');
      } else if (expectedKind === 'read-story') {
        expect(decision.href).toBe('/negara/sa');
      } else {
        expect(decision.href).toBe('/dashboard');
      }
    });
  }

  it('mendukung lokalisasi ID dan EN untuk keputusan tugas', () => {
    const inputs: DecisionInputs = {
      hasInProgressSession: false,
      hasDueReviewsThreshold: true,
      hasIncompleteLesson: true,
      hasUnreadStory: false,
    };

    const decId = decideNextTask(inputs, 'id');
    expect(decId.title).toBe('Ulas Frasa Jatuh Tempo');

    const decEn = decideNextTask(inputs, 'en');
    expect(decEn.title).toBe('Review Due Phrases');
  });

  describe('resolveNextTaskFromState', () => {
    const LENGKAP = ['id', 'sg', 'th', 'ph', 'cn', 'jp', 'kr', 'sa', 'tr', 'uz'];

    it('prioritizes open attempt when inProgressAttempt exists', () => {
      const res = resolveNextTaskFromState({
        inProgressAttempt: { id: 'att-1', countryId: 'cn' },
        dueCount: 10,
        progress: null,
        lessons: [],
        lengkapCountryIds: LENGKAP,
      });
      expect(res.type).toBe('resume-session');
      expect(res.countryId).toBe('cn');
    });

    it('prioritizes reviews when dueCount >= 3 without open attempt', () => {
      const res = resolveNextTaskFromState({
        inProgressAttempt: null,
        dueCount: 3,
        progress: null,
        lessons: [],
        lengkapCountryIds: LENGKAP,
      });
      expect(res.type).toBe('review-phrases');
      expect(res.href).toBe('/dashboard/ulas');
    });

    it('falls through to lesson when dueCount is 2 (< 3 threshold)', () => {
      const res = resolveNextTaskFromState({
        inProgressAttempt: null,
        dueCount: 2,
        progress: null,
        lessons: [],
        lengkapCountryIds: LENGKAP,
      });
      expect(res.type).toBe('new-lesson');
      expect(res.countryId).toBe('id');
    });

    it('selects unread story when lessons complete', () => {
      const completedLessons = LENGKAP.map((cid) => ({
        profileId: 'p1',
        countryId: cid,
        stepsDone: ['kenali' as const, 'etiket' as const, 'bahasa' as const, 'quest' as const],
        startedAt: 1000,
        completedAt: 2000,
      }));

      const progress = {
        profileId: 'p1',
        countries: {
          id: { openedAt: 100, lastSeenAt: 500, lessonCompletedAt: 2000, storySeen: true },
          sg: { openedAt: 100, lastSeenAt: 300, lessonCompletedAt: 2000, storySeen: false },
        },
      };

      const res = resolveNextTaskFromState({
        inProgressAttempt: null,
        dueCount: 0,
        progress,
        lessons: completedLessons,
        lengkapCountryIds: LENGKAP,
      });
      expect(res.type).toBe('read-story');
    });

    it('returns all-done when all lessons completed and all stories seen', () => {
      const completedLessons = LENGKAP.map((cid) => ({
        profileId: 'p1',
        countryId: cid,
        stepsDone: ['kenali' as const, 'etiket' as const, 'bahasa' as const, 'quest' as const],
        startedAt: 1000,
        completedAt: 2000,
      }));

      const countriesRecord: Record<string, { openedAt: number; lastSeenAt: number; lessonCompletedAt: number | null; storySeen: boolean }> = {};
      for (const cid of LENGKAP) {
        countriesRecord[cid] = {
          openedAt: 1000,
          lastSeenAt: 2000,
          lessonCompletedAt: 2000,
          storySeen: true,
        };
      }

      const res = resolveNextTaskFromState({
        inProgressAttempt: null,
        dueCount: 0,
        progress: { profileId: 'p1', countries: countriesRecord },
        lessons: completedLessons,
        lengkapCountryIds: LENGKAP,
      });
      expect(res.type).toBe('all-done');
      expect(res.kind).toBe('completed');
    });
  });
});
