import { Spherical, Vector3 } from 'three';

/** Posisi overview default (3/4 view dari sel). */
export const OVERVIEW = {
  radius: 178,
  phi: 1.05,
  theta: 0.12,
  target: new Vector3(0, 0, 0),
};

export const easing = {
  linear: (t) => t,
  /** masuk-keluar lembut, dipakai semua tween kamera. */
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
};

const active = [];

/** Tween kecil di-drive dari render loop (tanpa dependensi). */
export function tween({ delay = 0, duration = 1, ease = easing.inOutCubic, onUpdate, onComplete }) {
  const tw = { elapsed: -delay, duration, ease, onUpdate, onComplete };
  active.push(tw);
  return tw;
}

export function cancelTween(tw) {
  const i = active.indexOf(tw);
  if (i !== -1) active.splice(i, 1);
}

export function updateTweens(dt) {
  for (let i = active.length - 1; i >= 0; i--) {
    const tw = active[i];
    tw.elapsed += dt;
    if (tw.elapsed < 0) continue;
    const k = tw.ease(Math.min(1, tw.elapsed / tw.duration));
    tw.onUpdate(k);
    if (tw.elapsed >= tw.duration) {
      active.splice(i, 1);
      if (tw.onComplete) tw.onComplete();
    }
  }
}

/**
 * Keputusan desain tween kamera: animasi di paramameter polar/radius/target,
 * bukan posisi linear — jadi lintasannya berupa arc organik, tanpa "orbit jerk".
 * Selama tween, OrbitControls dimatikan supaya damping tidak konflik.
 */
export class CameraRig {
  constructor(camera, controls) {
    this.camera = camera;
    this.controls = controls;
    this._tween = null;
    this._sph = new Spherical();
    this._t0 = new Vector3();
    this._t1 = new Vector3();
    this._tgt = new Vector3();
  }

  get moving() {
    return this._tween !== null;
  }

  _clear() {
    if (this._tween) {
      cancelTween(this._tween);
      this._tween = null;
      this.controls.enabled = true;
    }
  }

  /** Penempatan langsung tanpa animasi (pemantik intro). */
  place({ radius, phi, theta, target }) {
    const t = target || this.controls.target;
    this.camera.position.setFromSpherical(new Spherical(radius, phi, theta)).add(t);
    this.controls.target.copy(t);
    this.camera.lookAt(t);
  }

  flyTo({ radius, phi, theta, target }, options = {}) {
    const { duration = 1.4, ease = easing.inOutCubic, onComplete } = options || {};
    this._clear();
    const controls = this.controls;
    const camera = this.camera;

    const offset = camera.position.clone().sub(controls.target);
    const from = new Spherical().setFromVector3(offset);
    this._t0.copy(controls.target);
    this._t1.copy(target ? target : controls.target);

    const r1 = radius !== undefined ? radius : from.radius;
    const p1 = phi !== undefined ? phi : from.phi;
    const th0 = from.theta;
    const thTo = theta !== undefined ? theta : from.theta;
    // terpilih path rotasi terpendek (contoh: -0.5 -> 0.12 nggak muter berlebihan)
    const th1 = th0 + Math.atan2(Math.sin(thTo - th0), Math.cos(thTo - th0));

    controls.enabled = false;
    this._tween = tween({
      duration,
      ease,
      onUpdate: (k) => {
        this._sph.set(lerp(from.radius, r1, k), lerp(from.phi, p1, k), lerp(th0, th1, k));
        const tgt = this._tgt.lerpVectors(this._t0, this._t1, k);
        camera.position.setFromSpherical(this._sph).add(tgt);
        controls.target.copy(tgt);
        camera.lookAt(tgt);
      },
      onComplete: () => {
        this._tween = null;
        controls.enabled = true;
        if (onComplete) onComplete();
      },
    });
  }

  /** Fokus ke negara: target berpindah ke tangkai negara, radius di-fit ukurannya.
   *  phi/theta dipertahankan dari posisi kamera saat ini — hasilnya dolly halus,
   *  bukan orbit kasar. */
  focusOn(meta) {
    const target = meta.center.clone();
    target.y = 1.1;
    const dist = Math.max(26, Math.min(78, meta.focusDist));
    this.flyTo({ target, radius: dist }, { duration: 1.35 });
  }

  overview(onComplete) {
    this.flyTo(
      {
        target: OVERVIEW.target,
        radius: OVERVIEW.radius,
        phi: OVERVIEW.phi,
        theta: OVERVIEW.theta,
      },
      { duration: 1.45, onComplete },
    );
  }

  /** Intro: kamera mulai hampir tegak di atas peta, nanti menyapu turun ke 3/4. */
  placeIntro() {
    this.place({ radius: 420, phi: 0.1, theta: -0.55, target: OVERVIEW.target });
  }

  intro(onComplete) {
    this.flyTo(
      {
        target: OVERVIEW.target,
        radius: OVERVIEW.radius,
        phi: OVERVIEW.phi,
        theta: OVERVIEW.theta,
      },
      { duration: 2.7, onComplete },
    );
  }
}

function lerp(a, b, k) {
  return a + (b - a) * k;
}
