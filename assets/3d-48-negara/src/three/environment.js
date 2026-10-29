import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CircleGeometry,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  PointsMaterial,
  Scene,
  SRGBColorSpace,
  Vector3,
  WebGLRenderer,
} from 'three'
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import { INK, PAPER } from './palette.js'

/**
 * Renderer + scene + kamera + lampu + tanah kertas + ring dekoratif.
 * Semua keputusan visual atmosfer (fog, shadow halus, grid subtle) di sini.
 */
export function createScene(container, labelsElement, { size } = {}) {
  // default tetap full window (explore.js tak berubah); panel mengoper provider sendiri
  const readSize = size || (() => ({ w: window.innerWidth, h: window.innerHeight }))
  const { w: width, h: height } = readSize()

  const renderer = new WebGLRenderer({ antialias: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)) // cap DPR 2
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = PCFShadowMap
  container.appendChild(renderer.domElement)

  const labelsRenderer = new CSS2DRenderer({ element: labelsElement })
  labelsRenderer.setSize(width, height)

  const scene = new Scene()
  scene.background = PAPER.clone()
  scene.fog = new Fog(PAPER.clone(), 300, 720) // horizon melebur ke paper

  const camera = new PerspectiveCamera(45, width / height, 0.5, 1600)

  // cahaya lembut: hemi membaca bidang, sun memberi relief extrude + bayangan
  const hemi = new HemisphereLight(0xfff8ec, 0xb29d7d, 0.9)
  const sun = new DirectionalLight(0xfff3e0, 1.02)
  sun.position.set(-170, 250, 150)
  sun.castShadow = true
  sun.shadow.mapSize.set(2048, 2048)
  sun.shadow.bias = -0.0006
  sun.shadow.normalBias = 0.5
  sun.shadow.camera.near = 60
  sun.shadow.camera.far = 780
  sun.shadow.camera.left = -170
  sun.shadow.camera.right = 170
  sun.shadow.camera.top = 170
  sun.shadow.camera.bottom = -170
  sun.shadow.camera.updateProjectionMatrix()

  const fill = new DirectionalLight(0xe8eef4, 0.24)
  fill.position.set(160, 130, -210)

  // key dari arah kamera: permukaan atas benua sedikit lebih terang dari kertas
  const key = new DirectionalLight(0xfff6e6, 0.18)
  key.position.set(30, 180, 90)

  scene.add(hemi, sun, fill, key)

  // tanah: kertas hangat + grid subtle + grain halus (canvas texture)
  const ground = new Mesh(
    new CircleGeometry(920, 72),
    new MeshStandardMaterial({ map: createGroundTexture(), roughness: 1, metalness: 0 })
  )
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.06
  ground.receiveShadow = true
  scene.add(ground)

  // ring tipis mengapit benua — berotasi pelan + bob halus saat idle
  const ring = new LineLoop(
    new BufferGeometry().setFromPoints(circlePoints(97, 180)),
    new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.2 })
  )
  ring.position.y = 0.08
  scene.add(ring)

  // graticule tipis: cincin konsentris + silang, di bawah benua biar tidak mengganggu
  const graticule = createGraticule()
  scene.add(graticule)

  // kompas + scale bar di sudut barat daya, di luar massa Asia
  const compass = createCompass()
  scene.add(compass)

  // debu halus melayang di atas peta
  const dust = createDust()
  scene.add(dust.points)

  function resize() {
    const { w, h } = readSize()
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(w, h)
    labelsRenderer.setSize(w, h)
  }

  function update(dt, elapsed) {
    ring.rotation.y += dt * 0.03
    ring.position.y = 0.08 + Math.sin(elapsed * 0.5) * 0.07
    compass.material.opacity = 0.56 + Math.sin(elapsed * 0.35) * 0.05
    updateDust(dust, elapsed)
  }

  function render() {
    renderer.render(scene, camera)
    labelsRenderer.render(scene, camera)
  }

  return { renderer, scene, camera, labelsRenderer, update, render, resize }
}

