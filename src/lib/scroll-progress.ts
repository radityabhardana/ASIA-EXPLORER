/*
 * Sumber progres scroll global 0..1 (DESIGN §6).
 * Modul murni tanpa DOM/GSAP supaya bisa diuji di Node.
 */

export type ScrollProgressListener = (progress: number) => void;

const listeners = new Set<ScrollProgressListener>();
let current = 0;

export function clampProgress(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value <= 0) {
    return 0;
  }
  return value >= 1 ? 1 : value;
}

/**
 * `(scrollY) / (pageHeight - viewportHeight)`, dijepit ke 0..1.
 * Halaman yang lebih pendek dari viewport dianggap progres 0.
 */
export function computeProgress(
  scrollY: number,
  pageHeight: number,
  viewportHeight: number,
): number {
  const maxScroll = pageHeight - viewportHeight;
  if (!Number.isFinite(maxScroll) || maxScroll <= 0) {
    return 0;
  }
  if (!Number.isFinite(scrollY)) {
    return 0;
  }
  return clampProgress(scrollY / maxScroll);
}

export function getScrollProgress(): number {
  return current;
}

/**
 * Berlangganan progres. Listener langsung dipanggil dengan nilai saat ini,
 * lalu setiap kali progres berubah. Tidak memicu render React.
 */
export function subscribeScrollProgress(
  listener: ScrollProgressListener,
): () => void {
  listeners.add(listener);
  listener(current);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Dipakai engine scroll (src/lib/motion.ts). Nilai yang sama tidak
 * diumumkan ulang supaya subscriber tidak bekerja tanpa perubahan.
 */
export function setScrollProgress(next: number): void {
  const clamped = clampProgress(next);
  if (Math.abs(clamped - current) < 1e-5) {
    return;
  }
  current = clamped;
  for (const listener of listeners) {
    listener(current);
  }
}

/** Hanya untuk unit test. */
export function resetScrollProgressForTests(): void {
  current = 0;
  listeners.clear();
}
