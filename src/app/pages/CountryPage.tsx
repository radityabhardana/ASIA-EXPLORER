import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getCountry } from '@/content/countries';
import { scrollToSection } from '@/lib/motion';
import BackNavigation from '@/sections/country/BackNavigation';
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
      ? `${country.nameId} · ASIAKIN`
      : 'Negara tidak ditemukan · ASIAKIN';
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
  const className = `country${leaving ? ' country--leaving' : ''}`;

  return (
    <article className={className} data-country={country.id} aria-labelledby="country-title">
      <BackNavigation leaving={leaving} onClick={handleBackClick} />

      {/* 1. Hero */}
      <CountryHero country={country} profile={profile} />

      {/* Visual & locator sidebar: sticky on desktop, inline block below hero on <900px */}
      <aside className="country-sidebar" aria-label="Visual dan lokasi regional">
        <CountryPortrait countryId={country.id} />
        <RegionLocator countryId={country.id} region={country.region} />
      </aside>

      {/* Main reading column: Cerita, Budaya, Orang, Bahasa, Sumber */}
      <div className="country-body">
        {/* 2. Cerita */}
        <StoryBlock country={country} />

        {/* 3. Budaya */}
        <NoteBlock id="country-culture-title" title="Budaya" text={country.cultureNote} />

        {/* 4. Orang */}
        <NoteBlock id="country-people-title" title="Orang" text={country.peopleNote} />

        {/* 5. Bahasa */}
        <LanguageBlock country={country} profile={profile} />

        {/* 6. Sumber */}
        <SourceBlock
          sources={country.sources}
          needsVerification={country.needsVerification}
          depth={country.depth}
        />
      </div>
    </article>
  );
}
