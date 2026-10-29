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
import { useNavigate } from 'react-router-dom';
import {
  AmbientLight,
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  Fog,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  PCFShadowMap,
  PerspectiveCamera,
  PlaneGeometry,
  Raycaster,
  RingGeometry,
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

/**
 * Palet warna elegan terinspirasi dari identitas bendera/nasional masing-masing 15 negara:
 * - id (Indonesia): Indonesian crimson vermilion (#c53a2a)
 * - my (Malaysia): Malaysian deep royal navy (#244b78)
 * - sg (Singapura): Singapore scarlet (#d42b2b)
 * - th (Thailand): Thai royal navy (#283852)
 * - vn (Vietnam): Vietnam imperial red (#b82323)
 * - ph (Filipina): Philippine royal sapphire (#205085)
 * - cn (Tiongkok): China vermilion (#be2424)
 * - jp (Jepang): Japan sun red (#cb2d2d)
 * - kr (Korea Selatan): Korea taegeuk blue (#25528c)
 * - mn (Mongolia): Mongolian azure sky (#286299)
 * - in (India): India saffron amber (#d06a1c)
 * - sa (Arab Saudi): Saudi oasis green (#1f6d38)
 * - tr (Turki): Turkish crimson (#bd2020)
 * - kz (Kazakhstan): Kazakh azure steppe (#257e90)
 * - uz (Uzbekistan): Uzbek turquoise (#23739e)
 */
export const COUNTRY_COLORS: Record<string, string> = {
  // Southeast Asia
  id: '#c53a2a', // Indonesian crimson vermilion
  my: '#385a48', // Malaysian forest pine
  sg: '#cf3d32', // Singapore coral red
  th: '#6b4a6d', // Thai royal plum
  vn: '#b82e26', // Vietnam lacquer red
  ph: '#bf7d28', // Philippine golden amber
  // East Asia
  cn: '#b83324', // China imperial vermilion
  jp: '#c83232', // Japan sun crimson
  kr: '#4a5450', // Korea celadon slate umber
  mn: '#9c7c4e', // Mongolian steppe sand
  // South Asia
  in: '#cc6e25', // India saffron terracotta
  // West Asia
  sa: '#2e663d', // Saudi oasis olive green
  tr: '#a63629', // Turkish anatolian rust
  // Central Asia
  kz: '#948057', // Kazakh steppe loess khaki
  uz: '#a38753', // Uzbek sandstone ochre
};

export const REGION_COLORS: Record<string, string> = COUNTRY_COLORS;

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
  orbitRad: 0,
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
  /**
   * Id negara yang ingin di-frame kamera (mis. dari preview panel di landing).
   * - id valid: kamera bergeser halus ke negara tsb + zoom terbatas, highlight
   *   mengikuti `selectedRef`, idle sway berhenti. Tidak menavigasi.
   * - `null`: kembali halus ke pose overview/scroll normal.
   * Di layar lebar (>900px) negara digeser sedikit ke kiri supaya panel preview
   * di sisi kanan tidak menutupinya.
   */
  focusCountryId?: string | null;
  onHoverCountry?: (hit: CountryHit | string | null) => void;
  onCountryAnchor?: (id: string, anchor: { x: number; y: number }, side: 'left' | 'right') => void;
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
  /** Tampilkan overlay legenda wilayah dan petunjuk kontrol. */
  showOverlays?: boolean;
  /** Apakah klik negara menavigasi ke /negara/:id (aktif di section pilih negara, nonaktif di hero) */
  interactiveClick?: boolean;
  /** Kustom teks petunjuk kontrol di tengah bawah */
  controlsHintText?: string;
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
  /** Id negara yang sedang di-frame oleh `focusCountryId`, atau null. */
  focused?(): string | null;
  /** DEV helper: paksa fokus/lepas fokus tanpa mengubah prop React. */
  focus?(id: string | null): void;
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
  /** Pusat & radius geometry (ruang dunia model) untuk framing fokus kamera. */
  focusCenter: Vector3;
  focusRadius: number;
}

const FOV = 38;
const ELEVATION_FROM_HORIZONTAL = 52;
const DPR_MAX = 1.5;

const HOVER_LIFT = 0.6;
const SELECT_LIFT = 1.4;
const LIFT_TAU = 0.11;
const GLOW_TAU = 0.12;

const FIT_INK_SPAN_X = 1.28;
const FIT_INK_SPAN_X_MOBILE = 1.76;
const FIT_INK_SPAN_Y = 1.86;
const FIT_INK_SAFETY = 1.04;

const HOVER_HYSTERESIS_MS = 130;
const MATERIAL_ROUGHNESS = 0.42;
const MATERIAL_METALNESS = 0.08;
const OUTLINE_OPACITY = 0.45;
const MIN_CAMERA_DISTANCE = 130;
const MAX_CAMERA_DISTANCE = 320;

