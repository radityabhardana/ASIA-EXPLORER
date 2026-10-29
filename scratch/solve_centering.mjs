import { PerspectiveCamera, Vector3, Spherical } from 'three';
import { createProjection } from '../src/scene/map48/projection.js';

const geojson = (await import('../src/data/asia-countries.geo.json', { with: { type: 'json' } })).default;
const proj = createProjection();

const allPoints = [];
for (const feature of geojson.features) {
  const geom = feature.geometry;
  const polyList = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  for (const poly of polyList) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) {
        allPoints.push(proj.raw(lon, lat));
      }
    }
  }
}
proj.fit(allPoints);

const worldPoints = [];
for (const feature of geojson.features) {
  const geom = feature.geometry;
  const polyList = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  for (const poly of polyList) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) {
        const [x, y] = proj.project(lon, lat);
        worldPoints.push(new Vector3(x, 0, -y));
      }
    }
  }
}

function solveOptimalTargetX(w, h) {
  const leftColRight = Math.min(88 * w / 100, 440) + Math.max(32, w * 0.04);
  const rightEdge = w;
  const availSpace = rightEdge - leftColRight;
  const idealCenter = leftColRight + availSpace / 2;

  // Let's test targetX from -45 to -15
  let bestTargetX = -16;
  let minDiff = Infinity;
  let bestResult = null;

  // Also scale radius if needed so continent fits comfortably in availSpace
  // Continent width in world space is ~118 units.
  // We want continent width on screen to be around ~75% of availSpace so gaps on both sides are positive and equal!
  const targetContinentWidth = availSpace * 0.82; // comfortable breathing room
  // rough radius scaling:
  // on 1440: availSpace=955, targetContinentWidth ~ 780, radius ~ 174 is good
  // on 1280: availSpace=800, targetContinentWidth ~ 650, radius ~ 185
  // on 1024: availSpace=540, targetContinentWidth ~ 440, radius ~ 215

  for (let r = 160; r <= 230; r += 5) {
    for (let tX = -45; tX <= -10; tX += 0.5) {
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

      // We want gapLeft >= 20, gapRight >= 20, and Math.abs(gapRight - gapLeft) minimal!
      if (gapLeft > 15 && gapRight > 15) {
        const diff = Math.abs(gapRight - gapLeft);
        if (diff < minDiff) {
          minDiff = diff;
          bestTargetX = tX;
          bestResult = {
            r,
            tX,
            minScreenX,
            maxScreenX,
            width: maxScreenX - minScreenX,
            actualCenter: (minScreenX + maxScreenX) / 2,
            idealCenter,
            gapLeft,
            gapRight,
            diff
          };
        }
      }
    }
  }

  console.log(`Optimal for ${w}x${h}:`, bestResult);
  return bestResult;
}

console.log('--- Solving for Perfect Centering ---');
solveOptimalTargetX(1440, 900);
solveOptimalTargetX(1280, 800);
solveOptimalTargetX(1024, 602);
