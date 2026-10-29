import { PerspectiveCamera, Vector3, Spherical } from 'three';
import { createProjection } from '../src/scene/map48/projection.js';

const geojson = (await import('../src/data/asia-countries.geo.json', { with: { type: 'json' } })).default;
const proj = createProjection();
const allPoints = [];
for (const feature of geojson.features) {
  const geom = feature.geometry;
  const polyList = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  for (const poly of polyList) for (const ring of poly) for (const [lon, lat] of ring) allPoints.push(proj.raw(lon, lat));
}
proj.fit(allPoints);
const worldPoints = [];
for (const feature of geojson.features) {
  const geom = feature.geometry;
  const polyList = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  for (const poly of polyList) for (const ring of poly) for (const [lon, lat] of ring) {
    const [x, y] = proj.project(lon, lat);
    worldPoints.push(new Vector3(x, 0, -y));
  }
}

function solveForAspect(w, h) {
  const leftColRight = Math.min(88 * w / 100, 440) + Math.max(32, w * 0.04);
  const rightEdge = w;
  const availSpace = rightEdge - leftColRight;
  const idealCenter = leftColRight + availSpace / 2;

  let minDiff = Infinity;
  let bestResult = null;

  for (let r = 170; r <= 280; r += 5) {
    for (let tX = -55; tX <= -25; tX += 0.5) {
      const camera = new PerspectiveCamera(45, w / h, 0.5, 1600);
      const target = new Vector3(tX, 0, 0);
      camera.position.setFromSpherical(new Spherical(r, 1.05, 0.08)).add(target);
      camera.lookAt(target);
      camera.updateMatrixWorld();
      camera.updateProjectionMatrix();

      let minScreenX = Infinity, maxScreenX = -Infinity;
      for (const pt of worldPoints) {
        const v = pt.clone().project(camera);
        const screenX = (v.x * 0.5 + 0.5) * w;
        if (screenX < minScreenX) minScreenX = screenX;
        if (screenX > maxScreenX) maxScreenX = screenX;
      }

      const gapLeft = minScreenX - leftColRight;
      const gapRight = rightEdge - maxScreenX;

      if (gapLeft > 10 && gapRight > 10) {
        const diff = Math.abs(gapRight - gapLeft);
        if (diff < minDiff) {
          minDiff = diff;
          bestResult = { r, tX, minScreenX, maxScreenX, width: maxScreenX - minScreenX, gapLeft, gapRight, diff };
        }
      }
    }
  }

  console.log(`Optimal for ${w}x${h} (avail=${availSpace.toFixed(0)}):`, bestResult);
}

solveForAspect(1440, 900);
solveForAspect(1280, 800);
solveForAspect(1024, 602);
