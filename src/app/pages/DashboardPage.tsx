import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import type { ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { countries, getCountry } from '@/content/countries';
import { LENGKAP_COUNTRY_IDS, isLengkapCountry } from '@/content/quests';
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
import '@/styles/dashboard.css';

export default function DashboardPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [reviews, setReviews] = useState<PhraseReview[]>([]);
  const [dueReviews, setDueReviews] = useState<PhraseReview[]>([]);
  const [openAttempt, setOpenAttempt] = useState<Attempt | null>(null);

  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Determine single next task via deterministic decision table
  const nextTask = resolveNextTaskFromState({
    inProgressAttempt: openAttempt,
    dueCount: dueReviews.length,
    progress,
    lessons,
    lengkapCountryIds: [...LENGKAP_COUNTRY_IDS],
  });

  // Calculate box counts for Leitner track
  const boxCounts = [1, 2, 3, 4, 5].map(
    (b) => reviews.filter((r) => r.box === b).length,
  );

  // Map country progress status
  const lessonByCountry = new Map(lessons.map((l) => [l.countryId, l]));

  // Handle JSON Export
  const handleExport = async () => {
    if (!profileId) return;
    try {
      const data = await exportProfileData(profileId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `asiakin-backup-${todayStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      alert(t('dashboard.importError'));
    }
  };

  // Handle JSON Import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as BackupData;
      if (!parsed.schemaVersion || !Array.isArray(parsed.profiles)) {
        throw new Error('Format cadangan tidak valid');
      }

      await replaceProfileData(parsed);
      setImportStatus(t('dashboard.importSuccess'));
      await loadData();
    } catch {
      setImportStatus(t('dashboard.importError'));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setTimeout(() => setImportStatus(null), 4000);
    }
  };

  // Handle Reset Progress
  const handleResetProgress = async () => {
    if (!profileId) return;
    const confirmed = window.confirm(t('dashboard.resetConfirm'));
    if (!confirmed) return;

    try {
      await replaceProfileData({
        schemaVersion: 1,
        exportedAt: Date.now(),
        profiles: profile ? [profile] : [],
        progress: [{ profileId, countries: {} }],
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
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-loading" role="status">
            <p className="dashboard-loading__text">{t('profile.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header Konteks */}
        <header className="dashboard-header">
          <span className="dashboard-header__eyebrow">{t('dashboard.kicker')}</span>
          <h1 className="dashboard-header__title">
            {profile ? `${profile.displayName} · ${t('dashboard.pageTitle')}` : t('dashboard.pageTitle')}
          </h1>
          <p className="dashboard-header__desc">{t('dashboard.pageDesc')}</p>
        </header>

        {/* Blok 1: Satu Tugas Berikutnya */}
        <section className="dashboard-hero-task" aria-labelledby="hero-task-title">
          <div className="dashboard-hero-task__kicker">{t('dashboard.taskHeader')}</div>

          {nextTask.type === 'resume-session' && (
            <div>
              <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                {t('dashboard.taskResume')}
              </h2>
              <p className="dashboard-hero-task__explanation">
                {t('dashboard.taskResumeDesc')}
              </p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={() => {
                  if (nextTask.countryId) {
                    navigate(`/dashboard/quest/${nextTask.countryId}`);
                  }
                }}
              >
                {t('dashboard.taskResumeBtn')} &rarr;
              </button>
            </div>
          )}

          {nextTask.type === 'review-phrases' && (
            <div>
              <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                {t('dashboard.taskReview')}
              </h2>
              <p className="dashboard-hero-task__explanation">
                {t('dashboard.taskReviewDesc')} ({dueReviews.length} {t('dashboard.dueCount')})
              </p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={() => navigate('/dashboard/ulas')}
              >
                {t('dashboard.taskReviewBtn')} &rarr;
              </button>
            </div>
          )}

          {nextTask.type === 'new-lesson' && (
            <div>
              <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                {t('dashboard.taskNewLesson')}: {getCountry(nextTask.countryId ?? '')?.nameId ?? nextTask.countryId}
              </h2>
              <p className="dashboard-hero-task__explanation">
                {t('dashboard.taskNewLessonDesc')}
              </p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={() => {
                  if (nextTask.countryId) {
                    navigate(`/dashboard/pelajaran/${nextTask.countryId}/kenali`);
                  }
                }}
              >
                {t('dashboard.taskNewLessonBtn')} &rarr;
              </button>
            </div>
          )}

          {nextTask.type === 'read-story' && (
            <div>
              <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                {t('dashboard.taskStory')}: {getCountry(nextTask.countryId ?? '')?.nameId ?? nextTask.countryId}
              </h2>
              <p className="dashboard-hero-task__explanation">
                {t('dashboard.taskStoryDesc')}
              </p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={() => {
                  if (nextTask.countryId) {
                    navigate(`/negara/${nextTask.countryId}`);
                  }
                }}
              >
                {t('dashboard.taskStoryBtn')} &rarr;
              </button>
            </div>
          )}

          {nextTask.type === 'all-done' && (
            <div>
              <h2 id="hero-task-title" className="dashboard-hero-task__headline">
                {t('dashboard.taskAllDone')}
              </h2>
              <p className="dashboard-hero-task__explanation">
                {t('dashboard.taskAllDoneDesc').replace(
                  '{count}',
                  String(LENGKAP_COUNTRY_IDS.length),
                )}
              </p>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={() => navigate('/')}
              >
                {t('dashboard.taskAllDoneBtn')} &rarr;
              </button>
            </div>
          )}
        </section>

        {/* Blok 2: Phrase Vault & Leitner */}
        <section className="dashboard-vault" aria-labelledby="vault-heading">
          <h2 id="vault-heading" className="dashboard-header__title">
            {t('dashboard.vaultTitle')}
          </h2>
          <p className="dashboard-header__desc">{t('dashboard.vaultDesc')}</p>

          <div className="dashboard-vault__track">
            {boxCounts.map((count, index) => (
              <div key={index} className="dashboard-vault__box">
                <span className="dashboard-vault__box-num">
                  {t(`dashboard.box${(index + 1) as 1 | 2 | 3 | 4 | 5}`)}
                </span>
                <span className="dashboard-vault__box-interval">
                  {INTERVALS[index]} hari
                </span>
                <span className="dashboard-vault__box-count">
                  {count} frasa
                </span>
              </div>
            ))}
          </div>

          {dueReviews.length > 0 ? (
            <div>
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
                          {phrase?.id ? `${phrase.id} · ${country?.nameId ?? ''}` : country?.nameId}
                        </div>
                      </div>
                      <div className="dashboard-due-item__meta">
                        Kotak {rev.box} · Jatuh tempo: {rev.dueDay}
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--accent"
                onClick={() => navigate('/dashboard/ulas')}
              >
                {t('dashboard.startReview')} ({dueReviews.length}) &rarr;
              </button>
            </div>
          ) : (
            <p className="dashboard-sovereignty__status">{t('dashboard.noDue')}</p>
          )}
        </section>

        {/* Blok 3: Daftar Negara & Progres */}
        <section className="dashboard-countries" aria-labelledby="countries-heading">
          <h2 id="countries-heading" className="dashboard-header__title">
            {t('dashboard.countriesTitle')}
          </h2>

          <ul className="dashboard-country-list">
            {countries.map((country) => {
              const isLengkap = isLengkapCountry(country.id);
              const lesson = lessonByCountry.get(country.id);
              const stepsDone = lesson?.stepsDone ?? [];

              return (
                <li key={country.id} className="dashboard-country-row">
                  <div className="dashboard-country-row__info">
                    <h3 className="dashboard-country-row__name">
                      <Link to={`/negara/${country.id}`}>
                        {country.nameId}
                      </Link>
                    </h3>
                    <div className="dashboard-country-row__meta">
                      <span>{country.region}</span>
                      <span>·</span>
                      <span>{country.greeting.native}</span>
                    </div>
                  </div>

                  {isLengkap ? (
                    <div className="dashboard-country-row__steps" aria-label={`Langkah pelajaran ${country.nameId}`}>
                      {(['kenali', 'etiket', 'bahasa', 'quest'] as const).map(
                        (stepKey, sIdx) => {
                          const done = stepsDone.includes(stepKey);
                          const stepNumber = sIdx + 1;
                          return (
                            <span
                              key={stepKey}
                              className={`dashboard-step-pill ${
                                done ? 'dashboard-step-pill--done' : ''
                              }`}
                            >
                              {stepNumber}. {stepKey}
                            </span>
                          );
                        },
                      )}
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
                        {t('dashboard.startOrResume')}
                      </Link>
                    ) : (
                      <Link
                        to={`/negara/${country.id}`}
                        className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                      >
                        {t('dashboard.openAtlas')}
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Blok 4: Data & Kedaulatan (Local-First) */}
        <section className="dashboard-sovereignty" aria-labelledby="sovereignty-heading">
          <h2 id="sovereignty-heading" className="dashboard-header__title">
            {t('dashboard.sovereigntyTitle')}
          </h2>
          <p className="dashboard-sovereignty__status">
            {t('dashboard.sovereigntyDesc')}
          </p>

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
              {t('dashboard.exportBtn')}
            </button>

            <button
              type="button"
              className="dashboard-btn dashboard-btn--secondary"
              onClick={handleImportClick}
            >
              {t('dashboard.importBtn')}
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
              {t('dashboard.resetBtn')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
