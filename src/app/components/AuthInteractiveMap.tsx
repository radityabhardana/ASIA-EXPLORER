import { useState, useEffect, useMemo, useCallback, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Volume2,
  Play,
  Pause,
  Sparkles,
  Globe,
  MapPin,
} from 'lucide-react';
import { countries, getCountry } from '@/content/countries';
import { mapPaths } from '@/sections/landing/landing-data';
import { profileFor } from '@/sections/country/scripts';
import { speak, isSpeechSupported } from '@/lib/speech';
import '@/styles/auth.css';

export interface CountryVisualMeta {
  id: string;
  nameId: string;
  nativeName: string;
  script: string;
  scriptType: string;
  tagline: string;
  color: string;
  coords: { lat: string; lng: string; capital: string };
  region: string;
}

export const COUNTRY_AUTH_LIST: readonly CountryVisualMeta[] = [
  {
    id: 'jp',
    nameId: 'Jepang',
    nativeName: '日本',
    script: '日本語',
    scriptType: 'Kanji & Kana',
    tagline: 'Pelajari Aksara Hiragana, Katakana & Etiket Kartu Nama Meishi',
    color: '#d18a94',
    coords: { lat: '36.20° N', lng: '138.25° E', capital: 'Tokyo' },
    region: 'Asia Timur',
  },
  {
    id: 'kr',
    nameId: 'Korea Selatan',
    nativeName: '대한민국',
    script: '한국어',
    scriptType: 'Hangul',
    tagline: 'Kenali Budaya Hangul & Tata Krama Kesantunan Jondaenmal',
    color: '#7a9bb8',
    coords: { lat: '35.91° N', lng: '127.77° E', capital: 'Seoul' },
    region: 'Asia Timur',
  },
  {
    id: 'id',
    nameId: 'Indonesia',
    nativeName: 'Nusantara',
    script: 'Nusantara',
    scriptType: 'Latin & Aksara Daerah',
    tagline: 'Jelajahi Keragaman 718 Bahasa Daerah & Etiket Adat Nusantara',
    color: '#c97a5f',
    coords: { lat: '0.79° S', lng: '113.92° E', capital: 'Jakarta' },
    region: 'Asia Tenggara',
  },
  {
    id: 'in',
    nameId: 'India',
    nativeName: 'भारत',
    script: 'हिन्दी',
    scriptType: 'Devanagari',
    tagline: 'Pahami Aksara Devanagari & Filosofi Penghormatan Namaste',
    color: '#d18d43',
    coords: { lat: '20.59° N', lng: '78.96° E', capital: 'New Delhi' },
    region: 'Asia Selatan',
  },
  {
    id: 'sa',
    nameId: 'Arab Saudi',
    nativeName: 'المملكة العربية السعودية',
    script: 'العربية',
    scriptType: 'Aksara & Kaligrafi Arab',
    tagline: 'Kuasai Kaligrafi Huruf Arab & Tradisi Keramahan Majlis',
    color: '#a8b87a',
    coords: { lat: '23.89° N', lng: '45.08° E', capital: 'Riyadh' },
    region: 'Asia Barat',
  },
  {
    id: 'cn',
    nameId: 'Tiongkok',
    nativeName: '中国',
    script: '中文',
    scriptType: 'Karakter Hanzi',
    tagline: 'Kuasai Karakter Hanzi & Tata Krama Jamuan Makan Minum Teh',
    color: '#a5996b',
    coords: { lat: '35.86° N', lng: '104.20° E', capital: 'Beijing' },
    region: 'Asia Timur',
  },
  {
    id: 'th',
    nameId: 'Thailand',
    nativeName: 'ประเทศไทย',
    script: 'ภาษาไทย',
    scriptType: 'Aksara Thai',
    tagline: 'Pahami Sistem Nada Aksara Thai & Etiket Salam Wai Tradisional',
    color: '#9b7fad',
    coords: { lat: '15.87° N', lng: '100.99° E', capital: 'Bangkok' },
    region: 'Asia Tenggara',
  },
  {
    id: 'vn',
    nameId: 'Vietnam',
    nativeName: 'Việt Nam',
    script: 'Tiếng Việt',
    scriptType: 'Chữ Quốc Ngữ',
    tagline: 'Kuasai 6 Nada Bahasa Vietnam & Budaya Minum Teh Tradisional',
    color: '#e8c070',
    coords: { lat: '14.06° N', lng: '108.28° E', capital: 'Hanoi' },
    region: 'Asia Tenggara',
  },
  {
    id: 'my',
    nameId: 'Malaysia',
    nativeName: 'Malaysia',
    script: 'Melayu',
    scriptType: 'Rumi & Jawi',
    tagline: 'Kuasai Budi Bahasa Melayu & Nilai Gotong Royong Serumpun',
    color: '#6b9b8e',
    coords: { lat: '4.21° N', lng: '101.98° E', capital: 'Kuala Lumpur' },
    region: 'Asia Tenggara',
  },
  {
    id: 'sg',
    nameId: 'Singapura',
    nativeName: 'Singapore',
    script: 'SG',
    scriptType: 'Multilingual (Latin, Hanzi, Tamil)',
    tagline: 'Pahami Harmoni Multikultural & Tata Tertib Publik Ruang Bersama',
    color: '#b85f5f',
    coords: { lat: '1.35° N', lng: '103.82° E', capital: 'Singapura' },
    region: 'Asia Tenggara',
  },
  {
    id: 'ph',
    nameId: 'Filipina',
    nativeName: 'Pilipinas',
    script: 'Tagalog',
    scriptType: 'Latin & Baybayin',
    tagline: 'Pelajari Bahasa Tagalog & Tradisi Rasa Hormat Mano Po',
    color: '#6a7fad',
    coords: { lat: '12.88° N', lng: '121.77° E', capital: 'Manila' },
    region: 'Asia Tenggara',
  },
  {
    id: 'tr',
    nameId: 'Turki',
    nativeName: 'Türkiye',
    script: 'Türkçe',
    scriptType: 'Latin Turki',
    tagline: 'Eksplorasi Jalur Sutra Eurasia & Tradisi Sambutan Keramahan Çay',
    color: '#9f7a8f',
    coords: { lat: '38.96° N', lng: '35.24° E', capital: 'Ankara' },
    region: 'Asia Barat',
  },
  {
    id: 'kz',
    nameId: 'Kazakhstan',
    nativeName: 'Қазақстан',
    script: 'Қазақша',
    scriptType: 'Sirilik & Latin Kazak',
    tagline: 'Pelajari Warisan Stepa Nomaden & Tradisi Jamuan Dastarkhan',
    color: '#7a8fa8',
    coords: { lat: '48.02° N', lng: '66.92° E', capital: 'Astana' },
    region: 'Asia Tengah',
  },
  {
    id: 'uz',
    nameId: 'Uzbekistan',
    nativeName: 'Oʻzbekiston',
    script: 'Oʻzbek',
    scriptType: 'Latin Uzbek',
    tagline: 'Temukan Jalur Sutra Samarkand & Adab Jamuan Teh Piyola',
    color: '#8fa88e',
    coords: { lat: '41.38° N', lng: '64.59° E', capital: 'Tashkent' },
    region: 'Asia Tengah',
  },
  {
    id: 'mn',
    nameId: 'Mongolia',
    nativeName: 'Монгол улс',
    script: 'Монгол',
    scriptType: 'Sirilik & Aksara Mongol',
    tagline: 'Kuasai Aksara Tradisional & Adab Bertamu di Tenda Ger',
    color: '#98786a',
    coords: { lat: '46.86° N', lng: '103.85° E', capital: 'Ulaanbaatar' },
    region: 'Asia Timur',
  },
];

