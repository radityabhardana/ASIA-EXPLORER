import { COUNTRIES } from './content/countries.js'

/**
 * Quest + progres eksplorasi. Semua state disimpan di localStorage
 * supaya user bisa lanjut setelah reload (khas game, bukan demo).
 */
const STORAGE_KEY = 'asia-explorer:progress:v1'

export const QUESTS = [
  { id: 'first-step', title: 'Langkah pertama', desc: 'Buka satu negara di peta.', xp: 20, type: 'visit', goal: 1 },
  { id: 'asean', title: 'Jelajah ASEAN', desc: 'Kunjungi 10 negara Asia Tenggara.', xp: 60, type: 'visit', region: 'Southeast Asia', goal: 10 },
  { id: 'silk-road', title: 'Jalur Sutra', desc: 'Kunjungi 5 negara Asia Tengah.', xp: 50, type: 'visit', region: 'Central Asia', goal: 5 },
  { id: 'polyglot', title: 'Kolektor bahasa', desc: 'Temukan 8 bahasa berbeda dari kartu negara.', xp: 80, type: 'lang', goal: 8 },
  { id: 'quiz', title: 'Ahli budaya', desc: 'Jawab benar 5 pertanyaan kuis.', xp: 100, type: 'quiz', goal: 5 },
  { id: 'explorer', title: 'Penjelajah Asia', desc: 'Kunjungi 20 negara dari 48.', xp: 140, type: 'visit', goal: 20 },
  { id: 'all-regions', title: 'Lima wilayah', desc: 'Buka minimal satu negara di setiap wilayah.', xp: 90, type: 'region', goal: 5 },
]

// factory, bukan objek bersama: array di dalamnya tidak boleh dipakai ulang antar reset
const emptyState = () => ({ visited: [], langs: [], quizCorrect: 0, claimed: [], streak: { count: 0, lastDay: null } })
let state = load()
const listeners = new Set()

// streak harian: dihitung dari hari UTC, sama untuk semua orang
const DAY_MS = 86400000
const ORIGIN_UTC = Date.UTC(2026, 0, 1)
function todayDay() {
  return Math.floor((Date.now() - ORIGIN_UTC) / DAY_MS)
}

function bumpStreak() {
  const today = todayDay()
  if (state.streak.lastDay === today) return
  state.streak.count = state.streak.lastDay === today - 1 ? state.streak.count + 1 : 1
  state.streak.lastDay = today
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState()
    const parsed = JSON.parse(raw)
    return {
      visited: Array.isArray(parsed.visited) ? parsed.visited.filter((c) => COUNTRIES[c]) : [],
      langs: Array.isArray(parsed.langs) ? parsed.langs : [],
      quizCorrect: Number(parsed.quizCorrect) || 0,
      claimed: Array.isArray(parsed.claimed) ? parsed.claimed : [],
      streak: {
        count: Number(parsed.streak?.count) || 0,
        lastDay: Number.isFinite(parsed.streak?.lastDay) ? parsed.streak.lastDay : null,
      },
    }
  } catch {
    return emptyState() // ponytail: storage rusak/private mode -> mulai bersih, jangan crash
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* storage penuh / diblokir: progres tetap jalan di memori */
  }
}

function notify(newlyDone = []) {
  save()
  for (const fn of listeners) fn(snapshot(), newlyDone)
}

function regionsVisited() {
  return new Set(state.visited.map((code) => COUNTRIES[code]?.region).filter(Boolean)).size
}

function currentOf(quest) {
  switch (quest.type) {
    case 'visit':
      return quest.region
        ? state.visited.filter((code) => COUNTRIES[code]?.region === quest.region).length
        : state.visited.length
    case 'lang':
      return state.langs.length
    case 'quiz':
      return state.quizCorrect
    case 'region':
      return regionsVisited()
    default:
      return 0
  }
}

function evaluate() {
  const newlyDone = []
  for (const quest of QUESTS) {
    if (state.claimed.includes(quest.id)) continue
    if (currentOf(quest) >= quest.goal) {
      state.claimed.push(quest.id)
      newlyDone.push(quest)
    }
  }
  return newlyDone
}

export function totalXp() {
  return QUESTS.filter((q) => state.claimed.includes(q.id)).reduce((sum, q) => sum + q.xp, 0)
}

export function level() {
  const xp = totalXp()
  return { level: 1 + Math.floor(xp / 150), xp, next: 150 - (xp % 150) }
}

export function questList() {
  return QUESTS.map((quest) => {
    const current = Math.min(currentOf(quest), quest.goal)
    return { ...quest, current, done: state.claimed.includes(quest.id) }
  })
}

export function snapshot() {
  return {
    visited: [...state.visited],
    langs: [...state.langs],
    quizCorrect: state.quizCorrect,
    level: level(),
    quests: questList(),
    streak: {
      count: state.streak.count,
      activeToday: state.streak.lastDay === todayDay(),
    },
  }
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Catat kunjungan negara; otomatis mencatat bahasa dari kontennya. */
export function visitCountry(code) {
  if (!COUNTRIES[code] || state.visited.includes(code)) return []
  state.visited.push(code)
  for (const lang of COUNTRIES[code].languages) {
    if (!state.langs.includes(lang)) state.langs.push(lang)
  }
  bumpStreak()
  const newlyDone = evaluate()
  notify(newlyDone)
  return newlyDone
}

export function answerQuiz(correct) {
  if (!correct) return []
  state.quizCorrect += 1
  bumpStreak()
  const newlyDone = evaluate()
  notify(newlyDone)
  return newlyDone
}

export function resetProgress() {
  state = emptyState()
  notify()
}

export function isVisited(code) {
  return state.visited.includes(code)
}
