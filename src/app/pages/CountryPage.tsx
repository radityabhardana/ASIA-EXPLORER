import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { countryById } from '@/content/countries';
import { playParchmentClick } from '@/lib/audio';
import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';
import BackNavigation from '@/sections/country/BackNavigation';
import CountryBackground, { getCountryTheme } from '@/sections/country/CountryBackground';
import CountryEtiquette from '@/sections/country/CountryEtiquette';
import CountryFactsheet from '@/sections/country/CountryFactsheet';
import CountryGallery from '@/sections/country/CountryGallery';
import CountryHero from '@/sections/country/CountryHero';
import CountryNeighbors from '@/sections/country/CountryNeighbors';
import CulturalComparisonMatrix from '@/sections/landing/CulturalComparisonMatrix';
import LanguageBlock from '@/sections/country/LanguageBlock';
import NoteBlock from '@/sections/country/NoteBlock';
import RegionLocator from '@/sections/country/RegionLocator';
import SourceBlock from '@/sections/country/SourceBlock';
import StoryBlock from '@/sections/country/StoryBlock';
import { profileFor } from '@/sections/country/scripts';
import { useExitToLanding } from '@/sections/country/useExitToLanding';
import '@/styles/country.css';

export default function CountryPage() {
  const { id } = useParams();
  const location = useLocation();
  const { pathname } = location;
  // Rute `/en/negara/:id` menyajikan prosa Inggris; konten yang belum
  // diterjemahkan jatuh kembali ke ID lewat `countryById`.
  const contentLocale = pathname.startsWith('/en') ? 'en' : 'id';
  const country = id === undefined ? undefined : countryById(id, contentLocale);

  const returnTo = useMemo(() => {
    const fromState = (location.state as { from?: string } | null)?.from;
    if (fromState && typeof fromState === 'string' && fromState.startsWith('/')) {
      return fromState;
    }
    return pathname.startsWith('/en') ? '/en' : '/';
  }, [location.state, pathname]);

  const { leaving, handleBackClick } = useExitToLanding(returnTo);
  const { locale, t } = useI18n();
  const [comparisonOpen, setComparisonOpen] = useState(false);

  const backLabel = useMemo(() => {
    if (returnTo.includes('/dashboard/pelajaran')) {
      return locale === 'en' ? 'Back to Lesson' : 'Kembali ke Pelajaran';
    }
    if (returnTo.includes('/dashboard/negara')) {
      return locale === 'en' ? 'Back to Country Modules' : 'Kembali ke Modul Negara';
    }
    if (returnTo.includes('/dashboard/peta')) {
      return locale === 'en' ? 'Back to Map' : 'Kembali ke Peta';
    }
    if (returnTo.includes('/dashboard')) {
      return locale === 'en' ? 'Back to Dashboard' : 'Kembali ke Dashboard';
    }
    return t('country.back');
  }, [returnTo, locale, t]);

  useEffect(() => {
    scrollToSection(0, { immediate: true });
  }, [id]);

  useEffect(() => {
    document.title = country
      ? `${country.nameId} · Asia Explorer`
      : 'Negara tidak ditemukan · Asia Explorer';
  }, [country]);

  if (!country) {
    return (
      <article className="country country--missing" aria-labelledby="country-missing-title">
        <div className="country-missing">
          <h1 id="country-missing-title">Negara tidak ditemukan</h1>
          <p className="country-missing__text">
            Kode negara ini tidak ada dalam data ASIAKIN. Kembali ke peta dan pilih negara lain.
          </p>
          <Link className="country-missing__link" to={returnTo}>
            {returnTo.includes('/dashboard') ? 'Kembali ke Dashboard' : 'Kembali ke beranda'}
          </Link>
        </div>
      </article>
    );
  }

  const profile = profileFor(country);
  const theme = getCountryTheme(country.id);
  const className = `country${leaving ? ' country--leaving' : ''}`;

  return (
    <article
      className={className}
      data-country={country.id}
      style={
        {
          backgroundColor: theme.base,
          '--country-base': theme.base,
        } as React.CSSProperties
      }
      aria-labelledby="country-title"
    >
      {/* Adaptive Background: concentric contours & low-chroma palette */}
      <CountryBackground countryId={country.id} />

      <BackNavigation
        leaving={leaving}
        onClick={handleBackClick}
        label={backLabel}
        to={returnTo}
      />

      {/* 1. Immersive Wide Hero Banner with Parallax & Overlaid Country Identity */}
      <CountryHero country={country} profile={profile} />

      {/* Visual & locator sidebar: sticky on desktop, unified editorial cartography card */}
      <aside className="country-sidebar" aria-label="Visual dan lokasi regional">
        <RegionLocator
          countryId={country.id}
          region={country.region}
          countryName={country.nameId}
        />
      </aside>

      {/* Main reading column: Factsheet, Cerita, Kaidah Etiket, Budaya, Orang, Bahasa, Galeri, Dashboard, Tetangga, Sumber */}
      <div className="country-body">
        {/* 2. Lembar Fakta Lapangan (Geodesi, Ibu Kota, Waktu, Demografi) */}
        <CountryFactsheet country={country} locale={contentLocale} />

        {/* 3. Cerita */}
        <StoryBlock country={country} locale={contentLocale} />

        {/* 4. Kaidah Etiket Lapangan (Tiga Aturan Sopan Santun Budaya) */}
        <CountryEtiquette country={country} locale={contentLocale} />

        {/* 5. Budaya */}
        <NoteBlock id="country-culture-title" title={t('country.culture')} text={country.cultureNote} />

        {/* 6. Orang */}
        <NoteBlock id="country-people-title" title={t('country.people')} text={country.peopleNote} />

        {/* 7. Bahasa & Audio Pronunciation */}
        <LanguageBlock country={country} profile={profile} />

        {/* 8. Country Photo Gallery */}
        <CountryGallery countryId={country.id} countryName={country.nameId} />

        {/* 9. Learning Dashboard Link (for Lengkap countries) */}
        {country.depth === 'Lengkap' && (
          <section
            className="country-block country-dashboard-callout"
            aria-labelledby="country-dashboard-callout-title"
          >
            <div className="country-block__inner country-dashboard-callout__inner">
              <div className="country-dashboard-callout__body">
                <p className="country-dashboard-callout__kicker">{t('country.dashboardCalloutKicker')}</p>
                <h2
                  id="country-dashboard-callout-title"
                  className="country-dashboard-callout__title"
                >
                  {t('country.dashboardCalloutTitle')} {country.nameId}
                </h2>
                <p className="country-dashboard-callout__description">
                  {t('country.dashboardCalloutDesc')}
                </p>
              </div>
              <Link to="/dashboard" className="country-dashboard-callout__cta">
                {t('country.dashboardCalloutCta')}
              </Link>
            </div>
          </section>
        )}

        {/* 10. Jelajah Negara Terdekat & Kawasan Serumpun */}
        <CountryNeighbors currentCountry={country} locale={contentLocale} />

        {/* 10b. Komparasi Lintas Peradaban Callout */}
        <section
          className="country-block country-compare-callout"
          aria-labelledby="country-compare-callout-title"
        >
          <div className="country-block__inner country-compare-callout__inner">
            <div className="country-compare-callout__body">
              <p className="country-compare-callout__kicker">
                {t('country.compareKicker')}
              </p>
              <h2
                id="country-compare-callout-title"
                className="country-compare-callout__title"
              >
                {t('country.compareTitle')}
              </h2>
              <p className="country-compare-callout__description">
                {t('country.compareDesc')}
              </p>
            </div>
            <button
              type="button"
              className="country-compare-callout__cta"
              onClick={() => {
                playParchmentClick();
                setComparisonOpen(true);
              }}
            >
              <span>{t('country.compareCta')}</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        {/* 11. Foldable Provenance / Sources */}
        <SourceBlock
          sources={country.sources}
          needsVerification={country.needsVerification}
          depth={country.depth}
        />
      </div>

      {/* Cultural Comparison Matrix Slide-over Modal */}
      <CulturalComparisonMatrix
        open={comparisonOpen}
        onClose={() => setComparisonOpen(false)}
        initialCountryA={country.id}
      />
    </article>
  );
}
