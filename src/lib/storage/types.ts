export type Locale = 'id' | 'en';

export interface Profile {
  id: string;
  displayName: string;
  createdAt: number;
  locale: Locale;
}

export type LessonStep = 'kenali' | 'etiket' | 'bahasa' | 'quest';

export interface LessonProgress {
  profileId: string;
  countryId: string;
  stepsDone: LessonStep[];
  startedAt: number;
  completedAt: number | null;
}

export type AttemptMode = 'full' | 'retry-wrong';

export interface Answer {
  itemId: string;
  given: string | string[];
  correct: boolean;
  elapsedMs: number;
}

export interface Attempt {
  id: string;
  profileId: string;
  countryId: string;
  itemIds: string[];
  answers: Answer[];
  startedAt: number;
  finishedAt: number | null;
  durationMs: number | null;
  mode: AttemptMode;
}

export interface PhraseReview {
  profileId: string;
  phraseId: string; // countryId:index
  box: number; // 1..5
  dueDay: string; // YYYY-MM-DD
  lastReviewedDay: string | null;
  lapses: number;
  reviews: number;
}

export interface CountryProgress {
  openedAt: number;
  lastSeenAt: number;
  lessonCompletedAt: number | null;
  storySeen: boolean;
}

export interface Progress {
  profileId: string;
  countries: Record<string, CountryProgress>;
  lastAttemptId?: string;
}

export interface EtiquetteMcqItem {
  id: string;
  kind: 'etiquette';
  order: number;
  prompt: string;
  options: [string, string, string];
  correctIndex: 0 | 1 | 2;
  reason: string;
  sourceRef: string;
}

export interface PhraseMatchPair {
  phraseIndex: number;
  meaningId: string;
}

export interface PhraseMatchItem {
  id: string;
  kind: 'match';
  order: number;
  prompt: string;
  pairs: [PhraseMatchPair, PhraseMatchPair, PhraseMatchPair];
  reason: string;
  sourceRef: string;
}

export interface BranchScenarioOption {
  id: string;
  label: string;
  correct: boolean;
}

export interface BranchScenarioItem {
  id: string;
  kind: 'branch';
  order: number;
  scenario: string;
  options: [BranchScenarioOption, BranchScenarioOption, BranchScenarioOption];
  reason: string;
  sourceRef: string;
}

export type QuestItem = EtiquetteMcqItem | PhraseMatchItem | BranchScenarioItem;

export interface MetaRecord<T = unknown> {
  key: string;
  value: T;
}

export interface BackupData {
  schemaVersion: number;
  exportedAt: number;
  profiles: Profile[];
  progress: Progress[];
  lessons: LessonProgress[];
  attempts: Attempt[];
  reviews: PhraseReview[];
}

export type NextTaskKind =
  | 'continue-session'
  | 'review-phrases'
  | 'new-lesson'
  | 'read-story'
  | 'completed';

export interface NextTaskDecision {
  kind: NextTaskKind;
  countryId?: string;
  title: string;
  description: string;
  href: string;
}
