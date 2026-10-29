import {
  AdditiveBlending,
  BufferGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
  Vector3,
} from 'three';
import '@/styles/panel-map.css';
import { createProjection } from './projection.js';
import { buildCountries, animateCountries } from './countries.js';
import { createScene } from './environment.js';
import { attachLabels } from './labels.js';
import { createControls, clampControlsTarget } from './controls.js';
import { CameraRig, OVERVIEW, getOverview, updateTweens } from './camera-rig.js';
import { createInteraction } from './interactions.js';
import { INK, hoverTint } from './palette.js';

const IDLE_MS = 2600;
const VISITED_TINT = 0.2;
/** Fly-to saat pilih negara: mendekat ~560ms, sepadan Beat 1 lama. */
const FLY_MS = 560;
/** Hover: rig bergeser kecil ke arah negara, tanpa mengubah orientasi. */
const HOVER_PAN = 0.1;
const HOVER_PAN_MAX = 7;

/**
 * Scene Asia 3D yang dipasang ke elemen panel (bukan full window).
 * Wiring-nya menyalin boot3D explore.js, dengan tiga beda yang disengaja:
 * wheel tidak pernah di-capture (halaman landing tetap scroll),
 * render loop berhenti saat panel di luar viewport, dan label/tint diset lokal.
 */
