import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, WheelEvent as ReactWheelEvent } from 'react';

import atlasData from '@/content/asia-2d-countries.json';
import { COUNTRIES } from '@/content/countries48';
import { useI18n } from '@/lib/i18n';
import '@/styles/asia-map-2d.css';

export interface AsiaMap2DProps {
  selectedId?: string | null;
  focusCountryId?: string | null;
  onSelectCountry?: (id: string) => void;
  onHoverCountry?: (id: string | null) => void;
  interactive?: boolean;
  className?: string;
}

export interface AsiaMap2DRef {
  zoomIn: () => void;
  zoomOut: () => void;
  resetView: () => void;
}

const VIEW_W = atlasData.width; // 1000
const VIEW_H = atlasData.height; // 720
const MIN_ZOOM = 0.85;
const MAX_ZOOM = 4.2;

const AsiaMap2D = forwardRef<AsiaMap2DRef, AsiaMap2DProps>(function AsiaMap2D(
  {
    selectedId = null,
    focusCountryId = null,
    onSelectCountry,
    onHoverCountry,
    interactive = true,
    className = '',
  },
  ref,
) {
  const { locale } = useI18n();
  const svgRef = useRef<SVGSVGElement>(null);

  // Pan & Zoom Transform: scale (k), translate x/y
  const [transform, setTransform] = useState({ k: 1, x: 0, y: 0 });
  const [hoveredCountry, setHoveredCountry] = useState<typeof atlasData.countries[0] | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Dragging state
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const transformStart = useRef({ x: 0, y: 0 });
  const hasDragged = useRef(false);

  // Touch tracking for pinch-zoom
  const touchDistance = useRef<number | null>(null);

  const activeTargetId = focusCountryId ?? selectedId;

  // Zoom to country when activeTargetId changes
  useEffect(() => {
    if (!activeTargetId) {
      return;
    }
    const country = atlasData.countries.find((c) => c.id === activeTargetId);
    if (!country) return;

    const [cx = 500, cy = 360] = country.centroid;
    const targetK = 2.4;
    // Pusatkan centroid negara ke tengah tampilan (500, 360)
    const targetX = 500 - cx * targetK;
    const targetY = 360 - cy * targetK;

    setTransform({ k: targetK, x: targetX, y: targetY });
  }, [activeTargetId]);

  const handleZoom = useCallback((delta: number) => {
    setTransform((prev) => {
      const newK = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, prev.k * delta));
      // Zoom relatif ke titik tengah (500, 360)
      const factor = newK / prev.k;
      const newX = 500 - (500 - prev.x) * factor;
      const newY = 360 - (360 - prev.y) * factor;
      return { k: newK, x: newX, y: newY };
    });
  }, []);

  const handleReset = useCallback(() => {
    setTransform({ k: 1, x: 0, y: 0 });
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      zoomIn: () => handleZoom(1.35),
      zoomOut: () => handleZoom(0.74),
      resetView: handleReset,
    }),
    [handleZoom, handleReset],
  );

  // Mouse pan handlers
  const onMouseDown = (e: ReactMouseEvent) => {
    if (!interactive || e.button !== 0) return;
    isDragging.current = true;
    hasDragged.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY };
    transformStart.current = { x: transform.x, y: transform.y };
  };

  const onMouseMove = (e: ReactMouseEvent) => {
    if (isDragging.current) {
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 4) {
        hasDragged.current = true;
      }
      setTransform((prev) => ({
        ...prev,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy,
      }));
    }

    // Update tooltip position
    if (hoveredCountry && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  // Touch pan & pinch handlers
  const onTouchStart = (e: ReactTouchEvent) => {
    if (!interactive) return;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    if (e.touches.length === 1 && t1) {
      isDragging.current = true;
      hasDragged.current = false;
      dragStart.current = { x: t1.clientX, y: t1.clientY };
      transformStart.current = { x: transform.x, y: transform.y };
      touchDistance.current = null;
    } else if (e.touches.length === 2 && t1 && t2) {
      isDragging.current = false;
      touchDistance.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    }
  };

  const onTouchMove = (e: ReactTouchEvent) => {
    if (!interactive) return;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    if (e.touches.length === 1 && isDragging.current && t1) {
      const dx = t1.clientX - dragStart.current.x;
      const dy = t1.clientY - dragStart.current.y;
      if (Math.hypot(dx, dy) > 4) {
        hasDragged.current = true;
      }
      setTransform((prev) => ({
        ...prev,
        x: transformStart.current.x + dx,
        y: transformStart.current.y + dy,
      }));
    } else if (e.touches.length === 2 && touchDistance.current !== null && t1 && t2) {
      const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      const ratio = dist / touchDistance.current;
      touchDistance.current = dist;
      handleZoom(ratio);
    }
  };

  const onTouchEnd = () => {
    isDragging.current = false;
    touchDistance.current = null;
  };

  const onWheel = (e: ReactWheelEvent) => {
    // Zoom hanya bila menekan Ctrl/Cmd agar tidak mengganggu scroll halaman vertikal
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.15 : 0.87;
      handleZoom(delta);
    }
  };

  const handleCountryClick = (c: typeof atlasData.countries[0]) => {
    if (hasDragged.current) return;
    onSelectCountry?.(c.id);
  };

  const handleCountryHover = (c: typeof atlasData.countries[0] | null, e?: ReactMouseEvent) => {
    setHoveredCountry(c);
    onHoverCountry?.(c ? c.id : null);
    if (c && e && svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent, c: typeof atlasData.countries[0]) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectCountry?.(c.id);
    }
  };

  return (
    <div
      className={`asia-map-2d landing-map--interactive ${interactive ? 'is-interactive' : ''} ${className}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onWheel={onWheel}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="asia-map-2d__svg"
        preserveAspectRatio="xMidYMid meet"
        role="group"
        aria-label={locale === 'id' ? 'Peta Vektor 2D Benua Asia 48 Negara' : '2D Vector Map of Asian Continent 48 Nations'}
      >
        <defs>
          {/* Filter bayangan halus untuk negara yang sedang terpilih */}
          <filter id="country-active-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#b84d37" floodOpacity="0.45" />
          </filter>
          <filter id="country-hover-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0f141a" floodOpacity="0.25" />
          </filter>
        </defs>

        {/* Lapisan transform pan & zoom */}
        <g
          className="asia-map-2d__viewport"
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.k})`,
            transformOrigin: '0 0',
          }}
        >
          {/* Archival Graticule Lat/Long Arcs (Dekoratif Kartografi Klasik) */}
          <g className="asia-map-2d__graticule" aria-hidden="true">
            <ellipse cx="500" cy="380" rx="460" ry="290" className="asia-map-2d__ring" />
            <ellipse cx="500" cy="380" rx="360" ry="225" className="asia-map-2d__ring asia-map-2d__ring--inner" />
            <line x1="500" y1="50" x2="500" y2="700" className="asia-map-2d__axis" />
            <line x1="60" y1="380" x2="940" y2="380" className="asia-map-2d__axis" />
          </g>

          {/* Seluruh 48 Poligon Negara Asia */}
          <g className="asia-map-2d__countries">
            {atlasData.countries.map((c) => {
              const isSelected = activeTargetId === c.id;
              const isHovered = hoveredCountry?.id === c.id;
              const meta48 = COUNTRIES[c.code];
              const displayName = meta48?.name || c.name;

              return (
                <path
                  key={c.code}
                  d={c.d}
                  fill={c.color}
                  className={`asia-map-2d__path ${isSelected ? 'is-selected' : ''} ${isHovered ? 'is-hovered' : ''}`}
                  role="button"
                  tabIndex={interactive ? 0 : -1}
                  aria-label={`${displayName} · ${c.capital} (${c.region})`}
                  aria-pressed={isSelected}
                  onClick={() => handleCountryClick(c)}
                  onMouseEnter={(e) => handleCountryHover(c, e)}
                  onMouseLeave={() => handleCountryHover(null)}
                  onFocus={() => handleCountryHover(c)}
                  onBlur={() => handleCountryHover(null)}
                  onKeyDown={(e) => onKeyDown(e, c)}
                />
              );
            })}
          </g>
        </g>
      </svg>

      {/* Floating Hover Tooltip */}
      {hoveredCountry && (
        <div
          className="asia-map-2d__tooltip"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y - 12}px`,
          }}
          role="tooltip"
          aria-hidden="true"
        >
          <div className="asia-map-2d__tooltip-badge">
            <span className="asia-map-2d__tooltip-title">{hoveredCountry.name}</span>
            {hoveredCountry.capital && (
              <span className="asia-map-2d__tooltip-sub">
                {hoveredCountry.capital} · {hoveredCountry.region}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

export default AsiaMap2D;
