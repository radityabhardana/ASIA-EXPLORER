import fs from 'fs';

const geo = JSON.parse(fs.readFileSync('./src/data/asia-countries.geo.json', 'utf8'));

const DEG = Math.PI / 180;
const lon0 = 49;
const lat0 = 42;
const phi0 = lat0 * DEG;
const cosPhi0 = Math.cos(phi0);
const sinPhi0 = Math.sin(phi0);

function project(lon, lat) {
  const phi = lat * DEG;
  const dLon = (lon - lon0) * DEG;
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  let cosC = sinPhi0 * sinPhi + cosPhi0 * cosPhi * Math.cos(dLon);
  if (cosC > 1) cosC = 1;
  else if (cosC < -1) cosC = -1;
  const k = Math.sqrt(2 / (1 + cosC));
  return [
    k * cosPhi * Math.sin(dLon),
    k * (cosPhi0 * sinPhi - sinPhi0 * cosPhi * Math.cos(dLon)),
  ];
}

const allRaw = [];
for (const feat of geo.features) {
  const coords = feat.geometry.type === 'Polygon' ? [feat.geometry.coordinates] : feat.geometry.coordinates;
  for (const poly of coords) {
    for (const ring of poly) {
      for (const p of ring) {
        allRaw.push(project(p[0], p[1]));
      }
    }
  }
}

let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;
for (const [x, y] of allRaw) {
  if (x < minX) minX = x;
  if (x > maxX) maxX = x;
  if (y < minY) minY = y;
  if (y > maxY) maxY = y;
}

const W = 1000;
const H = 720;
const pad = 24;
const innerW = W - 2 * pad;
const innerH = H - 2 * pad;
const rawW = maxX - minX;
const rawH = maxY - minY;
const scale = Math.min(innerW / rawW, innerH / rawH);
const offsetX = pad + (innerW - rawW * scale) / 2;
const offsetY = pad + (innerH - rawH * scale) / 2;

function toSvgCoord(lon, lat) {
  const [rx, ry] = project(lon, lat);
  const sx = offsetX + (rx - minX) * scale;
  const sy = offsetY + (maxY - ry) * scale;
  return [Number(sx.toFixed(1)), Number(sy.toFixed(1))];
}

const countryPaths = [];
for (const feat of geo.features) {
  const code = feat.properties.code;
  const name = feat.properties.name;
  const region = feat.properties.region;
  const coords = feat.geometry.type === 'Polygon' ? [feat.geometry.coordinates] : feat.geometry.coordinates;

  let pathD = '';
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  for (const poly of coords) {
    for (const ring of poly) {
      if (ring.length < 3) continue;
      for (let i = 0; i < ring.length; i++) {
        const [sx, sy] = toSvgCoord(ring[i][0], ring[i][1]);
        pathD += (i === 0 ? 'M' : 'L') + sx + ' ' + sy;
        sumX += sx;
        sumY += sy;
        count++;
      }
      pathD += 'Z';
    }
  }

  countryPaths.push({
    code,
    name,
    region,
    d: pathD,
    centroid: [Number((sumX / count).toFixed(1)), Number((sumY / count).toFixed(1))],
  });
}

const result = {
  viewBox: `0 0 ${W} ${H}`,
  width: W,
  height: H,
  countries: countryPaths,
};

fs.writeFileSync('src/content/asia-2d-paths.json', JSON.stringify(result, null, 2));
console.log('Saved src/content/asia-2d-paths.json with', countryPaths.length, 'countries');

