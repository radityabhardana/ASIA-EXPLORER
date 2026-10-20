import mapPaths from '@/content/map-paths.json';

import NativeText from './NativeText';
import type { TextProfile } from './scripts';

type CountrySilhouetteProps = {
  countryId: string;
  nameLocal: string;
  profile: TextProfile;
};

export default function CountrySilhouette({
  countryId,
  nameLocal,
  profile,
}: CountrySilhouetteProps) {
  const mapData = mapPaths.find((item) => item.id === countryId);

  if (!mapData) {
    return null;
  }

  const { d, bbox } = mapData;
  const [minX, minY, maxX, maxY] = bbox;
  const width = maxX - minX;
  const height = maxY - minY;
  const viewBox = `${minX} ${minY} ${width} ${height}`;

  return (
    <div className="country-silhouette">
      <svg
        className="country-silhouette__svg"
        viewBox={viewBox}
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        focusable="false"
      >
        <path d={d} />
      </svg>
      <p className="country-silhouette__label">
        <NativeText profile={profile}>{nameLocal}</NativeText>
      </p>
    </div>
  );
}
