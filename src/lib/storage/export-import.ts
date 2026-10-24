import { z } from 'zod';
import type { Attempt, LessonProgress, PhraseReview, Profile, Progress } from './types';

export const CURRENT_SCHEMA_VERSION = 1;

export const BackupPayloadSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.number(),
  profiles: z.array(
    z.object({
      id: z.string(),
      displayName: z.string(),
      createdAt: z.number(),
      locale: z.enum(['id', 'en']),
    }),
  ),
  progress: z.array(
    z.object({
      profileId: z.string(),
      countries: z.record(
        z.string(),
        z.object({
          openedAt: z.number(),
          lastSeenAt: z.number(),
          lessonCompletedAt: z.number().nullable(),
          storySeen: z.boolean(),
        }),
      ),
      lastAttemptId: z.string().optional(),
    }),
  ),
  lessons: z.array(
    z.object({
      profileId: z.string(),
      countryId: z.string(),
      stepsDone: z.array(z.enum(['kenali', 'etiket', 'bahasa', 'quest'])),
      startedAt: z.number(),
      completedAt: z.number().nullable(),
    }),
  ),
  attempts: z.array(
    z.object({
      id: z.string(),
      profileId: z.string(),
      countryId: z.string(),
      itemIds: z.array(z.string()),
      answers: z.array(
        z.object({
          itemId: z.string(),
          given: z.union([z.string(), z.array(z.string())]),
          correct: z.boolean(),
          elapsedMs: z.number(),
        }),
      ),
      startedAt: z.number(),
      finishedAt: z.number().nullable(),
      durationMs: z.number().nullable(),
      mode: z.enum(['full', 'retry-wrong']),
    }),
  ),
  reviews: z.array(
    z.object({
      profileId: z.string(),
      phraseId: z.string(),
      box: z.number().int().min(1).max(5),
      dueDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      lastReviewedDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
      lapses: z.number().int().min(0),
      reviews: z.number().int().min(0),
    }),
  ),
});

export type BackupPayload = z.infer<typeof BackupPayloadSchema>;

export function createBackupPayload(
  profiles: Profile[],
  progress: Progress[],
  lessons: LessonProgress[],
  attempts: Attempt[],
  reviews: PhraseReview[],
): BackupPayload {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    exportedAt: Date.now(),
    profiles,
    progress,
    lessons,
    attempts,
    reviews,
  };
}

export function parseAndValidateBackup(jsonString: string): {
  success: boolean;
  data?: BackupPayload;
  error?: string;
} {
  try {
    const parsed = JSON.parse(jsonString) as unknown;
    const result = BackupPayloadSchema.safeParse(parsed);
    if (!result.success) {
      const issue = result.error.issues[0]?.message ?? 'Skema JSON cadangan tidak valid';
      return { success: false, error: issue };
    }
    if (result.data.schemaVersion > CURRENT_SCHEMA_VERSION) {
      return {
        success: false,
        error: `Versi skema (${result.data.schemaVersion}) lebih tinggi dari yang didukung (${CURRENT_SCHEMA_VERSION}).`,
      };
    }
    return { success: true, data: result.data };
  } catch (err) {
    return {
      success: false,
      error: `Format berkas bukan JSON valid: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
