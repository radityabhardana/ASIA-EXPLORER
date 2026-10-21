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
 * doc 8986 px, bukan 920vh). Jendela kini diukur dari geometri DOM nyata:
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
 * Semua tween hanya menyentuh transform/opacity (plus textContent counter),
 * dan tidak membaca layout di dalam loop scroll. Timing tiap scene diukur
 * ulang saat resize / orientasi / pergantian breakpoint.
 */
export function useLandingTimeline({ root, progress }: LandingTimelineOptions): void {
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
        '[data-reveal], [data-highlight]',
      )) {
        element.style.opacity = '1';
        element.style.transform = 'none';
      }
      for (const element of counters) {
        element.textContent = element.dataset.counter ?? element.textContent;
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
      for (const element of rootElement.querySelectorAll<HTMLElement>(
        '[data-reveal], [data-highlight], .landing-lang__sil',
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

      const counter = (
        selector: string,
        value: number,
        segment: Segment,
        ease: string,
      ): void => {
        const element = rootElement.querySelector<HTMLElement>(selector);
        if (!element || segment.duration <= 0) {
          return;
        }
        const state = { value: 0 };
        element.textContent = '0';
        tl.to(
          state,
          {
            value,
            duration: segment.duration,
            ease,
            onUpdate: () => {
              element.textContent = String(Math.floor(state.value));
            },
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

      const isMobile = mobileQuery?.matches ?? false;

      // Scene 1 — hero. H1 harus opacity 1 di progres 0 (cacat 1).
      const heroCopy = queryAll<HTMLElement>('.landing-hero__copy');
      if (heroCopy.length > 0) {
        tl.set(heroCopy, { opacity: 1, y: 0 }, 0);
      }
      reveal('.landing-hero__hint', { at: 0.05, duration: 0.02 });

      // Scene 2 — skala negara.
      const scaleWin = measureWindow(
        '.landing-scene--scale',
        '.landing-stage__copy',
      );
      if (scaleWin) {
        reveal('.landing-scene--scale .landing-stage__copy', segment(scaleWin, 0, 0.35));
        reveal('.landing-scene--scale .landing-map-wrap', segment(scaleWin, 0.1, 0.55));

        const counterEl = rootElement.querySelector<HTMLElement>(
          '.landing-scene--scale [data-counter]',
        );
        const highlights = queryAll<SVGElement>(
          '.landing-scene--scale [data-highlight]',
        );

        const syncSegment = segment(scaleWin, 0.15, 0.85);
        if (counterEl || highlights.length > 0) {
          const syncState = { value: 0 };
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
                if (counterEl) {
                  counterEl.textContent = String(count);
                }
                for (let i = 0; i < highlights.length; i++) {
                  highlights[i]!.style.opacity = i < count ? '1' : '0.16';
                }
              },
            },
            syncSegment.at,
          );
        }
      }

      // Scene 3 — kedalaman bahasa.
      const languageWin = measureWindow(
        '.landing-scene--language',
        '.landing-stage__copy',
      );
      if (languageWin) {
        const silhouette = rootElement.querySelector<HTMLElement>(
          '.landing-lang__sil',
        );
        if (silhouette) {
          tl.fromTo(
            silhouette,
            isMobile ? { x: 0, y: '100vh' } : { x: '100vw', y: 0 },
            { x: 0, y: 0, duration: segment(languageWin, 0, 0.5).duration, ease: 'power2.out' },
            languageWin.at,
          );
        }
        reveal(
          '.landing-scene--language .landing-stage__copy',
          segment(languageWin, 0.05, 0.4),
        );
        counter(
          '.landing-scene--language [data-counter]',
          718,
          segment(languageWin, 0.15, 0.75),
          'power3.out',
        );
      }

      // Scene 4 — triptych aksara.
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
          '.landing-script__card',
          segment(scriptWin, 0.1, 0.36),
          scriptWin.w * 0.06,
        );
      }

      // Scene 5 — tapestry regional.
      const regionalWin = measureWindow(
        '.landing-scene--regional',
        '.landing-stage__copy',
      );
      if (regionalWin) {
        reveal(
          '.landing-scene--regional .landing-stage__copy',
          segment(regionalWin, 0, 0.35),
        );
        reveal(
          '.landing-regional__reveal',
          segment(regionalWin, 0.08, 0.45),
          regionalWin.w * 0.05,
        );
        if (!isMobile) {
          for (const layer of queryAll<HTMLElement>(
            '.landing-scene--regional [data-parallax]',
          )) {
            const ratio = Number(layer.dataset.parallax ?? '1');
            // Parallax desktop memakai jadwal timeline unit yang diterima
            // (P2.2): proporsional terhadap doc, bukan jendela reveal scene.
            tl.fromTo(
              layer,
              { y: 0 },
              {
                y: `${(55 * (ratio - 1)).toFixed(2)}vh`,
                duration: 0.12,
                ease: 'none',
              },
              510 / 920,
            );
          }
        }
      }

      // Scene 6 — vignette budaya.
      const culturalWin = measureWindow(
        '.landing-scene--cultural',
        '.landing-stage__copy',
      );
      if (culturalWin) {
        reveal(
          '.landing-scene--cultural .landing-stage__copy',
          segment(culturalWin, 0, 0.35),
        );
        reveal(
          '.landing-cultural__reveal',
          segment(culturalWin, 0.1, 0.4),
          culturalWin.w * 0.05,
        );
        reveal(
          '.landing-cultural__icon',
          segment(culturalWin, 0.25, 0.45),
          culturalWin.w * 0.05,
        );
        if (!isMobile) {
          for (const layer of queryAll<HTMLElement>(
            '.landing-scene--cultural [data-parallax]',
          )) {
            const ratio = Number(layer.dataset.parallax ?? '1');
            // Timing yang diterima: mulai 620/920, selesai 200 px skrol
            // sebelum sampel gate P0 = jarak caption/layer yang diterima.
            tl.fromTo(
              layer,
              { y: 0 },
              {
                y: `${(55 * (ratio - 1)).toFixed(2)}vh`,
                duration: 0.13,
                ease: 'none',
              },
              620 / 920,
            );
          }
        }
      }

      // Scene 7 — undangan interaktif.
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

      // Scene 8 — sumber data.
      const footerWin = measureWindow(
        '.landing-scene--footer',
        '.landing-footer__copy',
      );
      if (footerWin) {
        reveal('.landing-footer__copy', segment(footerWin, 0, 0.3));
        reveal(
          '.landing-footer__links li',
          segment(footerWin, 0.1, 0.8),
          footerWin.w * 0.03,
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

    build();

    const rebuild = () => {
      if (trigger) {
        trigger.kill();
        trigger = null;
      }
      timeline?.kill();
      timeline = null;
      build();
      if (trigger) {
        ScrollTrigger.refresh();
      }
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

    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) {
        ScrollTrigger.refresh();
      }
    });

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
