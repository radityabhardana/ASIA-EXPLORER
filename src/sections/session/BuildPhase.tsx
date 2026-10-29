import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { speak } from '@/lib/speech';
import type { BuildChallenge } from '@/lib/storage/types';
import WordTile from './WordTile';

interface BuildPhaseProps {
  challenge: BuildChallenge;
  challengeNumber: number;
  totalChallenges: number;
  onAnswer: (correct: boolean, hintsUsed: number, elapsedMs: number) => void;
}

interface Word {
  id: string;
  text: string;
}

type TileState = 'idle' | 'correct' | 'wrong' | 'hint';

function shuffleArray<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]] as [T, T];
  }
  return out;
}

const MAX_HINTS = 2;

export default function BuildPhase({
  challenge,
  challengeNumber,
  totalChallenges,
  onAnswer,
}: BuildPhaseProps) {
  const isMobile = useRef(
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  ).current;

  const trayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const startedAt = useRef(Date.now());
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bank, setBank] = useState<Word[]>([]);
  const [tray, setTray] = useState<(Word | null)[]>([]);
  const [tileStates, setTileStates] = useState<Record<string, TileState>>({});
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  // Init on challenge change
  useEffect(() => {
    const words = shuffleArray([
      ...challenge.correctOrder.map((text, i) => ({ id: `word-correct-${i}`, text })),
      ...challenge.distractors.map((text, i) => ({ id: `word-distractor-${i}`, text })),
    ]);
    setBank(words);
    setTray(Array<null>(challenge.correctOrder.length).fill(null));
    setTileStates({});
    setHintsUsed(0);
    setSubmitted(false);
    startedAt.current = Date.now();

    // Auto-play audio
    speak(challenge.audioText, { lang: challenge.audioLang, rate: 0.88 });

    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  const handleReplay = () => {
    speak(challenge.audioText, { lang: challenge.audioLang, rate: 0.88 });
  };

  // Move word from bank → first empty tray slot
  const bankToTray = useCallback(
    (word: Word) => {
      setTray((prev) => {
        const firstEmpty = prev.findIndex((slot) => slot === null);
        if (firstEmpty === -1) return prev;
        const next = [...prev];
        next[firstEmpty] = word;
        return next;
      });
      setBank((prev) => prev.filter((w) => w.id !== word.id));
    },
    [],
  );

  // Move word from tray → bank
  const trayToBank = useCallback((word: Word, slotIndex: number) => {
    setTray((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
    setBank((prev) => [...prev, word]);
  }, []);

  // Desktop drag end — detect if over tray
  const handleDragEnd = useCallback(
    (word: Word, _info: { offset: { x: number; y: number } }, fromZone: 'bank' | 'tray', slotIndex?: number) => {
      const trayEl = trayRef.current;
      if (!trayEl) return;

      // We can't use pointer position from offset alone easily — use getBoundingClientRect + mouse position
      // Framer provides point from event via info.point but our WordTile only passes offset.
      // Alternative: just use tap for desktop too when drag ends near origin; rely on tap for simplicity.
      // On desktop we allow tap (keyboard) to also move tiles, same as mobile.
      if (fromZone === 'bank') {
        bankToTray(word);
      } else if (fromZone === 'tray' && slotIndex !== undefined) {
        trayToBank(word, slotIndex);
      }
    },
    [bankToTray, trayToBank],
  );

  const allFilled = tray.every((slot) => slot !== null);

  const handleCheck = () => {
    if (!allFilled || submitted) return;
    const elapsed = Date.now() - startedAt.current;

    const states: Record<string, TileState> = {};
    let allCorrect = true;

    tray.forEach((word, i) => {
      if (!word) return;
      const correct = challenge.correctOrder[i] === word.text;
      states[word.id] = correct ? 'correct' : 'wrong';
      if (!correct) allCorrect = false;
    });

    setTileStates(states);
    setSubmitted(true);

    if (allCorrect) {
      advanceTimer.current = setTimeout(() => {
        onAnswer(true, hintsUsed, elapsed);
      }, 1200);
    } else {
      // After 1500ms: reveal correct positions
      advanceTimer.current = setTimeout(() => {
        onAnswer(false, hintsUsed, elapsed);
      }, 1500);
    }
  };

  const handleHint = () => {
    if (hintsUsed >= MAX_HINTS || submitted) return;

    const newHintsUsed = hintsUsed + 1;
    setHintsUsed(newHintsUsed);

    if (newHintsUsed === 1) {
      // Hint 1: highlight or auto-place tile at hint1Target index
      const targetSlot = challenge.hint1Target;
      const expectedWord = challenge.correctOrder[targetSlot];

      // If slot empty, auto-place the correct word there
      if (tray[targetSlot] === null) {
        const wordInBank = bank.find((w) => w.text === expectedWord);
        if (wordInBank) {
          setTray((prev) => {
            const next = [...prev];
            next[targetSlot] = wordInBank;
            return next;
          });
          setBank((prev) => prev.filter((w) => w.id !== wordInBank.id));
        }
      } else {
        // Slot occupied — highlight wrong ones in tray
        setTray((prev) => {
          const wrongWord = prev[targetSlot];
          if (wrongWord && wrongWord.text !== expectedWord) {
            setTileStates((s) => ({ ...s, [wrongWord.id]: 'hint' }));
          }
          return prev;
        });
      }
    } else if (newHintsUsed === 2) {
      // Hint 2: auto-place the most out-of-place tile
      let bestWordToPlace: Word | null = null;
      let bestTargetSlot = -1;

      for (let i = 0; i < challenge.correctOrder.length; i++) {
        const expected = challenge.correctOrder[i];
        if (tray[i]?.text === expected) continue; // already correct
        if (tray[i] === null) {
          // Empty slot: find word in bank
          const inBank = bank.find((w) => w.text === expected);
          if (inBank) {
            bestWordToPlace = inBank;
            bestTargetSlot = i;
            break;
          }
        }
      }

      if (bestWordToPlace && bestTargetSlot >= 0) {
        const wordToMove = bestWordToPlace;
        const targetSlot = bestTargetSlot;
        setTray((prev) => {
          const next = [...prev];
          next[targetSlot] = wordToMove;
          return next;
        });
        setBank((prev) => prev.filter((w) => w.id !== wordToMove.id));
      }
    }
  };

  const hintsRemaining = MAX_HINTS - hintsUsed;

  return (
    <div className="build-phase">
      <div ref={containerRef} className="build-phase__inner">
        {/* Header */}
        <div className="build-phase__header">
          <span className="build-phase__counter">
            Tantangan {challengeNumber} dari {totalChallenges}
          </span>
          <button
            type="button"
            className="build-phase__replay-btn"
            onClick={handleReplay}
            aria-label="Putar ulang audio"
          >
            <Volume2 size={14} aria-hidden="true" />
            Putar Ulang
          </button>
        </div>

        {/* Instruction */}
        <p className="build-phase__instruction">Susun kalimat yang kamu dengar:</p>

        {/* Tray */}
        <div>
          <div
            ref={trayRef}
            className="build-tray"
            role="region"
            aria-label="Slot susunan kata"
          >
            <AnimatePresence>
              {tray.map((word, slotIndex) =>
                word ? (
                  <WordTile
                    key={word.id}
                    word={word}
                    zone="tray"
                    state={tileStates[word.id] ?? 'idle'}
                    isMobile={isMobile}
                    onTap={() => !submitted && trayToBank(word, slotIndex)}
                    dragConstraints={containerRef}
                    onDragEnd={(info) => handleDragEnd(word, info, 'tray', slotIndex)}
                  />
                ) : (
                  <motion.div
                    key={`slot-${slotIndex}`}
                    className="build-tray__slot"
                    layout
                    aria-hidden="true"
                  />
                ),
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bank */}
        <div>
          <p className="build-bank-label">Pilih Kata:</p>
          <div className="build-bank" role="group" aria-label="Kata yang tersedia">
            <AnimatePresence>
              {bank.map((word) => (
                <WordTile
                  key={word.id}
                  word={word}
                  zone="bank"
                  state={tileStates[word.id] ?? 'idle'}
                  isMobile={isMobile}
                  onTap={() => !submitted && bankToTray(word)}
                  dragConstraints={containerRef}
                  onDragEnd={(info) => handleDragEnd(word, info, 'bank')}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="build-phase__footer">
          <button
            type="button"
            className="build-phase__check-btn"
            disabled={!allFilled || submitted}
            onClick={handleCheck}
          >
            Cek Jawaban
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              type="button"
              className="build-phase__hint-btn"
              disabled={hintsUsed >= MAX_HINTS || submitted}
              onClick={handleHint}
              aria-label={`Gunakan petunjuk (${hintsRemaining} tersisa)`}
            >
              Petunjuk
            </button>
            <div className="hint-tokens" aria-label={`${hintsRemaining} petunjuk tersisa`}>
              {Array.from({ length: MAX_HINTS }, (_, i) => (
                <span
                  key={i}
                  className={`hint-token ${i < hintsRemaining ? 'hint-token--filled' : 'hint-token--empty'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
