import { Component, Suspense, lazy, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

import type { AsiaSceneProps } from '@/scene/AsiaScene';
import CountryMapSvg from './CountryMapSvg';
import '@/styles/scene-lazy.css';

const AsiaScene = lazy(() => import('@/scene/AsiaScene'));

type AsiaSceneLazyProps = Omit<AsiaSceneProps, 'className'> & {
  label: string;
  describedBy?: string;
  /** Scene 1 hanya visual; jangan menambah landmark kedua di halaman. */
  decorative?: boolean;
};

type BoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onError?: () => void;
};

type BoundaryState = {
  failed: boolean;
};

/** Chunk 3D bisa gagal dimuat (jaringan/aset); peta SVG tetap tampil. */
class SceneBoundary extends Component<BoundaryProps, BoundaryState> {
  constructor(props: BoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  override componentDidCatch(): void {
    this.props.onError?.();
  }

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function detectWebGL(): boolean {
  if (typeof document === 'undefined') {
    return true;
  }
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Satu-satunya jalur impor `AsiaScene`: lazy + Suspense + fallback bersyarat.
 * Peta SVG hanya tampil bila WebGL tidak ada, boundary gagal, atau timeout 5 detik.
 */
export default function AsiaSceneLazy({
  label,
  describedBy,
  decorative = false,
  onUnavailable,
  onSelectCountry,
  ...rest
}: AsiaSceneLazyProps) {
  const [hasWebGL] = useState(() => detectWebGL());
  const [boundaryFailed, setBoundaryFailed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [ready, setReady] = useState(() => {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as unknown as { __asiakin_scene?: { ready?: boolean } })
        .__asiakin_scene?.ready,
    );
  });

  const timeoutRef = useRef<number | null>(null);

  const failed = !hasWebGL || boundaryFailed || timedOut;

  useEffect(() => {
    if (!hasWebGL) {
      onUnavailable?.();
    }
  }, [hasWebGL, onUnavailable]);

  useEffect(() => {
    if (ready) return;

    const handleSceneReady = () => {
      setReady(true);
    };

    window.addEventListener('asiakin:scene-ready', handleSceneReady);
    return () => {
      window.removeEventListener('asiakin:scene-ready', handleSceneReady);
    };
  }, [ready]);

  useEffect(() => {
    if (ready || failed) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setTimedOut(true);
      onUnavailable?.();
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [ready, failed, onUnavailable]);

  const state = ready ? 'ready' : failed ? 'fallback' : 'loading';

  const fallback = (
    <div className="landing-asia__fallback">
      <CountryMapSvg
        className="country-map-svg"
        variant={decorative ? 'scene' : 'interactive'}
        onSelect={onSelectCountry}
      />
    </div>
  );

  return (
    <div
      className="landing-asia"
      data-state={state}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'group'}
      aria-label={decorative ? undefined : label}
      aria-describedby={decorative ? undefined : describedBy}
    >
      {failed ? (
        fallback
      ) : (
        <SceneBoundary
          fallback={fallback}
          onError={() => {
            setBoundaryFailed(true);
            onUnavailable?.();
          }}
        >
          <Suspense
            fallback={
              <div className="landing-asia__placeholder" aria-hidden="true" />
            }
          >
            <div className="landing-asia__body" data-state={state}>
              <AsiaScene
                {...rest}
                decorative={decorative}
                onSelectCountry={onSelectCountry}
                onUnavailable={() => {
                  setBoundaryFailed(true);
                  onUnavailable?.();
                }}
              />
            </div>
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
