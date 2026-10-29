import { useEffect, useRef, useState } from 'react';

import type { AsiaSceneProps } from '@/scene/AsiaScene';
import type { PanelMapInstance } from '@/scene/map48/panel-map.js';
import {
  COUNTRIES,
  ISO3_TO_ISO2,
  countryIdOf,
  iso3For,
} from '@/content/countries48';
import { useI18n } from '@/lib/i18n';
import { isWebGLAvailable } from '@/lib/webgl';
import AsiaMap2D, { type AsiaMap2DRef } from './AsiaMap2D';
import LatitudeRail from './LatitudeRail';
import '@/styles/scene-lazy.css';

type AsiaSceneLazyProps = Omit<AsiaSceneProps, 'className' | 'onSelectCountry'> & {
  label: string;
  describedBy?: string;
  /** Scene 1 hanya visual; jangan menambah landmark kedua di halaman. */
  decorative?: boolean;
  onSelectCountry?: (id: string | null) => void;
};

type MapStatus = 'pending' | 'ready' | 'fallback';
type MapDimension = '3d' | '2d';

/** Watchdog: kalau chunk/peta tak pernah siap, hero jatuh ke daftar 48 negara. */
const READY_TIMEOUT_MS = 7000;

/**
 * Hero peta 48 negara (Phase 1 & 2D Vector Atlas Option).
 *
 * Mendukung mode 3D (Arsitektural Three.js) dan 2D (Atlas Vektor Lambert Ringan).
 * Pengguna di ponsel atau perangkat dengan performa terbatas dapat beralih ke 2D
 * dengan sekali klik untuk render 60fps tanpa beban GPU.
 */
