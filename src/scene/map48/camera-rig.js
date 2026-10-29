import { Spherical, Vector3 } from 'three';

/** Posisi overview default (perspektif arsitektural kartografi).
 *  Desktop & Laptop: benua Asia diposisikan presisi di titik tengah visual (optical center)
 *  antara batas kanan kolom editorial kiri dan tepi kanan layar (rata tengah seimbang).
 *  Mobile portrait: radius disesuaikan aspek rasio agar seluruh 48 negara tampil utuh
 *  tanpa terpotong di tepi kiri/kanan. */
export function getOverview(aspect = 16 / 9) {
  const isMobile = aspect < 1.15;
  if (isMobile) {
    const radius = Math.round(184 / aspect);
    return {
      radius,
      phi: 1.05,
      theta: 0,
      target: new Vector3(0, 0, -58),
    };
  }

  // Desktop & Laptop:
  // Ambil dimensi jendela aktif jika tersedia untuk hitungan offset optis yang presisi.
  const winW = typeof window !== 'undefined' ? window.innerWidth : 1440;
  const winH = typeof window !== 'undefined' ? window.innerHeight : Math.round(1440 / aspect);

  // Lebar kolom teks di sebelah kiri adalah ~480px (clamp(32px, 4vw, 56px) + max-width 440px).
  // Sisa ruang di sebelah kanan untuk benua Asia = winW - 480px.
  const availSpace = Math.max(480, winW - 480);

  // Skala radius kamera:
  // Pada layar laptop menengah (1024 - 1280px), kamera mundur sedikit (radius 202 - 212)
  // agar benua tidak sesak dan memiliki ruang bernapas simetris di kiri dan kanan.
  let radius = 192;
  if (availSpace < 620) {
    radius = 212;
  } else if (availSpace < 820) {
    radius = 202;
  }

  // targetX disetel agar titik tengah visual benua (center X)
  // berada tepat di tengah sisa ruang (rata tengah antara kolom kiri dan tepi kanan layar).
  const tanHalfFov = Math.tan((22.5 * Math.PI) / 180); // FOV kamera = 45 deg
  const targetX = -((480 * radius * tanHalfFov) / winH) + 4.6;

  return {
    radius,
    phi: 1.05,
    theta: 0.08,
    target: new Vector3(targetX, 0, 0),
  };
}

export const OVERVIEW = getOverview(16 / 9);

export const easing = {
  linear: (t) => t,
  /** masuk-keluar lembut, dipakai semua tween kamera. */
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
};

const active = [];

/** Tween presisi clock-time di-drive dari render loop (konsisten di 60fps maupun headless test). */
export function tween({ delay = 0, duration = 1, ease = easing.inOutCubic, onUpdate, onComplete }) {
  const start = performance.now() + delay * 1000;
  const durMs = Math.max(1, duration * 1000);
  const tw = { start, durMs, ease, onUpdate, onComplete };
  active.push(tw);
  return tw;
}

export function cancelTween(tw) {
  const i = active.indexOf(tw);
  if (i !== -1) active.splice(i, 1);
}

export function updateTweens() {
  const now = performance.now();
  for (let i = active.length - 1; i >= 0; i--) {
    const tw = active[i];
    const elapsed = now - tw.start;
    if (elapsed < 0) continue;
    const progress = Math.min(1, elapsed / tw.durMs);
    const k = tw.ease(progress);
    tw.onUpdate(k);
    if (progress >= 1) {
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

  /** Hentikan animasi kamera aktif dan pulihkan kendali controls. */
  stop() {
    this._clear();
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
  focusOn(meta, options = {}) {
    const { duration = 0.85, ease = easing.outCubic, onComplete } = options || {};
    const target = meta.center.clone();
    target.y = 1.1;
    const dist = Math.max(28, Math.min(84, meta.focusDist));
    this.flyTo({ target, radius: dist }, { duration, ease, onComplete });
  }

  /** Zoom in atau out secara proporsional dan halus. */
  zoom(step, options = {}) {
    const { duration = 0.5, onComplete } = options || {};
    const offset = this.camera.position.clone().sub(this.controls.target);
    const sph = new Spherical().setFromVector3(offset);
    const factor = step > 0 ? 0.72 : 1.38;
    const minR = this.controls.minDistance || 40;
    const maxR = this.controls.maxDistance || 560;
    const targetRadius = Math.max(minR, Math.min(maxR, sph.radius * factor));
    this.flyTo(
      { radius: targetRadius, phi: sph.phi, theta: sph.theta },
      { duration, onComplete },
    );
  }

  /** Mengembalikan rotasi kamera ke arah Utara di Atas (North-Up). */
  resetNorth(optionsOrCb) {
    const options =
      typeof optionsOrCb === 'function' ? { onComplete: optionsOrCb } : optionsOrCb || {};
    const { duration = 0.8, ease = easing.outCubic, onComplete } = options;
    const offset = this.camera.position.clone().sub(this.controls.target);
    const sph = new Spherical().setFromVector3(offset);
    const ov = getOverview(this.camera.aspect);
    this.flyTo({ phi: ov.phi, theta: ov.theta }, { duration, ease, onComplete });
  }

  /** Mendapatkan sudut deviasi orientasi kamera terhadap utara dalam derajat [-180..180]. */
  getHeading() {
    const offset = this.camera.position.clone().sub(this.controls.target);
    const sph = new Spherical().setFromVector3(offset);
    const ov = getOverview(this.camera.aspect);
    let diff = ((sph.theta - ov.theta) * 180) / Math.PI;
    diff = (((diff + 180) % 360) + 360) % 360 - 180;
    return diff;
  }

  /** Terbang ke koordinat bidang X/Z (misal pusat kawasan). */
  flyToCoord(x, z, dist = 88, onComplete) {
    const target = new Vector3(x, 1.1, z);
    this.flyTo({ target, radius: dist }, { duration: 1.25, onComplete });
  }

  overview(optionsOrCb) {
    const ov = getOverview(this.camera.aspect);
    const options =
      typeof optionsOrCb === 'function' ? { onComplete: optionsOrCb } : optionsOrCb || {};
    const { duration = 1.05, ease = easing.inOutCubic, onComplete } = options;
    this.flyTo(
      {
        target: ov.target,
        radius: ov.radius,
        phi: ov.phi,
        theta: ov.theta,
      },
      { duration, ease, onComplete },
    );
  }

  /** Intro: kamera mulai hampir tegak di atas peta, nanti menyapu turun ke 3/4. */
  placeIntro() {
    const ov = getOverview(this.camera.aspect);
    this.place({ radius: 420, phi: 0.1, theta: -0.55, target: ov.target });
  }

  intro(onComplete) {
    const ov = getOverview(this.camera.aspect);
    this.flyTo(
      {
        target: ov.target,
        radius: ov.radius,
        phi: ov.phi,
        theta: ov.theta,
      },
      { duration: 2.7, onComplete },
    );
  }
}

function lerp(a, b, k) {
  return a + (b - a) * k;
}
