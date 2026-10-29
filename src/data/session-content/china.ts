import type { SessionContent } from '@/lib/storage/types';

const content: SessionContent = {
  countryId: 'china',
  audioQuests: [
    {
      id: 'cn-aq-1',
      type: 'hear-identify',
      audioText: 'Ni hao',
      audioLang: 'zh-CN',
      tiles: [
        { id: 'cn-aq-1-a', text: 'Ni hao', isCorrect: true },
        { id: 'cn-aq-1-b', text: 'Konnichiwa', isCorrect: false },
        { id: 'cn-aq-1-c', text: 'Annyeonghaseyo', isCorrect: false },
        { id: 'cn-aq-1-d', text: 'Xin chào', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Nǐ hǎo" (你好) adalah salam paling umum dalam bahasa Mandarin, secara harfiah berarti "kamu baik".',
    },
    {
      id: 'cn-aq-2',
      type: 'script-match',
      audioText: '谢谢',
      audioLang: 'zh-CN',
      tiles: [
        { id: 'cn-aq-2-a', text: 'Terima kasih', isCorrect: true },
        { id: 'cn-aq-2-b', text: 'Halo', isCorrect: false },
        { id: 'cn-aq-2-c', text: 'Maaf', isCorrect: false },
        { id: 'cn-aq-2-d', text: 'Tolong', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: '"Xièxiè" (谢谢) berarti "terima kasih" dalam bahasa Mandarin. Karakter 谢 berarti "berterima kasih".',
    },
    {
      id: 'cn-aq-3',
      type: 'syllable-count',
      audioText: 'Zaijian',
      audioLang: 'zh-CN',
      tiles: [
        { id: 'cn-aq-3-a', text: '3', isCorrect: true },
        { id: 'cn-aq-3-b', text: '2', isCorrect: false },
        { id: 'cn-aq-3-c', text: '4', isCorrect: false },
        { id: 'cn-aq-3-d', text: '1', isCorrect: false },
      ],
      correctIndex: 0,
      feedback: 'Zài-jiàn (再见) memiliki 3 suku kata. Artinya "sampai jumpa lagi" — 再 berarti "lagi", 见 berarti "bertemu".',
    },
  ],
  buildChallenges: [
    {
      id: 'cn-bc-1',
      type: 'sentence-order',
      audioText: 'Wǒ xué zhōngwén',
      audioLang: 'zh-CN',
      correctOrder: ['Saya', 'belajar', 'bahasa', 'Mandarin'],
      distractors: ['makan', 'berlari'],
      hint1Target: 2,
    },
    {
      id: 'cn-bc-2',
      type: 'translation-build',
      audioText: 'Hěn gāoxìng rènshí nǐ',
      audioLang: 'zh-CN',
      correctOrder: ['Senang', 'berkenalan', 'dengan', 'Anda'],
      distractors: ['pergi', 'tidur'],
      hint1Target: 1,
    },
  ],
};

export default content;
