import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { playParchmentClick, useAudioState } from '@/lib/audio';
import { useI18n } from '@/lib/i18n';
import { scrollToSection } from '@/lib/motion';
import { useProfile } from '@/lib/profile';

export interface NavbarProps {
  onScrollToMap?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
  onOpenCountryDirectory?: () => void;
  onOpenComparison?: () => void;
}

export default function Navbar({
  onScrollToMap,
  onOpenCountryDirectory,
  onOpenComparison,
}: NavbarProps = {}) {
  void onScrollToMap;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, t, toggleLocale } = useI18n();
  const { profile } = useProfile();
  const { muted: audioMuted, toggle: toggleAudioMuted } = useAudioState();

  const handleToggleAudio = () => {
    playParchmentClick();
    toggleAudioMuted();
  };

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleAnchorClick =
    (selector: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
      const isLanding =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/' ||
          window.location.pathname === '' ||
          window.location.pathname === '/en');

      if (isLanding) {
        event.preventDefault();
        scrollToSection(selector, { immediate: false });
        const target = document.querySelector(selector) as HTMLElement | null;
        if (target) {
          target.focus?.({ preventScroll: true });
        }
      } else {
        event.preventDefault();
        window.location.href = `/${selector}`;
      }
      setMobileOpen(false);
    };

  // Keyboard navigation & focus trap for mobile drawer
  useEffect(() => {
    if (!mobileOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button initially
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }

      if (event.key === 'Tab' && mobileMenuRef.current) {
        const focusables = mobileMenuRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <header className="navbar" role="banner">
      <div className="navbar__container">
        {/* Navigation links */}
        <nav className="navbar__nav" aria-label="Navigasi utama">
          <ul className="navbar__links">
            <li>
              <a
                href="#peta"
                className="navbar__link"
                onClick={handleAnchorClick('#peta')}
              >
                {t('nav.explore')}
              </a>
            </li>
            <li>
              <a
                href="#kawasan"
                className="navbar__link"
                onClick={handleAnchorClick('#kawasan')}
              >
                {t('nav.regions')}
              </a>
            </li>
            <li>
              <a
                href="#etiket"
                className="navbar__link"
                onClick={handleAnchorClick('#etiket')}
              >
                {t('nav.etiquette')}
              </a>
            </li>
            <li>
              <button
                type="button"
                className="navbar__link navbar__link--btn"
                onClick={() => {
                  playParchmentClick();
                  if (onOpenComparison) {
                    onOpenComparison();
                  } else {
                    window.location.href = '/?bandingkan=1';
                  }
                }}
                aria-label={t('nav.compareAria')}
              >
                {t('nav.compare')}
              </button>
            </li>
            <li>
              <a
                href="/dashboard"
                className="navbar__link"
              >
                {t('nav.dashboard')}
              </a>
            </li>
          </ul>
        </nav>

        {/* Right actions: Atlas Direktori 48, ID / EN switcher, Masuk, Daftar & Mobile Toggle */}
        <div className="navbar__actions">
          {/* Tombol Atlas Direktori 48 Bangsa */}
          <button
            type="button"
            className="navbar__atlas-btn"
            onClick={() => {
              playParchmentClick();
              onOpenCountryDirectory?.();
            }}
            aria-label={t('nav.directoryAria')}
          >
            <svg
              className="navbar__atlas-icon"
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
            </svg>
            <span className="navbar__atlas-label">{t('nav.directory')}</span>
            <span className="navbar__atlas-count" aria-hidden="true">
              48
            </span>
          </button>

          <button
            type="button"
            className="navbar__lang-btn"
            aria-label={t('nav.langAria')}
            onClick={() => {
              playParchmentClick();
              toggleLocale();
            }}
          >
            <span
              className={`navbar__lang-opt ${locale === 'id' ? 'navbar__lang-opt--active' : ''}`}
            >
              ID
            </span>
            <span className="navbar__lang-sep" aria-hidden="true">
              /
            </span>
            <span
              className={`navbar__lang-opt ${locale === 'en' ? 'navbar__lang-opt--active' : ''}`}
            >
              EN
            </span>
          </button>

          <button
            type="button"
            className={`navbar__audio-btn ${audioMuted ? 'navbar__audio-btn--muted' : 'navbar__audio-btn--active'}`}
            aria-label={
              audioMuted
                ? locale === 'id'
                  ? 'Nyalakan audio taktil'
                  : 'Unmute tactile audio'
                : locale === 'id'
                  ? 'Bisukan audio taktil'
                  : 'Mute tactile audio'
            }
            title={
              audioMuted
                ? locale === 'id'
                  ? 'Nyalakan audio'
                  : 'Unmute audio'
                : locale === 'id'
                  ? 'Bisukan audio'
                  : 'Mute audio'
            }
            onClick={handleToggleAudio}
          >
            {audioMuted ? (
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                width="15"
                height="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              </svg>
            )}
          </button>

          {profile ? (
            <a
              href="/dashboard"
              className="navbar__link navbar__link--register"
            >
              {profile.displayName}
            </a>
          ) : (
            <>
              <a
                href="/?profil=buat"
                className="navbar__link navbar__link--subtle"
              >
                {t('nav.signin')}
              </a>

              <a
                href="/?profil=buat"
                className="navbar__link navbar__link--register"
              >
                {t('nav.register')}
              </a>
            </>
          )}

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            ref={mobileToggleRef}
            className="navbar__mobile-toggle"
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-drawer"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => {
              playParchmentClick();
              setMobileOpen((prev) => !prev);
            }}
          >
            <span className="navbar__toggle-line" />
            <span className="navbar__toggle-line" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer / Full-screen overlay */}
      {mobileOpen ? (
        <div
          id="navbar-mobile-drawer"
          className="navbar__mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Menu navigasi"
          ref={mobileMenuRef}
        >
          <div className="navbar__mobile-header">
            <button
              type="button"
              ref={closeButtonRef}
              className="navbar__mobile-close"
              aria-label="Tutup menu"
              onClick={() => {
                playParchmentClick();
                setMobileOpen(false);
                mobileToggleRef.current?.focus();
              }}
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <nav className="navbar__mobile-nav" aria-label="Navigasi ponsel">
            <ul className="navbar__mobile-links">
              <li>
                <a
                  href="#peta"
                  className="navbar__mobile-link"
                  onClick={handleAnchorClick('#peta')}
                >
                  {t('nav.explore')}
                </a>
              </li>
              <li>
                <a
                  href="#kawasan"
                  className="navbar__mobile-link"
                  onClick={handleAnchorClick('#kawasan')}
                >
                  {t('nav.regions')}
                </a>
              </li>
              <li>
                <a
                  href="#etiket"
                  className="navbar__mobile-link"
                  onClick={handleAnchorClick('#etiket')}
                >
                  {t('nav.etiquette')}
                </a>
              </li>
              <li>
                <button
                  type="button"
                  className="navbar__mobile-link navbar__mobile-link--btn"
                  onClick={() => {
                    playParchmentClick();
                    setMobileOpen(false);
                    if (onOpenComparison) {
                      onOpenComparison();
                    } else {
                      window.location.href = '/?bandingkan=1';
                    }
                  }}
                  aria-label={t('nav.compareAria')}
                >
                  <span>{t('nav.compare')}</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="navbar__mobile-link navbar__mobile-link--btn"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenCountryDirectory?.();
                  }}
                >
                  <span className="navbar__mobile-atlas-wrap">
                    <span>{t('nav.directory')}</span>
                    <span className="navbar__atlas-count" aria-hidden="true">
                      48
                    </span>
                  </span>
                </button>
              </li>
              <li>
                <a
                  href="#tantangan-harian"
                  className="navbar__mobile-link"
                  onClick={handleAnchorClick('#tantangan-harian')}
                >
                  {t('nav.challenge')}
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  {t('nav.dashboard')}
                </a>
              </li>
            </ul>
          </nav>

          <div className="navbar__mobile-footer">
            <button
              type="button"
              className="navbar__lang-btn navbar__lang-btn--mobile"
              aria-label={t('nav.langAria')}
              onClick={toggleLocale}
            >
              <span>{locale === 'id' ? 'Bahasa: ID (Indonesia)' : 'Language: EN (English)'}</span>
            </button>

            <button
              type="button"
              className="navbar__audio-btn navbar__audio-btn--mobile"
              aria-label={
                audioMuted
                  ? locale === 'id'
                    ? 'Nyalakan audio taktil'
                    : 'Unmute tactile audio'
                  : locale === 'id'
                    ? 'Bisukan audio taktil'
                    : 'Mute tactile audio'
              }
              onClick={handleToggleAudio}
            >
              {audioMuted ? (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </svg>
                  <span>{locale === 'id' ? 'Audio: Bisu' : 'Audio: Muted'}</span>
                </>
              ) : (
                <>
                  <svg
                    viewBox="0 0 24 24"
                    width="15"
                    height="15"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                  <span>{locale === 'id' ? 'Audio: Aktif' : 'Audio: Active'}</span>
                </>
              )}
            </button>

            <div className="navbar__mobile-actions">
              {profile ? (
                <a
                  href="/dashboard"
                  className="navbar__mobile-link navbar__mobile-link--register"
                  onClick={() => setMobileOpen(false)}
                >
                  {profile.displayName}
                </a>
              ) : (
                <>
                  <a
                    href="/?profil=buat"
                    className="navbar__mobile-link navbar__mobile-link--subtle"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('nav.signin')}
                  </a>
                  <a
                    href="/?profil=buat"
                    className="navbar__mobile-link navbar__mobile-link--register"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('nav.register')}
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
