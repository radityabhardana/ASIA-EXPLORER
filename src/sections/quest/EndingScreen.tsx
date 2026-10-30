import { useEffect, useState } from 'react';
import type { Ending, CultureNote, StoryQuest } from '@/lib/story-quest/types';
import { getDiscoveredEndings } from '@/lib/story-quest/storage';
import {
  Trophy,
  Award,
  Sparkles,
  RotateCcw,
  Compass,
  BookOpen,
  CheckCircle2,
  Heart,
} from 'lucide-react';

interface EndingScreenProps {
  ending: Ending;
  earnedXp: number;
  discoveredNotes: CultureNote[];
  respect: number;
  quest: StoryQuest;
  profileId: string;
  onReplay: () => void;
  onExit: () => void;
}

const tierConfig = {
  sahabat: {
    label: 'Hubungan Istimewa',
    icon: Trophy,
    themeClass: 'sq-ending-hero--sahabat',
    badgeClass: 'sq-ending-badge--sahabat',
    subtext: 'Kamu menunjukkan pemahaman etiket mendalam dan memenangkan hati tuan rumah!',
  },
  diterima: {
    label: 'Kunjungan Berkesan',
    icon: Award,
    themeClass: 'sq-ending-hero--diterima',
    badgeClass: 'sq-ending-badge--diterima',
    subtext: 'Kamu menjaga tata krama dengan baik dan diterima sebagai tamu terhormat.',
  },
  canggung: {
    label: 'Pelajaran Budaya',
    icon: Sparkles,
    themeClass: 'sq-ending-hero--canggung',
    badgeClass: 'sq-ending-badge--canggung',
    subtext: 'Ada beberapa gesekan budaya, namun ini menjadi bekal pembelajaran etiket berharga.',
  },
};

