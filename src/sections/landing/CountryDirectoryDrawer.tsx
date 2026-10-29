import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { countriesFor } from '@/content/countries';
import type { Country } from '@/content/countries';
import { COUNTRIES } from '@/content/countries48';
import { useI18n } from '@/lib/i18n';
import '@/styles/country-directory.css';

export interface CountryDirectoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onSelectCountry?: (id: string) => void;
}

interface RegionMeta {
  id: string;
  nameId: string;
  nameEn: string;
}

const REGION_DEFS: RegionMeta[] = [
  { id: 'sea', nameId: 'Asia Tenggara', nameEn: 'Southeast Asia' },
  { id: 'ea', nameId: 'Asia Timur', nameEn: 'East Asia' },
  { id: 'sa', nameId: 'Asia Selatan', nameEn: 'South Asia' },
  { id: 'wa', nameId: 'Asia Barat', nameEn: 'West Asia' },
  { id: 'ca', nameId: 'Asia Tengah', nameEn: 'Central Asia' },
];

function getFlagEmoji(countryId: string): string {
  const code = countryId.toUpperCase();
  if (code.length !== 2) return '🌐';
  return String.fromCodePoint(127397 + code.charCodeAt(0), 127397 + code.charCodeAt(1));
}

export default function CountryDirectoryDrawer({
  open,
  onClose,
  onSelectCountry,
}: CountryDirectoryDrawerProps) {
  const { locale, t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Ambil ke-48 negara sesuai bahasa aktif
  const allCountries = useMemo(() => {
    return countriesFor(locale as 'id' | 'en');
  }, [locale]);

  // Statistik kelengkapan arsip
  const stats = useMemo(() => {
    let complete = 0;
    let explore = 0;
    for (const c of allCountries) {
      if (c.depth === 'Lengkap') complete += 1;
      else explore += 1;
    }
    return {
      total: allCountries.length,
      complete,
      explore,
    };
  }, [allCountries]);

  // Kelola fokus dan scroll lock saat drawer terbuka
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 60);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

  // Filter pencarian dan kawasan
  const filteredCountries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCountries.filter((c) => {
      // Filter kawasan
      if (selectedRegion !== 'all' && c.region !== selectedRegion) {
        return false;
      }

      if (!q) return true;

      const c48 = COUNTRIES[c.iso3];
      const matchName = c.nameId.toLowerCase().includes(q);
      const matchLocal = c.nameLocal.toLowerCase().includes(q);
      const matchCapital = c48?.capital.toLowerCase().includes(q) ?? false;
      const matchIso3 = c.iso3.toLowerCase().includes(q);
      const matchIso2 = c.id.toLowerCase() === q;
      const matchRegion = c.region.toLowerCase().includes(q);

      return matchName || matchLocal || matchCapital || matchIso3 || matchIso2 || matchRegion;
    });
  }, [allCountries, searchQuery, selectedRegion]);

  // Kelompokkan hasil pencarian berdasarkan 5 kawasan
  const groupedSections = useMemo(() => {
    return REGION_DEFS.map((reg) => {
      const regionCountries = filteredCountries.filter((c) => c.region === reg.nameId);
      return {
        ...reg,
        countries: regionCountries,
      };
    }).filter((reg) => reg.countries.length > 0);
  }, [filteredCountries]);

  const handleClearSearch = () => {
    setSearchQuery('');
    searchInputRef.current?.focus();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedRegion('all');
    searchInputRef.current?.focus();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="country-dir-backdrop"
        data-open={open ? 'true' : 'false'}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div
        ref={drawerRef}
        id="country-directory-drawer"
        className="country-dir-drawer"
        data-open={open ? 'true' : 'false'}
        role="dialog"
        aria-modal="true"
        aria-labelledby="country-dir-title"
      >
        {/* Header Drawer */}
        <header className="country-dir-header">
          <div className="country-dir-header__topline">
            <div className="country-dir-header__eyebrow-wrap">
              <span className="country-dir-header__ledger-mark" aria-hidden="true" />
              <span className="country-dir-header__eyebrow">{t('directory.eyebrow')}</span>
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              className="country-dir-close-btn"
              onClick={onClose}
              aria-label={t('directory.close')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <h2 id="country-dir-title" className="country-dir-header__title">
            {t('directory.title')}
          </h2>
          <p className="country-dir-header__subtitle">{t('directory.subtitle')}</p>

          {/* Ledger Ticker */}
          <div className="country-dir-ticker" aria-label="Statistik dokumentasi negara">
            <div className="country-dir-ticker__item">
              <span className="country-dir-ticker__badge country-dir-ticker__badge--total">
                {stats.total}
              </span>
              <span>{locale === 'id' ? 'Total Bangsa Asia' : 'Total Asian Nations'}</span>
            </div>
            <span className="country-dir-ticker__sep" aria-hidden="true">
              ·
            </span>
            <div className="country-dir-ticker__item">
              <span className="country-dir-ticker__badge country-dir-ticker__badge--complete">
                {stats.complete}
              </span>
              <span>{locale === 'id' ? 'Arsip Lengkap' : 'Complete Archives'}</span>
            </div>
            <span className="country-dir-ticker__sep" aria-hidden="true">
              ·
            </span>
            <div className="country-dir-ticker__item">
              <span className="country-dir-ticker__badge country-dir-ticker__badge--explore">
                {stats.explore}
              </span>
              <span>{locale === 'id' ? 'Penjelajahan' : 'Exploration Stage'}</span>
            </div>
          </div>

          {/* Pencarian Cepat */}
          <div className="country-dir-search-wrap">
            <svg
              className="country-dir-search-icon"
              width="15"
              height="15"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <line x1="13" y1="13" x2="17.5" y2="17.5" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('directory.searchPlaceholder')}
              className="country-dir-search-input"
              aria-label={t('directory.searchAria')}
            />
            {searchQuery ? (
              <button
                type="button"
                className="country-dir-search-clear"
                onClick={handleClearSearch}
                aria-label={t('directory.clearSearch')}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                >
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </button>
            ) : null}
          </div>

          {/* Quick Filter Kawasan */}
          <div
            className="country-dir-filters"
            role="toolbar"
            aria-label={locale === 'id' ? 'Filter Kawasan' : 'Region Filters'}
          >
            <button
              type="button"
              className={`country-dir-filter-pill ${selectedRegion === 'all' ? 'country-dir-filter-pill--active' : ''}`}
              onClick={() => setSelectedRegion('all')}
              aria-pressed={selectedRegion === 'all'}
            >
              <span>{t('directory.filterAll')}</span>
              <span className="country-dir-filter-count">({allCountries.length})</span>
            </button>
            {REGION_DEFS.map((reg) => {
              const regCount = allCountries.filter((c) => c.region === reg.nameId).length;
              const isActive = selectedRegion === reg.nameId;
              return (
                <button
                  key={reg.id}
                  type="button"
                  className={`country-dir-filter-pill ${isActive ? 'country-dir-filter-pill--active' : ''}`}
                  onClick={() => setSelectedRegion(isActive ? 'all' : reg.nameId)}
                  aria-pressed={isActive}
                >
                  <span>{locale === 'id' ? reg.nameId : reg.nameEn}</span>
                  <span className="country-dir-filter-count">({regCount})</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* Body Drawer (Daftar 48 Negara) */}
        <div className="country-dir-body" tabIndex={0}>
          {groupedSections.length === 0 ? (
            <div className="country-dir-empty" role="status">
              <h3 className="country-dir-empty__title">{t('directory.emptyTitle')}</h3>
              <p className="country-dir-empty__desc">
                {t('directory.emptyDesc')} &quot;{searchQuery}&quot;.
              </p>
              <button
                type="button"
                className="country-dir-empty__reset"
                onClick={handleResetFilters}
              >
                {t('directory.resetFilter')}
              </button>
            </div>
          ) : (
            groupedSections.map((group) => (
              <section
                key={group.id}
                className="country-dir-section"
                aria-labelledby={`region-heading-${group.id}`}
              >
                <div className="country-dir-section__header">
                  <h3 id={`region-heading-${group.id}`} className="country-dir-section__title">
                    {locale === 'id' ? group.nameId : group.nameEn}
                  </h3>
                  <span className="country-dir-section__count">
                    {group.countries.length}{' '}
                    {locale === 'id' ? 'Bangsa' : group.countries.length === 1 ? 'Nation' : 'Nations'}
                  </span>
                </div>

                <div className="country-dir-grid">
                  {group.countries.map((country) => (
                    <CountryCard
                      key={country.id}
                      country={country}
                      onClose={onClose}
                      onSelectCountry={onSelectCountry}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>
    </>
  );
}

interface CountryCardProps {
  country: Country;
  onClose: () => void;
  onSelectCountry?: (id: string) => void;
}

function CountryCard({ country, onClose, onSelectCountry }: CountryCardProps) {
  const { t } = useI18n();
  const c48 = COUNTRIES[country.iso3];
  const flag = getFlagEmoji(country.id);
  const isComplete = country.depth === 'Lengkap';
  const capital = c48?.capital || '-';
  const nativeGreet = c48?.greet?.text || country.nameLocal;
  const cultureExcerpt = c48?.fact || country.cultureNote;

  const handlePreviewMap = () => {
    onClose();
    onSelectCountry?.(country.id);
  };

  return (
    <article className="country-dir-card">
      <div>
        <div className="country-dir-card__top">
          <div className="country-dir-card__flag-wrap">
            <span className="country-dir-card__flag" aria-hidden="true">
              {flag}
            </span>
            <span
              className="country-dir-card__native"
              title={nativeGreet}
            >
              {nativeGreet}
            </span>
          </div>

          <div className="country-dir-card__badges">
            <span className="country-dir-card__iso">{country.iso3}</span>
            <span
              className={`country-dir-card__status ${isComplete ? 'country-dir-card__status--complete' : 'country-dir-card__status--explore'}`}
            >
              {isComplete ? t('directory.badgeComplete') : t('directory.badgeExplore')}
            </span>
          </div>
        </div>

        <div className="country-dir-card__main">
          <h4 className="country-dir-card__name">{country.nameId}</h4>
          <p className="country-dir-card__capital">
            <span className="country-dir-card__meta-label">{t('directory.capitalLabel')}:</span>{' '}
            <strong>{capital}</strong>
          </p>
          {cultureExcerpt ? (
            <p className="country-dir-card__culture">{cultureExcerpt}</p>
          ) : null}
        </div>
      </div>

      <div className="country-dir-card__actions">
        <Link
          to={`/negara/${country.id}`}
          onClick={onClose}
          className="country-dir-card__link"
          aria-label={`${t('directory.openCountry')}: ${country.nameId}`}
        >
          <span>{t('directory.openCountry')}</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 3l5 5-5 5" />
          </svg>
        </Link>

        {onSelectCountry ? (
          <button
            type="button"
            onClick={handlePreviewMap}
            className="country-dir-card__preview-btn"
            title={`${t('directory.previewOnMap')}: ${country.nameId}`}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
            </svg>
            <span>{t('directory.previewOnMap')}</span>
          </button>
        ) : null}
      </div>
    </article>
  );
}
