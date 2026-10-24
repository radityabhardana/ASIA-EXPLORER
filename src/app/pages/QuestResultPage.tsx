import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { getCountry } from '@/content/countries';
import { LENGKAP_COUNTRY_IDS, getQuestItemsForCountry } from '@/content/quests';
import type {
  Attempt,
  EtiquetteMcqItem,
  PhraseMatchItem,
  BranchScenarioItem,
  QuestItem,
} from '@/lib/storage/types';
import { getAttempt, saveAttempt } from '@/lib/storage/db';
import '@/styles/dashboard.css';

function formatDuration(ms: number | null): string {
  if (!ms || ms <= 0) return '0:00';
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export default function QuestResultPage() {
  const { countryId, attemptId } = useParams<{ countryId?: string; attemptId?: string }>();
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const profileId = profile?.id ?? '';

  const country = useMemo(() => {
    return countryId ? getCountry(countryId) : undefined;
  }, [countryId]);

  const allItems = useMemo(() => {
    return countryId ? getQuestItemsForCountry(countryId) : [];
  }, [countryId]);

  const itemsById = useMemo(() => {
    return new Map<string, QuestItem>(allItems.map((item) => [item.id, item]));
  }, [allItems]);

  useEffect(() => {
    let isMounted = true;

    if (!profileId || !attemptId) {
      Promise.resolve().then(() => {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });
      return () => {
        isMounted = false;
      };
    }

    getAttempt(attemptId)
      .then((found) => {
        if (!isMounted) return;
        if (!found || found.profileId !== profileId) {
          setNotFound(true);
        } else {
          setAttempt(found);
        }
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) {
          setNotFound(true);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [profileId, attemptId]);

  if (!countryId || !country) {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading) {
    return (
      <div className="result-page">
        <div className="dashboard-container">
          <div className="dashboard-loading" role="status">
            <p className="dashboard-loading__text">{t('result.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Not Found State (SPEC_DASHBOARD §1 & §5)
  if (notFound || !attempt) {
    return (
      <div className="result-page">
        <div className="dashboard-container">
          <div className="dashboard-not-found">
            <h1 className="dashboard-header__title" style={{ fontSize: '1.75rem' }}>
              {t('result.notFound')}
            </h1>
            <div className="result-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
              <Link to="/dashboard" className="dashboard-btn dashboard-btn--primary">
                {t('result.backDashboard')}
              </Link>
              <Link
                to={`/dashboard/quest/${countryId}`}
                className="dashboard-btn dashboard-btn--secondary"
              >
                Mulai Quest Baru
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty State (SPEC_DASHBOARD §5)
  if (attempt.answers.length === 0) {
    return (
      <div className="result-page">
        <div className="dashboard-container">
          <div className="dashboard-empty">
            <h1 className="dashboard-header__title" style={{ fontSize: '1.75rem' }}>
              {t('result.empty')}
            </h1>
            <div className="result-actions" style={{ justifyContent: 'center', marginTop: 24 }}>
              <Link
                to={`/dashboard/quest/${countryId}`}
                className="dashboard-btn dashboard-btn--primary"
              >
                Mulai Ulang Quest
              </Link>
              <Link to="/dashboard" className="dashboard-btn dashboard-btn--secondary">
                {t('result.backDashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate score & denominator
  const score = attempt.answers.filter((a) => a.correct).length;
  const denominator = attempt.itemIds.length;
  const percent = Math.round((100 * score) / Math.max(1, denominator));
  const durationFormatted = formatDuration(attempt.durationMs);

  // Check for partial availability of items
  const hasUnknownItems = attempt.itemIds.some((id) => !itemsById.has(id));

  // Determine wrong items for retry
  const wrongAnswers = attempt.answers.filter((a) => !a.correct);
  const wrongItemIds = wrongAnswers.map((a) => a.itemId);

  // Handle Retry Wrong
  const handleRetryWrong = async () => {
    if (wrongItemIds.length === 0) return;

    const retryAttempt: Attempt = {
      id: crypto.randomUUID(),
      profileId,
      countryId,
      itemIds: wrongItemIds,
      answers: [],
      startedAt: Date.now(),
      finishedAt: null,
      durationMs: null,
      mode: 'retry-wrong',
    };

    await saveAttempt(retryAttempt);
    navigate(`/dashboard/quest/${countryId}`);
  };

  // Find next Lengkap country in canonical order
  const currentIndex = LENGKAP_COUNTRY_IDS.indexOf(countryId as (typeof LENGKAP_COUNTRY_IDS)[number]);
  const nextCountryId =
    currentIndex >= 0 && currentIndex < LENGKAP_COUNTRY_IDS.length - 1
      ? LENGKAP_COUNTRY_IDS[currentIndex + 1]
      : null;

  const finishedDate = new Date(attempt.finishedAt ?? attempt.startedAt);

  return (
    <div className="result-page">
      <div className="dashboard-container">
        {/* Navigation & Header */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/dashboard" className="lesson-story-link">
            {t('lesson.backToDashboard')}
          </Link>
        </div>

        <header className="dashboard-header" style={{ marginBottom: 32 }}>
          <span className="dashboard-header__eyebrow">
            {country.region} · {country.nameId}
          </span>
          <h1 className="dashboard-header__title">
            {t('result.title')}: {country.nameId}
          </h1>
          <p className="dashboard-header__desc">
            Selesai pada {finishedDate.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </header>

        {/* Partial Item Warning */}
        {hasUnknownItems && (
          <div className="dashboard-hero-task__explanation" style={{ color: 'var(--terracotta)' }}>
            {t('result.partialWarning')}
          </div>
        )}

        {/* Score Banner (5/6 + 83% + duration) */}
        <div className="result-score-banner" role="region" aria-label="Ringkasan Skor">
          <div>
            <span className="dashboard-header__eyebrow">{t('result.score')}</span>
            <div className="result-score-main">
              {score}/{denominator}
            </div>
          </div>

          <div>
            <span className="dashboard-header__eyebrow">Akurasi</span>
            <div className="result-score-percent">{percent}%</div>
          </div>

          <div>
            <span className="dashboard-header__eyebrow">{t('result.duration')}</span>
            <div className="result-score-duration">{durationFormatted}</div>
          </div>
        </div>

        {/* Item-by-Item Review Breakdown */}
        <section aria-labelledby="review-breakdown-title">
          <h2 id="review-breakdown-title" className="dashboard-header__title" style={{ fontSize: '1.5rem', marginBottom: 24 }}>
            {t('result.reviewHeading')}
          </h2>

          <ol className="result-review-list">
            {attempt.answers.map((ans, idx) => {
              const item = itemsById.get(ans.itemId);
              if (!item) return null;

              let promptText = '';
              let userAnswerText = '';
              let correctAnswerText = '';

              if (item.kind === 'etiquette') {
                const mcq = item as EtiquetteMcqItem;
                promptText = mcq.prompt;
                const userOptIndex = Number(ans.given);
                userAnswerText = mcq.options[userOptIndex] ?? String(ans.given);
                correctAnswerText = mcq.options[mcq.correctIndex] ?? '';
              } else if (item.kind === 'match') {
                const match = item as PhraseMatchItem;
                promptText = match.prompt;
                userAnswerText = ans.correct ? 'Semua pasangan tepat' : 'Pasangan belum tepat seluruhnya';
                correctAnswerText = 'Ketiga pasangan frasa dan arti tepat';
              } else if (item.kind === 'branch') {
                const branch = item as BranchScenarioItem;
                promptText = branch.scenario;
                const chosen = branch.options.find((o) => o.id === ans.given);
                const correctOpt = branch.options.find((o) => o.correct);
                userAnswerText = chosen?.label ?? String(ans.given);
                correctAnswerText = correctOpt?.label ?? '';
              }

              return (
                <li key={ans.itemId || idx} className="result-review-item">
                  <div className="result-review-item__prompt">
                    {idx + 1}. {promptText}
                  </div>

                  <p className="result-review-item__line result-review-item__user-answer">
                    <strong>{t('result.yourAnswer')}:</strong> {userAnswerText} (
                    {ans.correct ? 'Benar' : 'Salah'})
                  </p>

                  <p className="result-review-item__line result-review-item__correct-answer">
                    <strong>{t('result.correctAnswer')}:</strong> {correctAnswerText}
                  </p>

                  <p className="result-review-item__line result-review-item__reason">
                    <strong>Sebab Budaya:</strong> {item.reason}
                  </p>

                  <div className="result-review-item__source">
                    Rujukan terverifikasi:{' '}
                    <a href={item.sourceRef} target="_blank" rel="noopener noreferrer">
                      {item.sourceRef}
                    </a>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Action Buttons */}
        <div className="result-actions">
          {score < denominator && (
            <button
              type="button"
              className="dashboard-btn dashboard-btn--primary"
              onClick={handleRetryWrong}
            >
              {t('result.retryWrong')} ({wrongItemIds.length}) &rarr;
            </button>
          )}

          {nextCountryId ? (
            <Link
              to={`/dashboard/pelajaran/${nextCountryId}/kenali`}
              className="dashboard-btn dashboard-btn--secondary"
            >
              {t('result.nextCountry')} ({getCountry(nextCountryId)?.nameId}) &rarr;
            </Link>
          ) : null}

          <Link to="/dashboard" className="dashboard-btn dashboard-btn--secondary">
            {t('result.backDashboard')}
          </Link>
        </div>
      </div>
    </div>
  );
}
