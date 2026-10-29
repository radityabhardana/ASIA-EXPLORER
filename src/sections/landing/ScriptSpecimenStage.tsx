import { useCallback, useEffect, useRef, useState } from 'react';
import type { Country } from '@/content/countries';
import { speak, cancelSpeech } from '@/lib/speech';
import { differs, profileFor } from '@/sections/country/scripts';

interface ScriptSpecimenStageProps {
  countries: readonly Country[];
  locale: 'id' | 'en';
}

interface ScriptAnatomy {
  scriptFamilyId: string;
  scriptFamilyEn: string;
  noteId: string;
  noteEn: string;
}

const SCRIPT_ANATOMY_MAP: Record<string, ScriptAnatomy> = {
  id: {
    scriptFamilyId: 'Alfabet Latin Fonetik',
    scriptFamilyEn: 'Phonetic Latin Alphabet',
    noteId: 'Ditulis dengan konsistensi fonetik tinggi; suku kata lugas tanpa penanda nada.',
    noteEn: 'Written with high phonetic consistency; straightforward syllables without tone markers.',
  },
  sg: {
    scriptFamilyId: 'Latin · Hanzi · Tamil',
    scriptFamilyEn: 'Latin · Chinese · Tamil',
    noteId: 'Simpang temu empat bahasa resmi dalam satu kota metropolitan maritim.',
    noteEn: 'Crossroads of four official languages in a single maritime metropolis.',
  },
  th: {
    scriptFamilyId: 'Aksara Thai (อักษรไทย)',
    scriptFamilyEn: 'Thai Script (Brahmic)',
    noteId: '44 konsonan dan 4 penanda nada; ditulis mengalir tanpa spasi antarkata.',
    noteEn: '44 consonants and 4 tone marks; written flowing without inter-word spaces.',
  },
  vn: {
    scriptFamilyId: 'Chữ Quốc Ngữ (Latin Tonik)',
    scriptFamilyEn: 'Chữ Quốc Ngữ (Tonal Latin)',
    noteId: 'Sistem Latin yang diperkaya tanda diakritik untuk merekam 6 variasi nada suara.',
    noteEn: 'Latin system enriched with diacritics to record 6 vocal tone variations.',
  },
  my: {
    scriptFamilyId: 'Rumi & Jawi',
    scriptFamilyEn: 'Rumi & Jawi',
    noteId: 'Memadukan alfabet Latin Rumi harian dengan tradisi kaligrafi Jawi berakar Arab.',
    noteEn: 'Combines daily Latin Rumi with Arabic-rooted Jawi calligraphic tradition.',
  },
  jp: {
    scriptFamilyId: 'Kanji · Hiragana · Katakana',
    scriptFamilyEn: 'Kanji · Hiragana · Katakana',
    noteId: 'Sintesis tiga sistem aksara: karakter logografis Tiongkok dipadu dua silabari lokal.',
    noteEn: 'Synthesis of three scripts: logographic kanji paired with two phonetic syllabaries.',
  },
  cn: {
    scriptFamilyId: 'Hanzi Sederhana (简体字)',
    scriptFamilyEn: 'Simplified Chinese (Hanzi)',
    noteId: 'Aksara tertua di dunia yang masih aktif, mewarisi piktograf berusia ribuan tahun.',
    noteEn: 'Oldest active writing system in the world, tracing back thousands of years of pictographs.',
  },
  kr: {
    scriptFamilyId: 'Hangeul (한글)',
    scriptFamilyEn: 'Hangeul (Alphabet)',
    noteId: 'Diciptakan secara ilmiah oleh Raja Sejong pada 1443; bentuk huruf meniru artikulasi mulut.',
    noteEn: 'Scientifically created by King Sejong in 1443; letter shapes mirror mouth articulation.',
  },
  in: {
    scriptFamilyId: 'Dewanagari (देवनागरी)',
    scriptFamilyEn: 'Devanagari (Brahmic)',
    noteId: 'Ciri khas garis horizontal atas (shirorekha) yang menggantung rangkaian aksara abugida.',
    noteEn: 'Characterized by the horizontal top bar (shirorekha) hanging the abugida letterforms.',
  },
  pk: {
    scriptFamilyId: 'Khat Nasta’liq (نستعلیق)',
    scriptFamilyEn: 'Nastaliq Script',
    noteId: 'Gaya kaligrafi Perso-Arab yang anggun dan meliuk menurun, ditulis dari kanan ke kiri.',
    noteEn: 'Flowing, descending Perso-Arabic calligraphic hand, written right-to-left.',
  },
  bd: {
    scriptFamilyId: 'Aksara Bengali (বাংলা)',
    scriptFamilyEn: 'Bengali Script',
    noteId: 'Aksara abugida Brahmik timur yang dinamis, dilindungi perjuangan Hari Bahasa Ibu Sedunia.',
    noteEn: 'Dynamic eastern Brahmic abugida script, immortalized by International Mother Language Day.',
  },
  sa: {
    scriptFamilyId: 'Abjad Arab (Khat Naskh)',
    scriptFamilyEn: 'Arabic Script (Naskh)',
    noteId: 'Ditulis dari kanan ke kiri dengan 28 konsonan; bentuk huruf berubah menurut posisi kata.',
    noteEn: 'Written right-to-left with 28 consonants; letter shapes morph according to word position.',
  },
  tr: {
    scriptFamilyId: 'Alfabet Latin Turki',
    scriptFamilyEn: 'Turkish Latin Alphabet',
    noteId: 'Diresmikan oleh Atatürk tahun 1928, menyelaraskan fonetik vokal harmoni.',
    noteEn: 'Inaugurated by Atatürk in 1928, perfectly tailored to Turkish vowel harmony phonetics.',
  },
  ir: {
    scriptFamilyId: 'Abjad Persia (فارسی)',
    scriptFamilyEn: 'Persian Alphabet',
    noteId: 'Mengembangkan abjad Arab dengan 4 huruf tambahan (پ چ ژ گ) untuk fonem Persia kuno.',
    noteEn: 'Extends Arabic script with 4 additional letters (پ چ ژ گ) for ancient Persian phonemes.',
  },
  uz: {
    scriptFamilyId: 'Alfabet Uzbek (Latin)',
    scriptFamilyEn: 'Uzbek Latin Alphabet',
    noteId: 'Jembatan kebudayaan oase sutra yang menghubungkan warisan Sirilik dengan alfabet Latin modern.',
    noteEn: 'Silk oasis cultural bridge transitioning from historic Cyrillic heritage to modern Latin.',
  },
  kz: {
    scriptFamilyId: 'Alfabet Kazakh (Sirilik)',
    scriptFamilyEn: 'Kazakh Cyrillic Alphabet',
    noteId: 'Aksara bersuku vokal luas yang merekam kekayaan sastra lisan pengelana steppa Eurasia.',
    noteEn: 'Broad-voweled script capturing the rich oral epic poetry of Eurasian steppe wanderers.',
  },
};

