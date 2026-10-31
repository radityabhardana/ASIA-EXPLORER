import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  Play,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { getCountry, countries } from '@/content/countries';
import { LENGKAP_COUNTRY_IDS } from '@/content/quests';
import { getStoryQuest } from '@/data/story-quests';
import { loadQuestProgress, getDiscoveredEndings } from '@/lib/story-quest/storage';
import { NpcAvatarBadge } from '@/sections/quest/QuestIcons';
import { useExplorerStats } from '@/lib/useExplorerStats';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import '@/styles/dashboard.css';

interface CountryQuestStatus {
  status: 'completed' | 'in_progress' | 'ready';
  badgeLabel?: string;
  endingsCount?: number;
  highestEnding?: 'sahabat' | 'diterima' | 'canggung';
}

const REGIONS = [
  'Semua',
  'Asia Tenggara',
  'Asia Timur',
  'Asia Selatan',
  'Asia Barat',
  'Asia Tengah',
] as const;

export default function QuestHubPage() {
  const { profile, signOut } = useProfile();
  const profileId = profile?.id ?? '';

  const {
    lessons: _lessons,
    attempts,
    totalXP,
    streakDays,
    loading: _loading,
  } = useExplorerStats(profileId);

  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Status Story Quest untuk setiap negara
  const questStatusMap = useMemo(() => {
    const map = new Map<string, CountryQuestStatus>();

    for (const cid of LENGKAP_COUNTRY_IDS) {
      const discoveredEndings = profileId ? getDiscoveredEndings(profileId, cid) : [];
      const savedProgress = profileId ? loadQuestProgress(profileId, cid) : null;

      // Cek apakah ada attempt legacy yang sudah selesai jika belum ada di story-quest
      const legacyFinished = attempts.some((a) => a.countryId === cid && a.finishedAt !== null);

      if (discoveredEndings.length > 0 || legacyFinished) {
        let highest: 'sahabat' | 'diterima' | 'canggung' = 'diterima';
        if (discoveredEndings.includes('sahabat')) highest = 'sahabat';
        else if (discoveredEndings.includes('diterima')) highest = 'diterima';
        else if (discoveredEndings.includes('canggung')) highest = 'canggung';

        const tierName =
          highest === 'sahabat' ? 'Sahabat' : highest === 'diterima' ? 'Diterima' : 'Canggung';

        map.set(cid, {
          status: 'completed',
          badgeLabel: `${tierName} · ${discoveredEndings.length || 1}/3 Akhir`,
          endingsCount: discoveredEndings.length || 1,
          highestEnding: highest,
        });
      } else if (savedProgress && !savedProgress.finishedAt && savedProgress.currentSceneId) {
        map.set(cid, {
          status: 'in_progress',
          badgeLabel: 'Sedang Berjalan',
        });
      } else {
        map.set(cid, { status: 'ready', badgeLabel: 'Siap Mulai' });
      }
    }

    return map;
  }, [profileId, attempts]);

  const completedCount = Array.from(questStatusMap.values()).filter(
    (v) => v.status === 'completed',
  ).length;

  // Filtered Country IDs based on Region & Search
  const filteredCountryIds = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return LENGKAP_COUNTRY_IDS.filter((cid) => {
      const country = getCountry(cid);
      const storyQuest = getStoryQuest(cid);
      if (!country || !storyQuest) return false;

      // Region Filter
      if (selectedRegion !== 'Semua' && country.region !== selectedRegion) {
        return false;
      }

      // Search Query
      if (q) {
        const matchesName = country.nameId.toLowerCase().includes(q);
        const matchesCode = cid.toLowerCase().includes(q);
        const matchesTitle = storyQuest.judul.toLowerCase().includes(q);
        const matchesNpc = storyQuest.npc.nama.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesTitle && !matchesNpc) {
          return false;
        }
      }

      return true;
    });
  }, [selectedRegion, searchQuery]);

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
                <Compass size={13} aria-hidden="true" />
                PETUALANGAN BUDAYA INTERAKTIF
              </span>
              <span className="dashboard-header__status-badge">
                <Award size={13} aria-hidden="true" />
                {completedCount} dari {LENGKAP_COUNTRY_IDS.length} Petualangan Diselesaikan
              </span>
            </div>

            <h1 className="dashboard-header__title">Katalog Petualangan Budaya & Etiket</h1>
            <p className="dashboard-header__desc">
              Jelajahi simulasi visual novel interaktif di seluruh {LENGKAP_COUNTRY_IDS.length} negara Asia. Siapkan bekal, berdialog dengan
              tuan rumah lokal, dan tentukan alur serta akhir ceritamu.
            </p>
          </header>

          {/* Controls: Region Filter & Search Toolbar */}
          <div className="quest-hub-toolbar">
            <div className="dashboard-filter-bar" role="tablist" aria-label="Filter wilayah petualangan budaya">
              {REGIONS.map((region) => {
                const count =
                  region === 'Semua'
                    ? LENGKAP_COUNTRY_IDS.length
                    : countries.filter((c) => c.region === region && (LENGKAP_COUNTRY_IDS as readonly string[]).includes(c.id)).length;
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

            <div className="quest-hub-search-wrap" role="search">
              <Search size={15} className="quest-hub-search-icon" aria-hidden="true" />
              <input
                type="text"
                className="quest-hub-search-input"
                placeholder="Cari nama negara, kota, atau tuan rumah (NPC)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Cari petualangan budaya berdasarkan negara atau NPC"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="dashboard-search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  aria-label="Hapus kata kunci pencarian"
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--ink-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Quest Grid or Empty State */}
          {filteredCountryIds.length === 0 ? (
            <div className="quest-hub-empty">
              <p>Tidak ada petualangan budaya yang cocok dengan pencarian "{searchQuery}".</p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                onClick={() => {
                  setSelectedRegion('Semua');
                  setSearchQuery('');
                }}
                style={{ marginTop: 12 }}
              >
                Reset Filter & Pencarian
              </button>
            </div>
          ) : (
            <div className="quest-hub-grid">
              {filteredCountryIds.map((cid) => {
                const country = getCountry(cid);
                const storyQuest = getStoryQuest(cid);
                if (!country || !storyQuest) return null;

                const info = questStatusMap.get(cid) ?? { status: 'ready', badgeLabel: 'Siap Mulai' };

                return (
                  <div key={cid} className="dashboard-console-card quest-card">
                    <div className="dashboard-console-card__header">
                      <div className="dashboard-console-card__title-wrap">
                        <span
                          className="quest-card__country-dot"
                          style={{ backgroundColor: `var(--country-${cid}, var(--accent))` }}
                          aria-hidden="true"
                        />
                        <span className="dashboard-console-card__title">{country.nameId}</span>
                        <span
                          style={{
                            fontSize: '0.72rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'var(--ground, #f0eeea)',
                            color: 'var(--ink-muted, #5c6670)',
                            fontFamily: 'var(--font-text, sans-serif)',
                            marginLeft: 4,
                          }}
                        >
                          {country.region}
                        </span>
                      </div>

                      {info.status === 'completed' ? (
                        <span
                          className="dashboard-console-card__badge"
                          style={{ color: 'var(--accent)', borderColor: 'rgba(23, 107, 104, 0.3)' }}
                        >
                          <CheckCircle2 size={11} style={{ display: 'inline', marginRight: 4 }} />
                          {info.badgeLabel}
                        </span>
                      ) : info.status === 'in_progress' ? (
                        <span
                          className="dashboard-console-card__badge"
                          style={{ color: '#b45309', borderColor: 'rgba(217, 119, 6, 0.3)' }}
                        >
                          <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                          {info.badgeLabel}
                        </span>
                      ) : (
                        <span className="dashboard-console-card__badge">Siap Berpetualang</span>
                      )}
                    </div>

                    <div className="quest-card__body">
                      {/* NPC Strip Preview */}
                      <div className="quest-card__npc-strip">
                        <NpcAvatarBadge
                          avatar={storyQuest.npc.avatar}
                          nama={storyQuest.npc.nama}
                          countryId={cid}
                          size="small"
                        />
                        <div className="quest-card__npc-meta">
                          <strong>{storyQuest.npc.nama}</strong>
                          <span>{storyQuest.npc.peran}</span>
                        </div>
                      </div>

                      <h2 className="quest-card__story-title">{storyQuest.judul}</h2>

                      <p className="quest-card__note">
                        {storyQuest.pengantar.length > 120
                          ? `${storyQuest.pengantar.slice(0, 120)}...`
                          : storyQuest.pengantar}
                      </p>

                      <div className="quest-card__tags">
                        <span className="quest-card__tag">
                          <BookOpen size={11} /> {storyQuest.adegan.length} Adegan Cerita
                        </span>
                        <span className="quest-card__tag">
                          <Sparkles size={11} /> Maks +60 XP
                        </span>
                      </div>

                      <div className="quest-card__footer">
                        <Link
                          to={`/dashboard/quest/${cid}`}
                          className={`dashboard-btn ${
                            info.status === 'completed'
                              ? 'dashboard-btn--secondary'
                              : 'dashboard-btn--primary'
                          } dashboard-btn--small`}
                          style={{ width: '100%' }}
                          aria-label={
                            info.status === 'completed'
                              ? `Mainkan Ulang Petualangan ${country.nameId}`
                              : info.status === 'in_progress'
                              ? `Lanjutkan Petualangan ${country.nameId}`
                              : `Mulai Petualangan ${country.nameId}`
                          }
                        >
                          {info.status === 'completed' ? (
                            <>
                              <RotateCcw size={14} />
                              <span>Jelajahi Cabang Lain</span>
                            </>
                          ) : (
                            <>
                              <Play size={14} />
                              <span>Mulai Petualangan</span>
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
