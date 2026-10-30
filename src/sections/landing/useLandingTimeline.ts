import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useEffect } from 'react';
import type { RefObject } from 'react';

// ScrollTrigger memanggil `window.matchMedia` saat registrasi; di jsdom/SSR
// objek itu tidak ada. Registrasi ditunda sampai ada lingkungan browser nyata.
if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(ScrollTrigger);
}

function matchMediaSafe(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }
  return window.matchMedia(query);
}

/** Progres 0..1 dipetakan ke seluruh timeline oleh satu ScrollTrigger scrub. */

type LandingTimelineOptions = {
  root: RefObject<HTMLDivElement | null>;
  /** Dibaca `AsiaScene` per frame; ditulis dari progres ScrollTrigger. */
  progress: RefObject<number>;
};

type ScrollWindow = {
  /** Awal reveal dalam satuan waktu timeline (fraksi gulir dokumen). */
  at: number;
  /** Panjang jendela dalam satuan waktu timeline. */
  w: number;
};

/**
 * Jendela reveal tidak bisa lagi pakai pecahan vh desktop yang di-hard-code:
 * tinggi scene relatif terhadap doc berubah per leviewport (mobile 375 punya
 * doc ~810vh, bukan 920vh). Jendela kini diukur dari geometri DOM nyata:
 * - mulai saat tepi atas scene berada ~78% dari atas viewport;
 * - selesai sebelum blok copy menyentuh 20% teratas viewport;
 * - jendela dipotong maksimum 60% viewport dan minimum 20% viewport.
 */
const REVEAL_START_VIEWPORT = 0.78;
const REVEAL_END_COPY = 0.2;
const WINDOW_RATIO_CAP = 0.6;
const WINDOW_RATIO_MIN = 0.2;

/**
 * Satu timeline GSAP untuk seluruh halaman, di-scrub langsung oleh scroll.
 * Semua tween hanya menyentuh transform/opacity, dan tidak membaca layout di
 * dalam loop scroll. Timing tiap scene diukur ulang saat resize / orientasi /
 * pergantian breakpoint.
 */
