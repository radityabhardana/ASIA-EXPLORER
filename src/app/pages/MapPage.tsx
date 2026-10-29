import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Map as MapIcon,
  Volume2,
  BookOpen,
  Swords,
  ExternalLink,
  Compass,
  Sparkles,
  ArrowRight,
  Globe,
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { countries, getCountry } from '@/content/countries';
import { isLengkapCountry } from '@/content/quests';
import CountryMapSvg from '@/sections/landing/CountryMapSvg';
import { profileFor } from '@/sections/country/scripts';
import { speak, isSpeechSupported } from '@/lib/speech';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import { useExplorerStats } from '@/lib/useExplorerStats';
import '@/styles/dashboard.css';

const REGIONS = [
  'Semua',
  'Asia Tenggara',
  'Asia Timur',
  'Asia Selatan',
  'Asia Barat',
  'Asia Tengah',
] as const;

export default function MapPage() {
  const { profile, signOut } = useProfile();
  const profileId = profile?.id ?? '';
  const { totalXP, streakDays } = useExplorerStats(profileId);

  const [selectedCountryId, setSelectedCountryId] = useState<string>('id');
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [speaking, setSpeaking] = useState(false);

  const selectedCountry = useMemo(() => {
    return getCountry(selectedCountryId) ?? countries[0]!;
  }, [selectedCountryId]);

  const profileScript = useMemo(() => {
    return profileFor(selectedCountry);
  }, [selectedCountry]);

  const isLengkap = isLengkapCountry(selectedCountry.id);

  // Filter countries by region
  const filteredCountries = useMemo(() => {
    if (selectedRegion === 'Semua') return countries;
    return countries.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  const handleSpeak = () => {
    if (!isSpeechSupported() || speaking) return;
    setSpeaking(true);
    speak(selectedCountry.greeting.native, {
      lang: profileScript.speechLang,
      fallbackText: selectedCountry.greeting.roman,
      rate: 0.9,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  return (
    <div className="dashboard-layout">
      <DashboardSidebar
        profile={profile}
        totalXP={totalXP}
        streakDays={streakDays}
        onSignOut={signOut}
      />

      <main className="dashboard-main map-page-main">
        <div className="dashboard-container">
          {/* Header */}
          <header className="dashboard-header">
            <div className="dashboard-header__top-row">
              <span className="dashboard-header__eyebrow">
                <MapIcon size={13} aria-hidden="true" />
                KARTOGRAFI INTERAKTIF
              </span>
              <span className="dashboard-header__status-badge">
                <Globe size={13} aria-hidden="true" />
                15 Negara Asia
              </span>
            </div>

            <h1 className="dashboard-header__title">Peta Interaktif Benua Asia</h1>
            <p className="dashboard-header__desc">
              Eksplorasi kontur dan batas wilayah benua Asia. Klik negara mana pun pada peta untuk memeriksa ragam aksara, sapaan asli, dan kurikulum kultural.
            </p>
          </header>

          {/* Region Tabs */}
          <div className="dashboard-filter-bar" role="tablist" aria-label="Filter wilayah">
            {REGIONS.map((region) => {
              const count = region === 'Semua' ? 15 : countries.filter((c) => c.region === region).length;
              const isActive = selectedRegion === region;
              return (
                <button
                  key={region}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`dashboard-filter-pill ${isActive ? 'dashboard-filter-pill--active' : ''}`}
                  onClick={() => setSelectedRegion(region)}
                >
                  {region} ({count})
                </button>
              );
            })}
          </div>

          {/* Map & Detail Layout */}
          <div className="map-page__grid">
            {/* SVG Map Stage Card */}
            <div className="dashboard-console-card map-stage-card">
              <div className="dashboard-console-card__header">
                <div className="dashboard-console-card__title-wrap">
                  <Compass size={15} className="dashboard-console-card__icon" aria-hidden="true" />
                  <span className="dashboard-console-card__title">Kanvas Kartografi Benua</span>
                </div>
                <span className="dashboard-console-card__badge">Klik untuk Memilih</span>
              </div>

              <div className="map-stage-card__svg-wrapper">
                <CountryMapSvg
                  variant="interactive"
                  className="dashboard-map-svg"
                  onSelect={(id) => setSelectedCountryId(id)}
                />
              </div>

              {/* Quick Country Buttons Bar */}
              <div className="map-stage-card__country-strip">
                {filteredCountries.map((c) => {
                  const isSelected = c.id === selectedCountryId;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      className={`map-strip-pill ${isSelected ? 'map-strip-pill--active' : ''}`}
                      onClick={() => setSelectedCountryId(c.id)}
                    >
                      <span
                        className="map-strip-pill__color"
                        style={{ backgroundColor: `var(--country-${c.id}, var(--accent))` }}
                      />
                      <span>{c.nameId}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Inspector Panel */}
            <aside className="dashboard-console-card map-inspector-card" aria-label="Detail Negara Terpilih">
              <div className="dashboard-console-card__header">
                <div className="dashboard-console-card__title-wrap">
                  <Sparkles size={15} className="dashboard-console-card__icon" aria-hidden="true" />
                  <span className="dashboard-console-card__title">Profil Negara</span>
                </div>
                <span className="dashboard-console-card__badge">
                  {isLengkap ? 'Kurikulum 4 Tahap' : 'Penjelajahan Atlas'}
                </span>
              </div>

              <div className="map-inspector-card__body">
                {/* Header Profile */}
                <div className="map-inspector-card__identity">
                  <div
                    className="map-inspector-card__badge-color"
                    style={{ backgroundColor: `var(--country-${selectedCountry.id}, var(--accent))` }}
                    aria-hidden="true"
                  />
                  <div>
                    <h2 className="map-inspector-card__name">{selectedCountry.nameId}</h2>
                    <span className="map-inspector-card__region">{selectedCountry.region}</span>
                  </div>
                </div>

                {/* Native Script Box */}
                <div className="map-inspector-card__script-box">
                  <div className="map-inspector-card__script-label">Sapaan Asli & Aksara</div>
                  <div className="map-inspector-card__native-row">
                    <span className="map-inspector-card__native" lang={profileScript.speechLang.split('-')[0]}>
                      {selectedCountry.greeting.native}
                    </span>
                    <button
                      type="button"
                      onClick={handleSpeak}
                      className={`dashboard-btn-icon ${speaking ? 'dashboard-btn-icon--active' : ''}`}
                      title="Dengarkan pengucapan sapaan"
                      aria-label={`Dengarkan pengucapan ${selectedCountry.greeting.native}`}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                  <div className="map-inspector-card__roman">
                    <span>{selectedCountry.greeting.roman}</span>
                    <span className="map-inspector-card__separator">·</span>
                    <span className="map-inspector-card__meaning">{selectedCountry.greeting.meaningId}</span>
                  </div>
                </div>

                {/* Cultural Narrative Summary */}
                <div className="map-inspector-card__notes">
                  <div className="map-inspector-card__note-item">
                    <span className="map-inspector-card__note-title">Keluarga Bahasa:</span>
                    <p className="map-inspector-card__note-text">{selectedCountry.language.family}</p>
                  </div>
                  <div className="map-inspector-card__note-item">
                    <span className="map-inspector-card__note-title">Aksara Resmi:</span>
                    <p className="map-inspector-card__note-text">{selectedCountry.language.script}</p>
                  </div>
                  <div className="map-inspector-card__note-item">
                    <span className="map-inspector-card__note-title">Sorotan Kultural:</span>
                    <p className="map-inspector-card__note-text">{selectedCountry.cultureNote}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="map-inspector-card__actions">
                  {isLengkap ? (
                    <>
                      <Link
                        to={`/dashboard/pelajaran/${selectedCountry.id}/kenali`}
                        className="dashboard-btn dashboard-btn--primary"
                      >
                        <BookOpen size={15} />
                        <span>Mulai Pelajaran</span>
                        <ArrowRight size={14} />
                      </Link>

                      <Link
                        to={`/dashboard/quest/${selectedCountry.id}`}
                        className="dashboard-btn dashboard-btn--secondary"
                      >
                        <Swords size={15} />
                        <span>Quest Budaya</span>
                      </Link>
                    </>
                  ) : null}

                  <Link
                    to={`/negara/${selectedCountry.id}`}
                    state={{ from: '/dashboard/peta' }}
                    className="dashboard-btn dashboard-btn--secondary"
                  >
                    <ExternalLink size={15} />
                    <span>Buka Atlas Penuh</span>
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
