export interface PanelMapInstance {
  setVisited: (codes: string[]) => void;
  resize: () => void;
  destroy: () => void;
  /** Fly-to lembut ke negara (diabaikan saat prefers-reduced-motion). */
  focus: (code: string) => void;
  /** Kembali ke bingkai overview. */
  overview: () => void;
  /** Perbesar peta (zoom in) */
  zoomIn: () => void;
  /** Perkecil peta (zoom out) */
  zoomOut: () => void;
  /** Kembalikan orientasi ke arah Utara di Atas */
  resetNorth: () => void;
  /** Dapatkan sudut yaw kompas kamera dalam derajat */
  getHeading: () => number;
  /** Terbang ke koordinat tertentu */
  flyToCoord: (x: number, z: number, dist?: number) => void;
  /** Hentikan drift idle (mis. saat dialog negara terbuka). */
  setPaused: (value: boolean) => void;
  setAutoRotate: (value: boolean) => void;
}

export interface MountPanelMapOptions {
  visited?: string[];
  today?: string | null;
  onSelect?: (code: string | null) => void;
  /** Dipanggil saat hover berubah; null saat keluar dari semua negara. */
  onHover?: (code: string | null) => void;
  interactive?: boolean;
}

export function mountPanelMap(
  stage: HTMLElement,
  options?: MountPanelMapOptions,
): Promise<PanelMapInstance>;