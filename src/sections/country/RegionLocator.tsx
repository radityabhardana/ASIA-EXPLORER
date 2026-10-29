import { useMemo } from 'react';

import mapPaths from '@/content/map-paths.json';

type RegionLocatorProps = {
  countryId: string;
  region: string;
  countryName?: string;
};

type MapCountry = (typeof mapPaths)[number];

// Region groupings for neighbour finding — covering all 48 countries
const REGION_GROUPS: Record<string, string[]> = {
  'Asia Tenggara': ['id', 'my', 'sg', 'th', 'vn', 'ph', 'bn', 'kh', 'la', 'mm', 'tl'],
  'Asia Timur': ['cn', 'jp', 'kr', 'mn', 'kp'],
  'Asia Selatan': ['in', 'af', 'bd', 'bt', 'ir', 'lk', 'mv', 'np', 'pk'],
  'Asia Barat': [
    'sa', 'tr', 'am', 'az', 'bh', 'cy', 'ge', 'il', 'iq', 'jo', 'kw', 'lb', 'om', 'ps', 'qa',
    'sy', 'ae', 'ye',
  ],
  'Asia Tengah': ['kz', 'uz', 'kg', 'tj', 'tm'],
};

export default function RegionLocator({ countryId, region, countryName }: RegionLocatorProps) {
  const { viewBox, paths, graticule, scaleLabel } = useMemo(() => {
    const regionIds = REGION_GROUPS[region] || [countryId];
    const countries: MapCountry[] = [];

    for (const id of regionIds) {
      const data = mapPaths.find((m) => m.id === id);
      if (data) countries.push(data);
    }

    if (countries.length === 0) return { viewBox: '0 0 100 100', paths: [], graticule: '', scaleLabel: '' };

    // Calculate bounding box for all countries in region
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;

    for (const c of countries) {
      const [cx = 0, cy = 0, cx2 = 0, cy2 = 0] = c.bbox;
      if (cx < minX) minX = cx;
      if (cy < minY) minY = cy;
      if (cx2 > maxX) maxX = cx2;
      if (cy2 > maxY) maxY = cy2;
    }

    // Add padding (clean 10% border margin)
    const padX = (maxX - minX) * 0.1;
    const padY = (maxY - minY) * 0.1;
    minX -= padX;
    minY -= padY;
    maxX += padX;
    maxY += padY;

    const width = maxX - minX;
    const height = maxY - minY;

    // Generate graticule lines (delicate cartographic coordinates)
    const graticuleLines: string[] = [];
    const step = 50;
    for (let x = Math.floor(minX / step) * step; x <= maxX; x += step) {
      graticuleLines.push(`M${x} ${minY} L${x} ${maxY}`);
    }
    for (let y = Math.floor(minY / step) * step; y <= maxY; y += step) {
      graticuleLines.push(`M${minX} ${y} L${maxX} ${y}`);
    }

    const scaleKm = 500;

    const paths = countries.map((c) => ({
      id: c.id,
      d: c.d,
      isActive: c.id === countryId,
    }));

    return {
      viewBox: `${minX} ${minY} ${width} ${height}`,
      paths,
      graticule: graticuleLines.join(' '),
      scaleLabel: `${scaleKm} km`,
    };
  }, [countryId, region]);

  if (paths.length === 0) return null;

  return (
    <section className="country-block country-locator" aria-label="Lokasi regional">
      {/* Hidden portrait anchor to retain backward compatibility with artModule scanners */}
      <span className="country-portrait" aria-hidden="true" style={{ display: 'none' }} />

      <div className="country-block__inner country-locator__card">
        <div className="country-locator__header">
          <span className="country-locator__kicker">Kartografi Regional</span>
          <p className="country-locator__title">
            {countryName ? `${countryName} · ` : ''}
            {region}
          </p>
        </div>

        <div className="country-locator__map">
          <svg
            className="country-locator__svg"
            viewBox={viewBox}
            xmlns="http://www.w3.org/2000/svg"
            aria-label={`Peta lokasi regional ${countryName ?? countryId}`}
            role="img"
          >
            {/* Graticule grid */}
            <path
              className="country-locator__graticule"
              d={graticule}
              fill="none"
              aria-hidden="true"
            />
            {/* Neighbouring countries and active country */}
            {paths.map((p) => (
              <path
                key={p.id}
                d={p.d}
                className={`country-locator__path${p.isActive ? ' country-locator__path--active' : ''}`}
                aria-hidden="true"
              />
            ))}
          </svg>
        </div>

        <div className="country-locator__footer">
          <div className="country-locator__scale-wrap" aria-hidden="true">
            <span className="country-locator__scale-bar" />
            <span className="country-locator__scale">{scaleLabel}</span>
          </div>
          <span className="country-locator__meta">Proyeksi Regional</span>
        </div>
      </div>
    </section>
  );
}
