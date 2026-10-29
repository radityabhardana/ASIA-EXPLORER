/*
 * Satu sumber progres scroll global (DESIGN §6) + smooth scroll.
 *
 * Pola resmi Lenis + GSAP:
 *   lenis.on('scroll', ScrollTrigger.update)
 *   gsap.ticker.add((time) => lenis.raf(time * 1000))
 *   gsap.ticker.lagSmoothing(500, 33)
 *
 * `prefers-reduced-motion: reduce` -> Lenis tidak dibuat sama sekali; progres
 * tetap dihitung dari event scroll native. `destroyScrollEngine()` tersedia
 * untuk mematikan semuanya (dipakai juga oleh cleanup React).
 *
 * Progres disebar lewat subscriber (`subscribeScrollProgress`), bukan state
 * React — komponen yang butuh nilai per frame memakai callback dan menulis
 * langsung ke DOM/ref, sehingga tidak ada re-render per frame.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { useEffect, useRef } from 'react';

import {
  computeProgress,
  getScrollProgress,
  setScrollProgress,
  subscribeScrollProgress,
} from './scroll-progress';
import type { ScrollProgressListener } from './scroll-progress';

if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SCROLL_DURATION_SECONDS = 0.6;

type ScrollEngine = {
  lenis: Lenis | null;
  lenisCleanups: Array<() => void>;
  tick: ((time: number) => void) | null;
  cleanups: Array<() => void>;
};

let engine: ScrollEngine | null = null;
let mounts = 0;
let scrollTriggerRegistered = false;

/**
 * ScrollTrigger butuh `matchMedia` saat registrasi. Lingkungan tanpa
 * `matchMedia` (SSR, jsdom) tetap mendapat progres lewat scroll native.
 */
function browserSupportsSmoothScroll(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined' &&
    typeof window.matchMedia === 'function'
  );
}

