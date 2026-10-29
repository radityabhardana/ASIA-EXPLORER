import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'malaysia',
  audioQuests: [
    {
      id: 'my-aq-1',
      type: 'hear-identify',
      audioText: 'Selamat datang',
      audioLang: 'ms-MY',
      tiles: [
        { id: 'my-aq-1-a', text: 'Selamat datang', isCorrect: true },
        { id: 'my-aq-1-b', text: 'Selamat pagi', isCorrect: false },
        { id: 'my-aq-1-c', text: 'Terima kasih', isCorrect: false },
        { id: 'my-aq-1-d', text: 'Sampai jumpa', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Selamat datang" berarti "selamat datang" dalam bahasa Melayu Malaysia, sangat mirip dengan bahasa Indonesia.',
    },
    {
      id: 'my-aq-2',
      type: 'language-detect',
      audioText: 'Apa khabar',
      audioLang: 'ms-MY',
      tiles: [
        { id: 'my-aq-2-a', text: 'Bahasa Melayu', isCorrect: true },
        { id: 'my-aq-2-b', text: 'Bahasa Indonesia', isCorrect: false },
        { id: 'my-aq-2-c', text: 'Bahasa Tagalog', isCorrect: false },
        { id: 'my-aq-2-d', text: 'Bahasa Thai', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Apa khabar" adalah "apa kabar" dalam bahasa Melayu Malaysia. Ejaan "khabar" berasal dari bahasa Arab.',
    },
    {
      id: 'my-aq-3',
      type: 'syllable-count',
      audioText: 'Terima kasih',
      audioLang: 'ms-MY',
      tiles: [
        { id: 'my-aq-3-a', text: '5', isCorrect: true },
        { id: 'my-aq-3-b', text: '4', isCorrect: false },
        { id: 'my-aq-3-c', text: '3', isCorrect: false },
        { id: 'my-aq-3-d', text: '6', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Te-ri-ma ka-sih memiliki 5 suku kata. Ungkapan yang sama juga digunakan dalam bahasa Indonesia.',
    },
  ],
  buildChallenges: [
    {
      id: 'my-bc-1',
      type: 'sentence-order',
      audioText: 'Saya belajar bahasa Melayu',
      audioLang: 'ms-MY',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Melayu'],
      distractors: ['tidur', 'makan'],
      hint1Target: 3,
    },
    {
      id: 'my-bc-2',
      type: 'translation-build',
      audioText: 'Gembira bertemu dengan awak',
      audioLang: 'ms-MY',
      correctOrder: ['Senang', 'bertemu', 'dengan', 'kamu'],
      distractors: ['pergi', 'berlari'],
      hint1Target: 1,
    },
  ],
};

export default content;
