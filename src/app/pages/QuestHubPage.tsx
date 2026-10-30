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
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { getCountry } from '@/content/countries';
import { LENGKAP_COUNTRY_IDS } from '@/content/quests';
import { getStoryQuest } from '@/data/story-quests';
import { loadQuestProgress, getDiscoveredEndings } from '@/lib/story-quest/storage';
import { NpcAvatarBadge } from '@/sections/quest/QuestIcons';
import { getAttemptsByProfile, getLessonsByProfile } from '@/lib/storage/db';
import type { Attempt, LessonProgress } from '@/lib/storage/types';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import '@/styles/dashboard.css';

interface CountryQuestStatus {
  status: 'completed' | 'in_progress' | 'ready';
  badgeLabel?: string;
  endingsCount?: number;
  highestEnding?: 'sahabat' | 'diterima' | 'canggung';
}

export default function QuestHubPage() {
  const { profile, signOut } = useProfile();
  const profileId = profile?.id ?? '';

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    let isMounted = true;

    Promise.all([
      getAttemptsByProfile(profileId),
      getLessonsByProfile(profileId),
    ])
      .then(([att, les]) => {
        if (!isMounted) return;
        setAttempts(att);
        setLessons(les);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileId]);

  // Compute Total XP
  const bonusXP = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(`xp_bonus_${profileId}`) ?? '0');
  }, [profileId]);

  const totalXP = useMemo(() => {
    let xp = 0;
    for (const l of lessons) {
      xp += (l.stepsDone?.length ?? 0) * 25;
    }
    for (const a of attempts) {
      if (a.finishedAt) {
        const correctCount = a.answers.filter((ans) => ans.correct).length;
        xp += correctCount * 10;
      }
    }
    return xp + bonusXP;
  }, [lessons, attempts, bonusXP]);

  const streakDays = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(`streak_${profileId}`);
    return saved ? Number(saved) : 1;
  }, [profileId]);

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
                {completedCount} dari 10 Petualangan Diselesaikan
              </span>
            </div>

            <h1 className="dashboard-header__title">Katalog Petualangan Budaya & Etiket</h1>
            <p className="dashboard-header__desc">
              Jelajahi simulasi visual novel interaktif di 10 negara Asia. Siapkan bekal, berdialog dengan
              tuan rumah lokal, dan tentukan alur serta akhir ceritamu.
            </p>
          </header>

          {/* Quest Grid */}
          <div className="quest-hub-grid">
            {LENGKAP_COUNTRY_IDS.map((cid) => {
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
                            <span>{info.status === 'in_progress' ? 'Lanjutkan Petualangan' : 'Mulai Petualangan'}</span>
                          </>
                        )}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
