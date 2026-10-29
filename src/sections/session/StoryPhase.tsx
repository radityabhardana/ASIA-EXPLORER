import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, BookOpen } from 'lucide-react';
import { speak, cancelSpeech } from '@/lib/speech';

// ── Exported interface (keep compatible) ────────────────────────────────────
export interface StoryPanel {
  id: string;
  title: string;
  body: string;
  funFact: string;
  funFactLabel: string;
  backgroundVariant: 'kenali' | 'budaya' | 'bahasa' | 'kuliner';
}

interface StoryPhaseProps {
  countryId: string;
  countryName: string;
  speechLang: string;
  panels: StoryPanel[];
  onComplete: () => void;
}

// ── Photo map ────────────────────────────────────────────────────────────────
const COUNTRY_PHOTOS: Record<string, Record<string, string>> = {
  jp: {
    kenali:  '/images/countries/jp/mount-fuji-lake-960.webp',
    budaya:  '/images/countries/jp/shibuya-crossing-960.webp',
    bahasa:  '/images/countries/jp/kabukicho-neon-960.webp',
    kuliner: '/images/countries/jp/nigiri-sushi-960.webp',
  },
  kr: {
    kenali:  '/images/countries/kr/gyeongbokgung-960.webp',
    budaya:  '/images/countries/kr/gyedong-gil-street-960.webp',
    bahasa:  '/images/countries/kr/sinchon-station-sign-960.webp',
    kuliner: '/images/countries/kr/dolsot-bibimbap-960.webp',
  },
  id: {
    kenali:  '/images/countries/id/borobudur-temple-960.webp',
    budaya:  '/images/countries/id/jakarta-thamrin-bus-960.webp',
    bahasa:  '/images/countries/id/aksara-jawa-surakarta-960.webp',
    kuliner: '/images/countries/id/nasi-goreng-warung-960.webp',
  },
  th: {
    kenali:  '/images/countries/th/wat-arun-bangkok-960.webp',
    budaya:  '/images/countries/th/yaowarat-street-960.webp',
    bahasa:  '/images/countries/th/thai-sign-wat-phra-kaew-960.webp',
    kuliner: '/images/countries/th/pad-thai-bangkok-960.webp',
  },
  vn: {
    kenali:  '/images/countries/vn/ha-long-bay-960.webp',
    budaya:  '/images/countries/vn/hanoi-old-quarter-960.webp',
    bahasa:  '/images/countries/vn/hanoi-street-sign-960.webp',
    kuliner: '/images/countries/vn/bun-bo-hue-960.webp',
  },
  my: {
    kenali:  '/images/countries/my/petronas-towers-960.webp',
    budaya:  '/images/countries/my/pasar-pudu-kl-960.webp',
    bahasa:  '/images/countries/my/jawi-istana-maziah-960.webp',
    kuliner: '/images/countries/my/nasi-lemak-banana-leaf-960.webp',
  },
  ph: {
    kenali:  '/images/countries/ph/chocolate-hills-960.webp',
    budaya:  '/images/countries/ph/manila-jeepney-street-960.webp',
    bahasa:  '/images/countries/ph/makati-street-sign-960.webp',
    kuliner: '/images/countries/ph/halo-halo-laguna-960.webp',
  },
  in: {
    kenali:  '/images/countries/in/taj-mahal-960.webp',
    budaya:  '/images/countries/in/chandni-chowk-960.webp',
    bahasa:  '/images/countries/in/rani-kamlapati-board-960.webp',
    kuliner: '/images/countries/in/thali-darjeeling-960.webp',
  },
  cn: {
    kenali:  '/images/countries/cn/great-wall-badaling-960.webp',
    budaya:  '/images/countries/cn/xinyongan-road-shanghai-960.webp',
    bahasa:  '/images/countries/cn/tianzifang-signboard-960.webp',
    kuliner: '/images/countries/cn/jiaozi-dumplings-960.webp',
  },
};

// ── Framer Motion page turn variants ────────────────────────────────────────
const pageVariants = {
  enter: (dir: number) => ({
    rotateY: dir > 0 ? -90 : 90,
    opacity: 0,
    transformOrigin: dir > 0 ? 'left center' : 'right center',
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    transformOrigin: 'center',
  },
  exit: (dir: number) => ({
    rotateY: dir > 0 ? 90 : -90,
    opacity: 0,
    transformOrigin: dir > 0 ? 'right center' : 'left center',
  }),
};

const pageTransition = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 28,
};

// ── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 24, active = true) {
  const [displayed, setDisplayed] = useState(active ? '' : text);
  const [done, setDone] = useState(!active);

  useEffect(() => {
    if (!active) { setDisplayed(text); setDone(true); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed, active]);

  return { displayed, done };
}

