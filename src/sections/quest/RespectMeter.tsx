import { useEffect, useState } from 'react';
import { Heart, TrendingUp, TrendingDown } from 'lucide-react';

interface RespectMeterProps {
  respect: number; // 0..100
  deltaNotice?: { delta: number; key: number } | null;
}

export default function RespectMeter({ respect, deltaNotice }: RespectMeterProps) {
  const [floatingNotice, setFloatingNotice] = useState<{ delta: number; id: number } | null>(null);

  useEffect(() => {
    if (deltaNotice && deltaNotice.delta !== 0) {
      setFloatingNotice({ delta: deltaNotice.delta, id: deltaNotice.key });
      const timer = setTimeout(() => {
        setFloatingNotice((current) => (current?.id === deltaNotice.key ? null : current));
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [deltaNotice]);

  const statusLabel =
    respect >= 80
      ? 'Sangat Dihormati'
      : respect >= 50
      ? 'Hubungan Baik'
      : respect >= 30
      ? 'Kurang Nyaman'
      : 'Sangat Canggung';

  return (
    <div
      className="sq-respect-meter"
      role="status"
      aria-live="polite"
      aria-label={`Rasa Hormat: ${respect} persen (${statusLabel})`}
    >
      <div className="sq-respect-meter__header">
        <div className="sq-respect-meter__title-wrap">
          <Heart size={14} className="sq-respect-meter__icon" aria-hidden="true" />
          <span className="sq-respect-meter__title">RASA HORMAT</span>
        </div>
        <div className="sq-respect-meter__val-wrap">
          <span className="sq-respect-meter__number">{respect}</span>
          <span className="sq-respect-meter__denom">/100</span>
        </div>
      </div>

      <div className="sq-respect-meter__track" aria-hidden="true">
        <div
          className={`sq-respect-meter__fill sq-respect-meter__fill--${
            respect >= 75 ? 'high' : respect >= 45 ? 'mid' : 'low'
          }`}
          style={{ width: `${respect}%` }}
        />
      </div>

      <div className="sq-respect-meter__footer">
        <span className="sq-respect-meter__status-text">{statusLabel}</span>
      </div>

      {/* Floating Delta Text (+15 / -10) */}
      {floatingNotice && (
        <div
          key={floatingNotice.id}
          className={`sq-respect-floating ${
            floatingNotice.delta > 0 ? 'sq-respect-floating--plus' : 'sq-respect-floating--minus'
          }`}
          aria-hidden="true"
        >
          {floatingNotice.delta > 0 ? (
            <>
              <TrendingUp size={13} />
              <span>+{floatingNotice.delta}</span>
            </>
          ) : (
            <>
              <TrendingDown size={13} />
              <span>{floatingNotice.delta}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
