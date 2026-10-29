# Interactive Session Design — Asia Explorer
**Date:** 2026-10-29  
**Status:** Approved  
**Scope:** New `/dashboard/session/:id` flow replacing flat Quest + Materi template feel

---

## Overview

Replace the existing flat lesson+quest pages with a **3-phase immersive session** per country that feels like a game, not a worksheet. Each session covers: cultural storytelling → audio comprehension quest → sentence construction challenge.

Reference mechanics: Duolingo (word-tile builder), Drops (audio-first unlock), Clozemaster (cloze/gap). All interactions run client-side; no new backend required.

---

## User Flow

```
CountryModulesPage (/dashboard/negara)
  → [Mulai Belajar] CTA on country card
  → SessionPage (/dashboard/session/:id)
      Phase 1: Story        (scroll-driven narrative)
      Phase 2: Audio Quest  (listen → identify tiles)
      Phase 3: Build        (drag/tap → arrange sentence)
  → RewardScreen (XP + streak + optional badge)
  → Back to CountryModulesPage
```

Existing `/dashboard/pelajaran/:id/:step` and `/dashboard/quest/:countryId` remain untouched (backward compat for in-progress attempts).

---

## Phase 1 — Story Phase

**Goal:** Immersive cultural storytelling before any quiz. User reads/listens; no evaluation here.

### Structure
- 4 panels per country: `kenali → budaya → bahasa → kuliner` (exact content from existing `countries.json`)
- Each panel is a **full-viewport section** (100svh) — no scrolling past one panel at a time
- Background: animated SVG pattern (topographic lines / country silhouette, already in `src/sections/landing/TopoBackground.tsx`)
- Text reveals via `useInView` (Framer Motion) — headline first, then body, stagger 80ms

### Per-Panel Layout
```
┌────────────────────────────────────┐
│  [background: cultural SVG]        │
│                                    │
│  Babak 1 / 4          ████░░ 25%  │
│                                    │
│  ─────────────────                 │
│  🇯🇵 Kenali Jepang                 │
│  [Headline – Crimson Pro 32px]     │
│                                    │
│  [Body narrative – Source Sans 3]  │
│  [Body continues...]               │
│                                    │
│  ┌───────────────────────────┐     │
│  │ Fun Fact  [klik untuk flip]│    │
│  └───────────────────────────┘     │
│                                    │
│  [▶ Dengarkan]   [Lanjut →]       │
└────────────────────────────────────┘
```

### Interactions
- **[▶ Dengarkan]**: calls existing `speak(panelText, { lang: country.speechLang })` — no new audio infra
- **Fun Fact Card**: 3D CSS card flip on click/tap — front = teaser, back = fact content
- **[Lanjut →]**: advances to next panel; on panel 4 → transitions to Phase 2
- Panel transition: `AnimatePresence` with `exit={{ x: '-100%' }} initial={{ x: '100%' }}` — spatial left-right model

### Data Source
Uses existing `countries.json` story/cultural fields. No new data files for Phase 1.

---

## Phase 2 — Audio Quest Phase

**Goal:** Active listening. Tiles are LOCKED until audio plays. User identifies what they heard.

### Flow
1. Screen shows only: waveform animation + `▶ Putar Audio`
2. Audio auto-plays via `speak(challenge.text, { lang, onEnd: unlockTiles })`
3. Animated progress ring drains while audio plays
4. `onEnd` callback: tiles animate in with stagger (50ms each)
5. User selects correct tile(s)
6. Submit → feedback → next challenge or Phase 3

### Challenge Types (3 per session, mix of):

| Type | Prompt | Answer format |
|---|---|---|
| `hear-identify` | Audio plays. Apa yang kamu dengar? | Pilih 1 dari 4 tiles |
| `script-match` | Audio plays native script word. Pilih tulisannya. | Pilih 1 dari 4 script tiles |
| `language-detect` | Audio plays. Bahasa apa ini? | Pilih dari: Jepang / Korea / Thai / Arab |
| `syllable-count` | Audio plays. Berapa suku kata? | Pilih angka: 1 / 2 / 3 / 4 |

### Tile Component: `AudioTile`
```tsx
interface AudioTileProps {
  text: string;
  locked: boolean;       // true until audio ends
  selected: boolean;
  state: 'idle' | 'correct' | 'wrong';
  onSelect: () => void;
}
```
- `locked=true`: tile rendered with `opacity: 0.3`, `pointer-events: none`
- `locked=false`: stagger-animate in (`initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}`)
- `state='correct'`: `background: var(--color-correct-bg)`, scale spring to 1.05, check icon
- `state='wrong'`: shake animation `x: [0,-8,8,-8,8,0]`, red tint, auto-recovers after 500ms

