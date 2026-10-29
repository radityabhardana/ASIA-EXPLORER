import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/*
 * Empat gerbang baru PRD V2.5 §6 (1–4) untuk landing putaran 4.
 *
 * Gerbang 1  tepi lurus  — tinta kanvas 3D tidak boleh menyentuh tepi kanvas.
 * Gerbang 2  overlap     — kotak teks tidak boleh beririsan dengan siluet,
 *                          peta, foto, atau teks lain.
 * Gerbang 3  isi layar   — gabungan tinta tiap scene ≥ 70% tinggi viewport.
 * Gerbang 4  hover stabil— sapuan 8 negara dalam 600 ms, label tidak berkedip.
 *
 * Semua pengukuran dicetak satu baris per scene/lebar supaya kegagalan bisa
 * dibaca langsung dari terminal tanpa membuka report HTML.
 */

/* ------------------------------------------------------------------------- *
 * Konstanta
 * ------------------------------------------------------------------------- */

/*
 * Chromium headless tanpa GPU jatuh ke SwiftShader dan menjalankan scene WebGL
 * ini ~3 fps (diukur: rAF median 317 ms). Pada laju itu gerbang hover 16 ms
 * tidak bermakna dan gate 3 kehabisan waktu — jadi minta ANGLE/D3D11 memakai
 * GPU host. Bila GPU tidak ada, Chromium tetap kembali ke SwiftShader.
 */
test.use({
  launchOptions: {
    args: ['--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-gpu'],
  },
});

/** Porsi maksimum tepi yang boleh tertutup tinta sebelum disebut tepi lurus. */
const EDGE_INK_LIMIT = 0.02;

/** Ambang isi layar (§6.3). */
const MIN_UNION_VH = 0.7;

/** Ambang luas irisan yang dianggap tabrakan (§6.2). */
const OVERLAP_MIN_AREA_PX2 = 4;

/** Durasi sapuan pointer gerbang 4. */
const HOVER_SWEEP_MS = 600;

/** Jendela pengamatan kepadatan perubahan label. */
const HOVER_CHANGE_WINDOW_MS = 80;

/** Lama sampling setelah sapuan berakhir. */
const HOVER_TAIL_MS = 420;

/**
 * Kandidat titik hover per negara, relatif terhadap jangkar 3D. Jangkar adalah
 * satu titik di permukaan mesh; kamera berayun pelan (idle), jadi pada siluet
 * sempit (Jepang) titik itu bisa meleset beberapa px. Titik yang dipakai untuk
 * sapuan selalu yang sudah terbukti menampilkan label negara yang benar.
 */
const HOVER_PROBE_OFFSETS = [
  [0, 0],
  [0, -10],
  [0, 10],
  [-10, 0],
  [10, 0],
  [0, -18],
  [-18, 0],
  [18, 0],
] as const;

/** Viewport §0.9: desktop, tablet, ponsel. */
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 768, height: 1024 },
  { width: 375, height: 812 },
] as const;

/** Scene landing yang diukur §6.3. */
const LANDING_SCENES = ['hero', 'script', 'dashboard'] as const;

/** Scene yang memuat kanvas 3D; hanya hero yang masih punya peta interaktif. */
const CANVAS_SCENES = ['hero'] as const;

/** Id ISO3 negara yang disapu gerbang 4, urut barat → timur → selatan. */
const HOVER_ORDER = ['TUR', 'SAU', 'IND', 'THA', 'IDN', 'PHL', 'CHN', 'JPN'] as const;

/** Nama Indonesia per ISO3 (sumber: src/content/countries48.ts). */
const COUNTRY_NAMES: Record<string, string> = {
  TUR: 'Turki',
  SAU: 'Arab Saudi',
  IND: 'India',
  THA: 'Thailand',
  IDN: 'Indonesia',
  PHL: 'Filipina',
  CHN: 'Tiongkok',
  JPN: 'Jepang',
};

/* ------------------------------------------------------------------------- *
 * Tipe
 * ------------------------------------------------------------------------- */

type Rect = { x: number; y: number; width: number; height: number };

type Viewport = { width: number; height: number };

type InkReport = {
  width: number;
  height: number;
  channels: number;
  bg: { r: number; g: number; b: number };
  bgDeltaFromPage: number;
  edge: { left: number; right: number; top: number; bottom: number };
  /** Kotak tinta; `x1`/`y1` eksklusif. */
  bbox: { x0: number; y0: number; x1: number; y1: number };
  inkPixels: number;
};

type CollectedRect = { x: number; y: number; width: number; height: number };
type CollectedText = { text: string; tag: string; rect: CollectedRect };
type CollectedVisual = {
  kind: 'canvas' | 'svg' | 'img' | 'video';
  rect: CollectedRect;
};
type CollectedScene = { texts: CollectedText[]; visuals: CollectedVisual[] };

type HoverSample = {
  /** ms sejak sampler mulai. */
  t: number;
  visible: boolean;
  text: string;
  idText: string;
  visibleLabels: number;
  rect: CollectedRect | null;
  insideViewport: boolean;
  insideScene: boolean;
};

/* ------------------------------------------------------------------------- *
 * Utilitas Node
 * ------------------------------------------------------------------------- */

function fmt(value: number, digits = 1): string {
  return value.toFixed(digits);
}

function pct(value: number): string {
  return `${(value * 100).toFixed(2)}%`;
}

function fmtRect(rect: Rect): string {
  return `${Math.round(rect.x)},${Math.round(rect.y)} ${Math.round(rect.width)}x${Math.round(rect.height)}`;
}

