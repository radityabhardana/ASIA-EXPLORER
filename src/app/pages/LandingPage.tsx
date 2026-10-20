import { useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';

import { scrollToSection } from '@/lib/motion';
import { differs, profileFor } from '@/sections/country/scripts';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryDialog from '@/sections/landing/CountryDialog';
import CountryList from '@/sections/landing/CountryList';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import Silhouette from '@/sections/landing/Silhouette';
import { CezveIcon, WaiIcon } from '@/sections/landing/icons';
import {
  FOOTER_SOURCES,
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

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const heroProgressRef = useRef(0);
  // Scene 7 statis saat interaktif (§3): progres tetap, kamera tidak berubah.
  const invitationProgressRef = useRef(0.5);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  useLandingTimeline({ root: rootRef, progress: heroProgressRef });

  const selectedCountry = selectedId ? countryEntry(selectedId) ?? null : null;
  const hoverCountry = hoverId ? countryEntry(hoverId) ?? null : null;

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className="landing" ref={rootRef}>
      {/* Scene 1 — hero */}
      <section
        className="landing-scene landing-scene--hero"
        aria-labelledby="landing-title"
      >
        <a className="landing-skip" href="#peta" onClick={handleSkipToMap}>
          Lewati ke peta
        </a>

        <div className="landing-stage landing-stage--hero">
          <div className="landing-hero__copy" data-reveal>
            <p className="landing-kicker">Asiakin</p>
            <h1 className="landing-hero__title" id="landing-title">
              Jelajahi Asia lewat bahasa aslinya
            </h1>
          </div>

          <div className="landing-hero__scene">
            <AsiaSceneLazy
              decorative
              label="Peta Asia"
              scrollProgressRef={heroProgressRef}
            />
          </div>

          <p className="landing-hint" data-reveal>
            Gulir
          </p>
        </div>
      </section>

      {/* Scene 2 — skala negara */}
      <section
        className="landing-scene landing-scene--scale landing-scene--pinned"
        aria-labelledby="landing-scale-heading"
      >
        <div className="landing-stage landing-stage--split">
          <div className="landing-stage__copy" data-reveal>
            <h2
              className="landing-display landing-display--stat"
              id="landing-scale-heading"
            >
              <span className="landing-display__number" data-counter="15">
                15
              </span>
              <span className="landing-display__words">
                negara dalam cakupan
              </span>
            </h2>
            <p className="landing-note">Dari Arab Saudi sampai Jepang.</p>
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
                bahasa daerah, Indonesia — Badan Bahasa
              </span>
            </h2>
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
            <h2
              className="landing-display"
              id="landing-regional-heading"
            >
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
          <div className="landing-cultural__layers" aria-hidden="true">
            <div
              className="landing-cultural__layer landing-cultural__layer--tr"
              data-parallax="0.92"
            >
              <div className="landing-cultural__reveal" data-reveal>
                <Silhouette id="tr" />
              </div>
            </div>
            <div
              className="landing-cultural__layer landing-cultural__layer--th"
              data-parallax="1.08"
            >
              <div className="landing-cultural__reveal" data-reveal>
                <Silhouette id="th" />
              </div>
            </div>
            <span className="landing-cultural__icon landing-cultural__icon--cezve" data-reveal>
              <CezveIcon />
            </span>
            <span className="landing-cultural__icon landing-cultural__icon--wai" data-reveal>
              <WaiIcon />
            </span>
          </div>

          <div className="landing-stage__copy landing-center" data-reveal>
            <h2
              className="landing-display"
              id="landing-cultural-heading"
            >
              Setiap negara punya caranya sendiri
            </h2>
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
            <h2
              className="landing-display"
              id="landing-invitation-heading"
            >
              Pilih negara, mulai penjelajahan
            </h2>
            <p className="landing-note">
              Arahkan kursor ke benua, atau tekan Tab untuk daftar negara.
            </p>
          </div>

          <div className="landing-invitation__scene" data-reveal>
            <AsiaSceneLazy
              label="Peta Asia interaktif"
              describedBy="landing-map-help"
              scrollProgressRef={invitationProgressRef}
              selectedId={selectedId}
              onHoverCountry={(id) => setHoverId(id)}
              onSelectCountry={(id) => setSelectedId(id)}
            />
            {hoverCountry ? (
              <p className="landing-invitation__label" aria-hidden="true">
                {hoverCountry.nameId}
              </p>
            ) : null}
          </div>

          <CountryList onSelect={(id) => setSelectedId(id)} />

          <div
            className="visually-hidden"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {hoverCountry
              ? `${hoverCountry.nameId} — ${hoverCountry.language.nameId}`
              : ''}
          </div>
          <p id="landing-map-help" className="visually-hidden">
            Gunakan Tab untuk membuka daftar negara, lalu Enter untuk memilih.
          </p>
        </div>
      </section>

      {/* Scene 8 — footer */}
      <footer
        className="landing-scene landing-scene--footer"
        aria-labelledby="landing-footer-heading"
      >
        <div className="landing-stage landing-stage--footer">
          <div className="landing-footer__copy" data-reveal>
            <h2 className="landing-display" id="landing-footer-heading">
              Sumber data
            </h2>
            <p className="landing-note">Data: Badan Bahasa, Britannica, UNESCO</p>
          </div>

          <ul className="landing-footer__links">
            {FOOTER_SOURCES.map((source) => (
              <li key={source.label}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>

          <p className="landing-footer__mark">Asiakin</p>
        </div>
      </footer>

      <CountryDialog
        country={selectedCountry}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
