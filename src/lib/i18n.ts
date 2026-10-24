import { useEffect, useState } from 'react';

export type Locale = 'id' | 'en';

export const DICTIONARY = {
  id: {
    // Navbar
    'nav.explore': 'Jelajah',
    'nav.dashboard': 'Dashboard',
    'nav.countries': 'Negara',
    'nav.signin': 'Masuk',
    'nav.register': 'Daftar',
    'nav.langAria': 'Beralih ke Bahasa Inggris (Switch to English)',

    // Hero
    'hero.skipLink': 'Lewati ke pilihan negara',
    'hero.eyebrow': 'PETA INTERAKTIF · 15 NEGARA',
    'hero.hint': 'Tarik untuk memutar · Arahkan kursor ke negara',

    // Skala
    'scale.statWords': 'negara dalam cakupan',
    'scale.note': 'Dari Turki sampai Jepang.',

    // Aksara
    'script.kicker': 'TIPOGRAFI ASIA',
    'script.heading': 'Satu Sapaan, Lima Belas Aksara',
    'script.listenAria': 'Dengarkan pengucapan sapaan',

    // Pilih Negara (Scene 3D)
    'invitation.kicker': 'PETA INTERAKTIF',
    'invitation.heading': 'Pilih Negara, Mulai Penjelajahan',
    'invitation.note': 'Sentuh atau arahkan kursor ke benua 3D untuk menjelajahi 15 negara.',
    'invitation.hint': 'Tarik untuk memutar · Klik negara untuk membuka profil',

    // Mosaik Galeri
    'mosaic.kicker': 'PILIHAN NEGARA',
    'mosaic.heading': '15 Negara, Satu Benua',
    'mosaic.note': 'Pilih negara untuk menjelajahi cerita, etiket, dan aksara.',
    'mosaic.legal': 'Foto kurasi dokumentasi Wikimedia Commons berlisensi terbuka (CC BY-SA / CC0).',

    // Dashboard Showcase
    'dashboard.kicker': 'RUANG BELAJAR',
    'dashboard.heading': 'Studio Belajar & Progres Budaya',
    'dashboard.note': 'Simpan pemahaman etiket dan rawat memori aksara secara mandiri di perambanmu.',
    'dashboard.consoleTitle': 'asiakin-engine v3.0 · Kyoto, Jepang · Progres 5/6',
    'dashboard.scenarioBadge': 'SKENARIO ETIKET BUDAYA',
    'dashboard.scenarioLocation': 'Tokyo, Jepang',
    'dashboard.scenarioTitle': '“Etiket Menyerahkan Kartu Nama (Meishi) di Tokyo”',
    'dashboard.scenarioOpt1': 'Pegang dua sudut atas dengan kedua tangan, teks menghadap penerima, bungkukkan badan 15 derajat.',
    'dashboard.scenarioOpt2': 'Serahkan santai dengan satu tangan ke atas meja rapat lalu simpan langsung ke saku.',
    'dashboard.tagHierarchy': 'Penghormatan Hierarki',
    'dashboard.tagSocial': 'Konteks Sosial',
    'dashboard.tagViolation': 'Pelanggaran Norma Formal',
    'dashboard.scenarioCorrectLead': 'Benar!',
    'dashboard.scenarioCorrectText': 'Di Jepang, kartu nama (meishi) dianggap sebagai representasi fisik kehormatan rekan bisnismu. Menerima dengan dua tangan menunjukkan rasa hormat penuh.',
    'dashboard.scenarioWarnLead': 'Kurang tepat.',
    'dashboard.scenarioWarnText': 'Menyerahkan kartu nama dengan satu tangan atau langsung mengantonginya dianggap meremehkan pemilik kartu.',
    'dashboard.leitnerTitle': 'Phrase Vault Spaced Repetition',
    'dashboard.leitnerDays': 'Hari',
    'dashboard.leitnerPhrasesReady': 'Frasa Siap',
    'dashboard.leitnerPhrasesUnit': 'Frasa',
    'dashboard.leitnerBoxPrefix': 'Kotak',
    'dashboard.leitnerInterval': 'Interval',
    'dashboard.leitnerReadyReview': 'frasa siap ulas',
    'dashboard.statusLocal': 'Tersimpan Lokal di IndexedDB',
    'dashboard.statusMeta': '0 Pelacak · Siap Ekspor JSON',
    'dashboard.p1Title': 'Kurikulum Cerdas',
    'dashboard.p1Desc': 'Satu tugas harian dipilih deterministik tanpa rasa bingung — selesaikan etiket, ulas frasa, atau jelajahi negara baru.',
    'dashboard.p2Title': 'Phrase Vault 5-Tingkat',
    'dashboard.p2Desc': 'Spaced repetition berbasis interval 1h, 3h, 7h, 16h, dan 35h mengulang frasa kunci sebelum terlupakan.',
    'dashboard.p3Title': 'Etiket Berakar Sebab',
    'dashboard.p3Desc': 'Bukan pilihan ganda buta. Pelajari norma budaya asli beserta latar belakang sosial dan hierarki kultural.',
    'dashboard.p4Title': 'Kedaulatan Data Penuh',
    'dashboard.p4Desc': '100% tersimpan di perambanmu melalui IndexedDB, tanpa pelacak analitik, bebas ekspor dan impor berkas JSON kapan saja.',
    'dashboard.cta': 'Buka Dashboard',

    // Footer
    'footer.copyright': '© 2026 Asia Explorer · Ekspedisi tipografi, etiket, dan kartografi 15 negara.',

    // Country Page
    'country.back': 'Kembali ke benua',
    'country.culture': 'Budaya',
    'country.people': 'Orang',
    'country.language': 'Bahasa',
    'country.threePhrases': 'Tiga frasa',
    'country.listen': 'Dengarkan',
    'country.galleryKicker': 'LENSA BUDAYA & KEHIDUPAN',
    'country.galleryTitle': 'Galeri Dokumentasi',
    'country.galleryLead': 'Rekaman visual lanskap alam, kuliner tradisi, dan ritme keseharian kota.',
    'country.dashboardCalloutKicker': 'MODUL INTERAKTIF',
    'country.dashboardCalloutTitle': 'Uji Pemahaman: Etiket & Frasa',
    'country.dashboardCalloutDesc': 'Ikuti skenario budaya bercabang dan simpan frasa ke Phrase Vault di perambanmu.',
    'country.dashboardCalloutCta': 'Mulai Pelajaran di Dashboard →',
    'country.sourcesLabel': 'Referensi & Sumber Data',
    'country.verifiedBadge': 'Terverifikasi',
  },
  en: {
    // Navbar
    'nav.explore': 'Explore',
    'nav.dashboard': 'Dashboard',
    'nav.countries': 'Countries',
    'nav.signin': 'Sign in',
    'nav.register': 'Register',
    'nav.langAria': 'Switch to Indonesian (Beralih ke Bahasa Indonesia)',

    // Hero
    'hero.skipLink': 'Skip to country selection',
    'hero.eyebrow': 'INTERACTIVE MAP · 15 COUNTRIES',
    'hero.hint': 'Drag to rotate · Hover country for info',

    // Skala
    'scale.statWords': 'countries covered',
    'scale.note': 'From Turkey to Japan.',

    // Aksara
    'script.kicker': 'ASIAN TYPOGRAPHY',
    'script.heading': 'One Greeting, Fifteen Scripts',
    'script.listenAria': 'Listen to greeting pronunciation',

    // Pilih Negara (Scene 3D)
    'invitation.kicker': 'INTERACTIVE 3D MAP',
    'invitation.heading': 'Choose a Country, Begin Exploration',
    'invitation.note': 'Touch or drag the 3D continent to explore 15 nations. Click any country to open its cultural atlas.',
    'invitation.hint': 'Drag to rotate · Click country to view atlas',

    // Mosaik Galeri
    'mosaic.kicker': 'COUNTRY GALLERY',
    'mosaic.heading': '15 Countries, One Continent',
    'mosaic.note': 'Select a country to explore stories, etiquette, and scripts.',
    'mosaic.legal': 'Curated documentation from Wikimedia Commons under open licenses (CC BY-SA / CC0).',

    // Dashboard Showcase
    'dashboard.kicker': 'LEARNING STUDIO',
    'dashboard.heading': 'Learning Studio & Cultural Progress',
    'dashboard.note': 'Retain cultural etiquette and master scripts with local-first privacy in your browser.',
    'dashboard.consoleTitle': 'asiakin-engine v3.0 · Kyoto, Japan · Progress 5/6',
    'dashboard.scenarioBadge': 'CULTURAL ETIQUETTE SCENARIO',
    'dashboard.scenarioLocation': 'Tokyo, Japan',
    'dashboard.scenarioTitle': '“Business Card Exchange (Meishi) Etiquette in Tokyo”',
    'dashboard.scenarioOpt1': 'Hold top corners with both hands, face text toward recipient, bow 15 degrees.',
    'dashboard.scenarioOpt2': 'Casually slide with one hand across the table, then slip directly into pocket.',
    'dashboard.tagHierarchy': 'Hierarchical Respect',
    'dashboard.tagSocial': 'Social Context',
    'dashboard.tagViolation': 'Formal Norm Violation',
    'dashboard.scenarioCorrectLead': 'Correct!',
    'dashboard.scenarioCorrectText': 'In Japan, business cards (meishi) are considered physical representations of a person’s dignity. Receiving with both hands demonstrates complete respect.',
    'dashboard.scenarioWarnLead': 'Not quite right.',
    'dashboard.scenarioWarnText': 'Presenting a card with one hand or immediately pocketing it is seen as dismissive of its owner.',
    'dashboard.leitnerTitle': 'Phrase Vault Spaced Repetition',
    'dashboard.leitnerDays': 'Days',
    'dashboard.leitnerPhrasesReady': 'Phrases Ready',
    'dashboard.leitnerPhrasesUnit': 'Phrases',
    'dashboard.leitnerBoxPrefix': 'Box',
    'dashboard.leitnerInterval': 'Interval',
    'dashboard.leitnerReadyReview': 'phrases ready for review',
    'dashboard.statusLocal': 'Stored Locally in IndexedDB',
    'dashboard.statusMeta': '0 Trackers · JSON Export Ready',
    'dashboard.p1Title': 'Smart Curriculum',
    'dashboard.p1Desc': 'One deterministic daily task chosen without guesswork — practice etiquette, review phrases, or explore a new country.',
    'dashboard.p2Title': '5-Box Phrase Vault',
    'dashboard.p2Desc': 'Spaced repetition at 1d, 3d, 7d, 16d, and 35d intervals reinforces key phrases right before they fade.',
    'dashboard.p3Title': 'Rooted Etiquette',
    'dashboard.p3Desc': 'Not blind multiple choice. Understand real cultural norms alongside their social context and etiquette hierarchy.',
    'dashboard.p4Title': 'Complete Data Sovereignty',
    'dashboard.p4Desc': '100% stored in your browser via IndexedDB, zero tracking analytics, freely export and import JSON backups anytime.',
    'dashboard.cta': 'Open Dashboard',

    // Footer
    'footer.copyright': '© 2026 Asia Explorer · Typographic, etiquette, and cartographic expedition across 15 nations.',

    // Country Page
    'country.back': 'Back to continent',
    'country.culture': 'Culture',
    'country.people': 'People',
    'country.language': 'Language',
    'country.threePhrases': 'Three phrases',
    'country.listen': 'Listen',
    'country.galleryKicker': 'CULTURE & DAILY LIFE LENS',
    'country.galleryTitle': 'Documentation Gallery',
    'country.galleryLead': 'Visual records of natural landscapes, culinary traditions, and daily urban rhythms.',
    'country.dashboardCalloutKicker': 'INTERACTIVE MODULE',
    'country.dashboardCalloutTitle': 'Test Knowledge: Etiquette & Phrases',
    'country.dashboardCalloutDesc': 'Engage in branching cultural scenarios and save phrases to your browser’s Phrase Vault.',
    'country.dashboardCalloutCta': 'Start Lesson in Dashboard →',
    'country.sourcesLabel': 'References & Data Sources',
    'country.verifiedBadge': 'Verified',
  },
} as const;

