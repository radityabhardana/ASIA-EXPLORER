import { useState, useEffect, useRef } from 'react';
import type { StoryQuest, Choice } from '@/lib/story-quest/types';
import { useStoryQuestEngine } from '@/lib/story-quest/useStoryQuestEngine';
import RespectMeter from './RespectMeter';
import NpcAvatar from './NpcAvatar';
import DialogBox from './DialogBox';
import ChoiceList from './ChoiceList';
import CultureNoteCard from './CultureNoteCard';
import PackingScreen from './PackingScreen';
import EndingScreen from './EndingScreen';
import { ArrowLeft, Clock, Coffee, AlertCircle, Compass, MapPin } from 'lucide-react';
import { NpcAvatarBadge } from './QuestIcons';
import '@/styles/story-quest.css';

interface StoryQuestStageProps {
  quest: StoryQuest;
  profileId: string;
  onExit: () => void;
  onComplete?: (ending: import('@/lib/story-quest/types').Ending, earnedXp: number) => void;
  renderPacking?: (props: {
    quest: StoryQuest;
    inventory: string[];
    onToggleItem: (id: string) => void;
    onStart: () => void;
  }) => React.ReactNode;
  renderEnding?: (props: {
    ending: NonNullable<ReturnType<typeof useStoryQuestEngine>['achievedEnding']>;
    earnedXp: number;
    discoveredNotes: ReturnType<typeof useStoryQuestEngine>['discoveredNotes'];
    respect: number;
    quest: StoryQuest;
    onReplay: () => void;
    onExit: () => void;
  }) => React.ReactNode;
}

