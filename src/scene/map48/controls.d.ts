import type { Camera } from 'three';
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface WorldHalfBounds {
  halfX: number;
  halfZ: number;
}

export interface MapControls extends OrbitControls {
  targetBounds: {
    x: number;
    z: number;
  };
}

export function createControls(
  camera: Camera,
  domElement: HTMLElement,
  worldHalf: WorldHalfBounds,
): MapControls;

export function clampControlsTarget(controls: MapControls): void;
