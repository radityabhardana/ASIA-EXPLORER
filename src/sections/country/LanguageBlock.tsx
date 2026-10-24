import { useEffect, useState } from 'react';

import type { Country } from '@/content/countries';
import { useI18n } from '@/lib/i18n';
import { cancelSpeech, isSpeechSupported, speak } from '@/lib/speech';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';
import { differs } from './scripts';

type LanguageBlockProps = {
  country: Country;
  profile: TextProfile;
};

type PlaybackStatus = 'idle' | 'speaking' | 'error';

export default function LanguageBlock({ country, profile }: LanguageBlockProps) {
  const { language, phrases, greeting } = country;
  const { t } = useI18n();
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const supported = isSpeechSupported();

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  const statusText =
    status === 'error'
      ? 'Audio tidak dapat diputar di peramban ini.'
      : status === 'speaking'
        ? `Memutar audio${activeSpeechText ? ` "${activeSpeechText}"` : ''}…`
        : '';

  function handlePlay(text: string, label: string, fallbackText?: string) {
    setActiveSpeechText(label);
    setStatus('speaking');
    const started = speak(text, {
      lang: profile.speechLang || profile.lang,
      fallbackText,
      onEnd: () => {
        setStatus('idle');
        setActiveSpeechText(null);
      },
      onError: () => {
        setStatus('error');
        setActiveSpeechText(null);
      },
    });
    if (!started) {
      setStatus('error');
      setActiveSpeechText(null);
    }
  }

  function handleListenGreeting() {
    handlePlay(greeting.native, greeting.meaningId, greeting.roman);
  }

  return (
    <section className="country-block country-language" aria-labelledby="country-language-title">
      <div className="country-block__inner">
        <h2 id="country-language-title" className="country-language__title">
          {t('country.language')}
        </h2>
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

        {/* Sapaan */}
        <div className="country-language__greeting">
          <p
            className="country-specimen__greeting"
            lang={profile.lang}
            data-revealed="true"
          >
            <span className="country-specimen__greeting-inner">
              <NativeText profile={profile}>{greeting.native}</NativeText>
            </span>
          </p>
          {differs(greeting.roman, greeting.native) && (
            <p className="country-language__roman">{greeting.roman}</p>
          )}
          <p className="country-language__meaning">{greeting.meaningId}</p>
          {greeting.register.trim().length > 0 && (
            <p className="country-specimen__register">{greeting.register}</p>
          )}
          {supported && (
            <div className="country-language__audio-wrap">
              <button
                type="button"
                className="country-audio-btn country-audio-btn--greeting"
                onClick={handleListenGreeting}
                aria-label={`Dengarkan sapaan dalam ${language.nameId}`}
              >
                🔊 {t('country.listen')}
              </button>
            </div>
          )}
          <output className="country-specimen__status" aria-live="polite">
            {statusText}
          </output>
        </div>

        {/* Tiga frasa */}
        <h3 className="country-phrases__title">{t('country.threePhrases')}</h3>
        <ol className="country-phrases">
          {phrases.map((phrase, index) => (
            <li className="country-phrases__item" key={`${phrase.native}-${index}`}>
              <div className="country-phrases__header">
                <p className="country-phrases__label">{phrase.id}</p>
                {supported && (
                  <button
                    type="button"
                    className="country-audio-btn"
                    onClick={() => handlePlay(phrase.native, phrase.id, phrase.roman)}
                    aria-label={`Dengarkan pengucapan ${phrase.id}: ${phrase.native}`}
                  >
                    🔊 {t('country.listen')}
                  </button>
                )}
              </div>
              <p className="country-phrases__native">
                <NativeText profile={profile}>{phrase.native}</NativeText>
              </p>
              {differs(phrase.roman, phrase.native) && (
                <p className="country-phrases__roman">{phrase.roman}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