export default function EndingScreen({
  ending,
  earnedXp,
  discoveredNotes,
  respect,
  quest,
  profileId,
  onReplay,
  onExit,
}: EndingScreenProps) {
  const currentTier = tierConfig[ending.id] ?? tierConfig.diterima;
  const TierIcon = currentTier.icon;

  // Unlocked endings tracker for replay encouragement
  const [unlockedEndings, setUnlockedEndings] = useState<string[]>([]);

  useEffect(() => {
    if (profileId) {
      const discovered = getDiscoveredEndings(profileId, quest.countryId);
      setUnlockedEndings(discovered);
    }
  }, [profileId, quest.countryId]);

  // Efek confetti jika meraih status Sahabat
  useEffect(() => {
    if (ending.id === 'sahabat') {
      try {
        const testCanvas = document.createElement('canvas');
        if (!testCanvas.getContext || !testCanvas.getContext('2d')) {
          return;
        }
      } catch {
        return;
      }

      import('canvas-confetti')
        .then(({ default: confetti }) => {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.65 },
            colors: ['#176b68', '#c27a23', '#ffd79e'],
          });
        })
        .catch(() => {
          // Lewati tanpa eror jika canvas-confetti tidak tersedia di env tes
        });
    }
  }, [ending.id]);

  return (
    <div className="sq-stage sq-stage--ending" role="main" aria-label="Hasil Petualangan Budaya">
      <div className="sq-ending-container">
        {/* Hero Card Akhir Cerita */}
        <section className={`sq-ending-hero ${currentTier.themeClass}`}>
          <div className="sq-intro-card__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>AKHIR PETUALANGAN • {quest.negara.toUpperCase()}</span>
          </div>

          <div className="sq-ending-hero__header">
            <div className={`sq-ending-badge ${currentTier.badgeClass}`}>
              <TierIcon size={22} aria-hidden="true" />
              <span>{currentTier.label}</span>
            </div>

            <div className="sq-ending-respect-pill" aria-label={`Rasa Hormat Akhir: ${respect}/100`}>
              <Heart size={14} className="sq-ending-respect-pill__icon" aria-hidden="true" />
              <span className="sq-ending-respect-pill__label">Rasa Hormat:</span>
              <strong className="sq-ending-respect-pill__value">{respect}</strong>
              <span className="sq-ending-respect-pill__denom">/100</span>
            </div>
          </div>

          <h1 className="sq-ending-title">{ending.judul}</h1>
          <p className="sq-ending-summary">“{ending.ringkasan}”</p>
          <p className="sq-ending-subtext">{currentTier.subtext}</p>
        </section>

        {/* Kotak Penghargaan & XP */}
        <section className="sq-ending-rewards-grid" aria-label="Hadiah dan Pencapaian">
          {/* XP Diperoleh */}
          <div className="sq-reward-card sq-reward-card--xp">
            <div className="sq-reward-card__icon-wrap">
              <Sparkles size={24} aria-hidden="true" />
            </div>
            <div className="sq-reward-card__info">
              <span className="sq-reward-card__label">XP BUDAYA DIPEROLEH</span>
              <div className="sq-reward-card__value-row">
                <span className="sq-reward-card__number">+{earnedXp}</span>
                <span className="sq-reward-card__unit">XP</span>
              </div>
              <span className="sq-reward-card__note">Maksimal +60 XP per petualangan</span>
            </div>
          </div>

          {/* Koleksi Catatan Budaya */}
          <div className="sq-reward-card sq-reward-card--notes">
            <div className="sq-reward-card__icon-wrap">
              <BookOpen size={24} aria-hidden="true" />
            </div>
            <div className="sq-reward-card__info">
              <span className="sq-reward-card__label">CATATAN BUDAYA TERBUKA</span>
              <div className="sq-reward-card__value-row">
                <span className="sq-reward-card__number">{discoveredNotes.length}</span>
                <span className="sq-reward-card__unit">Catatan</span>
              </div>
              <span className="sq-reward-card__note">Tersimpan permanen di jurnalmu</span>
            </div>
          </div>
        </section>

        {/* Daftar Catatan Budaya yang Terbuka dalam Sesi Ini */}
        {discoveredNotes.length > 0 && (
          <section className="sq-ending-notes-section" aria-label="Catatan budaya yang dikoleksi">
            <div className="sq-ending-section-header">
              <BookOpen size={16} aria-hidden="true" />
              <h2 className="sq-ending-section-title">Wawasan Budaya yang Kamu Pelajari</h2>
            </div>

            <div className="sq-ending-notes-list">
              {discoveredNotes.map((note, idx) => (
                <div key={idx} className="sq-ending-note-item">
                  <div className="sq-ending-note-item__top">
                    <span className="sq-note-card__tag">{note.kategori}</span>
                    <span className="sq-ending-note-item__check">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      <span>Tersimpan</span>
                    </span>
                  </div>
                  <h3 className="sq-ending-note-item__title">{note.judul}</h3>
                  <p className="sq-ending-note-item__excerpt">{note.isi}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pelacak Akhir Cerita (Replay Value) */}
        <section className="sq-ending-tracker" aria-label="Koleksi akhir cerita negara ini">
          <div className="sq-ending-section-header">
            <Trophy size={16} aria-hidden="true" />
            <h2 className="sq-ending-section-title">Koleksi Akhir Cerita ({unlockedEndings.length}/3)</h2>
          </div>

          <p className="sq-ending-tracker__hint">
            Petualangan ini memiliki alur bercabang. Coba kombinasi bekal dan pilihan tindakan lain
            untuk membuka seluruh akhir cerita!
          </p>

          <div className="sq-ending-tracker__badges">
            {(['sahabat', 'diterima', 'canggung'] as const).map((tierKey) => {
              const isUnlocked = unlockedEndings.includes(tierKey);
              const tierInfo = tierConfig[tierKey];

              return (
                <div
                  key={tierKey}
                  className={`sq-tracker-badge ${
                    isUnlocked ? 'sq-tracker-badge--unlocked' : 'sq-tracker-badge--locked'
                  }`}
                >
                  <span className="sq-tracker-badge__dot" />
                  <span className="sq-tracker-badge__name">{tierInfo.label}</span>
                  {isUnlocked && <CheckCircle2 size={12} className="sq-tracker-badge__check" />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="sq-ending-actions">
          <button
            type="button"
            className="sq-btn sq-btn--secondary"
            onClick={onReplay}
            aria-label="Mainkan Ulang Petualangan"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Mainkan Ulang (Jelajahi Jalur Lain)</span>
          </button>

          <button
            type="button"
            className="sq-btn sq-btn--primary"
            onClick={onExit}
            aria-label="Selesai dan Kembali ke Katalog Quest"
          >
            <span>Selesai & Kembali ke Katalog</span>
            <Compass size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