// ── Main component ───────────────────────────────────────────────────────────
export default function StoryPhase({ countryId, countryName, speechLang, panels, onComplete }: StoryPhaseProps) {
  const [[page, dir], setPage] = useState<[number, number]>([0, 0]);

  const panel = panels[page] ?? panels[0]!;
  const photoUrl =
    (COUNTRY_PHOTOS[countryId] ?? COUNTRY_PHOTOS['jp']!)[panel.backgroundVariant]
    ?? '/images/countries/jp/mount-fuji-lake-960.webp';

  // Typewriter — active for current panel
  const { displayed } = useTypewriter(panel.body, 20, true);

  // Audio on page change
  useEffect(() => {
    cancelSpeech();
    const t = setTimeout(() => {
      speak(panel.body.slice(0, 200), { lang: speechLang, rate: 0.85 });
    }, 700);
    return () => clearTimeout(t);
  }, [page, panel.body, speechLang]);

  const handleNext = () => {
    cancelSpeech();
    if (page < panels.length - 1) {
      setPage([page + 1, 1]);
    } else {
      onComplete();
    }
  };

  const handlePrev = () => {
    if (page > 0) {
      cancelSpeech();
      setPage([page - 1, -1]);
    }
  };

  // Keyboard nav
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Mouse tilt state
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const el = bookRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const nx = (e.clientX - (r.left + r.width / 2)) / (r.width * 0.6);
      const ny = (e.clientY - (r.top + r.height / 2)) / (r.height * 0.8);
      setTilt({
        rx: Math.max(-4, Math.min(4, -ny * 4)),
        ry: Math.max(-6, Math.min(6, nx * 6)),
      });
    };
    const reset = () => setTilt({ rx: 0, ry: 0 });
    window.addEventListener('pointermove', handler, { passive: true });
    window.addEventListener('pointerleave', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointermove', handler);
      window.removeEventListener('pointerleave', reset);
      window.removeEventListener('blur', reset);
    };
  }, []);

  const [funFactOpen, setFunFactOpen] = useState(false);

  // Close fun fact when page changes
  useEffect(() => { setFunFactOpen(false); }, [page]);

  const VARIANT_LABELS: Record<string, string> = {
    kenali: 'Kenali',
    budaya: 'Budaya',
    bahasa: 'Bahasa',
    kuliner: 'Kuliner',
  };

  return (
    <div className="sb-phase">
      {/* Atmospheric paper background */}
      <div className="sb-atmo" aria-hidden="true" />

      {/* Book stage */}
      <div className="sb-stage-wrap">
        {/* Prev button */}
        <button
          className="sb-arrow sb-arrow--prev"
          onClick={handlePrev}
          disabled={page === 0}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={18} />
        </button>

        {/* 3D book */}
        <div className="sb-perspective">
          <div
            className="sb-tilt-wrap"
            ref={bookRef}
            style={{
              transform: `perspective(1600px) rotateX(${tilt.rx.toFixed(2)}deg) rotateY(${tilt.ry.toFixed(2)}deg)`,
              transition: 'transform 0.35s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            {/* Book shadow */}
            <div className="sb-book-shadow" aria-hidden="true" />

            {/* The book itself */}
            <div className="sb-book-body">
              {/* Spine */}
              <div className="sb-spine" aria-hidden="true" />

              <AnimatePresence mode="wait" custom={dir}>
                <motion.div
                  key={page}
                  className="sb-spread"
                  custom={dir}
                  variants={pageVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={pageTransition}
                >
                  {/* LEFT PAGE — full-bleed photo */}
                  <div className="sb-page sb-page--photo">
                    <img
                      src={photoUrl}
                      alt={panel.title}
                      className="sb-page-img"
                      draggable={false}
                    />
                    {/* Warm sepia overlay */}
                    <div className="sb-photo-overlay" aria-hidden="true" />
                    {/* Country + panel number watermark */}
                    <div className="sb-photo-meta">
                      <span className="sb-photo-country">{countryName}</span>
                      <span className="sb-photo-num">{page + 1} / {panels.length}</span>
                    </div>
                    {/* Left gutter shadow */}
                    <div className="sb-gutter sb-gutter--left" aria-hidden="true" />
                  </div>

                  {/* RIGHT PAGE — text content */}
                  <div className={`sb-page sb-page--text sb-page--${panel.backgroundVariant}`}>
                    {/* Right gutter shadow */}
                    <div className="sb-gutter sb-gutter--right" aria-hidden="true" />

                    <div className="sb-text-inner">
                      <span className="sb-variant-label">{VARIANT_LABELS[panel.backgroundVariant]}</span>
                      <h2 className="sb-panel-title">{panel.title}</h2>
                      <p className="sb-panel-body">
                        {displayed}
                        <span className="sb-cursor" aria-hidden="true" />
                      </p>
                    </div>

                    {/* Listen button */}
                    <button
                      className="sb-listen"
                      onClick={() => { cancelSpeech(); speak(panel.body.slice(0, 200), { lang: speechLang, rate: 0.85 }); }}
                      aria-label="Dengarkan narasi"
                    >
                      <Volume2 size={13} />
                      <span>Dengarkan</span>
                    </button>

                    {/* Page number */}
                    <div className="sb-page-num">{(page + 1) * 2}</div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Next button */}
        <button
          className="sb-arrow sb-arrow--next"
          onClick={handleNext}
          aria-label={page >= panels.length - 1 ? 'Mulai Quest' : 'Halaman berikutnya'}
        >
          {page >= panels.length - 1 ? <BookOpen size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Bottom: dots + caption */}
      <div className="sb-bottom">
        <div className="sb-dots" role="tablist" aria-label="Halaman cerita">
          {panels.map((p, i) => (
            <button
              key={p.id}
              className={`sb-dot${i === page ? ' sb-dot--active' : ''}`}
              role="tab"
              aria-selected={i === page}
              aria-label={p.title}
              onClick={() => { cancelSpeech(); setPage([i, i > page ? 1 : -1]); }}
            />
          ))}
        </div>
        <span className="sb-caption">{panel.title}</span>
      </div>

      {/* Fun fact pill */}
      <div className={`sb-ff${funFactOpen ? ' sb-ff--open' : ''}`}>
        <button
          className="sb-ff__pill"
          onClick={() => setFunFactOpen(o => !o)}
          aria-expanded={funFactOpen}
        >
          <span className="sb-ff__star">✦</span>
          <span>{funFactOpen ? 'Tutup' : panel.funFactLabel}</span>
        </button>
        {funFactOpen && (
          <div className="sb-ff__body" role="status">
            {panel.funFact}
          </div>
        )}
      </div>
    </div>
  );
}
