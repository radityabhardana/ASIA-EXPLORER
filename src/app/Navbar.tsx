import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { useI18n } from '@/lib/i18n';
import { useProfile } from '@/lib/profile';
import { scrollToSection } from '@/lib/motion';

export interface NavbarProps {
  onScrollToMap?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

export default function Navbar({ onScrollToMap }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { locale, t, toggleLocale } = useI18n();
  const { profile } = useProfile();

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleAnchorClick =
    (selector: string) => (event: ReactMouseEvent<HTMLAnchorElement>) => {
      const isLanding =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/' || window.location.pathname === '');

      if (isLanding) {
        event.preventDefault();
        if (selector === '#peta' && onScrollToMap) {
          onScrollToMap(event);
        } else {
          scrollToSection(selector);
          const target = document.querySelector(selector) as HTMLElement | null;
          if (target) {
            target.focus({ preventScroll: true });
          }
        }
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
                href="#dashboard-showcase"
                className="navbar__link"
                onClick={handleAnchorClick('#dashboard-showcase')}
              >
                {t('nav.dashboard')}
              </a>
            </li>
            <li>
              <a
                href="#galeri-mosaik"
                className="navbar__link"
                onClick={handleAnchorClick('#galeri-mosaik')}
              >
                {t('nav.countries')}
              </a>
            </li>
          </ul>
        </nav>

        {/* Right actions: ID / EN switcher, Masuk, Daftar & Mobile Toggle */}
        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__lang-btn"
            aria-label={t('nav.langAria')}
            onClick={toggleLocale}
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

          <a
            href={profile ? '/dashboard' : '/?profil=buat'}
            className="navbar__link navbar__link--subtle"
          >
            {profile ? profile.displayName : t('nav.signin')}
          </a>

          <a
            href={profile ? '/dashboard' : '/?profil=buat'}
            className="navbar__link navbar__link--register"
          >
            {profile ? t('nav.dashboard') : t('nav.register')}
          </a>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            ref={mobileToggleRef}
            className="navbar__mobile-toggle"
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-drawer"
            aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            onClick={() => setMobileOpen((prev) => !prev)}
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
                  href="#dashboard-showcase"
                  className="navbar__mobile-link"
                  onClick={handleAnchorClick('#dashboard-showcase')}
                >
                  {t('nav.dashboard')}
                </a>
              </li>
              <li>
                <a
                  href="#galeri-mosaik"
                  className="navbar__mobile-link"
                  onClick={handleAnchorClick('#galeri-mosaik')}
                >
                  {t('nav.countries')}
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

            <div className="navbar__mobile-actions">
              <a
                href={profile ? '/dashboard' : '/?profil=buat'}
                className="navbar__mobile-link navbar__mobile-link--subtle"
                onClick={() => setMobileOpen(false)}
              >
                {profile ? profile.displayName : t('nav.signin')}
              </a>
              <a
                href={profile ? '/dashboard' : '/?profil=buat'}
                className="navbar__mobile-link navbar__mobile-link--register"
                onClick={() => setMobileOpen(false)}
              >
                {profile ? t('nav.dashboard') : t('nav.register')}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
