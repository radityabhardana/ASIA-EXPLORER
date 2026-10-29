import { countryColor } from '../three/palette.js'
import { buildShapes } from '../geo.js'

/**
 * Atlas 2D (SVG) untuk mesin tanpa WebGL.
 * Memakai geometri & proyeksi yang sama dengan peta 3D (lihat src/geo.js),
 * jadi bentuk benua identik di semua tampilan.
 */
export function buildFlatMap(featureCollection, projection) {
  const { shapes, countries: features, viewBox } = buildShapes(featureCollection, projection)

  const countries = features.map((item) => ({
    code: item.code,
    name: item.name,
    region: item.region,
    center: { x: item.bbox.x + item.bbox.w / 2, y: item.bbox.y + item.bbox.h / 2 },
  }))

  const paths = countries
    .map(
      (country) =>
        `<path class="flat__country" data-code="${country.code}" fill="#${countryColor(
          country.region,
          country.code
        ).getHexString()}" d="${shapes[country.code].d}" tabindex="0" role="button" aria-label="${country.code}"></path>`
    )
    .join('')

  const svg = `<svg class="flat__svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" role="group" aria-label="Peta Asia interaktif">
    <defs>
      <filter id="flat-shadow" x="-8%" y="-8%" width="116%" height="116%">
        <feDropShadow dx="0" dy="2.2" stdDeviation="2.4" flood-color="#40301a" flood-opacity="0.16" />
      </filter>
    </defs>
    <g filter="url(#flat-shadow)">${paths}</g>
  </svg>`

  return { svg, countries, viewBox }
}
