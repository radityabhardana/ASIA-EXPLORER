/**
 * useStoryQuestEngine.ts — React Hook Pengendali State Machine Game Cerita Interaktif
 *
 * Alur fase:
 * 'intro' -> 'packing' (siapkan bekal) -> 'playing' (adegan) -> 'note' (catatan budaya) -> 'ending'
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  StoryQuest,
  Scene,
  Choice,
  Ending,
  CultureNote,
  ChoiceReaction,
  QuestProgressState,
} from './types';
import {
  clampRespect,
  isChoiceAvailable,
  determineEnding,
  calculateQuestXp,
} from './engine';
import {
  loadQuestProgress,
  saveQuestProgress,
  clearQuestProgress,
  recordEnding,
  saveCollectedNote,
  getRelaxModePreference,
  setRelaxModePreference,
  getDiscoveredEndings,
} from './storage';

export type StoryPhase = 'intro' | 'packing' | 'playing' | 'note' | 'ending';

interface UseStoryQuestEngineOptions {
  quest: StoryQuest;
  profileId: string;
  onComplete?: (ending: Ending, earnedXp: number) => void;
}

export function useStoryQuestEngine({
  quest,
  profileId,
  onComplete,
}: UseStoryQuestEngineOptions) {
  const [phase, setPhase] = useState<StoryPhase>('intro');
  const [currentSceneId, setCurrentSceneId] = useState<string>(quest.adegan[0]?.id ?? '');
  const [respect, setRespect] = useState<number>(50);
  const [respectDeltaNotice, setRespectDeltaNotice] = useState<{
    delta: number;
    key: number;
  } | null>(null);

  const [inventory, setInventory] = useState<string[]>([]);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [discoveredNotes, setDiscoveredNotes] = useState<CultureNote[]>([]);
  const [collectedDna, setCollectedDna] = useState<string[]>([]);

  // Feedback sementara setelah memilih tindakan
  const [activeReaction, setActiveReaction] = useState<ChoiceReaction | null>(null);
  const [activeNote, setActiveNote] = useState<CultureNote | null>(null);
  const [pendingNextSceneId, setPendingNextSceneId] = useState<string | null>(null);

  // Ending
  const [achievedEnding, setAchievedEnding] = useState<Ending | null>(null);
  const [earnedXp, setEarnedXp] = useState<number>(0);

  // Mode santai (bebas timer genting)
  const [relaxMode, setRelaxMode] = useState<boolean>(getRelaxModePreference());

  const startedAtRef = useRef<number>(Date.now());
  const historyRef = useRef<{ sceneId: string; choiceId: string; respectDelta: number; chosenAt: number }[]>([]);

  // Map adegan untuk lookup instan
  const sceneMap = useRef(new Map<string, Scene>(quest.adegan.map((s) => [s.id, s])));

  // Inisialisasi: periksa apakah ada progres yang bisa dilanjutkan
  useEffect(() => {
    sceneMap.current = new Map(quest.adegan.map((s) => [s.id, s]));

    if (!profileId) return;
    const saved = loadQuestProgress(profileId, quest.countryId);

    if (saved && !saved.finishedAt && saved.currentSceneId) {
      // Ada sesi yang sedang berjalan: pulihkan
      setCurrentSceneId(saved.currentSceneId);
      setRespect(saved.respect);
      setInventory(saved.inventory);
      setFlags(saved.flags);
      setDiscoveredNotes(saved.discoveredNotes);
      setCollectedDna(saved.collectedDna);
      setRelaxMode(saved.relaxMode);
      historyRef.current = saved.history;
      startedAtRef.current = saved.startedAt;
      setPhase('playing');
    } else {
      // Sesi baru
      setPhase('intro');
      setCurrentSceneId(quest.adegan[0]?.id ?? '');
      setRespect(50);
      setInventory([]);
      setFlags({});
      setDiscoveredNotes([]);
      setCollectedDna([]);
      historyRef.current = [];
      startedAtRef.current = Date.now();
    }
  }, [profileId, quest]);

  // Current Scene Object
  const currentScene = sceneMap.current.get(currentSceneId) ?? quest.adegan[0]!;

  // Aksi 1: Mulai Siapkan Bekal dari Layar Intro
  const startPacking = useCallback(() => {
    setPhase('packing');
  }, []);

  // Aksi 2: Toggle pilihan bekal (maks 2 item)
  const togglePackingItem = useCallback((itemId: string) => {
    setInventory((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      }
      if (prev.length >= 2) {
        // Ganti item tertua jika sudah 2
        return [prev[1]!, itemId];
      }
      return [...prev, itemId];
    });
  }, []);

  // Aksi 3: Konfirmasi bekal dan masuki adegan 1
  const confirmPackingAndStart = useCallback(() => {
    setPhase('playing');
    const firstSceneId = quest.adegan[0]?.id ?? '';
    setCurrentSceneId(firstSceneId);

    if (profileId) {
      const state: QuestProgressState = {
        version: 1,
        profileId,
        countryId: quest.countryId,
        questId: quest.id,
        currentSceneId: firstSceneId,
        respect: 50,
        inventory,
        flags: {},
        discoveredNotes: [],
        collectedDna: [],
        history: [],
        relaxMode,
        startedAt: startedAtRef.current,
        finishedAt: null,
        endingAchieved: null,
        earnedXp: 0,
        lastUpdated: Date.now(),
      };
      saveQuestProgress(profileId, state);
    }
  }, [quest, profileId, inventory, relaxMode]);

  // Aksi 4: Memilih pilihan tindakan pada adegan
  const selectChoice = useCallback(
    (choice: Choice) => {
      // 1. Verifikasi ketersediaan syarat
      const check = isChoiceAvailable(choice, inventory, flags, respect);
      if (!check.available) return;

      // 2. Hitung meter respect baru
      const delta = choice.respectDelta;
      const newRespect = clampRespect(respect + delta);
      setRespect(newRespect);
      setRespectDeltaNotice({ delta, key: Date.now() });

      // 3. Update flags
      const updatedFlags = { ...flags, ...(choice.setFlags ?? {}) };
      if (choice.setFlags) {
        setFlags(updatedFlags);
      }

      // 4. Update DNA tags
      if (choice.dnaTags) {
        setCollectedDna((prev) => [...prev, ...(choice.dnaTags ?? [])]);
      }

      // 5. Simpan Catatan Budaya ke koleksi global
      if (profileId) {
        saveCollectedNote(profileId, quest.countryId, quest.id, choice.catatan);
      }

      const updatedNotes = [...discoveredNotes, choice.catatan];
      setDiscoveredNotes(updatedNotes);

      // 6. Catat riwayat
      historyRef.current.push({
        sceneId: currentSceneId,
        choiceId: choice.id,
        respectDelta: delta,
        chosenAt: Date.now(),
      });

      // 7. Simpan reaksi & catatan, beralih ke fase 'note'
      setActiveReaction(choice.reaksi);
      setActiveNote(choice.catatan);
      setPendingNextSceneId(choice.nextSceneId);
      setPhase('note');

      // 8. Auto-save progres
      if (profileId) {
        const state: QuestProgressState = {
          version: 1,
          profileId,
          countryId: quest.countryId,
          questId: quest.id,
          currentSceneId: choice.nextSceneId === 'ending' ? currentSceneId : choice.nextSceneId,
          respect: newRespect,
          inventory,
          flags: updatedFlags,
          discoveredNotes: updatedNotes,
          collectedDna: [...collectedDna, ...(choice.dnaTags ?? [])],
          history: historyRef.current,
          relaxMode,
          startedAt: startedAtRef.current,
          finishedAt: null,
          endingAchieved: null,
          earnedXp: 0,
          lastUpdated: Date.now(),
        };
        saveQuestProgress(profileId, state);
      }
    },
    [
      inventory,
      flags,
      respect,
      profileId,
      quest,
      currentSceneId,
      discoveredNotes,
      collectedDna,
      relaxMode,
    ],
  );

  // Aksi 5: Melanjutkan setelah membaca Catatan Budaya
  const continueFromNote = useCallback(() => {
    setActiveNote(null);
    setActiveReaction(null);

    if (!pendingNextSceneId || pendingNextSceneId === 'ending') {
      // Selesaikan quest: hitung ending & XP
      const end = determineEnding(quest.ending, respect);
      const previousEndings = profileId ? getDiscoveredEndings(profileId, quest.countryId) : [];
      const isFirst = previousEndings.length === 0;
      const xp = calculateQuestXp(end.id, discoveredNotes.length, isFirst);

      setAchievedEnding(end);
      setEarnedXp(xp);
      setPhase('ending');

      if (profileId) {
        recordEnding(profileId, quest.countryId, end.id);

        const finalState: QuestProgressState = {
          version: 1,
          profileId,
          countryId: quest.countryId,
          questId: quest.id,
          currentSceneId: 'ending',
          respect,
          inventory,
          flags,
          discoveredNotes,
          collectedDna,
          history: historyRef.current,
          relaxMode,
          startedAt: startedAtRef.current,
          finishedAt: Date.now(),
          endingAchieved: end.id,
          earnedXp: xp,
          lastUpdated: Date.now(),
        };
        saveQuestProgress(profileId, finalState);
      }

      onComplete?.(end, xp);
    } else {
      // Masuk ke adegan berikutnya
      setCurrentSceneId(pendingNextSceneId);
      setPendingNextSceneId(null);
      setPhase('playing');
    }
  }, [
    pendingNextSceneId,
    quest,
    respect,
    profileId,
    discoveredNotes,
    inventory,
    flags,
    collectedDna,
    relaxMode,
    onComplete,
  ]);

  // Aksi 6: Toggle Mode Santai
  const toggleRelaxMode = useCallback(() => {
    setRelaxMode((prev) => {
      const next = !prev;
      setRelaxModePreference(next);
      return next;
    });
  }, []);

  // Aksi 7: Main lagi (reset ke intro)
  const restartQuest = useCallback(() => {
    if (profileId) {
      clearQuestProgress(profileId, quest.countryId);
    }
    setPhase('intro');
    setCurrentSceneId(quest.adegan[0]?.id ?? '');
    setRespect(50);
    setRespectDeltaNotice(null);
    setInventory([]);
    setFlags({});
    setDiscoveredNotes([]);
    setCollectedDna([]);
    setActiveNote(null);
    setActiveReaction(null);
    setAchievedEnding(null);
    setEarnedXp(0);
    historyRef.current = [];
    startedAtRef.current = Date.now();
  }, [profileId, quest]);

  return {
    phase,
    currentScene,
    currentSceneId,
    respect,
    respectDeltaNotice,
    inventory,
    flags,
    discoveredNotes,
    activeNote,
    activeReaction,
    achievedEnding,
    earnedXp,
    relaxMode,
    // Actions
    startPacking,
    togglePackingItem,
    confirmPackingAndStart,
    selectChoice,
    continueFromNote,
    toggleRelaxMode,
    restartQuest,
  };
}
