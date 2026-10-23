import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { scrollToSection } from '@/lib/motion';

export interface NavbarProps {
  onScrollToMap?: (event: ReactMouseEvent<HTMLAnchorElement>) => void;
}

export default function Navbar({ onScrollToMap }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [lang, setLang] = useState<'id' | 'en'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('asiakin_lang');
      if (saved === 'en' || saved === 'id') return saved;
      if (document.documentElement.lang === 'en') return 'en';
    }
    return 'id';
  });

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Sync lang to documentElement & localStorage
  const handleToggleLang = () => {
    const nextLang = lang === 'id' ? 'en' : 'id';
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('asiakin_lang', nextLang);
      document.documentElement.lang = nextLang;
      window.dispatchEvent(
        new CustomEvent('asiakin:langchange', { detail: { lang: nextLang } }),
      );
    }
  };

  const handleScrollClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    if (onScrollToMap) {
      onScrollToMap(event);
    } else {
      event.preventDefault();
      scrollToSection('#peta');
      const target = document.getElementById('peta');
      if (target) {
        target.focus({ preventScroll: true });
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
        {/* Left: Wordmark & Navigation links */}
        <div className="navbar__brand-nav">
          <a
            href="/"
            className="navbar__wordmark"
            aria-label="Asia Explorer — Beranda"
          >
            Asia Explorer
          </a>

          <nav className="navbar__nav" aria-label="Navigasi utama">
            <ul className="navbar__links">
              <li>
                <a
                  href="#peta"
                  className="navbar__link"
                  onClick={handleScrollClick}
                >
                  Jelajah
                </a>
              </li>
              <li>
                <a href="/dashboard" className="navbar__link">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/negara" className="navbar__link">
                  Negara
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Right: Language switcher, Masuk, Daftar & Mobile Toggle */}
        <div className="navbar__actions">
          <button
            type="button"
            className="navbar__lang-btn"
            aria-label={
              lang === 'id'
                ? 'Beralih ke Bahasa Inggris (Switch to English)'
                : 'Beralih ke Bahasa Indonesia'
            }
            onClick={handleToggleLang}
          >
            <svg
              className="navbar__globe-icon"
              viewBox="0 0 16 16"
              width="16"
              height="16"
              aria-hidden="true"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="8" cy="8" r="6.75" />
              <line x1="1.25" y1="8" x2="14.75" y2="8" />
              <path d="M8 1.25 C9.8 3.5 10.75 5.7 10.75 8 C10.75 10.3 9.8 12.5 8 14.75 C6.2 12.5 5.25 10.3 5.25 8 C5.25 5.7 6.2 3.5 8 1.25 Z" />
            </svg>
            <span className="navbar__lang-text">{lang.toUpperCase()}</span>
          </button>

          <a href="/dashboard" className="navbar__link navbar__link--subtle">
            Masuk
          </a>

          <a href="/dashboard" className="navbar__btn-action">
            Daftar
          </a>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            ref={mobileToggleRef}
            className="navbar__mobile-toggle"
            aria-expanded={mobileOpen}
            aria-controls="navbar-mobile-drawer"
            aria-label={
              mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'
            }
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
            <a
              href="/"
              className="navbar__wordmark"
              onClick={() => setMobileOpen(false)}
            >
              Asia Explorer
            </a>
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
                  onClick={handleScrollClick}
                >
                  Jelajah
                </a>
              </li>
              <li>
                <a
                  href="/dashboard"
                  className="navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </a>
              </li>
              <li>
                <a
                  href="/negara"
                  className="navbar__mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  Negara
                </a>
              </li>
            </ul>
          </nav>

          <div className="navbar__mobile-footer">
            <button
              type="button"
              className="navbar__lang-btn navbar__lang-btn--mobile"
              onClick={handleToggleLang}
            >
              <svg
                className="navbar__globe-icon"
                viewBox="0 0 16 16"
                width="16"
                height="16"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="8" r="6.75" />
                <line x1="1.25" y1="8" x2="14.75" y2="8" />
                <path d="M8 1.25 C9.8 3.5 10.75 5.7 10.75 8 C10.75 10.3 9.8 12.5 8 14.75 C6.2 12.5 5.25 10.3 5.25 8 C5.25 5.7 6.2 3.5 8 1.25 Z" />
              </svg>
              <span>Bahasa: {lang.toUpperCase()}</span>
            </button>

            <div className="navbar__mobile-actions">
              <a
                href="/dashboard"
                className="navbar__mobile-link navbar__mobile-link--subtle"
                onClick={() => setMobileOpen(false)}
              >
                Masuk
              </a>
              <a
                href="/dashboard"
                className="navbar__btn-action navbar__btn-action--full"
                onClick={() => setMobileOpen(false)}
              >
                Daftar
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
