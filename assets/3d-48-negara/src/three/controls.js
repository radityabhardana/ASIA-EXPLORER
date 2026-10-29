import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

const PADDING = 26 // margin target clamp di luar tepi peta

/**
 * OrbitControls dengan batas pitch/zoom biar kamera nyaman dan tidak
 * nembus tanah, pan dimatikan agar peta selalu berada di frame.
 */
export function createControls(camera, domElement, worldHalf) {
  const controls = new OrbitControls(camera, domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.rotateSpeed = 0.55
  controls.zoomSpeed = 0.7
  controls.enablePan = false
  controls.zoomToCursor = true
  controls.minDistance = 46
  controls.maxDistance = 340
  controls.minPolarAngle = 0.3   // kagak boleh nembus dari atas
  controls.maxPolarAngle = 1.3   // kagak boleh mepet horizon
  controls.targetBounds = {
    x: worldHalf.halfX + PADDING,
    z: worldHalf.halfZ + PADDING,
  }
  return controls
}

/** Cegah target jalan keluar wilayah peta antar frame. */
export function clampControlsTarget(controls) {
  const b = controls.targetBounds
  const t = controls.target
  t.x = Math.max(-b.x, Math.min(b.x, t.x))
  t.z = Math.max(-b.z, Math.min(b.z, t.z))
  t.y = Math.max(0, Math.min(12, t.y))
}
