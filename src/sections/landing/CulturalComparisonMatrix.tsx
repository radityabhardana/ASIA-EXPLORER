import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { playParchmentClick } from '@/lib/audio';
import { useI18n } from '@/lib/i18n';
import {
  CURATED_PRESETS,
  calculateDistanceBetweenCountries,
  getAllSelectableCountries,
  getCulturalMatrixEntry,
} from './cultural-matrix-data';
import '@/styles/cultural-matrix.css';

export interface CulturalComparisonMatrixProps {
  open: boolean;
  onClose: () => void;
  initialCountryA?: string;
  initialCountryB?: string;
}

export default function CulturalComparisonMatrix({
  open,
  onClose,
  initialCountryA = 'jp',
  initialCountryB = 'kr',
}: CulturalComparisonMatrixProps) {
  const { locale, t } = useI18n();
  const titleId = useId();
  const descId = useId();

  const [prevOpen, setPrevOpen] = useState(open);
  const [countryA, setCountryA] = useState<string>(initialCountryA);
  const [countryB, setCountryB] = useState<string>(initialCountryB);
  const [mobileTab, setMobileTab] = useState<'split' | 'a' | 'b'>('split');

  if (open && !prevOpen) {
    setPrevOpen(true);
    setCountryA(initialCountryA);
    if (initialCountryB && initialCountryB !== initialCountryA) {
      setCountryB(initialCountryB);
    } else if (initialCountryA === 'kr') {
      setCountryB('jp');
    } else if (initialCountryA === 'id') {
      setCountryB('my');
    } else if (initialCountryA === 'sa') {
      setCountryB('ir');
    } else if (initialCountryA === 'tr') {
      setCountryB('kz');
    } else {
      setCountryB(initialCountryA === 'jp' ? 'kr' : 'jp');
    }
  } else if (!open && prevOpen) {
    setPrevOpen(false);
  }

  const activePreset = useMemo(() => {
    const pair = `${countryA}-${countryB}`;
    const reverse = `${countryB}-${countryA}`;
    const match = CURATED_PRESETS.find((p) => p.id === pair || p.id === reverse);
    return match ? match.id : null;
  }, [countryA, countryB]);

  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Handle body overflow lock and keyboard trap
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 60);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        playParchmentClick();
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  // Country data resolution
  const entryA = useMemo(() => getCulturalMatrixEntry(countryA, locale), [countryA, locale]);
  const entryB = useMemo(() => getCulturalMatrixEntry(countryB, locale), [countryB, locale]);

  const allCountries = useMemo(() => getAllSelectableCountries(locale), [locale]);

  const distanceInfo = useMemo(() => {
    return calculateDistanceBetweenCountries(countryA, countryB, locale);
  }, [countryA, countryB, locale]);

  if (!open) return null;

  const handleSelectPreset = (preset: (typeof CURATED_PRESETS)[number]) => {
    playParchmentClick();
    setCountryA(preset.countryA);
    setCountryB(preset.countryB);
  };

  const handleSwap = () => {
    playParchmentClick();
    const prevA = countryA;
    setCountryA(countryB);
    setCountryB(prevA);
  };

  return (
    <div
      className="cultural-matrix-root"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      ref={dialogRef}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playParchmentClick();
          onClose();
        }
      }}
    >
      <div className="cultural-matrix-modal">
        {/* 1. Header Editorial */}
        <header className="cultural-matrix__header">
          <div className="cultural-matrix__header-inner">
            <div className="cultural-matrix__titles">
              <div className="cultural-matrix__meta">
                <p className="cultural-matrix__eyebrow">{t('matrix.eyebrow')}</p>
                <span className="cultural-matrix__badge">48 BANGSA · KARTOGRAFI ADAB</span>
              </div>
              <h2 id={titleId} className="cultural-matrix__title">
                {t('matrix.title')}
              </h2>
              <p id={descId} className="cultural-matrix__subtitle">
                {t('matrix.subtitle')}
              </p>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              className="cultural-matrix__close-btn"
              onClick={() => {
                playParchmentClick();
                onClose();
              }}
              aria-label={t('matrix.close')}
              title={t('matrix.close')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* 2. Curated Presets Bar */}
        <div className="cultural-matrix__presets-bar" role="region" aria-label={t('matrix.presets')}>
          <span className="cultural-matrix__presets-label">{t('matrix.presets')}:</span>
          <div className="cultural-matrix__presets-list">
            {CURATED_PRESETS.map((p) => {
              const isSelected = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`cultural-matrix__preset-btn ${isSelected ? 'cultural-matrix__preset-btn--active' : ''}`}
                  onClick={() => handleSelectPreset(p)}
                  aria-pressed={isSelected}
                >
                  <span className="cultural-matrix__preset-btn-title">
                    {locale === 'en' ? p.labelEn : p.labelId}
                  </span>
                  <span className="cultural-matrix__preset-btn-sub">
                    {locale === 'en' ? p.subtitleEn : p.subtitleId}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Sticky Selector HUD */}
        <div className="cultural-matrix__selector-hud">
          <div className="cultural-matrix__pickers">
            <div className="cultural-matrix__picker-field">
              <label htmlFor="matrix-select-a" className="cultural-matrix__picker-label">
                {t('matrix.selectCountryA')}
              </label>
              <div className="cultural-matrix__select-wrap">
                <select
                  id="matrix-select-a"
                  className="cultural-matrix__select"
                  value={countryA}
                  onChange={(e) => {
                    playParchmentClick();
                    setCountryA(e.target.value);
                  }}
                >
                  {allCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.iso3})
                    </option>
                  ))}
                </select>
                <span className="cultural-matrix__select-arrow" aria-hidden="true">
                  ▾
                </span>
              </div>
            </div>

            <button
              type="button"
              className="cultural-matrix__swap-btn"
              onClick={handleSwap}
              aria-label={t('matrix.swapAria')}
              title={t('matrix.swapAria')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            <div className="cultural-matrix__picker-field">
              <label htmlFor="matrix-select-b" className="cultural-matrix__picker-label">
                {t('matrix.selectCountryB')}
              </label>
              <div className="cultural-matrix__select-wrap">
                <select
                  id="matrix-select-b"
                  className="cultural-matrix__select"
                  value={countryB}
                  onChange={(e) => {
                    playParchmentClick();
                    setCountryB(e.target.value);
                  }}
                >
                  {allCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.iso3})
                    </option>
                  ))}
                </select>
                <span className="cultural-matrix__select-arrow" aria-hidden="true">
                  ▾
                </span>
              </div>
            </div>
          </div>

          <div className="cultural-matrix__hud-meta">
            {distanceInfo && (
              <div className="cultural-matrix__distance-tag">
                <span className="cultural-matrix__distance-icon" aria-hidden="true">
                  🧭
                </span>
                <span>
                  {t('matrix.distance')}: <strong>{distanceInfo.formatted}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Mobile Tab Switcher */}
          <div className="cultural-matrix__mobile-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'split'}
              className={`cultural-matrix__mobile-tab ${mobileTab === 'split' ? 'cultural-matrix__mobile-tab--active' : ''}`}
              onClick={() => {
                playParchmentClick();
                setMobileTab('split');
              }}
            >
              {t('matrix.tabSplit')}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'a'}
              className={`cultural-matrix__mobile-tab ${mobileTab === 'a' ? 'cultural-matrix__mobile-tab--active' : ''}`}
              onClick={() => {
                playParchmentClick();
                setMobileTab('a');
              }}
            >
              {entryA.name}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mobileTab === 'b'}
              className={`cultural-matrix__mobile-tab ${mobileTab === 'b' ? 'cultural-matrix__mobile-tab--active' : ''}`}
              onClick={() => {
                playParchmentClick();
                setMobileTab('b');
              }}
            >
              {entryB.name}
            </button>
          </div>
        </div>

        {/* 4. Scrollable Matrix Body */}
        <div
          className={`cultural-matrix__body ${
            mobileTab === 'a'
              ? 'cultural-matrix__body--show-a'
              : mobileTab === 'b'
                ? 'cultural-matrix__body--show-b'
                : 'cultural-matrix__body--split'
          }`}
        >
          {/* Dimension 1: Geodetik & Wilayah */}
          <section className="cultural-matrix__dimension-block" aria-labelledby="dim-geodesy-title">
            <div className="cultural-matrix__dimension-header">
              <span className="cultural-matrix__dimension-num">01</span>
              <h3 id="dim-geodesy-title" className="cultural-matrix__dimension-title">
                {t('matrix.dimGeodesy')}
              </h3>
              <span className="cultural-matrix__dimension-line" aria-hidden="true" />
            </div>

            <div className="cultural-matrix__grid-row">
              {/* Kolom Bangsa A */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--a">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryA.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryA.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.capital')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryA.capital}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.coordinates')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--mono">
                    {entryA.coordinates.dms}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.region')}</div>
                  <div className="cultural-matrix__field-value">{entryA.region}</div>
                </div>
              </div>

              {/* Kolom Bangsa B */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--b">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryB.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryB.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.capital')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryB.capital}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.coordinates')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--mono">
                    {entryB.coordinates.dms}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.region')}</div>
                  <div className="cultural-matrix__field-value">{entryB.region}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Dimension 2: Adab Sapaan & Derajat Penghormatan */}
          <section className="cultural-matrix__dimension-block" aria-labelledby="dim-greeting-title">
            <div className="cultural-matrix__dimension-header">
              <span className="cultural-matrix__dimension-num">02</span>
              <h3 id="dim-greeting-title" className="cultural-matrix__dimension-title">
                {t('matrix.dimGreeting')}
              </h3>
              <span className="cultural-matrix__dimension-line" aria-hidden="true" />
            </div>

            <div className="cultural-matrix__grid-row">
              {/* Kolom A */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--a">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryA.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryA.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.gesture')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryA.greeting.gestureName}
                  </div>
                  <div className="cultural-matrix__field-value" style={{ marginTop: '4px' }}>
                    {entryA.greeting.gestureDesc}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.deference')}</div>
                  <div className="cultural-matrix__field-value">{entryA.greeting.deferenceLevel}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.formalGreeting')}</div>
                  <div className="cultural-matrix__native-lead">{entryA.greeting.formalGreeting}</div>
                  <div className="cultural-matrix__roman-sub">({entryA.greeting.greetingRoman})</div>
                  <div className="cultural-matrix__meaning-sub">«{entryA.greeting.greetingMeaning}»</div>
                </div>
              </div>

              {/* Kolom B */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--b">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryB.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryB.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.gesture')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryB.greeting.gestureName}
                  </div>
                  <div className="cultural-matrix__field-value" style={{ marginTop: '4px' }}>
                    {entryB.greeting.gestureDesc}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.deference')}</div>
                  <div className="cultural-matrix__field-value">{entryB.greeting.deferenceLevel}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.formalGreeting')}</div>
                  <div className="cultural-matrix__native-lead">{entryB.greeting.formalGreeting}</div>
                  <div className="cultural-matrix__roman-sub">({entryB.greeting.greetingRoman})</div>
                  <div className="cultural-matrix__meaning-sub">«{entryB.greeting.greetingMeaning}»</div>
                </div>
              </div>
            </div>
          </section>

          {/* Dimension 3: Etiket Jamuan & Meja Makan */}
          <section className="cultural-matrix__dimension-block" aria-labelledby="dim-dining-title">
            <div className="cultural-matrix__dimension-header">
              <span className="cultural-matrix__dimension-num">03</span>
              <h3 id="dim-dining-title" className="cultural-matrix__dimension-title">
                {t('matrix.dimDining')}
              </h3>
              <span className="cultural-matrix__dimension-line" aria-hidden="true" />
            </div>

            <div className="cultural-matrix__grid-row">
              {/* Kolom A */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--a">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryA.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryA.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.utensils')}</div>
                  <div className="cultural-matrix__field-value">{entryA.dining.utensils}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.beverage')}</div>
                  <div className="cultural-matrix__field-value">{entryA.dining.beverageTradition}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.hospitality')}</div>
                  <div className="cultural-matrix__field-value">{entryA.dining.hostHospitality}</div>
                </div>
              </div>

              {/* Kolom B */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--b">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryB.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryB.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.utensils')}</div>
                  <div className="cultural-matrix__field-value">{entryB.dining.utensils}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.beverage')}</div>
                  <div className="cultural-matrix__field-value">{entryB.dining.beverageTradition}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.hospitality')}</div>
                  <div className="cultural-matrix__field-value">{entryB.dining.hostHospitality}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Dimension 4: Falsafah Hidup Utama */}
          <section className="cultural-matrix__dimension-block" aria-labelledby="dim-philosophy-title">
            <div className="cultural-matrix__dimension-header">
              <span className="cultural-matrix__dimension-num">04</span>
              <h3 id="dim-philosophy-title" className="cultural-matrix__dimension-title">
                {t('matrix.dimPhilosophy')}
              </h3>
              <span className="cultural-matrix__dimension-line" aria-hidden="true" />
            </div>

            <div className="cultural-matrix__grid-row">
              {/* Kolom A */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--a">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryA.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryA.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.corePhilosophy')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryA.philosophy.name}
                  </div>
                  {entryA.philosophy.nativeName && (
                    <div className="cultural-matrix__roman-sub">
                      «{entryA.philosophy.nativeName}»
                    </div>
                  )}
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.philosophyEssence')}</div>
                  <div className="cultural-matrix__field-value">{entryA.philosophy.essence}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-value" style={{ fontStyle: 'italic', color: 'var(--matrix-ink-muted)' }}>
                    {entryA.philosophy.description}
                  </div>
                </div>
              </div>

              {/* Kolom B */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--b">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryB.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryB.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.corePhilosophy')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryB.philosophy.name}
                  </div>
                  {entryB.philosophy.nativeName && (
                    <div className="cultural-matrix__roman-sub">
                      «{entryB.philosophy.nativeName}»
                    </div>
                  )}
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.philosophyEssence')}</div>
                  <div className="cultural-matrix__field-value">{entryB.philosophy.essence}</div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-value" style={{ fontStyle: 'italic', color: 'var(--matrix-ink-muted)' }}>
                    {entryB.philosophy.description}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dimension 5: Aksara, Bahasa, dan Contoh Sapaan */}
          <section className="cultural-matrix__dimension-block" aria-labelledby="dim-language-title">
            <div className="cultural-matrix__dimension-header">
              <span className="cultural-matrix__dimension-num">05</span>
              <h3 id="dim-language-title" className="cultural-matrix__dimension-title">
                {t('matrix.dimLanguage')}
              </h3>
              <span className="cultural-matrix__dimension-line" aria-hidden="true" />
            </div>

            <div className="cultural-matrix__grid-row">
              {/* Kolom A */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--a">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryA.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryA.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.script')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryA.language.scriptName}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.family')}</div>
                  <div className="cultural-matrix__field-value">
                    {entryA.language.languageFamily} · {entryA.language.officialLanguage}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.phrases')}</div>
                  <div className="cultural-matrix__phrases-grid">
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Halo / Sapaan</div>
                      <div className="cultural-matrix__phrase-native">{entryA.language.phrases.hello.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryA.language.phrases.hello.latin}</div>
                    </div>
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Terima Kasih</div>
                      <div className="cultural-matrix__phrase-native">{entryA.language.phrases.thankYou.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryA.language.phrases.thankYou.latin}</div>
                    </div>
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Maaf / Permisi</div>
                      <div className="cultural-matrix__phrase-native">{entryA.language.phrases.sorry.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryA.language.phrases.sorry.latin}</div>
                    </div>
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Sampai Jumpa</div>
                      <div className="cultural-matrix__phrase-native">{entryA.language.phrases.farewell.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryA.language.phrases.farewell.latin}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kolom B */}
              <div className="cultural-matrix__grid-col cultural-matrix__grid-col--b">
                <div className="cultural-matrix__col-header">
                  <span className="cultural-matrix__country-badge">{entryB.iso3}</span>
                  <span className="cultural-matrix__country-name">{entryB.name}</span>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.script')}</div>
                  <div className="cultural-matrix__field-value cultural-matrix__field-value--highlight">
                    {entryB.language.scriptName}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.family')}</div>
                  <div className="cultural-matrix__field-value">
                    {entryB.language.languageFamily} · {entryB.language.officialLanguage}
                  </div>
                </div>
                <div className="cultural-matrix__field">
                  <div className="cultural-matrix__field-label">{t('matrix.phrases')}</div>
                  <div className="cultural-matrix__phrases-grid">
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Halo / Sapaan</div>
                      <div className="cultural-matrix__phrase-native">{entryB.language.phrases.hello.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryB.language.phrases.hello.latin}</div>
                    </div>
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Terima Kasih</div>
                      <div className="cultural-matrix__phrase-native">{entryB.language.phrases.thankYou.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryB.language.phrases.thankYou.latin}</div>
                    </div>
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Maaf / Permisi</div>
                      <div className="cultural-matrix__phrase-native">{entryB.language.phrases.sorry.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryB.language.phrases.sorry.latin}</div>
                    </div>
                    <div className="cultural-matrix__phrase-card">
                      <div className="cultural-matrix__phrase-type">Sampai Jumpa</div>
                      <div className="cultural-matrix__phrase-native">{entryB.language.phrases.farewell.native}</div>
                      <div className="cultural-matrix__phrase-roman">{entryB.language.phrases.farewell.latin}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Action Row: Direct CTA to Country Page */}
          <div className="cultural-matrix__cta-row">
            <Link
              to={locale === 'en' ? `/en/negara/${entryA.countryId}` : `/negara/${entryA.countryId}`}
              className="cultural-matrix__cta-link cultural-matrix__cta-link--a"
              onClick={() => {
                playParchmentClick();
                onClose();
              }}
            >
              <span>
                {t('matrix.openCountry')} {entryA.name}
              </span>
              <span className="cultural-matrix__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>

            <Link
              to={locale === 'en' ? `/en/negara/${entryB.countryId}` : `/negara/${entryB.countryId}`}
              className="cultural-matrix__cta-link cultural-matrix__cta-link--b"
              onClick={() => {
                playParchmentClick();
                onClose();
              }}
            >
              <span>
                {t('matrix.openCountry')} {entryB.name}
              </span>
              <span className="cultural-matrix__cta-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