### Feedback Timing
- Correct: green flash + ascending tone (AudioContext 440→660Hz, 200ms) + +10 XP
- Wrong: shake + descending tone (660→440Hz, 300ms) + reveal correct tile in green
- Auto-advance to next challenge after 1400ms (no "Next" button)

---

## Phase 3 — Build Phase

**Goal:** Reconstruct a sentence from audio. The most complex, most game-like phase.

### Layout
```
┌─────────────────────────────────────────────┐
│ [🔊 Putar ulang] "Saya belajar bahasa..."   │
├─────────────────────────────────────────────┤
│ SUSUN KALIMATNYA:                           │
│ ┌────────────────────────────────────────┐  │
│ │ [ saya ] [ belajar ] [      ] [      ] │  │
│ └────────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│ PILIH KATA:                                 │
│ [ bahasa ] [ Indonesia ] [ makan ] [ tidur ]│
└─────────────────────────────────────────────┘
       [Cek Jawaban]   hints: ●●○
```

### Interaction: Dual-Mode (Pointer + Touch)

**Desktop (pointer/mouse):**  
`motion.div` with `drag` prop. Drag tile from bank → drop into tray. `dragConstraints` = tray bounding box. If dropped outside valid zone → spring back to bank position.

**Mobile (touch, ≤768px):**  
Tap tile in bank → animate jump to next empty tray slot. Tap tile in tray → animate jump back to bank. No drag needed. Detect via `pointer: coarse` media query or `navigator.maxTouchPoints > 0`.

**Shared state shape:**
```ts
interface BuildState {
  bank: Word[];          // available tiles
  tray: (Word | null)[]; // slots (null = empty)
  hintUsed: number;      // max 2 per challenge
  submitted: boolean;
  result: 'idle' | 'correct' | 'wrong';
}
```

### Tile Animation (Framer Motion `layout` prop)
- All tiles have `layout` prop → auto-animate when peers move (no position math needed)
- `AnimatePresence` wraps both zones → tiles animate out of one zone, in to another
- Wrong slot on submit: per-tile border flashes red if incorrect, green if correct
- Correct tray order: `exit={{ y: -100, opacity: 0 }}` launch-up animation → session complete

### Challenge Types (2 per session):

| Type | Prompt | Structure |
|---|---|---|
| `sentence-order` | Audio plays full sentence. Susun urutannya. | All words given, wrong order. Arrange to correct order. |
| `sentence-fill` | Audio plays. Kalimat punya blank. | Partial sentence in tray, 4 choices in bank, pick 1-2. |
| `translation-build` | Audio plays in native. Susun terjemahannya dalam Bahasa Indonesia. | Build Indonesian translation from shuffled tiles. |

### Hints
- Max 2 hints per challenge
- Hint 1: highlight the FIRST wrong tile in the tray (subtle pulse)  
- Hint 2: auto-place the hardest tile for the user
- Penalty: -5 XP per hint used (not shown until result)

---

## Reward System

### Per-Challenge Rewards
| Event | XP | Visual |
|---|---|---|
| Audio Quest correct | +10 | tile green flash + tone |
| Build correct (no hints) | +20 | tile launch animation |
| Build correct (with hints) | +10 | standard correct |
| Wrong answer | 0 | shake + reveal |
| Streak 3x correct | +15 bonus | banner "Keren! 🔥" |
| Streak 5x correct | +30 bonus | confetti burst (canvas-confetti lazy) |

### Session Completion Reward
Full-screen `RewardOverlay`:
- Total XP earned (animated counter, Framer Motion `useMotionValue` + spring)
- Streak badge if streak ≥ 3
- **Country Completion Badge**: unlocked on FIRST full session complete for that country
  - Badge: country flag colors + country name in native script
  - Stored in IndexedDB `CountryProgress.sessionCompletedAt` (new field)
  - Shown in ProfilePage badge shelf
- Confetti burst on entry
- [Kembali ke Peta] / [Negara Selanjutnya →]

### XP Storage
Uses existing `useExplorerStats` hook and IndexedDB. Add `sessionXP` to existing XP accumulator. No backend.

---

## Data Architecture

### New: `src/data/session-content/[countryId].ts`
One file per country. Structure:

