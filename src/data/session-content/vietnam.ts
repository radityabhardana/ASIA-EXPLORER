import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'vn',
  audioQuests: [
    {
      id: 'vn-aq-1',
      type: 'hear-identify',
      audioText: 'Xin chào',
      audioLang: 'vi-VN',
      tiles: [
        { id: 'vn-aq-1-a', text: 'Xin chào', isCorrect: true },
        { id: 'vn-aq-1-b', text: 'Sawasdee', isCorrect: false },
        { id: 'vn-aq-1-c', text: 'Annyeonghaseyo', isCorrect: false },
        { id: 'vn-aq-1-d', text: 'Namaste', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Xin chào" adalah salam umum dalam bahasa Vietnam, digunakan di pagi, siang, maupun malam hari.',
    },
    {
      id: 'vn-aq-2',
      type: 'language-detect',
      audioText: 'Cảm ơn bạn',
      audioLang: 'vi-VN',
      tiles: [
        { id: 'vn-aq-2-a', text: 'Bahasa Vietnam', isCorrect: true },
        { id: 'vn-aq-2-b', text: 'Bahasa Thai', isCorrect: false },
        { id: 'vn-aq-2-c', text: 'Bahasa Mandarin', isCorrect: false },
        { id: 'vn-aq-2-d', text: 'Bahasa Khmer', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Cảm ơn bạn" berarti "terima kasih" dalam bahasa Vietnam. Bahasa Vietnam menggunakan aksara Latin dengan tanda diakritik.',
    },
    {
      id: 'vn-aq-3',
      type: 'syllable-count',
      audioText: 'Xin chào',
      audioLang: 'vi-VN',
      tiles: [
        { id: 'vn-aq-3-a', text: '2', isCorrect: true },
        { id: 'vn-aq-3-b', text: '3', isCorrect: false },
        { id: 'vn-aq-3-c', text: '1', isCorrect: false },
        { id: 'vn-aq-3-d', text: '4', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Xin chào memiliki 2 suku kata. Bahasa Vietnam adalah bahasa tonal dengan 6 nada berbeda.',
    },
  ],
  buildChallenges: [
    {
      id: 'vn-bc-1',
      type: 'sentence-order',
      audioText: 'Tôi học tiếng Việt',
      audioLang: 'vi-VN',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Vietnam'],
      distractors: ['makan', 'berlari'],
      hint1Target: 2,
    },
    {
      id: 'vn-bc-2',
      type: 'translation-build',
      audioText: 'Rất vui được gặp bạn',
      audioLang: 'vi-VN',
      correctOrder: ['Senang', 'bertemu', 'dengan', 'Anda'],
      distractors: ['pergi', 'minum'],
      hint1Target: 1,
    },
  ],
};

export default content;
