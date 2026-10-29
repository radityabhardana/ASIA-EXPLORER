import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useMotionValue, useTransform, animate } from 'framer-motion';
import { Map, ArrowRight, Flame } from 'lucide-react';

interface RewardOverlayProps {
  countryId: string;
  countryName: string;
  xp: number;
  streakPeak: number;
  badgeUnlocked: boolean;
  onContinue: () => void;
  onNext?: () => void;
}

export default function RewardOverlay({
  countryId,
  countryName,
  xp,
  streakPeak,
  badgeUnlocked,
  onContinue,
  onNext,
}: RewardOverlayProps) {
  const xpMv = useMotionValue(0);
  const xpDisplay = useTransform(xpMv, (v) => Math.round(v));
  const firedConfetti = useRef(false);

  // Confetti burst on mount
  useEffect(() => {
    if (firedConfetti.current) return;
    firedConfetti.current = true;

    import('canvas-confetti').then(({ default: confetti }) => {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#176b68', '#c05c46', '#b5813a'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.3 },
          colors: ['#176b68', '#c05c46', '#b5813a'],
        });
      }, 300);
    }).catch(() => {
      // confetti unavailable — skip silently
    });
  }, []);

  // Animate XP counter
  useEffect(() => {
    const controls = animate(xpMv, xp, { duration: 1.5, ease: 'easeOut' });
    return () => controls.stop();
  }, [xp, xpMv]);

  // Country initials for badge
  const initials = countryName
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);

  return (
    <motion.div
      className="reward-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      role="dialog"
      aria-modal="true"
      aria-label="Sesi selesai"
    >
      <div className="reward-overlay__inner">
        {/* Title */}
        <motion.h1
          className="reward-overlay__title"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.5, ease: 'easeOut' }}
        >
          Sesi Selesai!
        </motion.h1>

        {/* XP Display */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 280, damping: 22 }}
        >
          <div className="reward-xp" aria-label={`${xp} XP diperoleh`}>
            +<motion.span>{xpDisplay}</motion.span>
          </div>
          <div className="reward-xp__label">XP diperoleh</div>
        </motion.div>

        {/* Streak badge */}
        {streakPeak >= 3 && (
          <motion.div
            className="reward-streak"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            aria-label={`Streak terbaik: ${streakPeak}`}
          >
            <Flame size={20} aria-hidden="true" />
            Streak terbaik: {streakPeak}
          </motion.div>
        )}

        {/* Country badge */}
        {badgeUnlocked && (
          <motion.div
            className="reward-badge"
            initial={{ scale: 0, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.55, type: 'spring', stiffness: 300, damping: 22 }}
          >
            <div
              className="reward-badge__circle"
              aria-hidden="true"
              style={{ background: `var(--country-${countryId}, var(--color-teal))` }}
            >
              {initials}
            </div>
            <p className="reward-badge__text">{countryName} — Selesai!</p>
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          className="reward-overlay__buttons"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.4 }}
        >
          {onNext && (
            <button type="button" className="reward-btn--primary" onClick={onNext}>
              Negara Selanjutnya
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
          <button type="button" className="reward-btn--secondary" onClick={onContinue}>
            <Map size={16} aria-hidden="true" />
            Kembali ke Daftar Negara
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
