import { useEffect, useRef, useState } from 'react';
import '@/styles/preloader.css';

const PRELOADER_SESSION_KEY = 'asiakin:preloader-shown';
const MAX_WAIT_MS = 1200;

/**
 * Preloader (D29): brand wordmark + typographic progress line. Waits for
 * scene ready or timeout, exits with transform/clip. Skipped with reduced
 * motion, shown once per session.
 */
export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const shown = sessionStorage.getItem(PRELOADER_SESSION_KEY);
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldShow = !shown && !reducedMotion;

    // Set data-ready immediately if not showing preloader
    if (!shouldShow) {
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.ready = 'true';
      }
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('asiakin:ready'));
      });
    }

    return shouldShow;
  });

  const [exiting, setExiting] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) {
      document.documentElement.dataset.ready = 'true';
      window.dispatchEvent(new CustomEvent('asiakin:ready'));
      return;
    }

    let mounted = true;

    const handleReady = () => {
      if (!mounted) return;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setExiting(true);
      document.documentElement.dataset.ready = 'true';
      window.dispatchEvent(new CustomEvent('asiakin:ready'));
      setTimeout(() => {
        if (!mounted) return;
        setVisible(false);
        sessionStorage.setItem(PRELOADER_SESSION_KEY, '1');
      }, 600);
    };

    const sceneReady = () => {
      return (
        typeof window !== 'undefined' &&
        (window as unknown as { __asiakin_scene?: { ready?: boolean } })
          .__asiakin_scene?.ready === true
      );
    };

    if (sceneReady()) {
      handleReady();
      return;
    }

    window.addEventListener('asiakin:scene-ready', handleReady);
    timeoutRef.current = window.setTimeout(handleReady, MAX_WAIT_MS);

    return () => {
      mounted = false;
      window.removeEventListener('asiakin:scene-ready', handleReady);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div className={`preloader ${exiting ? 'preloader--exiting' : ''}`}>
      <div className="preloader__content">
        <div className="preloader__wordmark">Asiakin</div>
        <div className="preloader__progress">
          <span className="preloader__line" />
        </div>
      </div>
    </div>
  );
}
