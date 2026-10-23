import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getCountry } from '@/content/countries';
import { scrollToSection } from '@/lib/motion';
import BackNavigation from '@/sections/country/BackNavigation';
import CountryBackground, { getCountryTheme } from '@/sections/country/CountryBackground';
import CountryGallery from '@/sections/country/CountryGallery';
import CountryHero from '@/sections/country/CountryHero';
import CountryPortrait from '@/sections/country/CountryPortrait';
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
  const country = id === undefined ? undefined : getCountry(id);
  const { leaving, handleBackClick } = useExitToLanding();

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
      style={{ backgroundColor: theme.base }}
      aria-labelledby="country-title"
    >
      {/* Adaptive Background: concentric contours & low-chroma palette */}
      <CountryBackground countryId={country.id} />

      <BackNavigation leaving={leaving} onClick={handleBackClick} />

      {/* 1. Photo Hero with Parallax & Rich Typography */}
      <CountryHero country={country} profile={profile} />

      {/* Visual & locator sidebar: sticky on desktop, inline block below hero on <900px */}
      <aside className="country-sidebar" aria-label="Visual dan lokasi regional">
        <CountryPortrait countryId={country.id} />
        <RegionLocator countryId={country.id} region={country.region} />
      </aside>

      {/* Main reading column: Cerita, Budaya, Orang, Bahasa, Galeri, Dashboard, Sumber */}
      <div className="country-body">
        {/* 2. Cerita */}
        <StoryBlock country={country} />

        {/* 3. Budaya */}
        <NoteBlock id="country-culture-title" title="Budaya" text={country.cultureNote} />

        {/* 4. Orang */}
        <NoteBlock id="country-people-title" title="Orang" text={country.peopleNote} />

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
                <p className="country-dashboard-callout__kicker">MODUL INTERAKTIF</p>
                <h2
                  id="country-dashboard-callout-title"
                  className="country-dashboard-callout__title"
                >
                  Uji Pemahaman: Etiket & Frasa {country.nameId}
                </h2>
                <p className="country-dashboard-callout__description">
                  Ikuti skenario budaya bercabang dan simpan frasa ke Phrase Vault di perambanmu.
                </p>
              </div>
              <Link to="/dashboard" className="country-dashboard-callout__cta">
                Mulai Pelajaran di Dashboard →
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