export function useLandingTimeline({
  root,
  progress,
}: LandingTimelineOptions): void {
  useEffect(() => {
    const rootElement = root.current;
    if (!rootElement) {
      return;
    }

    const reducedQuery = matchMediaSafe('(prefers-reduced-motion: reduce)');
    const mobileQuery = matchMediaSafe('(max-width: 767px)');
    const tabletQuery = matchMediaSafe('(max-width: 899px)');

    let timeline: gsap.core.Timeline | null = null;
    let trigger: ScrollTrigger | null = null;

    const setFinalState = () => {
      for (const element of rootElement.querySelectorAll<HTMLElement>(
        '[data-reveal]',
      )) {
        element.style.opacity = '1';
        element.style.transform = 'none';
      }
      // `progress` adalah ref milik pemanggil (bukan props render). Menulis
      // `.current` di dalam effect adalah pemakaian ref yang sah; aturan
      // immutability tidak bisa membedakan ref dari nilai biasa.
      // eslint-disable-next-line react-hooks/immutability
      progress.current = 0;
    };

    // Tanpa matchMedia (jsdom, SSR) tidak ada yang bisa di-scrub: tampilkan
    // keadaan akhir dan jangan sentuh ScrollTrigger sama sekali.
    if (!reducedQuery || !mobileQuery) {
      setFinalState();
      return;
    }

    const build = () => {
      if (reducedQuery?.matches) {
        setFinalState();
        return;
      }

      if (trigger) {
        trigger.kill();
        trigger = null;
      }
      if (timeline) {
        timeline.kill();
        timeline = null;
      }

      // Bersihkan inline style sisa build sebelumnya supaya pengukuran
      // geometri tidak terdistorsi offset y/opacity tween yang lama.
      for (const element of rootElement.querySelectorAll<HTMLElement>(
        '[data-reveal]',
      )) {
        element.style.removeProperty('opacity');
        element.style.removeProperty('transform');
      }

      timeline = gsap.timeline({ defaults: { ease: 'none' } });
      const tl = timeline;
      // Penjaga durasi: progres 0..1 dipetakan persis ke seluruh timeline.
      tl.to({}, { duration: 1 }, 0);

      const viewport = window.innerHeight;
      const total = document.documentElement.scrollHeight - viewport;
      const doc = Math.max(1, total);

      const pageTop = (element: Element): number =>
        element.getBoundingClientRect().top + window.scrollY;
      /** Konversi posisi gulir (px) ke satuan waktu timeline. */
      const unit = (y: number): number =>
        Math.min(1, Math.max(0, y / doc));

      const clampUnit = (value: number): number =>
        Math.min(1, Math.max(0, value));

      const queryAll = <T extends Element>(selector: string): T[] =>
        Array.from(rootElement.querySelectorAll<T>(selector));

      type Segment = { at: number; duration: number };

      const measureWindow = (
        sectionSelector: string,
        copySelector: string,
      ): ScrollWindow | null => {
        const section = rootElement.querySelector(sectionSelector);
        const copy = section?.querySelector(copySelector) ?? null;
        const stage = section?.querySelector('.landing-stage') ?? null;
        if (!section || !copy || !stage) {
          return null;
        }
        const sceneTop = pageTop(section);
        const stageTop = pageTop(stage);
        const copyDocTop = pageTop(copy);
        // Posisi copy saat stage belum menempel (sticky) = posisi doc
        // dikurangi offset relatif dalam stage yang terukur saat ini.
        const copyRestDocTop = sceneTop + (copyDocTop - stageTop);

        const start = sceneTop - REVEAL_START_VIEWPORT * viewport;
        const endByCopy = copyRestDocTop - REVEAL_END_COPY * viewport;
        const capped = start + WINDOW_RATIO_CAP * viewport;
        let end = Math.min(endByCopy, capped, doc);
        end = Math.max(end, start + WINDOW_RATIO_MIN * viewport);
        const clampedStart = Math.max(0, start);
        const w = Math.max(1, Math.min(end, doc) - clampedStart);
        return { at: unit(clampedStart), w: w / doc };
      };

      const reveal = (
        selector: string,
        segment: Segment,
        stagger = 0,
      ): void => {
        const targets = queryAll<HTMLElement>(selector);
        if (targets.length === 0) {
          return;
        }
        tl.fromTo(
          targets,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: segment.duration,
            stagger,
            ease: 'power2.out',
          },
          segment.at,
        );
      };

      /** Sub-jendela dari reveal window, dalam fraksi panjang jendela. */
      const segment = (
        win: ScrollWindow,
        from: number,
        to: number,
      ): Segment => ({
        at: clampUnit(win.at + win.w * from),
        duration: clampUnit(win.w * (to - from)),
      });

      // Scene 1 — hero. H1 harus opacity 1 di progres 0 (cacat 1).
      const heroCopy = queryAll<HTMLElement>('.landing-hero__copy');
      if (heroCopy.length > 0) {
        tl.set(heroCopy, { opacity: 1, y: 0 }, 0);
      }
      // .landing-hint tampil lewat [data-intro] (reveal preloader), bukan tween.

      // Scene 2 — marquee aksara (K12).
      const scriptWin = measureWindow(
        '.landing-scene--script',
        '.landing-stage__copy',
      );
      if (scriptWin) {
        reveal(
          '.landing-scene--script .landing-stage__copy',
          segment(scriptWin, 0, 0.3),
        );
        reveal(
          '.landing-script__band',
          segment(scriptWin, 0.08, 0.32),
        );
      }

      // Scene 3 — Scene Mosaic (15 Negara, Satu Benua).
      const mosaicWin = measureWindow(
        '.landing-scene--mosaic',
        '.landing-stage__copy',
      );
      if (mosaicWin) {
        reveal(
          '.landing-scene--mosaic .landing-stage__copy',
          segment(mosaicWin, 0, 0.35),
        );
        reveal(
          '.landing-mosaic__grid',
          segment(mosaicWin, 0.06, 0.4),
        );
        reveal(
          '.landing-mosaic__legal',
          segment(mosaicWin, 0.12, 0.45),
        );
      }

      // Scene 4 — dashboard & sistem belajar.
      const dashboardWin = measureWindow(
        '.landing-scene--dashboard',
        '.landing-stage__copy',
      );
      if (dashboardWin) {
        reveal(
          '.landing-scene--dashboard .landing-stage__copy',
          segment(dashboardWin, 0, 0.35),
        );
        reveal(
          '.landing-dashboard__grid',
          segment(dashboardWin, 0.08, 0.4),
        );
        reveal(
          '.landing-dashboard__actions',
          segment(dashboardWin, 0.15, 0.45),
        );
      }

      ScrollTrigger.clearScrollMemory?.();
      trigger = ScrollTrigger.create({
        trigger: rootElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    };

    let cancelled = false;

    // 1. Bangun timeline dan ScrollTrigger seketika saat mount (mencegah delay scroll)
    build();

    // 2. Saat font selesai dimuat, JANGAN bangun ulang timeline dari 0 (mencegah "mental balik ke atas").
    // Cukup panggil ScrollTrigger.refresh() untuk menyelaraskan geometri.
    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready
        .then(() => {
          if (!cancelled && trigger) {
            ScrollTrigger.refresh();
          }
        })
        .catch(() => undefined);
    }

    const rebuild = () => {
      if (cancelled) {
        return;
      }
      build();
      ScrollTrigger.refresh();
    };

    const handleMotionChange = () => rebuild();

    reducedQuery?.addEventListener('change', handleMotionChange);
    mobileQuery?.addEventListener('change', handleMotionChange);
    tabletQuery?.addEventListener('change', handleMotionChange);

    // Geometri halaman berubah saat rotasi perangkat atau resize: jendela
    // reveal diukur ulang supaya mengikuti offset scene yang baru.
    let resizeFrame = 0;
    const scheduleRebuild = () => {
      if (resizeFrame !== 0) {
        return;
      }
      resizeFrame = requestAnimationFrame(() => {
        resizeFrame = 0;
        rebuild();
      });
    };
    window.addEventListener('resize', scheduleRebuild);
    window.addEventListener('orientationchange', scheduleRebuild);

    return () => {
      cancelled = true;
      reducedQuery?.removeEventListener('change', handleMotionChange);
      mobileQuery?.removeEventListener('change', handleMotionChange);
      tabletQuery?.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', scheduleRebuild);
      window.removeEventListener('orientationchange', scheduleRebuild);
      if (resizeFrame !== 0) {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = 0;
      }
      trigger?.kill();
      timeline?.kill();
    };
  }, [root, progress]);
}
