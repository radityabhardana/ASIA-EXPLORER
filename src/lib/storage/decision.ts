import type { NextTaskDecision, NextTaskKind } from './types';

export interface DecisionInputs {
  hasInProgressSession: boolean; // S
  hasDueReviewsThreshold: boolean; // D (dueCount >= 3)
  hasIncompleteLesson: boolean; // L
  hasUnreadStory: boolean; // C
  inProgressCountryId?: string;
  nextLessonCountryId?: string;
  nextStoryCountryId?: string;
}

export function decideNextTaskKind(inputs: DecisionInputs): NextTaskKind {
  // Priority order: Session > Review > Lesson > Story > Completed
  if (inputs.hasInProgressSession) {
    return 'continue-session';
  }
  if (inputs.hasDueReviewsThreshold) {
    return 'review-phrases';
  }
  if (inputs.hasIncompleteLesson) {
    return 'new-lesson';
  }
  if (inputs.hasUnreadStory) {
    return 'read-story';
  }
  return 'completed';
}

export function decideNextTask(inputs: DecisionInputs, locale: 'id' | 'en' = 'id'): NextTaskDecision {
  const kind = decideNextTaskKind(inputs);

  switch (kind) {
    case 'continue-session': {
      const cid = inputs.inProgressCountryId ?? 'jp';
      return {
        kind,
        countryId: cid,
        title: locale === 'id' ? 'Lanjutkan Sesi Berjalan' : 'Continue Active Session',
        description:
          locale === 'id'
            ? 'Ada sesi pelajaran atau quest yang belum kamu selesaikan.'
            : 'You have an ongoing lesson or quest in progress.',
        href: `/dashboard/quest/${cid}`,
      };
    }
    case 'review-phrases': {
      return {
        kind,
        title: locale === 'id' ? 'Ulas Frasa Jatuh Tempo' : 'Review Due Phrases',
        description:
          locale === 'id'
            ? 'Sejumlah frasa telah mencapai jadwal ulas Spaced Repetition.'
            : 'Several phrases have reached their Spaced Repetition review interval.',
        href: '/dashboard/ulas',
      };
    }
    case 'new-lesson': {
      const cid = inputs.nextLessonCountryId ?? 'jp';
      return {
        kind,
        countryId: cid,
        title: locale === 'id' ? 'Mulai Pelajaran Baru' : 'Start New Lesson',
        description:
          locale === 'id'
            ? 'Jelajahi etiket dan budaya negara berikutnya dalam kurikulum.'
            : 'Explore the etiquette and culture of the next country in the curriculum.',
        href: `/dashboard/pelajaran/${cid}/kenali`,
      };
    }
    case 'read-story': {
      const cid = inputs.nextStoryCountryId ?? 'jp';
      return {
        kind,
        countryId: cid,
        title: locale === 'id' ? 'Eksplorasi Cerita Budaya' : 'Explore Cultural Story',
        description:
          locale === 'id'
            ? 'Baca narasi budaya dan keseharian masyarakat yang belum kamu buka.'
            : 'Read cultural narratives and everyday life stories you have not explored.',
        href: `/negara/${cid}`,
      };
    }
    case 'completed':
    default: {
      return {
        kind: 'completed',
        title: locale === 'id' ? 'Kurikulum Tuntas' : 'Curriculum Complete',
        description:
          locale === 'id'
            ? 'Seluruh pelajaran dan skenario telah kamu selesaikan dengan baik.'
            : 'You have successfully completed all available lessons and scenarios.',
        href: '/dashboard',
      };
    }
  }
}

export interface StateContext {
  inProgressAttempt?: { id: string; countryId: string } | null;
  dueCount: number;
  progress?: import('./types').Progress | null;
  lessons: import('./types').LessonProgress[];
  lengkapCountryIds: string[];
}

export function resolveNextTaskFromState(
  ctx: StateContext,
  locale: 'id' | 'en' = 'id',
): NextTaskDecision & { type: string } {
  const hasInProgressSession = Boolean(ctx.inProgressAttempt);
  const hasDueReviewsThreshold = ctx.dueCount >= 3;

  const completedLessonCountryIds = new Set(
    ctx.lessons.filter((l) => l.completedAt !== null).map((l) => l.countryId),
  );

  const candidateLessonCountryId = ctx.lengkapCountryIds.find(
    (id) => !completedLessonCountryIds.has(id),
  );
  const hasIncompleteLesson = candidateLessonCountryId !== undefined;

  const countriesMap = ctx.progress?.countries ?? {};
  const unreadCountries = ctx.lengkapCountryIds
    .filter((id) => !countriesMap[id]?.storySeen)
    .sort((a, b) => {
      const seenA = countriesMap[a]?.lastSeenAt ?? 0;
      const seenB = countriesMap[b]?.lastSeenAt ?? 0;
      return seenA - seenB;
    });

  const candidateStoryCountryId = unreadCountries[0];
  const hasUnreadStory = candidateStoryCountryId !== undefined;

  const decision = decideNextTask(
    {
      hasInProgressSession,
      hasDueReviewsThreshold,
      hasIncompleteLesson,
      hasUnreadStory,
      inProgressCountryId: ctx.inProgressAttempt?.countryId,
      nextLessonCountryId: candidateLessonCountryId,
      nextStoryCountryId: candidateStoryCountryId,
    },
    locale,
  );

  // Map kind to type for backward compatibility
  const kindToType: Record<string, string> = {
    'continue-session': 'resume-session',
    'review-phrases': 'review-phrases',
    'new-lesson': 'new-lesson',
    'read-story': 'read-story',
    'completed': 'all-done',
  };

  return {
    ...decision,
    type: kindToType[decision.kind] ?? decision.kind,
  };
}
