import type { StoryQuest } from '@/lib/story-quest/types';
import { japanQuest } from './japan';
import { thailandQuest } from './thailand';
import {
  indonesiaQuest,
  singaporeQuest,
  philippinesQuest,
  chinaQuest,
  koreaQuest,
  saudiQuest,
  turkeyQuest,
  uzbekistanQuest,
} from './stubs';

export const STORY_QUESTS: Record<string, StoryQuest> = {
  jp: japanQuest,
  th: thailandQuest,
  id: indonesiaQuest,
  sg: singaporeQuest,
  ph: philippinesQuest,
  cn: chinaQuest,
  kr: koreaQuest,
  sa: saudiQuest,
  tr: turkeyQuest,
  uz: uzbekistanQuest,
};

export function getStoryQuest(countryId: string): StoryQuest | undefined {
  return STORY_QUESTS[countryId.toLowerCase()];
}

export function getAllStoryQuests(): StoryQuest[] {
  return Object.values(STORY_QUESTS);
}

export {
  japanQuest,
  thailandQuest,
  indonesiaQuest,
  singaporeQuest,
  philippinesQuest,
  chinaQuest,
  koreaQuest,
  saudiQuest,
  turkeyQuest,
  uzbekistanQuest,
};
