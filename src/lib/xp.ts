export interface LevelInfo {
  level: number;
  name: string;
  xpRequired: number;
  xpNext: number;
}

const LEVELS: Array<{ name: string; xp: number }> = [
  { name: 'Pemula', xp: 0 },
  { name: 'Penasaran', xp: 100 },
  { name: 'Penjelajah', xp: 300 },
  { name: 'Pelancong', xp: 600 },
  { name: 'Petualang', xp: 1000 },
  { name: 'Ahli Budaya', xp: 1500 },
  { name: 'Master Asia', xp: 2500 },
];

export function getLevelInfo(totalXP: number): LevelInfo {
  let levelIndex = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (totalXP >= (LEVELS[i]?.xp ?? 0)) {
      levelIndex = i;
      break;
    }
  }
  const current = LEVELS[levelIndex]!;
  const next = LEVELS[levelIndex + 1];
  return {
    level: levelIndex + 1,
    name: current.name,
    xpRequired: current.xp,
    xpNext: next?.xp ?? current.xp,
  };
}

export function getXPProgress(totalXP: number): number {
  const info = getLevelInfo(totalXP);
  if (info.xpNext === info.xpRequired) return 1;
  return Math.min(1, (totalXP - info.xpRequired) / (info.xpNext - info.xpRequired));
}

export const XP_REWARDS = {
  lessonComplete: 50,
  questPerfect: 100,
  questPass: 40,
  dailyStreak: 20,
  wordOfDay: 5,
  listening: 10,
  quizCorrect: 15,
  quizPerfectBonus: 25,
} as const;
