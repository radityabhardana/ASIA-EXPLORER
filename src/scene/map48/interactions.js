import { Raycaster, Vector2 } from 'three';

/**
 * Interaksi pointer: raycast hover (throttle 70ms, hanya saat pointer gerak)
 * + deteksi klik vs drag (threshold 6px / 650ms).
 * Hover & klik diblok saat kamera sedang tween atau sebelum intro selesai.
 */
export function createInteraction({
  canvas,
  camera,
  meshes,
  isReady,
  isBusy,
  onHoverChange,
  onCountryPick,
  onBackgroundPick,
  onDragStart,
  onDragEnd,
}) {
  const raycaster = new Raycaster();
  const ndc = new Vector2(-2, -2);
  let hovered = null;
  let dirty = false;
  let lastCast = 0;
  let down = null;
  let hasDragged = false;

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  function cast() {
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObjects(meshes, false);
    return hits.length ? hits[0].object.userData.country : null;
  }

  function onPointerMove(event) {
    setPointer(event);
    dirty = true;
    if (down && !hasDragged) {
      if (Math.hypot(event.clientX - down.x, event.clientY - down.y) > 6) {
        hasDragged = true;
      }
    }
  }

  function onPointerLeave() {
    ndc.set(-2, -2);
    dirty = true;
    if (down && hasDragged) {
      down = null;
      hasDragged = false;
      onDragEnd?.();
    } else {
      down = null;
      hasDragged = false;
    }
  }

  function onPointerDown(event) {
    down = { x: event.clientX, y: event.clientY, t: performance.now() };
    hasDragged = false;
    onDragStart?.();
  }

  function onPointerUp(event) {
    if (!down) return;
    const dx = event.clientX - down.x;
    const dy = event.clientY - down.y;
    const hold = performance.now() - down.t;
    const wasDragged = hasDragged || Math.hypot(dx, dy) > 6 || hold > 650;
    down = null;
    hasDragged = false;
    if (wasDragged) {
      onDragEnd?.();
      return; // itu drag, bukan klik
    }
    if (!isReady() || isBusy()) return;
    setPointer(event);
    const meta = cast();
    if (meta) onCountryPick(meta);
    else onBackgroundPick();
  }

  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerleave', onPointerLeave);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);

  return {
    update(now) {
      if (!isReady() || isBusy()) {
        if (hovered) {
          hovered = null;
          onHoverChange(null);
        }
        return;
      }
      if (!dirty || now - lastCast < 70) return;
      dirty = false;
      lastCast = now;
      const meta = cast();
      if (meta !== hovered) {
        hovered = meta;
        onHoverChange(meta);
      }
    },
    /** Lepas semua listener DOM yang dipasang di atas. */
    dispose() {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerleave', onPointerLeave);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
    },
  };
}
