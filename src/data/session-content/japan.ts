import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'jp',
  audioQuests: [
    {
      id: 'jp-aq-1',
      type: 'hear-identify',
      audioText: 'Konnichiwa',
      audioLang: 'ja-JP',
      tiles: [
        { id: 'jp-aq-1-a', text: 'Konnichiwa', isCorrect: true },
        { id: 'jp-aq-1-b', text: 'Annyeonghaseyo', isCorrect: false },
        { id: 'jp-aq-1-c', text: 'Sawasdee', isCorrect: false },
        { id: 'jp-aq-1-d', text: 'Xin chào', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Konnichiwa (こんにちは) adalah salam siang hari yang paling umum di Jepang.',
    },
    {
      id: 'jp-aq-2',
      type: 'language-detect',
      audioText: 'Arigatou gozaimasu',
      audioLang: 'ja-JP',
      tiles: [
        { id: 'jp-aq-2-a', text: 'Bahasa Jepang', isCorrect: true },
        { id: 'jp-aq-2-b', text: 'Bahasa Korea', isCorrect: false },
        { id: 'jp-aq-2-c', text: 'Bahasa Mandarin', isCorrect: false },
        { id: 'jp-aq-2-d', text: 'Bahasa Thai', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Arigatou gozaimasu" adalah ucapan terima kasih formal dalam bahasa Jepang.',
    },
    {
      id: 'jp-aq-3',
      type: 'syllable-count',
      audioText: 'Sayonara',
      audioLang: 'ja-JP',
      tiles: [
        { id: 'jp-aq-3-a', text: '4', isCorrect: true },
        { id: 'jp-aq-3-b', text: '3', isCorrect: false },
        { id: 'jp-aq-3-c', text: '5', isCorrect: false },
        { id: 'jp-aq-3-d', text: '2', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Sa-yo-na-ra memiliki 4 suku kata. Ini adalah salam perpisahan formal di Jepang.',
    },
  ],
  buildChallenges: [
    {
      id: 'jp-bc-1',
      type: 'sentence-order',
      audioText: 'Watashi wa nihongo wo benkyou shimasu',
      audioLang: 'ja-JP',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Jepang'],
      distractors: ['makan', 'tidur'],
      hint1Target: 2,
    },
    {
      id: 'jp-bc-2',
      type: 'translation-build',
      audioText: 'Douzo yoroshiku onegaishimasu',
      audioLang: 'ja-JP',
      correctOrder: ['Senang', 'berkenalan', 'dengan', 'Anda'],
      distractors: ['bertemu', 'pergi'],
      hint1Target: 1,
    },
  ],
};

export default content;
