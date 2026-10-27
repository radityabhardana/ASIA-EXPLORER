import type { LearningDNA } from '@/lib/learningDna';
import type { WeakSpot } from '@/lib/learningDna';
import type { Progress } from '@/lib/storage/types';

export interface OptimizerSettings {
  mode: 'manual' | 'ai';
  openaiApiKey?: string;
  lastUpdated: number;
}

const SETTINGS_KEY = 'asia_optimizer_settings';

export function getOptimizerSettings(): OptimizerSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { mode: 'manual', lastUpdated: 0 };
    return JSON.parse(raw) as OptimizerSettings;
  } catch {
    return { mode: 'manual', lastUpdated: 0 };
  }
}

export function saveOptimizerSettings(settings: OptimizerSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export interface Recommendation {
  type: 'review' | 'lesson' | 'quest';
  countryId?: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
}

export type ProgressData = Progress | { countries?: Record<string, any> } | null;

export function getManualRecommendations(
  dna: LearningDNA | null,
  weakSpots: WeakSpot[],
  progress: ProgressData
): Recommendation[] {
  const recs: Recommendation[] = [];

  for (const ws of weakSpots) {
    if (ws.percentage > 50) {
      recs.push({
        type: 'review',
        message: `Ulangi topik "${ws.topic}" — tingkat kesalahan ${ws.percentage}%`,
        priority: 'high',
      });
    }
  }

  if (dna && dna.listening < 40) {
    recs.push({
      type: 'lesson',
      message: 'Coba sesi Dengarkan lebih banyak untuk meningkatkan kemampuan mendengar',
      priority: 'medium',
    });
  }

  if (progress && progress.countries) {
    for (const [countryId, data] of Object.entries(progress.countries)) {
      const cData = data as any;
      const hasLesson =
        cData.lessonCompletedAt != null ||
        (Array.isArray(cData.lessonsCompleted) && cData.lessonsCompleted.length > 0);
      const questDone = (cData.questAttempts ?? 0) > 0;
      if (hasLesson && !questDone) {
        recs.push({
          type: 'quest',
          countryId,
          message: `Selesaikan quest ${countryId}`,
          priority: 'medium',
        });
      }
    }
  }

  recs.push({
    type: 'lesson',
    message: 'Terus semangat belajar!',
    priority: 'low',
  });

  return recs;
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface OpenAIChoice {
  message: OpenAIMessage;
}

interface OpenAIResponse {
  choices: OpenAIChoice[];
}

export async function getAIRecommendations(
  apiKey: string,
  dna: LearningDNA | null,
  weakSpots: WeakSpot[]
): Promise<Recommendation[]> {
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'Kamu adalah tutor bahasa Asia. Berikan rekomendasi belajar singkat dalam Bahasa Indonesia. ' +
              'Balas dengan JSON array berisi objek { type, message, priority } di mana type adalah "review"|"lesson"|"quest" dan priority adalah "high"|"medium"|"low".',
          },
          {
            role: 'user',
            content: JSON.stringify({ dna, weakSpots }),
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!res.ok) throw new Error(`OpenAI error: ${res.status}`);

    const data = (await res.json()) as OpenAIResponse;
    const content = data.choices[0]?.message.content ?? '[]';
    const parsed = JSON.parse(content) as Recommendation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return getManualRecommendations(dna, weakSpots, null);
  }
}
