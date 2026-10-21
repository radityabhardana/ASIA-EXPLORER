import { useEffect, useRef, useState } from 'react';

import type { Country } from '@/content/countries';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';

type ScriptSpecimenProps = {
  country: Country;
  profile: TextProfile;
};

export default function ScriptSpecimen({ country, profile }: ScriptSpecimenProps) {
  const { greeting, language } = country;
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
            setRevealed(true);
          }
        }
      },
      { threshold: [0, 0.2, 0.5, 1] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="country-block country-specimen" aria-label="Spesimen aksara">
      <div className="country-block__inner">
        <div ref={containerRef} className="country-specimen__plate">
          <p
            className="country-specimen__greeting"
            lang={profile.lang}
            data-revealed={revealed}
          >
            <span className="country-specimen__greeting-inner">
              <NativeText profile={profile}>{greeting.native}</NativeText>
            </span>
          </p>
          <div className="country-specimen__meta">
            <p className="country-specimen__lang">{language.nameId}</p>
            {greeting.roman !== greeting.native && (
              <p className="country-specimen__roman">{greeting.roman}</p>
            )}
            <p className="country-specimen__meaning">{greeting.meaningId}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
