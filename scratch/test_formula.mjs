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

function testFormula(w, h) {
  const isMobile = w < 768 || (w / h) < 1.15;
  const aspect = w / h;

  let radius, targetX, targetZ;
  if (isMobile) {
    radius = Math.round(184 / aspect);
    targetX = 0;
    targetZ = -58;
  } else {
    // Radius disesuaikan agar benua nyaman berada dalam sisa ruang layar
    // Pada laptop 1024-1280px, radius sedikit lebih tinggi (180-195) agar tidak terlalu mepet
    const availSpace = w - 480;
    // Scale radius:
    radius = availSpace < 600 ? 180 : availSpace < 850 ? 190 : 195;
    const tanHalfFov = Math.tan(22.5 * Math.PI / 180);
    targetX = - (480 * radius * tanHalfFov) / h;
    targetZ = 0;
  }

  const camera = new PerspectiveCamera(45, aspect, 0.5, 1600);
  const target = new Vector3(targetX, 0, targetZ);
  camera.position.setFromSpherical(new Spherical(radius, 1.05, 0.08)).add(target);
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

  const leftColRight = Math.min(88 * w / 100, 440) + Math.max(32, w * 0.04);
  const gapLeft = minScreenX - leftColRight;
  const gapRight = w - maxScreenX;

  console.log(`\nResult for ${w}x${h} (radius=${radius}, targetX=${targetX.toFixed(1)}):`);
  console.log(`Continent on screen: [${minScreenX.toFixed(0)}px, ${maxScreenX.toFixed(0)}px]`);
  console.log(`Gap to Left Column: ${gapLeft.toFixed(1)}px`);
  console.log(`Gap to Right Edge:   ${gapRight.toFixed(1)}px`);
  console.log(`Difference: ${Math.abs(gapRight - gapLeft).toFixed(1)}px -> ${Math.abs(gapRight - gapLeft) < 10 ? 'PERFECT RATA TENGAH!' : 'Perlu tuning'}`);
}

testFormula(1440, 900);
testFormula(1366, 768);
testFormula(1280, 800);
testFormula(1024, 602);
testFormula(1024, 768);
