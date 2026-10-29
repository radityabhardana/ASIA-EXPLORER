import { useState, useEffect, useMemo, useRef, useCallback, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Volume2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Radio,
  Globe,
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

const VIEW_BOX = '0 160 1000 680';

export interface AuthInteractiveMapProps {
  onCountrySelect?: (countryId: string) => void;
  className?: string;
}

export default function AuthInteractiveMap({ onCountrySelect, className }: AuthInteractiveMapProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const [pauseUntil, setPauseUntil] = useState<number>(0);
  const pillStripRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLButtonElement>(null);

  const activeMeta = COUNTRY_AUTH_LIST[currentIndex] ?? COUNTRY_AUTH_LIST[0]!;

  const mapPathMap = useMemo(() => {
    return new Map(mapPaths.map((p) => [p.id, p]));
  }, []);

  const countryDataMap = useMemo(() => {
    return new Map(countries.map((c) => [c.id, c]));
  }, []);

  const activePath = mapPathMap.get(activeMeta.id);
  const activeCountryData = countryDataMap.get(activeMeta.id) ?? getCountry(activeMeta.id);

  // Auto-scroll active pill into view
  useEffect(() => {
    if (activePillRef.current) {
      activePillRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  // Slide auto-rotation
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (Date.now() < pauseUntil) return;
      setCurrentIndex((prev) => (prev + 1) % COUNTRY_AUTH_LIST.length);
    }, 5500);

    return () => clearInterval(interval);
  }, [isAutoPlaying, pauseUntil]);

  // Handle country selection
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

  // Native speech audio playback
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

  // Keyboard navigation on SVG path
  const handlePathKeyDown = (e: KeyboardEvent<SVGPathElement>, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelectCountry(id);
    }
  };

  // Centroid calculations for active beacon and leader callout
  const beaconGeometry = useMemo(() => {
    if (!activePath) return null;
    const [cx, cy] = activePath.centroid;
    const isNearRightEdge = cx > 700;
    const isNearTopEdge = cy < 260;
    const dx = isNearRightEdge ? -24 : 24;
    const dy = isNearTopEdge ? 24 : -24;
    const lineEndX = isNearRightEdge ? dx - 85 : dx + 85;
    return { cx, cy, isNearRightEdge, isNearTopEdge, dx, dy, lineEndX };
  }, [activePath]);

  return (
    <section className={`auth-visual-showcase ${className || ''}`} aria-label="Kanvas Kartografi Interaktif Asia">
      {/* ── Top Cartography HUD Bar ── */}
      <header className="auth-hud-bar">
        <Link to="/" className="auth-hud-brand" title="Kembali ke Beranda">
          <Compass size={18} className="auth-hud-brand__icon" aria-hidden="true" />
          <span className="auth-hud-brand__name">Asia Explorer</span>
          <span className="auth-hud-brand__badge">ATLAS</span>
        </Link>

        <div className="auth-hud-coords" aria-live="polite">
          <Radio size={12} className="auth-hud-coords__radar" aria-hidden="true" />
          <span className="auth-hud-coords__text">
            {activeMeta.coords.lat} · {activeMeta.coords.lng}
          </span>
        </div>

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
      </header>

      {/* ── Interactive SVG Map Canvas ── */}
      <div className="auth-map-wrapper">
        <svg
          className="auth-map-svg"
          viewBox={VIEW_BOX}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Peta Interaktif Benua Asia"
        >
          <defs>
            {/* Filter glow for active country */}
            <filter id="auth-country-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="6" floodColor={activeMeta.color} floodOpacity="0.65" />
            </filter>
            {/* Filter soft shadow for tags */}
            <filter id="auth-tag-shadow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.45" />
            </filter>
            {/* Ambient radial glow under the continent */}
            <radialGradient id="auth-continent-glow" cx="55%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a5553" stopOpacity="0.38" />
              <stop offset="65%" stopColor="#113339" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0b1a1e" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Ambient Glow */}
          <rect x="0" y="160" width="1000" height="680" fill="url(#auth-continent-glow)" />

          {/* Graticule Latitude & Longitude Lines */}
          <g className="auth-map__graticules" aria-hidden="true">
            {[140, 280, 420, 560, 700, 840, 960].map((x) => (
              <line key={`meridian-${x}`} x1={x} y1="160" x2={x} y2="840" className="auth-map__graticule-line" />
            ))}
            {[260, 390, 520, 650, 780].map((y) => (
              <line key={`parallel-${y}`} x1="0" y1={y} x2="1000" y2={y} className="auth-map__graticule-line" />
            ))}
            {/* Coordinate Labels */}
            <text x="24" y="275" className="auth-map__coord-label">45° N</text>
            <text x="24" y="535" className="auth-map__coord-label">15° N</text>
            <text x="24" y="795" className="auth-map__coord-label">10° S</text>
            <text x="284" y="180" className="auth-map__coord-label">45° E</text>
            <text x="564" y="180" className="auth-map__coord-label">90° E</text>
            <text x="844" y="180" className="auth-map__coord-label">135° E</text>
          </g>

          {/* Vintage Nautical Compass Rose (Indian Ocean / Arabian Sea area) */}
          <g className="auth-map__compass" transform="translate(130, 320)" aria-hidden="true">
            <circle r="36" className="auth-compass__ring auth-compass__ring--outer" />
            <circle r="26" className="auth-compass__ring" />
            <circle r="14" className="auth-compass__ring auth-compass__ring--inner" />
            {/* 8-point nautical star */}
            <path
              d="M0,-36 L4,-14 L26,-26 L14,-4 L36,0 L14,4 L26,26 L4,14 L0,36 L-4,14 L-26,26 L-14,4 L-36,0 L-14,-4 L-26,-26 L-4,-14 Z"
              className="auth-compass__star"
            />
            <text x="0" y="-40" className="auth-compass__letter" textAnchor="middle">U</text>
            <text x="0" y="49" className="auth-compass__letter" textAnchor="middle">S</text>
            <text x="44" y="3" className="auth-compass__letter" textAnchor="start">T</text>
            <text x="-44" y="3" className="auth-compass__letter" textAnchor="end">B</text>
          </g>

          {/* 15 Country Paths */}
          <g className="auth-map__countries" role="presentation">
            {mapPaths.map((entry) => {
              const isActive = entry.id === activeMeta.id;
              const isHovered = entry.id === hoveredId;

              const pathStyle = {
                fill: isActive
                  ? activeMeta.color
                  : isHovered
                  ? 'rgba(255, 255, 255, 0.32)'
                  : 'rgba(255, 255, 255, 0.08)',
                stroke: isActive ? '#fffef9' : isHovered ? 'rgba(255, 255, 255, 0.65)' : 'rgba(255, 255, 255, 0.2)',
                strokeWidth: isActive ? 2.5 : isHovered ? 1.7 : 1,
                filter: isActive ? 'url(#auth-country-glow)' : undefined,
                cursor: 'pointer',
                transition: 'fill 0.3s ease, stroke 0.3s ease, opacity 0.3s ease',
              };

              return (
                <path
                  key={entry.id}
                  d={entry.d}
                  style={pathStyle}
                  className={`auth-map__country-path ${isActive ? 'auth-map__country-path--active' : ''}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`${entry.name_id} (${isActive ? 'Terpilih' : 'Klik untuk pilih'})`}
                  onClick={() => handleSelectCountry(entry.id)}
                  onKeyDown={(e) => handlePathKeyDown(e, entry.id)}
                  onMouseEnter={() => setHoveredId(entry.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <title>{entry.name_id}</title>
                </path>
              );
            })}
          </g>

          {/* Active Country Beacon & Floating Leader Tag */}
          {beaconGeometry && (
            <g className="auth-map__beacon" transform={`translate(${beaconGeometry.cx}, ${beaconGeometry.cy})`}>
              {/* Animated radiating radar waves */}
              <circle r="7" className="auth-map__radar-wave auth-map__radar-wave--1" stroke={activeMeta.color} />
              <circle r="7" className="auth-map__radar-wave auth-map__radar-wave--2" stroke={activeMeta.color} />

              {/* Glowing Centroid Core Pin */}
              <circle r="5" fill="#fffef9" stroke={activeMeta.color} strokeWidth="2.5" />

              {/* Leader Callout Line */}
              <path
                d={`M 0 0 L ${beaconGeometry.dx} ${beaconGeometry.dy} L ${beaconGeometry.lineEndX} ${beaconGeometry.dy}`}
                fill="none"
                stroke="#fffef9"
                strokeWidth="1.5"
                strokeDasharray="2 2"
                opacity="0.9"
              />

              {/* Floating Country HUD Pill */}
              <g
                transform={`translate(${
                  beaconGeometry.isNearRightEdge ? beaconGeometry.lineEndX - 8 : beaconGeometry.dx
                }, ${beaconGeometry.dy - 24})`}
                filter="url(#auth-tag-shadow)"
              >
                <rect
                  x={beaconGeometry.isNearRightEdge ? -95 : 0}
                  y="0"
                  width="95"
                  height="26"
                  rx="5"
                  fill="rgba(11, 26, 30, 0.94)"
                  stroke={activeMeta.color}
                  strokeWidth="1.2"
                />
                <text
                  x={beaconGeometry.isNearRightEdge ? -47 : 47}
                  y="12"
                  textAnchor="middle"
                  fill="#fffef9"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="var(--font-display, serif)"
                >
                  {activeMeta.nameId}
                </text>
                <text
                  x={beaconGeometry.isNearRightEdge ? -47 : 47}
                  y="21"
                  textAnchor="middle"
                  fill={activeMeta.color}
                  fontSize="8.5"
                  fontWeight="600"
                  letterSpacing="0.04em"
                >
                  {activeMeta.script}
                </text>
              </g>
            </g>
          )}

          {/* Hover tooltip for other countries */}
          {hoveredId && hoveredId !== activeMeta.id && mapPathMap.get(hoveredId) && (
            (() => {
              const hPath = mapPathMap.get(hoveredId)!;
              const hCountry = countryDataMap.get(hoveredId);
              return (
                <g
                  className="auth-map__hover-tooltip"
                  transform={`translate(${hPath.centroid[0]}, ${hPath.centroid[1] - 14})`}
                  filter="url(#auth-tag-shadow)"
                  pointerEvents="none"
                >
                  <rect
                    x="-50"
                    y="-20"
                    width="100"
                    height="20"
                    rx="4"
                    fill="rgba(14, 28, 32, 0.92)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-7"
                    textAnchor="middle"
                    fill="#fffef9"
                    fontSize="9.5"
                    fontWeight="500"
                    fontFamily="var(--font-text, sans-serif)"
                  >
                    {hCountry?.nameId || hPath.name_id}
                  </text>
                </g>
              );
            })()
          )}

          {/* Cartographic Scale Legend in Bottom Corner */}
          <g className="auth-map__legend" transform="translate(24, 820)" aria-hidden="true">
            <line x1="0" y1="0" x2="100" y2="0" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <line x1="50" y1="-2" x2="50" y2="2" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            <line x1="100" y1="-3" x2="100" y2="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            <text x="110" y="3" className="auth-map__legend-text">
              SKALA 1:25.000.000 · LAMBERT EQUAL-AREA
            </text>
          </g>
        </svg>
      </div>

      {/* ── Country Selector Pills Strip ── */}
      <div className="auth-country-strip-wrap" aria-label="Pilih Negara Asia">
        <div className="auth-country-strip" ref={pillStripRef} role="tablist">
          {COUNTRY_AUTH_LIST.map((c, i) => {
            const isSelected = i === currentIndex;
            return (
              <button
                key={c.id}
                ref={isSelected ? activePillRef : null}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`auth-country-pill ${isSelected ? 'auth-country-pill--active' : ''}`}
                onClick={() => handleSelectCountry(c.id)}
              >
                <span className="auth-country-pill__dot" style={{ backgroundColor: c.color }} />
                <span className="auth-country-pill__label">{c.nameId}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Editorial Spotlight Card (Bottom Glass Drawer) ── */}
      <div className="auth-spotlight-card">
        {/* Emblem on the Left */}
        <div className="auth-spotlight-emblem-wrap">
          <div className="auth-spotlight-emblem" style={{ borderColor: activeMeta.color }}>
            <span className="auth-spotlight-emblem__script">{activeMeta.script}</span>
            <div className="auth-spotlight-emblem__compass-ring" aria-hidden="true" />
          </div>
        </div>

        {/* Content in the Center */}
        <div className="auth-spotlight-content">
          <div className="auth-spotlight-meta-row">
            <span className="auth-spotlight-region-badge">
              <Globe size={11} aria-hidden="true" />
              {activeMeta.region}
            </span>
            <span className="auth-spotlight-script-badge">
              {activeMeta.scriptType}
            </span>
          </div>

          <div className="auth-spotlight-title-row">
            <h3 className="auth-spotlight-country">
              {activeMeta.nameId}
              <span className="auth-spotlight-country__local">({activeMeta.nativeName})</span>
            </h3>
          </div>

          {/* Interactive Native Audio Greeting */}
          {activeCountryData && (
            <div className="auth-spotlight-greeting">
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
                  <Volume2 size={14} aria-hidden="true" />
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

          {/* Cultural Tagline */}
          <p className="auth-spotlight-tagline">
            <Sparkles size={12} className="auth-spotlight-tagline__icon" aria-hidden="true" />
            <span>{activeMeta.tagline}</span>
          </p>
        </div>

        {/* Tactical Navigation Controls on the Right */}
        <div className="auth-spotlight-controls">
          <div className="auth-spotlight-nav-btns">
            <button
              type="button"
              className="auth-spotlight-nav-btn"
              onClick={handlePrev}
              title="Negara Sebelumnya"
              aria-label="Negara Sebelumnya"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <span className="auth-spotlight-counter">
              {currentIndex + 1} / {COUNTRY_AUTH_LIST.length}
            </span>
            <button
              type="button"
              className="auth-spotlight-nav-btn"
              onClick={handleNext}
              title="Negara Berikutnya"
              aria-label="Negara Berikutnya"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Mini progress dots */}
          <div className="auth-spotlight-dots" role="tablist" aria-label="Indikator slide negara">
            {COUNTRY_AUTH_LIST.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={`auth-spotlight-dot ${i === currentIndex ? 'auth-spotlight-dot--active' : ''}`}
                onClick={() => handleSelectCountry(c.id)}
                aria-label={`Slide ${c.nameId}`}
              />
            ))}
          </div>
        </div>

        {/* Auto-rotation timer progress line */}
        {isAutoPlaying && Date.now() >= pauseUntil && (
          <div key={currentIndex} className="auth-spotlight-progress-line" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
