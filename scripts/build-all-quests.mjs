import fs from 'fs';

// Helper to format a StoryQuest object into clean TypeScript code
function formatQuestTs(quest) {
  return `export const ${quest.varName}: StoryQuest = ${JSON.stringify(quest.data, null, 2)};\n`;
}

// 1. SOUTHEAST ASIA (7 countries)
// my, vn, bn, kh, la, mm, tl
import { southeastAsiaQuests } from './specs/southeast-asia-specs.mjs';

// 2. EAST ASIA (2 countries)
// mn, kp
import { eastAsiaQuests } from './specs/east-asia-specs.mjs';

// 3. SOUTH ASIA (9 countries)
// in, af, bd, bt, ir, mv, np, pk, lk
import { southAsiaQuests } from './specs/south-asia-specs.mjs';

// 4. CENTRAL ASIA (4 countries)
// kz, kg, tj, tm
import { centralAsiaQuests } from './specs/central-asia-specs.mjs';

// 5. WEST ASIA (16 countries)
// am, az, bh, cy, ge, iq, il, jo, kw, lb, om, ps, qa, sy, ae, ye
import { westAsiaQuests } from './specs/west-asia-specs.mjs';

console.log('Specs loaded successfully:');
console.log('Southeast Asia:', southeastAsiaQuests.length);
console.log('East Asia:', eastAsiaQuests.length);
console.log('South Asia:', southAsiaQuests.length);
console.log('Central Asia:', centralAsiaQuests.length);
console.log('West Asia:', westAsiaQuests.length);
console.log('Total:', southeastAsiaQuests.length + eastAsiaQuests.length + southAsiaQuests.length + centralAsiaQuests.length + westAsiaQuests.length);
