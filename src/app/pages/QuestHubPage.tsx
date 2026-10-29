import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Swords,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { getCountry } from '@/content/countries';
import { LENGKAP_COUNTRY_IDS, getQuestItemsForCountry } from '@/content/quests';
import { getAttemptsByProfile, getLessonsByProfile } from '@/lib/storage/db';
import type { Attempt, LessonProgress } from '@/lib/storage/types';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import '@/styles/dashboard.css';

export default function QuestHubPage() {
  const { profile, signOut } = useProfile();
  const { t: _t } = useI18n();
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

  const questStatusMap = useMemo(() => {
    const map = new Map<string, { status: 'completed' | 'in_progress' | 'ready'; attemptId?: string; score?: string }>();
    for (const cid of LENGKAP_COUNTRY_IDS) {
      const countryAttempts = attempts.filter((a) => a.countryId === cid);
      const finished = countryAttempts.filter((a) => a.finishedAt !== null);
      const inProgress = countryAttempts.find((a) => a.finishedAt === null);

      if (inProgress) {
        map.set(cid, { status: 'in_progress', attemptId: inProgress.id });
      } else if (finished.length > 0) {
        const latest = finished[finished.length - 1]!;
        const correct = latest.answers.filter((a) => a.correct).length;
        const total = latest.itemIds.length || latest.answers.length || 1;
        map.set(cid, {
          status: 'completed',
          attemptId: latest.id,
          score: `${correct}/${total} (${Math.round((correct / total) * 100)}%)`,
        });
      } else {
        map.set(cid, { status: 'ready' });
      }
    }
    return map;
  }, [attempts]);

  const completedCount = Array.from(questStatusMap.values()).filter((v) => v.status === 'completed').length;

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
                <Swords size={13} aria-hidden="true" />
                ARENA EVALUASI KULTURAL
              </span>
              <span className="dashboard-header__status-badge">
                <Award size={13} aria-hidden="true" />
                {completedCount} dari 10 Quest Diselesaikan
              </span>
            </div>

            <h1 className="dashboard-header__title">Katalog Quest Budaya & Etiket</h1>
            <p className="dashboard-header__desc">
              Uji ketajaman pemahaman norma sosial, sapaan kesantunan, dan skenario percabangan untuk 10 negara berstatus Lengkap.
            </p>
          </header>

          {/* Quest Grid */}
          <div className="quest-hub-grid">
            {LENGKAP_COUNTRY_IDS.map((cid) => {
              const country = getCountry(cid);
              if (!country) return null;
              const items = getQuestItemsForCountry(cid);
              const info = questStatusMap.get(cid) ?? { status: 'ready' };

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
                      <span className="dashboard-console-card__badge" style={{ color: 'var(--accent)', borderColor: 'rgba(23, 107, 104, 0.3)' }}>
                        <CheckCircle2 size={11} style={{ display: 'inline', marginRight: 4 }} />
                        Selesai · {info.score}
                      </span>
                    ) : info.status === 'in_progress' ? (
                      <span className="dashboard-console-card__badge" style={{ color: '#b45309', borderColor: 'rgba(217, 119, 6, 0.3)' }}>
                        <Clock size={11} style={{ display: 'inline', marginRight: 4 }} />
                        Berjalan
                      </span>
                    ) : (
                      <span className="dashboard-console-card__badge">
                        Siap Mulai
                      </span>
                    )}
                  </div>

                  <div className="quest-card__body">
                    <div className="quest-card__meta">
                      <span>{country.region}</span>
                      <span>·</span>
                      <span className="quest-card__native">{country.greeting.native}</span>
                    </div>

                    <p className="quest-card__note">
                      {country.cultureNote.slice(0, 120)}...
                    </p>

                    <div className="quest-card__tags">
                      <span className="quest-card__tag">
                        <BookOpen size={11} /> {items.length} Soal Evaluasi
                      </span>
                      <span className="quest-card__tag">
                        <Sparkles size={11} /> +{items.length * 10} XP
                      </span>
                    </div>

                    <div className="quest-card__footer">
                      <Link
                        to={`/dashboard/quest/${cid}`}
                        className={`dashboard-btn ${info.status === 'completed' ? 'dashboard-btn--secondary' : 'dashboard-btn--primary'} dashboard-btn--small`}
                        style={{ width: '100%' }}
                      >
                        <Swords size={14} />
                        <span>{info.status === 'completed' ? 'Ulangi Quest' : info.status === 'in_progress' ? 'Lanjutkan Quest' : 'Mulai Quest'}</span>
                        <ArrowRight size={13} />
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
