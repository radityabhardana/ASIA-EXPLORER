/**
 * engine.ts — Fungsi murni untuk logika Game Cerita Interaktif Quest Budaya.
 *
 * Mengatur:
 * - Batasan meter Rasa Hormat (0-100)
 * - Verifikasi ketersediaan pilihan (syarat bekal, flag, respect)
 * - Resolusi narasi dan dialog bersyarat (narasiJika, teksJika)
 * - Penentuan ending berdasarkan skor respect akhir
 * - Penghitungan XP berimbang (maksimal +60 XP)
 * - Validasi integritas skema data quest
 */

import type {
  StoryQuest,
  Scene,
  Choice,
  Ending,
  EndingTier,
} from './types';

/**
 * Batasi nilai Rasa Hormat antara 0 dan 100 secara aman.
 */
export function clampRespect(value: number): number {
  if (Number.isNaN(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Periksa apakah suatu pilihan tindakan dapat diambil oleh pemain
 * berdasarkan bekal di inventori, status flags, dan meter rasa hormat saat ini.
 */
export function isChoiceAvailable(
  choice: Choice,
  inventory: string[] = [],
  flags: Record<string, boolean> = {},
  currentRespect = 50,
): { available: boolean; reason?: string } {
  if (!choice.syarat) {
    return { available: true };
  }

  const { butuhBekal, butuhFlags, minRespect, hint } = choice.syarat;

  // 1. Cek bekal di inventori
  if (butuhBekal && butuhBekal.length > 0) {
    const hasAllItems = butuhBekal.every((itemId) => inventory.includes(itemId));
    if (!hasAllItems) {
      return {
        available: false,
        reason: hint ?? `Membutuhkan bekal: ${butuhBekal.join(', ')}`,
      };
    }
  }

  // 2. Cek status flags
  if (butuhFlags) {
    for (const [flagKey, expectedVal] of Object.entries(butuhFlags)) {
      if (Boolean(flags[flagKey]) !== expectedVal) {
        return {
          available: false,
          reason: hint ?? 'Keputusan sebelumnya tidak memungkinkan tindakan ini.',
        };
      }
    }
  }

  // 3. Cek rasa hormat minimal
  if (typeof minRespect === 'number') {
    if (currentRespect < minRespect) {
      return {
        available: false,
        reason: hint ?? `Rasa Hormat belum cukup (butuh min. ${minRespect}).`,
      };
    }
  }

  return { available: true };
}

/**
 * Resolusi teks narasi adegan yang dinamis berdasarkan flag cerita.
 */
export function resolveSceneNarration(
  scene: Scene,
  flags: Record<string, boolean> = {},
): string {
  if (scene.narasiJika) {
    for (const [flagKey, text] of Object.entries(scene.narasiJika)) {
      if (flags[flagKey]) {
        return text;
      }
    }
  }
  return scene.narasi;
}

/**
 * Resolusi teks dialog NPC yang dinamis berdasarkan flag cerita.
 */
export function resolveSceneDialogText(
  scene: Scene,
  flags: Record<string, boolean> = {},
): string {
  if (scene.teksJika) {
    for (const [flagKey, text] of Object.entries(scene.teksJika)) {
      if (flags[flagKey]) {
        return text;
      }
    }
  }
  return scene.dialog.teks;
}

/**
 * Tentukan ending cerita berdasarkan Rasa Hormat akhir.
 * Endings diurutkan dari minRespect tertinggi ke terendah.
 */
export function determineEnding(
  endings: Ending[],
  finalRespect: number,
): Ending {
  if (!endings || endings.length === 0) {
    return {
      id: 'diterima',
      minRespect: 50,
      judul: 'Petualangan Selesai',
      ringkasan: 'Kamu telah menyelesaikan perjalanan budaya dengan baik.',
    };
  }

  const clamped = clampRespect(finalRespect);
  // Urutkan dari minRespect tertinggi (misal 80 -> 50 -> 0)
  const sorted = [...endings].sort((a, b) => b.minRespect - a.minRespect);

  for (const end of sorted) {
    if (clamped >= end.minRespect) {
      return end;
    }
  }

  // Fallback ke ending dengan minRespect terendah
  return sorted[sorted.length - 1]!;
}

/**
 * Hitung XP yang diperoleh (maksimal +60 XP selaras UI profil & katalog Asia Explorer).
 * - Sahabat (>=80): 40 base XP + (catatan * 4), maks 60 XP
 * - Diterima (50-79): 28 base XP + (catatan * 4), maks 48 XP
 * - Canggung (<50): 16 base XP + (catatan * 4), maks 36 XP
 * Untuk replay, hanya memberikan bonus catatan baru (+5 per catatan baru, maks 20).
 */
export function calculateQuestXp(
  endingTier: EndingTier,
  newNotesCount = 0,
  isFirstCompletion = true,
): number {
  if (!isFirstCompletion) {
    // Mode replay: hanya bonus catatan baru yang belum pernah ditemukan
    const bonus = Math.min(20, newNotesCount * 5);
    return Math.max(0, bonus);
  }

  const baseXP =
    endingTier === 'sahabat'
      ? 40
      : endingTier === 'diterima'
      ? 28
      : 16;

  const notesBonus = Math.min(20, Math.max(0, newNotesCount) * 4);
  const total = baseXP + notesBonus;

  // Batas atas mutlak 60 XP
  return Math.min(60, Math.max(10, total));
}

/**
 * Validasi integritas skema data quest untuk memastikan:
 * 1. Struktur awal lengkap (id, npc, bekal, adegan, ending).
 * 2. Tidak ada nextSceneId yang dead-end (selain 'ending').
 * 3. Adegan genting ber-timer memiliki timeoutChoiceId yang valid.
 * 4. Pilihan selalu memiliki Catatan Budaya dan Reaksi NPC.
 */
export function validateQuestData(quest: StoryQuest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!quest.id) errors.push('Quest id wajib ada.');
  if (!quest.countryId) errors.push('Quest countryId wajib ada.');
  if (!quest.judul) errors.push('Quest judul wajib ada.');
  if (!quest.npc || !quest.npc.nama) errors.push('Quest npc.nama wajib ada.');

  if (!Array.isArray(quest.bekal) || quest.bekal.length < 4) {
    errors.push('Quest wajib memiliki minimal 4 item bekal untuk dipilih.');
  }

  if (!Array.isArray(quest.adegan) || quest.adegan.length < 2) {
    errors.push('Quest wajib memiliki minimal 2 adegan.');
  }

  if (!Array.isArray(quest.ending) || quest.ending.length < 3) {
    errors.push('Quest wajib memiliki minimal 3 tingkatan ending.');
  }

  const sceneIds = new Set(quest.adegan.map((s) => s.id));

  // Cek duplikasi ID adegan
  if (sceneIds.size !== quest.adegan.length) {
    errors.push('Terdapat duplikasi ID pada adegan.');
  }

  quest.adegan.forEach((scene, sIdx) => {
    if (!scene.id) errors.push(`Adegan #${sIdx + 1} tidak memiliki ID.`);
    if (!scene.narasi) errors.push(`Adegan ${scene.id} tidak memiliki narasi.`);
    if (!scene.dialog || !scene.dialog.speaker) {
      errors.push(`Adegan ${scene.id} tidak memiliki dialog yang valid.`);
    }

    // Validasi timer & timeoutChoiceId
    if (typeof scene.timer === 'number' && scene.timer > 0) {
      if (!scene.timeoutChoiceId) {
        errors.push(`Adegan ${scene.id} memiliki timer tapi tidak ada timeoutChoiceId.`);
      } else {
        const choiceExists = scene.pilihan.some((c) => c.id === scene.timeoutChoiceId);
        if (!choiceExists) {
          errors.push(
            `Adegan ${scene.id} timeoutChoiceId (${scene.timeoutChoiceId}) tidak ditemukan di pilihan.`,
          );
        }
      }
    }

    // Validasi pilihan
    if (!Array.isArray(scene.pilihan) || scene.pilihan.length < 2) {
      errors.push(`Adegan ${scene.id} wajib memiliki minimal 2 pilihan tindakan.`);
    } else {
      scene.pilihan.forEach((choice, cIdx) => {
        if (!choice.id) errors.push(`Adegan ${scene.id} pilihan #${cIdx + 1} tidak punya ID.`);
        if (!choice.teks) errors.push(`Pilihan ${choice.id} tidak memiliki teks.`);
        if (!choice.reaksi || !choice.reaksi.teks) {
          errors.push(`Pilihan ${choice.id} wajib memiliki reaksi NPC.`);
        }
        if (!choice.catatan || !choice.catatan.judul || !choice.catatan.isi) {
          errors.push(`Pilihan ${choice.id} wajib memiliki Catatan Budaya lengkap.`);
        }

        // Cek nextSceneId
        if (choice.nextSceneId !== 'ending' && !sceneIds.has(choice.nextSceneId)) {
          errors.push(
            `Pilihan ${choice.id} di adegan ${scene.id} mengarah ke nextSceneId yang tidak ada: "${choice.nextSceneId}".`,
          );
        }
      });
    }
  });

  // Validasi ending tiers
  const endingTiers = new Set(quest.ending.map((e) => e.id));
  if (!endingTiers.has('sahabat') || !endingTiers.has('diterima') || !endingTiers.has('canggung')) {
    errors.push('Ending wajib mencakup tier: sahabat, diterima, dan canggung.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
