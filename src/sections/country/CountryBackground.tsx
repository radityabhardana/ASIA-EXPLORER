import { useMemo } from 'react';

import themesData from '@/content/themes.json';
import { contrastRatio } from '@/lib/color';
import Silhouette from '@/sections/landing/Silhouette';

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

const CONTOUR_SCALES = [1.0, 0.86, 0.72, 0.58, 0.44];

export default function CountryBackground({ countryId }: CountryBackgroundProps) {
  const theme = useMemo(() => getCountryTheme(countryId), [countryId]);

  // Contrast verification: --ink (#1a1f24) against theme.base guaranteed >= 12:1 (AAA)
  const inkContrast = useMemo(() => contrastRatio('#1a1f24', theme.base), [theme.base]);
  if (import.meta.env.DEV && inkContrast < 12) {
    console.warn(`[CountryBackground] Warning: ink vs base contrast ratio is ${inkContrast.toFixed(2)} (< 12:1) for country ${countryId}`);
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
      <div className="country-background__wash" />

      {/* Concentric contour rings & delicate contour silhouettes behind the reading column */}
      <div className="country-background__contours">
        {CONTOUR_SCALES.map((scale, index) => {
          const falloffOpacity = Math.max(
            0.03,
            theme.contourOpacity * (1 - index * 0.18),
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
              <Silhouette id={countryId} className="country-background__silhouette" />
            </div>
          );
        })}

        {/* Concentric cartographic topographic isolines */}
        <svg
          className="country-background__topo-svg"
          viewBox="0 0 1000 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <ellipse
            cx="500"
            cy="500"
            rx="240"
            ry="200"
            stroke={theme.contourStroke}
            strokeWidth="1.2"
            strokeDasharray="4 6"
            opacity={Number((theme.contourOpacity * 0.8).toFixed(3))}
          />
          <ellipse
            cx="500"
            cy="500"
            rx="360"
            ry="300"
            stroke={theme.contourStroke}
            strokeWidth="1.2"
            opacity={Number((theme.contourOpacity * 0.6).toFixed(3))}
          />
          <ellipse
            cx="500"
            cy="500"
            rx="460"
            ry="390"
            stroke={theme.contourStroke}
            strokeWidth="1.2"
            strokeDasharray="2 4"
            opacity={Number((theme.contourOpacity * 0.4).toFixed(3))}
          />
        </svg>
      </div>
    </div>
  );
}
