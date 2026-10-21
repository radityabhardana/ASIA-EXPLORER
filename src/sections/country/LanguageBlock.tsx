import { useEffect, useState } from 'react';

import type { Country } from '@/content/countries';
import { cancelSpeech, isSpeechSupported, speak } from '@/lib/speech';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';
import { differs } from './scripts';

type LanguageBlockProps = {
  country: Country;
  profile: TextProfile;
};

type PlaybackStatus = 'idle' | 'speaking' | 'error';

function primarySubtag(lang: string): string {
  return lang.split('-')[0]?.toLowerCase() ?? '';
}

export default function LanguageBlock({ country, profile }: LanguageBlockProps) {
  const { language, phrases, greeting } = country;
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const supported = isSpeechSupported();

  useEffect(() => {
    if (!isSpeechSupported()) {
      return;
    }

    const synth = window.speechSynthesis;
    const wanted = primarySubtag(profile.speechLang);
    const update = () => {
      const voices = synth.getVoices();
      setVoiceAvailable(voices.some((voice) => primarySubtag(voice.lang) === wanted));
    };

    synth.addEventListener('voiceschanged', update);
    const probe = window.setTimeout(update, 0);

    return () => {
      window.clearTimeout(probe);
      synth.removeEventListener('voiceschanged', update);
      cancelSpeech();
    };
  }, [profile.speechLang]);

  const statusText =
    status === 'error'
      ? 'Audio tidak dapat diputar di peramban ini.'
      : status === 'speaking'
        ? 'Memutar sapaan…'
        : '';

  function handleListen() {
    setStatus('speaking');
    const started = speak(greeting.native, {
      lang: profile.speechLang,
      onEnd: () => {
        setStatus('idle');
      },
      onError: () => {
        setStatus('error');
      },
    });
    if (!started) {
      setStatus('error');
    }
  }

  return (
    <section className="country-block country-language" aria-labelledby="country-language-title">
      <div className="country-block__inner">
        <h2 id="country-language-title" className="country-language__title">Bahasa</h2>
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
          {supported && voiceAvailable && (
            <button
              type="button"
              className="country-specimen__audio"
              onClick={handleListen}
              aria-label={`Dengarkan sapaan dalam ${language.nameId}`}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M4 2.5v11l9-5.5-9-5.5Z" />
              </svg>
              <span>Dengarkan sapaan</span>
            </button>
          )}
          <p className="country-specimen__status" role="status" aria-live="polite">
            {statusText}
          </p>
        </div>

        <h3 className="country-phrases__title">Tiga frasa</h3>
        <ol className="country-phrases">
          {phrases.map((phrase, index) => (
            <li className="country-phrases__item" key={`${phrase.native}-${index}`}>
              <p className="country-phrases__label">{phrase.id}</p>
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
