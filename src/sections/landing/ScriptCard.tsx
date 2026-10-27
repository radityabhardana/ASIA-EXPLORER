import type { CSSProperties } from 'react';
import { use3DTilt } from '@/hooks/use3DTilt';
import type { Country } from '@/content/countries';
import { profileFor, differs } from '@/sections/country/scripts';

type ScriptCardProps = {
  country: Country;
};

export default function ScriptCard({ country }: ScriptCardProps) {
  const profile = profileFor(country);
  const { ref, handleMouseMove, handleMouseLeave } = use3DTilt<HTMLElement>();

  return (
    <article
      ref={ref}
      className="landing-script__card script-card"
      data-reveal
      style={
        {
          '--card-accent': `var(--country-${country.id})`,
          '--tilt-rx': '0deg',
          '--tilt-ry': '0deg',
          '--tilt-scale': '1',
          '--spotlight-x': '50%',
          '--spotlight-y': '50%',
          '--spotlight-opacity': '0',
        } as CSSProperties
      }
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <span className="script-card__spotlight" aria-hidden="true" />
      <p className="landing-script__label script-card__lang">
        {country.language.nameId}
      </p>
      <p
        className="landing-script__native script-card__native"
        lang={profile.lang}
        dir={profile.dir}
      >
        {country.greeting.native}
      </p>
      {differs(country.greeting.native, country.greeting.roman) ? (
        <p className="landing-script__roman">{country.greeting.roman}</p>
      ) : null}
      <p className="landing-script__meaning">{country.greeting.meaningId}</p>
    </article>
  );
}
