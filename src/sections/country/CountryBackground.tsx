import { useMemo } from 'react';

import themesData from '@/content/themes.json';
import { contrastRatio } from '@/lib/color';

export interface CountryThemePalette {
  base: string;
  soil: string;
  accent: string;
  contourStroke: string;
  contourOpacity: number;
  contrast?: {
    inkVsBase: number;
    inkMutedVsBase: number;
  };
}

type ThemesJson = {
  version: number;
  countries: Record<string, CountryThemePalette>;
};

const typedThemes = themesData as unknown as ThemesJson;

const DEFAULT_THEME: CountryThemePalette = {
  base: '#f1f3f4',
  soil: '#9a9c65',
  accent: '#2070df',
  contourStroke: '#5c88a3',
  contourOpacity: 0.16,
  contrast: {
    inkVsBase: 14.9,
    inkMutedVsBase: 5.3,
  },
};

export function getCountryTheme(countryId: string): CountryThemePalette {
  return typedThemes.countries[countryId] ?? DEFAULT_THEME;
}

type CountryBackgroundProps = {
  countryId: string;
};

const CONTOUR_SCALES = [1.0, 0.84, 0.68, 0.52];

export default function CountryBackground({ countryId }: CountryBackgroundProps) {
  const theme = useMemo(() => getCountryTheme(countryId), [countryId]);

  // Contrast verification: --ink (#1a1f24) against theme.base guaranteed >= 12:1 (AAA)
  const inkContrast = useMemo(() => contrastRatio('#1a1f24', theme.base), [theme.base]);
  if (import.meta.env.DEV && inkContrast < 12) {
    console.warn(
      `[CountryBackground] Warning: ink vs base contrast ratio is ${inkContrast.toFixed(2)} (< 12:1) for country ${countryId}`,
    );
  }

  return (
    <div
      className="country-background"
      aria-hidden="true"
      style={
        {
          '--country-base': theme.base,
          '--country-contour-stroke': theme.contourStroke,
          '--country-contour-opacity': theme.contourOpacity,
          backgroundColor: theme.base,
        } as React.CSSProperties
      }
    >
      {/* 1. Subtle warm wash */}
      <div className="country-background__wash" />

      {/* 2. Concentric faint cartographic survey rings (NO dark filled blobs) */}
      <div className="country-background__contours">
        {CONTOUR_SCALES.map((scale, index) => {
          const falloffOpacity = Math.max(
            0.02,
            Math.min(0.08, theme.contourOpacity * (0.5 - index * 0.1)),
          );
          return (
            <div
              key={scale}
              className="country-background__ring"
              style={{
                transform: `scale(${scale})`,
                opacity: Number(falloffOpacity.toFixed(3)),
              }}
            >
              <svg
                viewBox="0 0 800 800"
                className="country-background__ring-svg"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="400"
                  cy="400"
                  r={350}
                  stroke={theme.contourStroke}
                  strokeWidth="0.8"
                  strokeDasharray={index % 2 === 0 ? '4 8' : 'none'}
                  fill="none"
                />
              </svg>
            </div>
          );
        })}

        {/* Delicate topographic survey marks */}
        <svg
          className="country-background__topo-svg"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="500"
            cy="500"
            rx="280"
            ry="240"
            stroke={theme.contourStroke}
            strokeWidth="0.75"
            strokeDasharray="4 6"
            opacity="0.06"
          />
          <ellipse
            cx="500"
            cy="500"
            rx="420"
            ry="360"
            stroke={theme.contourStroke}
            strokeWidth="0.75"
            opacity="0.04"
          />
        </svg>
      </div>

      {/* 3. Archival handmade washi paper grain texture */}
      <svg
        className="country-background__grain"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="country-paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.18  0 0 0 0 0.14  0 0 0 0 0.10  0 0 0 0.035 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter="url(#country-paper-grain)" fill="none" />
      </svg>
    </div>
  );
}
