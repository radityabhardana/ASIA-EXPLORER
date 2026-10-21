/*
 * Scene 3D benua Asia (Varian B — slab relief).
 *
 * Modul ini adalah satu-satunya tempat yang mengimpor `three`, dan pemakai
 * wajib memuatnya lewat `React.lazy` supaya chunk 3D terpisah dari entry.
 * Tidak ada akses `document` saat modul dievaluasi — semua sentuhan DOM
 * terjadi di dalam effect, sehingga impor tetap aman di lingkungan tanpa WebGL.
 *
 * Sumber angka: DESIGN.md §5b (FOV 42, tilt 35°, lebar 62vw/85vw, DPR clamp).
 */

import { useEffect, useRef, useState } from 'react';
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
  selectedId?: string | null;
  onHoverCountry?: (id: string | null) => void;
  onSelectCountry?: (id: string) => void;
  /** WebGL gagal dibuat atau model tidak bisa dimuat. */
  onUnavailable?: () => void;
  /** Decorative scenes have no interaction, no hover labels. */
  decorative?: boolean;
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
}

interface AsiaSceneDebug {
  ready: boolean;
  countryCount: number;
  diagnostics?: Record<string, number>;
  vertices?: Float32Array<ArrayBufferLike>;
  projected(id: string): { x: number; y: number } | null;
  measureInk?(): InkMeasurement;
}

