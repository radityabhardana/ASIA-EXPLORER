/*
 * Scene 3D benua Asia (Varian B — slab relief).
 *
 * Modul ini adalah satu-satunya tempat yang mengimpor `three`, dan pemakai
 * wajib memuatnya lewat `React.lazy` supaya chunk 3D terpisah dari entry.
 * Tidak ada akses `document` saat modul dievaluasi — semua sentuhan DOM
 * terjadi di dalam effect, sehingga impor tetap aman di lingkungan tanpa WebGL.
 *
 * Sumber angka: DESIGN.md §5b (FOV 38, tilt 52°, DPR clamp) + AUDIT Tahap A:
 * fit kamera berbasis margin NDC (tinta tak menyentuh tepi kanvas), label
 * hover imperatif (rAF transform + lerp), dan sorotan 15 negara via
 * `highlightProgressRef` (dibaca per frame, bukan state React).
 */

import { useEffect, useRef } from 'react';
import type { Object3D } from 'three';
import type { RefObject } from 'react';
import {
  AmbientLight,
  Box3,
  BufferGeometry,
  Color,
  DirectionalLight,
  EdgesGeometry,
  Float32BufferAttribute,
  HemisphereLight,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
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

import { getCountry } from '@/content/countries';
import { getRegion } from '@/content/regions';
import { getWebGLTier } from '@/lib/webgl';
import '@/styles/scene.css';

export interface AsiaSceneProps {
  /** 0..1, dibaca di dalam loop rAF — bukan state React. */
  scrollProgressRef?: RefObject<number>;
  /**
   * 0..1 progress sorotan scene "Skala": count = round(p * 15), urutan
   * barat → timur berdasarkan rank anchor.x. Dibaca per frame di rAF;
   * penulisnya satu-satunya tween GSAP agar counter tetap sinkron.
   */
  highlightProgressRef?: RefObject<number>;
  selectedId?: string | null;
  onHoverCountry?: (id: string | null) => void;
  onSelectCountry?: (id: string) => void;
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
  /** Tinggi tinta sebagai % tinggi viewport (audit A3). */
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
  /** Id negara dengan nilai sorotan ≥ 0,5 (setelah crossfade). */
  lit?(): string[];
  /** Jumlah negara yang menyala saat ini. */
  highlightCount?(): number;
  /** Progress sorotan mentah 0..1 yang sedang dibaca per frame. */
  highlightProgress?(): number;
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
  /** Nilai hover 0..1 (crossfade 120 ms), bukan boolean. */
  hoverAmt: number;
  /** Nilai sorotan skala 0..1 (crossfade 120 ms). */
  hl: number;
  /** Urutan barat → timur untuk sorotan scene Skala. */
  band: number;
  introStartMs: number;
}

const FOV = 38;
const ELEVATION_FROM_HORIZONTAL = 52;
const DPR_MAX = 1.5;

/** Satuan dunia model ≈170 unit lebar, jadi lift dalam satuan dunia. */
const HOVER_LIFT = 0.6;
const SELECT_LIFT = 1.4;

/** Damper eksponensial: ~89% dalam 200ms. */
const LIFT_TAU = 0.11;

/** Crossfade emissive hover / sorotan skala, ekuivalen gsap.quickTo 120 ms. */
const GLOW_TAU = 0.12;

/**
 * Target span NDC tinta benua (hull siluet, sumbu X) sebelum faktor aman.
 * Faktor aman FIT_INK_SAFETY mengabsorbi piksel anti-aliasing dan vertex
 * Y-ekstrem yang tak ikut hull XZ supaya tinta benar-benar tidak menyentuh
 * tepi kanvas (audit L1). 1.76 / 1.04 ≈ 1.69 tinta digambar = 62 ±3 vw pada
 * wadah hero 76 vw dan 85 ±4 vw pada wadah mobile 100 vw.
 */
const FIT_INK_SPAN_X = 1.76;

/**
 * Target span X khusus viewport ≤640 (audit L2 putaran 2): hero 375 lebih
 * rapat — tinta benua ≈ 86 vw (1.79/1.04 NDC) di dalam gate e2e 81–89.
 */
const FIT_INK_SPAN_X_MOBILE = 1.79;

/** Cap span NDC-Y tinta: 93% tinggi wadah dengan margin atas-bawah. */
const FIT_INK_SPAN_Y = 1.86;

/**
 * Faktor aman terhadap span hasil proyeksi hull: anti-aliasing (~1 piksel
 * tiap sisi) dan vertex Y-ekstrem di dalam hull XZ menambah ~2–4% ink yang
 * digambar melewati proyeksi hull. Dikalikan terhadap kedua sumbu.
 */
const FIT_INK_SAFETY = 1.04;

/** Histeresis hover masuk/keluar (audit A6: 120–150 ms). */
const HOVER_HYSTERESIS_MS = 130;

/** Lerp posisi label mengikuti pointer (satu sisi fst mirip tau 60 ms). */
const LABEL_TAU = 0.06;

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

function disposeMaterial(material: MeshStandardMaterial | LineBasicMaterial): void {
  material.dispose();
}

/**
 * Garis tepi hanya dari rim horizontal (atas/bawah hasil ekstrusi).
 * `EdgesGeometry` mentah juga memuat sudut dinding vertikal yang tampak
 * seperti garis putus-putus di garis pantai; itu dibuang di sini.
 */
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

/**
 * Titik siluet untuk pencocokan lebar kamera.
 *
 * Bounding box model jauh lebih lebar dari daratan sebenarnya: sudut bbox
 * berada di ruang kosong, sehingga mencocokkan span sudut bbox membuat benua
 * hanya mengisi ~52vw dari target. Yang dipakai adalah hull cembung tapak
 * XZ (proyeksi daratan ke bidang horizontal) — audit Tahap A menambahkan
 * mesh konteks non-negara ke tumpukan ini agar kamera juga meliputi tanah.
 */
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
  onHoverCountry,
  onSelectCountry,
  onUnavailable,
  decorative = false,
  debugKey,
  fitTargetNdcY = 0,
  className,
}: AsiaSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Label hover imperatif: selalu ada di DOM (non-dekoratif), teks & posisi
  // ditulis dari rAF — tidak pernah lewat state React per pointermove.
  const labelRef = useRef<HTMLDivElement>(null);
  const labelIdRef = useRef<HTMLDivElement>(null);
  const labelNativeRef = useRef<HTMLDivElement>(null);
  const labelRegionRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef({ onHoverCountry, onSelectCountry, onUnavailable });
  const selectedRef = useRef<string | null>(selectedId ?? null);

  useEffect(() => {
    callbacksRef.current = { onHoverCountry, onSelectCountry, onUnavailable };
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

    // Token warna dibaca setelah mount; modul tetap aman tanpa DOM.
    const styles = window.getComputedStyle(container);
    const inkColor = new Color(styles.getPropertyValue('--ink').trim() || '#1a1f24');
    const accentColor = new Color(styles.getPropertyValue('--accent').trim() || '#176b68');
    const countryColor = (id: string): Color => {
      const value = styles.getPropertyValue(`--country-${id}`).trim();
      return new Color(value || '#b9b4aa');
    };

    // Ambient base + hemisphere for depth perception
    const ambient = new AmbientLight(0xffffff, 0.5);
    scene.add(ambient);

    // Hemisphere: sky warm, ground cool — creates natural depth
    const hemi = new HemisphereLight(0xfff4e8, 0x8b9dc3, 0.45);
    scene.add(hemi);

    // Main sun from upper-right-front for visible shadows on extrusion
    const sun = new DirectionalLight(0xfff8f0, 1.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -140;
    sun.shadow.camera.right = 140;
    sun.shadow.camera.top = 140;
    sun.shadow.camera.bottom = -140;
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 900;
    sun.shadow.bias = -0.0008;
    sun.shadow.normalBias = 0.015;
    scene.add(sun);
    scene.add(sun.target);

    // Fill light from opposite side to soften shadows
    const fill = new DirectionalLight(0xd4e4f7, 0.35);
    scene.add(fill);

    const groundGeometry = new PlaneGeometry(520, 520);
    const groundMaterial = new ShadowMaterial({ opacity: 0.12 });
    const ground = new Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.08;
    ground.receiveShadow = true;
    scene.add(ground);

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
    // Ukuran wadah untuk clamp/flip label; diperbarui saat resize & pointer.
    let containerW = 1;
    let containerH = 1;
    // Posisi label (px lokal) — target pointer dan nilai lerp saat ini.
    let labelTargetX = 0;
    let labelTargetY = 0;
    let labelCurX = 0;
    let labelCurY = 0;
    let labelW = 0;
    let labelH = 0;
    let labelVisible = false;

    const labelEl = decorative ? null : (labelRef.current ?? null);

    const center = new Vector3();
    const box = new Box3();

    // Titik siluet dipakai untuk mencocokkan lebar; disimpan rata agar loop
    // frame tidak mengalokasikan objek baru.
    let silhouette: Float32Array = new Float32Array(0);
    let silhouetteCount = 0;
    const anchorWorld = new Vector3();
    const projectedWorld = new Vector3();
    // State fit kamera: target look-at (di-reseed ke pusat model setiap
    // panggilan) dan vektor kerja proyeksi tanpa alokasi per frame.
    const fitTarget = new Vector3();
    const projVec = new Vector3();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        for (const country of countries) {
          country.lift = country.target;
          country.mesh.position.y = country.target;
        }
      }
    };
    motionQuery.addEventListener('change', onMotionChange);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, DPR_MAX));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      containerW = width;
      containerH = height;
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    /**
     * Satu-satunya tempat status hover berubah. `immediate` dipakai untuk
     * tap pertama sentuh (label tampil seketika, tanpa histeresis).
     */
    const setHovered = (
      id: string | null,
      clientX: number,
      clientY: number,
      immediate: boolean,
    ) => {
      if (id === hoveredId) {
        return;
      }
      hoveredId = id;
      callbacksRef.current.onHoverCountry?.(id);

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
          labelNativeRef.current.textContent = country.nameLocal;
        }
        if (labelRegionRef.current) {
          labelRegionRef.current.textContent = region;
        }
        // Ukuran terukur sekali per perubahan negara — bukan per frame.
        labelW = labelEl.offsetWidth;
        labelH = labelEl.offsetHeight;
        const rect = container.getBoundingClientRect();
        labelTargetX = clientX - rect.left;
        labelTargetY = clientY - rect.top;
        if (immediate || !labelVisible) {
          labelCurX = labelTargetX;
          labelCurY = labelTargetY;
        }
        labelVisible = true;
        labelEl.dataset.visible = 'true';
      } else {
        labelVisible = false;
        labelEl.dataset.visible = 'false';
      }
    };

    const pickAt = (clientX: number, clientY: number): string | null => {
      if (pickTargets.length === 0) {
        return null;
      }
      const rect = container.getBoundingClientRect();
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
      // Sentuh tidak punya hover-out: pointerout/leave palsu yang
      // menyusul tap tidak boleh menghapus hover, agar tap kedua pada
      // negara yang sama membuka dialog (audit A6).
      // pointercancel (contoh: mulai scroll) tetap keluar dari hover.
      if (event.pointerType !== 'mouse' && event.type !== 'pointercancel') {
        return;
      }
      pointerMoved = false;
      // Keluar hover juga lewat histeresis: candidate kosong sekarang,
      // tick mengonfirmi keluar setelah HOVER_HYSTERESIS_MS.
      candidateId = null;
      candidateAt = performance.now();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (decorative) return;
      pointerDownX = event.clientX;
      pointerDownY = event.clientY;
      pointerDownValid = true;
    };

    const onPointerUp = (event: PointerEvent) => {
      if (!loaded || !pointerDownValid || decorative) {
        return;
      }
      pointerDownValid = false;
      const moved = Math.hypot(event.clientX - pointerDownX, event.clientY - pointerDownY);
      if (moved > 12) {
        return;
      }
      // Maksimal satu raycast per gestur tap.
      const id = pickAt(event.clientX, event.clientY);
      if (event.pointerType !== 'mouse') {
        // Sentuh: tap pertama menampilkan label, tap kedua pada negara
        // yang sama membuka dialog (audit A6).
        if (id) {
          if (hoveredId === id) {
            candidateId = null;
            callbacksRef.current.onSelectCountry?.(id);
          } else {
            candidateId = id;
            candidateAt = 0;
            setHovered(id, event.clientX, event.clientY, true);
          }
        } else {
          candidateId = null;
          setHovered(null, event.clientX, event.clientY, false);
        }
        return;
      }
      if (id) {
        callbacksRef.current.onSelectCountry?.(id);
      }
    };

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
        const rect = container.getBoundingClientRect();
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

        const groundVisible = ground.visible;
        ground.visible = false;

        camera.updateMatrixWorld();
        renderer.render(scene, camera);

        ground.visible = groundVisible;

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

    /**
     * Fit kamera berbasis margin (audit L1/A1): iterasi mengukur span dan mid
     * tinta lewat proyeksi kanonik `Vector3.project` — pipeline yang sama
     * dengan render — sehingga sampel iterasi selalu identik dengan piksel
     * yang digambar. Versi lama memakai basis kamera hitung manual yang
     * mengabaikan magnifikasi perspektif permukaan atas; hasilnya tinta
     * tergeser ~80px dan menyerempet tepi kanan kanvas.
     *
     * Alur per iterasi: tempatkan kamera, proyeksikan hull siluet, lalu
     * (a) perbesar `distance` bila span melewati target (dengan faktor aman
     * hapus: anti-aliasing dan vertex Y-ekstrem di dalam hull XZ) dan
     * (b) geser target look-at sampai mid proyeksi tepat di NDC X = 0 dan
     * NDC Y = fitTargetNdcY. Tidak ada lagi offset tepi (`offsetRight = 7.0`)
     * dan `targetSpan = 1.98` yang membuat tinta terpotong `overflow: hidden`
     * kanvas.
     */
    const fitCamera = (azimuth: number, elevation: number, scroll: number, introZoom = 1.0) => {
      const aspect = camera.aspect;
      const tanHalf = Math.tan((FOV * Math.PI) / 360);
      const sx = Math.sin(azimuth);
      const cx = Math.cos(azimuth);
      const sy = Math.sin(elevation);
      const cy = Math.cos(elevation);
      const zoomFactor = (1 - scroll * 0.05) * introZoom;
      // Target span X responsif terhadap media query ≤640 yang sama dengan
      // CSS hero mobile (audit L2): viewport sempit memakai target lebih
      // agresif agar benua menempati band dengan rapat.
      const spanXTarget = window.innerWidth <= 640
        ? FIT_INK_SPAN_X_MOBILE
        : FIT_INK_SPAN_X;

      // Target di-reseed ke pusat model tiap panggilan: tidak ada akumulasi
      // error antar-frame.
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

        // Koreksi pusat: error NDC → geseran dunia pada sumbu kanan/atas
        // kamera, dibaca langsung dari matrixWorld supaya cocok dengan
        // pipeline render (bukan basis yang dihitung ulang manual).
        const elements = camera.matrixWorld.elements;
        const shiftRight = midR * distance * tanHalf * aspect;
        const shiftUp = (midU - fitTargetNdcY) * distance * tanHalf;
        fitTarget.x += elements[0]! * shiftRight + elements[4]! * shiftUp;
        fitTarget.y += elements[1]! * shiftRight + elements[5]! * shiftUp;
        fitTarget.z += elements[2]! * shiftRight + elements[6]! * shiftUp;
      }

      // Penempatan final: pastikan kamera konsisten dengan state (target,
      // distance) hasil iterasi terakhir, apa pun jalur keluar loop-nya.
      place(distance * zoomFactor);

      lastDistance = distance;
      lastFitScale = finalScale;
      lastSpanX = finalSpanX;
      lastSpanY = finalSpanY;
    };

    /** Warna/status per negara dijalankan tiap frame: murah untuk 15 mesh. */
    const applyState = () => {
      for (const country of countries) {
        const selected = selectedRef.current === country.id;
        const hoverAmt = reducedMotion ? (hoveredId === country.id ? 1 : 0) : country.hoverAmt;
        const hl = reducedMotion ? (country.hl > 0 ? 1 : 0) : country.hl;

        if (selected) {
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.9;
          country.material.emissive.copy(accentColor);
          country.material.emissiveIntensity = 0.38;
        } else {
          // Sorotan skala: emisif warna sendiri. Hover memakai warna aksen
          // pada outline (perilaku lama) plus emisif tipis.
          country.material.emissive.copy(country.material.color);
          country.material.emissiveIntensity = hoverAmt * 0.16 + hl * 0.3;
          if (hoverAmt > 0.03) {
            country.outlineMaterial.color.copy(accentColor);
            country.outlineMaterial.opacity = OUTLINE_OPACITY + hoverAmt * 0.15 + hl * 0.08;
          } else {
            country.outlineMaterial.color.copy(inkColor);
            country.outlineMaterial.opacity =
              OUTLINE_OPACITY + hl * 0.12 + (hl > 0.5 ? 0.1 : 0);
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
    let introStartTime = 0;

    const tick = (time: number) => {
      const seconds = time / 1000;
      const delta = lastTime === 0 ? 0 : Math.min(seconds - lastTime, 0.1);
      lastTime = seconds;

      if (loaded && introStartTime === 0) {
        introStartTime = time;
      }
      const elapsedIntro = loaded && introStartTime > 0 ? time - introStartTime : 0;
      const nowMs = time;

      const scroll = Math.min(
        1,
        Math.max(0, scrollProgressRef?.current ?? 0),
      );

      const MAX_IDLE_RAD = (1.5 * Math.PI) / 180;
      if (!reducedMotion && hoveredId === null && selectedRef.current === null && elapsedIntro >= 1600) {
        const idleSeconds = (elapsedIntro - 1600) / 1000;
        azimuth = Math.sin(idleSeconds * (2 * Math.PI / 8)) * MAX_IDLE_RAD;
      } else {
        azimuth = 0;
      }

      const elevation = ((ELEVATION_FROM_HORIZONTAL + scroll * 7) * Math.PI) / 180;
      fitCamera(azimuth, elevation, scroll, 1.0);

      // Histeresis hover: maksimal satu raycast per frame, hanya saat
      // pointer benar-benar berpindah (audit A6).
      if (!decorative && loaded) {
        if (pointerMoved) {
          pointerMoved = false;
          const id = pickAt(pointerClientX, pointerClientY);
          if (id !== candidateId) {
            candidateId = id;
            candidateAt = nowMs;
          }
          // Target posisi label mengikuti pointer setiap frame bergerak.
          const rect = container.getBoundingClientRect();
          labelTargetX = pointerClientX - rect.left;
          labelTargetY = pointerClientY - rect.top;
        }
        if (candidateId !== hoveredId && nowMs - candidateAt >= HOVER_HYSTERESIS_MS) {
          setHovered(candidateId, pointerClientX, pointerClientY, false);
        }
      }

      // Sorotan scene Skala: count = round(p * 15), urutan barat → timur.
      // Satu sumber data — tween GSAP menulis ref ini dan teks counter.
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

        let introOffsetY = 0;
        if (!reducedMotion && elapsedIntro < 1600) {
          if (elapsedIntro < country.introStartMs) {
            introOffsetY = -1.6;
          } else if (elapsedIntro >= country.introStartMs + 400) {
            introOffsetY = 0;
          } else {
            const t = (elapsedIntro - country.introStartMs) / 400;
            const eased = 1 - Math.pow(1 - t, 3);
            introOffsetY = -1.6 * (1 - eased);
          }
        }

        const targetY = introOffsetY + country.lift;
        if (Math.abs(country.mesh.position.y - targetY) > 0.0005) {
          country.mesh.position.y = targetY;
        }
      }

      applyState();

      // Label imperatif: posisi via transform + lerp — tidak menyentuh
      // layout React, tidak memicu render.
      if (labelEl) {
        if (labelVisible) {
          const lerpFactor = delta <= 0 ? 1 : 1 - Math.exp(-delta / LABEL_TAU);
          labelCurX += (labelTargetX - labelCurX) * lerpFactor;
          labelCurY += (labelTargetY - labelCurY) * lerpFactor;
          const flip = labelCurX + 14 + labelW > containerW - 8;
          const appliedX = flip ? labelCurX - labelW - 14 : labelCurX + 14;
          const appliedY = Math.min(
            Math.max(labelCurY - labelH / 2, 6),
            Math.max(6, containerH - labelH - 6),
          );
          labelEl.style.transform = `translate3d(${Math.round(appliedX * 100) / 100}px, ${Math.round(appliedY * 100) / 100}px, 0)`;
          labelEl.dataset.flip = flip ? 'true' : 'false';
        }
      }

      renderer.render(scene, camera);

      if (!debug.ready) {
        debug.ready = true;
        // Notify preloader that scene is ready
        window.dispatchEvent(new CustomEvent('asiakin:scene-ready'));
      }
      debug.diagnostics = {
        ...debug.diagnostics,
        distance: lastDistance,
        aspect: camera.aspect,
        width: container.clientWidth,
        height: container.clientHeight,
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
          // Mesh konteks non-negara (tanah benua yang ikut terekspor):
          // Pakistan, Afghanistan, Bangladesh, Sri Lanka, dan sisa lembaran
          // kecil lain. GLB hanya berisi serpihan lepas, bukan daratan
          // kohesif, jadi audit L4 dipilih opsi "tidak ada sama sekali":
          // mesh disembunyikan seluruhnya — tidak digambar, tanpa bayangan,
          // tidak pickable, dan tidak ikut siluet fit kamera.
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

        // Titik jangkar untuk debug/projected: centroid segitiga di permukaan atas
        // yang paling dekat ke pusat bounding box — dijamin berada di dalam mesh.
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
          introStartMs: 600,
        };
        countries.push(country);
        pickTargets.push(object);
        countriesById.set(entry.id, country);
      });

      debug.countryCount = countries.length;
      debug.unmapped = unmappedNames.slice();

      // Band sorotan: urut barat → timur berdasarkan anchor.x.
      const byBand = [...countries].sort((a, b) => a.anchor.x - b.anchor.x);
      for (let i = 0; i < byBand.length; i += 1) {
        byBand[i]!.band = i;
      }

      let minCentroidX = Number.POSITIVE_INFINITY;
      let maxCentroidX = Number.NEGATIVE_INFINITY;
      for (const country of countries) {
        minCentroidX = Math.min(minCentroidX, country.anchor.x);
        maxCentroidX = Math.max(maxCentroidX, country.anchor.x);
      }
      const spanCentroidX = maxCentroidX - minCentroidX || 1;
      for (const country of countries) {
        const westToEast = (country.anchor.x - minCentroidX) / spanCentroidX;
        country.introStartMs = 600 + westToEast * 600;
      }

      // Matrix dunia sudah final setelah traverse (node GLB tanpa transform),
      // jadi hull bisa dihitung sekali di sini. Hanya mesh 15 negara yang
      // di-fit: mesh konteks disembunyikan (audit L4) sehingga hull mustahil
      // melebar daripada tinta yang benar-benar digambar.
      gltf.scene.updateMatrixWorld(true);
      silhouette = computeSilhouette(pickTargets, center);
      silhouetteCount = silhouette.length / 3;

      for (const country of countries) {
        if (!reducedMotion) {
          country.mesh.position.y = -1.6;
        }
      }

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

      // Model dibangun mengelilingi pusat bounding box, bukan origin.
      sun.position.set(
        center.x + 100,
        center.y + 200,
        center.z + 80,
      );
      sun.target.position.copy(center);
      sun.target.updateMatrixWorld();

      // Fill light from opposite side
      fill.position.set(
        center.x - 80,
        center.y + 120,
        center.z - 60,
      );

      ground.position.set(center.x, -0.08, center.z);
      ground.updateMatrixWorld();

      scene.add(gltf.scene);

      if (countries.length === 0) {
        callbacksRef.current.onUnavailable?.();
        return;
      }

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
          if (object instanceof Mesh && !countries.some((c) => c.mesh === object)) {
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
  }, [scrollProgressRef, highlightProgressRef, decorative, debugKey, fitTargetNdcY]);

  return (
    <div className={className ? `asia-scene ${className}` : 'asia-scene'} ref={containerRef}>
      <canvas ref={canvasRef} className="asia-scene__canvas" aria-hidden="true" />
      {!decorative && (
        <div
          className="asia-scene__label"
          ref={labelRef}
          data-visible="false"
          aria-hidden="true"
        >
          <div className="asia-scene__label-id" ref={labelIdRef} />
          <div className="asia-scene__label-native" ref={labelNativeRef} />
          <div className="asia-scene__label-region" ref={labelRegionRef} />
        </div>
      )}
    </div>
  );
}



