import type { PerspectiveCamera, Vector3 } from 'three';

export interface OverviewPose {
  radius: number;
  phi: number;
  theta: number;
  target: Vector3;
}

export function getOverview(aspect?: number): OverviewPose;
export const OVERVIEW: OverviewPose;

export const easing: {
  linear: (t: number) => number;
  inOutCubic: (t: number) => number;
  outCubic: (t: number) => number;
};

export class CameraRig {
  camera: PerspectiveCamera;
  controls: {
    target: Vector3;
    enabled?: boolean;
    minDistance?: number;
    maxDistance?: number;
  };
  constructor(camera: PerspectiveCamera, controls: unknown);
  get moving(): boolean;
  stop(): void;
  place(pose: { radius: number; phi: number; theta: number; target?: Vector3 }): void;
  flyTo(
    pose: { radius?: number; phi?: number; theta?: number; target?: Vector3 },
    options?: { duration?: number; ease?: (t: number) => number; onComplete?: () => void },
  ): void;
  focusOn(meta: { center: Vector3; focusDist: number }, options?: unknown): void;
  zoom(step: number, options?: unknown): void;
  resetNorth(optionsOrCb?: unknown): void;
  getHeading(): number;
  flyToCoord(x: number, z: number, dist?: number, onComplete?: () => void): void;
  overview(optionsOrCb?: unknown): void;
}
