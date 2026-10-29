import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { getCountry } from '@/content/countries';
import type { PhraseReview } from '@/lib/storage/types';
import { getDueReviews, saveReview } from '@/lib/storage/db';
import { applyReviewResult, getTodayStr } from '@/lib/storage/leitner';
import { isSpeechSupported, speak } from '@/lib/speech';
import { profileFor } from '@/sections/country/scripts';
import DashboardSidebar from '@/app/components/DashboardSidebar';
import { useExplorerStats } from '@/lib/useExplorerStats';
import { Layers, Sparkles, Volume2, ArrowRight, RotateCcw, Check, BookOpen } from 'lucide-react';
import '@/styles/dashboard.css';

export default function ReviewPage() {
  const { profile, signOut } = useProfile();
  const { t } = useI18n();
  const profileId = profile?.id ?? '';
  const { totalXP, streakDays } = useExplorerStats(profileId);

  const [dueList, setDueList] = useState<PhraseReview[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);

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
      <div className="dashboard-layout">
        <DashboardSidebar
          profile={profile}
          totalXP={totalXP}
          streakDays={streakDays}
          onSignOut={signOut}
        />
        <main className="dashboard-main">
          <div className="dashboard-container" style={{ maxWidth: 760 }}>
            <div className="dashboard-loading" role="status">
              <p className="dashboard-loading__text">{t('profile.loading')}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Empty State: No phrases due
  if (dueList.length === 0 && reviewedCount === 0) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar
          profile={profile}
          totalXP={totalXP}
          streakDays={streakDays}
          onSignOut={signOut}
        />
        <main className="dashboard-main">
          <div className="dashboard-container" style={{ maxWidth: 760 }}>
            <header className="dashboard-header">
              <div className="dashboard-header__top-row">
                <span className="dashboard-header__eyebrow">
                  <Layers size={13} aria-hidden="true" />
                  SPACED REPETITION SYSTEM
                </span>
                <span className="dashboard-header__status-badge">
                  <Sparkles size={13} aria-hidden="true" />
                  Retensi Memori Optimal
                </span>
              </div>
              <h1 className="dashboard-header__title">Ulasan Frasa Leitner</h1>
              <p className="dashboard-header__desc">
                Metode interval memori Spaced Repetition 5 kotak untuk mengunci kosakata dan aksara Asia ke memori jangka panjang.
              </p>
            </header>

            <div className="dashboard-console-card" style={{ padding: '48px 32px', textAlign: 'center', marginTop: 24 }}>
              <div className="dashboard-stat-tile__icon-wrap" style={{ margin: '0 auto 16px', background: 'rgba(23, 107, 104, 0.1)', color: 'var(--accent)' }}>
                <Check size={24} strokeWidth={2.2} />
              </div>
              <h2 className="dashboard-header__title" style={{ fontSize: '1.5rem', marginBottom: 8 }}>
                {t('review.emptyDesc')}
              </h2>
              <p className="dashboard-header__desc" style={{ maxWidth: 500, margin: '0 auto 24px' }}>
                Semua kartu frasa Anda saat ini berada dalam interval jeda memori yang tepat. Anda dapat menambah perbendaharaan frasa baru dengan mempelajari modul negara lainnya.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard/negara" className="dashboard-btn dashboard-btn--primary">
                  <BookOpen size={14} />
                  <span>Jelajahi Modul Negara</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to="/dashboard" className="dashboard-btn dashboard-btn--secondary">
                  <span>{t('review.backToDashboard')}</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Finished Session State
  if (currentIndex >= dueList.length) {
    return (
      <div className="dashboard-layout">
        <DashboardSidebar
          profile={profile}
          totalXP={totalXP}
          streakDays={streakDays}
          onSignOut={signOut}
        />
        <main className="dashboard-main">
          <div className="dashboard-container" style={{ maxWidth: 760 }}>
            <header className="dashboard-header">
              <div className="dashboard-header__top-row">
                <span className="dashboard-header__eyebrow">
                  <Layers size={13} aria-hidden="true" />
                  SESI SELESAI
                </span>
              </div>
              <h1 className="dashboard-header__title">Sesi Ulasan Tuntas</h1>
            </header>

            <div className="dashboard-console-card" style={{ padding: '48px 32px', textAlign: 'center', marginTop: 24 }}>
              <div className="dashboard-stat-tile__icon-wrap" style={{ margin: '0 auto 16px', background: 'rgba(23, 107, 104, 0.1)', color: 'var(--accent)' }}>
                <Sparkles size={24} strokeWidth={2} />
              </div>
              <h2 className="dashboard-header__title" style={{ fontSize: '1.6rem', marginBottom: 8 }}>
                {t('review.finishedTitle')}
              </h2>
              <p className="dashboard-header__desc" style={{ maxWidth: 500, margin: '0 auto 24px' }}>
                {t('review.finishedDesc')} ({reviewedCount} frasa berhasil diperbarui ke interval retensi berikutnya).
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard" className="dashboard-btn dashboard-btn--primary">
                  <span>{t('review.backToDashboard')}</span>
                  <ArrowRight size={14} />
                </Link>
                <Link to="/dashboard/negara" className="dashboard-btn dashboard-btn--secondary">
                  <span>Buka Modul Lain</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
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
    <div className="dashboard-layout">
      <DashboardSidebar
        profile={profile}
        totalXP={totalXP}
        streakDays={streakDays}
        onSignOut={signOut}
      />
      <main className="dashboard-main">
        <div className="dashboard-container" style={{ maxWidth: 760 }}>
          <header className="dashboard-header">
            <div className="dashboard-header__top-row">
              <span className="dashboard-header__eyebrow">
                <Layers size={13} aria-hidden="true" />
                {t('review.progress')
                  .replace('{current}', String(currentNum))
                  .replace('{total}', String(total))}
              </span>
              <span className="dashboard-header__status-badge">
                Kotak Leitner #{currentReview.box} / 5
              </span>
            </div>
            <h1 className="dashboard-header__title">{t('review.title')}</h1>
            <p className="dashboard-header__desc">
              {country ? `${country.nameId} (${country.region}) · ${country.language.nameId}` : `Kotak ${currentReview.box}`}
            </p>
          </header>

          {/* Flashcard Console Card */}
          <div className="dashboard-console-card review-flashcard" role="region" aria-label="Kartu Frasa">
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
                  <Volume2 size={13} />
                  <span>{t('lesson.listen')}</span>
                </button>
              </div>
            )}

            {!showMeaning ? (
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={() => setShowMeaning(true)}
              >
                <span>{t('review.showMeaning')}</span>
              </button>
            ) : (
              <div className="review-flashcard__meaning">
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent)' }}>{phrase?.id}</strong>
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
                <RotateCcw size={14} />
                <span>{t('review.forgot')}</span>
              </button>

              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={() => handleAction(true)}
              >
                <Check size={14} />
                <span>{t('review.remembered')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
