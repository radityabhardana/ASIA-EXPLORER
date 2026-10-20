/*
 * Deteksi WebGL — aman dipanggil kapan pun, tidak pernah melempar error.
 * Hasil di-cache supaya tidak membuat canvas/context baru setiap render.
 *
 * Pemakai: hero 3D memilih jalur WebGL2 -> WebGL1 -> SVG fallback.
 */

export type WebGLTier = 'webgl2' | 'webgl' | 'none';

let cachedTier: WebGLTier | null = null;

function releaseContext(context: WebGLRenderingContext | WebGL2RenderingContext): void {
  try {
    context.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    // Context tetap dibuang oleh GC; kegagalan di sini tidak boleh mematikan app.
  }
}

function detect(): WebGLTier {
  if (typeof document === 'undefined') {
    return 'none';
  }

  let canvas: HTMLCanvasElement | null = null;
  try {
    canvas = document.createElement('canvas');
    const attributes: WebGLContextAttributes = {
      failIfMajorPerformanceCaveat: false,
      antialias: false,
      depth: true,
    };

    const webgl2 = canvas.getContext('webgl2', attributes);
    if (webgl2) {
      releaseContext(webgl2);
      return 'webgl2';
    }

    const webgl = canvas.getContext('webgl', attributes);
    if (webgl) {
      releaseContext(webgl);
      return 'webgl';
    }

    return 'none';
  } catch {
    return 'none';
  } finally {
    canvas = null;
  }
}

/** 'webgl2' | 'webgl' | 'none'. Hasil pertama di-cache. */
export function getWebGLTier(): WebGLTier {
  if (cachedTier === null) {
    cachedTier = detect();
  }
  return cachedTier;
}

export function isWebGLAvailable(): boolean {
  return getWebGLTier() !== 'none';
}

/** Hanya untuk unit test. */
export function resetWebGLTierCache(): void {
  cachedTier = null;
}
