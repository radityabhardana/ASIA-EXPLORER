import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Sparkles,
  Flame,
  GraduationCap,
  Layers,
  Award,
  Clock,
  Calendar,
  AlertCircle,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { getLevelInfo, getXPProgress } from '@/lib/xp';
import { getAttemptsByProfile, getLessonsByProfile, getReviewsByProfile } from '@/lib/storage/db';
import type { Attempt, LessonProgress, PhraseReview } from '@/lib/storage/types';
import { computeLearningDNA, computeWeakSpots } from '@/lib/learningDna';
import { getCountry } from '@/content/countries';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import LearningDnaChart from '@/app/components/LearningDnaChart';
import '@/styles/dashboard.css';

export default function ProfilePage() {
  const { profile, signOut } = useProfile();
  const profileId = profile?.id ?? '';

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [reviews, setReviews] = useState<PhraseReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    let isMounted = true;

    Promise.all([
      getAttemptsByProfile(profileId),
      getLessonsByProfile(profileId),
      getReviewsByProfile(profileId),
    ])
      .then(([att, les, revs]) => {
        if (!isMounted) return;
        setAttempts(att);
        setLessons(les);
        setReviews(revs);
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

  const levelInfo = getLevelInfo(totalXP);
  const xpProgress = getXPProgress(totalXP);

  // Compute Learning DNA & Weak Spots
  const dna = useMemo(() => {
    return computeLearningDNA(
      profileId,
      attempts.map((a) => {
        const correct = a.answers.filter((ans) => ans.correct).length;
        const total = a.itemIds.length || a.answers.length || 10;
        return {
          correct,
          total,
          durationMs:
            a.durationMs ??
            (a.finishedAt && a.startedAt ? a.finishedAt - a.startedAt : undefined),
          type: 'quiz',
        };
      }),
    );
  }, [profileId, attempts]);

  const weakSpots = useMemo(() => {
    return computeWeakSpots(
      attempts.map((a) => {
        const correct = a.answers.filter((ans) => ans.correct).length;
        const total = a.itemIds.length || a.answers.length || 10;
        return {
          topic: a.countryId,
          correct,
          total,
        };
      }),
    );
  }, [attempts]);

  const completedLessons = useMemo(() => {
    return lessons.filter((l) => l.stepsDone?.length === 4);
  }, [lessons]);

  const finishedAttempts = useMemo(() => {
    return attempts
      .filter((a) => a.finishedAt !== null)
      .sort((a, b) => (b.finishedAt ?? 0) - (a.finishedAt ?? 0));
  }, [attempts]);

  const displayName = profile?.displayName ?? 'Penjelajah Asia';

  if (loading) {
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
            <div className="dashboard-loading" role="status">
              <p className="dashboard-loading__text">Memuat profil...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                <UserIcon size={13} aria-hidden="true" />
                IDENTITAS & STATISTIK
              </span>
              <span className="dashboard-header__status-badge">
                <Sparkles size={13} aria-hidden="true" />
                Tingkat {levelInfo.level} · {levelInfo.name}
              </span>
            </div>

            <h1 className="dashboard-header__title">Profil Penjelajah & Rekam Jejak</h1>
            <p className="dashboard-header__desc">
              Analisis komprehensif performa kognitif, penguasaan etiket, dan riwayat eksplorasi benua Asia.
            </p>
          </header>

          {/* User Identity Banner */}
          <section className="dashboard-console-card profile-banner-card" aria-label="Identitas Pengguna">
            <div className="profile-banner-card__inner">
              <div className="profile-banner-card__avatar" aria-hidden="true">
                {displayName.slice(0, 2).toUpperCase()}
              </div>
              <div className="profile-banner-card__info">
                <div className="profile-banner-card__title-row">
                  <h2 className="profile-banner-card__name">{displayName}</h2>
                  <span className="dsidebar__level-pill">
                    <Award size={12} aria-hidden="true" />
                    Lv.{levelInfo.level} {levelInfo.name}
                  </span>
                </div>
                <p className="profile-banner-card__meta">
                  <span>ID Pengguna: {profileId.slice(0, 8)}...</span>
                  <span>·</span>
                  <span>Penyimpanan Lokal IndexedDB (0 Pelacak)</span>
                </p>

                {/* Level progress bar */}
                <div className="profile-banner-card__progress-wrap">
                  <div className="profile-banner-card__progress-label">
                    <span>Progres Menuju Level Berikutnya</span>
                    <span>{Math.round(xpProgress * 100)}%</span>
                  </div>
                  <div className="dsidebar__xp-bar" role="progressbar" aria-valuenow={Math.round(xpProgress * 100)}>
                    <div className="dsidebar__xp-bar-fill" style={{ width: `${Math.round(xpProgress * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Ribbon */}
          <div className="dashboard-stats-ribbon" style={{ marginTop: 24 }}>
            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap">
                <Sparkles size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Akumulasi XP</span>
                <span className="dashboard-stat-tile__value">{totalXP}</span>
                <span className="dashboard-stat-tile__sub">Poin Prestasi</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--amber">
                <Flame size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Streak Harian</span>
                <span className="dashboard-stat-tile__value">{streakDays} Hari</span>
                <span className="dashboard-stat-tile__sub">Retensi Disiplin</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--terracotta">
                <GraduationCap size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Modul Selesai</span>
                <span className="dashboard-stat-tile__value">{completedLessons.length} / 10</span>
                <span className="dashboard-stat-tile__sub">Negara Lengkap</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--slate">
                <Layers size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Memori Frasa</span>
                <span className="dashboard-stat-tile__value">{reviews.length} Frasa</span>
                <span className="dashboard-stat-tile__sub">Phrase Vault Aktif</span>
              </div>
            </div>
          </div>

          {/* Learning DNA & Dimensional Breakdown */}
          <section className="dashboard-console-card profile-dna-card" style={{ marginTop: 28 }}>
            <div className="dashboard-console-card__header">
              <div className="dashboard-console-card__title-wrap">
                <TrendingUp size={15} className="dashboard-console-card__icon" aria-hidden="true" />
                <span className="dashboard-console-card__title">Analisis Dimensi Kognitif (Learning DNA)</span>
              </div>
              <span className="dashboard-console-card__badge">5 Pilar Pembelajaran</span>
            </div>

            <div className="profile-dna-card__grid">
              <div>
                <LearningDnaChart dna={dna} size={280} />
              </div>

              <div className="profile-dna-card__details">
                <h3 className="profile-dna-card__details-title">Evaluasi Indeks Pembelajaran</h3>
                <p className="profile-dna-card__details-desc">
                  Setiap dimensi dinilai berdasarkan akurasi kuis, kecepatan respons, dan interval pengulangan.
                </p>

                <div className="profile-dna-card__metrics">
                  <div className="profile-dna-metric">
                    <div className="profile-dna-metric__header">
                      <span>Mendengarkan (Listening)</span>
                      <strong>{dna.listening}%</strong>
                    </div>
                    <div className="profile-dna-metric__bar">
                      <div className="profile-dna-metric__bar-fill" style={{ width: `${dna.listening}%` }} />
                    </div>
                  </div>

                  <div className="profile-dna-metric">
                    <div className="profile-dna-metric__header">
                      <span>Membaca Aksara (Reading)</span>
                      <strong>{dna.reading}%</strong>
                    </div>
                    <div className="profile-dna-metric__bar">
                      <div className="profile-dna-metric__bar-fill" style={{ width: `${dna.reading}%` }} />
                    </div>
                  </div>

                  <div className="profile-dna-metric">
                    <div className="profile-dna-metric__header">
                      <span>Pemahaman Budaya (Cultural)</span>
                      <strong>{dna.cultural}%</strong>
                    </div>
                    <div className="profile-dna-metric__bar">
                      <div className="profile-dna-metric__bar-fill" style={{ width: `${dna.cultural}%` }} />
                    </div>
                  </div>

                  <div className="profile-dna-metric">
                    <div className="profile-dna-metric__header">
                      <span>Kecepatan Berpikir (Quiz Speed)</span>
                      <strong>{dna.quizSpeed}%</strong>
                    </div>
                    <div className="profile-dna-metric__bar">
                      <div className="profile-dna-metric__bar-fill" style={{ width: `${dna.quizSpeed}%` }} />
                    </div>
                  </div>

                  <div className="profile-dna-metric">
                    <div className="profile-dna-metric__header">
                      <span>Konsistensi Latihan (Consistency)</span>
                      <strong>{dna.consistency}%</strong>
                    </div>
                    <div className="profile-dna-metric__bar">
                      <div className="profile-dna-metric__bar-fill" style={{ width: `${dna.consistency}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Weak Spots & Actionable Focus */}
          {weakSpots.length > 0 && (
            <section className="dashboard-console-card" style={{ marginTop: 28 }}>
              <div className="dashboard-console-card__header">
                <div className="dashboard-console-card__title-wrap">
                  <AlertCircle size={15} className="dashboard-console-card__icon" style={{ color: 'var(--terracotta)' }} />
                  <span className="dashboard-console-card__title">Area Penguatan & Titik Rawan</span>
                </div>
                <span className="dashboard-console-card__badge" style={{ color: 'var(--terracotta)', borderColor: 'rgba(192, 92, 70, 0.3)' }}>
                  Perlu Perhatian
                </span>
              </div>

              <div style={{ padding: '18px 22px' }}>
                <p className="dashboard-section-desc" style={{ marginBottom: 16 }}>
                  Berdasarkan riwayat kuis, topik berikut memiliki tingkat kesalahan lebih tinggi. Ulas kembali modul ini untuk menyempurnakan retensi:
                </p>

                <div className="profile-weakspots-list">
                  {weakSpots.map((ws, idx) => {
                    const country = getCountry(ws.topic);
                    return (
                      <div key={idx} className="profile-weakspot-card">
                        <div className="profile-weakspot-card__icon-wrap">
                          <AlertCircle size={16} />
                        </div>
                        <div className="profile-weakspot-card__body">
                          <div className="profile-weakspot-card__country">
                            {country?.nameId ?? ws.topic}
                          </div>
                          <p className="profile-weakspot-card__desc">
                            Tingkat Kesalahan {ws.percentage}% ({ws.errorCount} kesalahan).
                          </p>
                        </div>
                        <Link
                          to={`/dashboard/pelajaran/${ws.topic}/kenali`}
                          className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                        >
                          <span>Ulas Modul</span>
                          <ArrowRight size={13} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Recent Quiz Attempts */}
          <section className="dashboard-console-card" style={{ marginTop: 28 }}>
            <div className="dashboard-console-card__header">
              <div className="dashboard-console-card__title-wrap">
                <Clock size={15} className="dashboard-console-card__icon" />
                <span className="dashboard-console-card__title">Riwayat Evaluasi Quest</span>
              </div>
              <span className="dashboard-console-card__badge">
                {finishedAttempts.length} Sesi Selesai
              </span>
            </div>

            <div style={{ padding: '0 0 8px' }}>
              {finishedAttempts.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)' }}>
                  Belum ada evaluasi quest yang diselesaikan. Mulai quest pertamamu dari Beranda atau Modul Negara.
                </div>
              ) : (
                <ul className="profile-attempts-list">
                  {finishedAttempts.slice(0, 8).map((att) => {
                    const country = getCountry(att.countryId);
                    const correctCount = att.answers.filter((a) => a.correct).length;
                    const totalItems = att.itemIds.length || att.answers.length;
                    const percentage = totalItems > 0 ? Math.round((correctCount / totalItems) * 100) : 0;
                    const dateStr = att.finishedAt ? new Date(att.finishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

                    return (
                      <li key={att.id} className="profile-attempt-row">
                        <div className="profile-attempt-row__left">
                          <span
                            className="profile-attempt-row__swatch"
                            style={{ backgroundColor: `var(--country-${att.countryId}, var(--accent))` }}
                          />
                          <div>
                            <span className="profile-attempt-row__title">Quest {country?.nameId ?? att.countryId}</span>
                            <span className="profile-attempt-row__date">
                              <Calendar size={11} /> {dateStr}
                            </span>
                          </div>
                        </div>

                        <div className="profile-attempt-row__right">
                          <span className={`profile-attempt-row__score ${percentage >= 80 ? 'profile-attempt-row__score--high' : ''}`}>
                            {correctCount} / {totalItems} ({percentage}%)
                          </span>
                          <Link
                            to={`/dashboard/quest/${att.countryId}/${att.id}`}
                            className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                          >
                            <span>Lihat Hasil</span>
                            <ArrowRight size={13} />
                          </Link>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
