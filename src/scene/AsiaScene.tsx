/*
 * Scene 3D benua Asia (Varian B — slab relief & K7/K8/K9).
 *
 * Modul ini adalah satu-satunya tempat yang mengimpor `three`, dan pemakai
 * wajib memuatnya lewat `React.lazy` supaya chunk 3D terpisah dari entry.
 * Tidak ada akses `document` saat modul dievaluasi — semua sentuhan DOM
 * terjadi di dalam effect, sehingga impor tetap aman di lingkungan tanpa WebGL.
 */

import { useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  AmbientLight,
  Box3,
  BufferGeometry,
  Color,
  ConeGeometry,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  HemisphereLight,
  InstancedMesh,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  Scene,
  ShadowMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import { countries as allCountries, getCountry } from '@/content/countries';
import { getRegion } from '@/content/regions';
import { getWebGLTier } from '@/lib/webgl';
import '@/styles/scene.css';

export interface CameraPose {
  azimuth: number; // rad, 0 = hero yaw
  distance: number; // world units, camera->target
  elevation: number; // rad above horizontal
  tx: number;
  ty: number;
  tz: number; // look-at target
}

export const HERO_POSE: CameraPose = {
  azimuth: 0,
  distance: 220,
  elevation: (52 * Math.PI) / 180,
  tx: 0,
  ty: 0,
  tz: 0,
};

export const INTRO = {
  durationMs: 2600,
  orbitRad: (120 * Math.PI) / 180,
  distanceFrom: 1.85,
  elevationFrom: (68 * Math.PI) / 180,
  targetLiftFrom: 0.06,
} as const;

/** Pure. Writes into `out` (zero allocation). Clamps progress to [0,1]. */
export function introPose(
  progress: number,
  hero: Readonly<CameraPose>,
  out: CameraPose,
): CameraPose {
  const p = Math.min(1, Math.max(0, progress));
  if (p >= 1) {
    out.azimuth = hero.azimuth;
    out.distance = hero.distance;
    out.elevation = hero.elevation;
    out.tx = hero.tx;
    out.ty = hero.ty;
    out.tz = hero.tz;
    return out;
  }
  // easeInOutCubic
  const t = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
  out.azimuth = hero.azimuth + (1 - t) * INTRO.orbitRad;
  out.distance = hero.distance * (1 + (INTRO.distanceFrom - 1) * (1 - t));
  out.elevation = hero.elevation + (1 - t) * (INTRO.elevationFrom - hero.elevation);
  out.tx = hero.tx;
  out.ty = hero.ty + (1 - t) * (INTRO.targetLiftFrom * hero.distance);
  out.tz = hero.tz;
  return out;
}

export interface CountryHitObj {
  id: string;
  anchor: { x: number; y: number };
  side: 'left' | 'right';
}
export type CountryHit = string & CountryHitObj;

export function createCountryHit(
  id: string,
  anchor: { x: number; y: number },
  side: 'left' | 'right',
): CountryHit {
  const hit = Object.assign(new String(id), { id, anchor, side });
  return hit as unknown as CountryHit;
}

export interface AsiaSceneProps {
  /** 0..1, dibaca di dalam loop rAF — bukan state React. */
  scrollProgressRef?: RefObject<number>;
  /**
   * 0..1 progress sorotan scene "Skala": count = round(p * 15), urutan
   * barat -> timur berdasarkan rank anchor.x. Dibaca per frame di rAF.
   */
  highlightProgressRef?: RefObject<number>;
  selectedId?: string | null;
  onHoverCountry?: (hit: CountryHit | string | null) => void;
  onCountryAnchor?: (
    id: string,
    anchor: { x: number; y: number },
    side: 'left' | 'right',
  ) => void;
  onSelectCountry?: (id: string) => void;
  onActivateCountry?: (id: string) => void;
  introEnabled?: boolean;
  idleSway?: boolean;
  /** WebGL gagal dibuat atau model tidak bisa dimuat. */
  onUnavailable?: () => void;
  /** Decorative scenes have no interaction, no hover labels. */
  decorative?: boolean;
  /** Kunci registry debug DEV (window.__asiakin_scenes). */
  debugKey?: string;
  /** Target tengah NDC-Y bbox siluet; 0 = tengah kanvas vertikal. */
  fitTargetNdcY?: number;
  className?: string;
}

export interface InkMeasurement {
  left: number;
  right: number;
  top: number;
  bottom: number;
  widthPx: number;
  heightPx: number;
  viewportWidth: number;
  widthVw: number;
  heightVh: number;
}

export interface AsiaSceneDebug {
  ready: boolean;
  debugKey?: string;
  countryCount: number;
  unmapped?: string[];
  diagnostics?: Record<string, number>;
  vertices?: Float32Array<ArrayBufferLike>;
  projected(id: string): { x: number; y: number } | null;
  measureInk?(): InkMeasurement;
  lit?(): string[];
  highlightCount?(): number;
  highlightProgress?(): number;
  pose(): CameraPose;
  intro(): {
    state: 'boot' | 'intro' | 'scroll' | 'reduced' | 'skipped' | 'done';
    progress: number;
    elapsedMs: number;
  };
  hovered(): string | null;
  panelAnchor(): {
    x: number;
    y: number;
    w: number;
    h: number;
    side: 'left' | 'right';
  } | null;
  stats(): {
    frames: number;
    picks: number;
    drawCalls: number;
    triangles: number;
    hoverEmits: number;
    maxFrameMs: number;
  };
  warnings?(): string[];
}

declare global {
  interface Window {
    __asiakin_scene?: AsiaSceneDebug;
    __asiakin_scenes?: Record<string, AsiaSceneDebug>;
  }
}

interface ManifestEntry {
  id: string;
  iso3: string;
  name: string;
  height: number;
}

interface CountryEntry {
  id: string;
  mesh: Mesh;
  material: MeshStandardMaterial;
  outlineMaterial: LineBasicMaterial;
  anchor: Vector3;
  lift: number;
  target: number;
  hoverAmt: number;
  hl: number;
  band: number;
}

const FOV = 38;
const ELEVATION_FROM_HORIZONTAL = 52;
const DPR_MAX = 1.5;

const HOVER_LIFT = 0.6;
const SELECT_LIFT = 1.4;
const LIFT_TAU = 0.11;
const GLOW_TAU = 0.12;

const FIT_INK_SPAN_X = 1.76;
const FIT_INK_SPAN_X_MOBILE = 1.79;
const FIT_INK_SPAN_Y = 1.86;
const FIT_INK_SAFETY = 1.04;

const HOVER_HYSTERESIS_MS = 130;
const MATERIAL_ROUGHNESS = 0.8;
const OUTLINE_OPACITY = 0.4;

function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

function isManifest(value: unknown): value is ManifestEntry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as ManifestEntry).id === 'string' &&
        typeof (entry as ManifestEntry).iso3 === 'string',
    )
  );
}

function disposeMaterial(
  material: MeshStandardMaterial | LineBasicMaterial,
): void {
  material.dispose();
}

