import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';

interface AudioTileProps {
  id: string;
  text: string;
  locked: boolean;
  selected: boolean;
  state: 'idle' | 'correct' | 'wrong';
  onSelect: () => void;
}

const shakeVariants = {
  idle: { x: 0 },
  wrong: {
    x: [0, -10, 10, -10, 10, 0] as number[],
  },
};

const scaleVariants = {
  idle: { scale: 1 },
  correct: {
    scale: [1, 1.04, 1] as number[],
  },
};

export default function AudioTile({ id, text, locked, selected: _selected, state, onSelect }: AudioTileProps) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';

  const stateClass = isCorrect ? ' audio-tile--correct' : isWrong ? ' audio-tile--wrong' : '';
  const lockedClass = locked ? ' audio-tile--locked' : '';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className={`audio-tile${stateClass}${lockedClass}`}
        role="button"
        tabIndex={locked ? -1 : 0}
        aria-disabled={locked}
        aria-pressed={state !== 'idle'}
        onClick={locked ? undefined : onSelect}
        onKeyDown={locked ? undefined : (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        // Entry animation when unlocked
        initial={locked ? false : { y: 16, opacity: 0 }}
        animate={
          isWrong
            ? shakeVariants.wrong
            : isCorrect
            ? scaleVariants.correct
            : locked
            ? { y: 16, opacity: 0 }
            : { y: 0, opacity: 1 }
        }
        whileHover={!locked ? { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' } : {}}
        whileTap={!locked ? { scale: 0.97 } : {}}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <span>{text}</span>
        {isCorrect && (
          <motion.span
            className="audio-tile__check-icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 350, damping: 20 }}
            aria-hidden="true"
          >
            <Check size={16} strokeWidth={2.5} />
          </motion.span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
