/**
 * types.ts — Definisi tipe untuk Game Cerita Interaktif Quest Budaya (Story-Driven Cultural RPG)
 *
 * Mengikuti spesifikasi:
 * - 1 quest per negara, dipimpin 1 NPC utama dengan meter Rasa Hormat (0-100, default 50).
 * - Adegan bercabang (Scene), pilihan tindakan dengan syarat bekal/flag/respect.
 * - Catatan Budaya untuk setiap pilihan, 3 tingkatan ending (Sahabat, Diterima, Canggung).
 */

export type NpcExpression = 'senang' | 'netral' | 'bingung' | 'kecewa' | 'kagum';

export interface NpcInfo {
  nama: string;
  peran: string;
  avatar: string; // Inisial monogram / avatar identifier, misal 'PT' atau 'tanaka'
  deskripsi?: string;
}

export interface PackingItem {
  id: string;
  nama: string;
  ikon: string; // Identifier ikon Lucide, misal 'gift', 'message-square', 'sparkles'
  deskripsi?: string;
  kategori?: 'oleh-oleh' | 'pakaian' | 'frasa' | 'alat' | 'uang';
}

export interface CultureNote {
  judul: string;
  isi: string;
  kategori: 'Etiket' | 'Bahasa' | 'Makan' | 'Hierarki' | 'Agama' | 'Bisnis' | 'Tradisi';
  sourceRef?: string;
}

export interface ChoiceCondition {
  butuhBekal?: string[]; // Membutuhkan item bekal tertentu
  butuhFlags?: Record<string, boolean>; // Membutuhkan state flag tertentu
  minRespect?: number; // Membutuhkan rasa hormat minimal
  hint?: string; // Teks gembok, misal "Butuh: Oleh-oleh khas"
}

export interface ChoiceReaction {
  ekspresi: NpcExpression;
  teks: string;
}

export interface Choice {
  id: string;
  teks: string;
  syarat?: ChoiceCondition | null;
  respectDelta: number; // e.g. +15, +5, -10, -20
  setFlags?: Record<string, boolean>; // e.g. { sopanSepatu: true }
  dnaTags?: string[]; // e.g. ['detail', 'hierarki', 'diplomatis']
  reaksi: ChoiceReaction;
  catatan: CultureNote;
  nextSceneId: string; // ID adegan berikutnya (bisa sama atau bercabang)
}

export interface SceneDialog {
  speaker: string;
  teks: string;
  ekspresi: NpcExpression;
}

export interface Scene {
  id: string;
  latar: string; // misal "Ruang makan keluarga Tanaka, malam hari"
  narasi: string;
  dialog: SceneDialog;
  timer?: number | null; // detik (10-15) untuk situasi genting, null jika santai
  timeoutChoiceId?: string; // ID pilihan default jika waktu habis
  teksJika?: Record<string, string>; // Ganti teks dialog jika flag tertentu aktif
  narasiJika?: Record<string, string>; // Ganti teks narasi jika flag tertentu aktif
  pilihan: Choice[];
}

export type EndingTier = 'sahabat' | 'diterima' | 'canggung';

export interface Ending {
  id: EndingTier;
  minRespect: number; // e.g. 80 untuk sahabat, 50 untuk diterima, 0 untuk canggung
  judul: string;
  ringkasan: string;
  badge?: string; // Identifier tier/badge, e.g. 'gold', 'silver', 'bronze'
}

export interface StoryQuest {
  id: string; // e.g. 'jepang'
  countryId: string; // 2-letter country code, e.g. 'jp'
  negara: string; // e.g. 'Jepang'
  judul: string; // e.g. 'Undangan Makan Malam Pak Tanaka'
  pengantar: string;
  npc: NpcInfo;
  bekal: PackingItem[]; // 4 item pilihan, user memilih 2
  adegan: Scene[];
  ending: Ending[];
}

export interface QuestStepHistory {
  sceneId: string;
  choiceId: string;
  respectDelta: number;
  chosenAt: number;
}

export interface QuestProgressState {
  version: 1;
  profileId: string;
  countryId: string;
  questId: string;
  currentSceneId: string;
  respect: number; // 0..100
  inventory: string[]; // ID bekal yang dipilih (panjang 2)
  flags: Record<string, boolean>;
  discoveredNotes: CultureNote[];
  collectedDna: string[];
  history: QuestStepHistory[];
  relaxMode: boolean; // True jika mode tanpa timer aktif
  startedAt: number;
  finishedAt: number | null;
  endingAchieved: EndingTier | null;
  earnedXp: number;
  lastUpdated: number;
}

export interface UnlockedCultureNote extends CultureNote {
  countryId: string;
  questId: string;
  unlockedAt: number;
}