function intersectArea(a: Rect, b: Rect): number {
  const width = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const height = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}

/* ------------------------------------------------------------------------- *
 * Helper halaman
 * ------------------------------------------------------------------------- */

async function webglAvailable(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const probe = document.createElement('canvas');
    try {
      return Boolean(probe.getContext('webgl2') ?? probe.getContext('webgl'));
    } catch {
      return false;
    }
  });
}

/**
 * Navigasi + siap-halaman. Dipisah dari `waitSceneReady` supaya probe WebGL
 * (yang memutuskan `test.skip`) berjalan sebelum menunggu kanvas 3D.
 */
async function gotoLanding(page: Page, viewport: Viewport): Promise<void> {
  await page.setViewportSize(viewport);
  await page.goto('/');
  await page.waitForFunction(
    () => document.documentElement.dataset.ready === 'true',
    undefined,
    { timeout: 45_000 },
  );
}

async function waitSceneReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => window.__asiakin_map48?.ready === true,
    undefined,
    { timeout: 45_000 },
  );
}

/** Sapu seluruh dokumen sekali supaya ScrollTrigger menyelesaikan geometrinya. */
async function sweepDocument(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    for (let step = 0; step <= 16; step += 1) {
      window.scrollTo(0, Math.round((max * step) / 16));
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 40);
      });
    }
    window.scrollTo(0, 0);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 120);
    });
  });
}

type SceneGeometry = { top: number; height: number; viewport: number };

async function sceneGeometry(page: Page, scene: string): Promise<SceneGeometry> {
  const geometry = await page.evaluate((name) => {
    const element = document.querySelector(`.landing-scene--${name}`);
    if (!element) {
      return null;
    }
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: rect.height,
      viewport: window.innerHeight,
    };
  }, scene);
  if (geometry === null) {
    throw new Error(`scene .landing-scene--${scene} tidak ditemukan di DOM`);
  }
  return geometry;
}

/** Posisi gulir kanonik di dalam satu scene (0..1 dari jarak pin). */
async function scrollToScene(
  page: Page,
  scene: string,
  fraction: number,
): Promise<SceneGeometry> {
  const geometry = await sceneGeometry(page, scene);
  const travel = Math.max(0, geometry.height - geometry.viewport);
  const target = Math.round(geometry.top + travel * fraction);
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'instant' });
  }, target);
  // Satu settle berbasis waktu, bukan rAF: dengan beberapa konteks paralel
  // rAF bisa ditahan dan dua rAF berturut-turut menggantung sampai timeout.
  await page.waitForTimeout(260);
  return geometry;
}

/** Scene pinned perlu dua posisi; scene setinggi viewport cukup satu. */
function sampleFractions(geometry: SceneGeometry): number[] {
  const travel = geometry.height - geometry.viewport;
  return travel > 40 ? [0.4, 0.65] : [0.5];
}

/**
 * Ukur kotak tinta satu kanvas scene 3D.
 * `recenter` memusatkan kanvas dulu supaya tangkapan tidak terpotong tepi
 * viewport (dipakai gate 1); gate 3 memakai posisi gulir hasil pengukuran.
 */
async function canvasInk(
  page: Page,
  scene: string,
  recenter: boolean,
): Promise<{ clip: Rect; ink: InkReport; scrollY: number } | null> {
  const canvas = page
    .locator(`.landing-scene--${scene} .landing-asia__stage canvas`)
    .first();
  if ((await canvas.count()) === 0) {
    return null;
  }
  const viewport = page.viewportSize();
  if (viewport === null) {
    return null;
  }

  if (recenter) {
    const box = await canvas.boundingBox();
    if (box !== null && (box.y < 0 || box.y + box.height > viewport.height)) {
      const delta = Math.round(box.y + box.height / 2 - viewport.height / 2);
      await page.evaluate((dy) => {
        window.scrollBy(0, dy);
      }, delta);
      await page.waitForTimeout(180);
    }
  }

  const scrollY = await page.evaluate(() => window.scrollY);
  const report = await page.evaluate((name) => {
    const sceneObj = window.__asiakin_map48;
    if (!sceneObj || !sceneObj.ready || !sceneObj.measureInk) {
      return null;
    }
    const canvasElement = document.querySelector<HTMLCanvasElement>(
      `.landing-scene--${name} .landing-asia__stage canvas`,
    );
    if (!canvasElement) {
      return null;
    }
    const gl =
      canvasElement.getContext('webgl2') ?? canvasElement.getContext('webgl');
    if (!gl) {
      return null;
    }

    // measureInk memicu render benua tanpa ground
    sceneObj.measureInk();

    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    const pixels = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    let leftCovered = 0;
    let rightCovered = 0;
    let topCovered = 0;
    let bottomCovered = 0;
    let inkPixels = 0;
    let minX = width;
    let maxX = -1;
    let minY = height;
    let maxY = -1;

    // Lebar pita 2 CSS px dihitung ke resolusi drawingBuffer
    const dpr = window.devicePixelRatio || 1;
    const band = Math.max(1, Math.round(2 * dpr));

    for (let y = 0; y < height; y += 1) {
      let rowLeft = false;
      let rowRight = false;
      const rowOffset = y * width * 4;
      for (let x = 0; x < width; x += 1) {
        const alpha = pixels[rowOffset + x * 4 + 3] ?? 0;
        if (alpha > 10) {
          inkPixels += 1;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
          if (x < band) rowLeft = true;
          if (x >= width - band) rowRight = true;
          if (y < band) bottomCovered += 1;
          if (y >= height - band) topCovered += 1;
        }
      }
      if (rowLeft) leftCovered += 1;
      if (rowRight) rightCovered += 1;
    }

    const rect = canvasElement.getBoundingClientRect();
    const clip: Rect = {
      x: Math.round(rect.left),
      y: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    };

    const ink: InkReport = {
      width,
      height,
      channels: 4,
      bg: { r: 249, g: 247, b: 243 },
      bgDeltaFromPage: 0,
      edge: {
        left: height > 0 ? leftCovered / height : 0,
        right: height > 0 ? rightCovered / height : 0,
        top: width * band > 0 ? topCovered / (width * band) : 0,
        bottom: width * band > 0 ? bottomCovered / (width * band) : 0,
      },
      bbox: {
        x0: minX <= maxX ? minX : 0,
        y0: minY <= maxY ? height - 1 - maxY : 0,
        x1: minX <= maxX ? maxX + 1 : 0,
        y1: minY <= maxY ? height - minY : 0,
      },
      inkPixels,
    };

    return { clip, ink };
  }, scene);

  if (report === null) {
    return null;
  }
  return { ...report, scrollY };
}