function ensureScrollTrigger(): boolean {
  if (scrollTriggerRegistered) {
    return true;
  }
  if (!browserSupportsSmoothScroll()) {
    return false;
  }
  gsap.registerPlugin(ScrollTrigger);
  scrollTriggerRegistered = true;
  return true;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

function measureProgress(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const pageHeight = document.documentElement.scrollHeight;
  setScrollProgress(
    computeProgress(window.scrollY, pageHeight, window.innerHeight),
  );
}

function startLenis(state: ScrollEngine): void {
  if (state.lenis || !browserSupportsSmoothScroll()) {
    return;
  }
  const lenis = new Lenis({
    autoRaf: false,
    smoothWheel: true,
    // Gunakan ResizeObserver bawaan Lenis agar resize dinamis saat komponen React render/fetch selesai
    autoResize: true,
    // Kita mematikan Lenis sendiri saat reduced-motion aktif.
    respectReducedMotion: false,
  });

  const handleScroll = () => {
    setScrollProgress(lenis.progress);
  };

  state.lenisCleanups.push(lenis.on('scroll', handleScroll));
  if (scrollTriggerRegistered) {
    state.lenisCleanups.push(lenis.on('scroll', ScrollTrigger.update));
  }

  const tick = (time: number) => {
    lenis.raf(time * 1000);
  };
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(500, 33);

  state.lenis = lenis;
  state.tick = tick;
}

function stopLenis(state: ScrollEngine): void {
  for (const cleanup of state.lenisCleanups.splice(0)) {
    cleanup();
  }
  if (state.tick) {
    gsap.ticker.remove(state.tick);
    state.tick = null;
  }
  if (state.lenis) {
    state.lenis.destroy();
    state.lenis = null;
  }
}

function startEngine(): void {
  if (engine || typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }

  const state: ScrollEngine = {
    lenis: null,
    lenisCleanups: [],
    tick: null,
    cleanups: [],
  };
  engine = state;
  ensureScrollTrigger();

  const handleViewportChange = () => {
    engine?.lenis?.resize();
    measureProgress();
    if (scrollTriggerRegistered) {
      ScrollTrigger.refresh();
    }
  };

  window.addEventListener('scroll', measureProgress, { passive: true });
  state.cleanups.push(() => {
    window.removeEventListener('scroll', measureProgress);
  });

  window.addEventListener('resize', handleViewportChange);
  state.cleanups.push(() => {
    window.removeEventListener('resize', handleViewportChange);
  });

  const media =
    typeof window.matchMedia === 'function'
      ? window.matchMedia(REDUCED_MOTION_QUERY)
      : null;

  const applyMotionPreference = () => {
    if (media?.matches) {
      stopLenis(state);
      measureProgress();
      return;
    }
    startLenis(state);
  };

  if (media) {
    media.addEventListener('change', applyMotionPreference);
    state.cleanups.push(() => {
      media.removeEventListener('change', applyMotionPreference);
    });
  }

  applyMotionPreference();
  measureProgress();
  if (scrollTriggerRegistered) {
    ScrollTrigger.refresh();
  }
}

/** Dipanggil hook; hitungan mount mencegah double-init di StrictMode. */
export function ensureScrollEngine(): void {
  mounts += 1;
  startEngine();
}

/** Dipanggil saat hook unmount; engine mati ketika tidak ada pemakai. */
export function releaseScrollEngine(): void {
  mounts = Math.max(0, mounts - 1);
  if (mounts === 0) {
    destroyScrollEngine();
  }
}

/** Matikan Lenis sementara (mis. di dashboard/modal/peta) agar scroll native bebas dan tidak dicegat. */
export function pauseLenis(): void {
  if (engine?.lenis) {
    stopLenis(engine);
  }
}

/** Hidupkan kembali Lenis (mis. saat kembali ke halaman landing untuk 3D globe timeline). */
export function resumeLenis(): void {
  if (engine && !engine.lenis && !prefersReducedMotion()) {
    startLenis(engine);
    const activeLenis = engine.lenis as Lenis | null;
    activeLenis?.resize();
  }
}

/** Perbarui dimensi scroll engine & ScrollTrigger setelah DOM render dinamis. */
export function refreshScrollEngine(): void {
  if (engine?.lenis) {
    engine.lenis.resize();
  }
  measureProgress();
  if (scrollTriggerRegistered) {
    ScrollTrigger.refresh();
  }
}

/** Matikan Lenis, ticker GSAP, dan semua listener. */
export function destroyScrollEngine(): void {
  if (!engine) {
    return;
  }
  const state = engine;
  engine = null;
  mounts = 0;
  stopLenis(state);
  for (const cleanup of state.cleanups.splice(0)) {
    cleanup();
  }
}

export type ScrollToSectionOptions = {
  /** Offset piksel, mis. tinggi progress bar. */
  offset?: number;
  /** Lompat tanpa animasi (reduced-motion memaksa ini). */
  immediate?: boolean;
  onComplete?: () => void;
};

/**
 * Gulir ke section. Memakai Lenis kalau aktif, selain itu `scrollTo` native.
 * `#konten` cocok untuk skip-link.
 */
export function scrollToSection(
  target: string | Element | number,
  options: ScrollToSectionOptions = {},
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const { offset = 0, immediate = false, onComplete } = options;
  const shouldBeImmediate = immediate || prefersReducedMotion();

  if (engine?.lenis) {
    engine.lenis.scrollTo(target, {
      offset,
      immediate: shouldBeImmediate,
      duration: shouldBeImmediate ? 0 : SCROLL_DURATION_SECONDS,
      onComplete,
    });
    return;
  }

  if (typeof target === 'number') {
    window.scrollTo({
      top: target + offset,
      behavior: shouldBeImmediate ? 'auto' : 'smooth',
    });
    onComplete?.();
    return;
  }

  const element =
    typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) {
    return;
  }
  const top =
    element.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({
    top,
    behavior: shouldBeImmediate ? 'auto' : 'smooth',
  });
  onComplete?.();
}

/**
 * Berlangganan progres scroll tanpa re-render. Mengembalikan pembaca nilai
 * terbaru (`getScrollProgress`) yang stabil antar render.
 */
export function useScrollProgress(
  listener?: ScrollProgressListener,
): () => number {
  const listenerRef = useRef(listener);

  useEffect(() => {
    listenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    ensureScrollEngine();
    const unsubscribe = subscribeScrollProgress((progress) => {
      listenerRef.current?.(progress);
    });
    return () => {
      unsubscribe();
      releaseScrollEngine();
    };
  }, []);

  return getScrollProgress;
}
