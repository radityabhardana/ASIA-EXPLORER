import type { PhraseReview } from './types';

export const LEITNER_INTERVALS = [1, 3, 7, 16, 35] as const;

export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayDateString(): string {
  return formatDate(new Date());
}

export function addDays(dateStr: string, days: number): string {
  const [yStr, mStr, dStr] = dateStr.split('-');
  const y = Number(yStr);
  const m = Number(mStr) - 1;
  const d = Number(dStr);
  const date = new Date(y, m, d);
  date.setDate(date.getDate() + days);
  return formatDate(date);
}

export function getBoxIntervalDays(box: number): number {
  const clampedBox = Math.max(1, Math.min(5, Math.floor(box)));
  return LEITNER_INTERVALS[clampedBox - 1] ?? 1;
}

export function computeNextReview(
  review: PhraseReview,
  isCorrect: boolean,
  todayStr: string = todayDateString(),
): PhraseReview {
  if (isCorrect) {
    const nextBox = Math.min(5, review.box + 1);
    const intervalDays = getBoxIntervalDays(nextBox);
    return {
      ...review,
      box: nextBox,
      dueDay: addDays(todayStr, intervalDays),
      lastReviewedDay: todayStr,
      reviews: review.reviews + 1,
    };
  }

  // Incorrect answer resets to box 1 with 1 day interval
  return {
    ...review,
    box: 1,
    dueDay: addDays(todayStr, 1),
    lastReviewedDay: todayStr,
    lapses: review.lapses + 1,
    reviews: review.reviews + 1,
  };
}

export function createInitialReview(
  profileId: string,
  phraseId: string,
  todayStr: string = todayDateString(),
): PhraseReview {
  return {
    profileId,
    phraseId,
    box: 1,
    dueDay: addDays(todayStr, 1),
    lastReviewedDay: null,
    lapses: 0,
    reviews: 0,
  };
}

export function isPhraseDue(review: PhraseReview, todayStr: string = todayDateString()): boolean {
  return review.dueDay <= todayStr;
}

export const INTERVALS = LEITNER_INTERVALS;
export const getTodayStr = todayDateString;
export const applyReviewResult = computeNextReview;
export const createInitialPhraseReview = createInitialReview;