/**
 * Kotak tinta kanvas dalam koordinat viewport. Dipakai gate 2 & 3: yang bisa
 * ditabrak teks adalah siluet yang digambar, bukan kotak elemen kanvas yang
 * sebagian besar transparan.
 */
async function canvasInkRect(page: Page, scene: string): Promise<Rect | null> {
  if (scene !== 'hero') {
    return null;
  }
  await page
    .waitForFunction(
      () => Boolean(window.__asiakin_map48?.ready),
      undefined,
      { timeout: 3000 },
    )
    .catch(() => {});

  return page.evaluate(() => {
    const sceneObj = window.__asiakin_map48;
    if (!sceneObj || !sceneObj.ready || !sceneObj.measureInk) {
      return null;
    }
    const ink = sceneObj.measureInk();
    if (ink === null || ink.widthPx <= 0 || ink.heightPx <= 0) {
      return null;
    }
    const left = Math.max(ink.left, 0);
    const top = Math.max(ink.top, 0);
    const right = Math.min(ink.right, window.innerWidth);
    const bottom = Math.min(ink.bottom, window.innerHeight);
    if (right - left < 1 || bottom - top < 1) {
      return null;
    }
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  });
}

/* ------------------------------------------------------------------------- *
 * Fungsi browser-side (self-contained: tanpa closure Node)
 * ------------------------------------------------------------------------- */

