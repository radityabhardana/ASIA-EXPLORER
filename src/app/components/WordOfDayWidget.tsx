import { useState } from 'react';
import { BookOpen, Volume2, Sparkles, Check } from 'lucide-react';
import { XP_REWARDS } from '@/lib/xp';
import { speak, isSpeechSupported } from '@/lib/speech';

interface WordOfDayWidgetProps {
  onEarnXP?: (amount: number) => void;
}

const WORDS = [
  { word: 'こんにちは', romanization: 'Konnichiwa', meaning: 'Halo', country: 'Jepang', lang: 'ja-JP' },
  { word: '안녕하세요', romanization: 'Annyeonghaseyo', meaning: 'Halo', country: 'Korea', lang: 'ko-KR' },
  { word: 'ありがとう', romanization: 'Arigatou', meaning: 'Terima kasih', country: 'Jepang', lang: 'ja-JP' },
  { word: '谢谢', romanization: 'Xièxiè', meaning: 'Terima kasih', country: 'China', lang: 'zh-CN' },
  { word: 'สวัสดี', romanization: 'Sawasdee', meaning: 'Halo', country: 'Thailand', lang: 'th-TH' },
  { word: 'شكراً', romanization: 'Shukran', meaning: 'Terima kasih', country: 'Arab Saudi', lang: 'ar-SA' },
  { word: 'नमस्ते', romanization: 'Namaste', meaning: 'Halo', country: 'India', lang: 'hi-IN' },
  { word: 'Salamat', romanization: 'Salamat', meaning: 'Terima kasih', country: 'Filipina', lang: 'fil-PH' },
  { word: 'Xin chào', romanization: 'Sin Chao', meaning: 'Halo', country: 'Vietnam', lang: 'vi-VN' },
  { word: 'Terima kasih', romanization: 'Terima kasih', meaning: 'Terima kasih', country: 'Indonesia', lang: 'id-ID' },
  { word: 'ສະບາຍດີ', romanization: 'Sabaidee', meaning: 'Halo', country: 'Laos', lang: 'lo-LA' },
  { word: 'ขอบคุณ', romanization: 'Khob khun', meaning: 'Terima kasih', country: 'Thailand', lang: 'th-TH' },
  { word: 'Matur nuwun', romanization: 'Matur nuwun', meaning: 'Terima kasih (Jawa)', country: 'Indonesia', lang: 'jv-ID' },
  { word: 'رحمت', romanization: 'Rahmat', meaning: 'Terima kasih', country: 'Uzbekistan', lang: 'uz-UZ' },
  { word: 'Баярлалаа', romanization: 'Bayarlalaa', meaning: 'Terima kasih', country: 'Mongolia', lang: 'mn-MN' },
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

  const [claimed, setClaimed] = useState(() => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem(claimKey);
  });
  const [speaking, setSpeaking] = useState(false);

  function handleSpeak() {
    if (!isSpeechSupported() || speaking) return;
    setSpeaking(true);
    speak(entry.word, {
      lang: entry.lang,
      fallbackText: entry.romanization,
      rate: 0.9,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }

  function handleClaim() {
    if (claimed) return;
    localStorage.setItem(claimKey, '1');
    setClaimed(true);
    onEarnXP?.(XP_REWARDS.wordOfDay);
  }

  return (
    <div className="dashboard-console-card wod-widget">
      {/* Console Top Header */}
      <div className="dashboard-console-card__header">
        <div className="dashboard-console-card__title-wrap">
          <BookOpen size={15} className="dashboard-console-card__icon" aria-hidden="true" />
          <span className="dashboard-console-card__title">Kata Hari Ini</span>
        </div>
        <span className="dashboard-console-card__badge">{entry.country}</span>
      </div>

      {/* Script & Pronunciation */}
      <div className="wod-widget__content">
        <div className="wod-widget__main-row">
          <span className="wod-widget__native" lang={entry.lang.split('-')[0]}>
            {entry.word}
          </span>
          <button
            type="button"
            onClick={handleSpeak}
            className={`dashboard-btn-icon ${speaking ? 'dashboard-btn-icon--active' : ''}`}
            aria-label={`Dengarkan pengucapan kata ${entry.word}`}
            title="Dengarkan pengucapan"
          >
            <Volume2 size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="wod-widget__meta">
          <span className="wod-widget__roman">{entry.romanization}</span>
          <span className="wod-widget__separator">·</span>
          <span className="wod-widget__meaning">{entry.meaning}</span>
        </div>
      </div>

      {/* Action Claim */}
      <div className="wod-widget__footer">
        <button
          type="button"
          onClick={handleClaim}
          disabled={claimed}
          className={`dashboard-btn ${claimed ? 'dashboard-btn--claimed' : 'dashboard-btn--accent'}`}
        >
          {claimed ? (
            <>
              <Check size={14} strokeWidth={2.5} />
              <span>XP Diklaim</span>
            </>
          ) : (
            <>
              <Sparkles size={14} strokeWidth={2} />
              <span>Klaim +{XP_REWARDS.wordOfDay} XP</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
