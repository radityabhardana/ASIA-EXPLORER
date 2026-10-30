import { describe, it, expect } from 'vitest';
import { getAllStoryQuests, getStoryQuest } from './index';
import { validateQuestData } from '@/lib/story-quest/engine';

describe('Story Quests Data Validation', () => {
  const allQuests = getAllStoryQuests();

  it('contains exactly 10 story quests covering all supported countries', () => {
    expect(allQuests).toHaveLength(10);
    const expectedCountries = ['jp', 'th', 'id', 'sg', 'ph', 'cn', 'kr', 'sa', 'tr', 'uz'];
    expectedCountries.forEach((code) => {
      expect(getStoryQuest(code)).toBeDefined();
    });
  });

  it('validates every story quest passes engine schema requirements', () => {
    allQuests.forEach((quest) => {
      const result = validateQuestData(quest);
      if (!result.valid) {
        console.error(`Validation failed for ${quest.countryId}:`, result.errors);
      }
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  it('verifies Japan quest has rich narrative, branching, and timed mini-boss scene', () => {
    const jp = getStoryQuest('jp')!;
    expect(jp.adegan.length).toBeGreaterThanOrEqual(5);
    expect(jp.bekal).toHaveLength(4);
    expect(jp.npc.nama).toBe('Pak Tanaka');

    // Check timed mini-boss scene
    const timedScene = jp.adegan.find((s) => typeof s.timer === 'number' && s.timer > 0);
    expect(timedScene).toBeDefined();
    expect(timedScene?.timer).toBe(12);
    expect(timedScene?.timeoutChoiceId).toBe('jp_c4_timeout_panik');

    // Check choices with item conditions
    const conditionedChoice = jp.adegan
      .flatMap((s) => s.pilihan)
      .find((c) => c.syarat?.butuhBekal && c.syarat.butuhBekal.length > 0);
    expect(conditionedChoice).toBeDefined();
  });

  it('verifies Thailand quest has rich narrative, branching, and timed mini-boss scene', () => {
    const th = getStoryQuest('th')!;
    expect(th.adegan.length).toBeGreaterThanOrEqual(5);
    expect(th.bekal).toHaveLength(4);
    expect(th.npc.nama).toBe('Mae Somchai');

    // Check timed mini-boss scene
    const timedScene = th.adegan.find((s) => typeof s.timer === 'number' && s.timer > 0);
    expect(timedScene).toBeDefined();
    expect(timedScene?.timer).toBe(12);
    expect(timedScene?.timeoutChoiceId).toBe('th_c4_timeout_panik');

    // Check choices with item conditions
    const conditionedChoice = th.adegan
      .flatMap((s) => s.pilihan)
      .find((c) => c.syarat?.butuhBekal && c.syarat.butuhBekal.length > 0);
    expect(conditionedChoice).toBeDefined();
  });

  it('verifies all 8 stub quests have at least 3 scenes and valid culture notes', () => {
    const stubCodes = ['id', 'sg', 'ph', 'cn', 'kr', 'sa', 'tr', 'uz'];
    stubCodes.forEach((code) => {
      const q = getStoryQuest(code)!;
      expect(q.adegan.length).toBeGreaterThanOrEqual(3);
      expect(q.bekal).toHaveLength(4);
      q.adegan.forEach((scene) => {
        scene.pilihan.forEach((choice) => {
          expect(choice.catatan.judul).toBeTruthy();
          expect(choice.catatan.isi).toBeTruthy();
          expect(choice.catatan.kategori).toBeTruthy();
        });
      });
    });
  });
});
