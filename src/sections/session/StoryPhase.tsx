import { useEffect, useRef, useState, useCallback, type ReactElement } from 'react';
import { ChevronLeft, ChevronRight, Volume2, BookOpen } from 'lucide-react';
import { speak, cancelSpeech } from '@/lib/speech';

// ── Exported interface (keep compatible) ───────────────────────────────────
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

// ── SVG cultural illustrations per variant ─────────────────────────────────
function CulturalIllustration({ variant }: { variant: StoryPanel['backgroundVariant'] }) {
  const ILLUSTRATIONS: Record<StoryPanel['backgroundVariant'], ReactElement> = {
    kenali: (
      <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <circle cx="200" cy="140" r="110" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="4 6" opacity="0.3"/>
        <circle cx="200" cy="140" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.2"/>
        <circle cx="200" cy="140" r="50" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.15"/>
        <path d="M200 40 L207 130 L200 140 L193 130 Z" fill="currentColor" opacity="0.6"/>
        <path d="M200 240 L207 150 L200 140 L193 150 Z" fill="currentColor" opacity="0.25"/>
        <path d="M100 140 L190 147 L200 140 L190 133 Z" fill="currentColor" opacity="0.25"/>
        <path d="M300 140 L210 147 L200 140 L210 133 Z" fill="currentColor" opacity="0.6"/>
        {Array.from({ length: 32 }, (_, i) => {
          const a = (i / 32) * Math.PI * 2;
          const r1 = i % 8 === 0 ? 115 : i % 4 === 0 ? 112 : 110;
          return (
            <line
              key={i}
              x1={200 + Math.cos(a) * r1}
              y1={140 + Math.sin(a) * r1}
              x2={200 + Math.cos(a) * 120}
              y2={140 + Math.sin(a) * 120}
              stroke="currentColor"
              strokeWidth="0.7"
              opacity="0.3"
            />
          );
        })}
        {([[160,120],[240,115],[195,155],[225,145],[175,160],[210,130]] as [number,number][]).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3} fill="currentColor" opacity="0.25"/>
        ))}
        <text x="200" y="200" textAnchor="middle" fontFamily="serif" fontSize="11" fill="currentColor" opacity="0.35" letterSpacing="4">ATLAS</text>
      </svg>
    ),
    budaya: (
      <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {[1,2,3,4,5,6,7,8].map(i => (
          <g key={i} transform={`rotate(${i * 45} 200 140)`}>
            <ellipse cx="200" cy="85" rx="8" ry="22" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.35"/>
            <path d="M200 63 Q210 74 200 85 Q190 74 200 63" fill="currentColor" opacity="0.2"/>
          </g>
        ))}
        <circle cx="200" cy="140" r="38" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3"/>
        <circle cx="200" cy="140" r="22" fill="none" stroke="currentColor" strokeWidth="0.7" opacity="0.2"/>
        <circle cx="200" cy="140" r="8" fill="currentColor" opacity="0.2"/>
        {[55, 90, 125].map(r => (
          <circle key={r} cx="200" cy="140" r={r} fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="2 8" opacity="0.2"/>
        ))}
      </svg>
    ),
    bahasa: (
      <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M80 160 Q120 100 200 120 Q280 140 320 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.3"/>
        <path d="M80 180 Q130 130 200 145 Q270 160 320 125" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.2"/>
        <path d="M100 200 Q160 155 200 165 Q255 178 310 150" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.15"/>
        {([[200,110],[205,130],[195,108],[210,125]] as [number,number][]).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.5" fill="currentColor" opacity="0.25"/>
        ))}
        {[100,120,140,160,180,200].map(y => (
          <line key={y} x1="70" y1={y} x2="330" y2={y} stroke="currentColor" strokeWidth="0.4" opacity="0.1"/>
        ))}
        <text x="200" y="240" textAnchor="middle" fontFamily="serif" fontSize="28" fill="currentColor" opacity="0.18" letterSpacing="6">語 말 बोली</text>
      </svg>
    ),
    kuliner: (
      <svg viewBox="0 0 400 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <ellipse cx="200" cy="190" rx="90" ry="12" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.15"/>
        {([160, 200, 240] as number[]).map((x, i) => {
          const offsets = [[-10, -20, -18, -25, 30], [0, 0, 0, 0, -15], [10, 20, 18, 25, -30]] as const;
          const [offX, leafOffX, leafOffX2, rot1, rot2] = offsets[i]!;
          return (
            <g key={i}>
              <line x1={x} y1="185" x2={x + offX} y2="80" stroke="currentColor" strokeWidth="1" opacity="0.25"/>
              <ellipse cx={x + leafOffX} cy="72" rx="18" ry="11" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" transform={`rotate(${rot1} ${x + leafOffX} 72)`}/>
              <ellipse cx={x + leafOffX2} cy="90" rx="14" ry="8" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.2" transform={`rotate(${rot2} ${x + leafOffX2} 90)`}/>
            </g>
          );
        })}
        {([[180,130],[200,115],[220,128],[195,145],[210,140]] as [number,number][]).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={3 + i * 0.5} fill="currentColor" opacity="0.2"/>
        ))}
        <path d="M140 190 Q200 175 260 190 Q200 205 140 190" fill="currentColor" opacity="0.08"/>
      </svg>
    ),
  };
  return ILLUSTRATIONS[variant] ?? ILLUSTRATIONS.kenali;
}

