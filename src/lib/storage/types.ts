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
  sessionCompletedAt?: number;
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

// ─── Session System ──────────────────────────────────────────────────────────

export type AudioChallengeType =
  | 'hear-identify'
  | 'script-match'
  | 'language-detect'
  | 'syllable-count';

export type BuildChallengeType =
  | 'sentence-order'
  | 'sentence-fill'
  | 'translation-build';

export interface TileOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface AudioChallenge {
  id: string;
  type: AudioChallengeType;
  audioText: string;      // spoken via speak()
  audioLang: string;      // BCP-47
  tiles: TileOption[];    // always 4 options
  correctIndex: number;
  feedback: string;       // shown after answer
}

export interface BuildChallenge {
  id: string;
  type: BuildChallengeType;
  audioText: string;      // spoken via speak()
  audioLang: string;
  correctOrder: string[]; // e.g. ['saya', 'belajar', 'bahasa', 'Indonesia']
  distractors: string[];  // wrong tiles added to bank
  hint1Target: number;    // index in correctOrder of hardest tile
}

export interface SessionContent {
  countryId: string;
  audioQuests: AudioChallenge[];   // 3 challenges
  buildChallenges: BuildChallenge[]; // 2 challenges
}

export interface SessionChallengeResult {
  challengeId: string;
  correct: boolean;
  hintsUsed: number;
  elapsedMs: number;
}

export interface SessionAttempt {
  id: string;
  profileId: string;
  countryId: string;
  phase1Completed: boolean;
  audioQuestResults: SessionChallengeResult[];
  buildResults: SessionChallengeResult[];
  xpEarned: number;
  streakPeak: number;
  startedAt: number;
  completedAt: number | null;
  badgeUnlocked: boolean;
}
