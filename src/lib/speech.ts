/*
 * Audio sapaan tanpa berkas audio: Web Speech API (`speechSynthesis`).
 * Tombol pemutar wajib disembunyikan kalau `isSpeechSupported()` false —
 * tidak ada fallback audio lain (keputusan orchestrator #4).
 */

export type SpeakOptions = {
  /** BCP-47, mis. 'ja-JP'. Default bahasa Indonesia. */
  lang?: string;
  rate?: number;
  onEnd?: () => void;
  onError?: () => void;
};

export function isSpeechSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

/**
 * Ucapkan teks. Mengembalikan `false` kalau browser tidak mendukung atau
 * pemanggilan gagal — pemanggil tidak perlu try/catch.
 */
export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (!isSpeechSupported() || text.trim().length === 0) {
    return false;
  }
  const { lang = 'id-ID', rate = 0.95, onEnd, onError } = options;

  try {
    window.speechSynthesis.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.onend = () => {
      onEnd?.();
    };
    utterance.onerror = () => {
      onError?.();
    };
    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return false;
  }
}

export function cancelSpeech(): void {
  if (!isSpeechSupported()) {
    return;
  }
  window.speechSynthesis.cancel();
}
