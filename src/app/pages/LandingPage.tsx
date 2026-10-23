import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { scrollToSection } from '@/lib/motion';
import { differs, profileFor } from '@/sections/country/scripts';
import Navbar from '@/app/Navbar';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryDialog from '@/sections/landing/CountryDialog';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import MosaicGallery from '@/sections/landing/MosaicGallery';
import Silhouette from '@/sections/landing/Silhouette';
import TopoBackground from '@/sections/landing/TopoBackground';
import {
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
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<number>(0);

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

  const selectedCountry = selectedId ? (countryEntry(selectedId) ?? null) : null;
  const hoverCountry = hoverId ? (countryEntry(hoverId) ?? null) : null;

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      <TopoBackground />
      <a className="landing-skip skip-link" href="#peta" onClick={handleSkipToMap}>
        Lewati ke peta
      </a>
      <Navbar onScrollToMap={handleSkipToMap} />

      {/* Scene 1 — hero */}
      <section className="landing-scene landing-scene--hero" aria-labelledby="landing-title">
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
            <p className="landing-hero__eyebrow">PETA INTERAKTIF · 15 NEGARA</p>
            <span className="landing-hero__accent-bar" aria-hidden="true" />
            <h1 className="landing-hero__title" id="landing-title">
              Asia Explorer
            </h1>
          </div>

          <div className="landing-hero__scene" data-intro>
            <AsiaSceneLazy
              decorative
              debugKey="hero"
              label="Peta Asia"
              scrollProgressRef={heroProgressRef}
            />
          </div>
        </div>
      </section>

      {/* Scene 2 — skala negara: proyeksi peta SVG 15 negara dengan sorotan tersinkronisasi */}
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
              <span className="landing-display__words">negara dalam cakupan</span>
            </h2>
            <p className="landing-note">Dari Turki sampai Jepang.</p>
          </div>

          <div className="landing-scale__map-wrap" data-reveal>
            <CountryMapSvg variant="scene" className="landing-scale__map" />
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

      {/* Scene 4 — panggung aksara (K12) */}
      <section
        className="landing-scene landing-scene--script landing-scene--pinned"
        aria-labelledby="landing-script-heading"
      >
        <div className="landing-stage landing-stage--script">
          <div className="landing-stage__copy" data-reveal>
            <p className="landing-kicker">TIPOGRAFI ASIA</p>
            <h2 className="landing-display" id="landing-script-heading">
              Satu Sapaan, Lima Belas Aksara
            </h2>
          </div>

          <div className="landing-script__band" data-reveal>
            <div className="landing-script__viewport">
              <div
                className="landing-script__marquee"
                tabIndex={-1}
                aria-label="Pita aksara 15 negara"
              >
                <div className="landing-script__track">
                  {scriptCountries.map((country) => {
                    const profile = profileFor(country);
                    return (
                      <article
                        key={country.id}
                        className="landing-script__item landing-script__card"
                        tabIndex={0}
                        aria-label={`${country.nameId}: ${country.greeting.native}, bahasa ${country.language.nameId}`}
                      >
                        <div className="landing-script__card-header">
                          <span className="landing-script__country">{country.nameId}</span>
                          <span className="landing-script__label">{country.language.nameId}</span>
                        </div>
                        <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                          {country.greeting.native}
                        </p>
                        <p className="landing-script__roman">
                          {differs(country.greeting.native, country.greeting.roman)
                            ? country.greeting.roman
                            : country.greeting.meaningId}
                        </p>
                      </article>
                    );
                  })}
                </div>

                <div className="landing-script__track" aria-hidden="true">
                  {scriptCountries.map((country) => {
                    const profile = profileFor(country);
                    return (
                      <article
                        key={`dup-${country.id}`}
                        className="landing-script__item landing-script__card"
                        tabIndex={-1}
                      >
                        <div className="landing-script__card-header">
                          <span className="landing-script__country">{country.nameId}</span>
                          <span className="landing-script__label">{country.language.nameId}</span>
                        </div>
                        <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                          {country.greeting.native}
                        </p>
                        <p className="landing-script__roman">
                          {differs(country.greeting.native, country.greeting.roman)
                            ? country.greeting.roman
                            : country.greeting.meaningId}
                        </p>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 5 — undangan interaktif */}
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
            <p className="landing-note">Sentuh atau arahkan kursor ke negara di benua.</p>
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

          <div className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">
            {hoverCountry ? `${hoverCountry.nameId}, ${hoverCountry.language.nameId}` : ''}
          </div>
          <p id="landing-map-help" className="visually-hidden">
            Gunakan peta atau indeks negara di bagian bawah halaman.
          </p>

          <CountryDialog country={selectedCountry} onClose={() => setSelectedId(null)} />
        </div>
      </section>

      {/* Scene 6 — Dashboard & Sistem Belajar */}
      <section
        id="dashboard-showcase"
        className="landing-scene landing-scene--dashboard"
        aria-labelledby="landing-dashboard-heading"
      >
        <div className="landing-stage landing-stage--dashboard">
          <div className="landing-stage__copy landing-center" data-reveal>
            <p className="landing-kicker">RUANG BELAJAR</p>
            <h2 className="landing-display" id="landing-dashboard-heading">
              Studio Belajar &amp; Progres Budaya
            </h2>
            <p className="landing-note">
              Simpan pemahaman etiket dan rawat memori aksara secara mandiri di perambanmu.
            </p>
          </div>

          <div className="landing-dashboard__grid" data-reveal>
            {/* Left Side: Live Interactive Learning Studio / Console */}
            <div className="landing-dashboard__console">
              <div className="landing-dashboard__console-bar">
                <div className="landing-dashboard__console-dots" aria-hidden="true">
                  <span className="landing-dashboard__console-dot landing-dashboard__console-dot--red" />
                  <span className="landing-dashboard__console-dot landing-dashboard__console-dot--yellow" />
                  <span className="landing-dashboard__console-dot landing-dashboard__console-dot--green" />
                </div>
                <span className="landing-dashboard__console-title">
                  asiakin-engine v3.0 &middot; Kyoto, Jepang &middot; Progres 5/6
                </span>
              </div>

              {/* Active Quest Scenario preview */}
              <div className="landing-dashboard__scenario-box">
                <div className="landing-dashboard__scenario-header">
                  <span className="landing-dashboard__scenario-badge">SKENARIO ETIKET BUDAYA</span>
                  <span className="landing-dashboard__scenario-location">Tokyo, Jepang</span>
                </div>
                <h3 className="landing-dashboard__scenario-title">
                  &ldquo;Etiket Menyerahkan Kartu Nama (Meishi) di Tokyo&rdquo;
                </h3>
                <div
                  className="landing-dashboard__scenario-options"
                  role="radiogroup"
                  aria-label="Pilihan respon etiket"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={selectedScenarioOption === 0}
                    className={`landing-dashboard__option-btn ${selectedScenarioOption === 0 ? 'landing-dashboard__option-btn--active' : ''}`}
                    onClick={() => setSelectedScenarioOption(0)}
                  >
                    <div className="landing-dashboard__option-content">
                      <span className="landing-dashboard__option-indicator" aria-hidden="true">
                        {selectedScenarioOption === 0 && (
                          <span className="landing-dashboard__option-indicator-inner" />
                        )}
                      </span>
                      <span className="landing-dashboard__option-text">
                        Pegang dua sudut atas dengan kedua tangan, teks menghadap penerima, bungkukkan badan 15 derajat.
                      </span>
                    </div>
                    {selectedScenarioOption === 0 && (
                      <div className="landing-dashboard__option-tags">
                        <span className="landing-dashboard__reason-tag">Penghormatan Hierarki</span>
                        <span className="landing-dashboard__reason-tag">Konteks Sosial</span>
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={selectedScenarioOption === 1}
                    className={`landing-dashboard__option-btn ${selectedScenarioOption === 1 ? 'landing-dashboard__option-btn--active' : ''}`}
                    onClick={() => setSelectedScenarioOption(1)}
                  >
                    <div className="landing-dashboard__option-content">
                      <span className="landing-dashboard__option-indicator" aria-hidden="true">
                        {selectedScenarioOption === 1 && (
                          <span className="landing-dashboard__option-indicator-inner" />
                        )}
                      </span>
                      <span className="landing-dashboard__option-text">
                        Serahkan santai dengan satu tangan ke atas meja rapat lalu simpan langsung ke saku.
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Spaced Repetition track: 5 Leitner review boxes */}
              <div className="landing-dashboard__leitner-track">
                <div className="landing-dashboard__leitner-header">
                  <span className="landing-dashboard__leitner-label">Phrase Vault Spaced Repetition</span>
                  <span>Interval Otomatis</span>
                </div>
                <div className="landing-dashboard__leitner-boxes">
                  <div className="landing-dashboard__leitner-box" title="Kotak 1: 1 hari">
                    <span className="landing-dashboard__leitner-num">1</span>
                    <span className="landing-dashboard__leitner-interval">1h</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 2: 3 hari">
                    <span className="landing-dashboard__leitner-num">2</span>
                    <span className="landing-dashboard__leitner-interval">3h</span>
                  </div>
                  <div
                    className="landing-dashboard__leitner-box landing-dashboard__leitner-box--active"
                    title="Kotak 3: 7 hari"
                  >
                    <span className="landing-dashboard__leitner-num">3</span>
                    <span className="landing-dashboard__leitner-interval">7h</span>
                    <span className="landing-dashboard__leitner-status">● 12 Frasa</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 4: 16 hari">
                    <span className="landing-dashboard__leitner-num">4</span>
                    <span className="landing-dashboard__leitner-interval">16h</span>
                  </div>
                  <div className="landing-dashboard__leitner-box" title="Kotak 5: 35 hari">
                    <span className="landing-dashboard__leitner-num">5</span>
                    <span className="landing-dashboard__leitner-interval">35h</span>
                  </div>
                </div>
              </div>

              {/* Local-first status bar */}
              <div className="landing-dashboard__status-bar">
                <div className="landing-dashboard__status-indicator">
                  <span className="landing-dashboard__status-pulse" aria-hidden="true" />
                  <span>Tersimpan Lokal di IndexedDB</span>
                </div>
                <span>0 Pelacak &middot; Siap Ekspor JSON</span>
              </div>
            </div>

            {/* Right Side: 4 Strategic Capability Pillars */}
            <div className="landing-dashboard__pillars">
              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">01</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">Kurikulum Cerdas</h3>
                  <p className="landing-dashboard__pillar-desc">
                    Satu tugas harian dipilih deterministik tanpa rasa bingung &mdash; selesaikan etiket, ulas frasa, atau jelajahi negara baru.
                  </p>
                </div>
              </article>

              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">02</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">Phrase Vault 5-Tingkat</h3>
                  <p className="landing-dashboard__pillar-desc">
                    Spaced repetition berbasis interval 1h, 3h, 7h, 16h, dan 35h mengulang frasa kunci sebelum terlupakan.
                  </p>
                </div>
              </article>

              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">03</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">Etiket Berakar Sebab</h3>
                  <p className="landing-dashboard__pillar-desc">
                    Bukan pilihan ganda buta. Pelajari norma budaya asli beserta latar belakang sosial dan hierarki kultural.
                  </p>
                </div>
              </article>

              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">04</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">Kedaulatan Data Penuh</h3>
                  <p className="landing-dashboard__pillar-desc">
                    100% tersimpan di perambanmu melalui IndexedDB, tanpa pelacak analitik, bebas ekspor dan impor berkas JSON kapan saja.
                  </p>
                </div>
              </article>

              <div className="landing-dashboard__actions">
                <Link to="/dashboard" className="landing-dashboard__cta">
                  Buka Dashboard <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene Mosaik — 15 Negara, Satu Benua */}
      <MosaicGallery />

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
                      <span className="landing-footer__index-name">{country.nameId}</span>
                      <span className="landing-footer__index-depth">{country.depth}</span>
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