export type TranslationKey = keyof typeof DICTIONARY.id;

export function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'id';
  const saved = localStorage.getItem('asiakin_lang');
  if (saved === 'en' || saved === 'id') return saved;
  return document.documentElement.lang === 'en' ? 'en' : 'id';
}

export function setStoredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('asiakin_lang', locale);
  document.documentElement.lang = locale;
  window.dispatchEvent(new CustomEvent('asiakin:langchange', { detail: { lang: locale } }));
}

export function useI18n() {
  const [locale, setLocale] = useState<Locale>(getStoredLocale);

  useEffect(() => {
    const handleLangChange = (event: Event) => {
      const customEvent = event as CustomEvent<{ lang: Locale }>;
      if (customEvent.detail?.lang) {
        setLocale(customEvent.detail.lang);
      } else {
        setLocale(getStoredLocale());
      }
    };

    window.addEventListener('asiakin:langchange', handleLangChange);
    return () => {
      window.removeEventListener('asiakin:langchange', handleLangChange);
    };
  }, []);

  const t = (key: TranslationKey): string => {
    const table = DICTIONARY[locale] || DICTIONARY.id;
    return (table as Record<string, string>)[key] || (DICTIONARY.id as Record<string, string>)[key] || key;
  };

  const toggleLocale = () => {
    const next: Locale = locale === 'id' ? 'en' : 'id';
    setStoredLocale(next);
    setLocale(next);
  };

  return { locale, t, toggleLocale, setLocale: (l: Locale) => { setStoredLocale(l); setLocale(l); } };
}
