import type { StoryQuest } from '@/lib/story-quest/types';
import { ArrowLeft, ArrowRight, Check, Sparkles, Lightbulb } from 'lucide-react';
import { BekalIcon } from './QuestIcons';

interface PackingScreenProps {
  quest: StoryQuest;
  selectedItems: string[];
  onToggleItem: (itemId: string) => void;
  onConfirm: () => void;
  onBack: () => void;
}

export default function PackingScreen({
  quest,
  selectedItems,
  onToggleItem,
  onConfirm,
  onBack,
}: PackingScreenProps) {
  const isReady = selectedItems.length === 2;
  const remainingCount = 2 - selectedItems.length;

  return (
    <div className="sq-stage sq-stage--packing" role="main" aria-label="Siapkan Bekal Petualangan">
      {/* Header navigasi */}
      <header className="sq-packing-header">
        <button
          type="button"
          className="sq-hud__btn-back"
          onClick={onBack}
          aria-label="Kembali ke Pengantar Quest"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Kembali</span>
        </button>

        <div className="sq-packing-header__counter" aria-live="polite">
          <span className={`sq-packing-counter-pill ${isReady ? 'sq-packing-counter-pill--ready' : ''}`}>
            {selectedItems.length} / 2 Bekal Dipilih
          </span>
        </div>
      </header>

      {/* Konten Utama */}
      <div className="sq-packing-container">
        <div className="sq-packing-intro">
          <div className="sq-intro-card__eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>SIAPKAN BEKAL • {quest.negara.toUpperCase()}</span>
          </div>

          <h1 className="sq-packing-title">Pilih 2 Bekal Petualangan</h1>
          <p className="sq-packing-subtitle">
            Setiap negara memiliki etiket dan kebiasaan khas. Bekal yang kamu bawa dapat membuka
            pilihan dialog khusus atau memberikan rasa hormat tambahan dari tuan rumah.
          </p>
        </div>

        {/* Grid 4 Kartu Bekal */}
        <div className="sq-packing-grid" role="group" aria-label="Daftar bekal yang tersedia">
          {quest.bekal.map((item) => {
            const isSelected = selectedItems.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                className={`sq-packing-card ${isSelected ? 'sq-packing-card--selected' : ''}`}
                onClick={() => onToggleItem(item.id)}
                aria-pressed={isSelected}
                aria-label={`${item.nama}${isSelected ? ' (Terpilih)' : ''}`}
              >
                <div className="sq-packing-card__top">
                  <div className="sq-packing-card__icon-ring" aria-hidden="true">
                    <BekalIcon icon={item.ikon} size={24} />
                  </div>

                  <div className="sq-packing-card__check-indicator" aria-hidden="true">
                    {isSelected ? (
                      <span className="sq-packing-check sq-packing-check--active">
                        <Check size={14} />
                      </span>
                    ) : (
                      <span className="sq-packing-check" />
                    )}
                  </div>
                </div>

                <div className="sq-packing-card__content">
                  <div className="sq-packing-card__meta">
                    {item.kategori && (
                      <span className="sq-packing-card__category">
                        {item.kategori.toUpperCase()}
                      </span>
                    )}
                    <span className="sq-packing-card__status">
                      {isSelected ? 'Terpilih' : 'Pilih Bekal'}
                    </span>
                  </div>

                  <h2 className="sq-packing-card__title">{item.nama}</h2>

                  {item.deskripsi && (
                    <p className="sq-packing-card__desc">{item.deskripsi}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Tips Etiket Budaya */}
        <div className="sq-packing-tip">
          <Lightbulb size={18} className="sq-packing-tip__icon" aria-hidden="true" />
          <p className="sq-packing-tip__text">
            <strong>Petunjuk Etiket:</strong> Bekal bukan sekadar barang bawaan, melainkan bentuk kesiapan
            menghargai norma lokal. Kamu dapat mengubah pilihan kapan saja sebelum menekan tombol mulai.
          </p>
        </div>

        {/* Action Button */}
        <div className="sq-packing-footer">
          <button
            type="button"
            className="sq-btn sq-btn--primary sq-packing-start-btn"
            disabled={!isReady}
            onClick={onConfirm}
            aria-label={
              isReady
                ? 'Mulai Petualangan Budaya'
                : `Pilih ${remainingCount} bekal lagi untuk memulai`
            }
          >
            <span>
              {isReady
                ? 'Mulai Petualangan Budaya'
                : `Pilih ${remainingCount} bekal lagi untuk memulai`}
            </span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
