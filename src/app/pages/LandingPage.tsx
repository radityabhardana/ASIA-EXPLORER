import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';

import Navbar from '@/app/Navbar';
import { countries } from '@/content/countries';
import { COUNTRIES, ISO3_TO_ISO2, iso3For } from '@/content/countries48';
import {
  COUNTRY_COORDINATES,
  formatDMS,
  formatDistanceKm,
  getHeadingDirection,
  haversineDistanceKm,
} from '@/lib/geo-coords';
import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CartographicGround from '@/sections/landing/CartographicGround';
import CountryPreviewPanel from '@/sections/landing/CountryPreviewPanel';
import DailyChallengeExpedition from '@/sections/landing/DailyChallengeExpedition';
import TopoBackground from '@/sections/landing/TopoBackground';
import '@/styles/landing.css';

const REGION_WAYPOINTS = [
  { id: 'sea', labelId: 'Asia Tenggara', labelEn: 'Southeast Asia', focusId: 'id' },
  { id: 'ea', labelId: 'Asia Timur', labelEn: 'East Asia', focusId: 'jp' },
  { id: 'sa', labelId: 'Asia Selatan', labelEn: 'South Asia', focusId: 'in' },
  { id: 'wa', labelId: 'Asia Barat', labelEn: 'West Asia', focusId: 'sa' },
  { id: 'ca', labelId: 'Asia Tengah', labelEn: 'Central Asia', focusId: 'kz' },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [panelCountryId, setPanelCountryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const previewExitTimer = useRef<number | null>(null);

  const { locale, t } = useI18n();

  // FŪDO-inspired Live Geodetic Transit HUD State
  const [hoverCountryId, setHoverCountryId] = useState<string | null>(null);
  const [transitInfo, setTransitInfo] = useState<{
    originName: string;
    originCapital: string;
    destName: string;
    destCapital: string;
    distance: string;
    direction: string;
  } | null>(null);
  const transitTimerRef = useRef<number | null>(null);
  const lastFocusRef = useRef<string | null>(null);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Hitung geodetic transit metric saat berpindah negara fokus
  useEffect(() => {
    if (!previewId) {
      lastFocusRef.current = null;
      return;
    }
    const prev = lastFocusRef.current;
    lastFocusRef.current = previewId;
    if (prev && prev !== previewId) {
      const prevIso3 = iso3For(prev);
      const currIso3 = iso3For(previewId);
      if (prevIso3 && currIso3 && prevIso3 !== currIso3) {
        const cOrigin = COUNTRIES[prevIso3];
        const cDest = COUNTRIES[currIso3];
        const coordOrigin = COUNTRY_COORDINATES[prevIso3];
        const coordDest = COUNTRY_COORDINATES[currIso3];
        if (cOrigin && cDest && coordOrigin && coordDest) {
          const distKm = haversineDistanceKm(
            coordOrigin.lat,
            coordOrigin.lon,
            coordDest.lat,
            coordDest.lon,
          );
          const direction = getHeadingDirection(
            coordOrigin.lat,
            coordOrigin.lon,
            coordDest.lat,
            coordDest.lon,
            locale as 'id' | 'en',
          );
          setTransitInfo({
            originName: cOrigin.name,
            originCapital: cOrigin.capital,
            destName: cDest.name,
            destCapital: cDest.capital,
            distance: formatDistanceKm(distKm, locale as 'id' | 'en'),
            direction,
          });
          if (transitTimerRef.current !== null) {
            window.clearTimeout(transitTimerRef.current);
          }
          transitTimerRef.current = window.setTimeout(() => {
            setTransitInfo(null);
            transitTimerRef.current = null;
          }, 3800);
        }
      }
    }
  }, [previewId, locale]);

  // Datum koordinat negara aktif (hover atau selected)
  const activeCountryDatum = useMemo(() => {
    const targetId = hoverCountryId || previewId;
    if (!targetId) return null;
    const iso3 = iso3For(targetId);
    if (!iso3) return null;
    const c48 = COUNTRIES[iso3];
    const coords = COUNTRY_COORDINATES[iso3];
    if (!c48 || !coords) return null;
    return {
      dms: formatDMS(coords.lat, coords.lon),
      name: c48.name.toUpperCase(),
      capital: c48.capital.toUpperCase(),
      region: c48.region.toUpperCase(),
    };
  }, [hoverCountryId, previewId]);

  // Hero intro triggered by preloader exit or immediate if preloader skipped.
  useEffect(() => {
    const handleReady = () => {
      setReady(true);
    };

    if (document.documentElement.dataset.ready === 'true') {
      handleReady();
    } else {
      window.addEventListener('asiakin:ready', handleReady);
    }

    return () => {
      window.removeEventListener('asiakin:ready', handleReady);
    };
  }, []);

  // Shortcut Ctrl+K / Cmd+K / Slash untuk fokus search
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const openCountryPreview = useCallback((id: string) => {
    if (previewExitTimer.current !== null) {
      window.clearTimeout(previewExitTimer.current);
      previewExitTimer.current = null;
    }
    setPreviewId(id);
    setPanelCountryId(id);
  }, []);

  const closeCountryPreview = useCallback(() => {
    setPreviewId(null);
    if (previewExitTimer.current !== null) {
      window.clearTimeout(previewExitTimer.current);
    }
    // Biarkan panel menyelesaikan animasi keluar sebelum dilepas dari DOM.
    previewExitTimer.current = window.setTimeout(() => {
      setPanelCountryId(null);
      previewExitTimer.current = null;
    }, 280);
    mapSectionRef.current?.focus({ preventScroll: true });
  }, []);

  const handleSelectCountry = useCallback(
    (id: string | null) => {
      if (id) {
        openCountryPreview(id);
      } else {
        closeCountryPreview();
      }
    },
    [openCountryPreview, closeCountryPreview],
  );

  useEffect(() => {
    if (!previewId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }
      event.preventDefault();
      closeCountryPreview();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewId, closeCountryPreview]);

  useEffect(
    () => () => {
      if (previewExitTimer.current !== null) {
        window.clearTimeout(previewExitTimer.current);
      }
    },
    [],
  );

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  // 48 Negara untuk live search
  const searchableCountries = useMemo(() => {
    return Object.entries(ISO3_TO_ISO2).map(([iso3, id]) => {
      const c48 = COUNTRIES[iso3];
      const full = countries.find((item) => item.id === id);
      return {
        id,
        iso3,
        name: full?.nameId || c48?.name || id.toUpperCase(),
        nameLocal: full?.nameLocal || c48?.name || '',
        capital: c48?.capital || '',
        region: c48?.region || full?.region || '',
      };
    });
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableCountries
      .filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.nameLocal.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q) ||
          c.id.toLowerCase() === q,
      )
      .slice(0, 6);
  }, [searchQuery, searchableCountries]);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchResults]);

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      <TopoBackground />
      <a className="landing-skip skip-link" href="#peta" onClick={handleSkipToMap}>
        {t('hero.skipLink')}
      </a>
      <Navbar onScrollToMap={handleSkipToMap} />

      {/* Scene 1 — Hero: Peta Interaktif 48 Negara + Search Cerdas */}
      <section
        id="peta"
        ref={mapSectionRef}
        tabIndex={-1}
        className="landing-scene landing-scene--hero"
        aria-labelledby="landing-title"
      >
        <div className="landing-stage landing-stage--hero">
          <CartographicGround />

          <div className="landing-hero__copy" data-intro>
            <div className="landing-hero__eyebrow-wrap">
              <p className="landing-hero__eyebrow">{t('hero.eyebrow')}</p>
            </div>
            <span className="landing-hero__accent-bar" aria-hidden="true" />
            <h1 className="landing-hero__title" id="landing-title">
              {locale === 'id' ? (
                <>
                  Jelajahi 48 Bangsa <span className="landing-hero__title--accent">di Asia.</span>
                </>
              ) : (
                <>
                  Explore 48 Nations <span className="landing-hero__title--accent">in Asia.</span>
                </>
              )}
            </h1>
            <p className="landing-hero__tagline">{t('hero.tagline')}</p>

            {/* Tombol Aksi Utama (Mulai Tantangan & Cari Negara) */}
            <div className="landing-hero__actions">
              <button
                type="button"
                className="landing-hero__cta-primary"
                onClick={() => scrollToSection('#tantangan-harian')}
              >
                <svg
                  className="landing-hero__cta-icon"
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M8.5 1.5L2.5 9h5l-1 5.5 6-7.5h-5l1-5.5z" />
                </svg>
                <span>{t('hero.ctaQuiz')}</span>
                <svg
                  className="landing-hero__cta-arrow"
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M8 3v10M4 9l4 4 4-4" />
                </svg>
              </button>
              <button
                type="button"
                className="landing-hero__cta-secondary"
                onClick={() => searchInputRef.current?.focus()}
              >
                <svg
                  className="landing-hero__cta-icon"
                  width="13"
                  height="13"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <line x1="13" y1="13" x2="17.5" y2="17.5" />
                </svg>
                <span>{t('hero.ctaSearch')}</span>
              </button>
            </div>

            {/* Input Pencarian 48 Negara Terintegrasi */}
            <div className="landing-hero__search-wrap">
              <div
                className={`landing-hero__search-box ${searchFocused ? 'landing-hero__search-box--focused' : ''}`}
              >
                <svg
                  className="landing-hero__search-icon"
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  focusable="false"
                >
                  <circle cx="8.5" cy="8.5" r="5.5" />
                  <line x1="13" y1="13" x2="17.5" y2="17.5" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 220)}
                  onKeyDown={(e) => {
                    if (searchResults.length === 0) return;
                    if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setHighlightedIndex((prev) => (prev + 1) % searchResults.length);
                    } else if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setHighlightedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      const chosen = searchResults[highlightedIndex] || searchResults[0];
                      if (chosen) {
                        setSearchQuery('');
                        setSearchFocused(false);
                        handleSelectCountry(chosen.id);
                        searchInputRef.current?.blur();
                      }
                    } else if (e.key === 'Escape') {
                      e.preventDefault();
                      setSearchFocused(false);
                    }
                  }}
                  placeholder={
                    locale === 'id'
                      ? 'Cari 48 negara... (misal: Jepang, Uzbekistan)'
                      : 'Search 48 countries... (e.g. Japan, Uzbekistan)'
                  }
                  className="landing-hero__search-input"
                  aria-label={locale === 'id' ? 'Cari negara di Asia' : 'Search Asian country'}
                />
                {searchQuery ? (
                  <button
                    type="button"
                    className="landing-hero__search-clear"
                    onClick={() => setSearchQuery('')}
                    aria-label={locale === 'id' ? 'Hapus pencarian' : 'Clear search'}
                  >
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                    >
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                ) : isTouchDevice ? null : (
                  <span className="landing-hero__search-kbd" aria-hidden="true">Ctrl+K</span>
                )}
              </div>

              {searchFocused && searchResults.length > 0 && (
                <ul className="landing-hero__search-dropdown" role="listbox">
                  {searchResults.map((c, index) => (
                    <li
                      key={c.id}
                      role="option"
                      aria-selected={index === highlightedIndex}
                      className={`landing-hero__search-item ${index === highlightedIndex ? 'landing-hero__search-item--active' : ''}`}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      onMouseDown={() => {
                        setSearchQuery('');
                        handleSelectCountry(c.id);
                      }}
                    >
                      <div className="landing-hero__search-item-info">
                        <span className="landing-hero__search-item-name">{c.name}</span>
                        {c.nameLocal && c.nameLocal !== c.name && (
                          <span className="landing-hero__search-item-local">({c.nameLocal})</span>
                        )}
                      </div>
                      <span className="landing-hero__search-item-meta">
                        {c.capital} · {c.region}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Kawasan Pintas Ekspedisi */}
            <div
              className="landing-hero__regions"
              role="region"
              aria-label={locale === 'id' ? 'Jelajahi kawasan Asia' : 'Explore Asian regions'}
            >
              <span className="landing-hero__regions-caption">
                {locale === 'id' ? 'Pintas Kawasan:' : 'Regions:'}
              </span>
              <div className="landing-hero__region-list">
                {REGION_WAYPOINTS.map((region) => (
                  <button
                    key={region.id}
                    type="button"
                    className={`landing-hero__region-btn ${panelCountryId === region.focusId ? 'landing-hero__region-btn--active' : ''}`}
                    onClick={() => handleSelectCountry(region.focusId)}
                  >
                    {locale === 'id' ? region.labelId : region.labelEn}
                  </button>
                ))}
              </div>
            </div>

            {/* 3 Pilar Kemampuan Platform (Jelas, Terukur, & Padat Nilai) */}
            <div
              className="landing-hero__pillars"
              aria-label={locale === 'id' ? 'Fitur utama Asia Explorer' : 'Core features of Asia Explorer'}
            >
              <div className="landing-hero__pillar">
                <span className="landing-hero__pillar-num">01</span>
                <div className="landing-hero__pillar-text">
                  <strong className="landing-hero__pillar-title">{t('hero.pillar1Title')}</strong>
                  <p className="landing-hero__pillar-desc">{t('hero.pillar1Desc')}</p>
                </div>
              </div>
              <div className="landing-hero__pillar">
                <span className="landing-hero__pillar-num">02</span>
                <div className="landing-hero__pillar-text">
                  <strong className="landing-hero__pillar-title">{t('hero.pillar2Title')}</strong>
                  <p className="landing-hero__pillar-desc">{t('hero.pillar2Desc')}</p>
                </div>
              </div>
              <div className="landing-hero__pillar">
                <span className="landing-hero__pillar-num">03</span>
                <div className="landing-hero__pillar-text">
                  <strong className="landing-hero__pillar-title">{t('hero.pillar3Title')}</strong>
                  <p className="landing-hero__pillar-desc">{t('hero.pillar3Desc')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="landing-hero__scene" data-intro>
            <AsiaSceneLazy
              debugKey="hero"
              label={t('hero.eyebrow')}
              showOverlays={true}
              interactiveClick={false}
              selectedId={previewId}
              focusCountryId={previewId}
              onSelectCountry={handleSelectCountry}
              onHoverCountry={setHoverCountryId}
              controlsHintText={t('hero.hint')}
            />
          </div>

          {panelCountryId ? (
            <CountryPreviewPanel
              countryId={panelCountryId}
              open={previewId !== null}
              onClose={closeCountryPreview}
            />
          ) : null}

          {/* Archival Expedition Datum HUD (FŪDO-inspired Geodetic Transit Datum) */}
          <div className="landing-hero__hud" aria-hidden="true">
            {transitInfo ? (
              <div className="landing-hero__hud-datum landing-hero__hud-datum--transit">
                <span className="landing-hero__hud-badge">TRANSIT</span>
                <span className="landing-hero__hud-metric">
                  {transitInfo.originCapital.toUpperCase()} → {transitInfo.destCapital.toUpperCase()}
                </span>
                <span className="landing-hero__hud-sep">·</span>
                <span className="landing-hero__hud-coord">{transitInfo.distance}</span>
                <span className="landing-hero__hud-sep">·</span>
                <span className="landing-hero__hud-direction">{transitInfo.direction}</span>
              </div>
            ) : activeCountryDatum ? (
              <div className="landing-hero__hud-datum landing-hero__hud-datum--active">
                <span className="landing-hero__hud-coord">{activeCountryDatum.dms}</span>
                <span className="landing-hero__hud-sep">·</span>
                <span className="landing-hero__hud-metric">
                  {activeCountryDatum.name} ({activeCountryDatum.capital})
                </span>
                <span className="landing-hero__hud-sep">·</span>
                <span className="landing-hero__hud-region">{activeCountryDatum.region}</span>
              </div>
            ) : (
              <div className="landing-hero__hud-datum">
                <span className="landing-hero__hud-coord">10°S - 82°N · 26°E - 170°W</span>
                <span className="landing-hero__hud-sep">·</span>
                <span className="landing-hero__hud-metric">
                  {locale === 'id' ? 'ATLAS KARTOGRAFI 48 BANGSA' : '48 NATIONS CARTOGRAPHIC ATLAS'}
                </span>
              </div>
            )}
            <div className="landing-hero__hud-scroll">
              <span>{locale === 'id' ? 'GULIR UNTUK MENJELAJAH' : 'SCROLL TO EXPLORE'}</span>
              <span className="landing-hero__hud-arrow">↓</span>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 2 — Tantangan Harian Interaktif (Playable 60s Quiz ala Worldly) */}
      <DailyChallengeExpedition
        locale={locale}
        onExploreCountry={handleSelectCountry}
      />

      {/* Scene 3 — Footer: wordmark dan catatan hak cipta */}
      <footer
        className="landing-scene landing-scene--footer"
        aria-labelledby="landing-footer-heading"
      >
        <div className="landing-stage landing-stage--footer">
          <p className="landing-footer__mark" id="landing-footer-heading">
            Asia Explorer
          </p>
          <p className="landing-footer__copyright">
            {t('footer.copyright').replace('{count}', String(countries.length))}
          </p>
        </div>
      </footer>
    </div>
  );
}