function collectSceneGeometry(scene: string): CollectedScene {
  const root = document.querySelector(`.landing-scene--${scene}`);
  const empty: CollectedScene = { texts: [], visuals: [] };
  if (!root) {
    return empty;
  }

  const opacityOf = (element: Element): number => {
    let value = 1;
    let node: Element | null = element;
    while (node) {
      const style = getComputedStyle(node);
      if (style.display === 'none' || style.visibility === 'hidden') {
        return 0;
      }
      value *= Number(style.opacity);
      if (value <= 0.001) {
        return 0;
      }
      node = node.parentElement;
    }
    return value;
  };

  /** Koordinat viewport, dipotong ke layar (yang benar-benar terlihat). */
  const toViewportRect = (rect: {
    left: number;
    top: number;
    right: number;
    bottom: number;
  }): CollectedRect | null => {
    const left = Math.max(rect.left, 0);
    const top = Math.max(rect.top, 0);
    const right = Math.min(rect.right, window.innerWidth);
    const bottom = Math.min(rect.bottom, window.innerHeight);
    if (right - left < 1 || bottom - top < 1) {
      return null;
    }
    return {
      x: left,
      y: top,
      width: right - left,
      height: bottom - top,
    };
  };

  const candidates: HTMLElement[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (
    let node = walker.nextNode();
    node !== null;
    node = walker.nextNode()
  ) {
    const value = (node.textContent ?? '').trim();
    if (value.length === 0) {
      continue;
    }
    const parent = node.parentElement;
    if (!parent) {
      continue;
    }
    if (parent.closest('.visually-hidden')) {
      continue;
    }
    if (!candidates.includes(parent)) {
      candidates.push(parent);
    }
  }

  const texts: CollectedText[] = [];
  for (const element of candidates) {
    // Simpan hanya elemen terluar: teks di dalam <span> pada <h2> bukan
    // blok terpisah dan tidak boleh dihitung sebagai tabrakan.
    const nested = candidates.some(
      (other) => other !== element && element.contains(other),
    );
    if (nested) {
      continue;
    }
    if (opacityOf(element) <= 0.05) {
      continue;
    }
    const rect = toViewportRect(element.getBoundingClientRect());
    if (rect === null) {
      continue;
    }
    texts.push({
      text: (element.textContent ?? '').replace(/\s+/g, ' ').trim(),
      tag: element.tagName.toLowerCase(),
      rect,
    });
  }

  const visuals: CollectedVisual[] = [];
  for (const element of root.querySelectorAll('canvas, img, video, svg')) {
    // Medan tanah hero adalah latar kertas, bukan siluet yang bisa ditabrak.
    if (element.closest('.landing-hero__ground')) {
      continue;
    }
    if (opacityOf(element) <= 0.05) {
      continue;
    }
    const tag = element.tagName.toLowerCase();

    if (tag === 'svg') {
      const frame = element.getBoundingClientRect();
      if (frame.width < 1 || frame.height < 1) {
        continue;
      }
      let union: {
        left: number;
        top: number;
        right: number;
        bottom: number;
      } | null = null;
      for (const shape of element.querySelectorAll(
        'path, circle, ellipse, rect, polygon, polyline, line',
      )) {
        const rect = shape.getBoundingClientRect();
        if (rect.width < 0.5 || rect.height < 0.5) {
          continue;
        }
        // Tinta SVG terpotong oleh viewport svg (mis. `fit: slice`).
        const left = Math.max(rect.left, frame.left);
        const top = Math.max(rect.top, frame.top);
        const right = Math.min(rect.right, frame.right);
        const bottom = Math.min(rect.bottom, frame.bottom);
        if (right - left < 0.5 || bottom - top < 0.5) {
          continue;
        }
        union =
          union === null
            ? { left, top, right, bottom }
            : {
                left: Math.min(union.left, left),
                top: Math.min(union.top, top),
                right: Math.max(union.right, right),
                bottom: Math.max(union.bottom, bottom),
              };
      }
      if (union === null) {
        continue;
      }
      const rect = toViewportRect(union);
      if (rect !== null) {
        visuals.push({ kind: 'svg', rect });
      }
      continue;
    }

    if (tag === 'img' && element instanceof HTMLImageElement) {
      if (element.naturalWidth === 0) {
        continue;
      }
    }

    const rect = toViewportRect(element.getBoundingClientRect());
    if (rect === null) {
      continue;
    }
    const kind: CollectedVisual['kind'] =
      tag === 'canvas' ? 'canvas' : tag === 'img' ? 'img' : 'video';
    visuals.push({ kind, rect });
  }

  return { texts, visuals };
}

function landingSceneNames(): string[] {
  const names: string[] = [];
  for (const element of document.querySelectorAll('.landing-scene')) {
    const token = /landing-scene--([a-z0-9-]+)/.exec(
      element.getAttribute('class') ?? '',
    );
    const name = token?.[1];
    if (name && !names.includes(name)) {
      names.push(name);
    }
  }
  return names;
}

function hoverCountryPositions(ids: string[]): Array<{
  id: string;
  x: number;
  y: number;
  host: string;
}> {
  const scene = window.__asiakin_map48;
  const canvas = document.querySelector<HTMLCanvasElement>(
    '.landing-scene--hero .landing-asia__stage canvas',
  );
  if (!scene || !canvas) {
    return [];
  }
  const frame = canvas.getBoundingClientRect();
  const inset = 8;
  const result: Array<{ id: string; x: number; y: number; host: string }> = [];
  for (const id of ids) {
    const point = scene.projected(id);
    if (!point) {
      continue;
    }
    if (
      point.x < frame.left + inset ||
      point.x > frame.right - inset ||
      point.y < frame.top + inset ||
      point.y > frame.bottom - inset
    ) {
      continue;
    }
    const hit = document.elementFromPoint(point.x, point.y);
    result.push({
      id,
      x: point.x,
      y: point.y,
      host:
        hit === null
          ? 'null'
          : `${hit.tagName.toLowerCase()}.${(hit.getAttribute('class') ?? '')
              .split(' ')
              .filter(Boolean)
              .join('.')}`,
    });
  }
  return result;
}

/* ------------------------------------------------------------------------- *
 * Gate 1 — tepi lurus
 * ------------------------------------------------------------------------- */

test.describe('gate 1: tepi lurus', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'Ketiga viewport diatur eksplisit di dalam tes; proyek mobile akan menduplikasi.',
  );

  test('kanvas 3D tidak menyentuh tepi kanvas di hero', async ({ page }) => {
    test.setTimeout(180_000);

    await gotoLanding(page, VIEWPORTS[0]);
    const hasWebgl = await webglAvailable(page);
    test.skip(
      !hasWebgl,
      'Browser tidak punya konteks WebGL: kanvas 3D tidak dirender, gerbang tepi tidak berlaku.',
    );
    await waitSceneReady(page);

    const failures: string[] = [];

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await sweepDocument(page);

      for (const scene of CANVAS_SCENES) {
        const geometry = await scrollToScene(page, scene, 0.5);
        if (geometry.height < 1) {
          failures.push(`${viewport.width} ${scene}: scene tidak punya tinggi`);
          continue;
        }
        const state = await page.evaluate((name) => {
          const root = document.querySelector(`.landing-scene--${name}`);
          return root?.querySelector('.landing-asia')?.getAttribute('data-state') ?? 'none';
        }, scene);

        const measured = await canvasInk(page, scene, true);
        if (measured === null) {
          failures.push(
            `${viewport.width} ${scene}: kanvas 3D tidak ada (data-state=${state})`,
          );
          console.log(
            `[gate1] ${viewport.width} ${scene.padEnd(10)} canvas=TIDAK ADA data-state=${state}`,
          );
          continue;
        }

        const { ink } = measured;
        const bboxWidth = ink.bbox.x1 - ink.bbox.x0;
        const bboxHeight = ink.bbox.y1 - ink.bbox.y0;
        console.log(
          `[gate1] ${viewport.width} ${scene.padEnd(10)} canvas=${ink.width}x${ink.height} ` +
            `bg=${ink.bg.r},${ink.bg.g},${ink.bg.b} dirujuk=${ink.bgDeltaFromPage} ` +
            `edge L=${pct(ink.edge.left)} R=${pct(ink.edge.right)} ` +
            `T=${pct(ink.edge.top)} B=${pct(ink.edge.bottom)} ` +
            `ink=${bboxWidth}x${bboxHeight} px=${ink.inkPixels} state=${state}`,
        );

        if (bboxWidth <= 0 || bboxHeight <= 0) {
          failures.push(
            `${viewport.width} ${scene}: kotak tinta ${bboxWidth}x${bboxHeight} (tidak ada yang dirender)`,
          );
          continue;
        }

        const edges: Array<[string, number]> = [
          ['kiri', ink.edge.left],
          ['kanan', ink.edge.right],
          ['atas', ink.edge.top],
          ['bawah', ink.edge.bottom],
        ];
        for (const [name, value] of edges) {
          if (value > EDGE_INK_LIMIT) {
            failures.push(
              `${viewport.width} ${scene}: tepi ${name} ${pct(value)} > ${pct(EDGE_INK_LIMIT)}`,
            );
          }
        }
      }
    }

    expect(failures, `\n${failures.join('\n')}`).toEqual([]);
  });
});

