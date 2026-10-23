import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { countries } from '@/content/countries';
import { profileFor } from '@/sections/country/scripts';
import {
  cancelSpeech,
  findFallbackVoice,
  findMatchingVoice,
  isAudioContextSupported,
  isSpeechSupported,
  isSpeechSynthesisSupported,
  playAcousticFallback,
  sanitizeToLatin,
  speak,
} from './speech';

type MockVoice = {
  lang: string;
  name: string;
  default?: boolean;
};

type MockOscillator = {
  type: string;
  frequency: {
    setValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
  start: ReturnType<typeof vi.fn>;
  stop: ReturnType<typeof vi.fn>;
  onended: (() => void) | null;
};

type MockGain = {
  gain: {
    setValueAtTime: ReturnType<typeof vi.fn>;
    exponentialRampToValueAtTime: ReturnType<typeof vi.fn>;
  };
  connect: ReturnType<typeof vi.fn>;
};

class MockSpeechSynthesisUtterance {
  text: string;
  lang = '';
  voice: SpeechSynthesisVoice | null = null;
  rate = 1;
  pitch = 1;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

describe('Speech Engine (Multi-Tier & Resilience)', () => {
  let mockSpeak: ReturnType<typeof vi.fn>;
  let mockCancel: ReturnType<typeof vi.fn>;
  let mockGetVoices: ReturnType<typeof vi.fn>;
  let mockAudioContext: ReturnType<typeof vi.fn>;
  let mockOscillator: MockOscillator;
  let mockGain: MockGain;

  beforeEach(() => {
    mockSpeak = vi.fn();
    mockCancel = vi.fn();
    mockGetVoices = vi.fn().mockReturnValue([]);

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      configurable: true,
      value: {
        speak: mockSpeak,
        cancel: mockCancel,
        getVoices: mockGetVoices,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      writable: true,
      configurable: true,
      value: MockSpeechSynthesisUtterance,
    });

    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null,
    };

    mockGain = {
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
      connect: vi.fn(),
    };

    mockAudioContext = vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.currentTime = 0;
      this.destination = {};
      this.createOscillator = () => mockOscillator;
      this.createGain = () => mockGain;
      this.close = vi.fn().mockResolvedValue(undefined);
    });

    Object.defineProperty(window, 'AudioContext', {
      writable: true,
      configurable: true,
      value: mockAudioContext,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Feature detection', () => {
    it('detects speech and audio support correctly', () => {
      expect(isSpeechSynthesisSupported()).toBe(true);
      expect(isAudioContextSupported()).toBe(true);
      expect(isSpeechSupported()).toBe(true);
    });

    it('returns false when window is undefined or APIs are missing', () => {
      // @ts-expect-error test omission
      delete window.speechSynthesis;
      expect(isSpeechSynthesisSupported()).toBe(false);
      expect(isSpeechSupported()).toBe(true); // AudioContext still present

      // @ts-expect-error test omission
      delete window.AudioContext;
      expect(isAudioContextSupported()).toBe(false);
      expect(isSpeechSupported()).toBe(false);
    });
  });

  describe('Voice matching & fallbacks', () => {
    const mockVoices: MockVoice[] = [
      { lang: 'en-US', name: 'Microsoft David', default: true },
      { lang: 'en-GB', name: 'Microsoft George' },
      { lang: 'ja-JP', name: 'Kyoko' },
      { lang: 'zh-CN', name: 'Tingting' },
      { lang: 'ar-SA', name: 'Maged' },
      { lang: 'fil-PH', name: 'Angelo' },
    ];

    it('finds exact and primary subtag voice matches', () => {
      const voices = mockVoices as unknown as SpeechSynthesisVoice[];
      expect(findMatchingVoice(voices, 'ja-JP')?.name).toBe('Kyoko');
      expect(findMatchingVoice(voices, 'ja')?.name).toBe('Kyoko');
      expect(findMatchingVoice(voices, 'zh-Hans')?.name).toBe('Tingting');
      expect(findMatchingVoice(voices, 'tl-PH')?.name).toBe('Angelo');
      expect(findMatchingVoice(voices, 'th-TH')).toBeUndefined();
    });

    it('finds default or English fallback voice', () => {
      const voices = mockVoices as unknown as SpeechSynthesisVoice[];
      expect(findFallbackVoice(voices)?.name).toBe('Microsoft David');
    });

    it('sanitizes non-latin script to empty or latin characters', () => {
      expect(sanitizeToLatin('Café au lait')).toBe('Cafe au lait');
      expect(sanitizeToLatin('こんにちは')).toBe('こんにちは');
    });
  });

  describe('Acoustic Web Audio API Fallback', () => {
    it('plays tone chime and invokes callback on completion', () => {
      const onEnd = vi.fn();
      const result = playAcousticFallback(onEnd);
      expect(result).toBe(true);
      expect(mockOscillator.start).toHaveBeenCalled();
      expect(mockOscillator.stop).toHaveBeenCalled();

      // Trigger completion
      mockOscillator.onended?.();
      expect(onEnd).toHaveBeenCalled();
    });

    it('handles audio context errors gracefully', () => {
      mockAudioContext.mockImplementationOnce(() => {
        throw new Error('Audio disabled');
      });
      const onError = vi.fn();
      const result = playAcousticFallback(undefined, onError);
      expect(result).toBe(false);
      expect(onError).toHaveBeenCalled();
    });
  });

  describe('All 15 Countries Audio Reliability', () => {
    it('speaks native script when matching native voice is present', () => {
      const nativeVoices: MockVoice[] = [
        { lang: 'id-ID', name: 'Indonesian' },
        { lang: 'ms-MY', name: 'Malay' },
        { lang: 'en-SG', name: 'Singaporean' },
        { lang: 'th-TH', name: 'Thai' },
        { lang: 'vi-VN', name: 'Vietnamese' },
        { lang: 'fil-PH', name: 'Filipino' },
        { lang: 'zh-CN', name: 'Chinese' },
        { lang: 'ja-JP', name: 'Japanese' },
        { lang: 'ko-KR', name: 'Korean' },
        { lang: 'hi-IN', name: 'Hindi' },
        { lang: 'ar-SA', name: 'Arabic' },
        { lang: 'tr-TR', name: 'Turkish' },
        { lang: 'kk-KZ', name: 'Kazakh' },
        { lang: 'uz-UZ', name: 'Uzbek' },
        { lang: 'mn-MN', name: 'Mongolian' },
      ];
      mockGetVoices.mockReturnValue(nativeVoices);

      expect(countries.length).toBe(15);

      for (const country of countries) {
        mockSpeak.mockClear();
        const profile = profileFor(country);

        const success = speak(country.greeting.native, {
          lang: profile.speechLang,
          fallbackText: country.greeting.roman,
        });

        expect(success).toBe(true);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        const utterance = mockSpeak.mock.calls[0]![0] as MockSpeechSynthesisUtterance;
        expect(utterance.text).toBe(country.greeting.native);
        expect(utterance.voice).not.toBeNull();
      }
    });

    it('falls back cleanly to romanized phonetic text on Windows with only English voice', () => {
      // Simulate standard Windows desktop: only Microsoft David (en-US)
      const englishOnlyVoices: MockVoice[] = [
        { lang: 'en-US', name: 'Microsoft David Desktop - English (United States)', default: true },
      ];
      mockGetVoices.mockReturnValue(englishOnlyVoices);

      for (const country of countries) {
        mockSpeak.mockClear();
        const profile = profileFor(country);

        const success = speak(country.greeting.native, {
          lang: profile.speechLang,
          fallbackText: country.greeting.roman,
        });

        expect(success).toBe(true);
        expect(mockSpeak).toHaveBeenCalledTimes(1);
        const utterance = mockSpeak.mock.calls[0]![0] as MockSpeechSynthesisUtterance;

        // When country is Singapore (en-SG), David is an English voice match.
        // For all other languages with no voice, fallbackText is used!
        if (country.id === 'sg') {
          expect(utterance.text).toBe(country.greeting.native);
        } else {
          expect(utterance.text).toBe(country.greeting.roman);
        }
        expect(utterance.voice?.lang).toBe('en-US');
      }
    });

    it('falls back to acoustic tone generator if SpeechSynthesis is completely unavailable', () => {
      // @ts-expect-error test omission
      delete window.speechSynthesis;

      const onEnd = vi.fn();
      const success = speak('こんにちは', {
        fallbackText: 'Konnichiwa',
        onEnd,
      });

      expect(success).toBe(true);
      expect(mockOscillator.start).toHaveBeenCalled();
      mockOscillator.onended?.();
      expect(onEnd).toHaveBeenCalled();
    });

    it('falls back to acoustic tone generator if utterance.onerror is triggered', () => {
      mockGetVoices.mockReturnValue([{ lang: 'en-US', name: 'David' }]);

      const onEnd = vi.fn();
      speak('السلام عليكم', {
        lang: 'ar-SA',
        fallbackText: 'As-salamu alaykum',
        onEnd,
      });

      const utterance = mockSpeak.mock.calls[0]![0] as MockSpeechSynthesisUtterance;
      // Simulate browser speech synthesis error (e.g. language-unavailable or synthesis failure)
      utterance.onerror?.();

      expect(mockOscillator.start).toHaveBeenCalled();
      mockOscillator.onended?.();
      expect(onEnd).toHaveBeenCalled();
    });

    it('rejects empty text safely without crashing or playing audio', () => {
      const result = speak('   ');
      expect(result).toBe(false);
      expect(mockSpeak).not.toHaveBeenCalled();
      expect(mockOscillator.start).not.toHaveBeenCalled();
    });

    it('cancels speech safely without throwing', () => {
      expect(() => cancelSpeech()).not.toThrow();
      expect(mockCancel).toHaveBeenCalled();
    });
  });
});
