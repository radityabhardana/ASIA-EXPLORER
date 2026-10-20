import type { Country } from '@/content/countries';

export type Script = 'latin' | 'cjk' | 'hangul' | 'arab' | 'cyril' | 'deva' | 'thai';
export type TextDirection = 'ltr' | 'rtl';

export type TextProfile = {
  /** Kode bahasa untuk atribut `lang`. */
  lang: string;
  /** BCP-47 untuk `SpeechSynthesisUtterance.lang`. */
  speechLang: string;
  script: Script;
  dir: TextDirection;
};

const FALLBACK: TextProfile = {
  lang: 'id',
  speechLang: 'id-ID',
  script: 'latin',
  dir: 'ltr',
};

const PROFILES: Readonly<Record<string, TextProfile>> = {
  id: { lang: 'id', speechLang: 'id-ID', script: 'latin', dir: 'ltr' },
  my: { lang: 'ms', speechLang: 'ms-MY', script: 'latin', dir: 'ltr' },
  sg: { lang: 'en', speechLang: 'en-SG', script: 'latin', dir: 'ltr' },
  th: { lang: 'th', speechLang: 'th-TH', script: 'thai', dir: 'ltr' },
  vn: { lang: 'vi', speechLang: 'vi-VN', script: 'latin', dir: 'ltr' },
  ph: { lang: 'fil', speechLang: 'fil-PH', script: 'latin', dir: 'ltr' },
  cn: { lang: 'zh-Hans', speechLang: 'zh-CN', script: 'cjk', dir: 'ltr' },
  jp: { lang: 'ja', speechLang: 'ja-JP', script: 'cjk', dir: 'ltr' },
  kr: { lang: 'ko', speechLang: 'ko-KR', script: 'hangul', dir: 'ltr' },
  in: { lang: 'hi', speechLang: 'hi-IN', script: 'deva', dir: 'ltr' },
  sa: { lang: 'ar', speechLang: 'ar-SA', script: 'arab', dir: 'rtl' },
  tr: { lang: 'tr', speechLang: 'tr-TR', script: 'latin', dir: 'ltr' },
  kz: { lang: 'kk', speechLang: 'kk-KZ', script: 'cyril', dir: 'ltr' },
  uz: { lang: 'uz', speechLang: 'uz-UZ', script: 'latin', dir: 'ltr' },
  mn: { lang: 'mn', speechLang: 'mn-MN', script: 'cyril', dir: 'ltr' },
};

export function profileFor(country: Country): TextProfile {
  return PROFILES[country.id] ?? FALLBACK;
}

function normalize(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

/** Romanisasi yang identik dengan aksara asli tidak diulang di layar. */
export function differs(a: string, b: string): boolean {
  return normalize(a) !== normalize(b);
}