// ── Typewriter hook ────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
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

// ── Top-level PanelContent (outside main component to avoid remount) ─────────
function PanelContent({
  panel,
  side,
  panelIndex,
  active,
  speechLang: _speechLang,
}: {
  panel: StoryPanel;
  side: 'left' | 'right';
  panelIndex: number;
  active: boolean;
  speechLang: string;
}) {
  const { displayed } = useTypewriter(panel.body, 22, active);
  return (
    <div className={`sb-panel-content sb-panel-content--${panel.backgroundVariant} sb-panel-content--${side}`}>
      <div className="sb-panel-illustration">
        <CulturalIllustration variant={panel.backgroundVariant} />
      </div>
      <div className="sb-panel-text">
        <span className="sb-panel-tag">{panel.backgroundVariant}</span>
        <h2 className="sb-panel-title">{panel.title}</h2>
        <p className="sb-panel-body">{displayed}</p>
      </div>
      {side === 'left' && <div className="sb-page-number sb-page-number--left">{panelIndex * 2 + 1}</div>}
      {side === 'right' && <div className="sb-page-number sb-page-number--right">{panelIndex * 2 + 2}</div>}
    </div>
  );
}

// ── Page curl constants ────────────────────────────────────────────────────
const N_STRIPS = 14;
const SPAN = 0.46;
const BETA = 0.55;

interface TurnState { dir: 'next' | 'prev'; from: number; to: number; t: number; }

