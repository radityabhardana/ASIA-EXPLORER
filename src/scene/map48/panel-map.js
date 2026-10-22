import '@/styles/panel-map.css';
import { createProjection } from './projection.js';
import { buildCountries, animateCountries } from './countries.js';
import { createScene } from './environment.js';
import { attachLabels } from './labels.js';
import { createControls, clampControlsTarget } from './controls.js';
import { CameraRig, OVERVIEW } from './camera-rig.js';
import { createInteraction } from './interactions.js';
import { INK, hoverTint } from './palette.js';

const IDLE_MS = 2600;
const VISITED_TINT = 0.2;

/**
 * Scene Asia 3D yang dipasang ke elemen panel (bukan full window).
 * Wiring-nya menyalin boot3D explore.js, dengan tiga beda yang disengaja:
 * wheel tidak pernah di-capture (halaman landing tetap scroll),
 * render loop berhenti saat panel di luar viewport, dan label/tint diset lokal.
 */
export async function mountPanelMap(
  stage,
  { visited = [], today = null, onSelect, interactive = true } = {},
) {
  const geojson = (await import('@/data/asia-countries.geo.json')).default;
  const projection = createProjection();
  const built = buildCountries(geojson, projection);
  const list = built.countries;

  // panel tidak pakai intro rise: negara sudah "muncul" sejak frame pertama.
  // ponytail: no rise intro; tambah tween di sini kalau panel pernah di atas fold.
  for (const country of list) country.riseK = 1;

  const reduceMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const size = () => ({
    w: Math.max(1, stage.clientWidth),
    h: Math.max(1, stage.clientHeight),
  });

  const labelsEl = document.createElement('div');
  labelsEl.className = 'panel-map__labels';
  labelsEl.setAttribute('aria-hidden', 'true');
  labelsEl.style.cssText =
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:1;';

  const previousPosition = stage.style.position;
  if (getComputedStyle(stage).position === 'static') stage.style.position = 'relative';

  const env = createScene(stage, labelsEl, { size });
  const canvas = env.renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.cursor = interactive ? 'grab' : 'default';
  stage.appendChild(labelsEl); // setelah canvas, supaya label menimpa peta

  env.scene.add(built.group);
  attachLabels(list);

  const controls = createControls(env.camera, canvas, built.world);
  // kontrak panel: wheel harus men-scroll halaman, jadi zoom dimatikan total.
  // onMouseWheel early-return sebelum preventDefault saat enableZoom === false.
  controls.enableZoom = false;
  controls.enableRotate = interactive;
  // ponytail: gesture sentuh vertikal dipakai scroll halaman; zoom 2 jari memang mati.
  canvas.style.touchAction = 'pan-y';

  const rig = new CameraRig(env.camera, controls);
  rig.place(OVERVIEW);

  let hover = null;
  let destroyed = false;
  let running = false;
  let frameLast = 0;
  let idleTimer = 0;

  const pinned = new Set(today ? [today] : []);
  const originalColors = new Map();

  function syncLabel(country) {
    if (!country?.labelEl) return;
    // panel-map.css memakai class (explore.css tidak ikut di-load di landing)
    country.labelEl.classList.toggle('is-visible', country === hover || pinned.has(country.code));
  }

  for (const country of list) {
    originalColors.set(country.code, country.baseColor.clone());
    if (!country.labelEl) continue;
    country.labelEl.style.pointerEvents = 'none';
    country.labelEl.style.transition = 'opacity 0.15s ease';
    syncLabel(country);
  }

  function setVisited(codes) {
    const next = new Set(Array.isArray(codes) ? codes : []);
    for (const country of list) {
      const on = next.has(country.code);
      if (country.visited === on) continue;
      country.visited = on;
      country.baseColor.copy(originalColors.get(country.code)).lerp(INK, on ? VISITED_TINT : 0);
      country.hoverColor = hoverTint(country.baseColor);
    }
  }
  setVisited(visited);

  function handleHover(country) {
    if (hover === country) return;
    const previous = hover;
    hover = country;
    syncLabel(previous);
    syncLabel(country);
    if (interactive) canvas.style.cursor = country ? 'pointer' : 'grab';
  }

  const interaction = interactive
    ? createInteraction({
        canvas,
        camera: env.camera,
        meshes: list.map((country) => country.mesh),
        isReady: () => !destroyed,
        isBusy: () => false,
        onHoverChange: handleHover,
        onCountryPick: (country) => onSelect?.(country.code),
        onBackgroundPick: () => {},
      })
    : null;

  // auto-rotate hanya saat idle: berhenti ketika drag, lanjut setelah jeda.
  function armIdle() {
    clearTimeout(idleTimer);
    controls.autoRotate = false;
    idleTimer = setTimeout(() => {
      if (!destroyed && !reduceMotion) controls.autoRotate = true;
    }, IDLE_MS);
  }

  if (!reduceMotion) {
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45; // drift pelan, bukan orbit penuh
    controls.addEventListener('start', () => {
      controls.autoRotate = false;
      clearTimeout(idleTimer);
    });
    controls.addEventListener('end', armIdle);
  }

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - frameLast) / 1000);
    frameLast = now;

    clampControlsTarget(controls);
    controls.update(dt);
    animateCountries(list, dt, hover, null);
    if (!reduceMotion) env.update(dt, now / 1000);
    interaction?.update(now);
    env.render();
  }

  function start() {
    if (running || destroyed) return;
    running = true;
    frameLast = performance.now();
    env.renderer.setAnimationLoop(frame);
  }

  function stop() {
    if (!running) return;
    running = false;
    env.renderer.setAnimationLoop(null);
  }

  function resize() {
    if (destroyed) return;
    env.resize();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);

  // render loop berhenti saat panel tidak terlihat, lanjut saat masuk viewport.
  const visibility = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) start();
      else stop();
    },
    { threshold: 0 },
  );
  visibility.observe(stage);

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    clearTimeout(idleTimer);
    stop();
    resizeObserver.disconnect();
    visibility.disconnect();
    controls.dispose();
    env.scene.traverse((node) => {
      if (node.geometry) node.geometry.dispose();
      if (node.material) {
        const materials = Array.isArray(node.material) ? node.material : [node.material];
        for (const material of materials) {
          if (material.map) material.map.dispose();
          material.dispose();
        }
      }
    });
    env.renderer.setAnimationLoop(null);
    env.renderer.dispose();
    canvas.remove();
    labelsEl.remove();
    if (previousPosition === '' && stage.style.position === 'relative') stage.style.position = '';
  }

  start();

  return { setVisited, resize, destroy };
}
