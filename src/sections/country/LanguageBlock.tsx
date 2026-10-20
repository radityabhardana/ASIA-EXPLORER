import type { Country } from '@/content/countries';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';
import { differs } from './scripts';

type LanguageBlockProps = {
  country: Country;
  profile: TextProfile;
};

export default function LanguageBlock({ country, profile }: LanguageBlockProps) {
  const { language, phrases } = country;

  return (
    <section className="country-block country-language" aria-labelledby="country-language-title">
      <div className="country-block__inner">
        <h2 id="country-language-title">Bahasa</h2>
        <p className="country-language__name">{language.nameId}</p>
        {differs(language.nativeName, language.nameId) && (
          <p className="country-language__native">
            <NativeText profile={profile}>{language.nativeName}</NativeText>
          </p>
        )}
        <p className="country-language__meta">
          {language.script} · {language.family}
        </p>
        {language.note.trim().length > 0 && (
          <p className="country-language__note">{language.note}</p>
        )}

        <h3 className="country-phrases__title">Tiga frasa</h3>
        <ol className="country-phrases">
          {phrases.map((phrase, index) => (
            <li className="country-phrases__item" key={`${phrase.native}-${index}`}>
              <p className="country-phrases__label">Frasa {index + 1}</p>
              <p className="country-phrases__native">
                <NativeText profile={profile}>{phrase.native}</NativeText>
              </p>
              {differs(phrase.roman, phrase.native) && (
                <p className="country-phrases__roman">{phrase.roman}</p>
              )}
              {differs(phrase.id, phrase.native) && (
                <p className="country-phrases__meaning">{phrase.id}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
