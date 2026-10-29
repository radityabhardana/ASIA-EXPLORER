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

function testTuned(w, h) {
  const isMobile = w < 768 || (w / h) < 1.15;
  const aspect = w / h;

  let radius, targetX, targetZ;
  if (isMobile) {
    radius = Math.round(184 / aspect);
    targetX = 0;
    targetZ = -58;
  } else {
    // Pada desktop & laptop:
    // Sisa ruang di kanan kolom teks = w - 480px.
    // Jika sisa ruang semakin sempit (misal di laptop 1024 - 1280px),
    // naikkan radius (kamera mundur) agar benua tetap pas dan tidak menabrak teks maupun tepi kanan!
    const availSpace = w - 480;
    if (availSpace < 600) {
      radius = 215;
    } else if (availSpace < 800) {
      radius = 202;
    } else {
      radius = 192;
    }

    // Koreksi offset targetX agar center geometris benua berada tepat di titik tengah (availSpace / 2):
    // Dengan radius di atas dan fov 45 deg, offset optis yang presisi:
    const tanHalfFov = Math.tan(22.5 * Math.PI / 180);
    // Faktor penyeimbang rotasi theta (0.08) & asimetri bentang Asia timur-barat (+3.2)
    targetX = - ((480 * radius * tanHalfFov) / h) + 4.2;
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
  console.log(`Continent on screen: [${minScreenX.toFixed(0)}px, ${maxScreenX.toFixed(0)}px], Width: ${(maxScreenX - minScreenX).toFixed(0)}px`);
  console.log(`Gap to Left Column: ${gapLeft.toFixed(1)}px`);
  console.log(`Gap to Right Edge:   ${gapRight.toFixed(1)}px`);
  console.log(`Difference: ${Math.abs(gapRight - gapLeft).toFixed(1)}px -> ${Math.abs(gapRight - gapLeft) < 15 ? '✓ PERFECT RATA TENGAH!' : 'Perlu tuning'}`);
}

testTuned(1440, 900);
testTuned(1366, 768);
testTuned(1280, 800);
testTuned(1024, 768);
testTuned(1024, 602);