// Framing fokus kamera (focusCountryId).
// Margin radius negara saat menghitung jarak kamera; nilai lebih besar = lebih longgar.
const FOCUS_MARGIN = 1.35;
// Di layar lebar, target kamera digeser ke kanan sebesar fraksi setengah lebar
// pandang, sehingga negara tampak sedikit ke kiri dari tengah (memberi ruang
// untuk panel preview di sisi kanan). 0 = tepat di tengah.
const FOCUS_LEFT_BIAS = 0.16;
const FOCUS_BLEND_TAU = 0.32; // detik, transisi target overview <-> negara
const FOCUS_POINT_TAU = 0.22; // detik, perpindahan antar negara saat fokus
const FOCUS_DISTANCE_TAU = 0.28; // detik, peredaman jarak kamera

/**
 * Jarak kamera agar bola ber-radius `radius` masuk frame (dengan margin),
 * dibatasi MIN/MAX_CAMERA_DISTANCE. Memakai sudut pandang yang lebih sempit
 * antara vertikal & horizontal supaya negara tetap utuh di kedua sumbu.
 */
function focusDistanceForRadius(radius: number, aspect: number): number {
  const verticalHalf = (FOV * Math.PI) / 360;
  const horizontalHalf = Math.atan(Math.tan(verticalHalf) * Math.max(0.1, aspect));
  const halfAngle = Math.max(0.05, Math.min(verticalHalf, horizontalHalf));
  const fitted = (Math.max(1, radius) * FOCUS_MARGIN) / Math.sin(halfAngle);
  return Math.max(MIN_CAMERA_DISTANCE, Math.min(MAX_CAMERA_DISTANCE, fitted));
}

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
  material: MeshStandardMaterial | LineBasicMaterial | MeshBasicMaterial | ShadowMaterial,
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
      vertex.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld).sub(center);
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

