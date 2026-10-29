import type { Country } from '@/content/countries';

export type Script =
  | 'latin'
  | 'cjk'
  | 'hangul'
  | 'arab'
  | 'cyril'
  | 'deva'
  | 'thai'
  | 'hebr'
  | 'armn'
  | 'geor'
  | 'beng'
  | 'sinh'
  | 'thaa'
  | 'mymr'
  | 'khmr'
  | 'laoo'
  | 'tibt'
  | 'grek';
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

  // Asia Tenggara
  bn: { lang: 'ms', speechLang: 'ms-BN', script: 'latin', dir: 'ltr' },
  kh: { lang: 'km', speechLang: 'km-KH', script: 'khmr', dir: 'ltr' },
  la: { lang: 'lo', speechLang: 'lo-LA', script: 'laoo', dir: 'ltr' },
  mm: { lang: 'my', speechLang: 'my-MM', script: 'mymr', dir: 'ltr' },
  tl: { lang: 'tet', speechLang: 'tet-TL', script: 'latin', dir: 'ltr' },

  // Asia Timur
  kp: { lang: 'ko', speechLang: 'ko-KP', script: 'hangul', dir: 'ltr' },

  // Asia Selatan
  af: { lang: 'ps', speechLang: 'ps-AF', script: 'arab', dir: 'rtl' },
  bd: { lang: 'bn', speechLang: 'bn-BD', script: 'beng', dir: 'ltr' },
  bt: { lang: 'dz', speechLang: 'dz-BT', script: 'tibt', dir: 'ltr' },
  ir: { lang: 'fa', speechLang: 'fa-IR', script: 'arab', dir: 'rtl' },
  lk: { lang: 'si', speechLang: 'si-LK', script: 'sinh', dir: 'ltr' },
  mv: { lang: 'dv', speechLang: 'dv-MV', script: 'thaa', dir: 'rtl' },
  np: { lang: 'ne', speechLang: 'ne-NP', script: 'deva', dir: 'ltr' },
  pk: { lang: 'ur', speechLang: 'ur-PK', script: 'arab', dir: 'rtl' },

  // Asia Barat
  am: { lang: 'hy', speechLang: 'hy-AM', script: 'armn', dir: 'ltr' },
  az: { lang: 'az', speechLang: 'az-AZ', script: 'latin', dir: 'ltr' },
  bh: { lang: 'ar', speechLang: 'ar-BH', script: 'arab', dir: 'rtl' },
  cy: { lang: 'el', speechLang: 'el-CY', script: 'grek', dir: 'ltr' },
  ge: { lang: 'ka', speechLang: 'ka-GE', script: 'geor', dir: 'ltr' },
  il: { lang: 'he', speechLang: 'he-IL', script: 'hebr', dir: 'rtl' },
  iq: { lang: 'ar', speechLang: 'ar-IQ', script: 'arab', dir: 'rtl' },
  jo: { lang: 'ar', speechLang: 'ar-JO', script: 'arab', dir: 'rtl' },
  kw: { lang: 'ar', speechLang: 'ar-KW', script: 'arab', dir: 'rtl' },
  lb: { lang: 'ar', speechLang: 'ar-LB', script: 'arab', dir: 'rtl' },
  om: { lang: 'ar', speechLang: 'ar-OM', script: 'arab', dir: 'rtl' },
  ps: { lang: 'ar', speechLang: 'ar-PS', script: 'arab', dir: 'rtl' },
  qa: { lang: 'ar', speechLang: 'ar-QA', script: 'arab', dir: 'rtl' },
  sy: { lang: 'ar', speechLang: 'ar-SY', script: 'arab', dir: 'rtl' },
  ae: { lang: 'ar', speechLang: 'ar-AE', script: 'arab', dir: 'rtl' },
  ye: { lang: 'ar', speechLang: 'ar-YE', script: 'arab', dir: 'rtl' },

  // Asia Tengah
  kg: { lang: 'ky', speechLang: 'ky-KG', script: 'cyril', dir: 'ltr' },
  tj: { lang: 'tg', speechLang: 'tg-TJ', script: 'cyril', dir: 'ltr' },
  tm: { lang: 'tk', speechLang: 'tk-TM', script: 'latin', dir: 'ltr' },
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
