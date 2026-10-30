import { useMemo } from 'react';

import { COUNTRIES, iso3For } from '@/content/countries48';
import { COUNTRY_COORDINATES } from '@/lib/geo-coords';

interface LatitudeRailProps {
  /** ID negara 2-huruf (misal 'jp', 'id') atau null saat overview */
  activeCountryId: string | null;
  /** Hover negara 2-huruf atau 3-huruf bila sedang di-hover */
  hoverCountryId?: string | null;
  /** Status drawer pratinjau negara terbuka */
  drawerOpen?: boolean;
}

const SCALE_TOP_LAT = 75; // 75°N
const SCALE_BOTTOM_LAT = -15; // 15°S
const SCALE_RANGE = SCALE_TOP_LAT - SCALE_BOTTOM_LAT; // 90°

const TICKS = [
  { lat: 70, label: '70°N', major: true },
  { lat: 60, label: '', major: false },
  { lat: 50, label: '50°N', major: true },
  { lat: 40, label: '', major: false },
  { lat: 30, label: '30°N', major: true },
  { lat: 20, label: '', major: false },
  { lat: 10, label: '10°N', major: true },
  { lat: 0, label: '0°EQ', major: true },
  { lat: -10, label: '10°S', major: true },
];

/**
 * Dynamic Latitude Rail (FŪDO-inspired Geodetic Instrument).
 * Rel vertikal garis lintang presisi tinggi yang melacak posisi fokus
 * kamera atau negara aktif secara real-time.
 */
export default function LatitudeRail({
  activeCountryId,
  hoverCountryId,
  drawerOpen = false,
}: LatitudeRailProps) {
  const targetId = hoverCountryId || activeCountryId;

  const currentDatum = useMemo(() => {
    if (!targetId) {
      return {
        lat: 28, // Pusat benua Asia
        label: '28°N · ASIA CTR',
        active: false,
      };
    }
    const iso3 = iso3For(targetId);
    if (!iso3) {
      return { lat: 28, label: '28°N · ASIA CTR', active: false };
    }
    const coords = COUNTRY_COORDINATES[iso3];
    const c48 = COUNTRIES[iso3];
    if (!coords) {
      return { lat: 28, label: '28°N · ASIA CTR', active: false };
    }

    const deg = Math.abs(coords.lat);
    const hemi = coords.lat >= 0 ? 'N' : 'S';
    const formatted = `${deg.toFixed(1)}°${hemi}`;

    return {
      lat: coords.lat,
      label: `${formatted} · ${iso3}`,
      name: c48?.name,
      active: true,
    };
  }, [targetId]);

  // Hitung posisi vertikal (0% di top / 75°N, 100% di bottom / -15°S)
  const markerPercent = useMemo(() => {
    const clamped = Math.max(SCALE_BOTTOM_LAT, Math.min(SCALE_TOP_LAT, currentDatum.lat));
    return ((SCALE_TOP_LAT - clamped) / SCALE_RANGE) * 100;
  }, [currentDatum.lat]);

  return (
    <aside
      className={`map48-lat-rail ${drawerOpen ? 'map48-lat-rail--hidden' : ''}`}
      aria-hidden="true"
      title={`Garis Lintang: ${currentDatum.label}`}
    >
      <div className="map48-lat-rail__track">
        {/* Garis vertikal utama */}
        <div className="map48-lat-rail__line" />

        {/* Tanda garis lintang (ticks) */}
        {TICKS.map((t) => {
          const tickPct = ((SCALE_TOP_LAT - t.lat) / SCALE_RANGE) * 100;
          return (
            <div
              key={t.lat}
              className={`map48-lat-rail__tick ${t.major ? 'map48-lat-rail__tick--major' : ''}`}
              style={{ top: `${tickPct}%` }}
            >
              {t.label ? (
                <span className="map48-lat-rail__tick-label">{t.label}</span>
              ) : null}
              <span className="map48-lat-rail__tick-bar" />
            </div>
          );
        })}

        {/* Dynamic Marker Penunjuk Posisi Kamera / Negara */}
        <div
          className={`map48-lat-rail__marker ${currentDatum.active ? 'map48-lat-rail__marker--active' : ''}`}
          style={{ top: `${markerPercent}%` }}
        >
          <div className="map48-lat-rail__marker-badge">
            <span className="map48-lat-rail__marker-text">{currentDatum.label}</span>
          </div>
          <span className="map48-lat-rail__marker-connector" />
          <span className="map48-lat-rail__marker-dot" />
        </div>
      </div>
    </aside>
  );
}
