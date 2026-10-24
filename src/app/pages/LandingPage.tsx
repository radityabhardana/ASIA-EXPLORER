import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import Navbar from '@/app/Navbar';
import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';
import { speak } from '@/lib/speech';
import { differs, profileFor } from '@/sections/country/scripts';
import AsiaSceneLazy from '@/sections/landing/AsiaSceneLazy';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import MosaicGallery from '@/sections/landing/MosaicGallery';
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

export default function LandingPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const mapSectionRef = useRef<HTMLElement>(null);
  const heroProgressRef = useRef(0);
  const invitationProgressRef = useRef(0.5);
  /**
   * Sumber sorotan tunggal scene Skala: tween GSAP menulis 0..1 di sini dan
   * teks counter dalam satu onUpdate — jumlah tinta 3D selalu = teks counter.
   */
  const scaleHighlightRef = useRef(1);
  const [ready, setReady] = useState(false);
  const [selectedScenarioOption, setSelectedScenarioOption] = useState<number>(0);
  const [activeLeitnerBox, setActiveLeitnerBox] = useState<number>(3);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const { locale, t } = useI18n();

  const leitnerItems = [
    {
      box: 1,
      interval: '1h',
      days: 1,
      duePhrases: 18,
      label:
        locale === 'id'
          ? 'Kotak 1: Interval 1 hari · 18 frasa siap ulas'
          : 'Box 1: 1-day interval · 18 phrases due',
    },
    {
      box: 2,
      interval: '3h',
      days: 3,
      duePhrases: 9,
      label:
        locale === 'id'
          ? 'Kotak 2: Interval 3 hari · 9 frasa siap ulas'
          : 'Box 2: 3-day interval · 9 phrases due',
    },
    {
      box: 3,
      interval: '7h',
      days: 7,
      duePhrases: 12,
      label:
        locale === 'id'
          ? 'Kotak 3: Interval 7 hari · 12 frasa siap ulas'
          : 'Box 3: 7-day interval · 12 phrases due',
    },
    {
      box: 4,
      interval: '16h',
      days: 16,
      duePhrases: 4,
      label:
        locale === 'id'
          ? 'Kotak 4: Interval 16 hari · 4 frasa siap ulas'
          : 'Box 4: 16-day interval · 4 phrases due',
    },
    {
      box: 5,
      interval: '35h',
      days: 35,
      duePhrases: 2,
      label:
        locale === 'id'
          ? 'Kotak 5: Interval 35 hari · 2 frasa siap ulas'
          : 'Box 5: 35-day interval · 2 phrases due',
    },
  ];

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

  const speakGreeting = (
    countryId: string,
    text: string,
    romanText: string,
    speechLang: string,
  ) => {
    setSpeakingId(countryId);
    speak(text, {
      lang: speechLang,
      fallbackText: romanText,
      rate: 0.9,
      onEnd: () => setSpeakingId((cur) => (cur === countryId ? null : cur)),
      onError: () => setSpeakingId((cur) => (cur === countryId ? null : cur)),
    });
  };

  const handleSkipToMap = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    scrollToSection('#peta');
    mapSectionRef.current?.focus({ preventScroll: true });
  };

  const activeLeitnerItem =
    leitnerItems.find((b) => b.box === activeLeitnerBox) ?? leitnerItems[2]!;

  return (
    <div className={`landing ${ready ? 'landing--ready' : ''}`} ref={rootRef}>
      <TopoBackground />
      <a className="landing-skip skip-link" href="#peta" onClick={handleSkipToMap}>
        {t('hero.skipLink')}
      </a>
      <Navbar onScrollToMap={handleSkipToMap} />

      {/* Scene 1 — Hero */}
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
            <p className="landing-hero__eyebrow">{t('hero.eyebrow')}</p>
            <span className="landing-hero__accent-bar" aria-hidden="true" />
            <h1 className="landing-hero__title" id="landing-title">
              Asia Explorer
            </h1>
          </div>

          <div className="landing-hero__scene" data-intro>
            <AsiaSceneLazy
              debugKey="hero"
              label={t('hero.eyebrow')}
              scrollProgressRef={heroProgressRef}
              showOverlays={true}
              interactiveClick={false}
              controlsHintText={t('hero.hint')}
            />
          </div>
        </div>
      </section>

      {/* Scene 2 — Skala: proyeksi peta SVG 15 negara dengan sorotan tersinkronisasi */}
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
              <span className="landing-display__words">{t('scale.statWords')}</span>
            </h2>
            <p className="landing-note">{t('scale.note')}</p>
          </div>

          <div className="landing-scale__map-wrap" data-reveal>
            <CountryMapSvg variant="scene" className="landing-scale__map" />
          </div>
        </div>
      </section>

      {/* Scene 3 — Aksara: pita sapaan 15 negara */}
      <section
        className="landing-scene landing-scene--script"
        aria-labelledby="landing-script-heading"
      >
        <div className="landing-stage landing-stage--script">
          <div className="landing-stage__copy" data-reveal>
            <p className="landing-kicker">{t('script.kicker')}</p>
            <h2 className="landing-display" id="landing-script-heading">
              {t('script.heading')}
            </h2>
          </div>

          <div className="landing-script__band" data-reveal>
            <div className="landing-script__viewport">
              <div
                className="landing-script__marquee"
                tabIndex={-1}
                aria-label={locale === 'id' ? 'Pita aksara 15 negara' : '15-country script band'}
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
                        aria-label={
                          locale === 'id'
                            ? `${country.nameId}: ${country.greeting.native}, bahasa ${country.language.nameId}. Ketuk untuk mendengarkan pengucapan.`
                            : `${country.nameId}: ${country.greeting.native}, ${country.language.nameId} language. Tap to listen.`
                        }
                        onClick={() =>
                          speakGreeting(
                            country.id,
                            country.greeting.native,
                            country.greeting.roman,
                            profile.speechLang,
                          )
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            speakGreeting(
                              country.id,
                              country.greeting.native,
                              country.greeting.roman,
                              profile.speechLang,
                            );
                          }
                        }}
                      >
                        <div className="landing-script__card-header">
                          <div className="landing-script__card-identity">
                            <div className="landing-script__country-badge">
                              <span className="landing-script__accent-bar" aria-hidden="true" />
                              <span className="landing-script__country">{country.nameId}</span>
                            </div>
                            <span className="landing-script__label">
                              {country.language.nameId}
                            </span>
                          </div>
                          <button
                            type="button"
                            className={`landing-script__audio-btn ${isSpeaking ? 'landing-script__audio-btn--active' : ''}`}
                            aria-label={
                              locale === 'id'
                                ? `Dengarkan pengucapan sapaan ${country.nameId}`
                                : `Listen to greeting pronunciation ${country.nameId}`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              speakGreeting(
                                country.id,
                                country.greeting.native,
                                country.greeting.roman,
                                profile.speechLang,
                              );
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
                        <div className="landing-script__card-body">
                          <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                            {country.greeting.native}
                          </p>
                          <p className="landing-script__roman">
                            {differs(country.greeting.native, country.greeting.roman)
                              ? country.greeting.roman
                              : country.greeting.meaningId}
                          </p>
                          {differs(country.greeting.native, country.greeting.roman) && country.greeting.meaningId && (
                            <p className="landing-script__meaning">
                              &ldquo;{country.greeting.meaningId}&rdquo;
                            </p>
                          )}
                        </div>
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
                          speakGreeting(
                            country.id,
                            country.greeting.native,
                            country.greeting.roman,
                            profile.speechLang,
                          )
                        }
                      >
                        <div className="landing-script__card-header">
                          <div className="landing-script__card-identity">
                            <div className="landing-script__country-badge">
                              <span className="landing-script__accent-bar" aria-hidden="true" />
                              <span className="landing-script__country">{country.nameId}</span>
                            </div>
                            <span className="landing-script__label">
                              {country.language.nameId}
                            </span>
                          </div>
                          <button
                            type="button"
                            tabIndex={-1}
                            className={`landing-script__audio-btn ${isSpeaking ? 'landing-script__audio-btn--active' : ''}`}
                            aria-label={
                              locale === 'id'
                                ? `Dengarkan pengucapan sapaan ${country.nameId}`
                                : `Listen to greeting pronunciation ${country.nameId}`
                            }
                            onClick={(e) => {
                              e.stopPropagation();
                              speakGreeting(
                                country.id,
                                country.greeting.native,
                                country.greeting.roman,
                                profile.speechLang,
                              );
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
                        <div className="landing-script__card-body">
                          <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                            {country.greeting.native}
                          </p>
                          <p className="landing-script__roman">
                            {differs(country.greeting.native, country.greeting.roman)
                              ? country.greeting.roman
                              : country.greeting.meaningId}
                          </p>
                          {differs(country.greeting.native, country.greeting.roman) && country.greeting.meaningId && (
                            <p className="landing-script__meaning">
                              &ldquo;{country.greeting.meaningId}&rdquo;
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 4 — Pilih Negara (Peta Interaktif 3D) */}
      <section
        id="peta"
        ref={mapSectionRef}
        tabIndex={-1}
        className="landing-scene landing-scene--invitation"
        aria-labelledby="landing-invitation-heading"
      >
        <div className="landing-stage landing-stage--invitation">
          <div className="landing-stage__copy landing-center" data-reveal>
            <p className="landing-kicker">{t('invitation.kicker')}</p>
            <h2 className="landing-display" id="landing-invitation-heading">
              {t('invitation.heading')}
            </h2>
            <p className="landing-note">{t('invitation.note')}</p>
          </div>

          <div className="landing-invitation__scene" data-reveal>
            <AsiaSceneLazy
              debugKey="invitation"
              label={t('invitation.heading')}
              scrollProgressRef={invitationProgressRef}
              showOverlays={true}
              interactiveClick={true}
              controlsHintText={t('invitation.hint')}
            />
          </div>
        </div>
      </section>

      {/* Scene 5 — Mosaik Galeri (15 Negara, Satu Benua) */}
      <MosaicGallery />

      {/* Scene 6 — Dashboard Showcase (Studio Belajar & Progres Budaya) */}
      <section
        id="dashboard-showcase"
        className="landing-scene landing-scene--dashboard"
        aria-labelledby="landing-dashboard-heading"
      >
        <div className="landing-stage landing-stage--dashboard">
          <div className="landing-stage__copy landing-center" data-reveal>
            <p className="landing-kicker">{t('dashboard.kicker')}</p>
            <h2 className="landing-display" id="landing-dashboard-heading">
              {t('dashboard.heading')}
            </h2>
            <p className="landing-note">{t('dashboard.note')}</p>
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
                  {t('dashboard.consoleTitle')}
                </span>
              </div>

              <div className="landing-dashboard__console-content">
                {/* Active Quest Scenario preview */}
                <div className="landing-dashboard__scenario-box">
                  <div className="landing-dashboard__scenario-header">
                    <span className="landing-dashboard__scenario-badge">
                      {t('dashboard.scenarioBadge')}
                    </span>
                    <span className="landing-dashboard__scenario-location">
                      {t('dashboard.scenarioLocation')}
                    </span>
                  </div>
                  <h3 className="landing-dashboard__scenario-title">
                    {t('dashboard.scenarioTitle')}
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
                          {selectedScenarioOption === 0 ? (
                            <svg
                              viewBox="0 0 14 14"
                              width="10"
                              height="10"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="2.5 7 5.5 10 11.5 4" />
                            </svg>
                          ) : (
                            <span className="landing-dashboard__option-indicator-inner" />
                          )}
                        </span>
                        <span className="landing-dashboard__option-text">
                          {t('dashboard.scenarioOpt1')}
                        </span>
                      </div>
                      {selectedScenarioOption === 0 && (
                        <div className="landing-dashboard__option-tags">
                          <span className="landing-dashboard__reason-tag">
                            {t('dashboard.tagHierarchy')}
                          </span>
                          <span className="landing-dashboard__reason-tag">
                            {t('dashboard.tagSocial')}
                          </span>
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
                          {t('dashboard.scenarioOpt2')}
                        </span>
                      </div>
                      {selectedScenarioOption === 1 && (
                        <div className="landing-dashboard__option-tags">
                          <span className="landing-dashboard__reason-tag landing-dashboard__reason-tag--amber">
                            {t('dashboard.tagViolation')}
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
                        <strong className="landing-dashboard__feedback-lead">
                          {t('dashboard.scenarioCorrectLead')}
                        </strong>
                      </div>
                      <p className="landing-dashboard__feedback-text">
                        {t('dashboard.scenarioCorrectText')}
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
                        <strong className="landing-dashboard__feedback-lead">
                          {t('dashboard.scenarioWarnLead')}
                        </strong>
                      </div>
                      <p className="landing-dashboard__feedback-text">
                        {t('dashboard.scenarioWarnText')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Spaced Repetition track: 5 Leitner review boxes */}
                <div className="landing-dashboard__leitner-track">
                  <div className="landing-dashboard__leitner-header">
                    <span className="landing-dashboard__leitner-label">
                      {t('dashboard.leitnerTitle')}
                    </span>
                    <span className="landing-dashboard__leitner-meta">
                      {t('dashboard.leitnerInterval')} {activeLeitnerItem.days}{' '}
                      {t('dashboard.leitnerDays')} &middot; {activeLeitnerItem.duePhrases}{' '}
                      {t('dashboard.leitnerPhrasesReady')}
                    </span>
                  </div>
                  <div
                    className="landing-dashboard__leitner-boxes"
                    role="tablist"
                    aria-label="Kotak ulasan Spaced Repetition"
                  >
                    {leitnerItems.map((item) => {
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
                              &bull; {item.duePhrases} {t('dashboard.leitnerPhrasesUnit')}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Local-first status bar */}
              <div className="landing-dashboard__status-bar">
                <div className="landing-dashboard__status-indicator">
                  <span className="landing-dashboard__status-pulse" aria-hidden="true" />
                  <span>{t('dashboard.statusLocal')}</span>
                </div>
                <span>{t('dashboard.statusMeta')}</span>
              </div>
            </div>

            {/* Right Side: 4 Strategic Capability Pillars */}
            <div className="landing-dashboard__pillars">
              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">01</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">{t('dashboard.p1Title')}</h3>
                  <p className="landing-dashboard__pillar-desc">{t('dashboard.p1Desc')}</p>
                </div>
              </article>

              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">02</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">{t('dashboard.p2Title')}</h3>
                  <p className="landing-dashboard__pillar-desc">{t('dashboard.p2Desc')}</p>
                </div>
              </article>

              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">03</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">{t('dashboard.p3Title')}</h3>
                  <p className="landing-dashboard__pillar-desc">{t('dashboard.p3Desc')}</p>
                </div>
              </article>

              <article className="landing-dashboard__pillar-item">
                <span className="landing-dashboard__pillar-num">04</span>
                <div className="landing-dashboard__pillar-content">
                  <h3 className="landing-dashboard__pillar-title">{t('dashboard.p4Title')}</h3>
                  <p className="landing-dashboard__pillar-desc">{t('dashboard.p4Desc')}</p>
                </div>
              </article>

              <div className="landing-dashboard__actions">
                <Link to="/dashboard" className="landing-dashboard__cta">
                  {t('dashboard.cta')} <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scene 7 — Footer: wordmark dan catatan hak cipta */}
      <footer
        className="landing-scene landing-scene--footer"
        aria-labelledby="landing-footer-heading"
      >
        <div className="landing-stage landing-stage--footer">
          <p className="landing-footer__mark" id="landing-footer-heading">
            Asia Explorer
          </p>
          <p className="landing-footer__copyright">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
