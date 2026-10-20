import { useRef } from 'react';

import { useScrollProgress } from '@/lib/motion';

/**
 * Indikator progres scroll (DESIGN §8): 4px, accent, opacity 0.6.
 * Vertikal di kiri pada desktop, horizontal di atas pada mobile.
 * Murni visual — tidak ada label dan tidak masuk accessibility tree.
 */
export default function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useScrollProgress((progress) => {
    const element = barRef.current;
    if (!element) {
      return;
    }
    element.style.setProperty('--scroll-progress', progress.toFixed(4));
  });

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}
