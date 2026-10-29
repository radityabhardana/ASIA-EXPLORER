import { describe, expect, it, vi } from 'vitest';
import { Color, MeshStandardMaterial, PerspectiveCamera, Vector3 } from 'three';
import { CameraRig, getOverview } from './camera-rig.js';
import { animateCountries } from './countries.js';
import { createInteraction } from './interactions.js';

describe('CameraRig heading and recenter', () => {
  it('calculates 0 degree heading when camera is at overview orientation', () => {
    const camera = new PerspectiveCamera(45, 16 / 9, 1, 1000);
    const controls = {
      target: new Vector3(0, 0, 0),
      enabled: true,
    };
    const rig = new CameraRig(camera, controls);
    const ov = getOverview(camera.aspect);
    rig.place(ov);

    const heading = rig.getHeading();
    expect(Math.abs(heading)).toBeLessThan(0.001);
  });

  it('normalizes heading to [-180, 180] degrees', () => {
    const camera = new PerspectiveCamera(45, 16 / 9, 1, 1000);
    const controls = {
      target: new Vector3(0, 0, 0),
      enabled: true,
    };
    const rig = new CameraRig(camera, controls);
    camera.position.set(200, 100, 0);
    controls.target.set(0, 0, 0);

    const heading = rig.getHeading();
    expect(heading).toBeGreaterThan(-180);
    expect(heading).toBeLessThanOrEqual(180);
  });

  it('stops in-flight tween and re-enables controls via stop()', () => {
    const camera = new PerspectiveCamera(45, 16 / 9, 1, 1000);
    const controls = {
      target: new Vector3(0, 0, 0),
      enabled: true,
    };
    const rig = new CameraRig(camera, controls);
    rig.overview({ duration: 2.0 });

    expect(rig.moving).toBe(true);
    expect(controls.enabled).toBe(false);

    rig.stop();

    expect(rig.moving).toBe(false);
    expect(controls.enabled).toBe(true);
  });
});

describe('countries tactile hover elevation', () => {
  it('elevates hovered country towards targetY = 1.0 with lerp 0.15', () => {
    const mat = new MeshStandardMaterial({ color: 0x999999, roughness: 0.44 });
    const country = {
      code: 'IDN',
      group: { position: { y: 0 } },
      mesh: {},
      material: mat,
      line: { material: { opacity: 0 } },
      baseColor: new Color(0x999999),
      hoverColor: new Color(0x333333),
      hoverS: 0,
      liftS: 0,
      riseK: 1,
      elevation: 0,
    };
    const list = [country];

    // Frame 1 with country hovered
    animateCountries(list, 0.016, country, null);

    // liftS should have moved: 0 + (1.0 - 0) * 0.15 = 0.15
    expect(country.liftS).toBeCloseTo(0.15, 3);
    expect(country.group.position.y).toBeCloseTo(0.15, 3);
    expect(country.material.roughness).toBeLessThan(0.44);

    // Run several frames
    for (let i = 0; i < 20; i++) {
      animateCountries(list, 0.016, country, null);
    }

    // After 20 frames, liftS should be very close to 1.0 (tactile relief lift)
    expect(country.liftS).toBeGreaterThan(0.95);
    expect(country.group.position.y).toBeGreaterThan(0.95);

    // Hover removed
    animateCountries(list, 0.016, null, null);
    expect(country.liftS).toBeLessThan(1.0);

    // Run more frames after unhover
    for (let i = 0; i < 30; i++) {
      animateCountries(list, 0.016, null, null);
    }
    expect(country.liftS).toBeLessThan(0.01);
  });

  it('elevates focused country towards targetY = 1.25', () => {
    const mat = new MeshStandardMaterial({ color: 0x999999, roughness: 0.44 });
    const country = {
      code: 'JPN',
      group: { position: { y: 0 } },
      mesh: {},
      material: mat,
      line: { material: { opacity: 0 } },
      baseColor: new Color(0x999999),
      hoverColor: new Color(0x333333),
      hoverS: 0,
      liftS: 0,
      riseK: 1,
      elevation: 0,
    };

    for (let i = 0; i < 25; i++) {
      animateCountries([country], 0.016, null, country);
    }
    expect(country.liftS).toBeGreaterThan(1.2);
  });
});

describe('interactions pointer and drag detection', () => {
  it('detects drag when pointer moves > 6px and notifies onDragEnd', () => {
    const canvas = document.createElement('canvas');
    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const onCountryPick = vi.fn();
    const onBackgroundPick = vi.fn();

    const interaction = createInteraction({
      canvas,
      camera: new PerspectiveCamera(),
      meshes: [],
      isReady: () => true,
      isBusy: () => false,
      onHoverChange: () => {},
      onCountryPick,
      onBackgroundPick,
      onDragStart,
      onDragEnd,
    });

    // Pointer down at (100, 100)
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 100, clientY: 100 }),
    );
    expect(onDragStart).toHaveBeenCalledTimes(1);

    // Move to (120, 120) - 28px move > 6px
    canvas.dispatchEvent(
      new PointerEvent('pointermove', { clientX: 120, clientY: 120 }),
    );

    // Pointer up at (120, 120)
    canvas.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 120, clientY: 120 }),
    );

    expect(onDragEnd).toHaveBeenCalledTimes(1);
    expect(onCountryPick).not.toHaveBeenCalled();
    expect(onBackgroundPick).not.toHaveBeenCalled();

    interaction.dispose();
  });

  it('detects click without movement and notifies onBackgroundPick', () => {
    const canvas = document.createElement('canvas');
    canvas.getBoundingClientRect = () => ({
      left: 0,
      top: 0,
      width: 500,
      height: 500,
      right: 500,
      bottom: 500,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    const onDragStart = vi.fn();
    const onDragEnd = vi.fn();
    const onCountryPick = vi.fn();
    const onBackgroundPick = vi.fn();

    const interaction = createInteraction({
      canvas,
      camera: new PerspectiveCamera(),
      meshes: [],
      isReady: () => true,
      isBusy: () => false,
      onHoverChange: () => {},
      onCountryPick,
      onBackgroundPick,
      onDragStart,
      onDragEnd,
    });

    // Pointer down at (50, 50)
    canvas.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 50, clientY: 50 }),
    );

    // Pointer up at same position within threshold
    canvas.dispatchEvent(
      new PointerEvent('pointerup', { clientX: 50, clientY: 50 }),
    );

    expect(onDragEnd).not.toHaveBeenCalled();
    expect(onBackgroundPick).toHaveBeenCalledTimes(1);

    interaction.dispose();
  });
});
