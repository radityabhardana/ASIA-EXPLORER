import { useMemo, useCallback } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { getStoryQuest } from '@/data/story-quests';
import StoryQuestStage from '@/sections/quest/StoryQuestStage';
import { getLesson, getProgress, saveAttempt, saveLesson, saveProgress } from '@/lib/storage/db';
import type { Attempt } from '@/lib/storage/types';
import type { Ending } from '@/lib/story-quest/types';
import '@/styles/dashboard.css';

export default function QuestPage() {
  const { countryId } = useParams<{ countryId?: string }>();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const profileId = profile?.id ?? '';

  const storyQuest = useMemo(() => {
    return countryId ? getStoryQuest(countryId) : undefined;
  }, [countryId]);

  // Sinkronisasi kemajuan & XP ke sistem global saat quest selesai
  const handleQuestComplete = useCallback(
    async (ending: Ending, earnedXp: number) => {
      if (!profileId || !countryId || !storyQuest) return;

      try {
        // 1. Catat ke lesson progress (menambahkan 'quest' ke stepsDone)
        const currentLesson = await getLesson(profileId, countryId);
        const stepsDone = currentLesson?.stepsDone ?? [];
        const updatedSteps = Array.from(new Set([...stepsDone, 'quest' as const]));

        await saveLesson({
          profileId,
          countryId,
          stepsDone: updatedSteps,
          startedAt: currentLesson?.startedAt ?? Date.now(),
          completedAt: Date.now(),
        });

        // 2. Simpan ke status negara di progress umum
        const prog = await getProgress(profileId);
        const countriesMap = prog?.countries ?? {};
        const existingRecord = countriesMap[countryId] ?? {
          openedAt: Date.now(),
          lastSeenAt: Date.now(),
          lessonCompletedAt: null,
          storySeen: false,
        };

        // 3. Simpan attempt agar metrik legacy di dashboard mendeteksi quest selesai
        const correctAnswersCount = Math.min(6, Math.max(3, Math.round((earnedXp / 60) * 6)));
        const mockAttempt: Attempt = {
          id: `sq_${profileId}_${countryId}_${Date.now()}`,
          profileId,
          countryId,
          itemIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
          answers: Array.from({ length: 6 }, (_, i) => ({
            itemId: `c${i + 1}`,
            given: ending.id,
            correct: i < correctAnswersCount,
            elapsedMs: 2000,
          })),
          startedAt: Date.now() - 120000,
          finishedAt: Date.now(),
          durationMs: 120000,
          mode: 'full',
        };
        await saveAttempt(mockAttempt);

        await saveProgress({
          profileId,
          countries: {
            ...countriesMap,
            [countryId]: {
              ...existingRecord,
              lastSeenAt: Date.now(),
              lessonCompletedAt: Date.now(),
            },
          },
          lastAttemptId: mockAttempt.id,
        });

        // 4. Tambahkan sisa bonus XP ke localStorage jika ada selisih
        const calculatedAttemptXp = correctAnswersCount * 10;
        const diffXp = earnedXp - calculatedAttemptXp;
        if (diffXp > 0) {
          const currentBonus = Number(localStorage.getItem(`xp_bonus_${profileId}`) ?? '0');
          localStorage.setItem(`xp_bonus_${profileId}`, String(currentBonus + diffXp));
        }
      } catch (err) {
        console.warn('Gagal menyinkronkan progres quest ke db:', err);
      }
    },
    [profileId, countryId, storyQuest],
  );

  // Jika countryId tidak valid atau tidak memiliki story quest
  if (!countryId || !storyQuest) {
    return <Navigate to="/dashboard/quest" replace />;
  }

  return (
    <StoryQuestStage
      quest={storyQuest}
      profileId={profileId}
      onExit={() => navigate('/dashboard/quest')}
      onComplete={handleQuestComplete}
    />
  );
}
