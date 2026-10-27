import { useCallback, useRef } from 'react';

/**
 * Radial spotlight effect that follows cursor on a container element.
 * Returns a ref to attach to the container and a mouse handler.
 */
export function useSpotlight<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<T>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    el.style.setProperty('--spotlight-x', `${x.toFixed(1)}%`);
    el.style.setProperty('--spotlight-y', `${y.toFixed(1)}%`);
    el.style.setProperty('--spotlight-opacity', '1');
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--spotlight-opacity', '0');
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
}
