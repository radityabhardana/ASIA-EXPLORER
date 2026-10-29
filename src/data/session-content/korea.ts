import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'korea',
  audioQuests: [
    {
      id: 'kr-aq-1',
      type: 'hear-identify',
      audioText: 'Annyeonghaseyo',
      audioLang: 'ko-KR',
      tiles: [
        { id: 'kr-aq-1-a', text: 'Annyeonghaseyo', isCorrect: true },
        { id: 'kr-aq-1-b', text: 'Konnichiwa', isCorrect: false },
        { id: 'kr-aq-1-c', text: 'Ni hao', isCorrect: false },
        { id: 'kr-aq-1-d', text: 'Sawasdee', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Annyeonghaseyo (안녕하세요) adalah salam formal dalam bahasa Korea, digunakan kapan saja.',
    },
    {
      id: 'kr-aq-2',
      type: 'script-match',
      audioText: '감사합니다',
      audioLang: 'ko-KR',
      tiles: [
        { id: 'kr-aq-2-a', text: 'Terima kasih', isCorrect: true },
        { id: 'kr-aq-2-b', text: 'Selamat pagi', isCorrect: false },
        { id: 'kr-aq-2-c', text: 'Permisi', isCorrect: false },
        { id: 'kr-aq-2-d', text: 'Sampai jumpa', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Gamsahamnida" (감사합니다) berarti "terima kasih" dalam bahasa Korea, bentuk yang sangat sopan.',
    },
    {
      id: 'kr-aq-3',
      type: 'syllable-count',
      audioText: 'Annyeong',
      audioLang: 'ko-KR',
      tiles: [
        { id: 'kr-aq-3-a', text: '3', isCorrect: true },
        { id: 'kr-aq-3-b', text: '2', isCorrect: false },
        { id: 'kr-aq-3-c', text: '4', isCorrect: false },
        { id: 'kr-aq-3-d', text: '1', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'An-nye-ong memiliki 3 suku kata. "Annyeong" adalah salam santai kepada teman di Korea.',
    },
  ],
  buildChallenges: [
    {
      id: 'kr-bc-1',
      type: 'sentence-order',
      audioText: 'Jeoneun hangugeo reul baewoyo',
      audioLang: 'ko-KR',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Korea'],
      distractors: ['pergi', 'minum'],
      hint1Target: 2,
    },
    {
      id: 'kr-bc-2',
      type: 'translation-build',
      audioText: 'Mannaseo bangapseumnida',
      audioLang: 'ko-KR',
      correctOrder: ['Senang', 'bertemu', 'dengan', 'Anda'],
      distractors: ['pergi', 'makan'],
      hint1Target: 1,
    },
  ],
};

export default content;
