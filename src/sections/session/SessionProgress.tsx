import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Flame } from 'lucide-react';
import type { SessionPhase } from '@/lib/useSessionEngine';

interface SessionProgressProps {
  phase: SessionPhase;
  challengeIndex: number;
  totalAudioQuests: number;
  totalBuildChallenges: number;
  xp: number;
  streak: number;
}

const PHASES: { key: SessionPhase; label: string }[] = [
  { key: 'story', label: 'Cerita' },
  { key: 'audio-quest', label: 'Audio Quest' },
  { key: 'build', label: 'Susun' },
];

export default function SessionProgress({
  phase,
  challengeIndex,
  totalAudioQuests,
  totalBuildChallenges,
  xp,
  streak,
}: SessionProgressProps) {
  const xpMv = useMotionValue(0);
  const xpDisplay = useTransform(xpMv, (v) => Math.round(v));
  const prevXp = useRef(xp);

  useEffect(() => {
    const controls = animate(xpMv, xp, { duration: 0.7, ease: 'easeOut' });
    prevXp.current = xp;
    return () => controls.stop();
  }, [xp, xpMv]);

  // Compute dots for current phase
  let totalDots = 0;
  let doneDots = 0;

  if (phase === 'audio-quest') {
    totalDots = totalAudioQuests;
    doneDots = challengeIndex;
  } else if (phase === 'build') {
    totalDots = totalBuildChallenges;
    doneDots = challengeIndex;
  } else if (phase === 'story') {
    totalDots = 4; // 4 story panels
    doneDots = 0;
  } else {
    totalDots = 0;
  }

  return (
    <div className="session-progress" role="navigation" aria-label="Kemajuan sesi">
      {/* Phase breadcrumb pills */}
      <div className="session-progress__phases">
        {PHASES.map((p, i) => (
          <span key={p.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {i > 0 && <span className="session-progress__phase-sep" aria-hidden="true">›</span>}
            <span
              className={`session-progress__phase-pill${phase === p.key ? ' session-progress__phase-pill--active' : ''}`}
              aria-current={phase === p.key ? 'step' : undefined}
            >
              {p.label}
            </span>
          </span>
        ))}
      </div>

      {/* Within-phase dots */}
      {totalDots > 0 && (
        <div className="session-progress__dots" role="status" aria-label={`Tantangan ${doneDots} dari ${totalDots}`}>
          {Array.from({ length: totalDots }, (_, i) => (
            <span
              key={i}
              className={`session-progress__dot${
                i < doneDots
                  ? ' session-progress__dot--done'
                  : i === doneDots
                  ? ' session-progress__dot--active'
                  : ''
              }`}
              aria-hidden="true"
            />
          ))}
        </div>
      )}

      {/* XP + streak */}
      <div className="session-progress__right">
        <span className="session-progress__xp" aria-label={`${xp} XP`}>
          <motion.span>{xpDisplay}</motion.span> XP
        </span>
        {streak >= 2 && (
          <span className="session-progress__streak" aria-label={`Streak ${streak}`}>
            <Flame size={15} aria-hidden="true" />
            {streak}
          </span>
        )}
      </div>
    </div>
  );
}