/* ------------------------------------------------------------------------- *
 * Gate 2 — overlap
 * ------------------------------------------------------------------------- */

test.describe('gate 2: overlap', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'Ketiga viewport diatur eksplisit di dalam tes; proyek mobile akan menduplikasi.',
  );

  test('blok teks tidak beririsan dengan siluet, peta, foto, atau teks lain', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    const failures: string[] = [];
    await gotoLanding(page, VIEWPORTS[0]);
    await waitSceneReady(page);

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await sweepDocument(page);

      const scenes = await page.evaluate(landingSceneNames);

      for (const scene of scenes) {
        const geometry = await sceneGeometry(page, scene);
        const offenders = new Set<string>();
        let textCount = 0;
        let visualCount = 0;

        for (const fraction of sampleFractions(geometry)) {
          await scrollToScene(page, scene, fraction);
          const collected = await page.evaluate(collectSceneGeometry, scene);
          // Kanvas diganti kotak tintanya: elemen kanvas selebar scene hampir
          // selalu "menabrak" teks di area transparan, dan itu bukan tabrakan
          // visual (sama seperti SVG yang diukur dari bentuk, bukan frame).
          const inkRect = await canvasInkRect(page, scene);
          const visuals = collected.visuals.map((visual) =>
            visual.kind === 'canvas' && inkRect !== null
              ? { kind: visual.kind, rect: inkRect }
              : visual,
          );
          textCount = Math.max(textCount, collected.texts.length);
          visualCount = Math.max(visualCount, visuals.length);

          for (const text of collected.texts) {
            for (const visual of visuals) {
              const area = intersectArea(text.rect, visual.rect);
              if (area > OVERLAP_MIN_AREA_PX2) {
                offenders.add(
                  `${viewport.width} ${scene}@${fraction}: teks(${text.tag} "${text.text.slice(0, 40)}") ∩ ${visual.kind} ` +
                    `luas=${fmt(area)}px² teks=[${fmtRect(text.rect)}] ${visual.kind}=[${fmtRect(visual.rect)}]`,
                );
              }
            }
          }

          for (let i = 0; i < collected.texts.length; i += 1) {
            const a = collected.texts[i];
            if (!a) continue;
            for (let j = i + 1; j < collected.texts.length; j += 1) {
              const b = collected.texts[j];
              if (!b) continue;
              const area = intersectArea(a.rect, b.rect);
              if (area > OVERLAP_MIN_AREA_PX2) {
                offenders.add(
                  `${viewport.width} ${scene}@${fraction}: teks("${a.text.slice(0, 30)}") ∩ teks("${b.text.slice(0, 30)}") ` +
                    `luas=${fmt(area)}px² a=[${fmtRect(a.rect)}] b=[${fmtRect(b.rect)}]`,
                );
              }
            }
          }
        }

        console.log(
          `[gate2] ${viewport.width} ${scene.padEnd(12)} teks=${String(textCount).padStart(2)} ` +
            `visual=${String(visualCount).padStart(2)} tabrakan=${offenders.size}`,
        );
        for (const offender of offenders) {
          console.log(`         ✗ ${offender}`);
          failures.push(offender);
        }
      }
    }

    expect(failures, `\n${failures.join('\n')}`).toEqual([]);
  });
});

/* ------------------------------------------------------------------------- *
 * Gate 3 — isi layar
 * ------------------------------------------------------------------------- */

