import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';

import { countryById } from '@/content/countries';
import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';
import BackNavigation from '@/sections/country/BackNavigation';
import CountryBackground, { getCountryTheme } from '@/sections/country/CountryBackground';
import CountryGallery from '@/sections/country/CountryGallery';
import CountryHero from '@/sections/country/CountryHero';
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
  const { pathname } = useLocation();
  // Rute `/en/negara/:id` menyajikan prosa Inggris; konten yang belum
  // diterjemahkan jatuh kembali ke ID lewat `countryById`.
  const contentLocale = pathname.startsWith('/en') ? 'en' : 'id';
  const country = id === undefined ? undefined : countryById(id, contentLocale);
  const { leaving, handleBackClick } = useExitToLanding();
  const { t } = useI18n();

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
          <Link className="country-missing__link" to="/">
            Kembali ke beranda
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

      <BackNavigation leaving={leaving} onClick={handleBackClick} label={t('country.back')} />

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

      {/* Main reading column: Cerita, Budaya, Orang, Bahasa, Galeri, Dashboard, Sumber */}
      <div className="country-body">
        {/* 2. Cerita */}
        <StoryBlock country={country} />

        {/* 3. Budaya */}
        <NoteBlock id="country-culture-title" title={t('country.culture')} text={country.cultureNote} />

        {/* 4. Orang */}
        <NoteBlock id="country-people-title" title={t('country.people')} text={country.peopleNote} />

        {/* 5. Bahasa & Audio Pronunciation */}
        <LanguageBlock country={country} profile={profile} />

        {/* 6. Country Photo Gallery */}
        <CountryGallery countryId={country.id} countryName={country.nameId} />

        {/* 7. Learning Dashboard Link (for Lengkap countries) */}
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

        {/* 8. Foldable Provenance / Sources */}
        <SourceBlock
          sources={country.sources}
          needsVerification={country.needsVerification}
          depth={country.depth}
        />
      </div>
    </article>
  );
}
