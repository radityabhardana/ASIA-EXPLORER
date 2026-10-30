import { MOUSE, TOUCH } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const PADDING = 26; // margin target clamp di luar tepi peta

/**
 * OrbitControls ramah kartografi (Map-First UX):
 * - Tarik biasa: GESER (PAN) peta di bidang datar X/Z layaknya atlas fisik.
 * - Tahan Ctrl + tarik: PUTAR (ROTATE) sudut pandang 3D untuk melihat relief.
 * - Tahan Ctrl + gulir: ZOOM IN / OUT ke posisi kursor.
 * - Mobile touch: 1 jari PUTAR (ROTATE), 2 jari ZOOM & PAN (DOLLY_PAN).
 */
export function createControls(camera, domElement, worldHalf) {
  const controls = new OrbitControls(camera, domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.rotateSpeed = 0.55;
  controls.zoomSpeed = 0.7;
  controls.enablePan = true;
  controls.panSpeed = 0.85;
  controls.screenSpacePanning = false; // pan di bidang tanah datar X/Z
  controls.zoomToCursor = true;
  controls.minDistance = 20;
  controls.maxDistance = 560;
  controls.minPolarAngle = 0.45; // tidak tembus tanah dari atas
  controls.maxPolarAngle = 1.25; // tidak mepet horizon atau terbalik
  controls.targetBounds = {
    x: worldHalf.halfX + PADDING,
    z: worldHalf.halfZ + PADDING,
  };

  // Map-first: Tarik kiri biasa = PAN (geser), Ctrl + Tarik kiri = ROTATE (putar)
  controls.mouseButtons = {
    LEFT: MOUSE.PAN,
    MIDDLE: MOUSE.DOLLY,
    RIGHT: MOUSE.ROTATE,
  };

  // Touch gesture eksplisit: 1 jari rotasi, 2 jari zoom + geser
  controls.touches = {
    ONE: TOUCH.ROTATE,
    TWO: TOUCH.DOLLY_PAN,
  };

  return controls;
}

/** Cegah target jalan keluar wilayah peta antar frame. */
export function clampControlsTarget(controls) {
  const b = controls.targetBounds;
  const t = controls.target;
  t.x = Math.max(-b.x, Math.min(b.x, t.x));
  t.z = Math.max(-b.z, Math.min(b.z, t.z));
  t.y = Math.max(0, Math.min(12, t.y));
}