/**
 * Menghitung viewBox ketat potongan siluet satu negara persis seperti aset landing page.
 */
export function getCountryTightViewBox(bbox: readonly [number, number, number, number]): string {
  const [minX, minY, maxX, maxY] = bbox;
  const width = Math.max(maxX - minX, 1);
  const height = Math.max(maxY - minY, 1);
  const maxDim = Math.max(width, height);
  const pad = Math.max(maxDim * 0.12, 1.2);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const vbW = width + pad * 2;
  const vbH = height + pad * 2;

  return `${(cx - vbW / 2).toFixed(2)} ${(cy - vbH / 2).toFixed(2)} ${vbW.toFixed(2)} ${vbH.toFixed(2)}`;
}

export interface AuthInteractiveMapProps {
  onCountrySelect?: (countryId: string) => void;
  className?: string;
}

export default function AuthInteractiveMap({ onCountrySelect, className }: AuthInteractiveMapProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [pauseUntil, setPauseUntil] = useState<number>(0);

  const activeMeta = COUNTRY_AUTH_LIST[currentIndex] ?? COUNTRY_AUTH_LIST[0]!;

  const mapPathMap = useMemo(() => {
    return new Map(mapPaths.map((p) => [p.id, p]));
  }, []);

  const countryDataMap = useMemo(() => {
    return new Map(countries.map((c) => [c.id, c]));
  }, []);

  const activePath = mapPathMap.get(activeMeta.id);
  const activeCountryData = countryDataMap.get(activeMeta.id) ?? getCountry(activeMeta.id);

  // Hitung viewBox ketat potongan siluet pulau/negara aktif
  const activeViewBox = useMemo(() => {
    if (!activePath) return '0 160 1000 680';
    return getCountryTightViewBox(activePath.bbox);
  }, [activePath]);

  // Rotasi carousel otomatis setiap 4.5 detik
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (Date.now() < pauseUntil) return;
      setCurrentIndex((prev) => (prev + 1) % COUNTRY_AUTH_LIST.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, pauseUntil]);

  // Handler navigasi negara
  const handleSelectCountry = useCallback(
    (id: string) => {
      const idx = COUNTRY_AUTH_LIST.findIndex((c) => c.id === id);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setPauseUntil(Date.now() + 12000);
        onCountrySelect?.(id);
      }
    },
    [onCountrySelect]
  );

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % COUNTRY_AUTH_LIST.length);
    setPauseUntil(Date.now() + 8000);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + COUNTRY_AUTH_LIST.length) % COUNTRY_AUTH_LIST.length);
    setPauseUntil(Date.now() + 8000);
  }, []);

  // Pemutaran audio sapaan bahasa lokal
  const handleSpeak = useCallback(() => {
    if (!isSpeechSupported() || speaking || !activeCountryData) return;
    setSpeaking(true);
    const profile = profileFor(activeCountryData);
    speak(activeCountryData.greeting.native, {
      lang: profile.speechLang,
      fallbackText: activeCountryData.greeting.roman,
      rate: 0.9,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, [speaking, activeCountryData]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    }
  };

  return (
    <section
      className={`auth-visual-showcase ${className || ''}`}
      aria-label="Peta Interaktif Benua Asia"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* ── Top Editorial Masthead (Bersih, Terintegrasi & Tanpa Sekat) ── */}
      <header className="auth-hud-bar">
        <Link to="/" className="auth-hud-brand" title="Kembali ke Beranda">
          <Compass size={20} className="auth-hud-brand__icon" aria-hidden="true" />
          <span className="auth-hud-brand__name">Asia Explorer</span>
          <span className="auth-hud-brand__badge">ATLAS</span>
        </Link>

        <div className="auth-hud-controls">
          <span className="auth-hud-card-counter">
            {String(currentIndex + 1).padStart(2, '0')} / {String(COUNTRY_AUTH_LIST.length).padStart(2, '0')}
          </span>
          <button
            type="button"
            className="auth-hud-play-toggle"
            onClick={() => {
              setIsAutoPlaying((v) => !v);
              setPauseUntil(0);
            }}
            title={isAutoPlaying ? 'Jeda Rotasi Otomatis' : 'Mulai Rotasi Otomatis'}
            aria-label={isAutoPlaying ? 'Jeda Rotasi Otomatis' : 'Mulai Rotasi Otomatis'}
          >
            {isAutoPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Navigasi tersembunyi untuk aksesibilitas & screen-reader (tanpa tombol panah visual) */}
      <button
        type="button"
        className="auth-carousel-arrow--hidden"
        onClick={handlePrev}
        aria-label="Negara Sebelumnya"
      />
      <button
        type="button"
        className="auth-carousel-arrow--hidden"
        onClick={handleNext}
        aria-label="Negara Berikutnya"
      />

      {/* ── Panggung Utama Potongan Siluet Negara 2D (Bebas Kotak, Penuh & Interaktif) ── */}
      <div
        className="auth-showcase-stage"
        onMouseEnter={() => setPauseUntil(Date.now() + 15000)}
        onMouseLeave={() => setPauseUntil(0)}
      >
        {/* Header Informasi Negara */}
        <div className="auth-showcase-header">
          <div className="auth-showcase-meta-row">
            <span className="auth-showcase-region">
              <Globe size={11} aria-hidden="true" />
              {activeMeta.region}
            </span>
            <span className="auth-showcase-script-type">
              {activeMeta.scriptType}
            </span>
          </div>

          <h3 className="auth-showcase-country-name">
            {activeMeta.nameId}
            <span className="auth-showcase-native-name">({activeMeta.nativeName})</span>
          </h3>

          <div className="auth-showcase-coords">
            <MapPin size={12} className="auth-showcase-coords-icon" aria-hidden="true" />
            <span>Ibukota {activeMeta.coords.capital} · {activeMeta.coords.lat}, {activeMeta.coords.lng}</span>
          </div>
        </div>

        {/* Siluet Potongan Pulau/Negara 2D Interaktif (Bersih Tanpa Text Menumpuk) */}
        <div className="auth-silhouette-stage">
          <svg
            className="auth-silhouette-svg"
            viewBox={activeViewBox}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={`Potongan peta ${activeMeta.nameId}`}
          >
            {/* Siluet Utama Negara dari map-paths (Aset Landing Page) */}
            {activePath && (
              <g
                className="auth-country-interactive-target"
                role="button"
                tabIndex={0}
                onClick={handleSpeak}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleSpeak();
                  }
                }}
                aria-label={`Klik siluet ${activeMeta.nameId} untuk dengarkan sapaan`}
              >
                <path
                  d={activePath.d}
                  fill={activeMeta.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                  className="auth-silhouette-path"
                />
              </g>
            )}
          </svg>
        </div>

        {/* Footer Sapaan Budaya & Tagline */}
        <div className="auth-showcase-footer">
          {activeCountryData && (
            <div className="auth-greeting-row">
              <button
                type="button"
                className={`auth-greeting-btn ${speaking ? 'auth-greeting-btn--speaking' : ''}`}
                onClick={handleSpeak}
                disabled={speaking}
                title={`Dengarkan pelafalan sapaan ${activeCountryData.greeting.native}`}
                aria-label={`Dengarkan sapaan ${activeCountryData.greeting.native}`}
              >
                {speaking ? (
                  <span className="auth-soundwave" aria-hidden="true">
                    <span className="auth-soundwave__bar" />
                    <span className="auth-soundwave__bar" />
                    <span className="auth-soundwave__bar" />
                    <span className="auth-soundwave__bar" />
                  </span>
                ) : (
                  <Volume2 size={16} aria-hidden="true" />
                )}
                <span className="auth-greeting-btn__native">{activeCountryData.greeting.native}</span>
                {activeCountryData.greeting.roman !== activeCountryData.greeting.native && (
                  <span className="auth-greeting-btn__roman">({activeCountryData.greeting.roman})</span>
                )}
              </button>

              <span className="auth-greeting-meaning">
                — {activeCountryData.greeting.meaningId}
              </span>
            </div>
          )}

          <p className="auth-showcase-tagline">
            <Sparkles size={14} className="auth-showcase-tagline__icon" aria-hidden="true" />
            <span>{activeMeta.tagline}</span>
          </p>
        </div>
      </div>

      {/* ── Indikator Slide Minimalis di Dasar Panel ── */}
      <footer className="auth-carousel-indicator-row" aria-label="Pilih Negara Asia">
        <div className="auth-carousel-dots" role="tablist">
          {COUNTRY_AUTH_LIST.map((c, i) => {
            const isSelected = i === currentIndex;
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={c.nameId}
                className={`auth-carousel-dot ${isSelected ? 'auth-carousel-dot--active' : ''}`}
                onClick={() => handleSelectCountry(c.id)}
              />
            );
          })}
        </div>
      </footer>
    </section>
  );
}
