import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { MouseEvent } from 'react';

import { prefersReducedMotion } from '@/lib/motion';

/** Harus sama dengan `--duration-transition` di tokens.css. */
const EXIT_MS = 200;

export function useExitToLanding() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const leavingRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    },
    [],
  );

  const handleBackClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (leavingRef.current) {
        event.preventDefault();
        return;
      }
      // Biarkan peramban menangani tab baru / unduhan / klik non-kiri.
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      if (prefersReducedMotion()) {
        navigate('/');
        return;
      }

      leavingRef.current = true;
      setLeaving(true);
      timerRef.current = window.setTimeout(() => {
        navigate('/');
      }, EXIT_MS);
    },
    [navigate],
  );

  return { leaving, handleBackClick };
}
