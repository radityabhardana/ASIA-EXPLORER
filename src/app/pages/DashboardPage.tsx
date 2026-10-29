import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import {
  Sparkles,
  Compass,
  Globe,
  Flame,
  GraduationCap,
  Layers,
  Volume2,
  Download,
  Upload,
  AlertTriangle,
  ArrowRight,
  Target,
  Check,
} from 'lucide-react';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { countries, getCountry } from '@/content/countries';
import { isLengkapCountry, LENGKAP_COUNTRY_IDS } from '@/content/quests';
import type {
  Attempt,
  BackupData,
  LessonProgress,
  PhraseReview,
  Progress,
} from '@/lib/storage/types';
import {
  exportProfileData,
  getAttemptsByProfile,
  getDueReviews,
  getLessonsByProfile,
  getProgress,
  getReviewsByProfile,
  replaceProfileData,
  saveProgress,
} from '@/lib/storage/db';
import { getTodayStr, INTERVALS } from '@/lib/storage/leitner';
import { resolveNextTaskFromState } from '@/lib/storage/decision';
import { speak, isSpeechSupported } from '@/lib/speech';
import { profileFor } from '@/sections/country/scripts';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import WordOfDayWidget from '@/app/components/WordOfDayWidget';
import LearningDnaChart from '@/app/components/LearningDnaChart';
import OptimizerWidget from '@/app/components/OptimizerWidget';
import { computeLearningDNA, computeWeakSpots } from '@/lib/learningDna';
import '@/styles/dashboard.css';

const REGIONS = [
  'Semua',
  'Asia Tenggara',
  'Asia Timur',
  'Asia Selatan',
  'Asia Barat',
  'Asia Tengah',
] as const;

