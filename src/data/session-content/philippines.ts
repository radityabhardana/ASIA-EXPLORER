import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'philippines',
  audioQuests: [
    {
      id: 'ph-aq-1',
      type: 'hear-identify',
      audioText: 'Kamusta ka',
      audioLang: 'fil-PH',
      tiles: [
        { id: 'ph-aq-1-a', text: 'Kamusta ka', isCorrect: true },
        { id: 'ph-aq-1-b', text: 'Sawasdee', isCorrect: false },
        { id: 'ph-aq-1-c', text: 'Xin chào', isCorrect: false },
        { id: 'ph-aq-1-d', text: 'Apa khabar', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Kamusta ka" berarti "apa kabar" dalam bahasa Filipino/Tagalog, dipengaruhi bahasa Spanyol "¿Cómo estás?".',
    },
    {
      id: 'ph-aq-2',
      type: 'script-match',
      audioText: 'Salamat',
      audioLang: 'fil-PH',
      tiles: [
        { id: 'ph-aq-2-a', text: 'Terima kasih', isCorrect: true },
        { id: 'ph-aq-2-b', text: 'Selamat pagi', isCorrect: false },
        { id: 'ph-aq-2-c', text: 'Maaf', isCorrect: false },
        { id: 'ph-aq-2-d', text: 'Sampai jumpa', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Salamat" berarti "terima kasih" dalam bahasa Tagalog. Kata ini kemungkinan berasal dari bahasa Arab "salāmat".',
    },
    {
      id: 'ph-aq-3',
      type: 'syllable-count',
      audioText: 'Magandang umaga',
      audioLang: 'fil-PH',
      tiles: [
        { id: 'ph-aq-3-a', text: '6', isCorrect: true },
        { id: 'ph-aq-3-b', text: '5', isCorrect: false },
        { id: 'ph-aq-3-c', text: '7', isCorrect: false },
        { id: 'ph-aq-3-d', text: '4', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Ma-gan-dang u-ma-ga memiliki 6 suku kata. Artinya "selamat pagi" atau secara harfiah "pagi yang indah".',
    },
  ],
  buildChallenges: [
    {
      id: 'ph-bc-1',
      type: 'sentence-order',
      audioText: 'Natututo ako ng Filipino',
      audioLang: 'fil-PH',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Filipino'],
      distractors: ['makan', 'pergi'],
      hint1Target: 2,
    },
    {
      id: 'ph-bc-2',
      type: 'translation-build',
      audioText: 'Ikinagagalak kitang makilala',
      audioLang: 'fil-PH',
      correctOrder: ['Senang', 'berkenalan', 'dengan', 'Anda'],
      distractors: ['berlari', 'tidur'],
      hint1Target: 1,
    },
  ],
};

export default content;
