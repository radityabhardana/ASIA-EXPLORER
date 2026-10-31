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
import {
  malaysiaQuest,
  vietnamQuest,
  bruneiQuest,
  cambodiaQuest,
  laosQuest,
  myanmarQuest,
  timorLesteQuest,
} from './southeast-asia';
import {
  mongoliaQuest,
  northKoreaQuest,
} from './east-asia';
import {
  kazakhstanQuest,
  kyrgyzstanQuest,
  tajikistanQuest,
  turkmenistanQuest,
} from './central-asia';
import {
  indiaQuest,
  afghanistanQuest,
  bangladeshQuest,
  bhutanQuest,
  iranQuest,
  maldivesQuest,
  nepalQuest,
  pakistanQuest,
  sriLankaQuest,
} from './south-asia';
import {
  armeniaQuest,
  azerbaijanQuest,
  bahrainQuest,
  cyprusQuest,
  georgiaQuest,
  iraqQuest,
  israelQuest,
  jordanQuest,
  kuwaitQuest,
  lebanonQuest,
  omanQuest,
  palestineQuest,
  qatarQuest,
  syriaQuest,
  uaeQuest,
  yemenQuest,
} from './west-asia';

export const STORY_QUESTS: Record<string, StoryQuest> = {
  // Asia Timur
  jp: japanQuest,
  cn: chinaQuest,
  kr: koreaQuest,
  mn: mongoliaQuest,
  kp: northKoreaQuest,

  // Asia Tenggara
  id: indonesiaQuest,
  my: malaysiaQuest,
  sg: singaporeQuest,
  th: thailandQuest,
  vn: vietnamQuest,
  ph: philippinesQuest,
  bn: bruneiQuest,
  kh: cambodiaQuest,
  la: laosQuest,
  mm: myanmarQuest,
  tl: timorLesteQuest,

  // Asia Selatan
  in: indiaQuest,
  af: afghanistanQuest,
  bd: bangladeshQuest,
  bt: bhutanQuest,
  ir: iranQuest,
  mv: maldivesQuest,
  np: nepalQuest,
  pk: pakistanQuest,
  lk: sriLankaQuest,

  // Asia Tengah
  kz: kazakhstanQuest,
  uz: uzbekistanQuest,
  kg: kyrgyzstanQuest,
  tj: tajikistanQuest,
  tm: turkmenistanQuest,

  // Asia Barat
  sa: saudiQuest,
  tr: turkeyQuest,
  am: armeniaQuest,
  az: azerbaijanQuest,
  bh: bahrainQuest,
  cy: cyprusQuest,
  ge: georgiaQuest,
  iq: iraqQuest,
  il: israelQuest,
  jo: jordanQuest,
  kw: kuwaitQuest,
  lb: lebanonQuest,
  om: omanQuest,
  ps: palestineQuest,
  qa: qatarQuest,
  sy: syriaQuest,
  ae: uaeQuest,
  ye: yemenQuest,
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
  malaysiaQuest,
  vietnamQuest,
  bruneiQuest,
  cambodiaQuest,
  laosQuest,
  myanmarQuest,
  timorLesteQuest,
  mongoliaQuest,
  northKoreaQuest,
  kazakhstanQuest,
  kyrgyzstanQuest,
  tajikistanQuest,
  turkmenistanQuest,
  indiaQuest,
  afghanistanQuest,
  bangladeshQuest,
  bhutanQuest,
  iranQuest,
  maldivesQuest,
  nepalQuest,
  pakistanQuest,
  sriLankaQuest,
  armeniaQuest,
  azerbaijanQuest,
  bahrainQuest,
  cyprusQuest,
  georgiaQuest,
  iraqQuest,
  israelQuest,
  jordanQuest,
  kuwaitQuest,
  lebanonQuest,
  omanQuest,
  palestineQuest,
  qatarQuest,
  syriaQuest,
  uaeQuest,
  yemenQuest,
};
