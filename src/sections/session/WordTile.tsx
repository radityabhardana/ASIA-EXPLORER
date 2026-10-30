import { useRef } from 'react';
import { motion, type PanInfo } from 'framer-motion';

interface WordTileProps {
  word: { id: string; text: string };
  zone: 'bank' | 'tray';
  state: 'idle' | 'correct' | 'wrong' | 'hint';
  isMobile: boolean;
  onTap: () => void;
  dragConstraints?: React.RefObject<HTMLElement | null>;
  onDragStart?: () => void;
  onDrag?: (info: PanInfo) => void;
  onDragEnd?: (info: PanInfo) => void;
}

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
  onDragStart,
  onDrag,
  onDragEnd,
}: WordTileProps) {
  const isDraggingRef = useRef(false);

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
      ? { x: [0, -8, 8, -6, 6, -3, 3, 0], transition: shakeTransition }
      : {};

  const stateAnimate = state === 'correct' ? correctAnimate : state === 'wrong' ? wrongAnimate : {};

  const handleTap = () => {
    if (isDraggingRef.current) return;
    onTap();
  };

  if (isMobile) {
    return (
      <motion.div
        className={className}
        layout="position"
        role="button"
        tabIndex={0}
        aria-label={word.text}
        onTap={handleTap}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleTap();
          }
        }}
        whileTap={{ scale: 0.95 }}
        animate={stateAnimate}
        transition={{ layout: { type: 'spring', stiffness: 500, damping: 32 } }}
      >
        <span className="word-tile__text">{word.text}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      layout="position"
      role="button"
      tabIndex={0}
      aria-label={word.text}
      drag={state === 'idle'}
      dragSnapToOrigin={true}
      dragConstraints={dragConstraints}
      dragElastic={0}
      dragMomentum={false}
      onDragStart={() => {
        isDraggingRef.current = true;
        onDragStart?.();
      }}
      onDrag={(_, info) => {
        onDrag?.(info);
      }}
      onDragEnd={(_, info) => {
        onDragEnd?.(info);
        // Delay resetting isDragging so accidental click is suppressed
        setTimeout(() => {
          isDraggingRef.current = false;
        }, 70);
      }}
      onTap={handleTap}
      whileHover={{ y: -2, transition: { duration: 0.12 } }}
      whileDrag={{
        scale: 1.06,
        boxShadow: '0 14px 32px rgba(43, 35, 28, 0.24)',
        zIndex: 999,
        cursor: 'grabbing',
      }}
      animate={stateAnimate}
      transition={{ layout: { type: 'spring', stiffness: 500, damping: 32 } }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleTap();
        }
      }}
    >
      <span className="word-tile__text">{word.text}</span>
    </motion.div>
  );
}
