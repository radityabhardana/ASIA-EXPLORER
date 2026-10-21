import type { Country } from '@/content/countries';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';

type CountryHeroProps = {
  country: Country;
  profile: TextProfile;
};

export default function CountryHero({ country, profile }: CountryHeroProps) {
  return (
    <header className="country-hero">
      <div className="country-hero__inner">
        <p className="country-hero__local">
          <NativeText profile={profile}>{country.nameLocal}</NativeText>
        </p>
        <h1 id="country-title" className="country-hero__name">
          {country.nameId}
        </h1>
        <p className="country-hero__meta">
          <span className="country-hero__region">{country.region}</span>
          <span className="country-hero__sep" aria-hidden="true"> · </span>
          <span className="country-honesty-marker">{country.depth}</span>
        </p>
      </div>
    </header>
  );
}
