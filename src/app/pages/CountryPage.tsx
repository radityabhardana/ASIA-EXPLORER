import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { getCountry } from '@/content/countries';
import { scrollToSection } from '@/lib/motion';
import BackNavigation from '@/sections/country/BackNavigation';
import CountryHero from '@/sections/country/CountryHero';
import GreetingBlock from '@/sections/country/GreetingBlock';
import LanguageBlock from '@/sections/country/LanguageBlock';
import NoteBlock from '@/sections/country/NoteBlock';
import SourceList from '@/sections/country/SourceList';
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
      ? `${country.nameId} — ASIAKIN`
      : 'Negara tidak ditemukan — ASIAKIN';
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

  return (
    <article
      className={`country${leaving ? ' country--leaving' : ''}`}
      data-country={country.id}
      aria-labelledby="country-title"
    >
      <BackNavigation leaving={leaving} onClick={handleBackClick} />
      <CountryHero country={country} profile={profile} />
      <GreetingBlock country={country} profile={profile} />
      <LanguageBlock country={country} profile={profile} />
      <NoteBlock id="country-culture-title" title="Budaya" text={country.cultureNote} />
      <div className="country-separator" aria-hidden="true" />
      <NoteBlock id="country-people-title" title="Orang" text={country.peopleNote} />
      <SourceList sources={country.sources} needsVerification={country.needsVerification} />
    </article>
  );
}
