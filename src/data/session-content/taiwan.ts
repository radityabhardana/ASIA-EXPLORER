import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'taiwan',
  audioQuests: [
    {
      id: 'tw-aq-1',
      type: 'hear-identify',
      audioText: 'Ni hao',
      audioLang: 'zh-TW',
      tiles: [
        { id: 'tw-aq-1-a', text: 'Ni hao', isCorrect: true },
        { id: 'tw-aq-1-b', text: 'Konnichiwa', isCorrect: false },
        { id: 'tw-aq-1-c', text: 'Annyeonghaseyo', isCorrect: false },
        { id: 'tw-aq-1-d', text: 'Namaste', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Nǐ hǎo" (你好) digunakan di Taiwan dengan aksara tradisional. Taiwan menggunakan aksara Han tradisional, bukan sederhana.',
    },
    {
      id: 'tw-aq-2',
      type: 'language-detect',
      audioText: '謝謝你',
      audioLang: 'zh-TW',
      tiles: [
        { id: 'tw-aq-2-a', text: 'Mandarin Taiwan', isCorrect: true },
        { id: 'tw-aq-2-b', text: 'Mandarin Tiongkok', isCorrect: false },
        { id: 'tw-aq-2-c', text: 'Bahasa Jepang', isCorrect: false },
        { id: 'tw-aq-2-d', text: 'Bahasa Korea', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Xièxiè nǐ" (謝謝你) adalah "terima kasih" dalam Mandarin Taiwan, menggunakan aksara tradisional (繁體字).',
    },
    {
      id: 'tw-aq-3',
      type: 'syllable-count',
      audioText: 'Zàijiàn',
      audioLang: 'zh-TW',
      tiles: [
        { id: 'tw-aq-3-a', text: '3', isCorrect: true },
        { id: 'tw-aq-3-b', text: '2', isCorrect: false },
        { id: 'tw-aq-3-c', text: '4', isCorrect: false },
        { id: 'tw-aq-3-d', text: '1', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Zài-jiàn (再見) memiliki 3 suku kata. Di Taiwan, karakter ditulis 再見 bukan 再见 seperti di Tiongkok.',
    },
  ],
  buildChallenges: [
    {
      id: 'tw-bc-1',
      type: 'sentence-order',
      audioText: 'Wǒ xué zhōngwén',
      audioLang: 'zh-TW',
      correctOrder: ['Saya', 'belajar', 'Mandarin', 'Taiwan'],
      distractors: ['makan', 'tidur'],
      hint1Target: 2,
    },
    {
      id: 'tw-bc-2',
      type: 'translation-build',
      audioText: 'Hěn gāoxìng rènshí nǐ',
      audioLang: 'zh-TW',
      correctOrder: ['Senang', 'berkenalan', 'dengan', 'Anda'],
      distractors: ['pergi', 'berlari'],
      hint1Target: 1,
    },
  ],
};

export default content;
