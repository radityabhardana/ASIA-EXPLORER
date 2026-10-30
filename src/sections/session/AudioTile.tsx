import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface AudioTileProps {
  id: string;
  text: string;
  index?: number;
  locked: boolean;
  selected: boolean;
  state: 'idle' | 'correct' | 'wrong';
  onSelect: () => void;
}

export default function AudioTile({
  id,
  text,
  index = 0,
  locked,
  selected: _selected,
  state,
  onSelect,
}: AudioTileProps) {
  const isCorrect = state === 'correct';
  const isWrong = state === 'wrong';
  const letter = String.fromCharCode(65 + (index % 26));

  const stateClass = isCorrect ? ' audio-tile--correct' : isWrong ? ' audio-tile--wrong' : '';
  const lockedClass = locked ? ' audio-tile--locked' : '';

  return (
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
      initial={{ opacity: locked ? 0.35 : 1, y: 0 }}
      animate={
        isWrong
          ? { x: [0, -8, 8, -6, 6, -3, 3, 0], opacity: 1, y: 0, scale: 1 }
          : isCorrect
          ? { scale: [1, 1.04, 1], opacity: 1, y: 0, x: 0 }
          : { opacity: locked ? 0.35 : 1, y: 0, x: 0, scale: 1 }
      }
      whileHover={!locked ? { y: -2, transition: { duration: 0.16 } } : {}}
      whileTap={!locked ? { y: 2, scale: 0.98 } : {}}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <span className="audio-tile__letter" aria-hidden="true">
        {letter}
      </span>
      <span className="audio-tile__text">{text}</span>
      {isCorrect && (
        <motion.span
          className="audio-tile__status-icon audio-tile__status-icon--correct"
          initial={{ scale: 0, rotate: -20, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          aria-hidden="true"
        >
          <Check size={14} strokeWidth={2.8} />
        </motion.span>
      )}
      {isWrong && (
        <motion.span
          className="audio-tile__status-icon audio-tile__status-icon--wrong"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
          aria-hidden="true"
        >
          <X size={14} strokeWidth={2.8} />
        </motion.span>
      )}
    </motion.div>
  );
}
