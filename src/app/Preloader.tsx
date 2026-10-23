import { useEffect, useRef, useState } from 'react';
import '@/styles/preloader.css';

const PRELOADER_SESSION_KEY = 'asiakin:preloader-shown';
const MIN_WAIT_MS = 1200;
const MAX_WAIT_MS = 1800;

function isSessionShown(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return sessionStorage.getItem(PRELOADER_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function markSessionShown(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(PRELOADER_SESSION_KEY, '1');
  } catch {
    // ignore
  }
}

/**
 * Preloader (Fullscreen Intro Screen matching frame_001.jpg):
 * Warm paper background (#EDE7DC / #F4EDE1), centered editorial title,
 * eyebrow 'BENUA ASIA', hairline divider, and subtitle 'Menyiapkan data 15 negara'.
 * Once ready (~1.2s - 1.8s), smoothly scales up to 1.04 and fades out,
 * seamlessly revealing the 3D map stage.
 */
export default function Preloader() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const isLanding = window.location.pathname === '/';
    const shown = isSessionShown();
    const reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldShow = isLanding && !shown && !reducedMotion;

    // Set data-ready immediately if not showing preloader
    if (!shouldShow) {
      if (typeof document !== 'undefined') {
        document.documentElement.dataset.ready = 'true';
      }
      markSessionShown();
      requestAnimationFrame(() => {
        window.dispatchEvent(new CustomEvent('asiakin:ready'));
      });
    } else {
      markSessionShown();
    }

    return shouldShow;
  });

  const [exiting, setExiting] = useState(false);
  const minTimerRef = useRef<number | null>(null);
  const maxTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!visible) {
      document.documentElement.dataset.ready = 'true';
      window.dispatchEvent(new CustomEvent('asiakin:ready'));
      return;
    }

    let mounted = true;
    let minTimeElapsed = false;
    let sceneIsReady = false;

    const completeExit = () => {
      if (!mounted) return;
      if (minTimerRef.current) {
        clearTimeout(minTimerRef.current);
        minTimerRef.current = null;
      }
      if (maxTimerRef.current) {
        clearTimeout(maxTimerRef.current);
        maxTimerRef.current = null;
      }

      setExiting(true);
      document.documentElement.dataset.ready = 'true';
      window.dispatchEvent(new CustomEvent('asiakin:ready'));
      markSessionShown();

      setTimeout(() => {
        if (!mounted) return;
        setVisible(false);
      }, 700);
    };

    const tryExit = () => {
      if (minTimeElapsed && sceneIsReady) {
        completeExit();
      }
    };

    const handleSceneReady = () => {
      sceneIsReady = true;
      tryExit();
    };

    const checkInitialScene = () => {
      return (
        typeof window !== 'undefined' &&
        (window as unknown as { __asiakin_scene?: { ready?: boolean } }).__asiakin_scene?.ready ===
          true
      );
    };

    if (checkInitialScene()) {
      sceneIsReady = true;
    }

    window.addEventListener('asiakin:scene-ready', handleSceneReady);

    // Minimum display duration (~1.2s) for intro readability
    minTimerRef.current = window.setTimeout(() => {
      minTimeElapsed = true;
      if (sceneIsReady) {
        completeExit();
      }
    }, MIN_WAIT_MS);

    // Fallback maximum wait at ~1.8s
    maxTimerRef.current = window.setTimeout(() => {
      completeExit();
    }, MAX_WAIT_MS);

    return () => {
      mounted = false;
      window.removeEventListener('asiakin:scene-ready', handleSceneReady);
      if (minTimerRef.current) clearTimeout(minTimerRef.current);
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current);
    };
  }, [visible]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className={`preloader ${exiting ? 'preloader--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Memuat Asia Explorer"
    >
      <div className="preloader__content">
        <span className="preloader__eyebrow">BENUA ASIA</span>
        <div className="preloader__title">Asia Explorer</div>
        <span className="preloader__divider" aria-hidden="true" />
        <p className="preloader__subtitle">Menyiapkan data 15 negara</p>
      </div>
    </div>
  );
}
