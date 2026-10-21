import { useEffect, useRef, useState } from 'react';

import type { Country } from '@/content/countries';
import { cancelSpeech, isSpeechSupported, speak } from '@/lib/speech';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';
import { differs } from './scripts';

type ScriptSpecimenProps = {
  country: Country;
  profile: TextProfile;
};

type PlaybackStatus = 'idle' | 'speaking' | 'error';

function primarySubtag(lang: string): string {
  return lang.split('-')[0]?.toLowerCase() ?? '';
}

export default function ScriptSpecimen({ country, profile }: ScriptSpecimenProps) {
  const { greeting, language } = country;
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(() => typeof IntersectionObserver === 'undefined');
  const [voiceAvailable, setVoiceAvailable] = useState(false);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const supported = isSpeechSupported();

  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === 'undefined') return;

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
            {differs(greeting.roman, greeting.native) && (
              <p className="country-specimen__roman">{greeting.roman}</p>
            )}
            <p className="country-specimen__meaning">{greeting.meaningId}</p>
            {greeting.register.trim().length > 0 && (
              <p className="country-specimen__register">{greeting.register}</p>
            )}
          </div>
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
      </div>
    </section>
  );
}
