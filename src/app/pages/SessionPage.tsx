import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SESSION_CONTENT } from '@/data/session-content';
import { getCountry } from '@/content/countries';
import { profileFor } from '@/sections/country/scripts';
import { cancelSpeech } from '@/lib/speech';
import SessionProgress from '@/sections/session/SessionProgress';
import StoryPhase from '@/sections/session/StoryPhase';
import type { StoryPanel } from '@/sections/session/StoryPhase';
import AudioQuestPhase from '@/sections/session/AudioQuestPhase';
import BuildPhase from '@/sections/session/BuildPhase';
import RewardOverlay from '@/sections/session/RewardOverlay';

import type { SessionPhase } from '@/lib/useSessionEngine';
import { useSessionEngine } from '@/lib/useSessionEngine';

import '@/styles/session.css';

export default function SessionPage() {
  const { countryId } = useParams<{ countryId: string }>();
  const navigate = useNavigate();

  const country = countryId ? getCountry(countryId) : undefined;
  const content = countryId ? SESSION_CONTENT[countryId] : undefined;

  // Redirect if missing data
  useEffect(() => {
    if (!country || !content) {
      navigate('/dashboard/negara', { replace: true });
    }
  }, [country, content, navigate]);

  const engine = useSessionEngine(content!);

  // Persist results when reward phase is reached (once)
  const [finishing, setFinishing] = useState(false);
  useEffect(() => {
    if (engine.phase === 'reward' && !finishing) {
      setFinishing(true);
      engine.finishSession().catch(() => {/* ignore persistence errors */});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engine.phase]);

  const handleContinue = () => {
    cancelSpeech();
    navigate('/dashboard/negara');
  };

  if (!country || !content) return null;

  const textProfile = profileFor(country);

  // Build 4 story panels from available country fields
  const storyPanels: StoryPanel[] = [
    {
      id: 'kenali',
      title: `Kenali ${country.nameId}`,
      body: country.story.text,
      funFact: country.cultureNote,
      funFactLabel: 'Tahukah kamu?',
      backgroundVariant: 'kenali',
    },
    {
      id: 'budaya',
      title: 'Budaya & Etiket',
      body: country.peopleNote,
      funFact: country.cultureNote,
      funFactLabel: 'Fakta Budaya',
      backgroundVariant: 'budaya',
    },
    {
      id: 'bahasa',
      title: `Bahasa: ${country.language.nameId}`,
      body: `${country.language.nameId} (${country.language.nativeName}) termasuk rumpun ${country.language.family}. Ditulis dengan aksara ${country.language.script}. ${country.language.note}`,
      funFact: `Sapaan: "${country.greeting.native}" — ${country.greeting.meaningId}`,
      funFactLabel: 'Fakta Bahasa',
      backgroundVariant: 'bahasa',
    },
    {
      id: 'kuliner',
      title: 'Frasa Dasar',
      body: country.phrases
        .map((p) => `${p.native} (${p.roman})`)
        .join(' · '),
      funFact: country.greeting.register,
      funFactLabel: 'Catatan Sapaan',
      backgroundVariant: 'kuliner',
    },
  ];

  const {
    phase,
    challengeIndex,
    streak,
    xp,
    badgeUnlocked,
    completeStory,
    submitAudioAnswer,
    submitBuildAnswer,
    useHint: _useHint,
  } = engine;

  const totalAudio = content.audioQuests.length;
  const totalBuild = content.buildChallenges.length;

  // Current challenge for each phase
  const currentAudioChallenge = content.audioQuests[challengeIndex];
  const currentBuildChallenge = content.buildChallenges[challengeIndex];

  return (
    <div className="session-page-wrap">
      {/* Ambient Explorer Desk Wash (Consistent Across All Session Phases) */}
      <div className="sk-atmo" aria-hidden="true" />
      <img src="/landing-pages/meng-to-sketchbook/botany-left.png" alt="" className="sk-botany-left" aria-hidden="true" />
      <img src="/landing-pages/meng-to-sketchbook/botany-right.png" alt="" className="sk-botany-right" aria-hidden="true" />

      {/* Sticky progress — always visible except reward */}
      {phase !== 'reward' && (
        <SessionProgress
          phase={phase as SessionPhase}
          challengeIndex={challengeIndex}
          totalAudioQuests={totalAudio}
          totalBuildChallenges={totalBuild}
          xp={xp}
          streak={streak}
        />
      )}

      {phase === 'story' && (
        <StoryPhase
          countryId={country.id}
          countryName={country.nameId}
          speechLang={textProfile.speechLang}
          panels={storyPanels}
          onComplete={completeStory}
        />
      )}

      {phase === 'audio-quest' && currentAudioChallenge && (
        <AudioQuestPhase
          key={currentAudioChallenge.id}
          challenge={currentAudioChallenge}
          challengeNumber={challengeIndex + 1}
          totalChallenges={totalAudio}
          onAnswer={(correct, elapsedMs) => {
            submitAudioAnswer(currentAudioChallenge.id, correct, elapsedMs);
          }}
        />
      )}

      {phase === 'build' && currentBuildChallenge && (
        <BuildPhase
          key={currentBuildChallenge.id}
          challenge={currentBuildChallenge}
          challengeNumber={challengeIndex + 1}
          totalChallenges={totalBuild}
          onAnswer={(correct, hintsUsed, elapsedMs) => {
            submitBuildAnswer(currentBuildChallenge.id, correct, hintsUsed, elapsedMs);
          }}
        />
      )}

      {phase === 'reward' && (
        <RewardOverlay
          countryId={country.id}
          countryName={country.nameId}
          xp={xp}
          streakPeak={streak}
          badgeUnlocked={badgeUnlocked}
          onContinue={handleContinue}
        />
      )}
    </div>
  );
}
