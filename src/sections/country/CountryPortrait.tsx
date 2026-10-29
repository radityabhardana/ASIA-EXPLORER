import { useMemo } from 'react';

import mapPaths from '@/content/map-paths.json';

type CountryPortraitProps = {
  countryId: string;
};

export default function CountryPortrait({ countryId }: CountryPortraitProps) {
  const { viewBox, path, aspectRatio } = useMemo(() => {
    const mapData = mapPaths.find((item) => item.id === countryId);
    if (!mapData) return { viewBox: '0 0 100 100', path: '', aspectRatio: 1 };

    const { d, bbox } = mapData;
    const [minX = 0, minY = 0, maxX = 0, maxY = 0] = bbox;
    if (maxX <= minX || maxY <= minY) return { viewBox: '0 0 100 100', path: '', aspectRatio: 1 };

    const width = maxX - minX;
    const height = maxY - minY;

    return {
      viewBox: `${minX} ${minY} ${width} ${height}`,
      path: d,
      aspectRatio: width / height,
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
          {/* Base outline: clean subtle line without diagonal black hatching */}
          <path d={path} fill="none" stroke="var(--ink-muted, #5c6670)" strokeWidth="0.75" opacity="0.4" />
        </svg>
      </div>
    </section>
  );
}
