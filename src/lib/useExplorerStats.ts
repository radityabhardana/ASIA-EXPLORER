import { useEffect, useState, useMemo } from 'react';
import type { Attempt, LessonProgress, PhraseReview } from '@/lib/storage/types';
import {
  getAttemptsByProfile,
  getLessonsByProfile,
  getReviewsByProfile,
} from '@/lib/storage/db';

export function useExplorerStats(profileId: string) {
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
    return xp + bonusXP;
  }, [lessons, attempts, bonusXP]);

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
