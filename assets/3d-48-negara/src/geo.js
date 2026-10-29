/**
 * Geometri bersama untuk semua tampilan peta (atlas 2D, mini-map landing,
 * siluet kuis). Satu fit proyeksi, satu set path, dipakai ulang.
 */
export function polygonsOf(geometry) {
  if (!geometry) return []
  if (geometry.type === 'Polygon') return [geometry.coordinates]
  if (geometry.type === 'MultiPolygon') return geometry.coordinates
  return []
}

/** Bangun path SVG semua negara + viewBox gabungan. */
export function buildShapes(featureCollection, projection) {
  const project = projection.project.bind(projection)
  const features = featureCollection.features || []

  const raw = []
  for (const feature of features) {
    for (const poly of polygonsOf(feature.geometry)) {
      for (const ring of poly) {
        for (const [lon, lat] of ring) {
          if (Number.isFinite(lon) && Number.isFinite(lat)) raw.push(projection.raw(lon, lat))
        }
      }
    }
  }
  projection.fit(raw)

  const shapes = {}
  const countries = []
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  for (const feature of features) {
    const props = feature.properties || {}
    if (!props.code) continue

    const d = []
    let bx0 = Infinity
    let by0 = Infinity
    let bx1 = -Infinity
    let by1 = -Infinity

    for (const poly of polygonsOf(feature.geometry)) {
      for (const ring of poly) {
        const pts = []
        for (const [lon, lat] of ring) {
          if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue
          const [x, y] = project(lon, lat)
          pts.push([x, -y])
          if (x < bx0) bx0 = x
          if (x > bx1) bx1 = x
          if (-y < by0) by0 = -y
          if (-y > by1) by1 = -y
        }
        if (pts.length < 3) continue
        d.push(`M${pts.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join('L')}Z`)
      }
    }
    if (!d.length) continue

    minX = Math.min(minX, bx0)
    minY = Math.min(minY, by0)
    maxX = Math.max(maxX, bx1)
    maxY = Math.max(maxY, by1)

    shapes[props.code] = {
      code: props.code,
      d: d.join(''),
      bbox: { x: bx0, y: by0, w: bx1 - bx0, h: by1 - by0 },
    }
    countries.push({ code: props.code, name: props.name, region: props.region, bbox: shapes[props.code].bbox })
  }

  const pad = 4
  const viewBox = `${(minX - pad).toFixed(1)} ${(minY - pad).toFixed(1)} ${(maxX - minX + pad * 2).toFixed(1)} ${(
    maxY -
    minY +
    pad * 2
  ).toFixed(1)}`

  return { shapes, countries, viewBox, bounds: { minX, minY, maxX, maxY } }
}

/** SVG satu negara saja (siluet), sudah dinormalisasi ke viewBox-nya sendiri. */
export function silhouetteMarkup(shapes, code, { className = '', padding = 2 } = {}) {
  const shape = shapes[code]
  if (!shape) return ''
  const { x, y, w, h } = shape.bbox
  const viewBox = `${(x - padding).toFixed(1)} ${(y - padding).toFixed(1)} ${(w + padding * 2).toFixed(1)} ${(
    h +
    padding * 2
  ).toFixed(1)}`
  return `<svg class="${className}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><path d="${shape.d}" /></svg>`
}
