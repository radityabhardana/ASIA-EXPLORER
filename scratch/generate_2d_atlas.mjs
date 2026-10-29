import fs from 'fs';
import { Color } from 'three';

const geo = JSON.parse(fs.readFileSync('./src/data/asia-countries.geo.json', 'utf8'));
const countriesFull = JSON.parse(fs.readFileSync('./src/content/countries.json', 'utf8'));
const countries48Raw = fs.readFileSync('./src/content/countries48.ts', 'utf8');

const iso3Map = new Map();
for (const c of countriesFull) {
  iso3Map.set(c.iso3.toUpperCase(), c);
}

const REGION_TONES = {
  'West Asia': '#96503a',
  'Central Asia': '#a17818',
  'South Asia': '#9f6577',
  'Southeast Asia': '#648559',
  'East Asia': '#5a7899',
};

const REGION_IDS = {
  'West Asia': 'wa',
  'Central Asia': 'ca',
  'South Asia': 'sa',
  'Southeast Asia': 'sea',
  'East Asia': 'ea',
};

function jitter(baseHex, code, lightRange = 0.08) {
  const color = new Color(baseHex);
  let hash = 0;
  for (let i = 0; i < code.length; i++) hash = (hash * 31 + code.charCodeAt(i)) >>> 0;
  color.offsetHSL(
    ((hash % 97) / 97 - 0.5) * 0.04,
    0,
    ((Math.floor(hash / 97) % 89) / 89 - 0.5) * lightRange,
  );
  return '#' + color.getHexString();
}

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
const pad = 28;
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

const countries = [];
const regionBounds = {
  sea: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  ea: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  sa: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  wa: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
  ca: { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity },
};

for (const feat of geo.features) {
  const code = feat.properties.code.toUpperCase();
  const region = feat.properties.region;
  const meta = iso3Map.get(code);
  const id = meta?.id || code.toLowerCase();
  const name = meta?.nameId || feat.properties.name;
  const nameLocal = meta?.nameLocal || '';
  
  // Extract capital from countries48.ts
  const capRegex = new RegExp(code + ':\\s*\\{[\\s\\S]*?capital:\\s*[\'"]([^\'"]+)[\'"]');
  const capMatch = countries48Raw.match(capRegex);
  const capital = capMatch ? capMatch[1] : (meta?.capital || '');
  const regionId = REGION_IDS[region] || 'sea';
  const coords = feat.geometry.type === 'Polygon' ? [feat.geometry.coordinates] : feat.geometry.coordinates;

  let pathD = '';
  let sumX = 0;
  let sumY = 0;
  let count = 0;
  let cMinX = Infinity, cMinY = Infinity, cMaxX = -Infinity, cMaxY = -Infinity;

  for (const poly of coords) {
    for (const ring of poly) {
      if (ring.length < 3) continue;
      for (let i = 0; i < ring.length; i++) {
        const [sx, sy] = toSvgCoord(ring[i][0], ring[i][1]);
        pathD += (i === 0 ? 'M' : 'L') + sx + ' ' + sy;
        sumX += sx;
        sumY += sy;
        count++;
        if (sx < cMinX) cMinX = sx;
        if (sx > cMaxX) cMaxX = sx;
        if (sy < cMinY) cMinY = sy;
        if (sy > cMaxY) cMaxY = sy;
      }
      pathD += 'Z';
    }
  }

  // update region bounds
  const rb = regionBounds[regionId];
  if (rb) {
    if (cMinX < rb.minX) rb.minX = cMinX;
    if (cMaxX > rb.maxX) rb.maxX = cMaxX;
    if (cMinY < rb.minY) rb.minY = cMinY;
    if (cMaxY > rb.maxY) rb.maxY = cMaxY;
  }

  const baseTone = REGION_TONES[region] || '#5a7899';
  const color = jitter(baseTone, code);

  countries.push({
    id,
    code,
    name,
    nameLocal,
    capital,
    region,
    regionId,
    d: pathD,
    color,
    centroid: [Number((sumX / count).toFixed(1)), Number((sumY / count).toFixed(1))],
    bbox: [cMinX, cMinY, cMaxX, cMaxY],
  });
}

// Urutkan negara secara geografis Barat ke Timur untuk tab focus yang natural
countries.sort((a, b) => a.centroid[0] - b.centroid[0]);

const outputData = {
  viewBox: `0 0 ${W} ${H}`,
  width: W,
  height: H,
  regionBounds,
  countries,
};

fs.writeFileSync('src/content/asia-2d-countries.json', JSON.stringify(outputData, null, 2));
console.log('Successfully re-generated src/content/asia-2d-countries.json with 48 countries');
