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

/*
 * Rentang timeline diturunkan dari tinggi scene §0.8 (total 920vh), bukan
 * persentase §2 yang mengasumsikan 1120vh. Angka = offset atas scene / 920.
 */
export const SCENE_RANGES = {
  hero: 0,
  scale: 100 / 920,
  language: 220 / 920,
  script: 370 / 920,
  regional: 510 / 920,
  cultural: 620 / 920,
  invitation: 740 / 920,
  footer: 840 / 920,
} as const;

const {
  scale: SCALE,
  language: LANGUAGE,
  script: SCRIPT,
  regional: REGIONAL,
  cultural: CULTURAL,
  invitation: INVITATION,
  footer: FOOTER,
} = SCENE_RANGES;

type LandingTimelineOptions = {
  root: RefObject<HTMLDivElement | null>;
  /** Dibaca `AsiaScene` per frame; ditulis dari progres ScrollTrigger. */
  progress: RefObject<number>;
};

/**
 * Satu timeline GSAP untuk seluruh halaman, di-scrub langsung oleh scroll.
 * Semua tween hanya menyentuh transform/opacity (plus textContent counter),
 * dan tidak membaca layout di dalam loop scroll.
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

      timeline = gsap.timeline({ defaults: { ease: 'none' } });
      const tl = timeline;
      // Penjaga durasi: progres 0..1 dipetakan persis ke seluruh timeline.
      tl.to({}, { duration: 1 }, 0);

      const query = <T extends Element>(selector: string): T | null =>
        rootElement.querySelector<T>(selector);
      const queryAll = <T extends Element>(selector: string): T[] =>
        Array.from(rootElement.querySelectorAll<T>(selector));

      const reveal = (
        selector: string,
        at: number,
        duration = 0.03,
        stagger = 0,
      ) => {
        const targets = queryAll<HTMLElement>(selector);
        if (targets.length === 0) {
          return;
        }
        tl.fromTo(
          targets,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration, stagger, ease: 'power2.out' },
          at,
        );
      };

      const fadeOut = (selector: string, at: number, duration = 0.02) => {
        const targets = queryAll<HTMLElement>(selector);
        if (targets.length === 0) {
          return;
        }
        tl.to(targets, { opacity: 0, duration }, at);
      };

      const counter = (
        selector: string,
        value: number,
        at: number,
        duration: number,
      ) => {
        const element = query<HTMLElement>(selector);
        if (!element) {
          return;
        }
        const state = { value: 0 };
        element.textContent = '0';
        tl.to(
          state,
          {
            value,
            duration,
            ease: 'power3.out',
            onUpdate: () => {
              element.textContent = String(Math.floor(state.value));
            },
          },
          at,
        );
      };

      const isMobile = mobileQuery?.matches ?? false;

      // Scene 1 — hero. H1 harus opacity 1 di progres 0 (cacat 1).
      const heroCopy = queryAll<HTMLElement>('.landing-hero__copy');
      if (heroCopy.length > 0) {
        tl.set(heroCopy, { opacity: 1, y: 0 }, 0);
      }
      reveal('.landing-hero__hint', 0.05, 0.02);

      // Scene 2 — skala negara.
      reveal('.landing-scene--scale .landing-stage__copy', SCALE, 0.02);
      reveal('.landing-scene--scale .landing-map-wrap', SCALE + 0.002, 0.025);
      counter('.landing-scene--scale [data-counter]', 15, SCALE + 0.01, 0.045);
      const highlights = queryAll<SVGElement>(
        '.landing-scene--scale [data-highlight]',
      );
      if (highlights.length > 0) {
        tl.fromTo(
          highlights,
          { opacity: 0.16 },
          { opacity: 1, duration: 0.006, stagger: 0.004, ease: 'none' },
          SCALE + 0.014,
        );
      }
      fadeOut('.landing-scene--scale .landing-stage__copy', SCALE + 0.085, 0.02);

      // Scene 3 — kedalaman bahasa.
      const silhouette = query<HTMLElement>('.landing-lang__sil');
      if (silhouette) {
        tl.fromTo(
          silhouette,
          isMobile ? { x: 0, y: '100vh' } : { x: '100vw', y: 0 },
          { x: 0, y: 0, duration: 0.04, ease: 'power2.out' },
          LANGUAGE,
        );
      }
      reveal(
        '.landing-scene--language .landing-stage__copy',
        LANGUAGE + 0.006,
        0.025,
      );
      counter('.landing-scene--language [data-counter]', 718, LANGUAGE + 0.012, 0.045);

      // Scene 4 — filmstrip aksara.
      reveal('.landing-scene--script .landing-stage__copy', SCRIPT, 0.02);
      reveal('.landing-script__card', SCRIPT + 0.002, 0.004, 0.005);
      if (!isMobile) {
        const track = query<HTMLElement>('.landing-script__track');
        if (track) {
          tl.fromTo(
            track,
            { x: 0 },
            { x: '-44vw', duration: 0.044, ease: 'none' },
            SCRIPT,
          );
        }
      }

      // Scene 5 — tapestry regional.
      reveal('.landing-scene--regional .landing-stage__copy', REGIONAL, 0.02);
      reveal('.landing-regional__reveal', REGIONAL + 0.004, 0.02, 0.006);
      if (!isMobile) {
        for (const layer of queryAll<HTMLElement>(
          '.landing-scene--regional [data-parallax]',
        )) {
          const ratio = Number(layer.dataset.parallax ?? '1');
          tl.fromTo(
            layer,
            { y: 0 },
            {
              y: `${(55 * (ratio - 1)).toFixed(2)}vh`,
              duration: 0.12,
              ease: 'none',
            },
            REGIONAL,
          );
        }
      }
      fadeOut(
        '.landing-scene--regional .landing-stage__copy',
        REGIONAL + 0.09,
        0.025,
      );

      // Scene 6 — vignette budaya.
      reveal('.landing-scene--cultural .landing-stage__copy', CULTURAL, 0.02);
      reveal('.landing-cultural__reveal', CULTURAL + 0.004, 0.02, 0.008);
      reveal('.landing-cultural__icon', CULTURAL + 0.012, 0.02, 0.006);
      if (!isMobile) {
        for (const layer of queryAll<HTMLElement>(
          '.landing-scene--cultural [data-parallax]',
        )) {
          const ratio = Number(layer.dataset.parallax ?? '1');
          tl.fromTo(
            layer,
            { y: 0 },
            {
              y: `${(55 * (ratio - 1)).toFixed(2)}vh`,
              duration: 0.13,
              ease: 'none',
            },
            CULTURAL,
          );
        }
      }
      fadeOut(
        '.landing-scene--cultural .landing-stage__copy',
        CULTURAL + 0.11,
        0.02,
      );

      // Scene 7 — undangan interaktif.
      reveal('.landing-scene--invitation .landing-stage__copy', INVITATION, 0.02);
      reveal('.landing-invitation__scene', INVITATION + 0.004, 0.03);

      // Scene 8 — sumber data.
      reveal('.landing-footer__copy', FOOTER, 0.02);
      reveal('.landing-footer__links li', FOOTER + 0.008, 0.02, 0.004);

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

    const handleMotionChange = () => {
      trigger?.kill();
      trigger = null;
      timeline?.kill();
      timeline = null;
      build();
    };

    reducedQuery?.addEventListener('change', handleMotionChange);

    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) {
        ScrollTrigger.refresh();
      }
    });

    return () => {
      cancelled = true;
      reducedQuery?.removeEventListener('change', handleMotionChange);
      trigger?.kill();
      timeline?.kill();
    };
  }, [root, progress]);
}