export default function AsiaScene({
  scrollProgressRef,
  highlightProgressRef,
  selectedId = null,
  focusCountryId = null,
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
  showOverlays,
  interactiveClick = false,
  controlsHintText,
}: AsiaSceneProps) {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const labelRef = useRef<HTMLDivElement>(null);
  const labelIdRef = useRef<HTMLSpanElement>(null);
  const labelNativeRef = useRef<HTMLSpanElement>(null);
  const labelRegionRef = useRef<HTMLSpanElement>(null);

  const [keyboardActiveIndex, setKeyboardActiveIndex] = useState(0);
  const keyboardButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const callbacksRef = useRef({
    onHoverCountry,
    onCountryAnchor,
    onSelectCountry,
    onActivateCountry,
    onUnavailable,
    interactiveClick,
    navigate,
  });
  const selectedRef = useRef<string | null>(selectedId ?? null);
  // Nilai prop `selectedId` terakhir; dipakai untuk memulihkan highlight saat
  // fokus dilepas (supaya tidak "melawan" efek selectedId).
  const selectedIdRef = useRef<string | null>(selectedId ?? null);
  // Permintaan fokus dari prop/debug, dibaca per frame oleh loop rAF.
  const focusRequestRef = useRef<string | null>(focusCountryId ?? null);
  // Id fokus yang sedang aktif di dalam loop (null = overview).
  const focusActiveRef = useRef<string | null>(null);

  useEffect(() => {
    callbacksRef.current = {
      onHoverCountry,
      onCountryAnchor,
      onSelectCountry,
      onActivateCountry,
      onUnavailable,
      interactiveClick,
      navigate,
    };
  });

  useEffect(() => {
    selectedIdRef.current = selectedId ?? null;
    // Saat fokus aktif, highlight dikendalikan negara fokus; jangan ditimpa.
    if (focusActiveRef.current === null) {
      selectedRef.current = selectedIdRef.current;
    }
  }, [selectedId]);

  // Prop fokus hanya disalurkan lewat ref supaya scene tidak di-rebuild dan
  // perubahan cepat (mis. hover di daftar preview) tetap aman.
  useEffect(() => {
    focusRequestRef.current = focusCountryId ?? null;
  }, [focusCountryId]);

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
    scene.fog = new Fog(0xf4ede1, 300, 1800);
    const camera = new PerspectiveCamera(FOV, 1, 1, 20_000);
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    const styles = window.getComputedStyle(container);
    const inkColor = new Color(styles.getPropertyValue('--ink').trim() || '#1a1f24');
    const accentColor = new Color(styles.getPropertyValue('--accent').trim() || '#176b68');
    const countryColor = (id: string): Color => {
      const regionHex = REGION_COLORS[id];
      if (regionHex) {
        return new Color(regionHex);
      }
      const value = styles.getPropertyValue(`--country-${id}`).trim();
      return new Color(value || '#b9b4aa');
    };

    const ambient = new AmbientLight(0xfff8ee, 0.2);
    scene.add(ambient);

    const hemi = new HemisphereLight(0xfff8ee, 0xdcd0c0, 0.75);
    scene.add(hemi);

    // Main sun light from NW (0xfffcf5, 1.35)
    const sun = new DirectionalLight(0xfffcf5, 1.35);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -180;
    sun.shadow.camera.right = 180;
    sun.shadow.camera.top = 180;
    sun.shadow.camera.bottom = -180;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 900;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    scene.add(sun.target);

    // Warm SE fill light (0xebe0d2, 0.55)
    const fill = new DirectionalLight(0xebe0d2, 0.55);
    scene.add(fill);
    scene.add(fill.target);

    // groundLike: semua objek panggung tanah disembunyikan saat measureInk()
    const groundLike: Object3D[] = [];
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

    // Interactive controls state (orbit drag & zoom)
    let userHasControlled = false;
    let currentAzimuth = 0;
    let targetAzimuth = 0;
    let currentElevation = (ELEVATION_FROM_HORIZONTAL * Math.PI) / 180;
    let targetElevation = (ELEVATION_FROM_HORIZONTAL * Math.PI) / 180;
    let currentDistance = 220;
    let targetDistance = 220;

    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartAzimuth = 0;
    let dragStartElevation = 0;

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

    let labelTargetX = 0;
    let labelTargetY = 0;
    let labelCurX = 0;
    let labelCurY = 0;
    let labelW = 120;
    let labelH = 24;
    let labelVisible = false;

    const labelEl = decorative ? null : (labelRef.current ?? null);

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

    // Fokus kamera (lihat prop `focusCountryId`). Semua state di sini hidup di
    // dalam closure loop; tidak ada alokasi per frame.
    const overviewTarget = new Vector3(); // target pose overview/scroll
    const focusPoint = new Vector3(); // pusat negara, dihaluskan antar-negara
    const effectiveTarget = new Vector3(); // hasil lerp overview <-> fokus
    let focusCountry: CountryEntry | null = null;
    let focusRequestedId: string | null = null; // request terakhir yang diproses
    let focusActive = false;
    let focusBlend = 0; // 0 = overview, 1 = fokus penuh
    let focusDistance = MIN_CAMERA_DISTANCE;

    /**
     * Tulis target kamera efektif ke `effectiveTarget`. Di layar lebar, target
     * digeser ke kanan sepanjang vektor "right" kamera sehingga negara tampak
     * di kiri tengah (ruang untuk panel preview kanan).
     */
    const resolveEffectiveTarget = (azimuthRad: number, distanceVal: number) => {
      if (focusBlend <= 0.0001) {
        effectiveTarget.copy(overviewTarget);
        return effectiveTarget;
      }
      let shiftX = 0;
      let shiftZ = 0;
      if (containerW > 900) {
        const horizontalHalf = Math.atan(
          Math.tan((FOV * Math.PI) / 360) * Math.max(0.1, camera.aspect),
        );
        const worldShift = distanceVal * Math.tan(horizontalHalf) * FOCUS_LEFT_BIAS;
        shiftX = Math.cos(azimuthRad) * worldShift;
        shiftZ = -Math.sin(azimuthRad) * worldShift;
      }
      effectiveTarget.x =
        overviewTarget.x + (focusPoint.x + shiftX - overviewTarget.x) * focusBlend;
      effectiveTarget.y = overviewTarget.y + (focusPoint.y - overviewTarget.y) * focusBlend;
      effectiveTarget.z =
        overviewTarget.z + (focusPoint.z + shiftZ - overviewTarget.z) * focusBlend;
      return effectiveTarget;
    };

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

      // Aspect berubah -> jarak fokus yang pas untuk radius negara berubah juga.
      if (focusCountry) {
        focusDistance = focusDistanceForRadius(focusCountry.focusRadius, camera.aspect);
      }

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
      const side: 'left' | 'right' = containerRelX > rect.width / 2 ? 'left' : 'right';
      return { screenX, screenY, side };
    };

    const setHovered = (id: string | null, clientX = 0, clientY = 0) => {
      if (id === hoveredId) {
        return;
      }
      hoveredId = id;
      hoverEmitCount++;

      if (!labelEl) {
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
          if (country.nameLocal && country.nameLocal !== country.nameId) {
            labelNativeRef.current.textContent = ` · ${country.nameLocal}`;
            labelNativeRef.current.style.display = 'inline';
          } else {
            labelNativeRef.current.textContent = '';
            labelNativeRef.current.style.display = 'none';
          }
        }
        if (labelRegionRef.current) {
          labelRegionRef.current.textContent = region;
        }

        const labelDot = labelEl.querySelector<HTMLElement>('.asia-scene__label-dot');
        if (labelDot) {
          const colorHex = COUNTRY_COLORS[id] || '#c53a2a';
          labelDot.style.backgroundColor = colorHex;
          labelDot.style.boxShadow = `0 0 6px ${colorHex}55`;
        }

        labelW = labelEl.offsetWidth || 120;
        labelH = labelEl.offsetHeight || 24;

        const countryEntry = countriesById.get(id);
        let projSide: 'left' | 'right' = 'left';
        let anchorCoords = {
          x: Math.round(clientX > 0 ? clientX - cachedContainerRect.left : 0),
          y: Math.round(clientY > 0 ? clientY - cachedContainerRect.top : 0),
        };

        if (countryEntry) {
          const proj = projectCountryAnchor(countryEntry);
          if (proj) {
            projSide = proj.side;
            const relY = proj.screenY - cachedContainerRect.top;
            const relX = proj.screenX - cachedContainerRect.left;
            anchorCoords = {
              x: Math.round(relX),
              y: Math.round(relY),
            };
            if (clientX <= 0 && clientY <= 0) {
              labelTargetX = relX;
              labelTargetY = relY;
            }
          }
        }

        if (clientX > 0 && clientY > 0) {
          labelTargetX = clientX - cachedContainerRect.left;
          labelTargetY = clientY - cachedContainerRect.top;
        }

        if (!labelVisible) {
          labelCurX = labelTargetX;
          labelCurY = labelTargetY;
        }

        container.dataset.hovered = id;
        labelVisible = true;
        labelEl.dataset.visible = 'true';

        const hit = createCountryHit(id, anchorCoords, projSide);
        callbacksRef.current.onHoverCountry?.(hit);
      } else {
        container.dataset.hovered = '';
        labelVisible = false;
        labelEl.dataset.visible = 'false';
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

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === 'mouse') {
        return;
      }
      triggerInterrupt();
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      dragStartX = event.clientX;
      dragStartY = event.clientY;
      dragStartAzimuth = targetAzimuth;
      dragStartElevation = targetElevation;
      isDragging = false;
      pointerDownValid = true;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!loaded) return;

      if (pointerDownValid) {
        const dx = event.clientX - dragStartX;
        const dy = event.clientY - dragStartY;

        // Pada layar sentuh / gesture vertikal: batalkan drag jika gerakan dominan vertikal agar halaman bisa digulir
        if (event.pointerType !== 'mouse' && !isDragging) {
          if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5) {
            pointerDownValid = false;
            return;
          }
        }

        if (!isDragging && Math.hypot(dx, dy) > 6) {
          isDragging = true;
          userHasControlled = true;
          triggerInterrupt();
          container.classList.add('asia-scene--dragging');
          if (event.pointerType === 'mouse') {
            try {
              canvas.setPointerCapture(event.pointerId);
            } catch {
              // ignore
            }
          }
        }
        if (isDragging) {
          // Putar horizontal (azimut) dan vertikal (elevasi) dengan sensitivitas halus
          targetAzimuth = dragStartAzimuth - dx * 0.005;
          const minElev = (14 * Math.PI) / 180;
          const maxElev = (78 * Math.PI) / 180;
          targetElevation = Math.max(minElev, Math.min(maxElev, dragStartElevation + dy * 0.004));
          return;
        }
      }

      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      pointerMoved = true;
      if (labelVisible) {
        labelTargetX = event.clientX - cachedContainerRect.left;
        labelTargetY = event.clientY - cachedContainerRect.top;
      }
    };

    const onPointerLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' && event.type !== 'pointercancel') {
        return;
      }
      pointerMoved = false;
      candidateId = null;
      setHovered(null);
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!loaded || !pointerDownValid) {
        return;
      }
      pointerDownValid = false;
      try {
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
      } catch {
        // ignore
      }
      container.classList.remove('asia-scene--dragging');

      if (isDragging) {
        isDragging = false;
        return;
      }

      const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
      if (moved > 8) {
        return;
      }

      let id = pickAt(event.clientX, event.clientY);

      // Touch fallback nearest-anchor untuk layar sentuh
      if (!id && event.pointerType !== 'mouse') {
        let nearestId: string | null = null;
        let nearestDist = 24;
        for (const country of countries) {
          const proj = projectCountryAnchor(country);
          if (proj) {
            const d = Math.hypot(event.clientX - proj.screenX, event.clientY - proj.screenY);
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

      if (id) {
        selectedRef.current = id;
        callbacksRef.current.onSelectCountry?.(id);
        callbacksRef.current.onActivateCountry?.(id);
        setHovered(id, event.clientX, event.clientY);
        if (callbacksRef.current.interactiveClick) {
          callbacksRef.current.navigate(`/negara/${id}`);
        }
      } else {
        selectedRef.current = null;
        callbacksRef.current.onSelectCountry?.(null as unknown as string);
        setHovered(null);
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) {
        // Normal mouse wheel scrolling: 100% non-blocking, biarkan browser & Lenis scroll bebas
        return;
      }
      triggerInterrupt();
      userHasControlled = true;
      const zoomFactor = event.deltaY * 0.12;
      targetDistance = Math.max(
        MIN_CAMERA_DISTANCE,
        Math.min(MAX_CAMERA_DISTANCE, targetDistance + zoomFactor),
      );
    };

    let ctrlWheelAttached = false;
    const onCtrlWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    };

    const attachCtrlWheel = () => {
      if (!ctrlWheelAttached) {
        canvas.addEventListener('wheel', onCtrlWheel, { passive: false });
        ctrlWheelAttached = true;
      }
    };

    const detachCtrlWheel = () => {
      if (ctrlWheelAttached) {
        canvas.removeEventListener('wheel', onCtrlWheel);
        ctrlWheelAttached = false;
      }
    };

    const onDblClick = (event: MouseEvent) => {
      const id = pickAt(event.clientX, event.clientY);
      if (id) {
        selectedRef.current = id;
        callbacksRef.current.onSelectCountry?.(id);
        callbacksRef.current.onActivateCountry?.(id);
        setHovered(id, event.clientX, event.clientY);
        if (callbacksRef.current.interactiveClick) {
          callbacksRef.current.navigate(`/negara/${id}`);
        }
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' || event.key === ' ') {
        triggerInterrupt();
      }
      if (event.key === 'Control') {
        attachCtrlWheel();
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        detachCtrlWheel();
      }
    };

    window.addEventListener('scroll', updateCachedRect, { passive: true });
    window.addEventListener('touchmove', triggerInterrupt, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', detachCtrlWheel);

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerleave', onPointerLeave);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointercancel', onPointerLeave);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    canvas.addEventListener('dblclick', onDblClick);

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
        const elapsed = introStartedAt > 0 ? performance.now() - introStartedAt : 0;
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
      focused() {
        return focusCountry?.id ?? null;
      },
      focus(id: string | null) {
        // Dipakai probe DEV/Playwright; loop rAF yang mengeksekusi transisinya.
        focusRequestRef.current = id;
      },
      panelAnchor() {
        if (!hoveredId) return null;
        const country = countriesById.get(hoveredId);
        if (!country) return null;
        const proj = projectCountryAnchor(country);
        if (!proj) return null;
        const w = labelEl?.offsetWidth || 120;
        const h = labelEl?.offsetHeight || 24;
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
        return countries.filter((country) => country.hl >= 0.5).map((country) => country.id);
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

        // Sembunyikan semua ground-like objects (ground plane, compass ring, grid)
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

    const fitCamera = (azimuth: number, elevation: number, scroll: number, introZoom = 1.0) => {
      const aspect = camera.aspect;
      const tanHalf = Math.tan((FOV * Math.PI) / 360);
      const sx = Math.sin(azimuth);
      const cx = Math.cos(azimuth);
      const sy = Math.sin(elevation);
      const cy = Math.cos(elevation);
      const zoomFactor = (1 - scroll * 0.05) * introZoom;
      const spanXTarget =
        window.innerWidth <= 640
          ? FIT_INK_SPAN_X_MOBILE
          : window.innerWidth <= 1024
            ? 1.56
            : FIT_INK_SPAN_X;

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
        const hoverAmt = reducedMotion ? (hoveredId === country.id ? 1 : 0) : country.hoverAmt;
        const hl = reducedMotion ? (country.hl > 0 ? 1 : 0) : country.hl;
        const baseColor = countryColor(country.id);

        if (selected) {
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.95;
          country.material.color.copy(baseColor);
          country.material.emissive.copy(accentColor);
          country.material.emissiveIntensity = 0.38;
        } else if (country.id === hoveredId) {
          // Negara aktif ter-hover: sorotan jelas
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.95;
          country.material.color.copy(baseColor);
          country.material.emissive.copy(accentColor);
          country.material.emissiveIntensity = 0.28;
        } else {
          // Negara lain: warna wilayah asli
          country.material.color.copy(baseColor);
          country.material.emissive.copy(baseColor);
          country.material.emissiveIntensity = hoverAmt * 0.16 + hl * 0.3;
          if (hoverAmt > 0.03) {
            country.outlineMaterial.color.copy(accentColor);
            country.outlineMaterial.opacity = OUTLINE_OPACITY + hoverAmt * 0.15 + hl * 0.08;
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
        typeof document !== 'undefined' && document.documentElement.dataset.ready === 'true';

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
        const scrollNow = Math.min(1, Math.max(0, scrollProgressRef?.current ?? 0));
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

      // --- Fokus kamera (prop `focusCountryId`) ----------------------------
      // Deteksi perubahan request. Id divalidasi terhadap negara yang sudah
      // dimuat; bila model belum siap, request dicoba lagi tiap frame.
      const requestedFocus = focusRequestRef.current;
      if (requestedFocus !== focusRequestedId) {
        if (requestedFocus === null) {
          focusRequestedId = null;
          if (focusActive) {
            focusActive = false;
            focusActiveRef.current = null;
            focusCountry = null;
            // Kembalikan highlight ke pilihan prop (bukan highlight paksa fokus).
            selectedRef.current = selectedIdRef.current;
            targetDistance = Math.max(
              MIN_CAMERA_DISTANCE,
              Math.min(MAX_CAMERA_DISTANCE, lastDistance > 50 ? lastDistance : 220),
            );
          }
        } else {
          const entry = countriesById.get(requestedFocus);
          if (entry) {
            focusRequestedId = requestedFocus;
            if (!focusActive) {
              // Mulai dari pose saat ini supaya transisi tidak melompat.
              focusPoint.set(currentPose.tx, currentPose.ty, currentPose.tz);
            }
            focusActive = true;
            focusCountry = entry;
            focusActiveRef.current = entry.id;
            selectedRef.current = entry.id;
            focusDistance = focusDistanceForRadius(entry.focusRadius, camera.aspect);
            targetDistance = focusDistance;
            // Fokus mengalahkan intro yang sedang berjalan (tanpa navigasi).
            if (owner !== 'scroll') {
              owner = 'scroll';
              container.dataset.intro = reducedMotion ? 'reduced' : 'done';
              introFinishedAt = time;
            }
          }
          // id tidak dikenal -> abaikan dan coba lagi setelah model termuat.
        }
      }

      // Blend target (overview <-> negara) dan peredaman titik fokus.
      const blendFactor = reducedMotion ? 1 : 1 - Math.exp(-delta / FOCUS_BLEND_TAU);
      focusBlend += ((focusActive ? 1 : 0) - focusBlend) * blendFactor;
      if (!focusActive && focusBlend < 0.001) {
        focusBlend = 0;
      }
      if (focusActive && focusCountry) {
        const pointFactor = reducedMotion ? 1 : 1 - Math.exp(-delta / FOCUS_POINT_TAU);
        const liftedY = focusCountry.focusCenter.y + focusCountry.lift;
        focusPoint.x += (focusCountry.focusCenter.x - focusPoint.x) * pointFactor;
        focusPoint.y += (liftedY - focusPoint.y) * pointFactor;
        focusPoint.z += (focusCountry.focusCenter.z - focusPoint.z) * pointFactor;
      }

      if (owner === 'scroll') {
        if (userHasControlled) {
          // Orbit kamera interaktif yang halus (lerp/dampening)
          const factor = 1 - Math.exp(-delta / 0.08);
          currentAzimuth += (targetAzimuth - currentAzimuth) * factor;
          currentElevation += (targetElevation - currentElevation) * factor;
          currentDistance = Math.max(
            MIN_CAMERA_DISTANCE,
            Math.min(
              MAX_CAMERA_DISTANCE,
              currentDistance + (targetDistance - currentDistance) * factor,
            ),
          );

          // Pivot = target efektif; saat fokus, drag mengorbit negara fokus.
          overviewTarget.copy(fitTarget);
          const target = resolveEffectiveTarget(currentAzimuth, currentDistance);

          currentPose.azimuth = currentAzimuth;
          currentPose.elevation = currentElevation;
          currentPose.distance = currentDistance;
          currentPose.tx = target.x;
          currentPose.ty = target.y;
          currentPose.tz = target.z;

          placeCameraFromPose(currentPose);
        } else {
          const scroll = Math.min(1, Math.max(0, scrollProgressRef?.current ?? 0));
          const MAX_IDLE_RAD = (1.5 * Math.PI) / 180;
          if (
            idleSway !== false &&
            !reducedMotion &&
            !focusActive &&
            hoveredId === null &&
            selectedRef.current === null
          ) {
            const swayElapsed = Math.max(0, time - introFinishedAt);
            const ramp = Math.min(1, swayElapsed / 1200);
            azimuth = Math.sin((swayElapsed / 1000) * ((2 * Math.PI) / 8)) * MAX_IDLE_RAD * ramp;
          } else {
            azimuth = 0;
          }
          const elevation = ((ELEVATION_FROM_HORIZONTAL + scroll * 7) * Math.PI) / 180;
          fitCamera(azimuth, elevation, scroll, 1.0);
          overviewTarget.copy(fitTarget);

          // Jarak overview mengikuti fitCamera; fokus punya jarak sendiri yang
          // diredam supaya zoom terasa terbatas, bukan lompatan.
          const distanceGoal = focusActive ? focusDistance : lastDistance;
          if (reducedMotion) {
            currentDistance = distanceGoal;
          } else if (focusActive || focusBlend > 0.001) {
            const dFactor = 1 - Math.exp(-delta / FOCUS_DISTANCE_TAU);
            currentDistance += (distanceGoal - currentDistance) * dFactor;
          } else {
            currentDistance = distanceGoal;
          }
          targetDistance = distanceGoal;

          currentAzimuth = azimuth;
          targetAzimuth = azimuth;
          currentElevation = elevation;
          targetElevation = elevation;

          const target = resolveEffectiveTarget(azimuth, currentDistance);

          currentPose.azimuth = azimuth;
          currentPose.distance = currentDistance;
          currentPose.elevation = elevation;
          currentPose.tx = target.x;
          currentPose.ty = target.y;
          currentPose.tz = target.z;
        }
      }

      // K9 Hover raycasting & hysteresis (maksimal 1x per frame)
      if (loaded && !isDragging) {
        if (pointerMoved) {
          pointerMoved = false;
          const id = pickAt(pointerClientX, pointerClientY);
          if (id !== candidateId) {
            candidateId = id;
            candidateAt = time;
          }
        }
        if (candidateId !== hoveredId && time - candidateAt >= HOVER_HYSTERESIS_MS) {
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
                callbacksRef.current.onCountryAnchor(hoveredId, { x: ax, y: ay }, proj.side);
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

      // Label kursor floating: posisi via translate3d lerp halus tanpa layout shift React
      if (labelEl && labelVisible) {
        const lerpFactor = delta <= 0 ? 1 : 1 - Math.exp(-delta / 0.05);
        labelCurX += (labelTargetX - labelCurX) * lerpFactor;
        labelCurY += (labelTargetY - labelCurY) * lerpFactor;
        const flip = labelCurX + 16 + labelW > containerW - 12;
        const appliedX = flip ? labelCurX - labelW - 16 : labelCurX + 16;
        const appliedY = Math.min(
          Math.max(labelCurY - labelH / 2, 8),
          Math.max(8, containerH - labelH - 8),
        );
        labelEl.style.transform = `translate3d(${Math.round(appliedX * 10) / 10}px, ${Math.round(appliedY * 10) / 10}px, 0)`;
        labelEl.dataset.flip = flip ? 'true' : 'false';
      }

      renderer.render(scene, camera);

      if (!debug.ready) {
        debug.ready = true;
        window.dispatchEvent(new CustomEvent('asiakin:scene-ready'));
      }

      debug.diagnostics = {
        ...debug.diagnostics,
        distance: currentPose.distance,
        aspect: camera.aspect,
        width: containerW,
        height: containerH,
        azimuth: currentPose.azimuth,
        fitScale: lastFitScale,
        spanXNdc: lastSpanX,
        spanYNdc: lastSpanY,
        highlightProgress: hlProgress,
        litCount,
        silhouetteCount,
      };
    };

    const init = async () => {
      const manifestResponse = await fetch(assetUrl('models/asia.manifest.json'));
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
        const entry = typeof iso3 === 'string' ? manifestByIso.get(iso3) : undefined;

        const geometry = object.geometry;
        geometry.computeBoundingBox();
        geometry.computeBoundingSphere();
        const bounds = geometry.boundingBox;
        if (!bounds) {
          return;
        }
        const sphere = geometry.boundingSphere;
        const focusCenter = sphere ? sphere.center.clone() : new Vector3();
        const focusRadius = sphere ? Math.max(1, sphere.radius) : 1;
        if (!sphere) {
          bounds.getCenter(focusCenter);
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
        const topThreshold = topY - Math.max(0.05, (topY - bounds.min.y) * 0.02);
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
            const px = (position.getX(ia) + position.getX(ib) + position.getX(ic)) / 3;
            const pz = (position.getZ(ia) + position.getZ(ib) + position.getZ(ic)) / 3;
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

        // PBR material bersih dengan pewarnaan wilayah resmi
        const material = new MeshStandardMaterial({
          color: countryColor(entry.id),
          roughness: MATERIAL_ROUGHNESS,
          metalness: MATERIAL_METALNESS,
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
          focusCenter,
          focusRadius,
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

      // Panggung pendaratan & elemen kartografi benua Asia
      const continentSize = new Vector3();
      box.getSize(continentSize);
      const continentWidth = continentSize.x;
      const continentDepth = continentSize.z;
      const baseY = minCountryBottomY - 0.04;

      // 1. Panggung ground penangkap bayangan lembut di atas kertas (opacity 0.14)
      const groundGeometry = new PlaneGeometry(1200, 1200);
      const groundMaterial = new ShadowMaterial({ opacity: 0.14 });
      const ground = new Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.set(center.x, baseY, center.z);
      ground.receiveShadow = true;
      scene.add(ground);

      // 2. Cincin kompas kartografi kuningan hangat (delicate warm brass)
      const ringRadius = Math.max(118, Math.hypot(continentWidth, continentDepth) * 0.58);
      const ringGeometry = new RingGeometry(ringRadius - 0.22, ringRadius + 0.22, 180);
      ringGeometry.rotateX(-Math.PI / 2);
      const ringMaterial = new MeshBasicMaterial({
        color: 0xa88454,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
      });
      const ringMesh = new Mesh(ringGeometry, ringMaterial);
      ringMesh.position.set(center.x, baseY + 0.005, center.z);
      scene.add(ringMesh);

      // 3. Cincin konsentris halus bagian dalam
      const innerRingGeometry = new RingGeometry(ringRadius - 3.2, ringRadius - 3.0, 180);
      innerRingGeometry.rotateX(-Math.PI / 2);
      const innerRingMaterial = new MeshBasicMaterial({
        color: 0xa88454,
        transparent: true,
        opacity: 0.18,
        depthWrite: false,
      });
      const innerRingMesh = new Mesh(innerRingGeometry, innerRingMaterial);
      innerRingMesh.position.set(center.x, baseY + 0.005, center.z);
      scene.add(innerRingMesh);

      // 4. Titik kardinal dan tanda derajat (cardinal points & degree ticks)
      const tickPositions: number[] = [];
      const numTicks = 72; // setiap 5 derajat
      for (let i = 0; i < numTicks; i++) {
        const theta = (i * 2 * Math.PI) / numTicks;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        let rInner = ringRadius - 1.2;
        let rOuter = ringRadius - 0.1;

        const isCardinal = i % 18 === 0;
        const isMajor = i % 6 === 0;
        const isMid = i % 3 === 0;

        if (isCardinal) {
          rInner = ringRadius - 4.2;
          rOuter = ringRadius + 2.2;
        } else if (isMajor) {
          rInner = ringRadius - 3.1;
          rOuter = ringRadius + 0.2;
        } else if (isMid) {
          rInner = ringRadius - 2.2;
          rOuter = ringRadius - 0.1;
        }

        tickPositions.push(
          center.x + cos * rInner,
          baseY + 0.006,
          center.z + sin * rInner,
          center.x + cos * rOuter,
          baseY + 0.006,
          center.z + sin * rOuter,
        );

        if (isCardinal) {
          const crossR = ringRadius + 1.2;
          const perpX = -sin * 0.9;
          const perpZ = cos * 0.9;
          tickPositions.push(
            center.x + cos * crossR - perpX,
            baseY + 0.006,
            center.z + sin * crossR - perpZ,
            center.x + cos * crossR + perpX,
            baseY + 0.006,
            center.z + sin * crossR + perpZ,
          );
        }
      }

      const ticksGeometry = new BufferGeometry();
      ticksGeometry.setAttribute('position', new Float32BufferAttribute(tickPositions, 3));
      const ticksMaterial = new LineBasicMaterial({
        color: 0xa88454,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      });
      const ticksMesh = new LineSegments(ticksGeometry, ticksMaterial);
      scene.add(ticksMesh);

      // groundLike: semua objek panggung tanah disembunyikan saat measureInk()
      groundLike.push(ground, ringMesh, innerRingMesh, ticksMesh);

      // K8: Posisi pencahayaan matahari dari NW (azimut 315°, elevasi 48°)
      sun.position.set(center.x - 100, center.y + 140, center.z - 100);
      sun.target.position.copy(center);
      sun.target.updateMatrixWorld();

      fill.position.set(center.x + 100, center.y + 70, center.z + 100);
      fill.target.position.copy(center);
      fill.target.updateMatrixWorld();

      scene.add(gltf.scene);

      if (countries.length === 0) {
        callbacksRef.current.onUnavailable?.();
        return;
      }

      // Ukur HERO_POSE kanonik pertama kali
      const elevation = (ELEVATION_FROM_HORIZONTAL * Math.PI) / 180;
      fitCamera(0, elevation, 0, 1.0);
      overviewTarget.copy(fitTarget);
      focusPoint.copy(fitTarget);
      targetDistance = Math.max(MIN_CAMERA_DISTANCE, Math.min(MAX_CAMERA_DISTANCE, lastDistance));
      currentDistance = targetDistance;
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
      focusActiveRef.current = null;
      detachCtrlWheel();
      motionQuery.removeEventListener('change', onMotionChange);
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateCachedRect);
      window.removeEventListener('touchmove', triggerInterrupt);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', detachCtrlWheel);

      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerLeave);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('dblclick', onDblClick);

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
        for (const obj of groundLike) {
          obj.removeFromParent();
          if ('geometry' in obj && obj.geometry instanceof BufferGeometry) {
            obj.geometry.dispose();
          }
          if ('material' in obj && obj.material) {
            const mat = obj.material;
            if (Array.isArray(mat)) {
              for (const m of mat) m.dispose();
            } else if (
              mat instanceof ShadowMaterial ||
              mat instanceof MeshStandardMaterial ||
              mat instanceof MeshBasicMaterial ||
              mat instanceof LineBasicMaterial
            ) {
              mat.dispose();
            }
          }
        }
        scene.traverse((object) => {
          if (
            object instanceof Mesh &&
            !countries.some((c) => c.mesh === object) &&
            !groundLike.includes(object)
          ) {
            object.geometry.dispose();
            const material = object.material;
            if (!Array.isArray(material)) {
              if (
                material instanceof ShadowMaterial ||
                material instanceof MeshStandardMaterial ||
                material instanceof MeshBasicMaterial ||
                material instanceof LineBasicMaterial
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

  const showControlsAndLegend = showOverlays ?? debugKey !== 'scale';

  return (
    <div className={className ? `asia-scene ${className}` : 'asia-scene'} ref={containerRef}>
      <canvas ref={canvasRef} className="asia-scene__canvas" aria-hidden="true" />

      {showControlsAndLegend && (
        <>
          <div className="scene-legend" aria-label="Legenda Wilayah">
            <span className="scene-legend__title">WILAYAH</span>
            <div className="scene-legend__item">
              <span className="scene-legend__color" style={{ background: '#a63629' }} /> West Asia
            </div>
            <div className="scene-legend__item">
              <span className="scene-legend__color" style={{ background: '#948057' }} /> Central
              Asia
            </div>
            <div className="scene-legend__item">
              <span className="scene-legend__color" style={{ background: '#cc6e25' }} /> South Asia
            </div>
            <div className="scene-legend__item">
              <span className="scene-legend__color" style={{ background: '#385a48' }} /> Southeast
              Asia
            </div>
            <div className="scene-legend__item">
              <span className="scene-legend__color" style={{ background: '#b83324' }} /> East Asia
            </div>
          </div>

          <p className="scene-controls-hint">
            {controlsHintText || 'Tarik untuk memutar · Klik negara untuk fokus'}
          </p>
        </>
      )}

      {!decorative && (
        <>
          <div ref={labelRef} className="asia-scene__label" data-visible="false" aria-hidden="true">
            <span className="asia-scene__label-dot" aria-hidden="true" />
            <span className="asia-scene__label-id" ref={labelIdRef} />
            <span className="asia-scene__label-native" ref={labelNativeRef} />
            <span
              className="asia-scene__label-region"
              ref={labelRegionRef}
              style={{ display: 'none' }}
            />
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
                  if (interactiveClick) {
                    navigate(`/negara/${c.id}`);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const next = (idx + 1) % allCountries.length;
                    setKeyboardActiveIndex(next);
                    keyboardButtonsRef.current[next]?.focus();
                  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prev = (idx - 1 + allCountries.length) % allCountries.length;
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