export default function AsiaSceneLazy({
  label,
  describedBy,
  decorative = false,
  selectedId = null,
  focusCountryId = null,
  onSelectCountry,
  onHoverCountry,
  onUnavailable,
  idleSway,
}: AsiaSceneLazyProps) {
  const { locale, t } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<PanelMapInstance | null>(null);
  const map2dRef = useRef<AsiaMap2DRef | null>(null);
  const [hasWebGL] = useState(() => isWebGLAvailable());

  // Mode dimensi: 3D atau 2D (disimpan di localStorage untuk preferensi pengguna)
  const [dimension, setDimension] = useState<MapDimension>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asiakin_map_dimension');
      if (saved === '2d' || saved === '3d') return saved;
    }
    return hasWebGL ? '3d' : '2d';
  });

  const [status, setStatus] = useState<MapStatus>(() =>
    hasWebGL ? 'pending' : 'ready', // Kalau WebGL tidak ada, 2D langsung ready
  );
  const compassNeedleRef = useRef<HTMLSpanElement>(null);
  const [isCtrlActive, setIsCtrlActive] = useState(false);
  const [isTouchDevice] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(max-width: 767px), (pointer: coarse)').matches
    );
  });

  const switchDimension = (nextDim: MapDimension) => {
    setDimension(nextDim);
    if (typeof window !== 'undefined') {
      localStorage.setItem('asiakin_map_dimension', nextDim);
    }
    if (nextDim === '2d') {
      instanceRef.current?.setPaused(true);
    } else {
      instanceRef.current?.setPaused(false);
    }
  };

  // Pantau status tombol Ctrl / Cmd secara interaktif
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlActive(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Control' || e.key === 'Meta') {
        setIsCtrlActive(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const target = focusCountryId ?? selectedId ?? null;

  const callbacksRef = useRef({ onSelectCountry, onHoverCountry, onUnavailable });
  const targetRef = useRef(target);
  const idleRef = useRef(idleSway !== false);

  useEffect(() => {
    callbacksRef.current = { onSelectCountry, onHoverCountry, onUnavailable };
  });

  useEffect(() => {
    idleRef.current = idleSway !== false;
    if (idleSway === false) instanceRef.current?.setAutoRotate(false);
  }, [idleSway]);

  // Pasang peta 3D sekali saja jika WebGL didukung; callback dibaca lewat ref supaya tidak remount.
  useEffect(() => {
    if (!hasWebGL) return;
    const stage = stageRef.current;
    if (!stage) return;

    let cancelled = false;
    let mounted: PanelMapInstance | null = null;
    const watchdog = window.setTimeout(() => {
      if (!cancelled && !instanceRef.current) {
        setDimension('2d');
        setStatus('ready');
      }
    }, READY_TIMEOUT_MS);

    void (async () => {
      try {
        const { mountPanelMap } = await import('@/scene/map48/panel-map.js');
        if (cancelled) return;
        mounted = await mountPanelMap(stage, {
          interactive: !decorative,
          onSelect: (code) =>
            callbacksRef.current.onSelectCountry?.(code ? countryIdOf(code) : null),
          onHover: (code) =>
            callbacksRef.current.onHoverCountry?.(
              code ? countryIdOf(code) : null,
            ),
        });
        if (cancelled) {
          mounted.destroy();
          return;
        }
        window.clearTimeout(watchdog);
        instanceRef.current = mounted;
        if (!idleRef.current) mounted.setAutoRotate(false);

        const initial = targetRef.current;
        const iso3 = initial ? iso3For(initial) : undefined;
        if (initial && iso3) {
          mounted.setPaused(true);
          mounted.focus(iso3);
        }
        setStatus('ready');
      } catch (error) {
        if (cancelled) return;
        console.error('Gagal memuat peta 3D, beralih ke 2D:', error);
        setDimension('2d');
        setStatus('ready');
      }
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      (instanceRef.current ?? mounted)?.destroy();
      instanceRef.current = null;
    };
  }, [hasWebGL, decorative]);

  // Id negara terpilih -> fokus kamera; null -> kembali ke overview.
  useEffect(() => {
    targetRef.current = target;
    const instance = instanceRef.current;
    if (!instance) return;

    if (!target) {
      instance.setPaused(false);
      instance.overview();
      return;
    }
    instance.setPaused(true);
    const iso3 = iso3For(target);
    if (iso3) instance.focus(iso3);
    else instance.overview();
  }, [target]);

  // Pantau sudut rotasi kompas kamera langsung ke DOM ref (tanpa re-render React)
  useEffect(() => {
    if (status !== 'ready' || decorative || dimension !== '3d') return;
    let animId = 0;
    let lastHeading = -999;
    const stage = stageRef.current;

    const applyHeading = (h: number) => {
      if (Math.abs(h - lastHeading) > 0.2) {
        lastHeading = h;
        if (compassNeedleRef.current) {
          compassNeedleRef.current.style.transform = `rotate(${-h}deg)`;
        }
      }
    };

    const handleHeadingEvent = (e: Event) => {
      const custom = e as CustomEvent<{ heading: number }>;
      const h = custom.detail?.heading;
      if (typeof h === 'number') {
        applyHeading(h);
      }
    };

    if (stage) {
      stage.addEventListener('asiakin:heading-change', handleHeadingEvent);
    }

    const checkHeading = () => {
      const h = instanceRef.current?.getHeading?.() ?? 0;
      applyHeading(h);
      animId = requestAnimationFrame(checkHeading);
    };
    animId = requestAnimationFrame(checkHeading);

    return () => {
      cancelAnimationFrame(animId);
      if (stage) {
        stage.removeEventListener('asiakin:heading-change', handleHeadingEvent);
      }
    };
  }, [status, decorative, dimension]);

  const [nudgePulse, setNudgePulse] = useState(false);

  // Beri aksen getar halus saat pengguna menggulir tanpa menekan Ctrl
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let hintTimer = 0;
    const handleHint = () => {
      setNudgePulse(true);
      window.clearTimeout(hintTimer);
      hintTimer = window.setTimeout(() => setNudgePulse(false), 1400);
    };
    stage.addEventListener('asiakin:map-scroll-hint', handleHint);
    return () => {
      stage.removeEventListener('asiakin:map-scroll-hint', handleHint);
      window.clearTimeout(hintTimer);
    };
  }, []);

  const handleZoomIn = () => {
    if (dimension === '3d') {
      instanceRef.current?.zoomIn();
    } else {
      map2dRef.current?.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (dimension === '3d') {
      instanceRef.current?.zoomOut();
    } else {
      map2dRef.current?.zoomOut();
    }
  };

  const handleResetOverview = () => {
    callbacksRef.current.onSelectCountry?.(null);
    if (dimension === '3d') {
      instanceRef.current?.overview();
    } else {
      map2dRef.current?.resetView();
    }
  };

  return (
    <div
      className={`landing-asia ${dimension === '2d' ? 'landing-asia--mode-2d' : 'landing-asia--mode-3d'}`}
      data-state={status}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'group'}
      aria-label={decorative ? undefined : label}
      aria-describedby={decorative ? undefined : describedBy}
    >
      {/* Wadah Peta 3D (Three.js) */}
      <div
        ref={stageRef}
        className="landing-asia__stage"
        style={{
          display: dimension === '3d' ? 'block' : 'none',
        }}
      />

      {/* Wadah Peta 2D (SVG Atlas Vektor Lambert Presisi) */}
      {dimension === '2d' ? (
        <div className="landing-asia__stage landing-asia__stage--2d">
          <AsiaMap2D
            ref={map2dRef}
            selectedId={selectedId}
            focusCountryId={focusCountryId}
            onSelectCountry={onSelectCountry}
            onHoverCountry={onHoverCountry}
            interactive={!decorative}
          />
        </div>
      ) : null}

      {/* Dynamic Latitude Rail (FŪDO-inspired Geodetic Indicator) */}
      {status === 'ready' && !decorative ? (
        <LatitudeRail
          activeCountryId={selectedId || focusCountryId}
          drawerOpen={Boolean(selectedId)}
        />
      ) : null}

      {status === 'ready' && !decorative ? (
        <div
          className="map48-hud"
          aria-label={locale === 'id' ? 'Navigasi Peta Kartografi' : 'Cartographic Map Navigation'}
        >
          {/* Capsule Switch Pilihan Mode: 3D vs 2D */}
          <div
            className="map48-hud__mode-capsule"
            role="group"
            aria-label={locale === 'id' ? 'Pilih Mode Tampilan Benua' : 'Choose Continent View Mode'}
          >
            <button
              type="button"
              className={`map48-hud__mode-pill ${dimension === '3d' ? 'map48-hud__mode-pill--active' : ''}`}
              title={locale === 'id' ? 'Tampilan 3D Relief Interaktif' : 'Interactive 3D Relief'}
              aria-pressed={dimension === '3d'}
              onClick={() => switchDimension('3d')}
            >
              3D
            </button>
            <button
              type="button"
              className={`map48-hud__mode-pill ${dimension === '2d' ? 'map48-hud__mode-pill--active' : ''}`}
              title={locale === 'id' ? 'Tampilan 2D Vektor Ringan (Cepat di HP)' : 'Fast 2D Vector (Lightweight)'}
              aria-pressed={dimension === '2d'}
              onClick={() => switchDimension('2d')}
            >
              2D
            </button>
          </div>

          {/* Kompas Interaktif (Khusus Mode 3D) */}
          {dimension === '3d' ? (
            <button
              type="button"
              className="map48-hud__btn map48-hud__compass"
              title={locale === 'id' ? 'Kunci Arah Utara (Reset Kompas)' : 'Lock North (Reset Compass)'}
              aria-label={locale === 'id' ? 'Kunci arah utara' : 'Reset compass north'}
              onClick={() => instanceRef.current?.resetNorth()}
            >
              <span
                ref={compassNeedleRef}
                className="map48-hud__needle"
                aria-hidden="true"
              >
                <span className="map48-hud__needle-n" />
                <span className="map48-hud__needle-s" />
              </span>
              <span className="map48-hud__compass-label" aria-hidden="true">U</span>
            </button>
          ) : null}

          {/* Kontrol Zoom & Tampilan Benua */}
          <div className="map48-hud__group">
            <button
              type="button"
              className="map48-hud__btn"
              title={locale === 'id' ? 'Perbesar Peta (+)' : 'Zoom In (+)'}
              aria-label={locale === 'id' ? 'Perbesar peta' : 'Zoom in'}
              onClick={handleZoomIn}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <line x1="8" y1="2.5" x2="8" y2="13.5" />
                <line x1="2.5" y1="8" x2="13.5" y2="8" />
              </svg>
            </button>
            <button
              type="button"
              className="map48-hud__btn"
              title={locale === 'id' ? 'Perkecil Peta (−)' : 'Zoom Out (−)'}
              aria-label={locale === 'id' ? 'Perkecil peta' : 'Zoom out'}
              onClick={handleZoomOut}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <line x1="2.5" y1="8" x2="13.5" y2="8" />
              </svg>
            </button>
            <button
              type="button"
              className="map48-hud__btn"
              title={locale === 'id' ? 'Tampilan Seluruh Benua' : 'Reset Overview'}
              aria-label={locale === 'id' ? 'Tampilan seluruh benua' : 'Overview'}
              onClick={handleResetOverview}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.8M13.5 8a5.5 5.5 0 0 1-9.5 3.8" />
                <polyline points="12 1.5 12 4.5 9 4.5" />
                <polyline points="4 14.5 4 11.5 7 11.5" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}

      {/* Guide Toast di Bawah Layar */}
      {status === 'ready' && !decorative ? (
        <div
          className={`map48-toast ${isCtrlActive ? 'map48-toast--active' : ''} ${nudgePulse ? 'map48-toast--pulse' : ''}`}
          role="status"
          aria-live="polite"
        >
          <svg
            className="map48-toast__icon"
            width="13"
            height="13"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M2.5 8a5.5 5.5 0 0 1 9.5-3.8M13.5 8a5.5 5.5 0 0 1-9.5 3.8" />
            <polyline points="12 1.5 12 4.5 9 4.5" />
            <polyline points="4 14.5 4 11.5 7 11.5" />
          </svg>
          <span>
            {dimension === '2d'
              ? isTouchDevice
                ? locale === 'id'
                  ? 'Sentuh negara untuk membuka cerita · Geser untuk menjelajah'
                  : 'Tap country to explore · Drag to pan'
                : locale === 'id'
                  ? 'Klik negara untuk membuka cerita · Tarik untuk menggeser'
                  : 'Click country to explore · Drag to pan'
              : isTouchDevice
                ? locale === 'id'
                  ? 'Sentuh & geser untuk memutar · Cubit untuk zoom'
                  : 'Touch & drag to orbit · Pinch to zoom'
                : isCtrlActive
                  ? locale === 'id'
                    ? '[Ctrl Aktif] Gulir untuk Zoom · Tarik untuk Memutar Sudut Pandang'
                    : '[Ctrl Active] Scroll to Zoom · Drag to Orbit Viewpoint'
                  : locale === 'id'
                    ? 'Tarik untuk menggeser peta · Tahan [Ctrl] untuk memutar sudut pandang'
                    : 'Drag to pan map · Hold [Ctrl] to orbit viewpoint'}
          </span>
        </div>
      ) : null}

      {status === 'pending' ? (
        <div className="landing-asia__placeholder" aria-hidden="true" />
      ) : null}

      {status === 'fallback' ? (
        <div className="landing-asia__fallback">
          <CountryFallbackList note={t('map.fallbackNote')} onSelect={onSelectCountry} />
        </div>
      ) : null}
    </div>
  );
}

/**
 * Fallback darurat bila browser kuno sama sekali tidak mendukung SVG/WebGL.
 */
function CountryFallbackList({
  note,
  onSelect,
}: {
  note: string;
  onSelect?: (id: string) => void;
}) {
  return (
    <div
      className="map48-fallback landing-map--interactive"
      role="group"
      aria-label={note}
    >
      <p className="map48-fallback__note">{note}</p>
      {Object.entries(ISO3_TO_ISO2).map(([code, id]) => {
        const country = COUNTRIES[code];
        if (!country) return null;
        return (
          <button
            key={id}
            type="button"
            role="button"
            className="map48-fallback__item"
            aria-label={`${country.name} — ${country.capital}`}
            onClick={() => onSelect?.(id)}
          >
            <span className="map48-fallback__name">{country.name}</span>
            <span className="map48-fallback__meta">{country.capital}</span>
          </button>
        );
      })}
    </div>
  );
}