const REGIONS = [
  { id: 'all', labelId: 'Semua Kawasan (15)', labelEn: 'All Regions (15)' },
  { id: 'Asia Tenggara', labelId: 'Asia Tenggara', labelEn: 'Southeast Asia' },
  { id: 'Asia Timur', labelId: 'Asia Timur', labelEn: 'East Asia' },
  { id: 'Asia Selatan', labelId: 'Asia Selatan', labelEn: 'South Asia' },
  { id: 'Asia Barat', labelId: 'Asia Barat', labelEn: 'West Asia' },
  { id: 'Asia Tengah', labelId: 'Asia Tengah', labelEn: 'Central Asia' },
];

export default function ScriptSpecimenStage({ countries, locale }: ScriptSpecimenStageProps) {
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourIndex, setTourIndex] = useState<number>(-1);
  const tourTimerRef = useRef<number | null>(null);
  const playTourStepRef = useRef<((index: number, list: readonly Country[]) => void) | null>(null);

  const filteredCountries = selectedRegion === 'all'
    ? countries
    : countries.filter((c) => c.region === selectedRegion);

  const speakGreeting = useCallback((
    countryId: string,
    text: string,
    romanText: string,
    speechLang: string,
    onFinished?: () => void,
  ) => {
    setSpeakingId(countryId);
    speak(text, {
      lang: speechLang,
      fallbackText: romanText,
      rate: 0.9,
      onEnd: () => {
        setSpeakingId((cur) => (cur === countryId ? null : cur));
        onFinished?.();
      },
      onError: () => {
        setSpeakingId((cur) => (cur === countryId ? null : cur));
        onFinished?.();
      },
    });
  }, []);

  const stopTour = useCallback(() => {
    setIsTourActive(false);
    setTourIndex(-1);
    if (tourTimerRef.current !== null) {
      window.clearTimeout(tourTimerRef.current);
      tourTimerRef.current = null;
    }
    cancelSpeech();
    setSpeakingId(null);
  }, []);

  const playTourStep = useCallback((index: number, list: readonly Country[]) => {
    if (index >= list.length) {
      stopTour();
      return;
    }

    setTourIndex(index);
    const country = list[index];
    if (!country) {
      stopTour();
      return;
    }

    const profile = profileFor(country);
    speakGreeting(
      country.id,
      country.greeting.native,
      country.greeting.roman,
      profile.speechLang,
      () => {
        // Beri jeda santun 1.2 detik sebelum beralih ke negara berikutnya di rute
        tourTimerRef.current = window.setTimeout(() => {
          playTourStepRef.current?.(index + 1, list);
        }, 1200);
      },
    );
  }, [speakGreeting, stopTour]);

  useEffect(() => {
    playTourStepRef.current = playTourStep;
  }, [playTourStep]);

  const startTour = useCallback(() => {
    if (isTourActive) {
      stopTour();
      return;
    }
    setIsTourActive(true);
    playTourStep(0, filteredCountries);
  }, [isTourActive, stopTour, playTourStep, filteredCountries]);

  useEffect(() => {
    return () => {
      if (tourTimerRef.current !== null) {
        window.clearTimeout(tourTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="landing-script__stage-wrapper">
      {/* Interactive Controls Bar: Filter Kawasan & Grand Audio Tour */}
      <div className="landing-script__controls-bar" role="toolbar" aria-label="Kontrol aksara dan audio benua">
        <div className="landing-script__filter-chips" role="tablist">
          {REGIONS.map((region) => {
            const isActive = selectedRegion === region.id;
            return (
              <button
                key={region.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`landing-script__filter-btn ${isActive ? 'landing-script__filter-btn--active' : ''}`}
                onClick={() => {
                  if (isTourActive) stopTour();
                  setSelectedRegion(region.id);
                }}
              >
                {locale === 'id' ? region.labelId : region.labelEn}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`landing-script__tour-btn ${isTourActive ? 'landing-script__tour-btn--active' : ''}`}
          onClick={startTour}
          aria-label={
            isTourActive
              ? (locale === 'id' ? 'Hentikan rute audio benua' : 'Stop continental audio route')
              : (locale === 'id' ? 'Putar rute audio benua otomatis' : 'Play continental audio route')
          }
        >
          <span className="landing-script__tour-icon" aria-hidden="true">
            {isTourActive ? '■' : '▷'}
          </span>
          <span>
            {isTourActive
              ? (locale === 'id'
                  ? `Hentikan Rute (${tourIndex + 1}/${filteredCountries.length})`
                  : `Stop Route (${tourIndex + 1}/${filteredCountries.length})`)
              : (locale === 'id' ? 'Putar Rute Suara Benua' : 'Play Audio Route')}
          </span>
        </button>
      </div>

      <p className="landing-script__hint-text" aria-hidden="true">
        {locale === 'id'
          ? '✦ Ketuk kartu atau ikon suara untuk mendengarkan sapaan asli · Jelajahi anatomi kaligrafi tiap peradaban'
          : '✦ Tap any card or speaker icon to hear native pronunciation · Explore the calligraphy anatomy of each civilization'}
      </p>

      {/* Asymmetric Responsive Specimen Grid */}
      <div className="landing-script__specimen-grid">
        {filteredCountries.map((country) => {
          const profile = profileFor(country);
          const isSpeaking = speakingId === country.id;
          const anatomy = SCRIPT_ANATOMY_MAP[country.id];
          const scriptFamily = locale === 'id' ? anatomy?.scriptFamilyId : anatomy?.scriptFamilyEn;
          const scriptNote = locale === 'id' ? anatomy?.noteId : anatomy?.noteEn;

          return (
            <article
              key={country.id}
              className={`landing-script__card ${isSpeaking ? 'landing-script__card--speaking' : ''}`}
              tabIndex={0}
              aria-label={
                locale === 'id'
                  ? `${country.nameId}: ${country.greeting.native}, bahasa ${country.language.nameId}. ${country.greeting.meaningId}. Ketuk untuk mendengarkan pengucapan.`
                  : `${country.nameId}: ${country.greeting.native}, ${country.language.nameId} language. Tap to listen.`
              }
              onClick={() => {
                if (isTourActive) stopTour();
                speakGreeting(
                  country.id,
                  country.greeting.native,
                  country.greeting.roman,
                  profile.speechLang,
                );
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (isTourActive) stopTour();
                  speakGreeting(
                    country.id,
                    country.greeting.native,
                    country.greeting.roman,
                    profile.speechLang,
                  );
                }
              }}
            >
              {/* Card Header: Metadata & Audio Trigger */}
              <div className="landing-script__card-header">
                <div className="landing-script__card-identity">
                  <div className="landing-script__country-badge">
                    <span className="landing-script__accent-bar" aria-hidden="true" />
                    <span className="landing-script__country">{country.nameId}</span>
                    <span className="landing-script__region-tag">{country.region}</span>
                  </div>
                  <span className="landing-script__script-family">
                    {scriptFamily ?? country.language.script}
                  </span>
                </div>

                <button
                  type="button"
                  className={`landing-script__audio-btn ${isSpeaking ? 'landing-script__audio-btn--active' : ''}`}
                  aria-label={
                    locale === 'id'
                      ? `Dengarkan pengucapan sapaan ${country.nameId}`
                      : `Listen to greeting pronunciation ${country.nameId}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isTourActive) stopTour();
                    speakGreeting(
                      country.id,
                      country.greeting.native,
                      country.greeting.roman,
                      profile.speechLang,
                    );
                  }}
                >
                  {isSpeaking ? (
                    <span className="landing-script__soundwave" aria-hidden="true">
                      <span className="landing-script__soundwave-bar" />
                      <span className="landing-script__soundwave-bar" />
                      <span className="landing-script__soundwave-bar" />
                    </span>
                  ) : (
                    <svg
                      className="landing-script__speaker-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Card Body: Prominent Calligraphic Character */}
              <div className="landing-script__card-body">
                <p className="landing-script__native" lang={profile.lang} dir={profile.dir}>
                  {country.greeting.native}
                </p>
                <p className="landing-script__roman">
                  {differs(country.greeting.native, country.greeting.roman)
                    ? country.greeting.roman
                    : country.greeting.meaningId}
                </p>
                {differs(country.greeting.native, country.greeting.roman) && country.greeting.meaningId && (
                  <p className="landing-script__meaning">
                    &ldquo;{country.greeting.meaningId}&rdquo;
                  </p>
                )}
              </div>

              {/* Card Footer: Archival Calligraphic & Linguistic Insight */}
              {scriptNote ? (
                <div className="landing-script__card-footer">
                  <p className="landing-script__note-text">{scriptNote}</p>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
