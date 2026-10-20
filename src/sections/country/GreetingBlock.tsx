import { useEffect, useState } from 'react';

import type { Country } from '@/content/countries';
import { cancelSpeech, isSpeechSupported, speak } from '@/lib/speech';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';
import { differs } from './scripts';

type GreetingBlockProps = {
  country: Country;
  profile: TextProfile;
};

type PlaybackStatus = 'idle' | 'speaking' | 'error';

function primarySubtag(lang: string): string {
  return lang.split('-')[0]?.toLowerCase() ?? '';
}

export default function GreetingBlock({ country, profile }: GreetingBlockProps) {
  const { greeting } = country;
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
    // Daftar suara bisa sudah terisi sebelum langganan dipasang; periksa di tick berikutnya.
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
    <section className="country-block country-greeting" aria-label="Sapaan">
      <div className="country-block__inner">
        <p className="country-greeting__native">
          <NativeText profile={profile}>{greeting.native}</NativeText>
        </p>
        {differs(greeting.roman, greeting.native) && (
          <p className="country-greeting__roman">{greeting.roman}</p>
        )}
        <p className="country-greeting__meaning">{greeting.meaningId}</p>
        {greeting.register.trim().length > 0 && (
          <p className="country-greeting__register">{greeting.register}</p>
        )}
        {supported && voiceAvailable && (
          <button
            type="button"
            className="country-greeting__audio"
            onClick={handleListen}
            aria-label={`Dengarkan sapaan dalam ${country.language.nameId}`}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 2.5v11l9-5.5-9-5.5Z" />
            </svg>
            <span>Dengarkan sapaan</span>
          </button>
        )}
        <p className="country-greeting__status" role="status" aria-live="polite">
          {statusText}
        </p>
      </div>
    </section>
  );
}
