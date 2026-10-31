import { useEffect, useState, useMemo } from 'react';
import type { Attempt, LessonProgress, PhraseReview } from '@/lib/storage/types';
import {
  getAttemptsByProfile,
  getLessonsByProfile,
  getReviewsByProfile,
} from '@/lib/storage/db';

export function useExplorerStats(profileId: string) {
  const getCachedXP = (): number => {
    if (typeof window === 'undefined') return 0;
    const direct = profileId ? localStorage.getItem(`asiakin_cached_xp_${profileId}`) : null;
    if (direct && Number(direct) > 0) return Number(direct);
    const fallback = localStorage.getItem('asiakin_cached_xp_default');
    return fallback ? Number(fallback) : 0;
  };

  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [reviews, setReviews] = useState<PhraseReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      setLoading(false);
      return;
    }
    let isMounted = true;

    Promise.all([
      getLessonsByProfile(profileId),
      getAttemptsByProfile(profileId),
      getReviewsByProfile(profileId),
    ])
      .then(([les, att, revs]) => {
        if (!isMounted) return;
        setLessons(les);
        setAttempts(att);
        setReviews(revs);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const bonusXP = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(`xp_bonus_${profileId}`) ?? '0');
  }, [profileId]);

  const totalXP = useMemo(() => {
    let xp = 0;
    for (const l of lessons) {
      xp += (l.stepsDone?.length ?? 0) * 25;
    }
    for (const a of attempts) {
      if (a.finishedAt) {
        const correctCount = a.answers.filter((ans) => ans.correct).length;
        xp += correctCount * 10;
      }
    }
    const computed = xp + bonusXP;

    if (loading) {
      const cached = getCachedXP();
      if (cached > computed) return cached;
    }

    if (computed > 0 && typeof window !== 'undefined' && profileId) {
      try {
        localStorage.setItem(`asiakin_cached_xp_${profileId}`, String(computed));
        localStorage.setItem('asiakin_cached_xp_default', String(computed));
      } catch {
        // quota
      }
    }

    return computed > 0 ? computed : getCachedXP();
  }, [lessons, attempts, bonusXP, loading, profileId]);

  const streakDays = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(`streak_${profileId}`);
    return saved ? Number(saved) : 1;
  }, [profileId]);

  return {
    lessons,
    attempts,
    reviews,
    totalXP,
    streakDays,
    loading,
  };
}