function createOutlineGeometry(geometry: BufferGeometry): BufferGeometry {
  const edges = new EdgesGeometry(geometry, 24);
  const position = edges.getAttribute('position');
  const kept: number[] = [];
  for (let i = 0; i < position.count; i += 2) {
    const y1 = position.getY(i);
    const y2 = position.getY(i + 1);
    if (Math.abs(y1 - y2) > 0.05) {
      continue;
    }
    kept.push(
      position.getX(i),
      y1,
      position.getZ(i),
      position.getX(i + 1),
      y2,
      position.getZ(i + 1),
    );
  }
  edges.dispose();
  const outline = new BufferGeometry();
  outline.setAttribute('position', new Float32BufferAttribute(kept, 3));
  return outline;
}

function computeSilhouette(meshes: Mesh[], center: Vector3): Float32Array {
  const xs: number[] = [];
  const ys: number[] = [];
  const zs: number[] = [];
  const vertex = new Vector3();

  for (const mesh of meshes) {
    const position = mesh.geometry.getAttribute('position');
    if (!position) {
      continue;
    }
    for (let i = 0; i < position.count; i += 1) {
      vertex
        .fromBufferAttribute(position, i)
        .applyMatrix4(mesh.matrixWorld)
        .sub(center);
      xs.push(vertex.x);
      ys.push(vertex.y);
      zs.push(vertex.z);
    }
  }

  const count = xs.length;
  if (count < 3) {
    return new Float32Array(0);
  }

  const order: number[] = [];
  for (let i = 0; i < count; i += 1) {
    order.push(i);
  }
  order.sort((a, b) => xs[a]! - xs[b]! || zs[a]! - zs[b]!);

  const cross = (o: number, a: number, b: number): number =>
    (xs[a]! - xs[o]!) * (zs[b]! - zs[o]!) - (zs[a]! - zs[o]!) * (xs[b]! - xs[o]!);
  const lower: number[] = [];
  for (const index of order) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2]!, lower[lower.length - 1]!, index) <= 0
    ) {
      lower.pop();
    }
    lower.push(index);
  }
  const upper: number[] = [];
  for (let i = order.length - 1; i >= 0; i -= 1) {
    const index = order[i]!;
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2]!, upper[upper.length - 1]!, index) <= 0
    ) {
      upper.pop();
    }
    upper.push(index);
  }
  lower.pop();
  upper.pop();

  const hull = lower.concat(upper);
  const points = new Float32Array(hull.length * 3);
  for (let i = 0; i < hull.length; i += 1) {
    const index = hull[i]!;
    points[i * 3] = xs[index]!;
    points[i * 3 + 1] = ys[index]!;
    points[i * 3 + 2] = zs[index]!;
  }
  return points;
}

function disposeObject(root: Object3D): void {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) {
      return;
    }
    object.geometry.dispose();
    const material = object.material;
    if (Array.isArray(material)) {
      for (const item of material) {
        item.dispose();
      }
    } else {
      material.dispose();
    }
  });
}

/**
 * K8: Buat lempeng tanah bergelombang (PlaneGeometry 72x48 segmen = 6.912 tris)
 * dengan pergeseran Y deterministik.
 */
function createTerrainPlate(
  width: number,
  height: number,
  center: Vector3,
  minCountryBottomY: number,
  terrainColors: Color[],
): Mesh {
  const geometry = new PlaneGeometry(width, height, 72, 48);
  geometry.rotateX(-Math.PI / 2);
  const position = geometry.getAttribute('position');
  const colors: number[] = [];

  const minY = -0.45;
  const maxY = Math.min(0.25, minCountryBottomY - 0.15);
  const rangeY = Math.max(0.1, maxY - minY);

  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    const z = position.getZ(i);

    const nx = (x / width) * 5.0;
    const nz = (z / height) * 4.0;
    const n1 = Math.sin(nx * 1.8 + nz * 1.2) * 0.45;
    const n2 = Math.cos(nx * 3.7 - nz * 2.4) * 0.25;
    const n3 = Math.sin(nx * 7.1 + nz * 6.3) * 0.15;
    const n4 = Math.cos(nx * 12.5 - nz * 9.8) * 0.08;
    const rawH = (n1 + n2 + n3 + n4 + 0.93) / 1.86;
    const clampedH = Math.max(0, Math.min(1, rawH));

    const y = minY + clampedH * rangeY;
    position.setY(i, y);

    const colorIndex = clampedH * (terrainColors.length - 1);
    const c0 = terrainColors[Math.floor(colorIndex)] || terrainColors[0]!;
    const c1 =
      terrainColors[Math.ceil(colorIndex)] ||
      terrainColors[terrainColors.length - 1]!;
    const t = colorIndex - Math.floor(colorIndex);
    colors.push(
      c0.r + (c1.r - c0.r) * t,
      c0.g + (c1.g - c0.g) * t,
      c0.b + (c1.b - c0.b) * t,
    );
  }

  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.05,
    flatShading: true,
  });

  const mesh = new Mesh(geometry, material);
  mesh.position.set(center.x, 0, center.z);
  mesh.receiveShadow = true;
  mesh.castShadow = false;
  mesh.renderOrder = 0;
  return mesh;
}

/**
 * K8: Buat 180 low-poly ridge prisms (32 tris per prisma = 5.760 tris).
 * Total terrain = 6.912 + 5.760 = 12.672 tris (2 draw calls).
 */
function createTerrainRidges(
  plateWidth: number,
  plateHeight: number,
  center: Vector3,
  minCountryBottomY: number,
  terrainColors: Color[],
): InstancedMesh {
  const ridgeCount = 180;
  const geom = new ConeGeometry(1, 1, 16, 1, false); // Exactly 32 tris
  const pos = geom.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    pos.setZ(i, pos.getZ(i) * 2.2);
    if (pos.getY(i) > 0.4) {
      pos.setX(i, pos.getX(i) + 0.15);
    }
  }
  geom.computeVertexNormals();

  const mat = new MeshStandardMaterial({
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true,
  });

  const instanced = new InstancedMesh(geom, mat, ridgeCount);
  instanced.receiveShadow = true;
  instanced.castShadow = false;
  instanced.renderOrder = 0;

  const dummy = new Object3D();
  const color = new Color();

  let seed = 42;
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };

  const maxY = Math.min(0.25, minCountryBottomY - 0.15);
  const minY = -0.45;

  for (let i = 0; i < ridgeCount; i++) {
    const u = (random() - 0.5) * 0.9 * plateWidth;
    const v = (random() - 0.5) * 0.85 * plateHeight;

    const baseRadius = 2.5 + random() * 4.5;
    const ridgeLength = 5.0 + random() * 12.0;
    const height = 0.8 + random() * 2.2;
    const rotY = random() * Math.PI * 2;
    const posY = minY + (maxY - minY) * (0.1 + random() * 0.6);

    dummy.position.set(center.x + u, posY, center.z + v);
    dummy.scale.set(baseRadius, height, ridgeLength / 2.2);
    dummy.rotation.set(0, rotY, (random() - 0.5) * 0.15);
    dummy.updateMatrix();
    instanced.setMatrixAt(i, dummy.matrix);

    const cIdx = Math.floor(random() * terrainColors.length);
    color.copy(terrainColors[cIdx] || terrainColors[0]!);
    instanced.setColorAt(i, color);
  }

  if (instanced.instanceColor) {
    instanced.instanceColor.needsUpdate = true;
  }
  instanced.instanceMatrix.needsUpdate = true;
  return instanced;
}