// ── Main component ─────────────────────────────────────────────────────────
export default function StoryPhase({ countryId: _countryId, countryName: _countryName, speechLang, panels, onComplete }: StoryPhaseProps) {
  const M = panels.length;
  const bookRef = useRef<HTMLDivElement>(null);

  const [idx, setIdx] = useState(0);
  const [turn, setTurn] = useState<TurnState | null>(null);
  const [viewRx, setViewRx] = useState(0);
  const [viewRy, setViewRy] = useState(0);
  const [introPlayed, setIntroPlayed] = useState(false);

  // Spring animation refs
  const springRef = useRef<{ t: number; v: number; target: number; done?: () => void } | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const turnRef = useRef<TurnState | null>(null);
  const idxRef = useRef(0);
  const dragRef = useRef<{ dir: 'next' | 'prev'; x0: number; moved: number; vel: number; tPrev: number } | null>(null);

  useEffect(() => { turnRef.current = turn; }, [turn]);
  useEffect(() => { idxRef.current = idx; }, [idx]);

  // ── Sync --bw for curl strip geometry ──────────────────────────────────
  useEffect(() => {
    const book = bookRef.current;
    if (!book) return;
    const sync = () => {
      const w = book.clientWidth;
      book.style.setProperty('--bw', w + 'px');
      // also set on sb-curl children
      book.querySelectorAll<HTMLElement>('.sb-curl').forEach(c => c.style.setProperty('--bw', w + 'px'));
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(book);
    window.addEventListener('resize', sync);
    return () => { ro.disconnect(); window.removeEventListener('resize', sync); };
  }, []);

  // ── Audio on page open ─────────────────────────────────────────────────
  useEffect(() => {
    const panel = panels[idx];
    if (!panel) return;
    cancelSpeech();
    const t = setTimeout(() => {
      speak(panel.body.slice(0, 180), { lang: speechLang, rate: 0.85 });
    }, 600);
    return () => clearTimeout(t);
  }, [idx, panels, speechLang]);

  // ── Spring loop ────────────────────────────────────────────────────────
  const tick = useCallback((now: number) => {
    rafRef.current = null;
    const dt = Math.min(0.032, (now - lastRef.current) / 1000 || 0.016);
    lastRef.current = now;

    if (springRef.current && turnRef.current) {
      const s = springRef.current;
      const x = turnRef.current.t - s.target;
      s.v += (-150 * x - 24 * s.v) * dt;
      const newT = turnRef.current.t + s.v * dt;
      turnRef.current.t = newT;
      setTurn({ ...turnRef.current });

      if (Math.abs(newT - s.target) < 0.003 && Math.abs(s.v) < 0.02) {
        turnRef.current.t = s.target;
        springRef.current = null;
        const done = s.done;
        if (s.target >= 1) {
          const to = turnRef.current.to;
          idxRef.current = to;
          setIdx(to);
          turnRef.current = null;
          setTurn(null);
        } else {
          turnRef.current = null;
          setTurn(null);
        }
        done?.();
        return;
      }
    }

    if (springRef.current || turnRef.current) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  const kick = useCallback(() => {
    if (rafRef.current === null) {
      lastRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const animateTo = useCallback((target: number, done?: () => void) => {
    springRef.current = { t: turnRef.current?.t ?? 0, v: 0, target, done };
    kick();
  }, [kick]);

  // ── Turn control ───────────────────────────────────────────────────────
  const startTurn = useCallback((dir: 'next' | 'prev', t = 0) => {
    springRef.current = null;
    const from = idxRef.current;
    const to = dir === 'next' ? (from + 1) % M : (from - 1 + M) % M;
    const newTurn = { dir, from, to, t };
    turnRef.current = newTurn;
    setTurn({ ...newTurn });
  }, [M]);

  const commit = useCallback(() => {
    if (!turnRef.current) return;
    animateTo(1, () => {});
  }, [animateTo]);

  const cancel = useCallback(() => {
    if (!turnRef.current) return;
    animateTo(0, () => {});
  }, [animateTo]);

  const step = useCallback((dir: 'next' | 'prev') => {
    if (turnRef.current) {
      idxRef.current = turnRef.current.to;
      setIdx(turnRef.current.to);
      turnRef.current = null;
      setTurn(null);
      springRef.current = null;
    }
    startTurn(dir, 0);
    setTimeout(() => commit(), 16);
  }, [startTurn, commit]);

  const handleNext = useCallback(() => {
    cancelSpeech();
    if (idxRef.current < M - 1) {
      step('next');
    } else {
      onComplete();
    }
  }, [M, step, onComplete]);

  const handlePrev = useCallback(() => {
    if (idxRef.current > 0) {
      cancelSpeech();
      step('prev');
    }
  }, [step]);

  // ── Keyboard navigation ───────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); handleNext(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); handlePrev(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handlePrev]);

  // ── Mouse tilt ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: PointerEvent) => {
      if (e.pointerType === 'touch' || dragRef.current) return;
      const el = bookRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.6)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.85)));
      setViewRx(-ny * 4.5);
      setViewRy(nx * 7);
    };
    const reset = () => { setViewRx(0); setViewRy(0); };
    window.addEventListener('pointermove', handler, { passive: true });
    window.addEventListener('pointerout', reset);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('pointermove', handler);
      window.removeEventListener('pointerout', reset);
      window.removeEventListener('blur', reset);
    };
  }, []);

  // ── Drag to turn ───────────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const r = bookRef.current?.getBoundingClientRect();
    if (!r) return;
    const dir: 'next' | 'prev' = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev';
    if (dir === 'next' && idxRef.current >= M - 1 && !turnRef.current) return;
    if (dir === 'prev' && idxRef.current <= 0 && !turnRef.current) return;
    startTurn(dir, 0);
    dragRef.current = { dir, x0: e.clientX, moved: 0, vel: 0, tPrev: performance.now() };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }, [M, startTurn]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragRef.current || !turnRef.current) return;
    const dx = e.clientX - dragRef.current.x0;
    dragRef.current.moved = Math.max(dragRef.current.moved, Math.abs(dx));
    const bw = bookRef.current?.clientWidth ?? 600;
    const raw = (dragRef.current.dir === 'next' ? -dx : dx) / (bw * 0.6);
    const t = Math.max(0, Math.min(1, raw));
    const now = performance.now();
    dragRef.current.vel = (t - turnRef.current.t) / Math.max(0.001, (now - dragRef.current.tPrev) / 1000);
    dragRef.current.tPrev = now;
    turnRef.current.t = t;
    setTurn({ ...turnRef.current });
  }, []);

  const handlePointerUp = useCallback(() => {
    if (!dragRef.current || !turnRef.current) return;
    const d = dragRef.current;
    dragRef.current = null;
    if (d.moved < 8) { commit(); return; }
    if (turnRef.current.t > 0.42 || d.vel > 1.1) commit(); else cancel();
  }, [commit, cancel]);

  // ── Intro auto-flip ────────────────────────────────────────────────────
  useEffect(() => {
    if (introPlayed || M <= 1) return;
    setIntroPlayed(true);
    const t1 = setTimeout(() => {
      startTurn('next', 0);
      setTimeout(() => animateTo(1, () => {
        idxRef.current = 1;
        setIdx(1);
        turnRef.current = null;
        setTurn(null);
      }), 50);
    }, 800);
    return () => clearTimeout(t1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Page curl geometry ─────────────────────────────────────────────────
  const currentTurn = turn;
  const tVal = currentTurn?.t ?? 0;
  const theta = Math.PI * tVal;
  const beta = BETA * Math.sin(Math.PI * tVal);
  const tt = (theta + beta) * (180 / Math.PI);
  const td = (2 * beta / N_STRIPS) * (180 / Math.PI);
  const shadeVal = Math.sin(Math.PI * tVal);

  const currentPanel = panels[idx];
  const fromPanel = currentTurn ? panels[currentTurn.from] : null;
  const toPanel = currentTurn ? panels[currentTurn.to] : null;

  // ── Panel content (inner component using typewriter) ──────────────────
  // PanelContent is defined above as top-level component

  return (
    <div className="sb-story-phase">
      {/* Atmospheric paper wash */}
      <div className="sb-wash" aria-hidden="true" />

      {/* Stage */}
      <div
        className="sb-stage"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onDragStart={e => e.preventDefault()}
      >
        {/* Prev arrow */}
        <button
          className="sb-nav-arrow sb-nav-arrow--left"
          onClick={handlePrev}
          disabled={idx === 0 && !turn}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Book 3D container */}
        <div className="sb-3d">
          <div
            className="sb-tilt"
            style={{
              transform: `rotateX(${viewRx.toFixed(2)}deg) rotateY(${viewRy.toFixed(2)}deg)`,
              transition: 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          >
            {/* Shadow layers */}
            <div className="sb-shadow sb-shadow--ambient" style={{ opacity: 1 - shadeVal * 0.4 }} aria-hidden="true"/>
            <div className="sb-shadow sb-shadow--contact" style={{ opacity: 1 - shadeVal * 0.5 }} aria-hidden="true"/>

            {/* Book surface */}
            <div className="sb-book" ref={bookRef}>
              {!currentTurn ? (
                <div className="sb-spread">
                  <div className="sb-page sb-page--left">
                    {currentPanel && <PanelContent panel={currentPanel} side="left" panelIndex={idx} active={true} speechLang={speechLang} />}
                    <div className="sb-gutter-shadow sb-gutter-shadow--left" />
                  </div>
                  <div className="sb-page sb-page--right">
                    {panels[idx + 1] ? (
                      <PanelContent panel={panels[idx + 1]!} side="right" panelIndex={idx + 1} active={false} speechLang={speechLang} />
                    ) : (
                      <div className="sb-page-end">
                        <div className="sb-page-end__inner">
                          <BookOpen size={32} strokeWidth={1.2} />
                          <p className="sb-page-end__label">Cerita selesai</p>
                          <p className="sb-page-end__sub">Siap untuk Audio Quest?</p>
                          <button className="sb-page-end__btn" onClick={onComplete}>
                            Mulai Quest
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="sb-gutter-shadow sb-gutter-shadow--right" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="sb-spread">
                    <div className="sb-page sb-page--left">
                      {currentTurn.dir === 'next'
                        ? (fromPanel && <PanelContent panel={fromPanel} side="left" panelIndex={currentTurn.from} active={false} speechLang={speechLang} />)
                        : (toPanel && <PanelContent panel={toPanel} side="left" panelIndex={currentTurn.to} active={false} speechLang={speechLang} />)
                      }
                    </div>
                    <div className="sb-page sb-page--right">
                      {currentTurn.dir === 'next'
                        ? (toPanel && <PanelContent panel={toPanel} side="right" panelIndex={currentTurn.to} active={false} speechLang={speechLang} />)
                        : (fromPanel && <PanelContent panel={fromPanel} side="right" panelIndex={currentTurn.from} active={false} speechLang={speechLang} />)
                      }
                    </div>
                  </div>

                  {/* Page curl: N strips */}
                  <div
                    className={`sb-curl sb-curl--${currentTurn.dir}`}
                    style={{
                      '--tt': `${tt.toFixed(2)}deg`,
                      '--td': `${td.toFixed(3)}deg`,
                      '--n': N_STRIPS,
                      '--span': SPAN,
                      '--bw': bookRef.current ? `${bookRef.current.clientWidth}px` : '100%',
                    } as React.CSSProperties}
                  >
                    {Array.from({ length: N_STRIPS }, (_, i) => {
                      const facingAngle = Math.abs(Math.cos(theta + beta - i * (2 * beta / N_STRIPS)));
                      const a1 = (1 - facingAngle) * 0.55;
                      const a2 = (1 - Math.abs(Math.cos(theta + beta - (i + 1) * (2 * beta / N_STRIPS)))) * 0.55;
                      return (
                        <div
                          key={i}
                          className={`sb-strip${i === N_STRIPS - 1 ? ' sb-strip--edge' : ''}`}
                          style={{
                            '--i': i,
                            '--a1': a1.toFixed(3),
                            '--a2': a2.toFixed(3),
                            '--lit': facingAngle.toFixed(3),
                          } as React.CSSProperties}
                        >
                          <div className="sb-face sb-face--front">
                            <div className="sb-strip-bg" />
                            <div className="sb-face-shadow" style={{ background: `linear-gradient(90deg, rgba(58,43,20,${a1.toFixed(3)}), rgba(58,43,20,${a2.toFixed(3)}))` }}/>
                            <div className="sb-face-gloss" style={{ opacity: shadeVal * facingAngle * facingAngle * 0.18 }}/>
                          </div>
                          <div className="sb-face sb-face--back">
                            <div className="sb-strip-bg" />
                            <div className="sb-face-shadow" style={{ background: `linear-gradient(270deg, rgba(58,43,20,${a1.toFixed(3)}), rgba(58,43,20,${a2.toFixed(3)}))` }}/>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Next arrow */}
        <button
          className="sb-nav-arrow sb-nav-arrow--right"
          onClick={handleNext}
          aria-label={idx >= M - 1 ? 'Mulai Quest' : 'Halaman berikutnya'}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Bottom bar */}
      <div className="sb-bottom-bar">
        <button
          className="sb-listen-btn"
          onClick={() => {
            cancelSpeech();
            speak(currentPanel?.body.slice(0, 180) ?? '', { lang: speechLang, rate: 0.85 });
          }}
          aria-label="Dengarkan narasi"
        >
          <Volume2 size={14} />
          <span>Dengarkan</span>
        </button>

        <div className="sb-dots" role="tablist" aria-label="Halaman cerita">
          {panels.map((p, i) => (
            <button
              key={p.id}
              className={`sb-dot${i === idx ? ' sb-dot--active' : ''}`}
              role="tab"
              aria-selected={i === idx}
              aria-label={p.title}
              onClick={() => {
                cancelSpeech();
                const dir: 'next' | 'prev' = i > idxRef.current ? 'next' : 'prev';
                if (i !== idxRef.current) {
                  startTurn(dir, 0);
                  setTimeout(() => {
                    idxRef.current = i;
                    setIdx(i);
                    turnRef.current = null;
                    setTurn(null);
                    springRef.current = null;
                  }, 400);
                }
              }}
            />
          ))}
        </div>

        <span className="sb-page-label">{currentPanel?.title}</span>
      </div>

      {/* Fun fact floating card */}
      {currentPanel && (
        <FunFactCard
          key={currentPanel.id}
          label={currentPanel.funFactLabel}
          fact={currentPanel.funFact}
        />
      )}
    </div>
  );
}

// ── Fun fact card ──────────────────────────────────────────────────────────
function FunFactCard({ label, fact }: { label: string; fact: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`sb-funfact${open ? ' sb-funfact--open' : ''}`}>
      <button
        className="sb-funfact__trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span className="sb-funfact__icon">✦</span>
        <span>{open ? 'Tutup' : label}</span>
      </button>
      {open && (
        <div className="sb-funfact__body">{fact}</div>
      )}
    </div>
  );
}
