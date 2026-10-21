import { useMemo } from 'react';

import mapPaths from '@/content/map-paths.json';

type CountryPortraitProps = {
  countryId: string;
};

export default function CountryPortrait({ countryId }: CountryPortraitProps) {
  const { viewBox, path, aspectRatio, patternId } = useMemo(() => {
    const mapData = mapPaths.find((item) => item.id === countryId);
    if (!mapData) return { viewBox: '0 0 100 100', path: '', aspectRatio: 1, patternId: '' };

    const { d, bbox } = mapData;
    const [minX = 0, minY = 0, maxX = 0, maxY = 0] = bbox;
    if (maxX <= minX || maxY <= minY) return { viewBox: '0 0 100 100', path: '', aspectRatio: 1, patternId: '' };

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      viewBox: `${minX} ${minY} ${width} ${height}`,
      path: d,
      aspectRatio: width / height,
      patternId: `hatch-${countryId}`,
    };
  }, [countryId]);

  if (!path) return null;

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
          <defs>
            <pattern
              id={patternId}
              patternUnits="userSpaceOnUse"
              width="8"
              height="8"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--ink)" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          {/* Base outline */}
          <path d={path} fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.6" />
          {/* Hatch fill */}
          <path d={path} fill={`url(#${patternId})`} stroke="none" />
        </svg>
      </div>
    </section>
  );
}