export default function StoryQuestStage({
  quest,
  profileId,
  onExit,
  onComplete,
  renderPacking,
  renderEnding,
}: StoryQuestStageProps) {
  const {
    phase,
    currentScene,
    currentSceneId,
    respect,
    respectDeltaNotice,
    inventory,
    flags,
    discoveredNotes,
    activeNote,
    activeReaction,
    achievedEnding,
    earnedXp,
    relaxMode,
    startPacking,
    togglePackingItem,
    confirmPackingAndStart,
    selectChoice,
    continueFromNote,
    toggleRelaxMode,
    restartQuest,
  } = useStoryQuestEngine({
    quest,
    profileId,
    onComplete,
  });

  const [confirmExitOpen, setConfirmExitOpen] = useState(false);

  // Timer situasi genting
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalScenes = quest.adegan.length;
  const currentSceneIndex = quest.adegan.findIndex((s) => s.id === currentSceneId);
  const activeSceneNumber = currentSceneIndex >= 0 ? currentSceneIndex + 1 : 1;

  // Setup timer jika adegan memiliki timer dan mode santai tidak aktif
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (phase === 'playing' && typeof currentScene.timer === 'number' && !relaxMode) {
      const initialSeconds = currentScene.timer;
      setTimeLeft(initialSeconds);

      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            // Timeout reached! Pilih timeoutChoiceId jika ada
            if (currentScene.timeoutChoiceId) {
              const fallback = currentScene.pilihan.find(
                (c) => c.id === currentScene.timeoutChoiceId,
              );
              if (fallback) {
                selectChoice(fallback);
              }
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeLeft(null);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentScene, phase, relaxMode, selectChoice]);

  // Handle fase Intro bawaan jika belum ada PackingScreen khusus
  if (phase === 'intro') {
    return (
      <div className="sq-stage sq-stage--intro">
        <div className="sq-intro-card">
          <div className="sq-intro-card__eyebrow">
            <Compass size={14} aria-hidden="true" />
            <span>MISI BUDAYA & ETIKET • {quest.negara.toUpperCase()}</span>
          </div>

          <h1 className="sq-intro-card__title">{quest.judul}</h1>
          <p className="sq-intro-card__lead">{quest.pengantar}</p>

          <div className="sq-intro-card__npc-preview">
            <NpcAvatarBadge
              avatar={quest.npc.avatar}
              nama={quest.npc.nama}
              countryId={quest.countryId}
              size="medium"
            />
            <div className="sq-intro-card__npc-text">
              <strong>{quest.npc.nama}</strong>
              <span>{quest.npc.peran}</span>
            </div>
          </div>

          <div className="sq-intro-card__actions">
            <button
              type="button"
              className="sq-btn sq-btn--primary"
              onClick={startPacking}
            >
              Mulai Petualangan & Siapkan Bekal
            </button>
            <button
              type="button"
              className="sq-btn sq-btn--text"
              onClick={onExit}
            >
              Kembali ke Katalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle fase Packing
  if (phase === 'packing') {
    if (renderPacking) {
      return (
        <div className="sq-stage">
          {renderPacking({
            quest,
            inventory,
            onToggleItem: togglePackingItem,
            onStart: confirmPackingAndStart,
          })}
        </div>
      );
    }
    return (
      <PackingScreen
        quest={quest}
        selectedItems={inventory}
        onToggleItem={togglePackingItem}
        onConfirm={confirmPackingAndStart}
        onBack={restartQuest}
      />
    );
  }

  // Handle fase Ending
  if (phase === 'ending' && achievedEnding) {
    if (renderEnding) {
      return (
        <div className="sq-stage">
          {renderEnding({
            ending: achievedEnding,
            earnedXp,
            discoveredNotes,
            respect,
            quest,
            onReplay: restartQuest,
            onExit,
          })}
        </div>
      );
    }
    return (
      <EndingScreen
        ending={achievedEnding}
        earnedXp={earnedXp}
        discoveredNotes={discoveredNotes}
        respect={respect}
        quest={quest}
        profileId={profileId}
        onReplay={restartQuest}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="sq-stage">
      {/* HUD Header */}
      <header className="sq-hud">
        <div className="sq-hud__left">
          <button
            type="button"
            className="sq-hud__btn-back"
            onClick={() => setConfirmExitOpen(true)}
            aria-label="Kembali ke Katalog Quest"
            title="Keluar dari quest"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            <span>Katalog</span>
          </button>

          <div className="sq-hud__title-wrap">
            <span className="sq-hud__country-badge">{quest.negara}</span>
            <span className="sq-hud__quest-title">{quest.judul}</span>
          </div>
        </div>

        {/* Scene Dots */}
        <div className="sq-hud__center">
          <div className="sq-hud__dots-wrap" aria-label={`Adegan ${activeSceneNumber} dari ${totalScenes}`}>
            <span className="sq-hud__scene-label">
              Adegan {String(activeSceneNumber).padStart(2, '0')}/{String(totalScenes).padStart(2, '0')}
            </span>
            <div className="sq-hud__dots" aria-hidden="true">
              {quest.adegan.map((_, i) => (
                <span
                  key={i}
                  className={`sq-hud__dot ${
                    i === currentSceneIndex
                      ? 'sq-hud__dot--active'
                      : i < currentSceneIndex
                      ? 'sq-hud__dot--done'
                      : ''
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Respect Meter & Relax Toggle */}
        <div className="sq-hud__right">
          <RespectMeter respect={respect} deltaNotice={respectDeltaNotice} />

          <button
            type="button"
            className={`sq-hud__relax-btn ${relaxMode ? 'sq-hud__relax-btn--active' : ''}`}
            onClick={toggleRelaxMode}
            title={relaxMode ? 'Mode Santai Aktif (Timer dimatikan)' : 'Mode Standar (Timer genting aktif)'}
            aria-label={relaxMode ? 'Matikan Mode Santai' : 'Aktifkan Mode Santai'}
          >
            <Coffee size={14} aria-hidden="true" />
            <span className="sq-hud__relax-text">Mode Santai</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="sq-main-area">
        {/* Timer Bar jika situasi genting */}
        {timeLeft !== null && currentScene.timer && !relaxMode && (
          <div className="sq-timer-bar-wrap" role="timer" aria-label={`Sisa waktu: ${timeLeft} detik`}>
            <div className="sq-timer-bar-header">
              <span className="sq-timer-bar-label">
                <Clock size={12} aria-hidden="true" />
                SITUASI GENTING: Putuskan sebelum waktu habis!
              </span>
              <span className="sq-timer-bar-count">{timeLeft}s</span>
            </div>
            <div className="sq-timer-bar-track">
              <div
                className="sq-timer-bar-fill"
                style={{
                  width: `${(timeLeft / currentScene.timer) * 100}%`,
                  transition: 'width 1s linear',
                }}
              />
            </div>
          </div>
        )}

        {/* Latar Tempat */}
        <div className="sq-location-pill">
          <MapPin size={13} className="sq-location-pill__pin-icon" aria-hidden="true" />
          <span>{currentScene.latar}</span>
        </div>

        <div className="sq-stage-grid">
          {/* Sisi Kiri: NPC Portrait & Mood */}
          <div className="sq-stage-npc-col">
            <NpcAvatar
              npc={quest.npc}
              countryId={quest.countryId}
              expression={activeReaction?.ekspresi ?? currentScene.dialog.ekspresi}
            />
          </div>

          {/* Sisi Kanan: Dialog Box & Pilihan Tindakan */}
          <div className="sq-stage-interaction-col">
            <DialogBox
              narration={currentScene.narasi}
              speaker={currentScene.dialog.speaker}
              dialogText={currentScene.dialog.teks}
            />

            <div className="sq-choices-container">
              <ChoiceList
                choices={currentScene.pilihan}
                inventory={inventory}
                flags={flags}
                respect={respect}
                onSelectChoice={(choice: Choice) => selectChoice(choice)}
                disabled={phase === 'note'}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Catatan Budaya Modal/Drawer */}
      {phase === 'note' && activeNote && activeReaction && (
        <CultureNoteCard
          note={activeNote}
          reaction={activeReaction}
          npcName={quest.npc.nama}
          onContinue={continueFromNote}
        />
      )}

      {/* Konfirmasi Keluar Modal */}
      {confirmExitOpen && (
        <div className="sq-modal-overlay" role="dialog" aria-modal="true">
          <div className="sq-modal-backdrop" onClick={() => setConfirmExitOpen(false)} />
          <div className="sq-modal-box">
            <div className="sq-modal-header">
              <AlertCircle size={20} className="sq-modal-icon" aria-hidden="true" />
              <h3 className="sq-modal-title">Keluar dari Quest?</h3>
            </div>
            <p className="sq-modal-body">
              Progresmu hingga adegan saat ini tersimpan otomatis. Kamu bisa melanjutkannya kapan saja dari katalog.
            </p>
            <div className="sq-modal-actions">
              <button
                type="button"
                className="sq-btn sq-btn--secondary"
                onClick={() => setConfirmExitOpen(false)}
              >
                Lanjutkan Bermain
              </button>
              <button
                type="button"
                className="sq-btn sq-btn--primary"
                onClick={onExit}
              >
                Keluar ke Katalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
