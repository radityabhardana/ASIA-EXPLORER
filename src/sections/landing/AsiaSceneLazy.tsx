import { Component, Suspense, lazy, useState } from 'react';
import type { ReactNode } from 'react';

import type { AsiaSceneProps } from '@/scene/AsiaScene';
import CountryMapSvg from './CountryMapSvg';

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

  override render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/**
 * Satu-satunya jalur impor `AsiaScene`: lazy + Suspense + fallback SVG.
 * `onUnavailable` dari scene (tanpa WebGL / GLB gagal) juga mengalihkan ke
 * peta SVG yang bisa dipilih.
 */
export default function AsiaSceneLazy({
  label,
  describedBy,
  decorative = false,
  onUnavailable,
  onSelectCountry,
  ...rest
}: AsiaSceneLazyProps) {
  const [failed, setFailed] = useState(false);

  const fallback = (
    <div className="landing-asia__fallback">
      <CountryMapSvg
        variant={decorative ? 'scene' : 'interactive'}
        onSelect={onSelectCountry}
      />
    </div>
  );

  return (
    <div
      className="landing-asia"
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'group'}
      aria-label={decorative ? undefined : label}
      aria-describedby={decorative ? undefined : describedBy}
    >
      {failed ? (
        fallback
      ) : (
        <SceneBoundary fallback={fallback}>
          <Suspense
            fallback={
              <div className="landing-asia__pending">
                <CountryMapSvg variant="scene" />
              </div>
            }
          >
            <AsiaScene
              {...rest}
              decorative={decorative}
              onSelectCountry={onSelectCountry}
              onUnavailable={() => {
                setFailed(true);
                onUnavailable?.();
              }}
            />
          </Suspense>
        </SceneBoundary>
      )}
    </div>
  );
}
