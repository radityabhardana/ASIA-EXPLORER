import { describe, it, expect, beforeEach } from 'vitest';
import {
  clampRespect,
  isChoiceAvailable,
  resolveSceneNarration,
  resolveSceneDialogText,
  determineEnding,
  calculateQuestXp,
  validateQuestData,
} from './engine';
import {
  loadQuestProgress,
  saveQuestProgress,
  clearQuestProgress,
  getDiscoveredEndings,
  recordEnding,
  getCollectedNotes,
  saveCollectedNote,
  getRelaxModePreference,
  setRelaxModePreference,
} from './storage';
import type { StoryQuest, Choice, Scene, Ending, QuestProgressState } from './types';

describe('Story Quest Engine: Pure Logic Functions', () => {
  describe('clampRespect', () => {
    it('clamps values between 0 and 100', () => {
      expect(clampRespect(50)).toBe(50);
      expect(clampRespect(-15)).toBe(0);
      expect(clampRespect(140)).toBe(100);
      expect(clampRespect(0)).toBe(0);
      expect(clampRespect(100)).toBe(100);
      expect(clampRespect(84.6)).toBe(85);
      expect(clampRespect(NaN)).toBe(50);
    });
  });

  describe('isChoiceAvailable', () => {
    const baseChoice: Choice = {
      id: 'c1',
      teks: 'Pilihan biasa',
      respectDelta: 5,
      reaksi: { ekspresi: 'senang', teks: 'Terima kasih.' },
      catatan: { judul: 'Adat', isi: 'Penjelasan', kategori: 'Etiket' },
      nextSceneId: 's2',
    };

    it('returns available: true when choice has no conditions', () => {
      expect(isChoiceAvailable(baseChoice).available).toBe(true);
    });

    it('validates packing item requirements (butuhBekal)', () => {
      const choiceWithBekal: Choice = {
        ...baseChoice,
        syarat: { butuhBekal: ['oleh2', 'frasa'], hint: 'Butuh oleh-oleh & frasa' },
      };

      expect(isChoiceAvailable(choiceWithBekal, ['oleh2']).available).toBe(false);
      expect(isChoiceAvailable(choiceWithBekal, ['oleh2', 'frasa']).available).toBe(true);
      expect(isChoiceAvailable(choiceWithBekal, []).reason).toBe('Butuh oleh-oleh & frasa');
    });

    it('validates flag requirements (butuhFlags)', () => {
      const choiceWithFlag: Choice = {
        ...baseChoice,
        syarat: { butuhFlags: { sopanSepatu: true } },
      };

      expect(isChoiceAvailable(choiceWithFlag, [], {}).available).toBe(false);
      expect(isChoiceAvailable(choiceWithFlag, [], { sopanSepatu: false }).available).toBe(false);
      expect(isChoiceAvailable(choiceWithFlag, [], { sopanSepatu: true }).available).toBe(true);
    });

    it('validates respect threshold (minRespect)', () => {
      const choiceWithRespect: Choice = {
        ...baseChoice,
        syarat: { minRespect: 70, hint: 'Butuh rasa hormat tinggi' },
      };

      expect(isChoiceAvailable(choiceWithRespect, [], {}, 65).available).toBe(false);
      expect(isChoiceAvailable(choiceWithRespect, [], {}, 70).available).toBe(true);
      expect(isChoiceAvailable(choiceWithRespect, [], {}, 85).available).toBe(true);
    });
  });

  describe('resolveSceneNarration & resolveSceneDialogText', () => {
    const scene: Scene = {
      id: 's1',
      latar: 'Latar',
      narasi: 'Narasi default',
      narasiJika: {
        bawaKado: 'Pak Tanaka tersenyum melihat bungkusan di tanganmu.',
      },
      dialog: {
        speaker: 'Pak Tanaka',
        teks: 'Dialog default.',
        ekspresi: 'senang',
      },
      teksJika: {
        sopanSepatu: 'Terima kasih telah melepas sepatu dengan rapi!',
      },
      pilihan: [],
    };

    it('resolves default texts when no flags match', () => {
      expect(resolveSceneNarration(scene, {})).toBe('Narasi default');
      expect(resolveSceneDialogText(scene, {})).toBe('Dialog default.');
    });

    it('resolves conditional narration and dialog when flags are set', () => {
      expect(resolveSceneNarration(scene, { bawaKado: true })).toBe(
        'Pak Tanaka tersenyum melihat bungkusan di tanganmu.',
      );
      expect(resolveSceneDialogText(scene, { sopanSepatu: true })).toBe(
        'Terima kasih telah melepas sepatu dengan rapi!',
      );
    });
  });

  describe('determineEnding', () => {
    const standardEndings: Ending[] = [
      { id: 'sahabat', minRespect: 80, judul: 'Sahabat Keluarga', ringkasan: 'R1' },
      { id: 'diterima', minRespect: 50, judul: 'Tamu yang Diterima', ringkasan: 'R2' },
      { id: 'canggung', minRespect: 0, judul: 'Malam yang Canggung', ringkasan: 'R3' },
    ];

    it('identifies sahabat tier for respect >= 80', () => {
      expect(determineEnding(standardEndings, 80).id).toBe('sahabat');
      expect(determineEnding(standardEndings, 95).id).toBe('sahabat');
      expect(determineEnding(standardEndings, 100).id).toBe('sahabat');
    });

    it('identifies diterima tier for respect between 50 and 79', () => {
      expect(determineEnding(standardEndings, 50).id).toBe('diterima');
      expect(determineEnding(standardEndings, 65).id).toBe('diterima');
      expect(determineEnding(standardEndings, 79).id).toBe('diterima');
    });

    it('identifies canggung tier for respect < 50', () => {
      expect(determineEnding(standardEndings, 49).id).toBe('canggung');
      expect(determineEnding(standardEndings, 20).id).toBe('canggung');
      expect(determineEnding(standardEndings, 0).id).toBe('canggung');
    });
  });

  describe('calculateQuestXp', () => {
    it('calculates XP for first completion correctly with cap at 60', () => {
      // sahabat: 40 base + 5 notes * 4 = 60
      expect(calculateQuestXp('sahabat', 5, true)).toBe(60);
      expect(calculateQuestXp('sahabat', 8, true)).toBe(60); // capped at 60

      // diterima: 28 base + 3 notes * 4 = 40
      expect(calculateQuestXp('diterima', 3, true)).toBe(40);

      // canggung: 16 base + 1 note * 4 = 20
      expect(calculateQuestXp('canggung', 1, true)).toBe(20);
    });

    it('handles repeat completions giving only bonus for new notes', () => {
      expect(calculateQuestXp('sahabat', 0, false)).toBe(0);
      expect(calculateQuestXp('sahabat', 2, false)).toBe(10);
      expect(calculateQuestXp('sahabat', 6, false)).toBe(20); // capped at 20
    });
  });

  describe('validateQuestData', () => {
    const validQuest: StoryQuest = {
      id: 'quest-sample',
      countryId: 'jp',
      negara: 'Jepang',
      judul: 'Makan Malam',
      pengantar: 'Pengantar',
      npc: { nama: 'Pak Tanaka', peran: 'Ayah', avatar: 'PT' },
      bekal: [
        { id: 'b1', nama: 'B1', ikon: 'gift' },
        { id: 'b2', nama: 'B2', ikon: 'message-square' },
        { id: 'b3', nama: 'B3', ikon: 'sparkles' },
        { id: 'b4', nama: 'B4', ikon: 'credit-card' },
      ],
      adegan: [
        {
          id: 's1',
          latar: 'Latar 1',
          narasi: 'Narasi 1',
          dialog: { speaker: 'Pak Tanaka', teks: 'Halo', ekspresi: 'senang' },
          pilihan: [
            {
              id: 'c1',
              teks: 'Pilihan 1',
              respectDelta: 10,
              reaksi: { ekspresi: 'senang', teks: 'Bagus' },
              catatan: { judul: 'J1', isi: 'I1', kategori: 'Etiket' },
              nextSceneId: 's2',
            },
            {
              id: 'c2',
              teks: 'Pilihan 2',
              respectDelta: -5,
              reaksi: { ekspresi: 'bingung', teks: 'Hmm' },
              catatan: { judul: 'J2', isi: 'I2', kategori: 'Etiket' },
              nextSceneId: 's2',
            },
          ],
        },
        {
          id: 's2',
          latar: 'Latar 2',
          narasi: 'Narasi 2',
          dialog: { speaker: 'Pak Tanaka', teks: 'Penutup', ekspresi: 'senang' },
          timer: 12,
          timeoutChoiceId: 'c3',
          pilihan: [
            {
              id: 'c3',
              teks: 'Pilihan 3',
              respectDelta: 5,
              reaksi: { ekspresi: 'senang', teks: 'Mantap' },
              catatan: { judul: 'J3', isi: 'I3', kategori: 'Etiket' },
              nextSceneId: 'ending',
            },
            {
              id: 'c4',
              teks: 'Pilihan 4',
              respectDelta: -10,
              reaksi: { ekspresi: 'kecewa', teks: 'Sayang sekali' },
              catatan: { judul: 'J4', isi: 'I4', kategori: 'Etiket' },
              nextSceneId: 'ending',
            },
          ],
        },
      ],
      ending: [
        { id: 'sahabat', minRespect: 80, judul: 'Sahabat', ringkasan: 'R1' },
        { id: 'diterima', minRespect: 50, judul: 'Diterima', ringkasan: 'R2' },
        { id: 'canggung', minRespect: 0, judul: 'Canggung', ringkasan: 'R3' },
      ],
    };

    it('passes a fully valid quest schema', () => {
      const result = validateQuestData(validQuest);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('detects invalid nextSceneId and missing timeout choice', () => {
      const invalidQuest: StoryQuest = {
        ...validQuest,
        adegan: [
          {
            ...validQuest.adegan[0]!,
            pilihan: [
              {
                ...validQuest.adegan[0]!.pilihan[0]!,
                nextSceneId: 'scene-yang-tidak-ada',
              },
              validQuest.adegan[0]!.pilihan[1]!,
            ],
          },
          {
            ...validQuest.adegan[1]!,
            timeoutChoiceId: 'choice-gaib',
          },
        ],
      };

      const result = validateQuestData(invalidQuest);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('scene-yang-tidak-ada'))).toBe(true);
      expect(result.errors.some((e) => e.includes('choice-gaib'))).toBe(true);
    });
  });
});