declare global {
  interface Window {
    __asiakin_scene?: AsiaSceneDebug;
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
 * hanya mengisi ~52vw dari target 62vw. Yang dipakai di sini adalah hull
 * cembung tapak XZ (proyeksi daratan ke bidang horizontal); titik ekstrem
 * layar selalu berasal dari hull ini, jadi lebar yang dicapai tepat.
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
  selectedId = null,
  onHoverCountry,
  onSelectCountry,
  onUnavailable,
  decorative = false,
  className,
}: AsiaSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const callbacksRef = useRef({ onHoverCountry, onSelectCountry, onUnavailable });
  const selectedRef = useRef<string | null>(selectedId ?? null);
  
  const [hoverLabel, setHoverLabel] = useState<{
    visible: boolean;
    x: number;
    y: number;
    flip: boolean;
    nameId: string;
    nameLocal: string;
    region: string;
  } | null>(null);

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
    const tempVertices: number[] = [];

    let disposed = false;
    let loaded = false;
    let hoveredId: string | null = null;
    let stateDirty = true;
    let pointerMoved = false;
    let pointerClientX = 0;
    let pointerClientY = 0;
    let pointerDownX = 0;
    let pointerDownY = 0;
    let pointerDownValid = false;

    const center = new Vector3();
    const box = new Box3();

    // Titik siluet dipakai untuk mencocokkan lebar; disimpan rata agar loop
    // frame tidak mengalokasikan objek baru.
    let silhouette: Float32Array = new Float32Array(0);
    let silhouetteCount = 0;
    const anchorWorld = new Vector3();
    const projectedWorld = new Vector3();

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const onMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        for (const country of countries) {
          country.lift = country.target;
          country.mesh.position.y = country.target;
        }
        stateDirty = true;
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
    };
    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const setHover = (id: string | null, clientX = pointerClientX, clientY = pointerClientY) => {
      if (decorative) {
        return;
      }

      const rect = container.getBoundingClientRect();
      const localX = clientX - rect.left;
      const localY = clientY - rect.top;
      const flip = clientX + 16 + 180 > window.innerWidth - 16;

      if (hoveredId === id) {
        if (id) {
          setHoverLabel((prev) =>
            prev
              ? {
                  ...prev,
                  x: localX,
                  y: localY,
                  flip,
                }
              : null,
          );
        }
        return;
      }
      hoveredId = id;
      stateDirty = true;
      callbacksRef.current.onHoverCountry?.(id);

      if (id) {
        const country = getCountry(id);
        const region = getRegion(id);
        if (country && region) {
          setHoverLabel({
            visible: true,
            x: localX,
            y: localY,
            flip,
            nameId: country.nameId,
            nameLocal: country.nameLocal,
            region,
          });
        } else {
          setHoverLabel(null);
        }
      } else {
        setHoverLabel(null);
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

    // Define handlers outside so they're in scope for cleanup
    const onPointerMove = (event: PointerEvent) => {
      if (!loaded || decorative) {
        return;
      }
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      pointerMoved = true;
    };

    const onPointerLeave = () => {
      if (decorative) return;
      pointerMoved = false;
      setHover(null);
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
      const id = pickAt(event.clientX, event.clientY);
      if (id) {
        callbacksRef.current.onSelectCountry?.(id);
      }
    };

    // Only register listeners if not decorative
    if (!decorative) {
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerleave', onPointerLeave);
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointercancel', onPointerLeave);
    }

    const debug: AsiaSceneDebug = {
      ready: false,
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

        let maxY_for_maxX = 0;
        let r_maxX = 0, g_maxX = 0, b_maxX = 0, a_maxX = 0;
        if (maxX >= 0) {
          for (let y = 0; y < height; y++) {
            const idx = (y * width + maxX) * 4;
            if ((pixels[idx + 3] ?? 0) > 10) {
              maxY_for_maxX = y;
              r_maxX = pixels[idx] ?? 0;
              g_maxX = pixels[idx + 1] ?? 0;
              b_maxX = pixels[idx + 2] ?? 0;
              a_maxX = pixels[idx + 3] ?? 0;
            }
          }
        }

        debug.diagnostics = {
          ...debug.diagnostics,
          minPixelX: minX,
          maxPixelX: maxX,
          minPixelY: minY,
          maxPixelY: maxY,
          drawingBufferWidth: width,
          drawingBufferHeight: height,
          pixelAtMaxX_y: maxY_for_maxX,
          pixelAtMaxX_r: r_maxX,
          pixelAtMaxX_g: g_maxX,
          pixelAtMaxX_b: b_maxX,
          pixelAtMaxX_a: a_maxX,
        };

        return {
          left: cssLeft,
          right: cssRight,
          top: cssTop,
          bottom: cssBottom,
          widthPx,
          heightPx,
          viewportWidth,
          widthVw,
        };
      },
    };

    if (import.meta.env.DEV) {
      if (decorative || !window.__asiakin_scene) {
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

      const rx = cx;
      const rz = -sx;
      const ux = -sx * sy;
      const uy = cy;
      const uz = -cx * sy;
      const fx = -sx * cy;
      const fy = -sy;
      const fz = -cx * cy;

      const offsetRight = 7.0;
      let offsetUp = lastOffsetUp;
      let distance = lastDistance > 50 ? lastDistance : 160;
      const targetSpan = 1.98;

      for (let iter = 0; iter < 10; iter += 1) {
        let minNdcX = Number.POSITIVE_INFINITY;
        let maxNdcX = Number.NEGATIVE_INFINITY;
        let minNdcY = Number.POSITIVE_INFINITY;
        let maxNdcY = Number.NEGATIVE_INFINITY;

        for (let i = 0; i < silhouetteCount; i += 1) {
          const lx = silhouette[i * 3] ?? 0;
          const ly = silhouette[i * 3 + 1] ?? 0;
          const lz = silhouette[i * 3 + 2] ?? 0;

          const projRight = lx * rx + lz * rz - offsetRight;
          const projUp = lx * ux + ly * uy + lz * uz - offsetUp;
          const projFwd = lx * fx + ly * fy + lz * fz;

          const depth = distance - projFwd;
          if (depth <= 1) continue;

          const ndcX = projRight / (depth * tanHalf * aspect);
          const ndcY = projUp / (depth * tanHalf);

          if (ndcX < minNdcX) minNdcX = ndcX;
          if (ndcX > maxNdcX) maxNdcX = ndcX;
          if (ndcY < minNdcY) minNdcY = ndcY;
          if (ndcY > maxNdcY) maxNdcY = ndcY;
        }

        const spanX = maxNdcX - minNdcX;
        const midNdcY = (minNdcY + maxNdcY) / 2;

        if (!Number.isFinite(spanX) || spanX <= 0) break;

        distance *= spanX / targetSpan;
        const targetNdcY = 0.315;
        offsetUp += (midNdcY - targetNdcY) * distance * tanHalf;

        lastMinRight = minNdcX;
        lastMaxRight = maxNdcX;

        if (Math.abs(spanX - targetSpan) < 0.002 && Math.abs(midNdcY) < 0.001) {
          break;
        }
      }

      const scaledDistance = distance * (1 - scroll * 0.05) * introZoom;
      lastDistance = scaledDistance;
      lastOffsetRight = offsetRight;
      lastOffsetUp = offsetUp;

      const targetX = center.x + rx * offsetRight + ux * offsetUp;
      const targetY = center.y + uy * offsetUp;
      const targetZ = center.z + rz * offsetRight + uz * offsetUp;

      camera.position.set(
        targetX + sx * cy * scaledDistance,
        targetY + sy * scaledDistance,
        targetZ + cx * cy * scaledDistance,
      );
      camera.up.set(0, 1, 0);
      camera.lookAt(targetX, targetY, targetZ);
      camera.updateMatrixWorld();
    };

    const applyState = () => {
      for (const country of countries) {
        const selected = selectedRef.current === country.id;
        const hovered = hoveredId === country.id;
        if (selected) {
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.9;
          country.material.emissive.copy(accentColor);
          country.material.emissiveIntensity = 0.38;
        } else if (hovered) {
          country.outlineMaterial.color.copy(accentColor);
          country.outlineMaterial.opacity = 0.55;
          country.material.emissive.copy(country.material.color);
          country.material.emissiveIntensity = 0.16;
        } else {
          country.outlineMaterial.color.copy(inkColor);
          country.outlineMaterial.opacity = OUTLINE_OPACITY;
          country.material.emissive.setRGB(0, 0, 0);
          country.material.emissiveIntensity = 1;
        }
      }
    };

    let lastTime = 0;
    let azimuth = 0;
    let lastDistance = 0;
    let lastOffsetRight = 0;
    let lastOffsetUp = 0;
    let lastMinRight = 0;
    let lastMaxRight = 0;
    let introStartTime = 0;

    const tick = (time: number) => {
      const seconds = time / 1000;
      const delta = lastTime === 0 ? 0 : Math.min(seconds - lastTime, 0.1);
      lastTime = seconds;

      if (loaded && introStartTime === 0) {
        introStartTime = time;
      }
      const elapsedIntro = loaded && introStartTime > 0 ? time - introStartTime : 0;

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

      if (pointerMoved) {
        pointerMoved = false;
        setHover(pickAt(pointerClientX, pointerClientY), pointerClientX, pointerClientY);
      }

      if (stateDirty) {
        stateDirty = false;
        applyState();
      }

      const selected = selectedRef.current;
      for (const country of countries) {
        country.target =
          selected === country.id
            ? SELECT_LIFT
            : hoveredId === country.id
              ? HOVER_LIFT
              : 0;
        if (reducedMotion) {
          country.lift = country.target;
        } else {
          const factor = 1 - Math.exp(-delta / LIFT_TAU);
          country.lift += (country.target - country.lift) * factor;
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

      renderer.render(scene, camera);

      if (!debug.ready) {
        debug.ready = true;
        // Notify preloader that scene is ready
        window.dispatchEvent(new CustomEvent('asiakin:scene-ready'));
      }
        debug.diagnostics = {
          distance: lastDistance,
          aspect: camera.aspect,
          width: container.clientWidth,
          height: container.clientHeight,
          azimuth,
          offsetRight: lastOffsetRight,
          offsetUp: lastOffsetUp,
          targetX: camera.position.x,
          minRight: lastMinRight,
          maxRight: lastMaxRight,
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
        if (typeof iso3 !== 'string') {
          return;
        }
        const entry = manifestByIso.get(iso3);
        if (!entry) {
          return;
        }

        const geometry = object.geometry;
        geometry.computeBoundingBox();
        const bounds = geometry.boundingBox;
        if (!bounds) {
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
          introStartMs: 600,
        };
        countries.push(country);
        pickTargets.push(object);
        countriesById.set(entry.id, country);
      });

      debug.countryCount = countries.length;

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
      // jadi hull bisa dihitung sekali di sini.
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
      // Sun from upper-right-front for visible shadows on extrusion faces
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

      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointercancel', onPointerLeave);

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
        scene.traverse((object) => {
          if (object instanceof Mesh && !countries.some((c) => c.mesh === object)) {
            object.geometry.dispose();
            if (object.material instanceof ShadowMaterial) {
              object.material.dispose();
            }
          }
        });
      } else {
        gltfLoader.setDRACOLoader(null);
      }

      dracoLoader.dispose();
      renderer.dispose();

      if (import.meta.env.DEV && window.__asiakin_scene === debug) {
        delete window.__asiakin_scene;
      }
    };
  }, [scrollProgressRef, decorative]);

  return (
    <div className={className ? `asia-scene ${className}` : 'asia-scene'} ref={containerRef}>
      <canvas ref={canvasRef} className="asia-scene__canvas" aria-hidden="true" />
      {!decorative && hoverLabel && hoverLabel.visible && (
        <div
          className="asia-scene__label"
          data-flip={hoverLabel.flip ? 'true' : undefined}
          style={{
            left: `${hoverLabel.x}px`,
            top: `${hoverLabel.y}px`,
          }}
        >
          <div className="asia-scene__label-id">{hoverLabel.nameId}</div>
          <div className="asia-scene__label-native">{hoverLabel.nameLocal}</div>
          <div className="asia-scene__label-region">{hoverLabel.region}</div>
        </div>
      )}
    </div>
  );
}