export default function DashboardPage() {
  const { profile, signOut } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [reviews, setReviews] = useState<PhraseReview[]>([]);
  const [dueReviews, setDueReviews] = useState<PhraseReview[]>([]);
  const [rawAttempts, setRawAttempts] = useState<Attempt[]>([]);
  const [openAttempt, setOpenAttempt] = useState<Attempt | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string>('Semua');
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const profileId = profile?.id ?? '';
  const todayStr = useMemo(() => getTodayStr(), []);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!profileId) return;

    let isMounted = true;
    Promise.all([
      getProgress(profileId),
      getLessonsByProfile(profileId),
      getReviewsByProfile(profileId),
      getDueReviews(profileId, todayStr),
      getAttemptsByProfile(profileId),
    ])
      .then(([prog, les, revs, due, attempts]) => {
        if (!isMounted) return;
        setProgress(prog ?? null);
        setLessons(les);
        setReviews(revs);
        setDueReviews(due);
        setRawAttempts(attempts);
        const inProgress = attempts.find((a) => a.finishedAt === null) ?? null;
        setOpenAttempt(inProgress);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileId, todayStr, refreshTrigger]);

  const loadData = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Stagger reveal with GSAP
  useEffect(() => {
    if (loading || !containerRef.current) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-reveal-item',
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.06,
          ease: 'power2.out',
          clearProps: 'all',
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  // Smooth scroll to anchor (e.g. #negara)
  useEffect(() => {
    if (!loading && location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [loading, location.hash]);

  // Total XP & Streak
  const [bonusXP, setBonusXP] = useState(() => {
    if (typeof window === 'undefined') return 0;
    return Number(localStorage.getItem(`xp_bonus_${profileId}`) ?? '0');
  });

  const handleEarnXP = useCallback(
    (amount: number) => {
      setBonusXP((prev) => {
        const next = prev + amount;
        if (typeof window !== 'undefined') {
          localStorage.setItem(`xp_bonus_${profileId}`, String(next));
        }
        return next;
      });
    },
    [profileId],
  );

  const totalXP = useMemo(() => {
    let xp = 0;
    for (const l of lessons) {
      xp += (l.stepsDone?.length ?? 0) * 25;
    }
    for (const a of rawAttempts) {
      if (a.finishedAt) {
        const correctCount = a.answers.filter((ans) => ans.correct).length;
        xp += correctCount * 10;
      }
    }
    return xp + bonusXP;
  }, [lessons, rawAttempts, bonusXP]);

  const streakDays = useMemo(() => {
    if (typeof window === 'undefined') return 1;
    const saved = localStorage.getItem(`streak_${profileId}`);
    return saved ? Number(saved) : 1;
  }, [profileId]);

  // Compute Learning DNA & Weak Spots
  const dna = useMemo(() => {
    return computeLearningDNA(
      profileId,
      rawAttempts.map((a) => {
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
  }, [profileId, rawAttempts]);

  const weakSpots = useMemo(() => {
    return computeWeakSpots(
      rawAttempts.map((a) => {
        const correct = a.answers.filter((ans) => ans.correct).length;
        const total = a.itemIds.length || a.answers.length || 10;
        return {
          topic: a.countryId,
          correct,
          total,
        };
      }),
    );
  }, [rawAttempts]);

  // Next Task Resolver
  const nextTask = useMemo(() => {
    return resolveNextTaskFromState(
      {
        inProgressAttempt: openAttempt,
        dueCount: dueReviews.length,
        lessons,
        progress,
        lengkapCountryIds: [...LENGKAP_COUNTRY_IDS],
      },
      'id',
    );
  }, [openAttempt, dueReviews, lessons, progress]);

  // Box Counts for Leitner Vault
  const boxCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    for (const rev of reviews) {
      if (rev.box >= 1 && rev.box <= 5) {
        counts[rev.box - 1] = (counts[rev.box - 1] ?? 0) + 1;
      }
    }
    return counts;
  }, [reviews]);

  const lessonByCountry = useMemo(() => {
    const map = new Map<string, LessonProgress>();
    for (const l of lessons) {
      map.set(l.countryId, l);
    }
    return map;
  }, [lessons]);

  // Completed countries count
  const completedLessonsCount = useMemo(() => {
    return lessons.filter((l) => l.stepsDone?.length === 4).length;
  }, [lessons]);

  // Filter countries by region
  const filteredCountries = useMemo(() => {
    if (selectedRegion === 'Semua') return countries;
    return countries.filter((c) => c.region === selectedRegion);
  }, [selectedRegion]);

  // Speak greeting audio handler
  const handleSpeakGreeting = (countryId: string, text: string, romanText: string) => {
    const country = getCountry(countryId);
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

  // Export / Import Handlers
  const handleExport = async () => {
    if (!profileId) return;
    try {
      const data = await exportProfileData(profileId);
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `asiakin-backup-${profileId}-${todayStr}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert(t('dashboard.importError'));
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profileId) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text) as BackupData;
      if (
        typeof data.schemaVersion !== 'number' ||
        !Array.isArray(data.profiles) ||
        !Array.isArray(data.lessons) ||
        !Array.isArray(data.attempts) ||
        !Array.isArray(data.reviews)
      ) {
        throw new Error('Format berkas tidak valid.');
      }
      await replaceProfileData(data);
      setImportStatus(t('dashboard.importSuccess'));
      await loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('dashboard.importError');
      setImportStatus(`${t('dashboard.importError')}: ${msg}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleResetProgress = async () => {
    if (!profileId) return;
    const confirmReset = window.confirm(t('dashboard.resetConfirm'));
    if (!confirmReset) return;

    try {
      await replaceProfileData({
        schemaVersion: 1,
        exportedAt: Date.now(),
        profiles: [{ id: profileId, displayName: profile?.displayName ?? '', locale: 'id', createdAt: Date.now() }],
        progress: [],
        lessons: [],
        attempts: [],
        reviews: [],
      });
      await saveProgress({ profileId, countries: {} });
      await loadData();
    } catch {
      alert(t('dashboard.importError'));
    }
  };

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
              <p className="dashboard-loading__text">{t('profile.loading')}</p>
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
        <div className="dashboard-container" ref={containerRef}>
          {/* Header Konteks */}
          <header className="dashboard-header dashboard-reveal-item">
            <div className="dashboard-header__top-row">
              <span className="dashboard-header__eyebrow">
                <Compass size={13} aria-hidden="true" />
                {t('dashboard.kicker')}
              </span>
              <span className="dashboard-header__status-badge">
                <span className="dashboard-header__status-dot" aria-hidden="true" />
                Sesi Belajar Aktif
              </span>
            </div>

            <h1 className="dashboard-header__title">
              {profile
                ? `Selamat Datang, ${profile.displayName}`
                : t('dashboard.pageTitle')}
            </h1>
            <p className="dashboard-header__desc">{t('dashboard.pageDesc')}</p>
          </header>

          {/* Stats Summary Ribbon */}
          <div className="dashboard-stats-ribbon dashboard-reveal-item" role="region" aria-label="Ringkasan Statistik">
            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap">
                <Sparkles size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Total XP</span>
                <span className="dashboard-stat-tile__value">{totalXP}</span>
                <span className="dashboard-stat-tile__sub">Poin Penjelajah</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--amber">
                <Flame size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Streak Harian</span>
                <span className="dashboard-stat-tile__value">{streakDays} Hari</span>
                <span className="dashboard-stat-tile__sub">Konsistensi Belajar</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--terracotta">
                <GraduationCap size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Pelajaran Lengkap</span>
                <span className="dashboard-stat-tile__value">{completedLessonsCount} / 10</span>
                <span className="dashboard-stat-tile__sub">Modul 4 Tahap</span>
              </div>
            </div>

            <div className="dashboard-stat-tile">
              <div className="dashboard-stat-tile__icon-wrap dashboard-stat-tile__icon-wrap--slate">
                <Layers size={20} strokeWidth={1.8} />
              </div>
              <div className="dashboard-stat-tile__content">
                <span className="dashboard-stat-tile__label">Frasa Leitner</span>
                <span className="dashboard-stat-tile__value">{reviews.length} Frasa</span>
                <span className="dashboard-stat-tile__sub">
                  {dueReviews.length > 0 ? `${dueReviews.length} Perlu Diulas` : 'Semua Tuntas'}
                </span>
              </div>
            </div>
          </div>

          {/* Baris 1: Hero Task & Word of Day */}
          <div className="dashboard-grid-2col dashboard-reveal-item">
            <section
              className="dashboard-hero-task"
              aria-labelledby="hero-task-title"
            >
              <div>
                <div className="dashboard-hero-task__top-bar">
                  <div className="dashboard-hero-task__kicker">
                    <Target size={14} aria-hidden="true" />
                    <span>{t('dashboard.taskHeader')}</span>
                  </div>
                  <span className="dashboard-console-card__badge">Tugas Utama</span>
                </div>

                {nextTask.type === 'resume-session' && (
                  <div>
                    <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                      {t('dashboard.taskResume')}
                    </h2>
                    <p className="dashboard-hero-task__explanation">
                      {t('dashboard.taskResumeDesc')}
                    </p>
                    <div className="dashboard-hero-task__action">
                      <button
                        type="button"
                        className="dashboard-btn dashboard-btn--primary"
                        onClick={() => {
                          if (nextTask.countryId) {
                            navigate(`/dashboard/quest/${nextTask.countryId}`);
                          }
                        }}
                      >
                        <span>{t('dashboard.taskResumeBtn')}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {nextTask.type === 'review-phrases' && (
                  <div>
                    <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                      {t('dashboard.taskReview')}
                    </h2>
                    <p className="dashboard-hero-task__explanation">
                      {t('dashboard.taskReviewDesc')} ({dueReviews.length}{' '}
                      {t('dashboard.dueCount')})
                    </p>
                    <div className="dashboard-hero-task__action">
                      <button
                        type="button"
                        className="dashboard-btn dashboard-btn--primary"
                        onClick={() => navigate('/dashboard/ulas')}
                      >
                        <span>{t('dashboard.taskReviewBtn')}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {nextTask.type === 'new-lesson' && (
                  <div>
                    <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                      {t('dashboard.taskNewLesson')}:{' '}
                      {getCountry(nextTask.countryId ?? '')?.nameId ??
                        nextTask.countryId}
                    </h2>
                    <p className="dashboard-hero-task__explanation">
                      {t('dashboard.taskNewLessonDesc')}
                    </p>
                    <div className="dashboard-hero-task__action">
                      <button
                        type="button"
                        className="dashboard-btn dashboard-btn--primary"
                        onClick={() => {
                          if (nextTask.countryId) {
                            navigate(
                              `/dashboard/pelajaran/${nextTask.countryId}/kenali`,
                            );
                          }
                        }}
                      >
                        <span>{t('dashboard.taskNewLessonBtn')}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {nextTask.type === 'read-story' && (
                  <div>
                    <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                      {t('dashboard.taskStory')}:{' '}
                      {getCountry(nextTask.countryId ?? '')?.nameId ??
                        nextTask.countryId}
                    </h2>
                    <p className="dashboard-hero-task__explanation">
                      {t('dashboard.taskStoryDesc')}
                    </p>
                    <div className="dashboard-hero-task__action">
                      <button
                        type="button"
                        className="dashboard-btn dashboard-btn--primary"
                        onClick={() => {
                          if (nextTask.countryId) {
                            navigate(`/negara/${nextTask.countryId}`, {
                              state: { from: '/dashboard' },
                            });
                          }
                        }}
                      >
                        <span>{t('dashboard.taskStoryBtn')}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}

                {nextTask.type === 'all-done' && (
                  <div>
                    <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                      {t('dashboard.taskAllDone')}
                    </h2>
                    <p className="dashboard-hero-task__explanation">
                      {t('dashboard.taskAllDoneDesc')}
                    </p>
                    <div className="dashboard-hero-task__action">
                      <button
                        type="button"
                        className="dashboard-btn dashboard-btn--secondary"
                        onClick={() => navigate('/')}
                      >
                        <span>{t('dashboard.taskAllDoneBtn')}</span>
                        <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <WordOfDayWidget onEarnXP={handleEarnXP} />
          </div>

          {/* Baris 2: Learning DNA & AI Optimizer */}
          <div className="dashboard-reveal-item">
            <div className="dashboard-section-header">
              <span className="dashboard-section-badge">OPTIMASI BELAJAR</span>
              <h2 className="dashboard-section-title">
                Analisis Kognitif & Rekomendasi Adaptif
              </h2>
              <p className="dashboard-section-desc">
                Pola pembelajaran dianalisis berdasarkan 5 dimensi kognitif dengan rekomendasi terarah.
              </p>
            </div>

            <div className="dashboard-grid-2col">
              <LearningDnaChart dna={dna} size={280} />
              <OptimizerWidget
                profileId={profileId}
                dna={dna}
                weakSpots={weakSpots}
                progress={progress}
              />
            </div>
          </div>

          {/* Blok 2: Phrase Vault & Leitner */}
          <section className="dashboard-vault dashboard-reveal-item" aria-labelledby="vault-heading">
            <div className="dashboard-section-header">
              <span className="dashboard-section-badge">SPACED REPETITION</span>
              <h2 id="vault-heading" className="dashboard-section-title">
                {t('dashboard.vaultTitle')}
              </h2>
              <p className="dashboard-section-desc">{t('dashboard.vaultDesc')}</p>
            </div>

            <div className="dashboard-vault__track">
              {boxCounts.map((count, index) => (
                <div key={index} className="dashboard-vault__box">
                  <span className="dashboard-vault__box-num">
                    {t(`dashboard.box${(index + 1) as 1 | 2 | 3 | 4 | 5}`)}
                  </span>
                  <span className="dashboard-vault__box-interval">
                    Interval {INTERVALS[index] ?? 1} hari
                  </span>
                  <span className="dashboard-vault__box-count">
                    {count} frasa
                  </span>
                </div>
              ))}
            </div>

            {dueReviews.length > 0 ? (
              <div className="dashboard-console-card" style={{ marginTop: 16 }}>
                <div className="dashboard-console-card__header">
                  <div className="dashboard-console-card__title-wrap">
                    <Layers size={15} className="dashboard-console-card__icon" aria-hidden="true" />
                    <span className="dashboard-console-card__title">Frasa Jatuh Tempo Hari Ini</span>
                  </div>
                  <span className="dashboard-console-card__badge">{dueReviews.length} Frasa</span>
                </div>

                <ul className="dashboard-due-list">
                  {dueReviews.map((rev) => {
                    const [cId, pIdxStr] = rev.phraseId.split(':');
                    const pIdx = Number(pIdxStr ?? '0');
                    const country = getCountry(cId ?? '');
                    const phrase = country?.phrases[pIdx];

                    return (
                      <li key={rev.phraseId} className="dashboard-due-item">
                        <div>
                          <span className="dashboard-due-item__script">
                            {phrase?.native ?? rev.phraseId}
                          </span>
                          {phrase?.roman && phrase.roman !== phrase.native ? (
                            <span className="dashboard-due-item__roman">
                              ({phrase.roman})
                            </span>
                          ) : null}
                          <div className="dashboard-due-item__meaning">
                            {phrase?.id
                              ? `${phrase.id} · ${country?.nameId ?? ''}`
                              : country?.nameId}
                          </div>
                        </div>
                        <div className="dashboard-due-item__meta">
                          Kotak {rev.box} · Jatuh tempo: {rev.dueDay}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div style={{ padding: '14px 18px', background: 'var(--ground, #f0eeea)' }}>
                  <button
                    type="button"
                    className="dashboard-btn dashboard-btn--accent"
                    onClick={() => navigate('/dashboard/ulas')}
                  >
                    <span>{t('dashboard.startReview')} ({dueReviews.length})</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <p className="dashboard-sovereignty__status">
                {t('dashboard.noDue')}
              </p>
            )}
          </section>

          {/* Blok 3: Daftar Negara & Progres */}
          <section
            id="negara"
            className="dashboard-countries dashboard-reveal-item"
            aria-labelledby="countries-heading"
          >
            <div className="dashboard-section-header">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <span className="dashboard-section-badge">MODUL NEGARA</span>
                  <h2 id="countries-heading" className="dashboard-section-title">
                    {t('dashboard.countriesTitle')}
                  </h2>
                </div>
                <Link
                  to="/dashboard/negara"
                  className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                >
                  <Globe size={13} />
                  <span>Buka Katalog Modul Lengkap</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
              <p className="dashboard-section-desc">
                15 negara penjelajahan dengan 10 kurikulum bertingkat 4 tahap: Kenali, Etiket, Bahasa, dan Quest.
              </p>
            </div>

            {/* Region Filter Bar */}
            <div className="dashboard-filter-bar" role="tablist" aria-label="Filter wilayah Asia">
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

            <ul className="dashboard-country-list">
              {filteredCountries.map((country) => {
                const isLengkap = isLengkapCountry(country.id);
                const lesson = lessonByCountry.get(country.id);
                const stepsDone = lesson?.stepsDone ?? [];
                const isSpeaking = speakingId === country.id;

                return (
                  <li key={country.id} className="dashboard-country-row">
                    <div className="dashboard-country-row__identity">
                      <div
                        className="dashboard-country-row__palette-indicator"
                        style={{ backgroundColor: `var(--country-${country.id}, var(--accent))` }}
                        aria-hidden="true"
                      />
                      <div className="dashboard-country-row__info">
                        <h3 className="dashboard-country-row__name">
                          <Link to={`/negara/${country.id}`} state={{ from: '/dashboard' }}>
                            {country.nameId}
                          </Link>
                        </h3>
                        <div className="dashboard-country-row__meta">
                          <span>{country.region}</span>
                          <span>·</span>
                          <button
                            type="button"
                            className="dashboard-country-row__greeting-speak"
                            onClick={() =>
                              handleSpeakGreeting(
                                country.id,
                                country.greeting.native,
                                country.greeting.roman,
                              )
                            }
                            title="Dengarkan sapaan asli"
                            aria-label={`Dengarkan sapaan bahasa ${country.nameId}`}
                          >
                            <Volume2
                              size={12}
                              className={isSpeaking ? 'dashboard-btn-icon--active' : ''}
                            />
                            <span>{country.greeting.native}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {isLengkap ? (
                      <div
                        className="dashboard-country-row__steps"
                        aria-label={`Langkah pelajaran ${country.nameId}`}
                      >
                        {(
                          ['kenali', 'etiket', 'bahasa', 'quest'] as const
                        ).map((stepKey, sIdx) => {
                          const done = stepsDone.includes(stepKey);
                          const stepNumber = sIdx + 1;
                          return (
                            <span
                              key={stepKey}
                              className={`dashboard-step-pill ${
                                done ? 'dashboard-step-pill--done' : ''
                              }`}
                            >
                              {done && <Check size={11} strokeWidth={2.5} aria-hidden="true" />}
                              {stepNumber}. {stepKey}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <span className="dashboard-step-pill">
                        {t('dashboard.exploration')}
                      </span>
                    )}

                    <div className="dashboard-country-row__actions">
                      {isLengkap ? (
                        <Link
                          to={`/dashboard/pelajaran/${country.id}/kenali`}
                          className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                        >
                          <span>{t('dashboard.startOrResume')}</span>
                          <ArrowRight size={13} />
                        </Link>
                      ) : (
                        <Link
                          to={`/negara/${country.id}`}
                          state={{ from: '/dashboard' }}
                          className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                        >
                          <span>{t('dashboard.openAtlas')}</span>
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Blok 4: Data & Kedaulatan (Local-First) */}
          <section
            className="dashboard-sovereignty dashboard-reveal-item"
            aria-labelledby="sovereignty-heading"
          >
            <div className="dashboard-section-header">
              <span className="dashboard-section-badge">MANAJEMEN DATA</span>
              <h2 id="sovereignty-heading" className="dashboard-section-title">
                {t('dashboard.sovereigntyTitle')}
              </h2>
              <p className="dashboard-section-desc">
                {t('dashboard.sovereigntyDesc')}
              </p>
            </div>

            {importStatus ? (
              <p className="dashboard-hero-task__explanation" role="alert">
                {importStatus}
              </p>
            ) : null}

            <div className="dashboard-sovereignty__actions">
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={handleExport}
              >
                <Download size={15} />
                <span>{t('dashboard.exportBtn')}</span>
              </button>

              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={handleImportClick}
              >
                <Upload size={15} />
                <span>{t('dashboard.importBtn')}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />

              <button
                type="button"
                className="dashboard-btn dashboard-btn--danger"
                onClick={handleResetProgress}
              >
                <AlertTriangle size={15} />
                <span>{t('dashboard.resetBtn')}</span>
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
