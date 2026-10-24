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

    // Profile & Gerbang
    'profile.loading': 'Memuat profil…',
    'profile.dialogTitle': 'Profil Lokal',
    'profile.dialogTitleExisting': 'Profil Aktif',
    'profile.dialogDesc': 'Dashboard menyimpan progresmu di peramban ini.',
    'profile.nameLabel': 'Nama Tampilan',
    'profile.namePlaceholder': 'Ketik namamu...',
    'profile.saveButton': 'Simpan Profil',
    'profile.saving': 'Menyimpan…',
    'profile.cancel': 'Batal',
    'profile.close': 'Tutup',
    'profile.goToDashboard': 'Buka Dashboard',
    'profile.currentLabel': 'Profil saat ini',
    'profile.errorEmpty': 'Nama tidak boleh kosong.',
    'profile.errorFailed': 'Gagal menyimpan profil.',

    // Dashboard Page
    'dashboard.pageTitle': 'Dashboard Belajar',
    'dashboard.pageDesc': 'Pusat eksplorasi mandiri, progres etiket, dan Phrase Vault lokal.',
    'dashboard.taskHeader': 'Satu Tugas Berikutnya',
    'dashboard.taskResume': 'Lanjutkan Sesi Berjalan',
    'dashboard.taskResumeDesc': 'Anda memiliki sesi quest yang belum selesai. Lanjutkan untuk menuntaskan evaluasi.',
    'dashboard.taskResumeBtn': 'Lanjutkan Sesi',
    'dashboard.taskReview': 'Ulas Frasa Jatuh Tempo',
    'dashboard.taskReviewDesc': 'Ada frasa yang mencapai interval pengulangan hari ini. Segarkan ingatanmu.',
    'dashboard.taskReviewBtn': 'Mulai Ulas Frasa',
    'dashboard.taskNewLesson': 'Pelajaran Baru',
    'dashboard.taskNewLessonDesc': 'Langkah berikutnya: pelajari etiket dan aksara negara berikutnya.',
    'dashboard.taskNewLessonBtn': 'Mulai Pelajaran',
    'dashboard.taskStory': 'Jelajahi Cerita Kultural',
    'dashboard.taskStoryDesc': 'Baca catatan mendalam dan narasi kehidupan budaya negara terpilih.',
    'dashboard.taskStoryBtn': 'Baca Cerita',
    'dashboard.taskAllDone': 'Semua Pelajaran Tuntas',
    'dashboard.taskAllDoneDesc': 'Selamat! Anda telah menyelesaikan seluruh materi 10 negara dan memelihara memori frasa.',
    'dashboard.taskAllDoneBtn': 'Jelajahi Peta 3D',

    // Vault & Leitner
    'dashboard.vaultTitle': 'Phrase Vault & Frasa Jatuh Tempo',
    'dashboard.vaultDesc': 'Sistem spaced repetition 5-kotak menjaga memori frasa kunci tetap tajam.',
    'dashboard.box1': 'Kotak 1',
    'dashboard.box2': 'Kotak 2',
    'dashboard.box3': 'Kotak 3',
    'dashboard.box4': 'Kotak 4',
    'dashboard.box5': 'Kotak 5',
    'dashboard.dueCount': 'frasa siap ulas',
    'dashboard.noDue': 'Semua frasa sudah diulas untuk hari ini. Jadwal berikutnya terawat.',
    'dashboard.startReview': 'Mulai Ulas',

    // Daftar Negara & Progres
    'dashboard.countriesTitle': 'Daftar Negara & Progres',
    'dashboard.step1': '1. Kenali',
    'dashboard.step2': '2. Etiket',
    'dashboard.step3': '3. Bahasa',
    'dashboard.step4': '4. Quest',
    'dashboard.exploration': 'Penjelajahan · Belum ada pelajaran',
    'dashboard.openAtlas': 'Buka Atlas',
    'dashboard.startOrResume': 'Buka Pelajaran',

    // Data & Kedaulatan
    'dashboard.sovereigntyTitle': 'Data & Kedaulatan (Local-First)',
    'dashboard.sovereigntyDesc': 'Semua progres belajar disimpan langsung di perambanmu (IndexedDB). Tidak ada pelacak, tidak ada akun server.',
    'dashboard.exportBtn': 'Ekspor Cadangan JSON',
    'dashboard.importBtn': 'Impor Cadangan JSON',
    'dashboard.resetBtn': 'Reset Progres',
    'dashboard.resetConfirm': 'Apakah Anda yakin ingin mereset seluruh progres belajar? Tindakan ini tidak dapat dibatalkan.',
    'dashboard.importSuccess': 'Data berhasil diimpor!',
    'dashboard.importError': 'Gagal mengimpor berkas cadangan.',

    // Pelajaran (Lesson)
    'lesson.step1Title': '1. Kenali',
    'lesson.step2Title': '2. Etiket',
    'lesson.step3Title': '3. Bahasa',
    'lesson.step4Title': '4. Quest',
    'lesson.backToDashboard': '← Kembali ke Dashboard',
    'lesson.storyLink': 'Baca cerita lengkap di halaman negara →',
    'lesson.continueToEtiket': 'Lanjut ke Etiket',
    'lesson.etiketInstructions': 'Buka ketiga norma budaya di bawah ini untuk memahami latar belakang dan sebabnya.',
    'lesson.continueToBahasa': 'Lanjut ke Bahasa',
    'lesson.bahasaInstructions': 'Dengarkan sapaan dan pelajari ketiga frasa kunci. Tandai centang untuk melanjutkan.',
    'lesson.listen': 'Dengar',
    'lesson.markLearned': 'Sudah dipelajari',
    'lesson.continueToQuest': 'Lanjut ke Quest',
    'lesson.startQuest': 'Mulai Quest',

    // Quest
    'quest.itemCounter': 'Butir {current} dari {total}',
    'quest.checkAnswer': 'Periksa Jawaban',
    'quest.nextItem': 'Lanjut',
    'quest.finishQuest': 'Selesai & Lihat Hasil',
    'quest.correctStatus': 'Tepat Sekali',
    'quest.incorrectStatus': 'Kurang Tepat',
    'quest.sourceLabel': 'Sumber Rujukan Terverifikasi',
    'quest.selectAnswerPrompt': 'Pilih satu jawaban di bawah ini.',
    'quest.matchPrompt': 'Pasangkan setiap frasa dengan artinya yang tepat.',

    // Hasil (Quest Result)
    'result.title': 'Evaluasi Hasil Quest',
    'result.score': 'Skor Akhir',
    'result.duration': 'Durasi',
    'result.reviewHeading': 'Rincian Penjelasan per Butir',
    'result.yourAnswer': 'Jawabanmu',
    'result.correctAnswer': 'Jawaban benar',
    'result.retryWrong': 'Ulangi yang Salah',
    'result.nextCountry': 'Lanjut ke Negara Berikutnya',
    'result.backDashboard': 'Kembali ke Dashboard',
    'result.notFound': 'Hasil ini tidak ada di peramban ini.',
    'result.empty': 'Attempt ini belum memiliki jawaban.',
    'result.partialWarning': 'Sebagian butir pada attempt ini sudah tidak tersedia di versi konten saat ini.',
    'result.loading': 'Memuat hasil…',

    // Ulas Leitner (Review)
    'review.title': 'Sesi Ulas Phrase Vault',
    'review.progress': 'Frasa {current} dari {total} yang jatuh tempo',
    'review.showMeaning': 'Lihat Arti',
    'review.remembered': 'Ingat (Naik Kotak)',
    'review.forgot': 'Ulas Lagi (Reset Kotak 1)',
    'review.finishedTitle': 'Sesi Ulas Tuntas',
    'review.finishedDesc': 'Semua frasa yang jatuh tempo hari ini telah berhasil diperbarui.',
    'review.backToDashboard': 'Kembali ke Dashboard',
    'review.emptyDesc': 'Tidak ada frasa yang jatuh tempo hari ini. Phrase Vault Anda dalam kondisi prima.',
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

    // Profile & Gate
    'profile.loading': 'Loading profile…',
    'profile.dialogTitle': 'Local Profile',
    'profile.dialogTitleExisting': 'Active Profile',
    'profile.dialogDesc': 'Dashboard stores your progress in this browser.',
    'profile.nameLabel': 'Display Name',
    'profile.namePlaceholder': 'Type your name...',
    'profile.saveButton': 'Save Profile',
    'profile.saving': 'Saving…',
    'profile.cancel': 'Cancel',
    'profile.close': 'Close',
    'profile.goToDashboard': 'Open Dashboard',
    'profile.currentLabel': 'Current profile',
    'profile.errorEmpty': 'Name cannot be empty.',
    'profile.errorFailed': 'Failed to save profile.',

    // Dashboard Page
    'dashboard.pageTitle': 'Learning Dashboard',
    'dashboard.pageDesc': 'Self-directed exploration hub, etiquette progress, and local Phrase Vault.',
    'dashboard.taskHeader': 'Next Single Task',
    'dashboard.taskResume': 'Resume In-Progress Session',
    'dashboard.taskResumeDesc': 'You have an unfinished quest session. Resume to complete evaluation.',
    'dashboard.taskResumeBtn': 'Resume Session',
    'dashboard.taskReview': 'Review Due Phrases',
    'dashboard.taskReviewDesc': 'Phrases have reached their repetition interval today. Refresh your memory.',
    'dashboard.taskReviewBtn': 'Start Reviewing Phrases',
    'dashboard.taskNewLesson': 'New Lesson',
    'dashboard.taskNewLessonDesc': 'Next step: learn the etiquette and scripts of the next country.',
    'dashboard.taskNewLessonBtn': 'Start Lesson',
    'dashboard.taskStory': 'Explore Cultural Story',
    'dashboard.taskStoryDesc': 'Read in-depth notes and cultural life narratives of the chosen country.',
    'dashboard.taskStoryBtn': 'Read Story',
    'dashboard.taskAllDone': 'All Lessons Completed',
    'dashboard.taskAllDoneDesc': 'Congratulations! You have completed all 10 countries and maintained phrase retention.',
    'dashboard.taskAllDoneBtn': 'Explore 3D Map',

    // Vault & Leitner
    'dashboard.vaultTitle': 'Phrase Vault & Due Phrases',
    'dashboard.vaultDesc': '5-box spaced repetition system keeps key phrase memory sharp.',
    'dashboard.box1': 'Box 1',
    'dashboard.box2': 'Box 2',
    'dashboard.box3': 'Box 3',
    'dashboard.box4': 'Box 4',
    'dashboard.box5': 'Box 5',
    'dashboard.dueCount': 'phrases ready for review',
    'dashboard.noDue': 'All phrases reviewed for today. Next schedule maintained.',
    'dashboard.startReview': 'Start Review',

    // Daftar Negara & Progres
    'dashboard.countriesTitle': 'Country Directory & Progress',
    'dashboard.step1': '1. Context',
    'dashboard.step2': '2. Etiquette',
    'dashboard.step3': '3. Language',
    'dashboard.step4': '4. Quest',
    'dashboard.exploration': 'Exploration · No lesson yet',
    'dashboard.openAtlas': 'Open Atlas',
    'dashboard.startOrResume': 'Open Lesson',

    // Data & Kedaulatan
    'dashboard.sovereigntyTitle': 'Data & Sovereignty (Local-First)',
    'dashboard.sovereigntyDesc': 'All learning progress is saved directly in your browser (IndexedDB). Zero trackers, zero server accounts.',
    'dashboard.exportBtn': 'Export JSON Backup',
    'dashboard.importBtn': 'Import JSON Backup',
    'dashboard.resetBtn': 'Reset Progress',
    'dashboard.resetConfirm': 'Are you sure you want to reset all learning progress? This action cannot be undone.',
    'dashboard.importSuccess': 'Data imported successfully!',
    'dashboard.importError': 'Failed to import backup file.',

    // Pelajaran (Lesson)
    'lesson.step1Title': '1. Context',
    'lesson.step2Title': '2. Etiquette',
    'lesson.step3Title': '3. Language',
    'lesson.step4Title': '4. Quest',
    'lesson.backToDashboard': '← Back to Dashboard',
    'lesson.storyLink': 'Read full story on country page →',
    'lesson.continueToEtiket': 'Continue to Etiquette',
    'lesson.etiketInstructions': 'Open all three cultural norms below to understand their background and reasons.',
    'lesson.continueToBahasa': 'Continue to Language',
    'lesson.bahasaInstructions': 'Listen to the greeting and learn the three key phrases. Check off each to proceed.',
    'lesson.listen': 'Listen',
    'lesson.markLearned': 'Mark as learned',
    'lesson.continueToQuest': 'Continue to Quest',
    'lesson.startQuest': 'Start Quest',

    // Quest
    'quest.itemCounter': 'Item {current} of {total}',
    'quest.checkAnswer': 'Check Answer',
    'quest.nextItem': 'Continue',
    'quest.finishQuest': 'Finish & View Result',
    'quest.correctStatus': 'Correct',
    'quest.incorrectStatus': 'Incorrect',
    'quest.sourceLabel': 'Verified Source Reference',
    'quest.selectAnswerPrompt': 'Select an answer below.',
    'quest.matchPrompt': 'Match each phrase with its correct meaning.',

    // Hasil (Quest Result)
    'result.title': 'Quest Evaluation Results',
    'result.score': 'Final Score',
    'result.duration': 'Duration',
    'result.reviewHeading': 'Item-by-Item Review Breakdown',
    'result.yourAnswer': 'Your answer',
    'result.correctAnswer': 'Correct answer',
    'result.retryWrong': 'Retry Mistakes',
    'result.nextCountry': 'Continue to Next Country',
    'result.backDashboard': 'Back to Dashboard',
    'result.notFound': 'This result was not found in this browser.',
    'result.empty': 'This attempt has no answers.',
    'result.partialWarning': 'Some items in this attempt are no longer available in the current content version.',
    'result.loading': 'Loading results…',

    // Ulas Leitner (Review)
    'review.title': 'Phrase Vault Review Session',
    'review.progress': 'Phrase {current} of {total} due',
    'review.showMeaning': 'Show Meaning',
    'review.remembered': 'Remembered (Promote)',
    'review.forgot': 'Review Again (Reset Box 1)',
    'review.finishedTitle': 'Review Session Complete',
    'review.finishedDesc': 'All phrases due today have been successfully updated.',
    'review.backToDashboard': 'Back to Dashboard',
    'review.emptyDesc': 'No phrases are due for review today. Your Phrase Vault is up to date.',
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
