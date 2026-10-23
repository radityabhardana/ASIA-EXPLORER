import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import { scrollToSection } from '@/lib/motion';
import { differs, profileFor } from '@/sections/country/scripts';
import Navbar from '@/app/Navbar';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import MosaicGallery from '@/sections/landing/MosaicGallery';
import Silhouette from '@/sections/landing/Silhouette';
import TopoBackground from '@/sections/landing/TopoBackground';
import {
  SCRIPT_COUNTRY_IDS,
  countryEntry,
} from '@/sections/landing/landing-data';
import { useLandingTimeline } from '@/sections/landing/useLandingTimeline';
import '@/styles/landing.css';

const scriptCountries = SCRIPT_COUNTRY_IDS.flatMap((id) => {
  const country = countryEntry(id);
  return country ? [country] : [];
});

const LEITNER_ITEMS = [
  { box: 1, interval: '1h', days: 1, duePhrases: 18, label: 'Kotak 1: Interval 1 hari · 18 frasa siap ulas' },
  { box: 2, interval: '3h', days: 3, duePhrases: 9, label: 'Kotak 2: Interval 3 hari · 9 frasa siap ulas' },
  { box: 3, interval: '7h', days: 7, duePhrases: 12, label: 'Kotak 3: Interval 7 hari · 12 frasa siap ulas' },
  { box: 4, interval: '16h', days: 16, duePhrases: 4, label: 'Kotak 4: Interval 16 hari · 4 frasa siap ulas' },
  { box: 5, interval: '35h', days: 35, duePhrases: 2, label: 'Kotak 5: Interval 35 hari · 2 frasa siap ulas' },
];

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const heroProgressRef = useRef(0);
  /**
   * Sumber sorotan tunggal scene Skala: tween GSAP menulis 0..1 di sini dan
   * teks counter dalam satu onUpdate — jumlah tinta 3D selalu = teks counter.
   */
  const scaleHighlightRef = useRef(1);
  const [ready, setReady] = useState(false);
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<number>(0);
  const [activeLeitnerBox, setActiveLeitnerBox] = useState<number>(3);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

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

  const speakGreeting = (countryId: string, text: string, speechLang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = speechLang;
      utterance.rate = 0.88;
      setSpeakingId(countryId);

      utterance.onend = () => {
        setSpeakingId((cur) => (cur === countryId ? null : cur));
      };
      utterance.onerror = () => {
        setSpeakingId((cur) => (cur === countryId ? null : cur));
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setSpeakingId(null);
    }
  };

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  const activeLeitnerItem =
    LEITNER_ITEMS.find((b) => b.box === activeLeitnerBox) ?? LEITNER_ITEMS[2]!;

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      <TopoBackground />
      <a className="landing-skip skip-link" href="#peta" onClick={handleSkipToMap}>
        Lewati ke pilihan negara
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
              debugKey="hero"
              label="Peta Asia interaktif"
              scrollProgressRef={heroProgressRef}
              showOverlays={true}
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
                    const isSpeaking = speakingId === country.id;
                    return (
                      <article
                        key={country.id}
                        className={`landing-script__item landing-script__card ${isSpeaking ? 'landing-script__card--speaking' : ''}`}
                        tabIndex={0}
                        aria-label={`${country.nameId}: ${country.greeting.native}, bahasa ${country.language.nameId}. Ketuk untuk mendengarkan pengucapan.`}
                        onClick={() =>
                          speakGreeting(country.id, country.greeting.native, profile.speechLang)
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            speakGreeting(country.id, country.greeting.native, profile.speechLang);
                          }
                        }}
                      >
                        <div className="landing-script__card-header">
                          <div className="landing-script__card-identity">
                            <span className="landing-script__country">{country.nameId}</span>
                            <span className="landing-script__label">
                              {country.language.nameId}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`landing-script__audio-btn ${isSpeaking ? 'landing-script__audio-btn--active' : ''}`}
                            aria-label={`Dengarkan pengucapan sapaan ${country.nameId}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakGreeting(country.id, country.greeting.native, profile.speechLang);
                            }}
                          >
                            {isSpeaking ? (
                              <span className="landing-script__soundwave" aria-hidden="true">
                                <span className="landing-script__soundwave-bar" />
                                <span className="landing-script__soundwave-bar" />
                                <span className="landing-script__soundwave-bar" />
                              </span>
                            ) : (
                              <svg
                                className="landing-script__speaker-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                              </svg>
                            )}
                          </button>
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
                    const isSpeaking = speakingId === country.id;
                    return (
                      <article
                        key={`dup-${country.id}`}
                        className={`landing-script__item landing-script__card ${isSpeaking ? 'landing-script__card--speaking' : ''}`}
                        tabIndex={-1}
                        onClick={() =>
                          speakGreeting(country.id, country.greeting.native, profile.speechLang)
                        }
                      >
                        <div className="landing-script__card-header">
                          <div className="landing-script__card-identity">
                            <span className="landing-script__country">{country.nameId}</span>
                            <span className="landing-script__label">
                              {country.language.nameId}
                            </span>
                          </div>
                          <button
                            type="button"
                            tabIndex={-1}
                            className={`landing-script__audio-btn ${isSpeaking ? 'landing-script__audio-btn--active' : ''}`}
                            aria-label={`Dengarkan pengucapan sapaan ${country.nameId}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              speakGreeting(country.id, country.greeting.native, profile.speechLang);
                            }}
                          >
                            {isSpeaking ? (
                              <span className="landing-script__soundwave" aria-hidden="true">
                                <span className="landing-script__soundwave-bar" />
                                <span className="landing-script__soundwave-bar" />
                                <span className="landing-script__soundwave-bar" />
                              </span>
                            ) : (
                              <svg
                                className="landing-script__speaker-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                              </svg>
                            )}
                          </button>
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
                    className={`landing-dashboard__option-btn ${selectedScenarioOption === 0 ? 'landing-dashboard__option-btn--active landing-dashboard__option-btn--correct' : ''}`}
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
                    className={`landing-dashboard__option-btn ${selectedScenarioOption === 1 ? 'landing-dashboard__option-btn--active landing-dashboard__option-btn--warning' : ''}`}
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
                    {selectedScenarioOption === 1 && (
                      <div className="landing-dashboard__option-tags">
                        <span className="landing-dashboard__reason-tag landing-dashboard__reason-tag--amber">
                          Pelanggaran Norma Formal
                        </span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Interactive Feedback Cards */}
                {selectedScenarioOption === 0 && (
                  <div
                    className="landing-dashboard__scenario-feedback landing-dashboard__scenario-feedback--success"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="landing-dashboard__feedback-header">
                      <span
                        className="landing-dashboard__feedback-badge landing-dashboard__feedback-badge--success"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <strong className="landing-dashboard__feedback-lead">Benar!</strong>
                    </div>
                    <p className="landing-dashboard__feedback-text">
                      Di Jepang, kartu nama (meishi) dianggap sebagai representasi fisik kehormatan rekan bisnismu. Menerima dengan dua tangan menunjukkan rasa hormat penuh.
                    </p>
                  </div>
                )}

                {selectedScenarioOption === 1 && (
                  <div
                    className="landing-dashboard__scenario-feedback landing-dashboard__scenario-feedback--warning"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="landing-dashboard__feedback-header">
                      <span
                        className="landing-dashboard__feedback-badge landing-dashboard__feedback-badge--warning"
                        aria-hidden="true"
                      >
                        !
                      </span>
                      <strong className="landing-dashboard__feedback-lead">Kurang tepat.</strong>
                    </div>
                    <p className="landing-dashboard__feedback-text">
                      Menyerahkan kartu nama dengan satu tangan atau langsung mengantonginya dianggap meremehkan pemilik kartu.
                    </p>
                  </div>
                )}
              </div>

              {/* Spaced Repetition track: 5 Leitner review boxes */}
              <div className="landing-dashboard__leitner-track">
                <div className="landing-dashboard__leitner-header">
                  <span className="landing-dashboard__leitner-label">Phrase Vault Spaced Repetition</span>
                  <span className="landing-dashboard__leitner-meta">
                    Interval {activeLeitnerItem.days} Hari &middot; {activeLeitnerItem.duePhrases} Frasa Siap
                  </span>
                </div>
                <div
                  className="landing-dashboard__leitner-boxes"
                  role="tablist"
                  aria-label="Kotak ulasan Spaced Repetition"
                >
                  {LEITNER_ITEMS.map((item) => {
                    const isActive = activeLeitnerBox === item.box;
                    return (
                      <button
                        key={item.box}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        className={`landing-dashboard__leitner-box ${isActive ? 'landing-dashboard__leitner-box--active' : ''}`}
                        title={item.label}
                        onClick={() => setActiveLeitnerBox(item.box)}
                        onMouseEnter={() => setActiveLeitnerBox(item.box)}
                      >
                        <span className="landing-dashboard__leitner-num">{item.box}</span>
                        <span className="landing-dashboard__leitner-interval">{item.interval}</span>
                        {isActive && (
                          <span className="landing-dashboard__leitner-status">
                            &bull; {item.duePhrases} Frasa
                          </span>
                        )}
                      </button>
                    );
                  })}
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

      {/* Scene 7 — footer: wordmark dan catatan hak cipta */}
      <footer
        className="landing-scene landing-scene--footer"
        aria-labelledby="landing-footer-heading"
      >
        <div className="landing-stage landing-stage--footer">
          <p className="landing-footer__mark" id="landing-footer-heading" data-reveal>
            Asia Explorer
          </p>
          <p className="landing-footer__copyright" data-reveal>
            &copy; 2026 Asia Explorer &middot; Ekspedisi tipografi, etiket, dan kartografi 15 negara.
          </p>
        </div>
      </footer>
    </div>
  );
}