```ts
export interface SessionContent {
  countryId: string;
  audioQuests: AudioChallenge[];   // 3 challenges
  buildChallenges: BuildChallenge[]; // 2 challenges
}

interface AudioChallenge {
  type: 'hear-identify' | 'script-match' | 'language-detect' | 'syllable-count';
  audioText: string;        // spoken via speak()
  audioLang: string;        // BCP-47
  tiles: TileOption[];      // 4 options
  correctIndex: number;
  feedback: string;         // shown after answer
}

interface BuildChallenge {
  type: 'sentence-order' | 'sentence-fill' | 'translation-build';
  audioText: string;        // spoken via speak()
  audioLang: string;
  correctOrder: string[];   // ['saya', 'belajar', 'bahasa', 'Indonesia']
  distractors: string[];    // wrong tiles added to bank
  hint1Target: number;      // index of hardest tile
}
```

### Modified: `src/lib/storage/types.ts`
Add:
```ts
interface SessionAttempt {
  id: string;
  profileId: string;
  countryId: string;
  phase1Completed: boolean;
  audioQuestResults: { correct: boolean; hintsUsed: 0 }[];
  buildResults: { correct: boolean; hintsUsed: number }[];
  xpEarned: number;
  streakPeak: number;
  completedAt?: string;
  badgeUnlocked: boolean;
}

// CountryProgress gets new field:
// sessionCompletedAt?: string;
```

---

## File Plan

### New Files
```
src/app/pages/SessionPage.tsx               — phase orchestrator, state machine
src/sections/session/StoryPhase.tsx         — 4-panel scroll narrative
src/sections/session/AudioQuestPhase.tsx    — audio-first challenge runner
src/sections/session/BuildPhase.tsx         — word tile builder
src/sections/session/AudioTile.tsx          — locked/unlocked tile component
src/sections/session/WordTile.tsx           — draggable/tappable word tile
src/sections/session/RewardOverlay.tsx      — session completion screen
src/sections/session/SessionProgress.tsx    — top progress bar (phase + challenge)
src/lib/useSessionEngine.ts                 — state machine hook
src/data/session-content/japan.ts           — first country (pilot)
src/data/session-content/korea.ts
src/data/session-content/indonesia.ts
src/data/session-content/thailand.ts
src/data/session-content/vietnam.ts
src/data/session-content/malaysia.ts
src/data/session-content/philippines.ts
src/data/session-content/india.ts
src/data/session-content/china.ts
src/data/session-content/taiwan.ts
```

### Modified Files
```
src/app/routes.tsx                          — add /dashboard/session/:id
src/lib/storage/types.ts                    — add SessionAttempt, extend CountryProgress
src/app/pages/CountryModulesPage.tsx        — change CTA to /dashboard/session/:id
src/styles/session.css                      — new stylesheet for session UI
```

### Untouched
- `AuthPage.tsx`, `AuthInteractiveMap.tsx`, `auth.css`
- `LandingPage.tsx`, `LessonPage.tsx`, `QuestPage.tsx`, `QuestResultPage.tsx`
- `ReviewPage.tsx`, `DashboardPage.tsx`, `MapPage.tsx`
- All existing tests

---

## Visual Design Tokens (consistent with existing)

All session UI uses existing tokens — no new colors:
- Background: `var(--color-parchment)` `#f4ede1`
- Surface: `var(--color-cream)` `#fffef9`
- Primary: `var(--color-teal)` `#176b68`
- Accent: `var(--color-terracotta)` `#c05c46`
- Correct: new `--color-correct` = `#2d7a4f` (dark green, accessible)
- Wrong: new `--color-wrong` = `#b94040` (deep red, accessible)
- Font: Crimson Pro (headings), Source Sans 3 (body/tiles)

Tile component: `border-radius: 8px`, `box-shadow: 0 2px 8px rgba(0,0,0,0.08)`, `font: 600 1rem Source Sans 3` — pill-like, physical feel.

---

## Accessibility
- All tiles: `role="button"`, `tabIndex={0}`, `onKeyDown` (Enter/Space)
- Audio auto-play: respects `prefers-reduced-motion` (skip animation, keep tile unlock)
- Correct/wrong: never conveyed by color alone — icon + text + animation
- `aria-live="polite"` region for XP and feedback announcements
- Drag: keyboard fallback via Tab + Enter moves tiles

---

## Testing Plan
- `useSessionEngine.test.ts`: state transitions, XP calc, streak logic
- `AudioQuestPhase.test.tsx`: tile lock/unlock, correct/wrong feedback
- `BuildPhase.test.tsx`: tap-to-toggle, order validation, hint behavior
- `SessionPage.test.tsx`: phase progression, completion badge unlock
- E2E (`e2e/session.spec.ts`): full session run for Japan

---

## Out of Scope (not this sprint)
- Multiplayer / leaderboard
- Custom user-created challenges  
- Session replay / video export
- Offline mode (PWA)
- Push notifications for streak reminders
