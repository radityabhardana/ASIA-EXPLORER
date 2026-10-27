import { useCallback, useRef } from 'react';

export type TiltOptions = {
  maxTilt?: number;
  perspective?: number;
  scale?: number;
};

export function use3DTilt<T extends HTMLElement>(options?: TiltOptions) {
  const ref = useRef<T>(null);
  const maxTilt = options?.maxTilt ?? 12;
  const scale = options?.scale ?? 1.02;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<T>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (prefersReducedMotion) {
        el.style.setProperty('--tilt-rx', '0deg');
        el.style.setProperty('--tilt-ry', '0deg');
        el.style.setProperty('--tilt-scale', '1');
      } else {
        el.style.setProperty('--tilt-rx', `${(-y * maxTilt).toFixed(2)}deg`);
        el.style.setProperty('--tilt-ry', `${(x * maxTilt).toFixed(2)}deg`);
        el.style.setProperty('--tilt-scale', `${scale}`);
      }

      el.style.setProperty('--spotlight-x', `${((x + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--spotlight-y', `${((y + 0.5) * 100).toFixed(1)}%`);
      el.style.setProperty('--spotlight-opacity', '1');
    },
    [maxTilt, scale]
  );

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    el.style.setProperty('--tilt-rx', '0deg');
    el.style.setProperty('--tilt-ry', '0deg');
    el.style.setProperty('--tilt-scale', '1');
    el.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
