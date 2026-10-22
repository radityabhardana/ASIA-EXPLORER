import { Fragment, useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';

import { scrollToSection } from '@/lib/motion';
import { differs, profileFor } from '@/sections/country/scripts';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryDialog from '@/sections/landing/CountryDialog';
import CountryList from '@/sections/landing/CountryList';
import InteractiveAsiaMap48 from '@/sections/landing/InteractiveAsiaMap48';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import Silhouette from '@/sections/landing/Silhouette';
import { CezveIcon, WaiIcon } from '@/sections/landing/icons';
import {
  REGIONAL_SILHOUETTES,
  SCRIPT_COUNTRY_IDS,
  countryEntry,
} from '@/sections/landing/landing-data';
import { useLandingTimeline } from '@/sections/landing/useLandingTimeline';
import '@/styles/landing.css';

const scriptCountries = SCRIPT_COUNTRY_IDS.flatMap((id) => {
  const country = countryEntry(id);
  return country ? [country] : [];
});

/** Tiga pintu masuk cepat; semuanya punya halaman negara. */
const HERO_PICK_IDS = ['id', 'jp', 'tr'] as const;

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const heroProgressRef = useRef(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useLandingTimeline({ root: rootRef, progress: heroProgressRef });

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

  const selectedCountry = selectedId ? (countryEntry(selectedId) ?? null) : null;
  const hoveredCountry = hoveredId ? (countryEntry(hoveredId) ?? null) : null;
  const hoveredProfile = hoveredCountry ? profileFor(hoveredCountry) : null;
  const openTimerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (openTimerRef.current !== null) {
        window.clearTimeout(openTimerRef.current);
      }
    },
    [],
  );

  const selectCountry = (id: string) => {
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    setHoveredId(null);
    setSelectedId(id);
  };

  /**
   * Scene 3D memilih lewat `pointerup`. Dialog harus dibuka satu task setelah
   * itu: `click` sintetis dari gestur yang sama kalau tidak akan mendarat di
   * backdrop/link dialog dan langsung menutup atau menavigasi.
   */
  const selectCountryFromScene = (id: string) => {
    setHoveredId(null);
    if (openTimerRef.current !== null) {
      window.clearTimeout(openTimerRef.current);
    }
    openTimerRef.current = window.setTimeout(() => {
      openTimerRef.current = null;
      setSelectedId(id);
    }, 0);
  };

  const closeDialog = () => {
    setSelectedId(null);
  };

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      {/* Scene 1 — hero */}
      <section className="landing-scene landing-scene--hero" aria-labelledby="landing-title">
        <a className="landing-skip" href="#peta" onClick={handleSkipToMap}>
          Lewati ke peta
        </a>

        <div className="landing-stage landing-stage--hero">
          <div className="landing-hero__ground" aria-hidden="true">
            <svg
              className="landing-hero__ground-svg"
              viewBox="0 0 1000 585"
              preserveAspectRatio="none"
            >
              <ellipse
                className="landing-hero__ground-disc"
                cx="500"
                cy="292.5"
                rx="498"
                ry="290"
              />
              <ellipse
                className="landing-hero__ground-ring landing-hero__ground-ring--1"
                cx="500"
                cy="292.5"
                rx="498"
                ry="290"
              />
              <ellipse
                className="landing-hero__ground-ring landing-hero__ground-ring--2"
                cx="500"
                cy="292.5"
                rx="410"
                ry="239"
              />
              <ellipse
                className="landing-hero__ground-ring landing-hero__ground-ring--3"
                cx="500"
                cy="292.5"
                rx="320"
                ry="187"
              />
            </svg>
          </div>

          <div className="landing-hero__copy" data-intro>
            <h1 className="landing-hero__title" id="landing-title">
              Asia Explorer
            </h1>
            <p className="landing-hero__tagline">Kenali Asia lewat tanganmu.</p>
            <p className="landing-hero__sub">Pilih satu negara di benua untuk mulai.</p>

            <div className="landing-hero__chips" data-intro>
              <span className="landing-hero__chips-label">Coba:</span>
              {HERO_PICK_IDS.map((id, index) => {
                const country = countryEntry(id);
                if (!country) {
                  return null;
                }
                return (
                  <Fragment key={id}>
                    {index > 0 ? (
                      <span className="landing-hero__chip-sep" aria-hidden="true">
                        ·
                      </span>
                    ) : null}
                    <button
                      type="button"
                      className="landing-hero__chip"
                      aria-haspopup="dialog"
                      onClick={() => selectCountry(id)}
                    >
                      {country.nameId}
                    </button>
                  </Fragment>
                );
              })}
            </div>
          </div>

          <div
            className={
              hoveredCountry
                ? 'landing-hero__scene landing-hero__scene--country'
                : 'landing-hero__scene'
            }
            data-intro
          >
            <AsiaSceneLazy
              label="Peta Asia interaktif"
              describedBy="landing-hero-help"
              selectedId={selectedId}
              onHoverCountry={setHoveredId}
              onSelectCountry={selectCountryFromScene}
              scrollProgressRef={heroProgressRef}
            />
          </div>

          <div
            className="landing-hero__peek"
            data-visible={hoveredCountry ? 'true' : undefined}
            aria-hidden="true"
          >
            {hoveredCountry && hoveredProfile ? (
              <>
                <span className="landing-hero__peek-name">{hoveredCountry.nameId}</span>
                <span
                  className="landing-hero__peek-native"
                  lang={hoveredProfile.lang}
                  dir={hoveredProfile.dir}
                >
                  {hoveredCountry.greeting.native}
                </span>
                {differs(hoveredCountry.greeting.native, hoveredCountry.greeting.roman) ? (
                  <span className="landing-hero__peek-roman">
                    {hoveredCountry.greeting.roman}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>

          <p id="landing-hero-help" className="visually-hidden">
            Pilih negara di benua. Tekan Tab untuk membuka daftar negara, lalu Enter untuk
            melihat sapaan.
          </p>

          <p className="landing-hint landing-hint--select" data-intro>
            Pilih negara · atau gulir
          </p>

          <CountryList onSelect={selectCountry} />
        </div>
      </section>

      {/* Scene 2 — skala negara */}
      <section
        className="landing-scene landing-scene--scale landing-scene--pinned"
        aria-labelledby="landing-scale-heading"
      >
        <div className="landing-stage landing-stage--split">
          <div className="landing-stage__copy" data-reveal>
            <h2 className="landing-display landing-display--stat" id="landing-scale-heading">
              <span className="landing-display__number" data-counter="15">
                15
              </span>
              <span className="landing-display__words">negara dalam cakupan</span>
            </h2>
            <p className="landing-note">Dari Turki sampai Jepang.</p>
          </div>

          <div className="landing-map-wrap" data-reveal>
            <CountryMapSvg />
          </div>
        </div>
      </section>

      {/* Scene 3 — kedalaman bahasa */}
      <section
        className="landing-scene landing-scene--language landing-scene--pinned"
        aria-labelledby="landing-language-heading"
      >
        <div className="landing-stage landing-stage--language">
          <div className="landing-lang__sil">
            <Silhouette id="id" className="landing-lang__shape" />
          </div>

          <div className="landing-stage__copy landing-center" data-reveal>
            <h2
              className="landing-display landing-display--stat landing-display--wide"
              id="landing-language-heading"
            >
              <span className="landing-display__number" data-counter="718">
                718
              </span>
              <span className="landing-display__words">
                bahasa daerah, Indonesia (Badan Bahasa)
              </span>
            </h2>
            <p className="landing-note">
              Tercatat dari 2.560 titik pengamatan di seluruh kepulauan.
            </p>
          </div>
        </div>
      </section>

      {/* Scene 4 — panggung aksara */}
      <section
        className="landing-scene landing-scene--script landing-scene--pinned"
        aria-labelledby="landing-script-heading"
      >
        <div className="landing-stage landing-stage--script">
          <div className="landing-stage__copy" data-reveal>
            <h2 className="landing-display" id="landing-script-heading">
              Tiga aksara, tiga cara menyapa
            </h2>
          </div>

          <div className="landing-script__viewport">
            <div className="landing-script__track" data-track>
              {scriptCountries.map((country) => {
                const profile = profileFor(country);
                return (
                  <article
                    key={country.id}
                    className="landing-script__card"
                    data-reveal
                    style={
                      {
                        '--card-accent': `var(--country-${country.id})`,
                      } as CSSProperties
                    }
                  >
                    <p className="landing-script__label">{country.language.nameId}</p>
                    <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                      {country.greeting.native}
                    </p>
                    {differs(country.greeting.native, country.greeting.roman) ? (
                      <p className="landing-script__roman">{country.greeting.roman}</p>
                    ) : null}
                    <p className="landing-script__meaning">{country.greeting.meaningId}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Scene 5 — tapestry regional */}
      <section
        className="landing-scene landing-scene--regional"
        aria-labelledby="landing-regional-heading"
      >
        <div className="landing-stage landing-stage--regional">
          <div className="landing-regional__layers" aria-hidden="true">
            {REGIONAL_SILHOUETTES.map((layer) => (
              <div
                key={layer.id}
                className={`landing-regional__layer landing-regional__layer--${layer.id}`}
                data-parallax={layer.ratio}
              >
                <div className="landing-regional__reveal" data-reveal>
                  <Silhouette id={layer.id} />
                </div>
              </div>
            ))}
          </div>

          <div className="landing-stage__copy landing-center" data-reveal>
            <h2 className="landing-display" id="landing-regional-heading">
              Asia Tenggara, ratusan cara menyapa
            </h2>
          </div>
        </div>
      </section>

      {/* Scene 6 — vignette budaya */}
      <section
        className="landing-scene landing-scene--cultural landing-scene--pinned"
        aria-labelledby="landing-cultural-heading"
      >
        <div className="landing-stage landing-stage--cultural">
          <div className="landing-stage__copy landing-center" data-reveal>
            <h2 className="landing-display" id="landing-cultural-heading">
              Setiap negara punya caranya sendiri
            </h2>
          </div>

          <div className="landing-cultural__diptych">
            <div className="landing-cultural__col landing-cultural__col--tr">
              <div
                className="landing-cultural__layer landing-cultural__layer--tr"
                data-parallax="0.92"
              >
                <div className="landing-cultural__reveal" data-reveal>
                  <Silhouette id="tr" />
                </div>
              </div>
              <p className="landing-cultural__label landing-cultural__label--tr" data-reveal>
                <span
                  className="landing-cultural__icon landing-cultural__icon--cezve"
                  aria-hidden="true"
                >
                  <CezveIcon />
                </span>
                <span className="landing-cultural__text">Turki, kopi Turki, cezve</span>
              </p>
            </div>

            <div className="landing-cultural__col landing-cultural__col--th">
              <div
                className="landing-cultural__layer landing-cultural__layer--th"
                data-parallax="1.08"
              >
                <div className="landing-cultural__reveal" data-reveal>
                  <Silhouette id="th" />
                </div>
              </div>
              <p className="landing-cultural__label landing-cultural__label--th" data-reveal>
                <span
                  className="landing-cultural__icon landing-cultural__icon--wai"
                  aria-hidden="true"
                >
                  <WaiIcon />
                </span>
                <span className="landing-cultural__text">Thailand, wai, salam hormat</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 7 — undangan interaktif */}
      <section
        id="peta"
        ref={mapSectionRef}
        tabIndex={-1}
        className="landing-scene landing-scene--invitation"
        aria-labelledby="landing-invitation-heading"
        aria-describedby="landing-map-help"
      >
        <div className="landing-stage landing-stage--invitation">
          <div className="landing-stage__copy landing-center" data-reveal>
            <h2 className="landing-display" id="landing-invitation-heading">
              Pilih negara, mulai penjelajahan
            </h2>
            <p className="landing-note">
              Sentuh atau arahkan kursor ke negara di benua untuk mulai penjelajahan.
            </p>
          </div>

          <div className="landing-invitation__scene" data-reveal>
            <InteractiveAsiaMap48 onSelectCountry={selectCountry} />
          </div>

          <p id="landing-map-help" className="visually-hidden">
            Gunakan peta benua untuk memilih negara.
          </p>
        </div>
      </section>

      <CountryDialog country={selectedCountry} onClose={closeDialog} />

      <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
        {selectedCountry
          ? `${selectedCountry.nameId} — ${selectedCountry.language.nameId}`
          : ''}
      </div>
    </div>
  );
}
