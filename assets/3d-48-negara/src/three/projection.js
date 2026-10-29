// deep import: landing tidak perlu ikut mengunduh seluruh three.js
import { Vector3 } from 'three/src/math/Vector3.js'

const DEG = Math.PI / 180

/**
 * Proyeksi Lambert azimuthal equal-area, ditulis manual (zero dependensi).
 * Dipusatkan ~(49E, 42N) dekat pusat massa benua Asia supaya distorsi
 * melandai ke tepi, lalu hasil mentahnya di-fit ke span peta dunia.
 *
 * Proyeksinya area-preserving, jadi proporsi benua terlihat jauh lebih
 * proporsional dibanding equirect langsung.
 */
export function createProjection({ lon0 = 49, lat0 = 42, mapSpan = 118 } = {}) {
  const phi0 = lat0 * DEG
  const cosPhi0 = Math.cos(phi0)
  const sinPhi0 = Math.sin(phi0)

  // koordinat mentah dalam "unit planet" (rad), belum diskalakan
  function raw(lon, lat) {
    const phi = lat * DEG
    const dLon = (lon - lon0) * DEG
    const cosPhi = Math.cos(phi)
    const sinPhi = Math.sin(phi)
    let cosC = sinPhi0 * sinPhi + cosPhi0 * cosPhi * Math.cos(dLon)
    if (cosC > 1) cosC = 1
    else if (cosC < -1) cosC = -1
    const k = Math.sqrt(2 / (1 + cosC))
    return [
      k * cosPhi * Math.sin(dLon),
      k * (cosPhi0 * sinPhi - sinPhi0 * cosPhi * Math.cos(dLon)),
    ]
  }

  let scale = 1
  let centerX = 0
  let centerY = 0

  return {
    raw,
    /**
     * Hitung skala+offset dari seluruh titik mentah agar benua muat pas
     * ke MAP_SPAN unit dunia (aspek rasio dipertahankan, pinggiran nyaman).
     * Return half-extent dunia: { halfX, halfZ }.
     */
    fit(rawPoints) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity
      for (const [x, y] of rawPoints) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
      const w = maxX - minX
      const h = maxY - minY
      scale = mapSpan / Math.max(w, h)
      centerX = (minX + maxX) / 2
      centerY = (minY + maxY) / 2
      return { halfX: (w * scale) / 2, halfZ: (h * scale) / 2 }
    },
    /** lon/lat -> koordinat bidang peta: [x, y], utara positif. */
    project(lon, lat) {
      const [x, y] = raw(lon, lat)
      return [(x - centerX) * scale, (y - centerY) * scale]
    },
    /** lon/lat -> titik di bidang dunia (peta datar di ketinggian 0). */
    toWorld(lon, lat, out = new Vector3()) {
      const [px, py] = this.project(lon, lat)
      return out.set(px, 0, -py) // utara -> z negatif (menjauh dari kamera sel)
    },
  }
}
