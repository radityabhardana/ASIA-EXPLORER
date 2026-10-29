import { motion } from 'framer-motion';

interface WordTileProps {
  word: { id: string; text: string };
  zone: 'bank' | 'tray';
  state: 'idle' | 'correct' | 'wrong' | 'hint';
  isMobile: boolean;
  onTap: () => void;
  dragConstraints?: React.RefObject<HTMLElement | null>;
  onDragEnd?: (info: { offset: { x: number; y: number } }) => void;
}

const stateStyles: Record<WordTileProps['state'], React.CSSProperties> = {
  idle: {},
  correct: { background: '#e8f5ee', borderColor: 'var(--color-correct)', borderWidth: 2 },
  wrong: { background: '#fbeaea', borderColor: 'var(--color-wrong)', borderWidth: 2 },
  hint: {},
};

const shakeTransition = {
  duration: 0.32,
  ease: 'easeInOut' as const,
};

export default function WordTile({
  word,
  zone: _zone,
  state,
  isMobile,
  onTap,
  dragConstraints,
  onDragEnd,
}: WordTileProps) {
  const stateClass =
    state === 'idle'
      ? ''
      : state === 'hint'
      ? ' word-tile--hint'
      : state === 'correct'
      ? ' word-tile--correct'
      : ' word-tile--wrong';

  const mobileClass = isMobile ? ' word-tile--mobile' : '';
  const className = `word-tile${stateClass}${mobileClass}`;

  // Scale for correct spring
  const correctAnimate =
    state === 'correct'
      ? { scale: [1, 1.05, 1], transition: { type: 'spring' as const, stiffness: 400, damping: 18 } }
      : {};

  // Shake for wrong
  const wrongAnimate =
    state === 'wrong'
      ? { x: [0, -10, 10, -10, 10, 0], transition: shakeTransition }
      : {};

  const stateAnimate = state === 'correct' ? correctAnimate : state === 'wrong' ? wrongAnimate : {};

  if (isMobile) {
    return (
      <motion.div
        className={className}
        style={stateStyles[state]}
        layout
        role="button"
        tabIndex={0}
        aria-label={word.text}
        onClick={onTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTap();
          }
        }}
        whileTap={{ scale: 0.94 }}
        animate={stateAnimate}
      >
        {word.text}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      style={{ ...stateStyles[state], cursor: 'grab' }}
      layout
      role="button"
      tabIndex={0}
      aria-label={word.text}
      drag
      dragConstraints={dragConstraints}
      dragElastic={0.2}
      onDragEnd={(_, info) => onDragEnd?.({ offset: { x: info.offset.x, y: info.offset.y } })}
      whileDrag={{
        scale: 1.08,
        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
        zIndex: 50,
        cursor: 'grabbing',
      }}
      animate={stateAnimate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTap();
        }
      }}
    >
      {word.text}
    </motion.div>
  );
}
