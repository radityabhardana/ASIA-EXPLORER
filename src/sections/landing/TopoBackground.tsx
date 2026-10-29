import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  pointerEvents: 'none',
  zIndex: 0,
  overflow: 'hidden',
};

const svgStyle: CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'block',
};

/**
 * TopoBackground:
 * Serene Archival Cartographic Canvas.
 *
 * Clean, warm, museum-grade background designed to let the 3D map breathe:
 * - Subtle central dawn spotlight illuminating the 3D Asian continent
 * - Ultra-fine antique topographic contour curves (delicate 0.75px hairlines)
 * - Restrained, whisper-quiet cartographic graticule
 * - Gentle, silky pointer & scroll parallax without any jarring wobble or detached labels
 */
export default function TopoBackground() {
  const dawnRef = useRef<SVGGElement>(null);
  const contourRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const motionQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;

    if (motionQuery?.matches) return;

    let targetX = 0;
    let targetY = 0;
    let curX = 0;
    let curY = 0;
    let scrollY = window.scrollY || 0;
    let animId = 0;
    let isRunning = false;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      // Silky exponential damping
      const factor = Math.min(1, dt * 5.0);
      curX += (targetX - curX) * factor;
      curY += (targetY - curY) * factor;

      // Subtle, calm parallax offsets
      if (dawnRef.current) {
        const dx = (curX * 6).toFixed(1);
        const dy = (curY * 4 - scrollY * 0.03).toFixed(1);
        dawnRef.current.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }

      if (contourRef.current) {
        const cx = (curX * 12).toFixed(1);
        const cy = (curY * 8 - scrollY * 0.08).toFixed(1);
        contourRef.current.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      }

      // If motion has settled, put the render loop to sleep to release CPU & GPU
      const diff = Math.abs(curX - targetX) + Math.abs(curY - targetY);
      if (diff > 0.001) {
        animId = requestAnimationFrame(tick);
      } else {
        isRunning = false;
      }
    };

    const wake = () => {
      if (!isRunning) {
        isRunning = true;
        lastTime = performance.now();
        animId = requestAnimationFrame(tick);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1440;
      const h = window.innerHeight || 900;
      targetX = Math.max(-1, Math.min(1, (e.clientX / w - 0.5) * 2));
      targetY = Math.max(-1, Math.min(1, (e.clientY / h - 0.5) * 2));
      wake();
    };

    const onPointerLeave = () => {
      targetX = 0;
      targetY = 0;
      wake();
    };

    const onScroll = () => {
      scrollY = window.scrollY || 0;
      wake();
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial positioning tick
    wake();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <div className="topo-background" aria-hidden="true" style={containerStyle}>
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        style={svgStyle}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Luminous Central Dawn Glow behind the 3D continent */}
          <radialGradient id="expedition-dawn" cx="55%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
            <stop offset="35%" stopColor="#fbf6ee" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#fbf9f5" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#fbf9f5" stopOpacity="0" />
          </radialGradient>

          {/* Gentle North-to-South Cartographic Gradient */}
          <linearGradient id="meridian-tone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f2ede4" stopOpacity="0.35" />
            <stop offset="50%" stopColor="#fbf9f5" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ede6db" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* --- Base Archival Tone --- */}
        <rect width="100%" height="100%" fill="url(#meridian-tone)" />

        {/* --- Central Dawn Aura (Parallax Plane 0) --- */}
        <g ref={dawnRef} style={{ willChange: 'transform' }}>
          <ellipse cx="915" cy="460" rx="680" ry="400" fill="url(#expedition-dawn)" />
        </g>

        {/* --- Flowing Antique Cartographic Contours (Parallax Plane 1) --- */}
        <g
          ref={contourRef}
          stroke="#7a5836"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ vectorEffect: 'non-scaling-stroke', willChange: 'transform' }}
        >
          {/* Subtle Latitude Parallels */}
          <g stroke="#8a6745" strokeWidth="0.6" strokeDasharray="3 8" strokeOpacity="0.12">
            <line x1="-50" y1="200" x2="1490" y2="200" />
            <line x1="-50" y1="380" x2="1490" y2="380" />
            <line x1="-50" y1="560" x2="1490" y2="560" />
            <line x1="-50" y1="740" x2="1490" y2="740" />
          </g>

          {/* Subtle Longitude Meridians */}
          <g stroke="#8a6745" strokeWidth="0.6" strokeDasharray="3 8" strokeOpacity="0.10">
            <line x1="260" y1="-50" x2="260" y2="950" />
            <line x1="560" y1="-50" x2="560" y2="950" />
            <line x1="860" y1="-50" x2="860" y2="950" />
            <line x1="1160" y1="-50" x2="1160" y2="950" />
          </g>

          {/* Elegant Archival Flowing Elevation Contours */}
          <path
            d="M -50,210 C 200,165 420,225 640,155 C 860,95 1060,150 1260,120 C 1380,105 1450,140 1520,160"
            strokeOpacity="0.16"
            strokeWidth="0.8"
          />
          <path
            d="M -50,350 C 180,310 400,360 600,305 C 800,250 1000,315 1200,275 C 1340,245 1440,300 1520,320"
            strokeOpacity="0.13"
            strokeWidth="0.75"
            strokeDasharray="16 8"
          />
          <path
            d="M -50,490 C 160,455 360,505 580,465 C 780,425 980,475 1180,445 C 1320,425 1420,475 1520,495"
            strokeOpacity="0.11"
            strokeWidth="0.75"
          />
          <path
            d="M -50,650 C 180,620 400,670 620,630 C 820,590 1020,640 1220,610 C 1340,590 1440,635 1520,655"
            strokeOpacity="0.09"
            strokeWidth="0.7"
          />
          <path
            d="M -50,790 C 220,760 440,800 660,770 C 880,740 1100,780 1300,750 C 1400,740 1460,770 1520,785"
            strokeOpacity="0.08"
            strokeWidth="0.7"
          />
        </g>
      </svg>
    </div>
  );
}