export async function mountPanelMap(
  stage,
  { visited = [], today = null, onSelect, onHover, interactive = true } = {},
) {
  const geojson = (await import('@/data/asia-countries.geo.json')).default;
  const projection = createProjection();
  const built = buildCountries(geojson, projection);
  const list = built.countries;

  // panel tidak pakai intro rise: negara sudah "muncul" sejak frame pertama.
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
  // A11y: canvas jadi landmark berlabel; kontrol keyboard nyata ada di daftar negara.
  canvas.setAttribute('role', 'img');
  canvas.setAttribute(
    'aria-label',
    'Peta Asia 3D berisi 48 negara. Tekan Tab ke daftar negara untuk memilih lewat keyboard.',
  );
  canvas.tabIndex = 0;
  stage.appendChild(labelsEl); // setelah canvas, supaya label menimpa peta

  env.scene.add(built.group);
  attachLabels(list);

  const controls = createControls(env.camera, canvas, built.world);
  // kontrak panel: wheel harus men-scroll halaman, jadi zoom dimatikan total.
  controls.enableZoom = false;
  controls.enableRotate = interactive;
  // gesture sentuh vertikal dipakai scroll halaman; zoom 2 jari memang mati.
  canvas.style.touchAction = 'pan-y';

  const rig = new CameraRig(env.camera, controls);
  rig.place(getOverview(env.camera.aspect));

  let hover = null;
  let destroyed = false;
  let running = false;
  let frameLast = 0;
  let idleTimer = 0;
  let flying = false;
  let currentFocusCode = null;
  let lastFocusCountry = null;
  let paused = false; // dialog terbuka: drift berhenti

  const arcGroup = new Group();
  arcGroup.name = 'transit-arcs';
  env.scene.add(arcGroup);

  let activeArc = null;

  function triggerFlightArc(originCountry, destCountry) {
    if (!originCountry || !destCountry || originCountry === destCountry || reduceMotion) return;
    if (activeArc) {
      activeArc.dispose();
      activeArc = null;
    }
    if (activeBeacon) {
      activeBeacon.dispose();
      activeBeacon = null;
    }

    const p0 = originCountry.center.clone();
    p0.y = 0.22;
    const p1 = destCountry.center.clone();
    p1.y = 0.22;
    const d = p0.distanceTo(p1);
    if (d < 1.5) return;

    const mid = p0.clone().lerp(p1, 0.5);
    mid.y = Math.min(13, Math.max(2.8, d * 0.24));

    const curve = new CatmullRomCurve3([p0, mid, p1]);
    const pts = curve.getPoints(40);
    const arcGeo = new BufferGeometry().setFromPoints(pts);
    const arcMat = new LineBasicMaterial({
      color: 0xb84d37,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
    });
    const arcLine = new Line(arcGeo, arcMat);

    const tracerGeo = new SphereGeometry(0.35, 8, 8);
    const tracerMat = new MeshBasicMaterial({
      color: 0xfff6ea,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
    });
    const tracer = new Mesh(tracerGeo, tracerMat);
    tracer.position.copy(p0);

    const ringGeo = new RingGeometry(0.3, 0.5, 18);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new MeshBasicMaterial({
      color: 0xb84d37,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.copy(p1);
    ring.position.y = 0.23;

    arcGroup.add(arcLine, tracer, ring);

    let elapsed = 0;
    const totalDuration = 2.4;

    activeArc = {
      update(dt) {
        elapsed += dt;
        const progress = Math.min(1, elapsed / 1.4);
        if (progress < 1) {
          const pt = curve.getPoint(progress);
          tracer.position.copy(pt);
        } else {
          tracer.material.opacity = Math.max(0, 1 - (elapsed - 1.4) * 2.5);
          const ringProgress = Math.min(1, (elapsed - 1.1) / 1.1);
          if (ringProgress > 0) {
            const scale = 1 + ringProgress * 2.4;
            ring.scale.set(scale, scale, scale);
            ring.material.opacity = Math.max(0, (1 - ringProgress) * 0.75);
          }
        }

        if (elapsed > 1.5) {
          const fade = Math.max(0, 1 - (elapsed - 1.5) / 0.8);
          arcMat.opacity = fade * 0.75;
        }

        if (elapsed >= totalDuration) {
          this.dispose();
          activeArc = null;
        }
      },
      dispose() {
        arcGroup.remove(arcLine, tracer, ring);
        arcGeo.dispose();
        arcMat.dispose();
        tracerGeo.dispose();
        tracerMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
      },
    };
  }

  const beaconGroup = new Group();
  beaconGroup.name = 'country-beacons';
  env.scene.add(beaconGroup);

  let activeBeacon = null;

  function setCountryBeacon(country) {
    if (activeBeacon) {
      activeBeacon.dispose();
      activeBeacon = null;
    }
    if (!country || reduceMotion) return;

    const px = country.center.x;
    const pz = country.center.z;
    const py = 0.22;

    const pillarH = 7.5;
    const pillarGeo = new CylinderGeometry(0.04, 0.22, pillarH, 16, 1, true);
    pillarGeo.translate(0, pillarH / 2, 0);
    const pillarMat = new MeshBasicMaterial({
      color: 0xfff0dd,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const pillar = new Mesh(pillarGeo, pillarMat);
    pillar.position.set(px, py, pz);

    const ringGeo = new RingGeometry(0.35, 0.72, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new MeshBasicMaterial({
      color: 0xb84d37,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const ring = new Mesh(ringGeo, ringMat);
    ring.position.set(px, py + 0.02, pz);

    const coreGeo = new SphereGeometry(0.22, 10, 10);
    const coreMat = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const core = new Mesh(coreGeo, coreMat);
    core.position.set(px, py + 0.1, pz);

    beaconGroup.add(pillar, ring, core);

    let beaconAge = 0;
    activeBeacon = {
      update(dt) {
        beaconAge += dt;
        const fadeIn = Math.min(1, beaconAge / 0.5);
        const breath = 0.55 + 0.25 * Math.sin(beaconAge * 2.8);
        pillarMat.opacity = fadeIn * breath;
        ringMat.opacity = fadeIn * (0.65 + 0.2 * Math.cos(beaconAge * 2.8));
        coreMat.opacity = fadeIn * 0.95;

        const pulseScale = 1 + 0.15 * Math.sin(beaconAge * 2.8);
        ring.scale.set(pulseScale, pulseScale, pulseScale);
      },
      dispose() {
        beaconGroup.remove(pillar, ring, core);
        pillarGeo.dispose();
        pillarMat.dispose();
        ringGeo.dispose();
        ringMat.dispose();
        coreGeo.dispose();
        coreMat.dispose();
      },
    };
  }

  // Bias kamera saat hover: digeser bersama target supaya orientasi tetap.
  const hoverBias = new Vector3();
  const appliedBias = new Vector3();
  const biasTarget = new Vector3();

  const pinned = new Set(today ? [today] : []);
  const originalColors = new Map();

  function syncLabel(country) {
    if (!country?.labelEl) return;
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

  function setAutoRotate(on) {
    clearTimeout(idleTimer);
    controls.autoRotate = on && !reduceMotion && !paused && !flying && hover === null;
  }

  function handleHover(country) {
    if (hover === country) return;
    const previous = hover;
    hover = country;
    syncLabel(previous);
    syncLabel(country);
    onHover?.(country ? country.code : null);
    if (interactive) canvas.style.cursor = country ? 'pointer' : 'grab';
    if (country) {
      // hover mematikan drift; lanjut lagi lewat armIdle saat pointer keluar.
      clearTimeout(idleTimer);
      controls.autoRotate = false;
    } else if (!reduceMotion) {
      armIdle();
    }
  }

  // auto-rotate hanya saat idle: berhenti ketika drag, hover, atau dialog terbuka.
  function armIdle() {
    clearTimeout(idleTimer);
    controls.autoRotate = false;
    idleTimer = setTimeout(() => {
      if (!destroyed && !reduceMotion && !paused && !flying && hover === null) {
        controls.autoRotate = true;
      }
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

  function pickCountry(country) {
    if (currentFocusCode === country.code) return;
    if (reduceMotion) {
      window.setTimeout(() => onSelect?.(country.code), 0);
      return;
    }
    if (lastFocusCountry && lastFocusCountry !== country) {
      triggerFlightArc(lastFocusCountry, country);
    }
    setCountryBeacon(country);
    lastFocusCountry = country;
    currentFocusCode = country.code;
    flying = true;
    controls.autoRotate = false;
    clearTimeout(idleTimer);
    onSelect?.(country.code);
    rig.focusOn(country, {
      duration: 0.85,
      onComplete: () => {
        flying = false;
      },
    });
  }

  const interaction = interactive
    ? createInteraction({
        canvas,
        camera: env.camera,
        meshes: list.flatMap((c) => (c.proxyMesh ? [c.mesh, c.proxyMesh] : [c.mesh])),
        isReady: () => !destroyed,
        isBusy: () => rig.moving,
        onHoverChange: handleHover,
        onCountryPick: pickCountry,
        onBackgroundPick: () => {},
      })
    : null;

  // Smart Zoom handler: Ctrl/Cmd + Wheel zooms 3D map without hijacking regular page scroll
  const onWheel = (e) => {
    if (!interactive) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const step = e.deltaY < 0 ? 1 : -1;
      rig.zoom(step, { duration: 0.22 });
    } else {
      // User is scrolling normally: allow page scroll and trigger hint event
      stage.dispatchEvent(new CustomEvent('asiakin:map-scroll-hint', { bubbles: true }));
    }
  };
  canvas.addEventListener('wheel', onWheel, { passive: false });

  function applyHoverBias() {
    // Kamera dibuat tenang dan kokoh saat hover (tanpa offset geser)
    // agar bidikan negara mikro tidak mengalami osilasi/jitter.
  }

  function measureInk() {
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    env.scene.updateMatrixWorld(true);
    env.camera.updateMatrixWorld();
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    const corner = new Vector3();
    for (const c of list) {
      const geometry = c.mesh.geometry;
      if (!geometry.boundingBox) geometry.computeBoundingBox();
      const box = geometry.boundingBox;
      if (!box) continue;
      for (let i = 0; i < 8; i += 1) {
        corner.set(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        );
        corner.applyMatrix4(c.mesh.matrixWorld).project(env.camera);
        if (corner.x < minX) minX = corner.x;
        if (corner.x > maxX) maxX = corner.x;
        if (corner.y < minY) minY = corner.y;
        if (corner.y > maxY) maxY = corner.y;
      }
    }
    if (maxX < minX) return null;
    const widthPx = ((maxX - minX) / 2) * rect.width;
    const heightPx = ((maxY - minY) / 2) * rect.height;
    const viewportWidth = window.innerWidth;
    return {
      left: rect.left + (minX * 0.5 + 0.5) * rect.width,
      right: rect.left + (maxX * 0.5 + 0.5) * rect.width,
      top: rect.top + (-maxY * 0.5 + 0.5) * rect.height,
      bottom: rect.top + (-minY * 0.5 + 0.5) * rect.height,
      widthPx,
      heightPx,
      viewportWidth,
      widthVw: (widthPx / viewportWidth) * 100,
    };
  }

  function projected(code) {
    const c = list.find((item) => item.code === code);
    if (!c) return null;
    env.scene.updateMatrixWorld(true);
    env.camera.updateMatrixWorld();
    const point = new Vector3(c.center.x, c.group.position.y + 0.3, c.center.z).project(
      env.camera,
    );
    const rect = stage.getBoundingClientRect();
    return {
      x: rect.left + (point.x * 0.5 + 0.5) * rect.width,
      y: rect.top + (-point.y * 0.5 + 0.5) * rect.height,
    };
  }

  function setPaused(value) {
    paused = Boolean(value);
    if (paused) {
      clearTimeout(idleTimer);
      controls.autoRotate = false;
    } else if (!reduceMotion) {
      armIdle();
    }
  }

  const debug = {
    ready: false,
    countryCount: list.length,
    measureInk,
    projected,
    setPaused,
    setAutoRotate,
    camera: env.camera,
    controls,
    rig,
  };
  if (import.meta.env.DEV) {
    window.__asiakin_map48 = debug;
  }

  function frame() {
    const now = performance.now();
    const dt = Math.min(0.05, (now - frameLast) / 1000);
    frameLast = now;

    applyHoverBias(dt);
    clampControlsTarget(controls);
    controls.update(dt);
    animateCountries(list, dt, hover, null);
    if (activeArc) activeArc.update(dt);
    if (activeBeacon) activeBeacon.update(dt);
    if (!reduceMotion) env.update(dt, now / 1000);
    updateTweens(dt);
    interaction?.update(now);
    env.render();

    if (!debug.ready) {
      debug.ready = true;
      window.dispatchEvent(new CustomEvent('asiakin:scene-ready'));
    }
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
    const ov = getOverview(env.camera.aspect);
    if (!rig.moving && hover === null && controls.target.distanceTo(ov.target) < 1) {
      rig.place(ov);
    }
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
    if (activeArc) {
      activeArc.dispose();
      activeArc = null;
    }
    if (activeBeacon) {
      activeBeacon.dispose();
      activeBeacon = null;
    }
    clearTimeout(idleTimer);
    stop();
    resizeObserver.disconnect();
    visibility.disconnect();
    canvas.removeEventListener('wheel', onWheel);
    interaction?.dispose();
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
    if (import.meta.env.DEV && window.__asiakin_map48 === debug) {
      delete window.__asiakin_map48;
    }
  }

  start();

  return {
    setVisited,
    resize,
    destroy,
    overview: () => {
      flying = false;
      currentFocusCode = null;
      lastFocusCountry = null;
      if (activeArc) {
        activeArc.dispose();
        activeArc = null;
      }
      if (activeBeacon) {
        activeBeacon.dispose();
        activeBeacon = null;
      }
      rig.overview();
    },
    focus: (code) => {
      if (currentFocusCode === code) return;
      currentFocusCode = code;
      const c = list.find((item) => item.code === code);
      if (!c || reduceMotion) return;
      if (lastFocusCountry && lastFocusCountry !== c) {
        triggerFlightArc(lastFocusCountry, c);
      }
      setCountryBeacon(c);
      lastFocusCountry = c;
      flying = true;
      controls.autoRotate = false;
      clearTimeout(idleTimer);
      rig.focusOn(c, {
        duration: 0.85,
        onComplete: () => {
          flying = false;
        },
      });
    },
    zoomIn: () => rig.zoom(1, { duration: 0.38 }),
    zoomOut: () => rig.zoom(-1, { duration: 0.38 }),
    resetNorth: () => rig.resetNorth(),
    getHeading: () => rig.getHeading(),
    flyToCoord: (x, z, dist) => rig.flyToCoord(x, z, dist),
    setPaused,
    setAutoRotate,
  };
}