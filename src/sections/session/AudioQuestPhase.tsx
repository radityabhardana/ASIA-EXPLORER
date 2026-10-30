import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { speak } from '@/lib/speech';
import type { AudioChallenge } from '@/lib/storage/types';
import AudioTile from './AudioTile';

interface AudioQuestPhaseProps {
  challenge: AudioChallenge;
  challengeNumber: number;
  totalChallenges: number;
  onAnswer: (correct: boolean, elapsedMs: number) => void;
}

const TYPE_LABELS: Record<AudioChallenge['type'], string> = {
  'hear-identify': 'Apa yang kamu dengar?',
  'script-match': 'Pilih tulisan yang tepat',
  'language-detect': 'Bahasa apa ini?',
  'syllable-count': 'Berapa suku kata?',
};

/** Ascending or descending tone via Web Audio API */
function playTone(freq1: number, freq2: number, durationMs: number) {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    const now = ctx.currentTime;
    const durSec = durationMs / 1000;

    osc.frequency.setValueAtTime(freq1, now);
    osc.frequency.exponentialRampToValueAtTime(freq2, now + durSec);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + durSec);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + durSec + 0.01);

    setTimeout(() => {
      try { ctx.close(); } catch { /* ignore */ }
    }, durationMs + 100);
  } catch {
    // AudioContext may fail in test environments — ignore
  }
}

export default function AudioQuestPhase({
  challenge,
  challengeNumber,
  totalChallenges,
  onAnswer,
}: AudioQuestPhaseProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [tilesUnlocked, setTilesUnlocked] = useState(false);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tileStates, setTileStates] = useState<Record<string, 'idle' | 'correct' | 'wrong'>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const startedAt = useRef(Date.now());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state on challenge change
  useEffect(() => {
    setIsPlaying(true);
    setTilesUnlocked(false);
    setUnlockedCount(0);
    setSelectedId(null);
    setTileStates({});
    setSubmitted(false);
    setShowFeedback(false);
    startedAt.current = Date.now();

    // Play audio on mount
    speak(challenge.audioText, {
      lang: challenge.audioLang,
      rate: 0.88,
      onEnd: () => {
        setIsPlaying(false);
        setTilesUnlocked(true);
      },
      onError: () => {
        setIsPlaying(false);
        setTilesUnlocked(true);
      },
    });

    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  // Staggered tile unlock
  useEffect(() => {
    if (!tilesUnlocked) return;
    challenge.tiles.forEach((_, i) => {
      setTimeout(() => {
        setUnlockedCount((n) => Math.max(n, i + 1));
      }, i * 80);
    });
  }, [tilesUnlocked, challenge.tiles]);

  const handleReplay = useCallback(() => {
    setIsPlaying(true);
    speak(challenge.audioText, {
      lang: challenge.audioLang,
      rate: 0.88,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }, [challenge.audioText, challenge.audioLang]);

  const handleSelect = useCallback(
    (tileId: string) => {
      if (submitted) return;
      const tile = challenge.tiles.find((t) => t.id === tileId);
      if (!tile) return;

      setSelectedId(tileId);
      setSubmitted(true);

      const isCorrect = tile.isCorrect;
      const elapsed = Date.now() - startedAt.current;

      setTileStates({ [tileId]: isCorrect ? 'correct' : 'wrong' });

      // Audio feedback
      if (isCorrect) {
        playTone(440, 660, 200);
      } else {
        playTone(660, 440, 300);
        // Also show the correct tile after a beat
        setTimeout(() => {
          const correctTile = challenge.tiles.find((t) => t.isCorrect);
          if (correctTile) {
            setTileStates({ [tileId]: 'wrong', [correctTile.id]: 'correct' });
          }
        }, 500);
      }

      setShowFeedback(true);

      advanceTimer.current = setTimeout(() => {
        onAnswer(isCorrect, elapsed);
      }, 1400);
    },
    [submitted, challenge.tiles, onAnswer],
  );

  return (
    <div className="audio-quest-phase">
      <div className="audio-quest-phase__inner">
        {/* Meta Header */}
        <div className="audio-quest-phase__meta">
          <div className="audio-quest-phase__eyebrow">
            <span className="audio-quest-phase__counter">
              Tantangan {String(challengeNumber).padStart(2, '0')} / {String(totalChallenges).padStart(2, '0')}
            </span>
            <span className="audio-quest-phase__seal-badge" aria-hidden="true">
              ARSIP SUARA • ASIA
            </span>
          </div>
          <h2 className="audio-quest-phase__type-label">{TYPE_LABELS[challenge.type]}</h2>
          <p className="audio-quest-phase__subtext">Dengarkan rekaman audio, lalu tentukan pilihan yang tepat.</p>
        </div>

        {/* Audio zone */}
        <div
          className="audio-quest-phase__audio-zone"
          onClick={() => {
            if (!isPlaying) handleReplay();
          }}
          title={isPlaying ? 'Sedang memutar audio...' : 'Klik untuk putar ulang audio'}
        >
          <div className="audio-quest-phase__audio-top" aria-hidden="true">
            <div className={`audio-quest-phase__mic-dot${isPlaying ? ' active' : ''}`} />
            <span className="audio-quest-phase__audio-label">
              {isPlaying ? 'Memutar Audio...' : 'Audio Siap Didengarkan'}
            </span>
          </div>

          <div className={`audio-waveform${!isPlaying ? ' audio-waveform--paused' : ''}`} aria-hidden="true">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="audio-waveform__bar" />
            ))}
          </div>

          <button
            type="button"
            className="audio-quest-phase__replay-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleReplay();
            }}
            aria-label="Putar ulang audio"
          >
            <RotateCcw size={13} aria-hidden="true" />
            <span>Putar Ulang</span>
          </button>
        </div>

        {/* Tiles */}
        <div className="audio-tile-grid" role="group" aria-label="Pilih jawaban">
          {challenge.tiles.map((tile, i) => (
            <AudioTile
              key={tile.id}
              id={tile.id}
              text={tile.text}
              index={i}
              locked={i >= unlockedCount}
              selected={selectedId === tile.id}
              state={tileStates[tile.id] ?? 'idle'}
              onSelect={() => handleSelect(tile.id)}
            />
          ))}
        </div>

        {/* Feedback */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              className="audio-quest-phase__feedback"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              role="status"
              aria-live="polite"
            >
              <div className="audio-quest-phase__feedback-label">CATATAN LAPANGAN:</div>
              <p className="audio-quest-phase__feedback-text">{challenge.feedback}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
