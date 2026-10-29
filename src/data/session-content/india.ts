import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'india',
  audioQuests: [
    {
      id: 'in-aq-1',
      type: 'hear-identify',
      audioText: 'Namaste',
      audioLang: 'hi-IN',
      tiles: [
        { id: 'in-aq-1-a', text: 'Namaste', isCorrect: true },
        { id: 'in-aq-1-b', text: 'Sawasdee', isCorrect: false },
        { id: 'in-aq-1-c', text: 'Merhaba', isCorrect: false },
        { id: 'in-aq-1-d', text: 'Kamusta', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Namaste" (नमस्ते) adalah salam universal dalam bahasa Hindi, berarti "aku membungkuk kepadamu" dari bahasa Sanskerta.',
    },
    {
      id: 'in-aq-2',
      type: 'script-match',
      audioText: 'धन्यवाद',
      audioLang: 'hi-IN',
      tiles: [
        { id: 'in-aq-2-a', text: 'Terima kasih', isCorrect: true },
        { id: 'in-aq-2-b', text: 'Selamat pagi', isCorrect: false },
        { id: 'in-aq-2-c', text: 'Permisi', isCorrect: false },
        { id: 'in-aq-2-d', text: 'Tolong', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Dhanyavaad" (धन्यवाद) berarti "terima kasih" dalam bahasa Hindi, ditulis dalam aksara Devanagari.',
    },
    {
      id: 'in-aq-3',
      type: 'syllable-count',
      audioText: 'Namaste',
      audioLang: 'hi-IN',
      tiles: [
        { id: 'in-aq-3-a', text: '3', isCorrect: true },
        { id: 'in-aq-3-b', text: '2', isCorrect: false },
        { id: 'in-aq-3-c', text: '4', isCorrect: false },
        { id: 'in-aq-3-d', text: '5', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Na-mas-te memiliki 3 suku kata. Salam ini disertai gerakan tangan "anjali mudra" menyatukan kedua telapak tangan.',
    },
  ],
  buildChallenges: [
    {
      id: 'in-bc-1',
      type: 'sentence-order',
      audioText: 'Main Hindi seekh raha hoon',
      audioLang: 'hi-IN',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Hindi'],
      distractors: ['makan', 'tidur'],
      hint1Target: 2,
    },
    {
      id: 'in-bc-2',
      type: 'translation-build',
      audioText: 'Aapse milkar khushi hui',
      audioLang: 'hi-IN',
      correctOrder: ['Senang', 'bertemu', 'dengan', 'Anda'],
      distractors: ['pergi', 'minum'],
      hint1Target: 1,
    },
  ],
};

export default content;
