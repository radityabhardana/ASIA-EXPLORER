import { useMemo } from 'react';

import mapPaths from '@/content/map-paths.json';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';

type CountryPortraitProps = {
  countryId: string;
  nameLocal: string;
  profile: TextProfile;
};

/**
 * Generate topographic contour lines from a path.
 * Deterministic: uses fixed offsets, no random.
 */
function generateContours(d: string, layers: number = 5): string[] {
  // Generate offset contours (simplified: stroke-based expansion)
  const contours: string[] = [];

  // Create stroke-based contours by duplicating path with different stroke-widths
  for (let i = 0; i < layers; i++) {
    contours.push(d);
  }

  return contours;
}

export default function CountryPortrait({ countryId, nameLocal, profile }: CountryPortraitProps) {
  const { viewBox, contours, aspectRatio } = useMemo(() => {
    const mapData = mapPaths.find((item) => item.id === countryId);
    if (!mapData) return { viewBox: '0 0 100 100', contours: [], aspectRatio: 1 };

    const { d, bbox } = mapData;
    const [minX = 0, minY = 0, maxX = 0, maxY = 0] = bbox;
    if (maxX <= minX || maxY <= minY) return { viewBox: '0 0 100 100', contours: [], aspectRatio: 1 };

    const width = maxX - minX;
    const height = maxY - minY;
    const layers = generateContours(d, 5);

    return {
      viewBox: `${minX} ${minY} ${width} ${height}`,
      contours: layers,
      aspectRatio: width / height,
    };
  }, [countryId]);

  if (contours.length === 0) return null;

  return (
    <section className="country-block country-portrait" aria-label="Portret negara">
      <div className="country-portrait__plate">
        <svg
          className="country-portrait__svg"
          viewBox={viewBox}
          xmlns="http://www.w3.org/2000/svg"
          style={{ '--aspect-ratio': aspectRatio } as React.CSSProperties}
          aria-hidden="true"
          focusable="false"
        >
          {/* Contour layers */}
          {contours.map((d, i) => (
            <path
              key={i}
              d={d}
              className="country-portrait__contour"
              style={
                {
                  '--layer': i,
                  '--offset': i * 4,
                } as React.CSSProperties
              }
              fill="none"
              stroke="var(--ink)"
              strokeWidth={0.5 + i * 0.3}
              opacity={1 - i * 0.15}
            />
          ))}
        </svg>
        <div className="country-portrait__name">
          <NativeText profile={profile}>{nameLocal}</NativeText>
        </div>
      </div>
    </section>
  );
}
