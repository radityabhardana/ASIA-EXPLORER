import { useEffect, useRef } from 'react';
import type { CultureNote, ChoiceReaction } from '@/lib/story-quest/types';
import { BookOpen, CheckCircle, ArrowRight, MessageSquareQuote } from 'lucide-react';

interface CultureNoteCardProps {
  note: CultureNote;
  reaction: ChoiceReaction;
  npcName: string;
  onContinue: () => void;
}

export default function CultureNoteCard({
  note,
  reaction,
  npcName,
  onContinue,
}: CultureNoteCardProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Auto-focus tombol lanjut agar aksesibel & keyboard-friendly
  useEffect(() => {
    buttonRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onContinue();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  return (
    <div
      className="sq-note-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sq-note-title"
    >
      <div className="sq-note-backdrop" onClick={onContinue} aria-hidden="true" />

      <div className="sq-note-panel">
        {/* Header reaksi NPC */}
        <div className="sq-note-reaction">
          <div className="sq-note-reaction__bubble">
            <div className="sq-note-reaction__header">
              <MessageSquareQuote size={13} aria-hidden="true" />
              <span>Tanggapan {npcName}</span>
            </div>
            <p className="sq-note-reaction__text">“{reaction.teks}”</p>
          </div>
        </div>

        {/* Kartu Catatan Budaya */}
        <div className="sq-note-card">
          <div className="sq-note-card__eyebrow">
            <span className="sq-note-card__tag">
              <BookOpen size={11} aria-hidden="true" />
              {note.kategori.toUpperCase()}
            </span>
            <span className="sq-note-card__saved-pill">
              <CheckCircle size={11} aria-hidden="true" />
              Tersimpan ke Koleksi Catatan
            </span>
          </div>

          <h3 id="sq-note-title" className="sq-note-card__title">
            {note.judul}
          </h3>

          <p className="sq-note-card__body">{note.isi}</p>
        </div>

        {/* Tombol Lanjut */}
        <div className="sq-note-footer">
          <button
            ref={buttonRef}
            type="button"
            className="sq-note-continue-btn"
            onClick={onContinue}
            aria-label="Lanjutkan Cerita"
          >
            <span>Lanjutkan Cerita</span>
            <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
