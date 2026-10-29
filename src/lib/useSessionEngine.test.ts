import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSessionEngine } from './useSessionEngine';
import type { SessionContent } from './storage/types';

// Mock db functions
vi.mock('./storage/db', () => ({
  saveSessionAttempt: vi.fn().mockResolvedValue(undefined),
  getSessionAttemptsByCountry: vi.fn().mockResolvedValue([]),
  getProgress: vi.fn().mockResolvedValue(null),
  saveProgress: vi.fn().mockResolvedValue(undefined),
}));

// Mock useProfile
vi.mock('./storage/ProfileContext', () => ({
  useProfile: () => ({ profile: { id: 'p1', displayName: 'Test' } }),
}));

const makeContent = (audioCount = 3, buildCount = 2): SessionContent => ({
  countryId: 'id',
  audioQuests: Array.from({ length: audioCount }, (_, i) => ({
    id: `aq${i}`,
    type: 'hear-identify' as const,
    audioText: 'test',
    audioLang: 'id-ID',
    tiles: [
      { id: 't0', text: 'A', isCorrect: true },
      { id: 't1', text: 'B', isCorrect: false },
      { id: 't2', text: 'C', isCorrect: false },
      { id: 't3', text: 'D', isCorrect: false },
    ],
    correctIndex: 0,
    feedback: 'Good!',
  })),
  buildChallenges: Array.from({ length: buildCount }, (_, i) => ({
    id: `bc${i}`,
    type: 'sentence-order' as const,
    audioText: 'test',
    audioLang: 'id-ID',
    correctOrder: ['saya', 'belajar'],
    distractors: ['makan'],
    hint1Target: 0,
  })),
});

describe('useSessionEngine', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completeStory() transitions phase from story to audio-quest', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent()));
    expect(result.current.phase).toBe('story');
    act(() => { result.current.completeStory(); });
    expect(result.current.phase).toBe('audio-quest');
  });

  it('correct audio answer: XP += 10, streak increments', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent()));
    act(() => { result.current.completeStory(); });
    act(() => { result.current.submitAudioAnswer('aq0', true, 1000); });
    expect(result.current.xp).toBe(10);
    expect(result.current.streak).toBe(1);
  });

  it('wrong audio answer: XP unchanged, streak resets to 0', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent()));
    act(() => { result.current.completeStory(); });
    // first get a streak of 1
    act(() => { result.current.submitAudioAnswer('aq0', true, 1000); });
    expect(result.current.streak).toBe(1);
    act(() => { result.current.submitAudioAnswer('aq1', false, 1000); });
    expect(result.current.xp).toBe(10); // unchanged
    expect(result.current.streak).toBe(0);
  });

  it('streak 3x: +15 bonus XP applied', () => {
    // Need 3 audio quests; first 2 correct get 10 each, 3rd correct at streak=3 gets 10+15=25
    const { result } = renderHook(() => useSessionEngine(makeContent(5, 2)));
    act(() => { result.current.completeStory(); });
    act(() => { result.current.submitAudioAnswer('aq0', true, 100); }); // xp=10, streak=1
    act(() => { result.current.submitAudioAnswer('aq1', true, 100); }); // xp=20, streak=2
    act(() => { result.current.submitAudioAnswer('aq2', true, 100); }); // xp=20+25=45, streak=3
    expect(result.current.streak).toBe(3);
    expect(result.current.xp).toBe(45);
  });

  it('after last audio challenge: phase transitions to build', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent(2, 2)));
    act(() => { result.current.completeStory(); });
    act(() => { result.current.submitAudioAnswer('aq0', true, 100); });
    expect(result.current.phase).toBe('audio-quest');
    act(() => { result.current.submitAudioAnswer('aq1', true, 100); });
    expect(result.current.phase).toBe('build');
  });

  it('build correct (no hints): XP += 20', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent(1, 2)));
    act(() => { result.current.completeStory(); });
    act(() => { result.current.submitAudioAnswer('aq0', true, 100); }); // triggers phase=build, xp=10
    const xpBeforeBuild = result.current.xp;
    act(() => { result.current.submitBuildAnswer('bc0', true, 0, 100); });
    expect(result.current.xp).toBe(xpBeforeBuild + 20);
  });

  it('build correct (2 hints): XP gain = max(10 - 2*5, 0) = 0', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent(1, 2)));
    act(() => { result.current.completeStory(); });
    act(() => { result.current.submitAudioAnswer('aq0', false, 100); }); // phase=build, xp=0
    const xpBeforeBuild = result.current.xp;
    act(() => { result.current.submitBuildAnswer('bc0', true, 2, 100); });
    expect(result.current.xp).toBe(xpBeforeBuild + 0);
  });

  it('after last build challenge: phase transitions to reward', () => {
    const { result } = renderHook(() => useSessionEngine(makeContent(1, 1)));
    act(() => { result.current.completeStory(); });
    act(() => { result.current.submitAudioAnswer('aq0', false, 100); }); // phase=build
    expect(result.current.phase).toBe('build');
    act(() => { result.current.submitBuildAnswer('bc0', false, 0, 100); }); // last build
    expect(result.current.phase).toBe('reward');
  });
});
