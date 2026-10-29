import { PerspectiveCamera, Vector3, Spherical } from 'three';
import { getOverview } from '../src/scene/map48/camera-rig.js';
import { createProjection } from '../src/scene/map48/projection.js';

// Project GeoJSON points to world coordinates
const geojson = (await import('../src/data/asia-countries.geo.json', { with: { type: 'json' } })).default;
const proj = createProjection();

// Collect all points
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

// Find world extents of continent
let minWorldX = Infinity, maxWorldX = -Infinity;
let minWorldZ = Infinity, maxWorldZ = -Infinity;
const worldPoints = [];

for (const feature of geojson.features) {
  const geom = feature.geometry;
  const polyList = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  for (const poly of polyList) {
    for (const ring of poly) {
      for (const [lon, lat] of ring) {
        const [x, y] = proj.project(lon, lat);
        const z = -y;
        if (x < minWorldX) minWorldX = x;
        if (x > maxWorldX) maxWorldX = x;
        if (z < minWorldZ) minWorldZ = z;
        if (z > maxWorldZ) maxWorldZ = z;
        worldPoints.push(new Vector3(x, 0, z));
      }
    }
  }
}

console.log('World Bounds:');
console.log(`X: [${minWorldX.toFixed(1)}, ${maxWorldX.toFixed(1)}], Center X: ${((minWorldX + maxWorldX)/2).toFixed(1)}`);
console.log(`Z: [${minWorldZ.toFixed(1)}, ${maxWorldZ.toFixed(1)}], Center Z: ${((minWorldZ + maxWorldZ)/2).toFixed(1)}`);

function testScreenProjection(w, h, ov) {
  const camera = new PerspectiveCamera(45, w / h, 0.5, 1600);
  const target = ov.target;
  camera.position.setFromSpherical(new Spherical(ov.radius, ov.phi, ov.theta)).add(target);
  camera.lookAt(target);
  camera.updateMatrixWorld();
  camera.updateProjectionMatrix();

  let minScreenX = Infinity, maxScreenX = -Infinity;
  for (const pt of worldPoints) {
    const v = pt.clone().project(camera);
    // NDC (-1 to 1) to screen pixels (0 to w)
    const screenX = (v.x * 0.5 + 0.5) * w;
    if (screenX < minScreenX) minScreenX = screenX;
    if (screenX > maxScreenX) maxScreenX = screenX;
  }

  const leftColRight = Math.min(88 * w / 100, 440) + Math.max(32, w * 0.04);
  const rightEdge = w;
  const availSpace = rightEdge - leftColRight;
  const idealCenter = leftColRight + availSpace / 2;
  const actualCenter = (minScreenX + maxScreenX) / 2;
  const gapLeft = minScreenX - leftColRight;
  const gapRight = rightEdge - maxScreenX;

  console.log(`\nScreen ${w}x${h} (leftColRight=${leftColRight.toFixed(0)}):`);
  console.log(`Continent on screen: [${minScreenX.toFixed(0)}px, ${maxScreenX.toFixed(0)}px], Width: ${(maxScreenX - minScreenX).toFixed(0)}px`);
  console.log(`Actual Center: ${actualCenter.toFixed(0)}px (${(actualCenter/w*100).toFixed(1)}%) vs Ideal Center: ${idealCenter.toFixed(0)}px (${(idealCenter/w*100).toFixed(1)}%)`);
  console.log(`Gap to Left Column: ${gapLeft.toFixed(0)}px`);
  console.log(`Gap to Right Edge:   ${gapRight.toFixed(0)}px`);
  console.log(`Difference (GapRight - GapLeft): ${(gapRight - gapLeft).toFixed(0)}px ${gapRight > gapLeft ? '-> TERLALU KE KIRI!' : '-> TERLALU KE KANAN!'}`);
}

console.log('--- Current Overview Settings (targetX = -16, radius = 174) ---');
testScreenProjection(1440, 900, getOverview(1440/900));
testScreenProjection(1280, 800, getOverview(1280/800));
testScreenProjection(1024, 602, getOverview(1024/602));
