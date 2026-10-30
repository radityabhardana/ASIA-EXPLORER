import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, ArrowRight, Lightbulb } from 'lucide-react';
import { type PanInfo } from 'framer-motion';
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

// Helper to check if point is over an element bounding rect with tolerance
function isPointOverElement(point: { x: number; y: number }, element: HTMLElement | null, tolerance = 32): boolean {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return (
    point.x >= rect.left - tolerance &&
    point.x <= rect.right + tolerance &&
    point.y >= rect.top - tolerance &&
    point.y <= rect.bottom + tolerance
  );
}

// Helper to find which specific slot in the tray the point is over
function getTargetSlotIndex(point: { x: number; y: number }, trayEl: HTMLElement | null): number {
  if (!trayEl) return -1;
  const slotElements = trayEl.querySelectorAll('.build-tray__slot-wrapper');
  if (slotElements.length === 0) return -1;

  const trayRect = trayEl.getBoundingClientRect();
  // Check if pointer is near the tray vertically and horizontally (with 45px margin)
  if (
    point.y < trayRect.top - 45 ||
    point.y > trayRect.bottom + 45 ||
    point.x < trayRect.left - 45 ||
    point.x > trayRect.right + 45
  ) {
    return -1;
  }

  // Find the slot wrapper whose center is closest to point
  let closestIndex = -1;
  let minDistanceSq = Infinity;

  for (let i = 0; i < slotElements.length; i++) {
    const el = slotElements[i];
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = point.x - cx;
    const dy = point.y - cy;
    const distSq = dx * dx + dy * dy;

    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closestIndex = i;
    }
  }

  return closestIndex;
}

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
  const [activeDropSlot, setActiveDropSlot] = useState<number | null>(null);

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

  // Swap or move between slots within tray
  const moveOrSwapTraySlot = useCallback(
    (sourceSlot: number, targetSlot: number) => {
      if (submitted) return;
      if (sourceSlot === targetSlot) return;

      setTray((prevTray) => {
        const sourceWord = prevTray[sourceSlot];
        if (!sourceWord) return prevTray;

        const targetWord = prevTray[targetSlot] ?? null;
        const next = [...prevTray];
        next[targetSlot] = sourceWord;
        next[sourceSlot] = targetWord; // Swaps if target had a word, or leaves null if target was empty!
        return next;
      });
    },
    [submitted],
  );

  // Move word from bank → tray (strictly deduplicated & bounded)
  const bankToTray = useCallback(
    (word: Word, preferredSlot?: number) => {
      if (submitted) return;

      setTray((prevTray) => {
        // Prevent duplicate insertion if word already in tray
        if (prevTray.some((slot) => slot?.id === word.id)) {
          return prevTray;
        }

        let targetSlot = -1;
        if (
          preferredSlot !== undefined &&
          preferredSlot >= 0 &&
          preferredSlot < prevTray.length
        ) {
          targetSlot = preferredSlot;
        } else {
          targetSlot = prevTray.findIndex((slot) => slot === null);
        }

        if (targetSlot === -1) {
          return prevTray; // Tray is full and no target
        }

        const existingAtTarget = prevTray[targetSlot];

        // Successfully placed in tray; update bank:
        setBank((prevBank) => {
          const withoutNewWord = prevBank.filter((w) => w.id !== word.id);
          // If the target slot already had a word, return that existing word to bank!
          if (existingAtTarget && !withoutNewWord.some((w) => w.id === existingAtTarget.id)) {
            return [...withoutNewWord, existingAtTarget];
          }
          return withoutNewWord;
        });

        const next = [...prevTray];
        next[targetSlot] = word;
        return next;
      });
    },
    [submitted],
  );

  // Move word from tray → bank (strictly deduplicated)
  const trayToBank = useCallback(
    (word: Word, slotIndex: number) => {
      if (submitted) return;

      setTray((prevTray) => {
        // Only remove if this slot actually contains this word
        if (!prevTray[slotIndex] || prevTray[slotIndex]?.id !== word.id) {
          return prevTray;
        }

        // Add back to bank if not already in bank
        setBank((prevBank) => {
          if (prevBank.some((w) => w.id === word.id)) {
            return prevBank;
          }
          return [...prevBank, word];
        });

        const next = [...prevTray];
        next[slotIndex] = null;
        return next;
      });
    },
    [submitted],
  );

  // Live hover tracking while dragging over tray slots
  const handleTileDrag = useCallback(
    (info: PanInfo) => {
      const trayEl = trayRef.current;
      if (!trayEl) return;
      const targetSlot = getTargetSlotIndex(info.point, trayEl);
      setActiveDropSlot(targetSlot >= 0 ? targetSlot : null);
    },
    [],
  );

  // Desktop drag end — checks drop target position & swaps or moves
  const handleDragEnd = useCallback(
    (
      word: Word,
      info: PanInfo,
      fromZone: 'bank' | 'tray',
      sourceSlotIndex?: number,
    ) => {
      setActiveDropSlot(null);
      if (submitted) return;

      // Filter out tiny pointer jitters (must be real drag movement)
      if (Math.hypot(info.offset.x, info.offset.y) < 8) {
        return;
      }

      const trayEl = trayRef.current;
      if (!trayEl) return;

      const overTray = isPointOverElement(info.point, trayEl);
      const targetSlot = getTargetSlotIndex(info.point, trayEl);

      if (fromZone === 'bank') {
        if (overTray) {
          bankToTray(word, targetSlot >= 0 ? targetSlot : undefined);
        }
        // If not over tray, Framer Motion dragSnapToOrigin will cleanly spring it back to bank
      } else if (fromZone === 'tray' && sourceSlotIndex !== undefined) {
        if (overTray && targetSlot >= 0 && targetSlot !== sourceSlotIndex) {
          // SWAP OR MOVE WITHIN TRAY
          moveOrSwapTraySlot(sourceSlotIndex, targetSlot);
        } else if (!overTray) {
          // Dragged out of tray -> return to bank
          trayToBank(word, sourceSlotIndex);
        }
      }
    },
    [submitted, bankToTray, trayToBank, moveOrSwapTraySlot],
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
      const targetSlot = challenge.hint1Target;
      const expectedWord = challenge.correctOrder[targetSlot];

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
        setTray((prev) => {
          const wrongWord = prev[targetSlot];
          if (wrongWord && wrongWord.text !== expectedWord) {
            setTileStates((s) => ({ ...s, [wrongWord.id]: 'hint' }));
          }
          return prev;
        });
      }
    } else if (newHintsUsed === 2) {
      let bestWordToPlace: Word | null = null;
      let bestTargetSlot = -1;

      for (let i = 0; i < challenge.correctOrder.length; i++) {
        const expected = challenge.correctOrder[i];
        if (tray[i]?.text === expected) continue;
        if (tray[i] === null) {
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
          <div className="build-phase__header-left">
            <div className="build-phase__eyebrow">
              <span className="build-phase__counter">
                Tantangan {String(challengeNumber).padStart(2, '0')} / {String(totalChallenges).padStart(2, '0')}
              </span>
              <span className="build-phase__seal-badge" aria-hidden="true">
                SUSUN FRASA • TYPESETTING
              </span>
            </div>
            <h2 className="build-phase__instruction">Susun kalimat yang kamu dengar</h2>
            <p className="build-phase__subtext">Ketuk atau geser balok kata ke dalam baki susunan di bawah.</p>
          </div>
          <button
            type="button"
            className="build-phase__replay-btn"
            onClick={handleReplay}
            aria-label="Putar ulang audio"
            title="Dengarkan kembali kalimat suara"
          >
            <Volume2 size={14} aria-hidden="true" />
            <span>Dengarkan Kalimat</span>
          </button>
        </div>

        {/* Tray */}
        <div className="build-tray-container">
          <div className="build-tray-header">
            <span className="build-tray-label">BAKI SUSUNAN KATA</span>
            <span className="build-tray-hint">Ketuk kata pada baki untuk mengembalikannya ke bank</span>
          </div>
          <div
            ref={trayRef}
            className="build-tray"
            role="region"
            aria-label="Slot susunan kata"
          >
            {tray.map((word, slotIndex) => (
              <div
                key={`slot-wrap-${slotIndex}`}
                className={`build-tray__slot-wrapper${activeDropSlot === slotIndex ? ' build-tray__slot-wrapper--active' : ''}`}
              >
                {word ? (
                  <WordTile
                    key={word.id}
                    word={word}
                    zone="tray"
                    state={tileStates[word.id] ?? 'idle'}
                    isMobile={isMobile}
                    onTap={() => !submitted && trayToBank(word, slotIndex)}
                    onDrag={handleTileDrag}
                    onDragEnd={(info) => handleDragEnd(word, info, 'tray', slotIndex)}
                  />
                ) : (
                  <div className="build-tray__slot" aria-hidden="true">
                    <span className="build-tray__slot-num">{slotIndex + 1}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bank */}
        <div className="build-bank-container">
          <p className="build-bank-label">PILIH KATA DARI BANK:</p>
          <div className="build-bank" role="group" aria-label="Kata yang tersedia">
            {bank.map((word) => (
              <WordTile
                key={word.id}
                word={word}
                zone="bank"
                state={tileStates[word.id] ?? 'idle'}
                isMobile={isMobile}
                onTap={() => !submitted && bankToTray(word)}
                onDrag={handleTileDrag}
                onDragEnd={(info) => handleDragEnd(word, info, 'bank')}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="build-phase__footer">
          <button
            type="button"
            className="build-phase__check-btn"
            disabled={!allFilled || submitted}
            onClick={handleCheck}
            aria-label="Cek Jawaban Susunan Kata"
          >
            <span>Cek Jawaban</span>
            <ArrowRight size={14} aria-hidden="true" />
          </button>

          <button
            type="button"
            className="build-phase__hint-btn"
            disabled={hintsUsed >= MAX_HINTS || submitted}
            onClick={handleHint}
            aria-label={`Gunakan petunjuk (${hintsRemaining} tersisa)`}
            title={hintsRemaining > 0 ? `Bantuan susunan kata (${hintsRemaining} tersisa)` : 'Petunjuk habis'}
          >
            <Lightbulb size={14} aria-hidden="true" />
            <span>Petunjuk</span>
            <div className="hint-tokens" aria-label={`${hintsRemaining} petunjuk tersisa`}>
              {Array.from({ length: MAX_HINTS }, (_, i) => (
                <span
                  key={i}
                  className={`hint-token ${i < hintsRemaining ? 'hint-token--filled' : 'hint-token--empty'}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
