import { useState, useCallback, useRef } from 'react';
import type { SessionAttempt, SessionChallengeResult, SessionContent } from './storage/types';
import { saveSessionAttempt, getSessionAttemptsByCountry, getProgress, saveProgress } from './storage/db';
import { useProfile } from './storage/ProfileContext';

export type SessionPhase = 'story' | 'audio-quest' | 'build' | 'reward';

interface SessionEngineState {
  phase: SessionPhase;
  currentChallengeIndex: number;
  streak: number;
  xp: number;
  audioResults: SessionChallengeResult[];
  buildResults: SessionChallengeResult[];
  badgeUnlocked: boolean;
  attemptId: string;
}

export interface UseSessionEngineReturn {
  phase: SessionPhase;
  challengeIndex: number;
  streak: number;
  xp: number;
  audioResults: SessionChallengeResult[];
  buildResults: SessionChallengeResult[];
  badgeUnlocked: boolean;
  attemptId: string;
  completeStory: () => void;
  submitAudioAnswer: (challengeId: string, correct: boolean, elapsedMs: number) => void;
  submitBuildAnswer: (challengeId: string, correct: boolean, hintsUsed: number, elapsedMs: number) => void;
  useHint: () => void;
  finishSession: () => Promise<void>;
}

const XP_AUDIO_CORRECT = 10;
const XP_BUILD_CORRECT_CLEAN = 20;
const XP_BUILD_CORRECT_HINT = 10;
const XP_HINT_PENALTY = 5;
const XP_STREAK_3 = 15;
const XP_STREAK_5 = 30;

export function useSessionEngine(content: SessionContent): UseSessionEngineReturn {
  const { profile } = useProfile();
  const startedAt = useRef(Date.now());
  const attemptId = useRef(`sess-${content.countryId}-${startedAt.current}`);

  const [state, setState] = useState<SessionEngineState>({
    phase: 'story',
    currentChallengeIndex: 0,
    streak: 0,
    xp: 0,
    audioResults: [],
    buildResults: [],
    badgeUnlocked: false,
    attemptId: attemptId.current,
  });

  const completeStory = useCallback(() => {
    setState(s => ({ ...s, phase: 'audio-quest', currentChallengeIndex: 0 }));
  }, []);

  const submitAudioAnswer = useCallback((challengeId: string, correct: boolean, elapsedMs: number) => {
    setState(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      let xpGain = correct ? XP_AUDIO_CORRECT : 0;
      if (correct && newStreak === 3) xpGain += XP_STREAK_3;
      if (correct && newStreak === 5) xpGain += XP_STREAK_5;

      const result: SessionChallengeResult = { challengeId, correct, hintsUsed: 0, elapsedMs };
      const newAudioResults = [...s.audioResults, result];
      const nextIndex = s.currentChallengeIndex + 1;
      const isLastAudio = nextIndex >= content.audioQuests.length;

      return {
        ...s,
        streak: newStreak,
        xp: s.xp + xpGain,
        audioResults: newAudioResults,
        currentChallengeIndex: isLastAudio ? 0 : nextIndex,
        phase: isLastAudio ? 'build' : 'audio-quest',
      };
    });
  }, [content.audioQuests.length]);

  const submitBuildAnswer = useCallback((challengeId: string, correct: boolean, hintsUsed: number, elapsedMs: number) => {
    setState(s => {
      const newStreak = correct ? s.streak + 1 : 0;
      let xpGain = 0;
      if (correct) {
        xpGain = hintsUsed === 0 ? XP_BUILD_CORRECT_CLEAN : XP_BUILD_CORRECT_HINT;
        xpGain -= hintsUsed * XP_HINT_PENALTY;
        xpGain = Math.max(xpGain, 0);
      }
      if (correct && newStreak === 3) xpGain += XP_STREAK_3;
      if (correct && newStreak === 5) xpGain += XP_STREAK_5;

      const result: SessionChallengeResult = { challengeId, correct, hintsUsed, elapsedMs };
      const newBuildResults = [...s.buildResults, result];
      const nextIndex = s.currentChallengeIndex + 1;
      const isLastBuild = nextIndex >= content.buildChallenges.length;

      return {
        ...s,
        streak: newStreak,
        xp: s.xp + xpGain,
        buildResults: newBuildResults,
        currentChallengeIndex: isLastBuild ? 0 : nextIndex,
        phase: isLastBuild ? 'reward' : 'build',
      };
    });
  }, [content.buildChallenges.length]);

  const useHint = useCallback(() => {
    // Hint usage is tracked per-challenge in BuildPhase local state;
    // this is a no-op here but kept for potential future global tracking
  }, []);

  const finishSession = useCallback(async () => {
    if (!profile) return;
    const s = state;

    const existing = await getSessionAttemptsByCountry(profile.id, content.countryId);
    const firstCompletion = !existing.some(a => a.completedAt !== null);

    const attempt: SessionAttempt = {
      id: attemptId.current,
      profileId: profile.id,
      countryId: content.countryId,
      phase1Completed: true,
      audioQuestResults: s.audioResults,
      buildResults: s.buildResults,
      xpEarned: s.xp,
      streakPeak: s.streak,
      startedAt: startedAt.current,
      completedAt: Date.now(),
      badgeUnlocked: firstCompletion,
    };

    await saveSessionAttempt(attempt);

    if (firstCompletion) {
      const progress = await getProgress(profile.id);
      if (progress) {
        const existing = progress.countries[content.countryId] ?? {
          openedAt: Date.now(),
          lastSeenAt: Date.now(),
          lessonCompletedAt: null,
          storySeen: true,
        };
        progress.countries[content.countryId] = {
          ...existing,
          sessionCompletedAt: Date.now(),
          lastSeenAt: Date.now(),
        };
        await saveProgress(progress);
      }
    }

    setState(s => ({ ...s, badgeUnlocked: firstCompletion }));
  }, [profile, state, content.countryId]);

  return {
    phase: state.phase,
    challengeIndex: state.currentChallengeIndex,
    streak: state.streak,
    xp: state.xp,
    audioResults: state.audioResults,
    buildResults: state.buildResults,
    badgeUnlocked: state.badgeUnlocked,
    attemptId: state.attemptId,
    completeStory,
    submitAudioAnswer,
    submitBuildAnswer,
    useHint,
    finishSession,
  };
}