test.describe('gate 3: isi layar', () => {
  test.skip(
    ({ isMobile }) => isMobile,
    'Ketiga viewport diatur eksplisit di dalam tes; proyek mobile akan menduplikasi.',
  );

  test('kotak tinta gabungan setiap scene ≥ 70% tinggi viewport', async ({
    page,
  }) => {
    test.setTimeout(180_000);

    await gotoLanding(page, VIEWPORTS[0]);
    const hasWebgl = await webglAvailable(page);
    test.skip(
      !hasWebgl,
      'Browser tidak punya konteks WebGL: kotak tinta kanvas tidak bisa diukur.',
    );
    await waitSceneReady(page);

    const failures: string[] = [];

    for (const viewport of VIEWPORTS) {
      await page.setViewportSize(viewport);
      await sweepDocument(page);

      for (const scene of LANDING_SCENES) {
        const exists = await page.evaluate((name) => {
          return document.querySelector(`.landing-scene--${name}`) !== null;
        }, scene);
        if (!exists) {
          failures.push(`${viewport.width} ${scene}: scene tidak ada di DOM`);
          console.log(
            `[gate3] ${viewport.width} ${scene.padEnd(10)} unionHvh=0.000 scene=TIDAK ADA`,
          );
          continue;
        }

        const geometry = await sceneGeometry(page, scene);
        let best = { ratio: 0, top: 0, bottom: 0, fraction: 0 };
        const samples: string[] = [];

        for (const fraction of sampleFractions(geometry)) {
          await scrollToScene(page, scene, fraction);
          const collected = await page.evaluate(collectSceneGeometry, scene);

          const rects: Rect[] = [];
          for (const text of collected.texts) {
            rects.push(text.rect);
          }
          for (const visual of collected.visuals) {
            if (visual.kind === 'canvas') {
              continue;
            }
            rects.push(visual.rect);
          }

          const canvasRect = await canvasInkRect(page, scene);
          if (canvasRect !== null) {
            rects.push(canvasRect);
          }

          if (rects.length === 0) {
            samples.push(`${fraction}:kosong`);
            continue;
          }

          let left = Number.POSITIVE_INFINITY;
          let top = Number.POSITIVE_INFINITY;
          let right = Number.NEGATIVE_INFINITY;
          let bottom = Number.NEGATIVE_INFINITY;
          for (const rect of rects) {
            left = Math.min(left, rect.x);
            top = Math.min(top, rect.y);
            right = Math.max(right, rect.x + rect.width);
            bottom = Math.max(bottom, rect.y + rect.height);
          }

          const bandTop = Math.max(top, 0);
          const bandBottom = Math.min(bottom, geometry.viewport);
          const ratio =
            bandBottom > bandTop
              ? (bandBottom - bandTop) / geometry.viewport
              : 0;

          samples.push(`${fraction}:${ratio.toFixed(2)}`);
          if (ratio > best.ratio) {
            best = { ratio, top: bandTop, bottom: bandBottom, fraction };
          }
        }

        console.log(
          `[gate3] ${viewport.width} ${scene.padEnd(10)} unionHvh=${best.ratio.toFixed(3)} ` +
            `top=${Math.round(best.top)} bottom=${Math.round(best.bottom)} ` +
            `(sampel ${samples.join(' ')} vh=${geometry.viewport})`,
        );

        if (best.ratio < MIN_UNION_VH) {
          failures.push(
            `${viewport.width} ${scene}: unionHvh=${best.ratio.toFixed(3)} < ${MIN_UNION_VH} ` +
              `top=${Math.round(best.top)} bottom=${Math.round(best.bottom)} (sampel ${samples.join(' ')})`,
          );
        }
      }
    }

    expect(failures, `\n${failures.join('\n')}`).toEqual([]);
  });
});

/* ------------------------------------------------------------------------- *
 * Gate 4 — hover stabil
 * ------------------------------------------------------------------------- */