describe('Story Quest Storage: Local Persistence', () => {
  const profileId = 'user-test-123';
  const countryId = 'jp';

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves, loads, and clears quest progress', () => {
    expect(loadQuestProgress(profileId, countryId)).toBeNull();

    const mockProgress: QuestProgressState = {
      version: 1,
      profileId,
      countryId,
      questId: 'jepang',
      currentSceneId: 's2',
      respect: 65,
      inventory: ['oleh2', 'frasa'],
      flags: { sopanSepatu: true },
      discoveredNotes: [{ judul: 'Genkan', isi: 'Area sepatu', kategori: 'Etiket' }],
      collectedDna: ['detail'],
      history: [{ sceneId: 's1', choiceId: 'c1', respectDelta: 15, chosenAt: Date.now() }],
      relaxMode: false,
      startedAt: Date.now(),
      finishedAt: null,
      endingAchieved: null,
      earnedXp: 0,
      lastUpdated: Date.now(),
    };

    saveQuestProgress(profileId, mockProgress);
    const loaded = loadQuestProgress(profileId, countryId);

    expect(loaded).not.toBeNull();
    expect(loaded?.currentSceneId).toBe('s2');
    expect(loaded?.respect).toBe(65);
    expect(loaded?.inventory).toEqual(['oleh2', 'frasa']);

    clearQuestProgress(profileId, countryId);
    expect(loadQuestProgress(profileId, countryId)).toBeNull();
  });

  it('records and retrieves discovered endings uniquely', () => {
    expect(getDiscoveredEndings(profileId, countryId)).toEqual([]);

    recordEnding(profileId, countryId, 'diterima');
    recordEnding(profileId, countryId, 'sahabat');
    recordEnding(profileId, countryId, 'diterima'); // duplikat

    const endings = getDiscoveredEndings(profileId, countryId);
    expect(endings).toEqual(['diterima', 'sahabat']);
  });

  it('saves and deduplicates collected culture notes', () => {
    expect(getCollectedNotes(profileId)).toEqual([]);

    const note1 = { judul: 'Genkan', isi: 'Area sepatu', kategori: 'Etiket' as const };
    const note2 = { judul: 'Itadakimasu', isi: 'Ungkapan makan', kategori: 'Bahasa' as const };

    const firstAdd = saveCollectedNote(profileId, countryId, 'jepang', note1);
    expect(firstAdd).toBe(true);

    const duplicateAdd = saveCollectedNote(profileId, countryId, 'jepang', note1);
    expect(duplicateAdd).toBe(false);

    saveCollectedNote(profileId, countryId, 'jepang', note2);

    const allNotes = getCollectedNotes(profileId);
    expect(allNotes.length).toBe(2);
    expect(allNotes[0]!.judul).toBe('Genkan');
    expect(allNotes[1]!.judul).toBe('Itadakimasu');
  });

  it('handles relax mode preference toggle', () => {
    expect(getRelaxModePreference()).toBe(false);
    setRelaxModePreference(true);
    expect(getRelaxModePreference()).toBe(true);
    setRelaxModePreference(false);
    expect(getRelaxModePreference()).toBe(false);
  });
});
