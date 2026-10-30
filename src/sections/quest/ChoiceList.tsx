import { useEffect } from 'react';
import type { Choice } from '@/lib/story-quest/types';
import { isChoiceAvailable } from '@/lib/story-quest/engine';
import { Lock, ArrowRight } from 'lucide-react';

interface ChoiceListProps {
  choices: Choice[];
  inventory: string[];
  flags: Record<string, boolean>;
  respect: number;
  onSelectChoice: (choice: Choice) => void;
  disabled?: boolean;
}

export default function ChoiceList({
  choices,
  inventory,
  flags,
  respect,
  onSelectChoice,
  disabled = false,
}: ChoiceListProps) {
  // Shortcut keyboard angka 1..4
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika user sedang mengetik di input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= choices.length) {
        const choice = choices[num - 1]!;
        const check = isChoiceAvailable(choice, inventory, flags, respect);
        if (check.available) {
          e.preventDefault();
          onSelectChoice(choice);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, inventory, flags, respect, onSelectChoice, disabled]);

  return (
    <div className="sq-choice-list" role="group" aria-label="Pilihan tindakan adegan">
      {choices.map((choice, index) => {
        const check = isChoiceAvailable(choice, inventory, flags, respect);
        const isLocked = !check.available;
        const keyNumber = index + 1;

        return (
          <button
            key={choice.id}
            type="button"
            className={`sq-choice-btn ${isLocked ? 'sq-choice-btn--locked' : ''}`}
            disabled={disabled || isLocked}
            onClick={() => onSelectChoice(choice)}
            aria-label={`Pilihan ${keyNumber}: ${choice.teks}${isLocked ? ` (Terkunci: ${check.reason})` : ''}`}
          >
            <div className="sq-choice-btn__key-badge" aria-hidden="true">
              {keyNumber}
            </div>

            <div className="sq-choice-btn__content">
              <span className="sq-choice-btn__text">{choice.teks}</span>
              {isLocked && check.reason && (
                <div className="sq-choice-btn__lock-reason">
                  <Lock size={11} aria-hidden="true" />
                  <span>{check.reason}</span>
                </div>
              )}
            </div>

            <div className="sq-choice-btn__action-icon" aria-hidden="true">
              {isLocked ? <Lock size={15} /> : <ArrowRight size={15} />}
            </div>
          </button>
        );
      })}
    </div>
  );
}
