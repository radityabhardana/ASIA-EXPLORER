import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { getCountry } from '@/content/countries';
import { isLengkapCountry } from '@/content/quests';
import type { LessonProgress, LessonStep } from '@/lib/storage/types';
import {
  getLesson,
  getReview,
  saveLesson,
  saveReview,
} from '@/lib/storage/db';
import { createInitialPhraseReview, getTodayStr } from '@/lib/storage/leitner';
import { isSpeechSupported, speak } from '@/lib/speech';
import { profileFor } from '@/sections/country/scripts';
import '@/styles/dashboard.css';

const STEPS: LessonStep[] = ['kenali', 'etiket', 'bahasa', 'quest'];

export default function LessonPage() {
  const { countryId, step } = useParams<{ countryId?: string; step?: string }>();
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [loading, setLoading] = useState(true);

  // Step 1: interaction tracker
  const [kenaliInteracted, setKenaliInteracted] = useState(false);

  // Step 2: etiket opened accordions
  const [openedEtiket, setOpenedEtiket] = useState<Record<number, boolean>>({});

  // Step 3: bahasa checkboxes
  const [checkedPhrases, setCheckedPhrases] = useState<Record<number, boolean>>({});

  const profileId = profile?.id ?? '';
  const currentStep = (step as LessonStep) || 'kenali';

  const country = useMemo(() => {
    return countryId ? getCountry(countryId) : undefined;
  }, [countryId]);

  useEffect(() => {
    if (!profileId || !countryId) return;

    let isMounted = true;
    getLesson(profileId, countryId)
      .then(async (existing) => {
        if (!isMounted) return;
        if (existing) {
          setLessonProgress(existing);
          setLoading(false);
        } else {
          const initial: LessonProgress = {
            profileId,
            countryId,
            stepsDone: [],
            startedAt: Date.now(),
            completedAt: null,
          };
          await saveLesson(initial);
          if (isMounted) {
            setLessonProgress(initial);
            setLoading(false);
          }
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileId, countryId]);

  if (!countryId || !isLengkapCountry(countryId) || !country) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!STEPS.includes(currentStep)) {
    return <Navigate to={`/dashboard/pelajaran/${countryId}/kenali`} replace />;
  }

  // Furthest allowed step validation
  const stepsDone = lessonProgress?.stepsDone ?? [];
  const currentStepIndex = STEPS.indexOf(currentStep);

  // If user tries to jump ahead beyond reached steps:
  // Allowed to access current step if previous step is done, or step is 'kenali'
  const isStepAllowed =
    currentStepIndex === 0 || STEPS.slice(0, currentStepIndex).every((s) => stepsDone.includes(s));

  if (!loading && !isStepAllowed) {
    // Redirect to furthest available step
    const furthestStep = STEPS.find((s) => !stepsDone.includes(s)) ?? 'kenali';
    return <Navigate to={`/dashboard/pelajaran/${countryId}/${furthestStep}`} replace />;
  }

  // If step is quest, redirect directly to quest page
  if (currentStep === 'quest') {
    return <Navigate to={`/dashboard/quest/${countryId}`} replace />;
  }

  // Extract first 2 sentences from story.text for 'kenali'
  const storySentences = country.story.text
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ');

  // Extract 3 rules from peopleNote
  const etiketRules = country.peopleNote
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 5)
    .slice(0, 3);

  // Handlers for step progression
  const handleKenaliContinue = async () => {
    if (!lessonProgress) return;
    const nextSteps = Array.from(new Set([...stepsDone, 'kenali' as LessonStep]));
    const updated: LessonProgress = {
      ...lessonProgress,
      stepsDone: nextSteps,
    };
    await saveLesson(updated);
    setLessonProgress(updated);
    navigate(`/dashboard/pelajaran/${countryId}/etiket`);
  };

  const handleToggleEtiket = (index: number) => {
    setOpenedEtiket((prev) => ({ ...prev, [index]: true }));
  };

  const allEtiketOpened = etiketRules.length > 0 && etiketRules.every((_, idx) => openedEtiket[idx]);

  const handleEtiketContinue = async () => {
    if (!lessonProgress) return;
    const nextSteps = Array.from(new Set([...stepsDone, 'etiket' as LessonStep]));
    const updated: LessonProgress = {
      ...lessonProgress,
      stepsDone: nextSteps,
    };
    await saveLesson(updated);
    setLessonProgress(updated);
    navigate(`/dashboard/pelajaran/${countryId}/bahasa`);
  };

  const allPhrasesChecked =
    country.phrases.length > 0 &&
    country.phrases.slice(0, 3).every((_, idx) => checkedPhrases[idx]);

  const handleBahasaContinue = async () => {
    if (!lessonProgress) return;
    const nextSteps = Array.from(new Set([...stepsDone, 'bahasa' as LessonStep]));
    const updated: LessonProgress = {
      ...lessonProgress,
      stepsDone: nextSteps,
    };
    await saveLesson(updated);
    setLessonProgress(updated);

    // Initialize PhraseReview records for these 3 phrases in Leitner Box 1
    const todayStr = getTodayStr();
    for (let i = 0; i < Math.min(3, country.phrases.length); i++) {
      const phraseId = `${countryId}:${i}`;
      const existing = await getReview(profileId, phraseId);
      if (!existing) {
        const initial = createInitialPhraseReview(profileId, phraseId, todayStr);
        await saveReview(initial);
      }
    }

    navigate(`/dashboard/quest/${countryId}`);
  };

  const handlePlayAudio = (text: string, roman?: string) => {
    const textProfile = profileFor(country);
    speak(text, {
      lang: textProfile.speechLang || textProfile.lang,
      fallbackText: roman,
    });
  };

  return (
    <div className="lesson-page">
      <div className="dashboard-container">
        {/* Navigation & Header */}
        <div style={{ marginBottom: 24 }}>
          <Link to="/dashboard" className="lesson-story-link">
            {t('lesson.backToDashboard')}
          </Link>
        </div>

        <header className="dashboard-header">
          <span className="dashboard-header__eyebrow">
            {country.region} · {country.nameId}
          </span>
          <h1 className="dashboard-header__title">
            Pelajaran Budaya: {country.nameId}
          </h1>
          <p className="dashboard-header__desc">
            Sapaan asli: <em>{country.greeting.native}</em> ({country.greeting.roman})
          </p>
        </header>

        {/* 4-step progress tracker bar */}
        <nav className="lesson-progress-bar" aria-label="Langkah Pelajaran">
          {STEPS.map((stepKey, idx) => {
            const isActive = stepKey === currentStep;
            const isDone = stepsDone.includes(stepKey);
            return (
              <div
                key={stepKey}
                className={`lesson-step-tab ${isActive ? 'lesson-step-tab--active' : ''} ${
                  isDone ? 'lesson-step-tab--done' : ''
                }`}
                aria-current={isActive ? 'step' : undefined}
              >
                {t(`lesson.step${(idx + 1) as 1 | 2 | 3 | 4}Title`)}
              </div>
            );
          })}
        </nav>

        {/* Step 1: Kenali */}
        {currentStep === 'kenali' && (
          <section className="lesson-step-content" aria-labelledby="kenali-heading">
            <h2 id="kenali-heading" className="dashboard-header__title" style={{ fontSize: '1.5rem' }}>
              {t('lesson.step1Title')}: Pengantar Budaya
            </h2>
            <div
              className="dashboard-prose"
              tabIndex={0}
              onFocus={() => setKenaliInteracted(true)}
              onClick={() => setKenaliInteracted(true)}
            >
              <p className="lesson-story-text">
                {storySentences}
              </p>
              <Link
                to={`/negara/${countryId}`}
                className="lesson-story-link"
                onFocus={() => setKenaliInteracted(true)}
              >
                {t('lesson.storyLink')}
              </Link>
            </div>

            <div style={{ marginTop: 32 }}>
              <button
                type="button"
                disabled={!kenaliInteracted}
                className="dashboard-btn dashboard-btn--primary"
                onClick={handleKenaliContinue}
              >
                {t('lesson.continueToEtiket')} &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Step 2: Etiket */}
        {currentStep === 'etiket' && (
          <section className="lesson-step-content" aria-labelledby="etiket-heading">
            <h2 id="etiket-heading" className="dashboard-header__title" style={{ fontSize: '1.5rem' }}>
              {t('lesson.step2Title')}: Tiga Norma & Sebab Kultural
            </h2>
            <p className="dashboard-header__desc" style={{ marginBottom: 24 }}>
              {t('lesson.etiketInstructions')}
            </p>

            <div className="dashboard-prose">
              {etiketRules.map((rule, idx) => (
                <details
                  key={idx}
                  className="lesson-accordion"
                  onToggle={(e) => {
                    if ((e.target as HTMLDetailsElement).open) {
                      handleToggleEtiket(idx);
                    }
                  }}
                >
                  <summary className="lesson-accordion__summary">
                    <span>{rule}</span>
                    <span className="lesson-accordion__chevron" aria-hidden="true">&rsaquo;</span>
                  </summary>
                  <div className="lesson-accordion__content">
                    <p>
                      <strong>Latar belakang kultural:</strong> {country.cultureNote}
                    </p>
                  </div>
                </details>
              ))}
            </div>

            <div style={{ marginTop: 32 }}>
              <button
                type="button"
                disabled={!allEtiketOpened}
                className="dashboard-btn dashboard-btn--primary"
                onClick={handleEtiketContinue}
              >
                {t('lesson.continueToBahasa')} &rarr;
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Bahasa */}
        {currentStep === 'bahasa' && (
          <section className="lesson-step-content" aria-labelledby="bahasa-heading">
            <h2 id="bahasa-heading" className="dashboard-header__title" style={{ fontSize: '1.5rem' }}>
              {t('lesson.step3Title')}: Sapaan & Tiga Frasa Kunci
            </h2>
            <p className="dashboard-header__desc" style={{ marginBottom: 24 }}>
              {t('lesson.bahasaInstructions')}
            </p>

            {/* Greeting */}
            <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: '1px solid var(--line)' }}>
              <span className="dashboard-header__eyebrow">Sapaan Resmi ({country.language.nameId})</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', color: 'var(--ink)' }}>
                    {country.greeting.native}
                  </span>
                  <span style={{ fontStyle: 'italic', color: 'var(--ink-muted)', marginLeft: 8 }}>
                    ({country.greeting.roman})
                  </span>
                  <div style={{ color: 'var(--ink-muted)', fontSize: '0.875rem', marginTop: 4 }}>
                    {country.greeting.meaningId} · {country.greeting.register}
                  </div>
                </div>
                {isSpeechSupported() && (
                  <button
                    type="button"
                    className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                    onClick={() => handlePlayAudio(country.greeting.native, country.greeting.roman)}
                  >
                    {t('lesson.listen')}
                  </button>
                )}
              </div>
            </div>

            {/* 3 Phrases */}
            <ul className="lesson-phrase-list">
              {country.phrases.slice(0, 3).map((phrase, idx) => (
                <li key={phrase.id} className="lesson-phrase-item">
                  <div className="lesson-phrase-item__text">
                    <span className="lesson-phrase-item__native">{phrase.native}</span>
                    {phrase.roman && phrase.roman !== phrase.native ? (
                      <span className="lesson-phrase-item__roman">({phrase.roman})</span>
                    ) : null}
                    <div className="lesson-phrase-item__meaning">{phrase.id}</div>
                  </div>

                  <div className="lesson-phrase-item__actions">
                    {isSpeechSupported() && (
                      <button
                        type="button"
                        className="dashboard-btn dashboard-btn--secondary dashboard-btn--small"
                        onClick={() => handlePlayAudio(phrase.native, phrase.roman)}
                      >
                        {t('lesson.listen')}
                      </button>
                    )}

                    <label className="lesson-checkbox-label">
                      <input
                        type="checkbox"
                        checked={Boolean(checkedPhrases[idx])}
                        onChange={(e) =>
                          setCheckedPhrases((prev) => ({
                            ...prev,
                            [idx]: e.target.checked,
                          }))
                        }
                      />
                      <span>{t('lesson.markLearned')}</span>
                    </label>
                  </div>
                </li>
              ))}
            </ul>

            <div style={{ marginTop: 32 }}>
              <button
                type="button"
                disabled={!allPhrasesChecked}
                className="dashboard-btn dashboard-btn--primary"
                onClick={handleBahasaContinue}
              >
                {t('lesson.continueToQuest')} &rarr;
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
