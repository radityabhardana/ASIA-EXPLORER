import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { getCountry } from '@/content/countries';
import type { PhraseReview } from '@/lib/storage/types';
import { getDueReviews, saveReview } from '@/lib/storage/db';
import { applyReviewResult, getTodayStr } from '@/lib/storage/leitner';
import { isSpeechSupported, speak } from '@/lib/speech';
import { profileFor } from '@/sections/country/scripts';
import '@/styles/dashboard.css';

export default function ReviewPage() {
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [dueList, setDueList] = useState<PhraseReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);

  const profileId = profile?.id ?? '';
  const todayStr = useMemo(() => getTodayStr(), []);

  useEffect(() => {
    if (!profileId) return;

    let isMounted = true;
    getDueReviews(profileId, todayStr)
      .then((items) => {
        if (!isMounted) return;
        setDueList(items);
        setCurrentIndex(0);
        setReviewedCount(0);
        setShowMeaning(false);
        setLoading(false);
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileId, todayStr]);

  if (loading) {
    return (
      <div className="review-page">
        <div className="dashboard-container">
          <div className="dashboard-loading" role="status">
            <p className="dashboard-loading__text">{t('profile.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty State: No phrases due
  if (dueList.length === 0 && reviewedCount === 0) {
    return (
      <div className="review-page">
        <div className="dashboard-container">
          <div className="dashboard-empty">
            <h1 className="dashboard-header__title" style={{ fontSize: '1.75rem' }}>
              {t('review.emptyDesc')}
            </h1>
            <div style={{ marginTop: 24 }}>
              <Link to="/dashboard" className="dashboard-btn dashboard-btn--primary">
                {t('review.backToDashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Finished Session State
  if (currentIndex >= dueList.length) {
    return (
      <div className="review-page">
        <div className="dashboard-container">
          <div className="dashboard-empty">
            <h1 className="dashboard-header__title" style={{ fontSize: '2rem' }}>
              {t('review.finishedTitle')}
            </h1>
            <p className="dashboard-header__desc" style={{ marginTop: 12 }}>
              {t('review.finishedDesc')} ({reviewedCount} frasa diperbarui).
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to="/dashboard" className="dashboard-btn dashboard-btn--primary">
                {t('review.backToDashboard')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentReview = dueList[currentIndex];
  if (!currentReview) return null;

  const [countryId, phraseIndexStr] = currentReview.phraseId.split(':');
  const phraseIndex = Number(phraseIndexStr ?? '0');
  const country = getCountry(countryId ?? '');
  const phrase = country?.phrases[phraseIndex];

  const handleAction = async (remembered: boolean) => {
    const updated = applyReviewResult(currentReview, remembered, todayStr);
    await saveReview(updated);

    setShowMeaning(false);
    setReviewedCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  const handlePlayAudio = () => {
    if (!phrase || !country) return;
    const textProfile = profileFor(country);
    speak(phrase.native, {
      lang: textProfile.speechLang || textProfile.lang,
      fallbackText: phrase.roman,
    });
  };

  const total = dueList.length;
  const currentNum = currentIndex + 1;

  return (
    <div className="review-page">
      <div className="dashboard-container" style={{ maxWidth: 720 }}>
        {/* Back Link */}
        <div style={{ marginBottom: 20 }}>
          <button
            type="button"
            className="lesson-story-link"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            {t('lesson.backToDashboard')}
          </button>
        </div>

        <header className="dashboard-header" style={{ marginBottom: 24 }}>
          <span className="dashboard-header__eyebrow">
            {t('review.progress')
              .replace('{current}', String(currentNum))
              .replace('{total}', String(total))}
          </span>
          <h1 className="dashboard-header__title" style={{ fontSize: '1.75rem' }}>
            {t('review.title')}
          </h1>
          <p className="dashboard-header__desc">
            {country ? `${country.nameId} · Kotak ${currentReview.box}` : `Kotak ${currentReview.box}`}
          </p>
        </header>

        {/* Flashcard Card */}
        <div className="review-flashcard" role="region" aria-label="Kartu Frasa">
          <span className="review-flashcard__script">
            {phrase?.native ?? currentReview.phraseId}
          </span>

          {phrase?.roman && phrase.roman !== phrase.native ? (
            <span className="review-flashcard__roman">({phrase.roman})</span>
          ) : null}

          {isSpeechSupported() && (
            <div style={{ marginBottom: 16 }}>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                onClick={handlePlayAudio}
              >
                {t('lesson.listen')}
              </button>
            </div>
          )}

          {!showMeaning ? (
            <button
              type="button"
              className="dashboard-btn dashboard-btn--secondary"
              onClick={() => setShowMeaning(true)}
            >
              {t('review.showMeaning')}
            </button>
          ) : (
            <div className="review-flashcard__meaning">
              <strong>{phrase?.id}</strong>
              <div style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                {country?.nameId} · {country?.language.nameId}
              </div>
            </div>
          )}
        </div>

        {/* Review Actions: Ingat vs Ulas Lagi */}
        {showMeaning && (
          <div className="review-actions">
            <button
              type="button"
              className="dashboard-btn dashboard-btn--danger"
              onClick={() => handleAction(false)}
            >
              {t('review.forgot')}
            </button>

            <button
              type="button"
              className="dashboard-btn dashboard-btn--primary"
              onClick={() => handleAction(true)}
            >
              {t('review.remembered')} &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
