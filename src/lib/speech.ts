export type SpeakOptions = {
  /** BCP-47, mis. 'ja-JP'. Default 'id-ID'. */
  lang?: string;
  /** Teks fonetik romanisasi untuk fallback saat suara bahasa asli tidak tersedia. */
  fallbackText?: string;
  rate?: number;
  pitch?: number;
  onEnd?: () => void;
  onError?: () => void;
};

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    'speechSynthesis' in window &&
    typeof window.SpeechSynthesisUtterance === 'function'
  );
}

export function isAudioContextSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return (
    typeof window.AudioContext === 'function' ||
    typeof (window as unknown as { webkitAudioContext?: unknown }).webkitAudioContext === 'function'
  );
}

export function isSpeechSupported(): boolean {
  return isSpeechSynthesisSupported() || isAudioContextSupported();
}

function primarySubtag(lang: string): string {
  return lang.split('-')[0]?.toLowerCase() ?? '';
}

export function findMatchingVoice(
  voices: SpeechSynthesisVoice[],
  targetLang: string,
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;

  const normTarget = targetLang.trim().toLowerCase();
  const targetSubtag = primarySubtag(normTarget);

  const exact = voices.find((v) => v.lang.toLowerCase() === normTarget);
  if (exact) return exact;

  return voices.find((v) => {
    const vSub = primarySubtag(v.lang);
    if (vSub === targetSubtag) return true;
    if ((targetSubtag === 'fil' || targetSubtag === 'tl') && (vSub === 'fil' || vSub === 'tl')) {
      return true;
    }
    if (targetSubtag === 'zh' && vSub === 'zh') {
      return true;
    }
    return false;
  });
}

export function findFallbackVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (!voices || voices.length === 0) return undefined;

  const def = voices.find((v) => v.default);
  if (def) return def;

  const en = voices.find((v) => primarySubtag(v.lang) === 'en');
  if (en) return en;

  return voices[0];
}

export function sanitizeToLatin(text: string): string {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const latinOnly = normalized.replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '').trim();
  return latinOnly.length > 0 ? latinOnly : text;
}

export function playAcousticFallback(
  onEnd?: () => void,
  onError?: () => void,
): boolean {
  if (typeof window === 'undefined') {
    onError?.();
    return false;
  }
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      onError?.();
      return false;
    }
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880.0, now + 0.12);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      try {
        ctx.close().catch(() => {});
      } catch {
        // ignore close error
      }
      onEnd?.();
    };

    osc.onended = finish;
    setTimeout(finish, 400);

    return true;
  } catch {
    onError?.();
    return false;
  }
}

export function speak(text: string, options: SpeakOptions = {}): boolean {
  if (typeof window === 'undefined' || text.trim().length === 0) {
    return false;
  }

  const { onEnd, onError, rate = 0.92, pitch } = options;

  if (!isSpeechSynthesisSupported()) {
    return playAcousticFallback(onEnd, onError);
  }

  try {
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const targetLang = options.lang || 'id-ID';
    const matchedVoice = findMatchingVoice(voices, targetLang);

    let speechText = text;
    let speechLang = targetLang;
    let selectedVoice: SpeechSynthesisVoice | undefined = matchedVoice;

    if (matchedVoice) {
      speechText = text;
      speechLang = matchedVoice.lang || targetLang;
    } else {
      const fallbackVoice = findFallbackVoice(voices);
      selectedVoice = fallbackVoice;
      speechLang = fallbackVoice?.lang || 'en-US';

      if (options.fallbackText && options.fallbackText.trim().length > 0) {
        speechText = options.fallbackText.trim();
      } else {
        speechText = sanitizeToLatin(text);
      }
    }

    const utterance = new window.SpeechSynthesisUtterance(speechText);
    utterance.lang = speechLang;
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    if (typeof pitch === 'number') {
      utterance.pitch = pitch;
    }

    let finished = false;
    utterance.onend = () => {
      if (finished) return;
      finished = true;
      onEnd?.();
    };

    utterance.onerror = () => {
      if (finished) return;
      finished = true;
      const played = playAcousticFallback(onEnd, onError);
      if (!played) {
        onError?.();
      }
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch {
    return playAcousticFallback(onEnd, onError);
  }
}

export function cancelSpeech(): void {
  if (typeof window === 'undefined') {
    return;
  }
  if ('speechSynthesis' in window && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
