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
  /**
   * Sorotan 3D scene Skala (0..1). Tween sinkronisasi menulis ref ini DAN
   * teks counter dalam satu onUpdate — jumlah negara menyala selalu sama
   * dengan angka counter (audit A4).
   */
  highlight: RefObject<number>;
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
 * Semua tween hanya menyentuh transform/opacity (plus textContent counter
 * dan ref sorotan), dan tidak membaca layout di dalam loop scroll. Timing
 * tiap scene diukur ulang saat resize / orientasi / pergantian breakpoint.
 */
export function useLandingTimeline({
  root,
  progress,
  highlight,
}: LandingTimelineOptions): void {
  useEffect(() => {
    const rootElement = root.current;
    if (!rootElement) {
      return;
    }

    const counters = Array.from(
      rootElement.querySelectorAll<HTMLElement>('[data-counter]'),
    );
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
      for (const element of counters) {
        element.textContent = element.dataset.counter ?? element.textContent;
      }
      // Sorotan peta SVG / benua scene Skala ke keadaan akhir: 15 negara.
      // eslint-disable-next-line react-hooks/immutability
      highlight.current = 1;
      for (const mark of rootElement.querySelectorAll<SVGPathElement>(
        '.landing-scene--scale [data-highlight]',
      )) {
        mark.style.opacity = '1';
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

      // Bersihkan inline style sisa build sebelumnya supaya pengukuran
      // geometri tidak terdistorsi offset y/opacity tween yang lama.
      for (const element of rootElement.querySelectorAll<HTMLElement | SVGElement>(
        '[data-reveal], .landing-scene--scale [data-highlight]',
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

      // Scene 2 — skala negara: counter dan sorotan peta SVG 15 negara satu sumber di
      // syncState; teks counter = jumlah negara menyala di peta.
      const scaleWin = measureWindow(
        '.landing-scene--scale',
        '.landing-stage__copy',
      );
      if (scaleWin) {
        reveal('.landing-scene--scale .landing-stage__copy', segment(scaleWin, 0, 0.35));
        reveal('.landing-scene--scale .landing-scale__map-wrap', segment(scaleWin, 0.08, 0.45));

        const counterEl = rootElement.querySelector<HTMLElement>(
          '.landing-scene--scale [data-counter]',
        );
        const marks = queryAll<SVGPathElement>(
          '.landing-scene--scale [data-highlight]',
        );
        const syncSegment = segment(scaleWin, 0.15, 0.85);
        if (counterEl && syncSegment.duration > 0) {
          const syncState = { value: 0 };
          counterEl.textContent = '0';
          for (const m of marks) {
            m.style.opacity = '0.2';
          }
          tl.fromTo(
            syncState,
            { value: 0 },
            {
              value: 15,
              duration: syncSegment.duration,
              ease: 'none',
              onUpdate: () => {
                const count = Math.min(
                  15,
                  Math.max(0, Math.round(syncState.value)),
                );
                counterEl.textContent = String(count);
                highlight.current = count / 15;
                for (let i = 0; i < marks.length; i++) {
                  const mark = marks[i];
                  if (mark) {
                    mark.style.opacity = i < count ? '1' : '0.2';
                  }
                }
              },
            },
            syncSegment.at,
          );
          tl.to(
            '.landing-scene--scale',
            { opacity: 0, duration: segment(scaleWin, 0.85, 0.98).duration },
            segment(scaleWin, 0.85, 0.98).at,
          );
        }
      }

      // Scene 4 — marquee aksara (K12).
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

      // Scene 6 — dashboard & sistem belajar.
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

      // Scene 5 — peta interaktif (undangan penjelajahan).
      const invitationWin = measureWindow(
        '.landing-scene--invitation',
        '.landing-stage__copy',
      );
      if (invitationWin) {
        reveal(
          '.landing-scene--invitation .landing-stage__copy',
          segment(invitationWin, 0, 0.4),
        );
        reveal(
          '.landing-invitation__scene',
          segment(invitationWin, 0.15, 0.85),
        );
      }

      // Scene Mosaic — 15 Negara, Satu Benua
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

      trigger = ScrollTrigger.create({
        trigger: rootElement,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        animation: tl,
        onUpdate: (self) => {
          progress.current = self.progress;
        },
      });
    };

    /**
     * Timeline dibangun setelah font selesai dimuat (audit putaran koreksi
     * 1): tinggi teks dan posisi scene bisa bergeser saat font selesai
     * di-swap, dan jendela reveal yang diukur dari geometri DOM nyata
     * menjadi basi bila dibangun sebelum itu. `document.fonts.ready` hanya
     * menggulirkan ScrollTrigger.refresh() tanpa membangun ulang tween
     * lama, jadi ukur window dari geometri final lewat build di sini.
     */
    let cancelled = false;
    let fontsSettled: Promise<void> | null = null;
    const buildWhenFontsSettle = async (): Promise<void> => {
      if (!fontsSettled) {
        fontsSettled = document.fonts.ready
          .catch(() => undefined)
          .then(() => undefined);
      }
      await fontsSettled;
      if (cancelled) {
        return;
      }
      build();
      if (trigger) {
        ScrollTrigger.refresh();
      }
    };

    void buildWhenFontsSettle();

    const rebuild = () => {
      if (trigger) {
        trigger.kill();
        trigger = null;
      }
      timeline?.kill();
      timeline = null;
      void buildWhenFontsSettle();
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
  }, [root, progress, highlight]);
}
