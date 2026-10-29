import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'th',
  audioQuests: [
    {
      id: 'th-aq-1',
      type: 'hear-identify',
      audioText: 'Sawasdee krap',
      audioLang: 'th-TH',
      tiles: [
        { id: 'th-aq-1-a', text: 'Sawasdee krap', isCorrect: true },
        { id: 'th-aq-1-b', text: 'Konnichiwa', isCorrect: false },
        { id: 'th-aq-1-c', text: 'Xin chào', isCorrect: false },
        { id: 'th-aq-1-d', text: 'Kamusta', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Sawasdee krap" (สวัสดีครับ) adalah salam resmi pria di Thailand. Wanita menggunakan "kha" di akhir.',
    },
    {
      id: 'th-aq-2',
      type: 'script-match',
      audioText: 'ขอบคุณ',
      audioLang: 'th-TH',
      tiles: [
        { id: 'th-aq-2-a', text: 'Terima kasih', isCorrect: true },
        { id: 'th-aq-2-b', text: 'Halo', isCorrect: false },
        { id: 'th-aq-2-c', text: 'Maaf', isCorrect: false },
        { id: 'th-aq-2-d', text: 'Ya', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Khob khun" (ขอบคุณ) berarti "terima kasih" dalam bahasa Thai. Ditambah "krap/kha" untuk sopan.',
    },
    {
      id: 'th-aq-3',
      type: 'syllable-count',
      audioText: 'Sawasdee',
      audioLang: 'th-TH',
      tiles: [
        { id: 'th-aq-3-a', text: '3', isCorrect: true },
        { id: 'th-aq-3-b', text: '2', isCorrect: false },
        { id: 'th-aq-3-c', text: '4', isCorrect: false },
        { id: 'th-aq-3-d', text: '5', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Sa-was-dee memiliki 3 suku kata. Ini adalah kata salam sekaligus selamat tinggal di Thailand.',
    },
  ],
  buildChallenges: [
    {
      id: 'th-bc-1',
      type: 'sentence-order',
      audioText: 'Phom rian phasa thai',
      audioLang: 'th-TH',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Thai'],
      distractors: ['makan', 'jalan'],
      hint1Target: 2,
    },
    {
      id: 'th-bc-2',
      type: 'translation-build',
      audioText: 'Yin dee tee dai roo jak',
      audioLang: 'th-TH',
      correctOrder: ['Senang', 'berkenalan', 'dengan', 'Anda'],
      distractors: ['pergi', 'tidur'],
      hint1Target: 1,
    },
  ],
};

export default content;