/** Cincin konsentris + silang tipis ala peta kuno, opacity rendah. */
function createGraticule() {
  const group = new Group()
  for (const [radius, opacity] of [
    [68, 0.12],
    [86, 0.085],
    [112, 0.06],
  ]) {
    const line = new LineLoop(
      new BufferGeometry().setFromPoints(circlePoints(radius, 160)),
      new LineBasicMaterial({ color: INK, transparent: true, opacity, depthWrite: false })
    )
    line.position.y = 0.006 // di bawah permukaan benua, jadi hanya terlihat di laut
    group.add(line)
  }
  const cross = [
    new Vector3(-118, 0.006, 0),
    new Vector3(118, 0.006, 0),
    new Vector3(0, 0.006, -118),
    new Vector3(0, 0.006, 118),
  ]
  group.add(
    new LineSegments(
      new BufferGeometry().setFromPoints(cross),
      new LineBasicMaterial({ color: INK, transparent: true, opacity: 0.05, depthWrite: false })
    )
  )
  return group
}

function createDust() {
  const count = 260
  const base = new Float32Array(count * 3)
  const positions = new Float32Array(count * 3)
  const phase = new Float32Array(count)
  let seed = 20240517
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
  for (let i = 0; i < count; i++) {
    const j = i * 3
    base[j] = (rnd() * 2 - 1) * 76
    base[j + 1] = 1.5 + rnd() * 13
    base[j + 2] = (rnd() * 2 - 1) * 56
    positions[j] = base[j]
    positions[j + 1] = base[j + 1]
    positions[j + 2] = base[j + 2]
    phase[i] = rnd() * Math.PI * 2
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  const points = new Points(
    geometry,
    new PointsMaterial({
      color: 0x5b4c35,
      size: 0.7,
      transparent: true,
      opacity: 0.17,
      depthWrite: false,
      sizeAttenuation: true,
    })
  )
  points.frustumCulled = false
  return { points, base, positions, phase, count }
}

function updateDust(dust, elapsed) {
  const { base, positions, phase, count } = dust
  for (let i = 0; i < count; i++) {
    const j = i * 3
    const p = phase[i]
    positions[j] = base[j] + Math.sin(elapsed * 0.16 + p) * 0.9
    positions[j + 1] = base[j + 1] + Math.sin(elapsed * 0.3 + p * 1.7) * 0.7
    positions[j + 2] = base[j + 2] + Math.cos(elapsed * 0.14 + p) * 0.9
  }
  dust.points.geometry.attributes.position.needsUpdate = true
}

/** Kompas + scale bar digambar ke satu canvas, lalu ditempel di plane kecil. */
function createCompass() {
  const texture = createCompassTexture()
  texture.colorSpace = SRGBColorSpace
  const mesh = new Mesh(
    new PlaneGeometry(26, 13),
    new MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.6, depthWrite: false })
  )
  mesh.rotation.x = -Math.PI / 2
  mesh.position.set(-62, 0.045, 35)
  mesh.renderOrder = 2
  return mesh
}