test.describe('gate 4: hover stabil', () => {
  test.skip(
    ({ isMobile, hasTouch }) => isMobile || hasTouch,
    'Hover hanya bermakna pada pointer desktop (hasTouch=false).',
  );

  test('sapuan 8 negara dalam 600 ms: label tidak berkedip dan tidak terpotong', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await gotoLanding(page, { width: 1440, height: 900 });
    const hasWebgl = await webglAvailable(page);
    test.skip(
      !hasWebgl,
      'Browser tidak punya konteks WebGL: benua interaktif tidak dirender.',
    );
    await waitSceneReady(page);

    await sweepDocument(page);
    await scrollToScene(page, 'hero', 0.5);
    await page.waitForFunction(
      () => window.__asiakin_map48?.ready === true,
      undefined,
      { timeout: 45_000 },
    );
    await page.waitForTimeout(700);

    const sceneOpacity = await page.evaluate(() => {
      const root = document.querySelector('.landing-scene--hero');
      const target = root?.querySelector('.landing-asia__stage') ?? root;
      if (!target) {
        return 0;
      }
      return Number(getComputedStyle(target).opacity);
    });
    expect(
      sceneOpacity,
      'benua interaktif tidak terlihat; hover tidak bisa diuji',
    ).toBeGreaterThan(0.05);

    const renderer = await page.evaluate(() => {
      const probe = document.createElement('canvas');
      const gl = probe.getContext('webgl2') ?? probe.getContext('webgl');
      if (!gl) {
        return 'tanpa-webgl';
      }
      const info = gl.getExtension('WEBGL_debug_renderer_info');
      return info === null
        ? 'tak-diketahui'
        : String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL));
    });

    const anchors = await page.evaluate(
      hoverCountryPositions,
      HOVER_ORDER.slice(),
    );
    expect(
      anchors.length,
      `jangkar negara tidak lengkap: ${JSON.stringify(anchors)}`,
    ).toBe(HOVER_ORDER.length);

    /*
     * Titik sapuan diverifikasi dengan hover sungguhan: label harus menampilkan
     * negara yang dimaksud. Ini memisahkan cacat produk (label salah/tidak
     * muncul) dari masalah harness (titik jangkar meleset dari siluet).
     */
    const points: Array<{ id: string; x: number; y: number }> = [];
    const offsets: Record<string, { dx: number; dy: number }> = {};
    const unresolved: string[] = [];
    for (const anchor of anchors) {
      const expected = COUNTRY_NAMES[anchor.id] ?? '';
      let resolved: { x: number; y: number; dx: number; dy: number } | null = null;
      for (const [dx, dy] of HOVER_PROBE_OFFSETS) {
        const x = Math.round(anchor.x + dx);
        const y = Math.round(anchor.y + dy);
        await page.mouse.move(x, y);
        try {
          await page.waitForFunction(
            (nama) => {
              const label = document.querySelector('.country-label.is-visible');
              if (label === null) {
                return false;
              }
              const text = label.querySelector('.country-label__name');
              return (text?.textContent ?? '') === nama;
            },
            expected,
            { timeout: 600, polling: 16 },
          );
          resolved = { x, y, dx, dy };
          break;
        } catch {
          // Titik ini tidak mengenai siluet (atau kena negara lain); coba offset berikutnya.
        }
      }
      if (resolved === null) {
        unresolved.push(`${anchor.id} (jangkar ${Math.round(anchor.x)},${Math.round(anchor.y)})`);
        continue;
      }
      points.push({ id: anchor.id, x: resolved.x, y: resolved.y });
      offsets[anchor.id] = { dx: resolved.dx, dy: resolved.dy };
    }

    console.log(
      `[gate4] renderer=${renderer} jangkar=${anchors.length}/${HOVER_ORDER.length} ` +
        `terverifikasi=${points.length}/${HOVER_ORDER.length} ` +
        JSON.stringify(points.map((point) => `${point.id}@${point.x},${point.y}`)),
    );
    expect(
      unresolved,
      `titik hover tidak menampilkan label negara yang benar: ${unresolved.join(', ')}`,
    ).toEqual([]);

    // Mulai dari kondisi diam: pointer di luar kanvas, label tersembunyi,
    // supaya perubahan pertama yang terukur berasal dari sapuan.
    await page.mouse.move(5, 5);
    await page.waitForFunction(
      () => document.querySelector('.country-label.is-visible') === null,
      undefined,
      { timeout: 5_000, polling: 16 },
    );

    await page.evaluate(() => {
      const sceneRoot = document.querySelector('.landing-scene--hero');
      const canvas = document.querySelector(
        '.landing-scene--hero .landing-asia__stage canvas',
      );
      const store: {
        samples: HoverSample[];
        t0: number;
        sweepEnd: number;
        pointer: { x: number; y: number };
      } = {
        samples: [],
        t0: performance.now(),
        sweepEnd: 0,
        pointer: { x: -1, y: -1 },
      };
      (window as unknown as { __round4Hover?: typeof store }).__round4Hover =
        store;

      canvas?.addEventListener('pointermove', (event) => {
        const pointerEvent = event as PointerEvent;
        store.pointer = { x: pointerEvent.clientX, y: pointerEvent.clientY };
      });

      const read = () => {
        const label = document.querySelector<HTMLElement>('.country-label.is-visible');
        const idNode = label?.querySelector('.country-label__name') ?? null;
        const visible = label !== null;
        let rect: CollectedRect | null = null;
        let insideViewport = true;
        let insideScene = true;
        if (label !== null && visible) {
          const box = label.getBoundingClientRect();
          rect = { x: box.left, y: box.top, width: box.width, height: box.height };
          insideViewport =
            box.left >= -0.5 &&
            box.top >= -0.5 &&
            box.right <= window.innerWidth + 0.5 &&
            box.bottom <= window.innerHeight + 0.5;
          if (sceneRoot) {
            const frame = sceneRoot.getBoundingClientRect();
            insideScene =
              box.left >= frame.left - 0.5 &&
              box.top >= frame.top - 0.5 &&
              box.right <= frame.right + 0.5 &&
              box.bottom <= frame.bottom + 0.5;
          }
        }
        const visibleLabels = document.querySelectorAll(
          '.country-label.is-visible',
        ).length;
        store.samples.push({
          t: performance.now() - store.t0,
          visible,
          text: (label?.textContent ?? '').replace(/\s+/g, ' ').trim(),
          idText: (idNode?.textContent ?? '').trim(),
          visibleLabels,
          rect,
          insideViewport,
          insideScene,
        });
      };

      const timer = window.setInterval(read, 16);
      (window as unknown as { __round4Timer?: number }).__round4Timer = timer;
    });

    const sweepStart = Date.now();
    const freshAnchors = await page.evaluate(
      hoverCountryPositions,
      HOVER_ORDER.slice(),
    );
    const sweepPoints = freshAnchors.map((anchor) => {
      const off = offsets[anchor.id] ?? { dx: 0, dy: 0 };
      return {
        id: anchor.id,
        x: Math.round(anchor.x + off.dx),
        y: Math.round(anchor.y + off.dy),
      };
    });
    const firstPoint = sweepPoints[0];
    const lastPoint = sweepPoints[sweepPoints.length - 1];
    if (!firstPoint || !lastPoint) {
      throw new Error('titik sapuan tidak lengkap');
    }
    await page.mouse.move(firstPoint.x, firstPoint.y);

    // Dua langkah interpolasi per segmen: jalur tetap kontinu tapi total
    // perpindahan cukup sedikit untuk menyapu 8 negara di bawah 600 ms
    // (tiap `mouse.move` memakan satu round-trip CDP).
    const STEPS_PER_SEGMENT = 2;
    for (let index = 1; index < sweepPoints.length; index += 1) {
      const from = sweepPoints[index - 1];
      const to = sweepPoints[index];
      if (!from || !to) {
        continue;
      }
      for (let step = 1; step <= STEPS_PER_SEGMENT; step += 1) {
        const local = step / STEPS_PER_SEGMENT;
        await page.mouse.move(
          Math.round(from.x + (to.x - from.x) * local),
          Math.round(from.y + (to.y - from.y) * local),
        );
      }
    }
    const sweepMs = Date.now() - sweepStart;

    const sweepEnd = await page.evaluate(() => {
      const store = (
        window as unknown as { __round4Hover?: { t0: number; sweepEnd: number } }
      ).__round4Hover;
      if (!store) {
        return 0;
      }
      store.sweepEnd = performance.now() - store.t0;
      return store.sweepEnd;
    });

    await page.waitForTimeout(HOVER_TAIL_MS);

    const collected = await page.evaluate(() => {
      const store = (
        window as unknown as {
          __round4Hover?: {
            samples: HoverSample[];
            pointer: { x: number; y: number };
          };
        }
      ).__round4Hover;
      const timer = (window as unknown as { __round4Timer?: number })
        .__round4Timer;
      if (timer !== undefined) {
        window.clearInterval(timer);
      }
      return {
        samples: store?.samples ?? [],
        pointer: store?.pointer ?? { x: -1, y: -1 },
      };
    });
    const samples = collected.samples;

    // Perubahan dihitung pada (terlihat, nama negara): label yang menyembunyikan
    // diri lalu muncul lagi dengan teks sama tetap dihitung berkedip.
    const stateOf = (sample: HoverSample): string =>
      sample.visible ? sample.idText : '∅';

    const changes: Array<{ t: number; from: string; to: string }> = [];
    for (let i = 1; i < samples.length; i += 1) {
      const current = samples[i];
      const previous = samples[i - 1];
      if (!current || !previous) {
        continue;
      }
      if (stateOf(current) !== stateOf(previous)) {
        changes.push({
          t: current.t,
          from: stateOf(previous),
          to: stateOf(current),
        });
      }
    }

    let busiest = { count: 0, at: 0 };
    for (const change of changes) {
      let count = 0;
      for (const other of changes) {
        if (other.t >= change.t && other.t < change.t + HOVER_CHANGE_WINDOW_MS) {
          count += 1;
        }
      }
      if (count > busiest.count) {
        busiest = { count, at: change.t };
      }
    }

    const doubleLabels = samples.filter((sample) => sample.visibleLabels > 1);
    const clipped = samples.filter(
      (sample) => sample.visible && (!sample.insideViewport || !sample.insideScene),
    );
    const tail = samples.filter((sample) => sample.t >= sweepEnd);
    const tailChanges = tail.filter(
      (sample, index) =>
        index > 0 &&
        tail[index - 1] !== undefined &&
        stateOf(sample) !== stateOf(tail[index - 1] as HoverSample),
    );
    const last = samples[samples.length - 1];
    const tailWindow = tail.filter((sample) => sample.t >= sweepEnd + 200);
    const stabilityChanges = tailWindow.filter(
      (sample, index) =>
        index > 0 &&
        tailWindow[index - 1] !== undefined &&
        stateOf(sample) !== stateOf(tailWindow[index - 1] as HoverSample),
    );

    console.log(
      `[gate4] sampel=${samples.length} sapuan=${sweepMs}ms perubahan=${changes.length} ` +
        `maks/80ms=${busiest.count}@${Math.round(busiest.at)} labelGanda=${doubleLabels.length} ` +
        `terpotong=${clipped.length} akhir=${last?.visible ? `"${last.idText}"` : 'tersembunyi'} ` +
        `pointer=${Math.round(collected.pointer.x)},${Math.round(collected.pointer.y)} tail=${tailChanges.length}`,
    );
    if (sweepMs > HOVER_SWEEP_MS) {
      console.log(
        `[gate4] ⚠ sapuan ${sweepMs}ms melewati ${HOVER_SWEEP_MS}ms: batas throughput CDP, bukan perilaku label`,
      );
    }
    for (const change of changes) {
      console.log(
        `         · ${Math.round(change.t)}ms "${change.from.slice(0, 24)}" → "${change.to.slice(0, 24)}"`,
      );
    }
    for (const sample of clipped.slice(0, 4)) {
      console.log(
        `         ✗ label terpotong @${Math.round(sample.t)}ms rect=${sample.rect ? fmtRect(sample.rect) : 'null'} ` +
          `viewport=${sample.insideViewport} scene=${sample.insideScene}`,
      );
    }

    expect(
      busiest.count,
      `>1 perubahan label dalam ${HOVER_CHANGE_WINDOW_MS} ms (${busiest.count} pada ${Math.round(busiest.at)} ms)`,
    ).toBeLessThanOrEqual(1);
    expect(
      doubleLabels.length,
      `${doubleLabels.length} sampel dengan lebih dari satu label terlihat`,
    ).toBe(0);
    expect(
      clipped.length,
      `label keluar batas pada ${clipped.length} sampel`,
    ).toBe(0);
    expect(
      tailChanges.length,
      `label berubah ${tailChanges.length} kali setelah sapuan berakhir (maks 1 untuk histeresis 130 ms)`,
    ).toBeLessThanOrEqual(1);
    expect(
      stabilityChanges.length,
      `label tidak stabil pada 200 ms terakhir (${stabilityChanges.length} perubahan)`,
    ).toBe(0);

    const lastId = HOVER_ORDER[HOVER_ORDER.length - 1] ?? '';
    const expected = COUNTRY_NAMES[lastId] ?? '';
    expect(
      last?.visible,
      `label tidak tampil ${HOVER_TAIL_MS} ms setelah sapuan berhenti di ${lastId} (${expected}); ` +
        `pointer=${Math.round(collected.pointer.x)},${Math.round(collected.pointer.y)}`,
    ).toBe(true);
    expect(
      last?.idText,
      `label akhir "${last?.idText ?? ''}" bukan "${expected}" (pointer=` +
        `${Math.round(collected.pointer.x)},${Math.round(collected.pointer.y)})`,
    ).toBe(expected);
    expect(
      Object.values(COUNTRY_NAMES),
      `label akhir "${last?.idText ?? ''}" bukan nama negara yang disapu`,
    ).toContain(last?.idText ?? '');
  });
});
