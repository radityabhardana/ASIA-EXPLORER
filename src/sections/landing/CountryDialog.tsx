import { useEffect, useRef } from 'react';
import type { MouseEvent } from 'react';
import { Link } from 'react-router-dom';

import type { Country } from '@/content/countries';
import { differs, profileFor } from '@/sections/country/scripts';

type CountryDialogProps = {
  country: Country | null;
  onClose: () => void;
};

/**
 * Popup negara (§0.5, §6): `<dialog>` native + `showModal`, jadi focus trap
 * dan pengembalian fokus ditangani peramban. Fokus awal ke tombol tutup.
 */
export default function CountryDialog({ country, onClose }: CountryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (country && !dialog.open) {
      dialog.showModal();
      closeRef.current?.focus();
      return;
    }
    if (!country && dialog.open) {
      dialog.close();
    }
  }, [country]);

  const handleBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  const profile = country ? profileFor(country) : null;

  return (
    <dialog
      ref={dialogRef}
      className="landing-dialog"
      aria-labelledby="landing-dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={handleBackdrop}
    >
      {country && profile ? (
        <div className="landing-dialog__panel">
          <button
            ref={closeRef}
            type="button"
            className="landing-dialog__close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>

          <h2 className="landing-dialog__title" id="landing-dialog-title">
            {country.nameId}
          </h2>
          <p className="landing-dialog__native" lang={profile.lang} dir={profile.dir}>
            {country.greeting.native}
          </p>
          {differs(country.greeting.native, country.greeting.roman) ? (
            <p className="landing-dialog__roman">{country.greeting.roman}</p>
          ) : null}
          <p className="landing-dialog__meaning">{country.greeting.meaningId}</p>
          <p className="landing-dialog__meta">Bahasa: {country.language.nameId}</p>
          {country.hasPage !== false ? (
            <Link className="landing-dialog__action" to={`/negara/${country.id}`}>
              Jelajahi {country.nameId}
            </Link>
          ) : (
            <div
              className="landing-dialog__action"
              style={{
                fontSize: 'var(--text-body)',
                color: 'var(--ink-muted)',
                fontFamily: 'var(--font-text)',
              }}
            >
              Kawasan {country.region} · Ibu kota: {country.capital || '-'}
            </div>
          )}
        </div>
      ) : null}
    </dialog>
  );
}
