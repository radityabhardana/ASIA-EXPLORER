import { mapEntry } from './landing-data';

type SilhouetteProps = {
  id: string;
  className?: string;
  /** `slice` mengisi kotak sepenuhnya (memotong sisi) untuk band full-bleed. */
  fit?: 'meet' | 'slice';
};

/**
 * Siluet satu negara dari `map-paths.json` — sumber yang sama dengan peta 3D.
 * `viewBox` dipotong ke bbox entri supaya siluet mengisi ruangnya, bukan
 * mengambang di tengah kotak 1000×1000.
 */
export default function Silhouette({ id, className, fit = 'meet' }: SilhouetteProps) {
  const entry = mapEntry(id);
  if (!entry) {
    return null;
  }

  const [minX, minY, maxX, maxY] = entry.bbox;
  const width = maxX - minX;
  const height = maxY - minY;
  const padX = width * 0.04 + 4;
  const padY = height * 0.04 + 4;
  const viewBox = [
    minX - padX,
    minY - padY,
    width + padX * 2,
    height + padY * 2,
  ].join(' ');

  return (
    <svg
      className={className ? `landing-sil ${className}` : 'landing-sil'}
      viewBox={viewBox}
      preserveAspectRatio={`xMidYMid ${fit}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      <path d={entry.d} />
    </svg>
  );
}
