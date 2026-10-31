import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Search,
  Check,
  Sparkles,
  Volume2,
  BookOpen,
  Swords,
  ExternalLink,
  ArrowRight,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { countries } from '@/content/countries';
import { isLengkapCountry } from '@/content/quests';
import { speak, isSpeechSupported } from '@/lib/speech';
import { profileFor } from '@/sections/country/scripts';
import type { LessonProgress } from '@/lib/storage/types';
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

export default function CountryModulesPage() {
  const { profile, signOut } = useProfile();
  const { t: _t } = useI18n();
  const profileId = profile?.id ?? '';

  const { lessons, attempts: _attempts, reviews, totalXP, streakDays, loading } =
    useExplorerStats(profileId);

  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [selectedDepth, setSelectedDepth] = useState<'all' | 'lengkap' | 'penjelajahan'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const lessonMap = useMemo(() => {
    const map = new Map<string, LessonProgress>();
    for (const l of lessons) {
      map.set(l.countryId, l);
    }
    return map;
  }, [lessons]);

  const completedCount = useMemo(() => {
    return lessons.filter((l) => l.stepsDone?.length === 4).length;
  }, [lessons]);

  // Filter countries
  const filteredCountries = useMemo(() => {
    return countries.filter((c) => {
      // Region filter
      if (selectedRegion !== 'Semua' && c.region !== selectedRegion) {
        return false;
      }
      // Depth filter
      const isLengkap = isLengkapCountry(c.id);
      if (selectedDepth === 'lengkap' && !isLengkap) return false;
      if (selectedDepth === 'penjelajahan' && isLengkap) return false;
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = c.nameId.toLowerCase().includes(query);
        const matchLocal = c.nameLocal.toLowerCase().includes(query);
        const matchRegion = c.region.toLowerCase().includes(query);
        const matchLanguage = c.language.nameId.toLowerCase().includes(query);
        if (!matchName && !matchLocal && !matchRegion && !matchLanguage) {
          return false;
        }
      }
      return true;
    });
  }, [selectedRegion, selectedDepth, searchQuery]);

  // Greeting speak handler
  const handleSpeak = (countryId: string, text: string, romanText: string) => {
    const country = countries.find((c) => c.id === countryId);
    if (!country || !isSpeechSupported()) return;
    const profileScript = profileFor(country);

    setSpeakingId(countryId);
    speak(text, {
      lang: profileScript.speechLang,
      fallbackText: romanText,
      rate: 0.9,
      onEnd: () => setSpeakingId((cur) => (cur === countryId ? null : cur)),
      onError: () => setSpeakingId((cur) => (cur === countryId ? null : cur)),
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

      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Header */}
          <header className="dashboard-header">
            <div className="dashboard-header__top-row">
              <span className="dashboard-header__eyebrow">
                <Globe size={13} aria-hidden="true" />
                KURIKULUM BERJENJANG ASIA
              </span>
              <span className="dashboard-header__status-badge">
                <Sparkles size={13} aria-hidden="true" />
                48 Negara Terintegrasi Penuh
              </span>
            </div>

            <h1 className="dashboard-header__title">Katalog Modul Negara & Kurikulum</h1>
            <p className="dashboard-header__desc">
              Eksplorasi modul pembelajaran bertingkat 4 tahap: Kenali Identitas, Norma Etiket Sosial,
              Tata Bahasa & Aksara Asli, serta Evaluasi Quest Budaya.
            </p>
          </header>

          {/* Stats Ribbon */}
          <div className="dashboard-stats-ribbon" role="region" aria-label="Ringkasan Modul">
            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap">
                <Globe size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Total Modul</span>
                <span className="dashboard-stat-tile__value">48 Negara</span>
                <span className="dashboard-stat-tile__sub">Seluruh Kawasan Asia</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--amber">
                <GraduationCap size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Kurikulum 4 Tahap</span>
                <span className="dashboard-stat-tile__value">48 Negara</span>
                <span className="dashboard-stat-tile__sub">Status Lengkap</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--terracotta">
                <Check size={20} strokeWidth={2.2} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Modul Selesai</span>
                <span className="dashboard-stat-tile__value">{completedCount} / 48</span>
                <span className="dashboard-stat-tile__sub">Tuntas Semua Tahap</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--slate">
                <Layers size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Vault Frasa</span>
                <span className="dashboard-stat-tile__value">{reviews.length} Frasa</span>
                <span className="dashboard-stat-tile__sub">Spaced Repetition</span>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="country-modules__controls">
            {/* Search Input */}
            <div className="country-modules__search-wrap">
              <Search size={16} className="country-modules__search-icon" aria-hidden="true" />
              <input
                type="text"
                className="country-modules__search-input"
                placeholder="Cari negara, aksara, atau wilayah (mis. Jepang, Hangul, Asia Timur)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari modul negara"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="country-modules__search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus pencarian"
                >
                  &times;
                </button>
              )}
            </div>

            {/* Depth Selector Buttons */}
            <div className="country-modules__depth-filter" role="radiogroup" aria-label="Filter status kedalaman modul">
              <button
                type="button"
                role="radio"
                aria-checked={selectedDepth === 'all'}
                className={`country-modules__depth-btn ${selectedDepth === 'all' ? 'country-modules__depth-btn--active' : ''}`}
                onClick={() => setSelectedDepth('all')}
              >
                Semua ({countries.length})
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedDepth === 'lengkap'}
                className={`country-modules__depth-btn ${selectedDepth === 'lengkap' ? 'country-modules__depth-btn--active' : ''}`}
                onClick={() => setSelectedDepth('lengkap')}
              >
                4 Tahap Lengkap ({countries.filter((c) => isLengkapCountry(c.id)).length})
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={selectedDepth === 'penjelajahan'}
                className={`country-modules__depth-btn ${selectedDepth === 'penjelajahan' ? 'country-modules__depth-btn--active' : ''}`}
                onClick={() => setSelectedDepth('penjelajahan')}
              >
                Penjelajahan Atlas ({countries.filter((c) => !isLengkapCountry(c.id)).length})
              </button>
            </div>
          </div>

          {/* Region Tabs */}
          <div className="dashboard-filter-bar" role="tablist" aria-label="Filter kawasan benua Asia">
            {REGIONS.map((region) => {
              const count = region === 'Semua' ? countries.length : countries.filter((c) => c.region === region).length;
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

          {/* Modules Grid */}
          {loading ? (
            <div className="dashboard-loading" role="status">
              <p className="dashboard-loading__text">Memuat katalog modul negara...</p>
            </div>
          ) : filteredCountries.length === 0 ? (
            <div className="country-modules__empty">
              <p className="country-modules__empty-title">Tidak ada modul yang sesuai dengan kriteria.</p>
              <p className="country-modules__empty-desc">Coba gunakan kata kunci pencarian yang lain atau ubah filter wilayah.</p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                onClick={() => {
                  setSelectedRegion('Semua');
                  setSelectedDepth('all');
                  setSearchQuery('');
                }}
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="country-modules-grid">
              {filteredCountries.map((country) => {
                const isLengkap = isLengkapCountry(country.id);
                const lesson = lessonMap.get(country.id);
                const stepsDone = lesson?.stepsDone ?? [];
                const percentDone = isLengkap ? Math.round((stepsDone.length / 4) * 100) : 100;
                const isSpeaking = speakingId === country.id;

                return (
                  <article key={country.id} className="dashboard-console-card country-module-card">
                    {/* Console Header */}
                    <div className="dashboard-console-card__header">
                      <div className="dashboard-console-card__title-wrap">
                        <span
                          className="country-module-card__palette-dot"
                          style={{ backgroundColor: `var(--country-${country.id}, var(--accent))` }}
                          aria-hidden="true"
                        />
                        <span className="dashboard-console-card__title">{country.nameId}</span>
                        <span className="country-module-card__local-name">({country.nameLocal})</span>
                      </div>
                      <span
                        className="dashboard-console-card__badge"
                        style={
                          isLengkap
                            ? { color: 'var(--accent)', borderColor: 'rgba(23, 107, 104, 0.25)' }
                            : { color: 'var(--ink-muted)', borderColor: 'var(--line)' }
                        }
                      >
                        {isLengkap ? '4 Tahap' : 'Penjelajahan'}
                      </span>
                    </div>

                    <div className="country-module-card__body">
                      {/* Region & Greeting Row */}
                      <div className="country-module-card__top-meta">
                        <span className="country-module-card__region">{country.region}</span>
                        <span className="country-module-card__sep">·</span>
                        <button
                          type="button"
                          className="dashboard-country-row__greeting-speak"
                          onClick={() =>
                            handleSpeak(
                              country.id,
                              country.greeting.native,
                              country.greeting.roman,
                            )
                          }
                          title="Dengarkan pengucapan sapaan asli"
                          aria-label={`Dengarkan sapaan asli ${country.nameId}`}
                        >
                          <Volume2
                            size={13}
                            className={isSpeaking ? 'dashboard-btn-icon--active' : ''}
                          />
                          <span className="country-module-card__native-greeting">
                            {country.greeting.native}
                          </span>
                        </button>
                      </div>

                      {/* Language & Script snippet */}
                      <div className="country-module-card__lang-box">
                        <div className="country-module-card__lang-row">
                          <span className="country-module-card__lang-label">Aksara & Bahasa:</span>
                          <span className="country-module-card__lang-value">
                            {country.language.nameId} ({country.language.script})
                          </span>
                        </div>
                        <div className="country-module-card__lang-row">
                          <span className="country-module-card__lang-label">Sapaan:</span>
                          <span className="country-module-card__lang-value">
                            <em>{country.greeting.roman}</em> — &ldquo;{country.greeting.meaningId}&rdquo;
                          </span>
                        </div>
                      </div>

                      {/* Culture note snippet */}
                      <p className="country-module-card__culture-note">
                        {country.cultureNote.slice(0, 140)}...
                      </p>

                      {/* 4-Step Progressive Learning Status */}
                      {isLengkap ? (
                        <div className="country-module-card__progress-section">
                          <div className="country-module-card__progress-label">
                            <span>Kemajuan Modul</span>
                            <strong>{stepsDone.length} / 4 Selesai ({percentDone}%)</strong>
                          </div>

                          <div className="country-module-card__progress-track" role="progressbar" aria-valuenow={percentDone}>
                            <div
                              className="country-module-card__progress-fill"
                              style={{ width: `${percentDone}%` }}
                            />
                          </div>

                          <div className="country-module-card__steps-chips" aria-label={`Daftar tahap pelajaran ${country.nameId}`}>
                            {(['kenali', 'etiket', 'bahasa', 'quest'] as const).map((stepKey, idx) => {
                              const done = stepsDone.includes(stepKey);
                              return (
                                <Link
                                  key={stepKey}
                                  to={
                                    stepKey === 'quest'
                                      ? `/dashboard/quest/${country.id}`
                                      : `/dashboard/pelajaran/${country.id}/${stepKey}`
                                  }
                                  className={`country-module-card__step-chip ${done ? 'country-module-card__step-chip--done' : ''}`}
                                  title={`Buka langkah ${idx + 1}: ${stepKey}`}
                                >
                                  {done ? (
                                    <Check size={11} strokeWidth={2.5} aria-hidden="true" />
                                  ) : (
                                    <span className="country-module-card__step-num">{idx + 1}</span>
                                  )}
                                  <span>{stepKey}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="country-module-card__penjelajahan-badge">
                          <BookOpen size={13} aria-hidden="true" />
                          <span>Modul Eksplorasi Atlas & Budaya Komprehensif</span>
                        </div>
                      )}

                      {/* Action CTA Buttons */}
                      <div className="country-module-card__footer">
                        {isLengkap ? (
                          <>
                            <Link
                              to={`/dashboard/session/${country.id}`}
                              className="dashboard-btn dashboard-btn--primary dashboard-btn--small"
                              style={{ flex: 1 }}
                            >
                              <BookOpen size={14} />
                              <span>{stepsDone.length > 0 ? 'Lanjutkan Sesi' : 'Mulai Sesi'}</span>
                              <ArrowRight size={13} />
                            </Link>

                            <Link
                              to={`/dashboard/quest/${country.id}`}
                              className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                              title="Evaluasi kuis & skenario etiket"
                            >
                              <Swords size={14} />
                              <span>Quest</span>
                            </Link>
                          </>
                        ) : (
                          <Link
                            to={`/negara/${country.id}`}
                            state={{ from: '/dashboard/negara' }}
                            className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                            style={{ width: '100%' }}
                          >
                            <ExternalLink size={14} />
                            <span>Buka Atlas Budaya Lengkap</span>
                            <ArrowRight size={13} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
