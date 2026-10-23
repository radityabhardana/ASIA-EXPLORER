import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';

import { scrollToSection } from '@/lib/motion';
import { differs, profileFor } from '@/sections/country/scripts';
import Navbar from '@/app/Navbar';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryDialog from '@/sections/landing/CountryDialog';
import Silhouette from '@/sections/landing/Silhouette';
import TopoBackground from '@/sections/landing/TopoBackground';
import {
  REGIONAL_SILHOUETTES,
  SCRIPT_COUNTRY_IDS,
  countries,
  countryEntry,
} from '@/sections/landing/landing-data';
import { useLandingTimeline } from '@/sections/landing/useLandingTimeline';
import '@/styles/landing.css';

const scriptCountries = SCRIPT_COUNTRY_IDS.flatMap((id) => {
  const country = countryEntry(id);
  return country ? [country] : [];
});

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const heroProgressRef = useRef(0);
  // Scene skala statis: kamera tetap, hanya sorotan yang beranimasi.
  const scaleProgressRef = useRef(0);
  // Scene 7 statis saat interaktif (§3): progres tetap, kamera tidak berubah.
  const invitationProgressRef = useRef(0.5);
  /**
   * Sumber sorotan tunggal scene Skala: tween GSAP menulis 0..1 di sini dan
   * teks counter dalam satu onUpdate — jumlah tinta 3D selalu = teks counter.
   */
  const scaleHighlightRef = useRef(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useLandingTimeline({
    root: rootRef,
    progress: heroProgressRef,
    highlight: scaleHighlightRef,
  });

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

  const selectedCountry = selectedId ? countryEntry(selectedId) ?? null : null;
  const hoverCountry = hoverId ? countryEntry(hoverId) ?? null : null;

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      <TopoBackground />
      <a
        className="landing-skip skip-link"
        href="#peta"
        onClick={handleSkipToMap}
      >
        Lewati ke peta
      </a>
      <Navbar onScrollToMap={handleSkipToMap} />

      {/* Scene 1 — hero */}
      <section
        className="landing-scene landing-scene--hero"
        aria-labelledby="landing-title"
      >
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
            <p className="landing-hero__tagline">
              Bahasa, aksara, dan budaya lima belas bangsa di benua Asia.
            </p>
          </div>

          <div className="landing-hero__scene" data-intro>
            <AsiaSceneLazy
              decorative
              debugKey="hero"
              label="Peta Asia"
              scrollProgressRef={heroProgressRef}
            />
          </div>

          <p className="landing-hint" data-intro>
            Gulir
          </p>
        </div>
      </section>

      {/* Scene 2 — skala negara: benua 3D yang sama dengan hero, 15 negara menyala */}
      <section
        className="landing-scene landing-scene--scale landing-scene--pinned"
        aria-labelledby="landing-scale-heading"
      >
        <div className="landing-stage landing-stage--scale">
          <div className="landing-stage__copy landing-center" data-reveal>
            <h2
              className="landing-display landing-display--stat landing-display--wide"
              id="landing-scale-heading"
            >
              <span className="landing-display__number" data-counter="15">
                15
              </span>
              <span className="landing-display__words">
                negara dalam cakupan
              </span>
            </h2>
            <p className="landing-note">Dari Turki sampai Jepang.</p>
          </div>

          <div className="landing-scale__scene" data-reveal>
            <AsiaSceneLazy
              decorative
              debugKey="scale"
              label="Peta Asia, 15 negara tersorot"
              scrollProgressRef={scaleProgressRef}
              highlightProgressRef={scaleHighlightRef}
            />
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
            <Silhouette id="id" className="landing-lang__shape" fit="slice" />
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
                    <p className="landing-script__label">
                      {country.language.nameId}
                    </p>
                    <p
                      className="landing-script__native"
                      lang={profile.lang}
                      dir={profile.dir}
                    >
                      {country.greeting.native}
                    </p>
                    {differs(country.greeting.native, country.greeting.roman) ? (
                      <p className="landing-script__roman">
                        {country.greeting.roman}
                      </p>
                    ) : null}
                    <p className="landing-script__meaning">
                      {country.greeting.meaningId}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Scene 5 — tapestry regional (di-pin: headline di atas, siluet mengisi sisanya) */}
      <section
        className="landing-scene landing-scene--regional landing-scene--pinned"
        aria-labelledby="landing-regional-heading"
      >
        <div className="landing-stage landing-stage--regional">
          <div className="landing-stage__copy landing-center" data-reveal>
            <h2
              className="landing-display"
              id="landing-regional-heading"
            >
              Asia Tenggara, ratusan cara menyapa
            </h2>
          </div>

          <div className="landing-regional__band">
            <div className="landing-regional__layers" aria-hidden="true">
              {REGIONAL_SILHOUETTES.map((layer) => (
                <div
                  key={layer.id}
                  className={`landing-regional__layer landing-regional__layer--${layer.id}`}
                >
                  <div className="landing-regional__reveal" data-reveal>
                    <Silhouette id={layer.id} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Scene 6 — undangan interaktif */}
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
            <h2
              className="landing-display"
              id="landing-invitation-heading"
            >
              Pilih negara, mulai penjelajahan
            </h2>
            <p className="landing-note">
              Sentuh atau arahkan kursor ke negara di benua.
            </p>
          </div>

          <div className="landing-invitation__scene" data-reveal>
            <AsiaSceneLazy
              debugKey="invitation"
              label="Peta Asia interaktif"
              describedBy="landing-map-help"
              scrollProgressRef={invitationProgressRef}
              selectedId={selectedId}
              onHoverCountry={(id) => setHoverId(id)}
              onSelectCountry={(id) => setSelectedId(id)}
            />
          </div>

          <div
            className="visually-hidden"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {hoverCountry
              ? `${hoverCountry.nameId}, ${hoverCountry.language.nameId}`
              : ''}
          </div>
          <p id="landing-map-help" className="visually-hidden">
            Gunakan peta atau indeks negara di bagian bawah halaman.
          </p>

          <CountryDialog
            country={selectedCountry}
            onClose={() => setSelectedId(null)}
          />
        </div>
      </section>

      {/* Scene 7 — footer: indeks negara + wordmark */}
      <footer
        className="landing-scene landing-scene--footer"
        aria-labelledby="landing-footer-heading"
      >
        <div className="landing-stage landing-stage--footer">
          <div className="landing-footer__index" data-reveal>
            <h2 className="landing-footer__index-title" id="landing-footer-heading">
              Pilih negara
            </h2>
            <nav className="landing-footer__index-nav" aria-label="Indeks negara">
              <ul className="landing-footer__index-list">
                {countries.map((country) => (
                  <li key={country.id}>
                    <button
                      type="button"
                      className="landing-footer__index-button"
                      data-country={country.id}
                      aria-haspopup="dialog"
                      onClick={() => setSelectedId(country.id)}
                    >
                      <span className="landing-footer__index-name">
                        {country.nameId}
                      </span>
                      <span className="landing-footer__index-depth">
                        {country.depth}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <p className="landing-footer__mark">Asia Explorer</p>
        </div>
      </footer>
    </div>
  );
}