function createCompassTexture() {
  const width = 512
  const height = 256
  const cnv = document.createElement('canvas')
  cnv.width = width
  cnv.height = height
  const ctx = cnv.getContext('2d')
  const ink = (a) => `rgba(33, 27, 18, ${a})`

  ctx.clearRect(0, 0, width, height)

  const cx = 118
  const cy = 128
  const R = 82

  // cincin luar + dalam
  ctx.strokeStyle = ink(0.42)
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.arc(cx, cy, R, 0, Math.PI * 2)
  ctx.stroke()

  ctx.strokeStyle = ink(0.2)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx, cy, R * 0.66, 0, Math.PI * 2)
  ctx.stroke()

  // 8 kelopak mata angin
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2
    const long = i % 2 === 0
    const tip = R * (long ? 0.62 : 0.36)
    const halfW = R * (long ? 0.11 : 0.075)
    const px = Math.cos(a + Math.PI / 2) * halfW
    const py = Math.sin(a + Math.PI / 2) * halfW
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * tip, cy + Math.sin(a) * tip)
    ctx.lineTo(cx + px, cy + py)
    ctx.lineTo(cx - px, cy - py)
    ctx.closePath()
    ctx.fillStyle = ink(long ? (i % 4 === 0 ? 0.3 : 0.2) : 0.13)
    ctx.fill()
  }

  // tick tiap 11.25 derajat, tiap 90 derajat lebih tebal
  for (let i = 0; i < 32; i++) {
    const a = (i / 32) * Math.PI * 2 - Math.PI / 2
    const major = i % 8 === 0
    const mid = i % 4 === 0
    const r0 = R - (major ? 14 : mid ? 9 : 5)
    ctx.strokeStyle = ink(major ? 0.5 : mid ? 0.33 : 0.2)
    ctx.lineWidth = major ? 1.8 : 1
    ctx.beginPath()
    ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
    ctx.lineTo(cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2))
    ctx.stroke()
  }

  // huruf mata angin
  ctx.fillStyle = ink(0.62)
  ctx.font = '600 24px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const cardinals = [
    ['N', -Math.PI / 2],
    ['E', 0],
    ['S', Math.PI / 2],
    ['W', Math.PI],
  ]
  for (const [label, a] of cardinals) {
    ctx.fillText(label, cx + Math.cos(a) * (R + 19), cy + Math.sin(a) * (R + 19))
  }

  // titik pusat
  ctx.fillStyle = ink(0.5)
  ctx.beginPath()
  ctx.arc(cx, cy, 2.5, 0, Math.PI * 2)
  ctx.fill()

  // scale bar tipis (236 px ~ 12 unit dunia ~ 1.000 km pada skala peta ini)
  const barX = 250
  const barY = 154
  const barLen = 236
  ctx.strokeStyle = ink(0.42)
  ctx.lineWidth = 1.4
  ctx.beginPath()
  ctx.moveTo(barX, barY)
  ctx.lineTo(barX + barLen, barY)
  ctx.stroke()
  for (const x of [barX, barX + barLen / 2, barX + barLen]) {
    ctx.beginPath()
    ctx.moveTo(x, barY - 7)
    ctx.lineTo(x, barY + 1)
    ctx.stroke()
  }
  ctx.fillStyle = ink(0.55)
  ctx.font = '500 16px Georgia, "Times New Roman", serif'
  ctx.textAlign = 'left'
  ctx.fillText('SKALA', barX, barY - 20)
  ctx.fillText('0', barX, barY + 22)
  ctx.textAlign = 'right'
  ctx.fillText('1 000 km', barX + barLen, barY + 22)

  return new CanvasTexture(cnv)
}

function circlePoints(radius, count) {
  const pts = []
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2
    pts.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
  }
  return pts
}

function createGroundTexture() {
  const size = 1024
  const cnv = document.createElement('canvas')
  cnv.width = size
  cnv.height = size
  const ctx = cnv.getContext('2d')

  // gradasi radial: sedikit lebih gelap ke tepi, kertas di tengah
  const grad = ctx.createRadialGradient(size / 2, size / 2, size * 0.04, size / 2, size / 2, size * 0.52)
  grad.addColorStop(0, '#efe7d5')
  grad.addColorStop(0.62, '#e7dcc7')
  grad.addColorStop(1, '#d8cbb2')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)

  // bayangan lembut di bawah massa benua
  const shadow = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.01,
    size / 2,
    size / 2,
    size * 0.07
  )
  shadow.addColorStop(0, 'rgba(63, 53, 36, 0.07)')
  shadow.addColorStop(0.55, 'rgba(63, 53, 36, 0.03)')
  shadow.addColorStop(1, 'rgba(63, 53, 36, 0)')
  ctx.fillStyle = shadow
  ctx.fillRect(0, 0, size, size)

  // kontur tipis mengelilingi peta, seperti garis topografi peta lama
  ctx.strokeStyle = 'rgba(63, 53, 36, 0.045)'
  ctx.lineWidth = 1
  for (let r = size * 0.055; r < size * 0.2; r += size * 0.022) {
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  // grid hairline sangat samar
  ctx.strokeStyle = 'rgba(63, 53, 36, 0.06)'
  ctx.lineWidth = 1
  const step = size / 18
  for (let i = 1; i < 18; i++) {
    const p = i * step
    ctx.beginPath()
    ctx.moveTo(p, 0)
    ctx.lineTo(p, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, p)
    ctx.lineTo(size, p)
    ctx.stroke()
  }

  // speckle kertas biar nggak steril
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillStyle = i % 2 ? 'rgba(63, 53, 36, 0.028)' : 'rgba(255, 252, 244, 0.05)'
    ctx.fillRect(x, y, 1.5, 1.5)
  }

  const tex = new CanvasTexture(cnv)
  tex.colorSpace = SRGBColorSpace
  return tex
}
