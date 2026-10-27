export interface LearningDNA {
  profileId: string;
  listening: number;    // 0-100
  reading: number;      // 0-100
  cultural: number;     // 0-100
  quizSpeed: number;    // 0-100
  consistency: number;  // 0-100
  updatedAt: number;
}

export interface WeakSpot {
  topic: string;
  errorCount: number;
  percentage: number; // error rate 0-100
}

type Attempt = {
  correct: number;
  total: number;
  durationMs?: number;
  type?: string;
};

function avgByType(attempts: Attempt[], type: string): number {
  const filtered = attempts.filter((a) => a.type === type && a.total > 0);
  if (filtered.length === 0) return 50;
  const sum = filtered.reduce((acc, a) => acc + (a.correct / a.total) * 100, 0);
  return Math.min(100, Math.max(0, Math.round(sum / filtered.length)));
}

function avgSpeed(attempts: Attempt[]): number {
  const timed = attempts.filter((a) => a.durationMs != null && a.total > 0);
  if (timed.length === 0) return 50;
  // Lower ms per question → higher speed score. Baseline: 10s/q = 0, 2s/q = 100
  const scores = timed.map((a) => {
    const msPerQ = (a.durationMs ?? 0) / a.total;
    const score = 100 - ((msPerQ - 2000) / 8000) * 100;
    return Math.min(100, Math.max(0, score));
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function overallConsistency(attempts: Attempt[]): number {
  if (attempts.length === 0) return 50;
  const scored = attempts.filter((a) => a.total > 0);
  if (scored.length === 0) return 50;
  const sum = scored.reduce((acc, a) => acc + (a.correct / a.total) * 100, 0);
  return Math.min(100, Math.max(0, Math.round(sum / scored.length)));
}

export function computeLearningDNA(
  profileId: string,
  attempts: Attempt[]
): LearningDNA {
  if (attempts.length === 0) {
    return {
      profileId,
      listening: 50,
      reading: 50,
      cultural: 50,
      quizSpeed: 50,
      consistency: 50,
      updatedAt: Date.now(),
    };
  }
  return {
    profileId,
    listening: avgByType(attempts, 'listening'),
    reading: avgByType(attempts, 'reading'),
    cultural: avgByType(attempts, 'cultural'),
    quizSpeed: avgSpeed(attempts),
    consistency: overallConsistency(attempts),
    updatedAt: Date.now(),
  };
}

type TopicAttempt = { topic?: string; correct: number; total: number };

export function computeWeakSpots(attempts: TopicAttempt[]): WeakSpot[] {
  const map = new Map<string, { errors: number; total: number }>();
  for (const a of attempts) {
    const topic = a.topic ?? 'Umum';
    const existing = map.get(topic) ?? { errors: 0, total: 0 };
    existing.errors += a.total - a.correct;
    existing.total += a.total;
    map.set(topic, existing);
  }
  return Array.from(map.entries())
    .map(([topic, { errors, total }]) => ({
      topic,
      errorCount: errors,
      percentage: total > 0 ? Math.round((errors / total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);
}

export const DNA_STORAGE_KEY = (profileId: string): string =>
  `asia_dna_${profileId}`;

export function saveDNA(dna: LearningDNA): void {
  localStorage.setItem(DNA_STORAGE_KEY(dna.profileId), JSON.stringify(dna));
}

export function loadDNA(profileId: string): LearningDNA | null {
  try {
    const raw = localStorage.getItem(DNA_STORAGE_KEY(profileId));
    if (!raw) return null;
    return JSON.parse(raw) as LearningDNA;
  } catch {
    return null;
  }
}
