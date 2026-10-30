/**
 * storage.ts — Penyimpanan lokal terstruktur untuk progres Story Quest & Koleksi Catatan Budaya.
 *
 * Mengikuti konvensi Asia Explorer:
 * - Dibungkus fungsi modular agar mudah dimigrasi ke backend di masa depan.
 * - Membawa metadata versi (version: 1) untuk keamanan migrasi skema.
 */

import type {
  QuestProgressState,
  EndingTier,
  CultureNote,
  UnlockedCultureNote,
} from './types';

const STORAGE_PREFIX = 'asia_story_quest_v1';
const NOTES_PREFIX = 'asia_culture_notes_v1';
const ENDINGS_PREFIX = 'asia_endings_v1';
const SETTINGS_KEY = 'asia_quest_relax_mode';

function getProgressKey(profileId: string, countryId: string): string {
  return `${STORAGE_PREFIX}_${profileId}_${countryId}`;
}

function getEndingsKey(profileId: string, countryId: string): string {
  return `${ENDINGS_PREFIX}_${profileId}_${countryId}`;
}

function getNotesKey(profileId: string): string {
  return `${NOTES_PREFIX}_${profileId}`;
}

/**
 * Muat progres quest yang tersimpan di tengah permainan.
 */
export function loadQuestProgress(
  profileId: string,
  countryId: string,
): QuestProgressState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getProgressKey(profileId, countryId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuestProgressState;
    if (parsed.version === 1 && parsed.profileId === profileId && parsed.countryId === countryId) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Simpan progres state quest saat ini (tiap kali adegan atau pilihan berubah).
 */
export function saveQuestProgress(
  profileId: string,
  progress: QuestProgressState,
): void {
  if (typeof window === 'undefined') return;
  try {
    const data: QuestProgressState = {
      ...progress,
      version: 1,
      profileId,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(getProgressKey(profileId, progress.countryId), JSON.stringify(data));
  } catch (err) {
    console.warn('Gagal menyimpan progres story quest:', err);
  }
}

/**
 * Hapus progres aktif (misal saat pemain memilih mengulang dari awal).
 */
export function clearQuestProgress(profileId: string, countryId: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getProgressKey(profileId, countryId));
  } catch (err) {
    console.warn('Gagal menghapus progres story quest:', err);
  }
}

/**
 * Ambil daftar ending yang sudah pernah diraih untuk negara tertentu.
 */
export function getDiscoveredEndings(
  profileId: string,
  countryId: string,
): EndingTier[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getEndingsKey(profileId, countryId));
    if (!raw) return [];
    return JSON.parse(raw) as EndingTier[];
  } catch {
    return [];
  }
}

/**
 * Catat ending baru yang diraih pemain.
 */
export function recordEnding(
  profileId: string,
  countryId: string,
  ending: EndingTier,
): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getDiscoveredEndings(profileId, countryId);
    if (!existing.includes(ending)) {
      const updated = [...existing, ending];
      localStorage.setItem(getEndingsKey(profileId, countryId), JSON.stringify(updated));
    }
  } catch (err) {
    console.warn('Gagal mencatat ending story quest:', err);
  }
}

/**
 * Ambil seluruh Koleksi Catatan Budaya pemain.
 */
export function getCollectedNotes(profileId: string): UnlockedCultureNote[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getNotesKey(profileId));
    if (!raw) return [];
    return JSON.parse(raw) as UnlockedCultureNote[];
  } catch {
    return [];
  }
}

/**
 * Simpan Catatan Budaya baru ke dalam koleksi pemain (persist global).
 */
export function saveCollectedNote(
  profileId: string,
  countryId: string,
  questId: string,
  note: CultureNote,
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const current = getCollectedNotes(profileId);
    const isAlreadyCollected = current.some(
      (n) => n.judul.toLowerCase() === note.judul.toLowerCase(),
    );

    if (!isAlreadyCollected) {
      const newEntry: UnlockedCultureNote = {
        ...note,
        countryId,
        questId,
        unlockedAt: Date.now(),
      };
      localStorage.setItem(getNotesKey(profileId), JSON.stringify([...current, newEntry]));
      return true; // Catatan baru berhasil ditambahkan
    }
    return false; // Sudah pernah dikoleksi sebelumnya
  } catch (err) {
    console.warn('Gagal menyimpan catatan budaya:', err);
    return false;
  }
}

/**
 * Periksa preferensi "Mode Santai" (bebas timer situasi genting).
 */
export function getRelaxModePreference(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(SETTINGS_KEY) === 'true';
}

/**
 * Simpan preferensi "Mode Santai".
 */
export function setRelaxModePreference(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SETTINGS_KEY, enabled ? 'true' : 'false');
}
