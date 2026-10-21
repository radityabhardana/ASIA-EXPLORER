import mapPaths from '@/content/map-paths.json';

type CountrySilhouetteProps = {
  countryId: string;
};

export default function CountrySilhouette({ countryId }: CountrySilhouetteProps) {
  const mapData = mapPaths.find((item) => item.id === countryId);

  if (!mapData) {
    return null;
  }

  const { d, bbox } = mapData;
  const [minX = 0, minY = 0, maxX = 0, maxY = 0] = bbox;
  if (maxX <= minX || maxY <= minY) {
    return null;
  }
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
    </div>
  );
}
