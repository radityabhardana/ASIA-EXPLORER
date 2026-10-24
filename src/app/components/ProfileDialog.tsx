import { useEffect, useRef, useState, useCallback } from 'react';
import type { FormEvent, MouseEvent as ReactMouseEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useProfile } from '@/lib/profile';
import { useI18n } from '@/lib/i18n';

interface ProfileDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ProfileDialog({ isOpen: controlledIsOpen, onClose }: ProfileDialogProps) {
  const { profile, signIn } = useProfile();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const isUrlTriggered = searchParams.get('profil') === 'buat';
  const isOpen = controlledIsOpen ?? isUrlTriggered;

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const closeDialog = useCallback(() => {
    setName('');
    setError(null);
    if (onClose) {
      onClose();
    }
    if (isUrlTriggered) {
      const params = new URLSearchParams(window.location.search);
      params.delete('profil');
      const newSearch = params.toString();
      navigate(
        {
          pathname: window.location.pathname,
          search: newSearch ? `?${newSearch}` : '',
        },
        { replace: true },
      );
    }
  }, [isUrlTriggered, navigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          closeDialog();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, closeDialog]);

  if (!isOpen) return null;

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(t('profile.errorEmpty'));
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await signIn(trimmed);
      closeDialog();
      navigate('/dashboard');
    } catch {
      setError(t('profile.errorFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeDialog();
    }
  };

  return (
    <div
      className="profile-dialog-overlay"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="profile-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-dialog-title"
        aria-describedby="profile-dialog-desc"
        ref={dialogRef}
      >
        <div className="profile-dialog__header">
          <h2 id="profile-dialog-title" className="profile-dialog__title">
            {profile ? t('profile.dialogTitleExisting') : t('profile.dialogTitle')}
          </h2>
          <button
            type="button"
            className="profile-dialog__close"
            onClick={closeDialog}
            aria-label={t('profile.close')}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <p id="profile-dialog-desc" className="profile-dialog__desc">
          {t('profile.dialogDesc')}
        </p>

        {profile ? (
          <div className="profile-dialog__existing">
            <p className="profile-dialog__current-info">
              {t('profile.currentLabel')}: <strong>{profile.displayName}</strong>
            </p>
            <div className="profile-dialog__actions">
              <button
                type="button"
                className="dashboard-btn dashboard-btn--primary"
                onClick={() => {
                  closeDialog();
                  navigate('/dashboard');
                }}
              >
                {t('profile.goToDashboard')}
              </button>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={closeDialog}
              >
                {t('profile.close')}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-dialog__form">
            <div className="profile-dialog__field">
              <label htmlFor="profile-name-input" className="profile-dialog__label">
                {t('profile.nameLabel')}
              </label>
              <input
                id="profile-name-input"
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('profile.namePlaceholder')}
                className="profile-dialog__input"
                maxLength={40}
                required
                autoComplete="name"
              />
              {error ? <p className="profile-dialog__error" role="alert">{error}</p> : null}
            </div>

            <div className="profile-dialog__actions">
              <button
                type="submit"
                disabled={submitting}
                className="dashboard-btn dashboard-btn--primary profile-dialog__submit"
              >
                {submitting ? t('profile.saving') : t('profile.saveButton')}
              </button>
              <button
                type="button"
                className="dashboard-btn dashboard-btn--secondary"
                onClick={closeDialog}
              >
                {t('profile.cancel')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
