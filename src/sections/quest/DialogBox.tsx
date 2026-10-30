import { useState, useEffect, useRef, useCallback } from 'react';
import { FastForward, Volume2 } from 'lucide-react';
import { speak } from '@/lib/speech';

interface DialogBoxProps {
  narration: string;
  speaker: string;
  dialogText: string;
  onTypingComplete?: () => void;
  audioLang?: string;
}

export default function DialogBox({
  narration,
  speaker,
  dialogText,
  onTypingComplete,
  audioLang = 'id-ID',
}: DialogBoxProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Skip typewriter effect instantly
  const skipTypewriter = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayedText(dialogText);
    setIsTyping(false);
    onTypingComplete?.();
  }, [dialogText, onTypingComplete]);

  // Restart typewriter whenever dialogText changes
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setDisplayedText('');
    setIsTyping(true);

    let charIndex = 0;
    const speed = 20; // 20ms per character

    const step = () => {
      charIndex++;
      setDisplayedText(dialogText.slice(0, charIndex));

      if (charIndex < dialogText.length) {
        timerRef.current = setTimeout(step, speed);
      } else {
        setIsTyping(false);
        onTypingComplete?.();
      }
    };

    timerRef.current = setTimeout(step, speed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [dialogText, onTypingComplete]);

  // Keyboard shortcut: Space or Enter skips typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === 'Enter') && isTyping) {
        // Only preventDefault if not focused on an interactive input
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag !== 'BUTTON' && tag !== 'INPUT') {
          e.preventDefault();
          skipTypewriter();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTyping, skipTypewriter]);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speak(dialogText, { lang: audioLang, rate: 0.9 });
  };

  return (
    <div
      className="sq-dialog-box"
      onClick={isTyping ? skipTypewriter : undefined}
      role="region"
      aria-live="polite"
      aria-label={`Percakapan: ${speaker}`}
    >
      {/* Narasi Adegan */}
      {narration && (
        <div className="sq-dialog-box__narration">
          <p className="sq-dialog-box__narration-text">{narration}</p>
        </div>
      )}

      {/* Kotak Dialog Utama */}
      <div className="sq-dialog-box__speech-bubble">
        <div className="sq-dialog-box__speaker-row">
          <span className="sq-dialog-box__speaker-tag">{speaker}</span>
          <button
            type="button"
            className="sq-dialog-box__audio-btn"
            onClick={handleSpeak}
            title="Dengarkan pengucapan dialog"
            aria-label="Dengarkan pengucapan dialog"
          >
            <Volume2 size={13} aria-hidden="true" />
            <span>Dengarkan</span>
          </button>
        </div>

        <div className="sq-dialog-box__body">
          <p className="sq-dialog-box__quote">
            “{displayedText}”
            {isTyping && <span className="sq-dialog-cursor" aria-hidden="true" />}
          </p>
        </div>

        <div className="sq-dialog-box__footer">
          {isTyping ? (
            <button
              type="button"
              className="sq-dialog-box__skip-hint"
              onClick={skipTypewriter}
              aria-label="Lewati animasi teks"
            >
              <FastForward size={11} aria-hidden="true" />
              <span>Ketuk atau tekan Spasi untuk lewati teks</span>
            </button>
          ) : (
            <span className="sq-dialog-box__ready-hint">Pilih tindakanmu di bawah:</span>
          )}
        </div>
      </div>
    </div>
  );
}
