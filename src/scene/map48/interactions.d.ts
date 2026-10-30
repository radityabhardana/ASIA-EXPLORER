import type { Camera, Object3D } from 'three';

export interface InteractionOptions {
  canvas: HTMLCanvasElement;
  camera: Camera;
  meshes: Object3D[];
  isReady: () => boolean;
  isBusy: () => boolean;
  onHoverChange: (country: unknown) => void;
  onCountryPick: (country: unknown) => void;
  onBackgroundPick: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export interface InteractionHandle {
  update(now: number): void;
  dispose(): void;
}

export function createInteraction(options: InteractionOptions): InteractionHandle;
