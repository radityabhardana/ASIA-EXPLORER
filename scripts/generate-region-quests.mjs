import fs from 'fs';
import path from 'path';
import { southeastAsiaQuests } from './specs/southeast-asia-specs.mjs';
import { eastAsiaQuests } from './specs/east-asia-specs.mjs';
import { centralAsiaQuests } from './specs/central-asia-specs.mjs';
import { southAsiaQuests } from './specs/south-asia-specs.mjs';
import { westAsiaQuests } from './specs/west-asia-specs.mjs';

function generateTsFile(quests, outPath) {
  let code = `import type { StoryQuest } from '@/lib/story-quest/types';\n\n`;
  for (const q of quests) {
    code += `export const ${q.varName}: StoryQuest = ${JSON.stringify(q.data, null, 2)};\n\n`;
  }
  fs.writeFileSync(outPath, code, 'utf8');
  console.log(`Wrote ${quests.length} quests to ${outPath}`);
}

generateTsFile(southeastAsiaQuests, './src/data/story-quests/southeast-asia.ts');
generateTsFile(eastAsiaQuests, './src/data/story-quests/east-asia.ts');
generateTsFile(centralAsiaQuests, './src/data/story-quests/central-asia.ts');
generateTsFile(southAsiaQuests, './src/data/story-quests/south-asia.ts');
generateTsFile(westAsiaQuests, './src/data/story-quests/west-asia.ts');

console.log('All 5 region files generated successfully.');
