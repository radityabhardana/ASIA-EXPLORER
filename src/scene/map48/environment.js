import {
  DirectionalLight,
  HemisphereLight,
  Mesh,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  ShadowMaterial,
  WebGLRenderer,
} from 'three';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

/**
 * Renderer + scene + kamera + lampu + tanah bayangan transparan.
 * Dibuat transparan murni (alpha: true, ShadowMaterial) agar relief benua 3D
 * menyatu ("nyampur") secara sempurna dan mulus dengan latar belakang web.
 */
export function createScene(container, labelsElement, { size } = {}) {
  const readSize = size || (() => ({ w: window.innerWidth, h: window.innerHeight }));
  const { w: width, h: height } = readSize();

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0); // 100% transparan, menyatu ("nyampur") dengan halaman
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); // cap DPR 2
  renderer.setSize(width, height);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  container.appendChild(renderer.domElement);

  const labelsRenderer = new CSS2DRenderer({ element: labelsElement });
  labelsRenderer.setSize(width, height);

  const scene = new Scene();
  // Tanpa scene.background dan scene.fog agar canvas transparan murni

  const camera = new PerspectiveCamera(45, width / height, 0.5, 1600);

  // Cahaya lembut: hemi membaca bidang, sun memberi relief extrude + bayangan
  const hemi = new HemisphereLight(0xfff8ec, 0xb29d7d, 0.95);
  const sun = new DirectionalLight(0xfff3e0, 1.15);
  sun.position.set(-170, 250, 150);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 0.5;
  sun.shadow.camera.near = 60;
  sun.shadow.camera.far = 780;
  sun.shadow.camera.left = -170;
  sun.shadow.camera.right = 170;
  sun.shadow.camera.top = 170;
  sun.shadow.camera.bottom = -170;
  sun.shadow.camera.updateProjectionMatrix();

  const fill = new DirectionalLight(0xe8eef4, 0.28);
  fill.position.set(160, 130, -210);

  // Key dari arah kamera: permukaan atas benua sedikit lebih terang
  const key = new DirectionalLight(0xfff6e6, 0.28);
  key.position.set(30, 180, 90);

  // Rim light: menonjolkan chamfer micro-bevel di sepanjang garis pantai & teluk maritim
  const rim = new DirectionalLight(0xfff5ea, 0.48);
  rim.position.set(140, 90, -220);

  scene.add(hemi, sun, fill, key, rim);

  // Bidang tanah transparan yang HANYA menerima bayangan (ShadowMaterial).
  // Menghilangkan kotak cokelat/sephia agar relief benua menyatu alami ke background halaman.
  const ground = new Mesh(
    new PlaneGeometry(1800, 1800),
    new ShadowMaterial({ opacity: 0.07 }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.04;
  ground.receiveShadow = true;
  scene.add(ground);

  const initialSunX = -170;
  const initialSunZ = 150;

  function resize() {
    const { w, h } = readSize();
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    labelsRenderer.setSize(w, h);
  }

  function update(dt, t = 0) {
    // Organically breathe sun position over time so architectural bevels and cast shadows catch live light
    sun.position.x = initialSunX + Math.sin(t * 0.1) * 10;
    sun.position.z = initialSunZ + Math.cos(t * 0.1) * 8;
  }

  function render() {
    renderer.render(scene, camera);
    labelsRenderer.render(scene, camera);
  }

  return { renderer, scene, camera, labelsRenderer, update, render, resize };
}