export default function AsiaScene({
  scrollProgressRef,
  highlightProgressRef,
  selectedId = null,
  onHoverCountry,
  onCountryAnchor,
  onSelectCountry,
  onActivateCountry,
  introEnabled = true,
  idleSway = true,
  onUnavailable,
  decorative = false,
  debugKey,
  fitTargetNdcY = 0,
  className,
}: AsiaSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const panelRef = useRef<HTMLDivElement>(null);
  const labelIdRef = useRef<HTMLDivElement>(null);
  const labelNativeRef = useRef<HTMLDivElement>(null);
  const labelRegionRef = useRef<HTMLDivElement>(null);
  const panelLangRef = useRef<HTMLSpanElement>(null);
  const panelScriptRef = useRef<HTMLSpanElement>(null);
  const panelDepthRef = useRef<HTMLSpanElement>(null);

  const [keyboardActiveIndex, setKeyboardActiveIndex] = useState(0);
  const keyboardButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const callbacksRef = useRef({
    onHoverCountry,
    onCountryAnchor,
    onSelectCountry,
    onActivateCountry,
    onUnavailable,
  });
  const selectedRef = useRef<string | null>(selectedId ?? null);

  useEffect(() => {
    callbacksRef.current = {
      onHoverCountry,
      onCountryAnchor,
      onSelectCountry,
      onActivateCountry,
      onUnavailable,
    };
  });

  useEffect(() => {
    selectedRef.current = selectedId ?? null;
  }, [selectedId]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    if (getWebGLTier() === 'none') {
      callbacksRef.current.onUnavailable?.();
      return;
    }

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      callbacksRef.current.onUnavailable?.();
      return;
    }

    renderer.outputColorSpace = SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAX));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;

    const scene = new Scene();
    const camera = new PerspectiveCamera(FOV, 1, 1, 20_000);
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const styles = window.getComputedStyle(container);
    const inkColor = new Color(
      styles.getPropertyValue('--ink').trim() || '#1a1f24',
    );
    const accentColor = new Color(
      styles.getPropertyValue('--accent').trim() || '#176b68',
    );
    const countryColor = (id: string): Color => {
      const value = styles.getPropertyValue(`--country-${id}`).trim();
      return new Color(value || '#b9b4aa');
    };

    const terrainColors = [
      new Color(styles.getPropertyValue('--terrain-100').trim() || '#eadfc9'),
      new Color(styles.getPropertyValue('--terrain-200').trim() || '#ddc9a6'),
      new Color(styles.getPropertyValue('--terrain-300').trim() || '#c9a97a'),
      new Color(styles.getPropertyValue('--terrain-400').trim() || '#a8814f'),
      new Color(styles.getPropertyValue('--terrain-500').trim() || '#8f6b3f'),
      new Color(styles.getPropertyValue('--terrain-600').trim() || '#6b4f2e'),
    ];

    const ambient = new AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    const hemi = new HemisphereLight(0xfff4e8, 0x8b9dc3, 0.45);
    scene.add(hemi);

    // K8: Main sun NW (azimut 315°, elevasi 45°)
    const sun = new DirectionalLight(0xfff8f0, 1.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -160;
    sun.shadow.camera.right = 160;
    sun.shadow.camera.top = 160;
    sun.shadow.camera.bottom = -160;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 900;
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.015;
    scene.add(sun);
    scene.add(sun.target);

    // Fill light from SE
    const fill = new DirectionalLight(0xd4e4f7, 0.35);
    scene.add(fill);

    const groundGeometry = new PlaneGeometry(520, 520);
    const groundMaterial = new ShadowMaterial({ opacity: 0.06 });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.46;
    ground.receiveShadow = true;
    scene.add(ground);

    const groundLike: Object3D[] = [ground];
    const countries: CountryEntry[] = [];
    const countriesById = new Map<string, CountryEntry>();
    const pickTargets: Mesh[] = [];
    const contextMeshes: Mesh[] = [];
    const unmappedNames: string[] = [];
    const tempVertices: number[] = [];

    let disposed = false;
    let loaded = false;
    let hoveredId: string | null = null;
    let candidateId: string | null = null;
    let candidateAt = 0;
    let pointerMoved = false;
    let pointerClientX = 0;
    let pointerClientY = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownValid = false;

    // Cache container rect untuk menghindari getBoundingClientRect berulang
    let cachedContainerRect = container.getBoundingClientRect();
    let containerW = Math.max(1, cachedContainerRect.width);
    let containerH = Math.max(1, cachedContainerRect.height);

    const updateCachedRect = () => {
      if (disposed) return;
      cachedContainerRect = container.getBoundingClientRect();
      containerW = Math.max(1, cachedContainerRect.width);
      containerH = Math.max(1, cachedContainerRect.height);
    };

    const panelEl = decorative ? null : (panelRef.current ?? null);

    const center = new Vector3();
    const box = new Box3();

    let silhouette: Float32Array = new Float32Array(0);
    let silhouetteCount = 0;
    const anchorWorld = new Vector3();
    const projectedWorld = new Vector3();
    const fitTarget = new Vector3();
    const projVec = new Vector3();

    // K7 camera ownership & state
    type CameraOwner = 'boot' | 'intro' | 'scroll';
    let owner: CameraOwner = 'boot';
    let introStartedAt = 0;
    let introFinishedAt = 0;
    const instanceHeroPose: CameraPose = { ...HERO_POSE };
    const currentPose: CameraPose = { ...HERO_POSE };

    // Stats tracking
    let frameCount = 0;
    let pickCount = 0;
    let hoverEmitCount = 0;
    let maxFrameMs = 0;
    let lastAnchorEmitTime = 0;
    let lastAnchorX = -9999;
    let lastAnchorY = -9999;

    container.dataset.intro = 'boot';

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        owner = 'scroll';
        container.dataset.intro = 'reduced';
        for (const country of countries) {
          country.lift = country.target;
          country.mesh.position.y = country.target;
        }
      }
    };
    motionQuery.addEventListener('change', onMotionChange);

    const resize = () => {
      updateCachedRect();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAX));
      renderer.setSize(containerW, containerH, false);
      camera.aspect = containerW / containerH;
      camera.updateProjectionMatrix();

      if (loaded && owner !== 'intro') {
        const elevation = (ELEVATION_FROM_HORIZONTAL * Math.PI) / 180;
        fitCamera(0, elevation, 0, 1.0);
        instanceHeroPose.azimuth = 0;
        instanceHeroPose.distance = lastDistance;
        instanceHeroPose.elevation = elevation;
        instanceHeroPose.tx = fitTarget.x;
        instanceHeroPose.ty = fitTarget.y;
        instanceHeroPose.tz = fitTarget.z;

        if (!debugKey || debugKey === 'hero') {
          HERO_POSE.azimuth = 0;
          HERO_POSE.distance = lastDistance;
          HERO_POSE.elevation = elevation;
          HERO_POSE.tx = fitTarget.x;
          HERO_POSE.ty = fitTarget.y;
          HERO_POSE.tz = fitTarget.z;
        }
      }
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const placeCameraFromPose = (pose: CameraPose) => {
      const sx = Math.sin(pose.azimuth);
      const cx = Math.cos(pose.azimuth);
      const sy = Math.sin(pose.elevation);
      const cy = Math.cos(pose.elevation);
      camera.position.set(
        pose.tx + sx * cy * pose.distance,
        pose.ty + sy * pose.distance,
        pose.tz + cx * cy * pose.distance,
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(pose.tx, pose.ty, pose.tz);
      camera.updateMatrixWorld();
    };

    const projectCountryAnchor = (
      country: CountryEntry,
    ): { screenX: number; screenY: number; side: 'left' | 'right' } | null => {
      camera.updateMatrixWorld();
      anchorWorld.set(
        country.anchor.x,
        country.anchor.y + country.mesh.position.y,
        country.anchor.z,
      );
      projVec.copy(anchorWorld).project(camera);
      if (projVec.z > 1) {
        return null;
      }
      const rect = cachedContainerRect;
      const screenX = rect.left + (projVec.x * 0.5 + 0.5) * rect.width;
      const screenY = rect.top + (-projVec.y * 0.5 + 0.5) * rect.height;
      const containerRelX = (projVec.x * 0.5 + 0.5) * rect.width;
      const side: 'left' | 'right' =
        containerRelX > rect.width / 2 ? 'left' : 'right';
      return { screenX, screenY, side };
    };

    const setHovered = (
      id: string | null,
      clientX = 0,
      clientY = 0,
    ) => {
      if (id === hoveredId) {
        return;
      }
      hoveredId = id;
      hoverEmitCount++;

      if (!panelEl) {
        return;
      }
      if (id) {
        const country = getCountry(id);
        const region = getRegion(id);
        if (!country || !region) {
          return;
        }
        if (labelIdRef.current) {
          labelIdRef.current.textContent = country.nameId;
        }
        if (labelNativeRef.current) {
          labelNativeRef.current.textContent = country.nameLocal;
        }
        if (labelRegionRef.current) {
          labelRegionRef.current.textContent = region;
        }
        if (panelLangRef.current) {
          panelLangRef.current.textContent = country.language.nameId;
        }
        if (panelScriptRef.current) {
          panelScriptRef.current.textContent = country.language.script;
        }
        if (panelDepthRef.current) {
          panelDepthRef.current.textContent = country.depth;
        }

        const countryEntry = countriesById.get(id);
        let projSide: 'left' | 'right' = 'left';
        let anchorCoords = {
          x: Math.round(clientX - cachedContainerRect.left),
          y: Math.round(clientY - cachedContainerRect.top),
        };

        if (countryEntry) {
          const proj = projectCountryAnchor(countryEntry);
          if (proj) {
            projSide = proj.side;
            const relY = proj.screenY - cachedContainerRect.top;
            container.style.setProperty(
              '--panel-anchor-y',
              `${Math.round(relY)}px`,
            );
            anchorCoords = {
              x: Math.round(proj.screenX - cachedContainerRect.left),
              y: Math.round(relY),
            };
          }
        }

        container.dataset.panelSide = projSide;
        container.dataset.hovered = id;
        panelEl.dataset.side = projSide;
        panelEl.dataset.panelFor = id;
        panelEl.dataset.visible = 'true';

        const hit = createCountryHit(id, anchorCoords, projSide);
        callbacksRef.current.onHoverCountry?.(hit);
      } else {
        delete container.dataset.panelSide;
        container.dataset.hovered = '';
        delete panelEl.dataset.panelFor;
        panelEl.dataset.visible = 'false';
        callbacksRef.current.onHoverCountry?.(null);
      }
    };

    const pickAt = (clientX: number, clientY: number): string | null => {
      if (pickTargets.length === 0) {
        return null;
      }
      pickCount++;
      const rect = cachedContainerRect;
      pointer.set(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickTargets, false);
      const first = hits[0];
      if (!first) {
        return null;
      }
      const id = first.object.userData.countryId;
      return typeof id === 'string' ? id : null;
    };

    const triggerInterrupt = () => {
      if (owner === 'intro') {
        owner = 'scroll';
        container.dataset.intro = 'done';
        introFinishedAt = performance.now();
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!loaded || decorative) {
        return;
      }
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      pointerMoved = true;
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (decorative) return;
      if (event.pointerType !== 'mouse' && event.type !== 'pointercancel') {
        return;
      }
      pointerMoved = false;
      candidateId = null;
      setHovered(null);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (decorative) return;
      if (owner === 'intro') {
        triggerInterrupt();
        pointerDownValid = false;
        return;
      }
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      pointerDownValid = true;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!loaded || !pointerDownValid || decorative) {
        return;
      }
      pointerDownValid = false;
      const moved = Math.hypot(
        event.clientX - pointerDownX,
        event.clientY - pointerDownY,
      );
      if (moved > 12) {
        return;
      }

      let id = pickAt(event.clientX, event.clientY);

      // K9 touch: fallback 22px nearest-anchor untuk negara kecil (SG/TH)
      if (event.pointerType !== 'mouse') {
        if (!id) {
          let nearestId: string | null = null;
          let nearestDist = 22;
          for (const country of countries) {
            const proj = projectCountryAnchor(country);
            if (proj) {
              const d = Math.hypot(
                event.clientX - proj.screenX,
                event.clientY - proj.screenY,
              );
              if (d < nearestDist) {
                nearestDist = d;
                nearestId = country.id;
              }
            }
          }
          if (nearestId) {
            id = nearestId;
          }
        }

        // Tap 1 = hover & panel; Tap 2 negara sama = activate
        if (id) {
          if (hoveredId === id) {
            candidateId = null;
            callbacksRef.current.onActivateCountry?.(id);
            callbacksRef.current.onSelectCountry?.(id);
          } else {
            candidateId = id;
            candidateAt = 0;
            setHovered(id, event.clientX, event.clientY);
          }
        } else {
          candidateId = null;
          setHovered(null);
        }
        return;
      }

      if (id) {
        callbacksRef.current.onActivateCountry?.(id);
        callbacksRef.current.onSelectCountry?.(id);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ') {
        triggerInterrupt();
      }
    };

    window.addEventListener('scroll', updateCachedRect, { passive: true });
    window.addEventListener('wheel', triggerInterrupt, { passive: true });
    window.addEventListener('touchmove', triggerInterrupt, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    if (!decorative) {
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerLeave);
    }

    const debug: AsiaSceneDebug = {
      ready: false,
      debugKey,
      countryCount: 0,
      pose(): CameraPose {
        return {
          azimuth: currentPose.azimuth,
          distance: currentPose.distance,
          elevation: currentPose.elevation,
          tx: currentPose.tx,
          ty: currentPose.ty,
          tz: currentPose.tz,
        };
      },
      intro() {
        const elapsed =
          introStartedAt > 0 ? performance.now() - introStartedAt : 0;
        const progress =
          owner === 'intro'
            ? Math.min(1, Math.max(0, elapsed / INTRO.durationMs))
            : owner === 'scroll'
              ? 1
              : 0;
        const state = reducedMotion ? 'reduced' : owner;
        return {
          state,
          progress,
          elapsedMs: elapsed,
        };
      },
      hovered() {
        return hoveredId;
      },
      panelAnchor() {
        if (!hoveredId) return null;
        const country = countriesById.get(hoveredId);
        if (!country) return null;
        const proj = projectCountryAnchor(country);
        if (!proj) return null;
        const w = panelEl?.offsetWidth || 180;
        const h = panelEl?.offsetHeight || 120;
        return {
          x: Math.round(proj.screenX),
          y: Math.round(proj.screenY),
          w,
          h,
          side: proj.side,
        };
      },
      stats() {
        return {
          frames: frameCount,
          picks: pickCount,
          drawCalls: renderer.info.render.calls,
          triangles: renderer.info.render.triangles,
          hoverEmits: hoverEmitCount,
          maxFrameMs,
        };
      },
      warnings() {
        return [];
      },
      projected(id: string) {
        if (!debug.ready) {
          return null;
        }
        const country = countriesById.get(id);
        if (!country) {
          return null;
        }
        camera.updateMatrixWorld();
        anchorWorld.set(
          country.anchor.x,
          country.anchor.y + country.mesh.position.y,
          country.anchor.z,
        );
        const ndc = projectedWorld.copy(anchorWorld).project(camera);
        if (ndc.z > 1) {
          return null;
        }
        const rect = cachedContainerRect;
        return {
          x: rect.left + (ndc.x * 0.5 + 0.5) * rect.width,
          y: rect.top + (-ndc.y * 0.5 + 0.5) * rect.height,
        };
      },
      lit() {
        return countries
          .filter((country) => country.hl >= 0.5)
          .map((country) => country.id);
      },
      highlightCount() {
        return this.lit?.().length ?? 0;
      },
      highlightProgress() {
        if (!highlightProgressRef) {
          return 0;
        }
        return Math.min(1, Math.max(0, highlightProgressRef.current ?? 0));
      },
      measureInk() {
        if (!loaded) {
          return {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            widthPx: 0,
            heightPx: 0,
            viewportWidth: window.innerWidth,
            widthVw: 0,
            heightVh: 0,
          };
        }

        // Sembunyikan semua ground-like objects (ground plane + terrain relief)
        const prevVisibilities = groundLike.map((obj) => obj.visible);
        for (const obj of groundLike) {
          obj.visible = false;
        }

        // Jalankan render offscreen di HERO_POSE kanonik untuk pengukuran ink
        const savedPos = camera.position.clone();
        const savedQuat = camera.quaternion.clone();

        const elevation = (ELEVATION_FROM_HORIZONTAL * Math.PI) / 180;
        fitCamera(0, elevation, 0, 1.0);
        camera.updateMatrixWorld();
        renderer.render(scene, camera);

        // Pulihkan posisi kamera & ground-like visibility
        camera.position.copy(savedPos);
        camera.quaternion.copy(savedQuat);
        camera.updateMatrixWorld();

        groundLike.forEach((obj, idx) => {
          obj.visible = prevVisibilities[idx] ?? true;
        });

        const gl = renderer.getContext();
        const width = gl.drawingBufferWidth;
        const height = gl.drawingBufferHeight;
        const pixels = new Uint8Array(width * height * 4);
        gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

        let minX = width;
        let maxX = -1;
        let minY = height;
        let maxY = -1;

        for (let y = 0; y < height; y++) {
          const rowOffset = y * width * 4;
          for (let x = 0; x < width; x++) {
            const alpha = pixels[rowOffset + x * 4 + 3] ?? 0;
            if (alpha > 10) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        debug.diagnostics = {
          ...debug.diagnostics,
          inkMinPixelX: minX,
          inkMaxPixelX: maxX,
          inkMinPixelY: minY,
          inkMaxPixelY: maxY,
          drawingBufferWidth: width,
          drawingBufferHeight: height,
          inkTouchesLeft: minX <= 0 ? 1 : 0,
          inkTouchesRight: maxX >= width - 1 ? 1 : 0,
          inkTouchesTop: minY <= 0 ? 1 : 0,
          inkTouchesBottom: maxY >= height - 1 ? 1 : 0,
        };

        if (maxX < minX || maxY < minY) {
          return {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            widthPx: 0,
            heightPx: 0,
            viewportWidth: window.innerWidth,
            widthVw: 0,
            heightVh: 0,
          };
        }

        const rect = canvas.getBoundingClientRect();
        const cssLeft = rect.left + (minX / width) * rect.width;
        const cssRight = rect.left + ((maxX + 1) / width) * rect.width;
        const cssTop = rect.top + ((height - 1 - maxY) / height) * rect.height;
        const cssBottom = rect.top + ((height - minY) / height) * rect.height;

        const widthPx = cssRight - cssLeft;
        const heightPx = cssBottom - cssTop;
        const viewportWidth = window.innerWidth;
        const widthVw = (widthPx / viewportWidth) * 100;
        const viewportHeight = window.innerHeight;

        return {
          left: cssLeft,
          right: cssRight,
          top: cssTop,
          bottom: cssBottom,
          widthPx,
          heightPx,
          viewportWidth,
          widthVw,
          heightVh: (heightPx / viewportHeight) * 100,
        };
      },
    };

    if (import.meta.env.DEV) {
      if (debugKey) {
        const registry = (window.__asiakin_scenes ??= {});
        registry[debugKey] = debug;
        if (debugKey === 'hero' || !window.__asiakin_scene) {
          window.__asiakin_scene = debug;
        }
      } else if (decorative || !window.__asiakin_scene) {
        window.__asiakin_scene = debug;
      }
    }

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath(assetUrl('draco/'));

    const gltfLoader = new GLTFLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    const fitCamera = (
      azimuth: number,
      elevation: number,
      scroll: number,
      introZoom = 1.0,
    ) => {
      const aspect = camera.aspect;
      const tanHalf = Math.tan((FOV * Math.PI) / 360);
      const sx = Math.sin(azimuth);
      const cx = Math.cos(azimuth);
      const sy = Math.sin(elevation);
      const cy = Math.cos(elevation);
      const zoomFactor = (1 - scroll * 0.05) * introZoom;
      const spanXTarget =
        window.innerWidth <= 640 ? FIT_INK_SPAN_X_MOBILE : FIT_INK_SPAN_X;

      fitTarget.set(center.x, center.y, center.z);
      let distance = lastDistance > 50 ? lastDistance : 220;

      let finalScale = 1;
      let finalSpanX = 0;
      let finalSpanY = 0;

      const place = (dist: number) => {
        camera.position.set(
          fitTarget.x + sx * cy * dist,
          fitTarget.y + sy * dist,
          fitTarget.z + cx * cy * dist,
        );
        camera.up.set(0, 1, 0);
        camera.lookAt(fitTarget);
        camera.updateMatrixWorld();
      };

      for (let iter = 0; iter < 20; iter += 1) {
        place(distance * zoomFactor);

        let minR = Number.POSITIVE_INFINITY;
        let maxR = Number.NEGATIVE_INFINITY;
        let minU = Number.POSITIVE_INFINITY;
        let maxU = Number.NEGATIVE_INFINITY;
        for (let i = 0; i < silhouetteCount; i += 1) {
          projVec.set(
            silhouette[i * 3]! + center.x,
            silhouette[i * 3 + 1]! + center.y,
            silhouette[i * 3 + 2]! + center.z,
          );
          projVec.project(camera);
          if (projVec.z > 1) {
            continue;
          }
          if (projVec.x < minR) minR = projVec.x;
          if (projVec.x > maxR) maxR = projVec.x;
          if (projVec.y < minU) minU = projVec.y;
          if (projVec.y > maxU) maxU = projVec.y;
        }

        const spanX = maxR - minR;
        const spanY = maxU - minU;
        if (!Number.isFinite(spanX) || spanX <= 0) {
          break;
        }

        const midR = (minR + maxR) / 2;
        const midU = (minU + maxU) / 2;
        const scale = Math.max(
          (spanX * FIT_INK_SAFETY) / spanXTarget,
          (spanY * FIT_INK_SAFETY) / FIT_INK_SPAN_Y,
        );

        const converged =
          Math.abs(scale - 1) < 0.0015 &&
          Math.abs(midR) < 0.002 &&
          Math.abs(midU - fitTargetNdcY) < 0.002;

        distance *= scale;
        finalScale *= scale;
        finalSpanX = spanX;
        finalSpanY = spanY;

        if (converged) {
          break;
        }

        const elements = camera.matrixWorld.elements;
        const shiftRight = midR * distance * tanHalf * aspect;
        const shiftUp = (midU - fitTargetNdcY) * distance * tanHalf;
        fitTarget.x += elements[0]! * shiftRight + elements[4]! * shiftUp;
        fitTarget.y += elements[1]! * shiftRight + elements[5]! * shiftUp;
        fitTarget.z += elements[2]! * shiftRight + elements[6]! * shiftUp;
      }

      place(distance * zoomFactor);

      lastDistance = distance;
      lastFitScale = finalScale;
      lastSpanX = finalSpanX;
      lastSpanY = finalSpanY;
    };

    const applyState = () => {
      const anyHovered = hoveredId !== null;
      for (const country of countries) {
        const selected = selectedRef.current === country.id;
        const hoverAmt = reducedMotion
          ? hoveredId === country.id
            ? 1
            : 0
          : country.hoverAmt;
        const hl = reducedMotion ? (country.hl > 0 ? 1 : 0) : country.hl;

        if (selected) {
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.95;
          country.material.emissive.copy(accentColor);
          country.material.emissiveIntensity = 0.38;
        } else if (country.id === hoveredId) {
          // Negara aktif ter-hover: sorotan jelas
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.95;
          country.material.emissive.copy(accentColor);
          country.material.emissiveIntensity = 0.28;
        } else {
          // Negara lain: dim lembut jika ada negara lain aktif
          country.material.emissive.copy(country.material.color);
          country.material.emissiveIntensity =
            hoverAmt * 0.16 + hl * 0.3;
          if (hoverAmt > 0.03) {
            country.outlineMaterial.color.copy(accentColor);
            country.outlineMaterial.opacity =
              OUTLINE_OPACITY + hoverAmt * 0.15 + hl * 0.08;
          } else {
            country.outlineMaterial.color.copy(inkColor);
            country.outlineMaterial.opacity = anyHovered
              ? 0.25
              : OUTLINE_OPACITY + hl * 0.12 + (hl > 0.5 ? 0.1 : 0);
          }
        }
      }
    };

    let lastTime = 0;
    let azimuth = 0;
    let lastDistance = 0;
    let lastFitScale = 1;
    let lastSpanX = 0;
    let lastSpanY = 0;

    const tick = (time: number) => {
      frameCount++;
      const seconds = time / 1000;
      const delta = lastTime === 0 ? 0 : Math.min(seconds - lastTime, 0.1);
      lastTime = seconds;
      const frameMs = delta * 1000;
      if (frameMs > maxFrameMs) maxFrameMs = frameMs;

      // K7 camera ownership handling
      const isDocumentReady =
        typeof document !== 'undefined' &&
        document.documentElement.dataset.ready === 'true';

      if (owner === 'boot') {
        if (isDocumentReady) {
          if (reducedMotion) {
            owner = 'scroll';
            container.dataset.intro = 'reduced';
            introFinishedAt = time;
          } else if (introEnabled === false) {
            owner = 'scroll';
            container.dataset.intro = 'skipped';
            introFinishedAt = time;
          } else {
            owner = 'intro';
            introStartedAt = time;
            container.dataset.intro = 'intro';
          }
        } else {
          placeCameraFromPose(instanceHeroPose);
        }
      }

      if (owner === 'intro') {
        const scrollNow = Math.min(
          1,
          Math.max(0, scrollProgressRef?.current ?? 0),
        );
        if (scrollNow > 0.002) {
          owner = 'scroll';
          container.dataset.intro = 'done';
          introFinishedAt = time;
        } else {
          const elapsed = time - introStartedAt;
          const progress = Math.min(1, Math.max(0, elapsed / INTRO.durationMs));
          introPose(progress, instanceHeroPose, currentPose);
          placeCameraFromPose(currentPose);
          if (progress >= 1) {
            owner = 'scroll';
            container.dataset.intro = 'done';
            introFinishedAt = time;
          }
        }
      }

      if (owner === 'scroll') {
        const scroll = Math.min(
          1,
          Math.max(0, scrollProgressRef?.current ?? 0),
        );
        const MAX_IDLE_RAD = (1.5 * Math.PI) / 180;
        if (
          idleSway !== false &&
          !reducedMotion &&
          hoveredId === null &&
          selectedRef.current === null
        ) {
          const swayElapsed = Math.max(0, time - introFinishedAt);
          const ramp = Math.min(1, swayElapsed / 1200);
          azimuth =
            Math.sin((swayElapsed / 1000) * ((2 * Math.PI) / 8)) *
            MAX_IDLE_RAD *
            ramp;
        } else {
          azimuth = 0;
        }
        const elevation =
          ((ELEVATION_FROM_HORIZONTAL + scroll * 7) * Math.PI) / 180;
        fitCamera(azimuth, elevation, scroll, 1.0);
        currentPose.azimuth = azimuth;
        currentPose.distance = lastDistance;
        currentPose.elevation = elevation;
        currentPose.tx = fitTarget.x;
        currentPose.ty = fitTarget.y;
        currentPose.tz = fitTarget.z;
      }

      // K9 Hover raycasting & hysteresis (maksimal 1x per frame)
      if (!decorative && loaded) {
        if (pointerMoved) {
          pointerMoved = false;
          const id = pickAt(pointerClientX, pointerClientY);
          if (id !== candidateId) {
            candidateId = id;
            candidateAt = time;
          }
        }
        if (
          candidateId !== hoveredId &&
          time - candidateAt >= HOVER_HYSTERESIS_MS
        ) {
          setHovered(candidateId, pointerClientX, pointerClientY);
        }
      }

      // Emisi onCountryAnchor ber-debounce
      if (hoveredId && callbacksRef.current.onCountryAnchor) {
        if (time - lastAnchorEmitTime >= 100) {
          const country = countriesById.get(hoveredId);
          if (country) {
            const proj = projectCountryAnchor(country);
            if (proj) {
              const ax = Math.round(proj.screenX - cachedContainerRect.left);
              const ay = Math.round(proj.screenY - cachedContainerRect.top);
              if (Math.hypot(ax - lastAnchorX, ay - lastAnchorY) >= 6) {
                lastAnchorX = ax;
                lastAnchorY = ay;
                lastAnchorEmitTime = time;
                callbacksRef.current.onCountryAnchor(
                  hoveredId,
                  { x: ax, y: ay },
                  proj.side,
                );
              }
            }
          }
        }
      }

      // Sorotan scene Skala
      const hlProgress = highlightProgressRef
        ? Math.min(1, Math.max(0, highlightProgressRef.current ?? 0))
        : 0;
      const litCount = Math.round(hlProgress * 15);

      for (const country of countries) {
        country.target =
          selectedRef.current === country.id
            ? SELECT_LIFT
            : hoveredId === country.id
              ? HOVER_LIFT
              : 0;
        if (reducedMotion) {
          country.lift = country.target;
          country.hoverAmt = hoveredId === country.id ? 1 : 0;
          country.hl = country.band < litCount ? 1 : 0;
        } else {
          const factor = 1 - Math.exp(-delta / LIFT_TAU);
          country.lift += (country.target - country.lift) * factor;
          const glowFactor = 1 - Math.exp(-delta / GLOW_TAU);
          const hoverTarget = hoveredId === country.id ? 1 : 0;
          country.hoverAmt += (hoverTarget - country.hoverAmt) * glowFactor;
          const hlTarget = country.band < litCount ? 1 : 0;
          country.hl += (hlTarget - country.hl) * glowFactor;
        }

        const targetY = country.lift;
        if (Math.abs(country.mesh.position.y - targetY) > 0.0005) {
          country.mesh.position.y = targetY;
        }
      }

      applyState();
      renderer.render(scene, camera);

      if (!debug.ready) {
        debug.ready = true;
        window.dispatchEvent(new CustomEvent('asiakin:scene-ready'));
      }

      debug.diagnostics = {
        ...debug.diagnostics,
        distance: lastDistance,
        aspect: camera.aspect,
        width: containerW,
        height: containerH,
        azimuth,
        fitScale: lastFitScale,
        spanXNdc: lastSpanX,
        spanYNdc: lastSpanY,
        highlightProgress: hlProgress,
        litCount,
        silhouetteCount,
      };
    };

    const init = async () => {
      const manifestResponse = await fetch(
        assetUrl('models/asia.manifest.json'),
      );
      if (!manifestResponse.ok) {
        throw new Error(`Manifest ${manifestResponse.status}`);
      }
      const manifest: unknown = await manifestResponse.json();
      if (!isManifest(manifest)) {
        throw new Error('Manifest tidak valid');
      }

      const gltf = await gltfLoader.loadAsync(assetUrl('models/asia.glb'));
      if (disposed) {
        disposeObject(gltf.scene);
        return;
      }

      loaded = true;
      box.setFromObject(gltf.scene);
      box.getCenter(center);

      const manifestByIso = new Map<string, ManifestEntry>();
      for (const entry of manifest) {
        manifestByIso.set(entry.iso3, entry);
      }

      let minCountryBottomY = Number.POSITIVE_INFINITY;

      gltf.scene.traverse((object) => {
        if (!(object instanceof Mesh)) {
          return;
        }
        const iso3 = object.userData.iso_a3;
        const entry =
          typeof iso3 === 'string' ? manifestByIso.get(iso3) : undefined;

        const geometry = object.geometry;
        geometry.computeBoundingBox();
        const bounds = geometry.boundingBox;
        if (!bounds) {
          return;
        }

        if (!entry) {
          const existing = object.material;
          if (Array.isArray(existing)) {
            for (const item of existing) {
              item.dispose();
            }
          } else {
            existing.dispose();
          }
          object.visible = false;
          contextMeshes.push(object);
          unmappedNames.push(object.name || 'context');
          return;
        }

        minCountryBottomY = Math.min(minCountryBottomY, bounds.min.y);

        const position = geometry.getAttribute('position');
        const index = geometry.getIndex();
        const topY = bounds.max.y;
        const topThreshold =
          topY - Math.max(0.05, (topY - bounds.min.y) * 0.02);
        const targetX = (bounds.min.x + bounds.max.x) / 2;
        const targetZ = (bounds.min.z + bounds.max.z) / 2;
        const anchor = new Vector3(targetX, topY, targetZ);
        let bestDistance = Number.POSITIVE_INFINITY;
        let found = false;

        if (index) {
          for (let i = 0; i < index.count; i += 3) {
            const ia = index.getX(i);
            const ib = index.getX(i + 1);
            const ic = index.getX(i + 2);
            const ay = position.getY(ia);
            const by = position.getY(ib);
            const cy = position.getY(ic);
            if (ay < topThreshold || by < topThreshold || cy < topThreshold) {
              continue;
            }
            const px =
              (position.getX(ia) + position.getX(ib) + position.getX(ic)) / 3;
            const pz =
              (position.getZ(ia) + position.getZ(ib) + position.getZ(ic)) / 3;
            const dx = px - targetX;
            const dz = pz - targetZ;
            const candidate = dx * dx + dz * dz;
            if (candidate < bestDistance) {
              bestDistance = candidate;
              anchor.set(px, (ay + by + cy) / 3, pz);
              found = true;
            }
          }
        }

        if (!found) {
          anchor.set(targetX, topY, targetZ);
        }

        const material = new MeshStandardMaterial({
          color: countryColor(entry.id),
          roughness: MATERIAL_ROUGHNESS,
          metalness: 0,
          flatShading: true,
          polygonOffset: true,
          polygonOffsetFactor: 1,
          polygonOffsetUnits: 1,
        });

        const existing = object.material;
        if (Array.isArray(existing)) {
          for (const item of existing) {
            item.dispose();
          }
        } else {
          existing.dispose();
        }
        object.material = material;
        object.castShadow = true;
        object.receiveShadow = false;
        object.userData.countryId = entry.id;

        const outlineGeometry = createOutlineGeometry(geometry);
        const outlineMaterial = new LineBasicMaterial({
          color: inkColor,
          transparent: true,
          opacity: OUTLINE_OPACITY,
          depthWrite: false,
        });
        const outline = new LineSegments(outlineGeometry, outlineMaterial);
        outline.renderOrder = 1;
        object.add(outline);

        const country: CountryEntry = {
          id: entry.id,
          mesh: object,
          material,
          outlineMaterial,
          anchor,
          lift: 0,
          target: 0,
          hoverAmt: 0,
          hl: 0,
          band: 0,
        };
        countries.push(country);
        pickTargets.push(object);
        countriesById.set(entry.id, country);
      });

      debug.countryCount = countries.length;
      debug.unmapped = unmappedNames.slice();

      const byBand = [...countries].sort((a, b) => a.anchor.x - b.anchor.x);
      for (let i = 0; i < byBand.length; i += 1) {
        byBand[i]!.band = i;
      }

      gltf.scene.updateMatrixWorld(true);
      silhouette = computeSilhouette(pickTargets, center);
      silhouetteCount = silhouette.length / 3;

      for (let i = 0; i < pickTargets.length; i += 1) {
        const position = pickTargets[i]!.geometry.getAttribute('position');
        for (let k = 0; k < position.count; k += 1) {
          tempVertices.push(
            position.getX(k) - center.x,
            position.getY(k) - center.y,
            position.getZ(k) - center.z,
          );
        }
      }
      debug.vertices = new Float32Array(tempVertices);

      // K8: Bangun relief terrain 3D di bawah kontinen Asia
      const plateWidth = 240;
      const plateHeight = 180;
      const terrainPlate = createTerrainPlate(
        plateWidth,
        plateHeight,
        center,
        minCountryBottomY,
        terrainColors,
      );
      const terrainRidges = createTerrainRidges(
        plateWidth,
        plateHeight,
        center,
        minCountryBottomY,
        terrainColors,
      );
      scene.add(terrainPlate);
      scene.add(terrainRidges);
      groundLike.push(terrainPlate, terrainRidges);

      // K8: Posisi pencahayaan matahari dari NW (azimut 315°, elevasi 45°)
      sun.position.set(center.x - 100, center.y + 141.42, center.z - 100);
      sun.target.position.copy(center);
      sun.target.updateMatrixWorld();

      fill.position.set(center.x + 80, center.y + 60, center.z + 80);
      ground.position.set(center.x, -0.46, center.z);
      ground.updateMatrixWorld();

      scene.add(gltf.scene);

      if (countries.length === 0) {
        callbacksRef.current.onUnavailable?.();
        return;
      }

      // Ukur HERO_POSE kanonik pertama kali
      const elevation = (ELEVATION_FROM_HORIZONTAL * Math.PI) / 180;
      fitCamera(0, elevation, 0, 1.0);
      instanceHeroPose.azimuth = 0;
      instanceHeroPose.distance = lastDistance;
      instanceHeroPose.elevation = elevation;
      instanceHeroPose.tx = fitTarget.x;
      instanceHeroPose.ty = fitTarget.y;
      instanceHeroPose.tz = fitTarget.z;

      if (!debugKey || debugKey === 'hero') {
        HERO_POSE.azimuth = 0;
        HERO_POSE.distance = lastDistance;
        HERO_POSE.elevation = elevation;
        HERO_POSE.tx = fitTarget.x;
        HERO_POSE.ty = fitTarget.y;
        HERO_POSE.tz = fitTarget.z;
      }

      currentPose.azimuth = instanceHeroPose.azimuth;
      currentPose.distance = instanceHeroPose.distance;
      currentPose.elevation = instanceHeroPose.elevation;
      currentPose.tx = instanceHeroPose.tx;
      currentPose.ty = instanceHeroPose.ty;
      currentPose.tz = instanceHeroPose.tz;

      placeCameraFromPose(instanceHeroPose);

      renderer.setAnimationLoop(tick);
      applyState();
    };

    init().catch(() => {
      if (!disposed) {
        callbacksRef.current.onUnavailable?.();
      }
    });

    return () => {
      disposed = true;
      motionQuery.removeEventListener('change', onMotionChange);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateCachedRect);
      window.removeEventListener('wheel', triggerInterrupt);
      window.removeEventListener('touchmove', triggerInterrupt);
      window.removeEventListener('keydown', onKeyDown);

      if (!decorative) {
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerleave', onPointerLeave);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointercancel', onPointerLeave);
      }

      renderer.setAnimationLoop(null);

      if (loaded) {
        for (const country of countries) {
          country.mesh.removeFromParent();
          country.mesh.geometry.dispose();
          country.mesh.children.slice().forEach((child) => {
            if (child instanceof LineSegments) {
              child.geometry.dispose();
              if (child.material instanceof LineBasicMaterial) {
                disposeMaterial(child.material);
              }
            }
          });
          disposeMaterial(country.material);
        }
        for (const mesh of contextMeshes) {
          mesh.geometry.dispose();
          if (mesh.material instanceof MeshStandardMaterial) {
            mesh.material.dispose();
          }
        }
        scene.traverse((object) => {
          if (
            object instanceof Mesh &&
            !countries.some((c) => c.mesh === object)
          ) {
            object.geometry.dispose();
            const material = object.material;
            if (!Array.isArray(material)) {
              if (
                material instanceof ShadowMaterial ||
                material instanceof MeshStandardMaterial
              ) {
                material.dispose();
              }
            }
          }
        });
      } else {
        gltfLoader.setDRACOLoader(null);
      }

      dracoLoader.dispose();
      renderer.dispose();

      if (import.meta.env.DEV) {
        if (debugKey && window.__asiakin_scenes) {
          if (window.__asiakin_scenes[debugKey] === debug) {
            delete window.__asiakin_scenes[debugKey];
          }
        }
        if (window.__asiakin_scene === debug) {
          delete window.__asiakin_scene;
        }
      }
    };
  }, [
    scrollProgressRef,
    highlightProgressRef,
    decorative,
    debugKey,
    fitTargetNdcY,
    introEnabled,
    idleSway,
  ]);

  return (
    <div
      className={className ? `asia-scene ${className}` : 'asia-scene'}
      ref={containerRef}
    >
      <canvas
        ref={canvasRef}
        className="asia-scene__canvas"
        aria-hidden="true"
      />
      {!decorative && (
        <>
          <div
            ref={panelRef}
            className="asia-scene__panel asia-scene__label"
            data-visible="false"
            data-country-panel="true"
            aria-hidden="true"
          >
            <div className="asia-scene__panel-header">
              <div
                className="asia-scene__panel-name asia-scene__label-id"
                ref={labelIdRef}
              />
              <div
                className="asia-scene__panel-native asia-scene__label-native"
                ref={labelNativeRef}
              />
              <div
                className="asia-scene__label-region"
                ref={labelRegionRef}
                style={{ display: 'none' }}
              />
            </div>
            <div className="asia-scene__panel-body">
              <div className="asia-scene__panel-row">
                <span className="asia-scene__panel-label">Bahasa</span>
                <span
                  className="asia-scene__panel-value"
                  ref={panelLangRef}
                />
              </div>
              <div className="asia-scene__panel-row">
                <span className="asia-scene__panel-label">Aksara</span>
                <span
                  className="asia-scene__panel-value"
                  ref={panelScriptRef}
                />
              </div>
              <div className="asia-scene__panel-row">
                <span className="asia-scene__panel-label">Kedalaman</span>
                <span
                  className="asia-scene__panel-value"
                  ref={panelDepthRef}
                />
              </div>
            </div>
          </div>

          <div
            className="asia-scene__keyboard-nav"
            role="group"
            aria-label="Navigasi negara benua Asia"
          >
            {allCountries.map((c, idx) => (
              <button
                key={c.id}
                ref={(el) => {
                  keyboardButtonsRef.current[idx] = el;
                }}
                type="button"
                data-scene-country={c.id}
                tabIndex={keyboardActiveIndex === idx ? 0 : -1}
                onFocus={() => {
                  setKeyboardActiveIndex(idx);
                  callbacksRef.current.onHoverCountry?.(
                    createCountryHit(c.id, { x: 0, y: 0 }, 'left'),
                  );
                }}
                onClick={() => {
                  callbacksRef.current.onActivateCountry?.(c.id);
                  callbacksRef.current.onSelectCountry?.(c.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = (idx + 1) % allCountries.length;
                    setKeyboardActiveIndex(next);
                    keyboardButtonsRef.current[next]?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev =
                      (idx - 1 + allCountries.length) % allCountries.length;
                    setKeyboardActiveIndex(prev);
                    keyboardButtonsRef.current[prev]?.focus();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    callbacksRef.current.onHoverCountry?.(null);
                    (e.target as HTMLElement)?.blur();
                  }
                }}
              >
                {c.nameId}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
