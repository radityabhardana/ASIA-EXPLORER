import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate, useParams, Navigate, Link } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';
import { getCountry } from '@/content/countries';
import { getQuestItemsForCountry, isLengkapCountry } from '@/content/quests';
import type {
  Answer,
  Attempt,
  EtiquetteMcqItem,
  PhraseMatchItem,
  BranchScenarioItem,
  QuestItem,
} from '@/lib/storage/types';
import {
  getLesson,
  getOpenAttempt,
  getProgress,
  saveAttempt,
  saveLesson,
  saveProgress,
} from '@/lib/storage/db';
import '@/styles/dashboard.css';

export default function QuestPage() {
  const { countryId } = useParams<{ countryId?: string }>();
  const { profile } = useProfile();
  const { t } = useI18n();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  // Active item state
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemStartTimeRef = useRef<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [currentAnswer, setCurrentAnswer] = useState<Answer | null>(null);

  // Input states per item kind
  const [selectedMcq, setSelectedMcq] = useState<number | null>(null);
  const [matchSelections, setMatchSelections] = useState<Record<number, string>>({});
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const feedbackRef = useRef<HTMLDivElement>(null);

  const profileId = profile?.id ?? '';

  const country = useMemo(() => {
    return countryId ? getCountry(countryId) : undefined;
  }, [countryId]);

  const allItems = useMemo(() => {
    return countryId ? getQuestItemsForCountry(countryId) : [];
  }, [countryId]);

  useEffect(() => {
    if (!profileId || !countryId || allItems.length === 0) return;

    let isMounted = true;
    getOpenAttempt(profileId, countryId)
      .then(async (open) => {
        if (!isMounted) return;
        if (open && open.answers.length < open.itemIds.length) {
          // Resume in-progress attempt
          setAttempt(open);
          setCurrentIndex(open.answers.length);
          itemStartTimeRef.current = Date.now();
          setLoading(false);
        } else {
          // Create new attempt
          const newAttempt: Attempt = {
            id: crypto.randomUUID(),
            profileId,
            countryId,
            itemIds: allItems.map((item) => item.id),
            answers: [],
            startedAt: Date.now(),
            finishedAt: null,
            durationMs: null,
            mode: 'full',
          };
          await saveAttempt(newAttempt);
          if (isMounted) {
            setAttempt(newAttempt);
            setCurrentIndex(0);
            itemStartTimeRef.current = Date.now();
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
  }, [profileId, countryId, allItems]);

  if (!countryId || !isLengkapCountry(countryId) || !country) {
    return <Navigate to="/dashboard" replace />;
  }

  const activeItem: QuestItem | undefined = allItems[currentIndex];
  const totalItems = allItems.length;

  // Handle Answer Submission
  const handleSubmit = async () => {
    if (!activeItem || !attempt || submitted) return;

    let isCorrect = false;
    let givenValue: string | string[] = '';

    if (activeItem.kind === 'etiquette') {
      if (selectedMcq === null) return;
      isCorrect = selectedMcq === (activeItem as EtiquetteMcqItem).correctIndex;
      givenValue = String(selectedMcq);
    } else if (activeItem.kind === 'match') {
      const matchItem = activeItem as PhraseMatchItem;
      // All pairs must match exactly
      const allMatched = matchItem.pairs.every((pair) => {
        return matchSelections[pair.phraseIndex] === pair.meaningId;
      });
      isCorrect = allMatched;
      givenValue = matchItem.pairs.map((p) => matchSelections[p.phraseIndex] ?? '');
    } else if (activeItem.kind === 'branch') {
      const branchItem = activeItem as BranchScenarioItem;
      const chosenOpt = branchItem.options.find((o) => o.id === selectedBranch);
      if (!chosenOpt) return;
      isCorrect = chosenOpt.correct === true;
      givenValue = chosenOpt.id;
    }

    const elapsedMs = Math.max(100, Date.now() - (itemStartTimeRef.current || Date.now()));
    const newAnswer: Answer = {
      itemId: activeItem.id,
      given: givenValue,
      correct: isCorrect,
      elapsedMs,
    };

    const updatedAnswers = [...attempt.answers, newAnswer];
    const isFinished = updatedAnswers.length >= totalItems;

    const updatedAttempt: Attempt = {
      ...attempt,
      answers: updatedAnswers,
      finishedAt: isFinished ? Date.now() : null,
      durationMs: isFinished ? Date.now() - attempt.startedAt : null,
    };

    await saveAttempt(updatedAttempt);
    setAttempt(updatedAttempt);
    setCurrentAnswer(newAnswer);
    setSubmitted(true);

    // If finished on last item, update lesson progress and country progress
    if (isFinished) {
      const currentLesson = await getLesson(profileId, countryId);
      const stepsDone = currentLesson?.stepsDone ?? [];
      const updatedSteps = Array.from(new Set([...stepsDone, 'quest' as const]));

      await saveLesson({
        profileId,
        countryId,
        stepsDone: updatedSteps,
        startedAt: currentLesson?.startedAt ?? Date.now(),
        completedAt: Date.now(),
      });

      const prog = await getProgress(profileId);
      const countriesMap = prog?.countries ?? {};
      const existingRecord = countriesMap[countryId] ?? {
        openedAt: Date.now(),
        lastSeenAt: Date.now(),
        lessonCompletedAt: null,
        storySeen: false,
      };

      await saveProgress({
        profileId,
        countries: {
          ...countriesMap,
          [countryId]: {
            ...existingRecord,
            lastSeenAt: Date.now(),
            lessonCompletedAt: Date.now(),
          },
        },
        lastAttemptId: updatedAttempt.id,
      });
    }

    // Move keyboard focus to reason/feedback element per SPEC_DASHBOARD §4
    setTimeout(() => {
      feedbackRef.current?.focus();
    }, 50);
  };

  // Continue to next item or result page
  const handleNext = () => {
    if (!attempt) return;
    const nextIdx = currentIndex + 1;

    if (nextIdx >= totalItems) {
      navigate(`/dashboard/quest/${countryId}/${attempt.id}`, { replace: true });
    } else {
      setCurrentIndex(nextIdx);
      setSubmitted(false);
      setCurrentAnswer(null);
      setSelectedMcq(null);
      setMatchSelections({});
      setSelectedBranch(null);
      itemStartTimeRef.current = Date.now();
    }
  };

  if (loading || !activeItem) {
    return (
      <div className="quest-page">
        <div className="dashboard-container">
          <div className="dashboard-loading" role="status">
            <p className="dashboard-loading__text">{t('profile.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  const isLastItem = currentIndex === totalItems - 1;
  const progressPercent = Math.round(((currentIndex + (submitted ? 1 : 0)) / totalItems) * 100);

  // Meaning options for match item
  const matchMeanings =
    activeItem.kind === 'match'
      ? (activeItem as PhraseMatchItem).pairs.map((p) => p.meaningId)
      : [];

  return (
    <div className="quest-page">
      <div className="dashboard-container">
        {/* Header & Back link */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/dashboard" className="lesson-story-link">
            {t('lesson.backToDashboard')}
          </Link>
        </div>

        <header className="dashboard-header" style={{ marginBottom: 24, paddingBottom: 16 }}>
          <span className="dashboard-header__eyebrow">
            {country.region} · {country.nameId}
          </span>
          <h1 className="dashboard-header__title" style={{ fontSize: '1.75rem' }}>
            Quest Evaluasi Budaya: {country.nameId}
          </h1>
        </header>

        {/* Hairline Progress Indicator */}
        <div>
          <span className="quest-step-indicator">
            {t('quest.itemCounter')
              .replace('{current}', String(currentIndex + 1))
              .replace('{total}', String(totalItems))}
          </span>
          <div className="quest-hairline-progress" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
            <div className="quest-hairline-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>

        {/* 1. MCQ Etiquette Item */}
        {activeItem.kind === 'etiquette' && (
          <section aria-labelledby="mcq-prompt">
            <h2 id="mcq-prompt" className="quest-prompt">
              {activeItem.prompt}
            </h2>

            <div className="quest-options-list" role="radiogroup" aria-labelledby="mcq-prompt">
              {activeItem.options.map((opt, idx) => (
                <label
                  key={idx}
                  className={`quest-option ${
                    selectedMcq === idx ? 'quest-option--selected' : ''
                  } ${submitted ? 'quest-option--locked' : ''}`}
                >
                  <input
                    type="radio"
                    name={`mcq-${activeItem.id}`}
                    value={idx}
                    disabled={submitted}
                    checked={selectedMcq === idx}
                    onChange={() => setSelectedMcq(idx)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* 2. Phrase Match Item */}
        {activeItem.kind === 'match' && (
          <section aria-labelledby="match-prompt">
            <h2 id="match-prompt" className="quest-prompt">
              {activeItem.prompt}
            </h2>

            <div className="quest-options-list">
              {activeItem.pairs.map((pair, pIdx) => {
                const phraseObj = country.phrases[pair.phraseIndex];
                return (
                  <div key={pIdx} className="quest-match-slot">
                    <div>
                      <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem' }}>
                        {phraseObj?.native ?? `Frasa #${pair.phraseIndex + 1}`}
                      </strong>
                      {phraseObj?.roman && phraseObj.roman !== phraseObj.native ? (
                        <span style={{ fontStyle: 'italic', color: 'var(--ink-muted)', marginLeft: 8 }}>
                          ({phraseObj.roman})
                        </span>
                      ) : null}
                    </div>

                    <div>
                      <select
                        disabled={submitted}
                        value={matchSelections[pair.phraseIndex] ?? ''}
                        onChange={(e) =>
                          setMatchSelections((prev) => ({
                            ...prev,
                            [pair.phraseIndex]: e.target.value,
                          }))
                        }
                        className="profile-dialog__input"
                        style={{ minWidth: 220 }}
                      >
                        <option value="">-- Pilih padanan arti --</option>
                        {matchMeanings.map((m, mIdx) => (
                          <option key={mIdx} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* 3. Branch Scenario Item */}
        {activeItem.kind === 'branch' && (
          <section aria-labelledby="branch-prompt">
            <h2 id="branch-prompt" className="quest-prompt">
              {activeItem.scenario}
            </h2>

            <div className="quest-options-list" role="radiogroup" aria-labelledby="branch-prompt">
              {activeItem.options.map((opt) => (
                <label
                  key={opt.id}
                  className={`quest-option ${
                    selectedBranch === opt.id ? 'quest-option--selected' : ''
                  } ${submitted ? 'quest-option--locked' : ''}`}
                >
                  <input
                    type="radio"
                    name={`branch-${activeItem.id}`}
                    value={opt.id}
                    disabled={submitted}
                    checked={selectedBranch === opt.id}
                    onChange={() => setSelectedBranch(opt.id)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        {/* Submit or Continue Actions */}
        {!submitted ? (
          <div style={{ marginTop: 24 }}>
            <button
              type="button"
              className="dashboard-btn dashboard-btn--primary"
              onClick={handleSubmit}
            >
              {t('quest.checkAnswer')}
            </button>
          </div>
        ) : (
          <div>
            {/* Feedback & Cultural Reason */}
            <div
              ref={feedbackRef}
              tabIndex={-1}
              className={`quest-feedback ${
                currentAnswer?.correct
                  ? 'quest-feedback--correct'
                  : 'quest-feedback--incorrect'
              }`}
              role="region"
              aria-label="Penjelasan Umpan Balik"
            >
              <div className="quest-feedback__status">
                {currentAnswer?.correct
                  ? t('quest.correctStatus')
                  : t('quest.incorrectStatus')}
              </div>
              <p className="quest-feedback__reason">{activeItem.reason}</p>
              <div className="quest-feedback__source">
                {t('quest.sourceLabel')}:{' '}
                <a href={activeItem.sourceRef} target="_blank" rel="noopener noreferrer">
                  {activeItem.sourceRef}
                </a>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={handleNext}
              >
                {isLastItem ? t('quest.finishQuest') : t('quest.nextItem')} &rarr;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
