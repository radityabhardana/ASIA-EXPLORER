import { useState } from 'react';
import { XP_REWARDS } from '@/lib/xp';

interface WordOfDayWidgetProps {
  onEarnXP?: (amount: number) => void;
}

const WORDS = [
  { word: 'こんにちは', romanization: 'Konnichiwa', meaning: 'Halo', country: 'Jepang', lang: 'ja' },
  { word: '안녕하세요', romanization: 'Annyeonghaseyo', meaning: 'Halo', country: 'Korea', lang: 'ko' },
  { word: 'ありがとう', romanization: 'Arigatou', meaning: 'Terima kasih', country: 'Jepang', lang: 'ja' },
  { word: '谢谢', romanization: 'Xièxiè', meaning: 'Terima kasih', country: 'China', lang: 'zh' },
  { word: 'สวัสดี', romanization: 'Sawasdee', meaning: 'Halo', country: 'Thailand', lang: 'th' },
  { word: 'شكراً', romanization: 'Shukran', meaning: 'Terima kasih', country: 'Arab Saudi', lang: 'ar' },
  { word: 'नमस्ते', romanization: 'Namaste', meaning: 'Halo', country: 'India', lang: 'hi' },
  { word: 'Salamat', romanization: 'Salamat', meaning: 'Terima kasih', country: 'Filipina', lang: 'fil' },
  { word: 'Xin chào', romanization: 'Sin Chao', meaning: 'Halo', country: 'Vietnam', lang: 'vi' },
  { word: 'Terima kasih', romanization: 'Terima kasih', meaning: 'Terima kasih', country: 'Indonesia', lang: 'id' },
  { word: 'ສະບາຍດີ', romanization: 'Sabaidee', meaning: 'Halo', country: 'Laos', lang: 'lo' },
  { word: 'ขอบคุณ', romanization: 'Khob khun', meaning: 'Terima kasih', country: 'Thailand', lang: 'th' },
  { word: 'Matur nuwun', romanization: 'Matur nuwun', meaning: 'Terima kasih (Jawa)', country: 'Indonesia', lang: 'jv' },
  { word: 'رحمت', romanization: 'Rahmat', meaning: 'Terima kasih', country: 'Uzbekistan', lang: 'uz' },
  { word: 'Баярлалаа', romanization: 'Bayarlalaa', meaning: 'Terima kasih', country: 'Mongolia', lang: 'mn' },
] as const;

function getTodayDateStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export default function WordOfDayWidget({ onEarnXP }: WordOfDayWidgetProps) {
  const todayIndex = new Date().getDate() % WORDS.length;
  const entry = WORDS[todayIndex]!;
  const dateStr = getTodayDateStr();
  const claimKey = `wod_claimed_${dateStr}`;

  const [claimed, setClaimed] = useState(() => !!localStorage.getItem(claimKey));

  function handleSpeak() {
    if (!window.speechSynthesis) return;
    const utt = new SpeechSynthesisUtterance(entry.word);
    utt.lang = entry.lang;
    window.speechSynthesis.speak(utt);
  }

  function handleClaim() {
    if (claimed) return;
    localStorage.setItem(claimKey, '1');
    setClaimed(true);
    onEarnXP?.(XP_REWARDS.wordOfDay);
  }

  return (
    <div className="wod-card" style={{
      background: '#0f172a',
      border: '1.5px solid #d97706',
      borderRadius: 12,
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          📖 Kata Hari Ini
        </span>
        <span style={{
          background: '#1e293b',
          color: '#94a3b8',
          fontSize: 11,
          padding: '2px 8px',
          borderRadius: 999,
        }}>
          {entry.country}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 36, color: '#f1f5f9', fontWeight: 700, lineHeight: 1.2 }}>
          {entry.word}
        </span>
        <button
          onClick={handleSpeak}
          style={{
            background: '#1e293b',
            border: 'none',
            borderRadius: 8,
            color: '#94a3b8',
            fontSize: 18,
            padding: '6px 10px',
            cursor: 'pointer',
            transition: 'color 0.15s',
          }}
          aria-label="Dengarkan pengucapan"
          title="Dengarkan"
          type="button"
        >
          🔊
        </button>
      </div>

      <div style={{ color: '#94a3b8', fontSize: 14 }}>
        <span style={{ color: '#fde68a' }}>{entry.romanization}</span>
        {' · '}
        {entry.meaning}
      </div>

      <button
        onClick={handleClaim}
        disabled={claimed}
        type="button"
        style={{
          marginTop: 4,
          alignSelf: 'flex-start',
          background: claimed ? '#1e293b' : '#d97706',
          color: claimed ? '#64748b' : '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          fontSize: 13,
          fontWeight: 600,
          cursor: claimed ? 'default' : 'pointer',
          transition: 'background 0.15s',
        }}
      >
        {claimed ? '✅ XP Diklaim' : `Klaim +${XP_REWARDS.wordOfDay} XP`}
      </button>
    </div>
  );
}
