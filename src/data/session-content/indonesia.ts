import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'indonesia',
  audioQuests: [
    {
      id: 'id-aq-1',
      type: 'hear-identify',
      audioText: 'Selamat pagi',
      audioLang: 'id-ID',
      tiles: [
        { id: 'id-aq-1-a', text: 'Selamat pagi', isCorrect: true },
        { id: 'id-aq-1-b', text: 'Selamat malam', isCorrect: false },
        { id: 'id-aq-1-c', text: 'Selamat siang', isCorrect: false },
        { id: 'id-aq-1-d', text: 'Selamat sore', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Selamat pagi" digunakan sebagai sapaan di pagi hari, dari subuh hingga sekitar pukul 11 siang.',
    },
    {
      id: 'id-aq-2',
      type: 'language-detect',
      audioText: 'Terima kasih',
      audioLang: 'id-ID',
      tiles: [
        { id: 'id-aq-2-a', text: 'Bahasa Indonesia', isCorrect: true },
        { id: 'id-aq-2-b', text: 'Bahasa Melayu', isCorrect: false },
        { id: 'id-aq-2-c', text: 'Bahasa Tagalog', isCorrect: false },
        { id: 'id-aq-2-d', text: 'Bahasa Thai', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Terima kasih" adalah ungkapan terima kasih dalam bahasa Indonesia, berasal dari bahasa Sanskerta.',
    },
    {
      id: 'id-aq-3',
      type: 'syllable-count',
      audioText: 'Sampai jumpa',
      audioLang: 'id-ID',
      tiles: [
        { id: 'id-aq-3-a', text: '5', isCorrect: true },
        { id: 'id-aq-3-b', text: '4', isCorrect: false },
        { id: 'id-aq-3-c', text: '3', isCorrect: false },
        { id: 'id-aq-3-d', text: '6', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Sam-pai jum-pa memiliki 5 suku kata. Artinya "selamat tinggal" atau "sampai bertemu lagi".',
    },
  ],
  buildChallenges: [
    {
      id: 'id-bc-1',
      type: 'sentence-order',
      audioText: 'Nama saya adalah Budi',
      audioLang: 'id-ID',
      correctOrder: ['Nama', 'saya', 'adalah', 'Budi'],
      distractors: ['pergi', 'makan'],
      hint1Target: 2,
    },
    {
      id: 'id-bc-2',
      type: 'translation-build',
      audioText: 'Apa kabar',
      audioLang: 'id-ID',
      correctOrder: ['Bagaimana', 'kabar', 'Anda'],
      distractors: ['minum', 'tidur'],
      hint1Target: 1,
    },
  ],
};

export default content;
