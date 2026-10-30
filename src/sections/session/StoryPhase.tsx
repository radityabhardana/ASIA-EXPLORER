import { useEffect, useRef, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX, Search, ZoomIn, ZoomOut, RotateCcw, ArrowRight } from 'lucide-react';
import { speak, cancelSpeech } from '@/lib/speech';
import { renderStorySpread } from './storySpreadRenderer';
import '@/styles/sketchbook.css';

export interface StoryPanel {
  id: string;
  title: string;
  body: string;
  funFact: string;
  funFactLabel: string;
  backgroundVariant: 'kenali' | 'budaya' | 'bahasa' | 'kuliner';
}

interface StoryPhaseProps {
  countryId: string;
  countryName: string;
  speechLang: string;
  panels: StoryPanel[];
  onComplete: () => void;
}

const COUNTRY_PHOTOS: Record<string, Record<string, string>> = {
  jp: {
    kenali:  '/images/countries/jp/mount-fuji-lake-960.webp',
    budaya:  '/images/countries/jp/shibuya-crossing-960.webp',
    bahasa:  '/images/countries/jp/kabukicho-neon-960.webp',
    kuliner: '/images/countries/jp/nigiri-sushi-960.webp',
  },
  kr: {
    kenali:  '/images/countries/kr/gyeongbokgung-960.webp',
    budaya:  '/images/countries/kr/gyedong-gil-street-960.webp',
    bahasa:  '/images/countries/kr/sinchon-station-sign-960.webp',
    kuliner: '/images/countries/kr/dolsot-bibimbap-960.webp',
  },
  id: {
    kenali:  '/images/countries/id/borobudur-temple-960.webp',
    budaya:  '/images/countries/id/jakarta-thamrin-bus-960.webp',
    bahasa:  '/images/countries/id/aksara-jawa-surakarta-960.webp',
    kuliner: '/images/countries/id/nasi-goreng-warung-960.webp',
  },
  th: {
    kenali:  '/images/countries/th/wat-arun-bangkok-960.webp',
    budaya:  '/images/countries/th/yaowarat-street-960.webp',
    bahasa:  '/images/countries/th/thai-sign-wat-phra-kaew-960.webp',
    kuliner: '/images/countries/th/pad-thai-bangkok-960.webp',
  },
  vn: {
    kenali:  '/images/countries/vn/ha-long-bay-960.webp',
    budaya:  '/images/countries/vn/hanoi-old-quarter-960.webp',
    bahasa:  '/images/countries/vn/hanoi-street-sign-960.webp',
    kuliner: '/images/countries/vn/bun-bo-hue-960.webp',
  },
  my: {
    kenali:  '/images/countries/my/petronas-towers-960.webp',
    budaya:  '/images/countries/my/pasar-pudu-kl-960.webp',
    bahasa:  '/images/countries/my/jawi-istana-maziah-960.webp',
    kuliner: '/images/countries/my/nasi-lemak-banana-leaf-960.webp',
  },
  ph: {
    kenali:  '/images/countries/ph/chocolate-hills-960.webp',
    budaya:  '/images/countries/ph/manila-jeepney-street-960.webp',
    bahasa:  '/images/countries/ph/makati-street-sign-960.webp',
    kuliner: '/images/countries/ph/halo-halo-laguna-960.webp',
  },
  in: {
    kenali:  '/images/countries/in/taj-mahal-960.webp',
    budaya:  '/images/countries/in/chandni-chowk-960.webp',
    bahasa:  '/images/countries/in/rani-kamlapati-board-960.webp',
    kuliner: '/images/countries/in/thali-darjeeling-960.webp',
  },
  cn: {
    kenali:  '/images/countries/cn/great-wall-badaling-960.webp',
    budaya:  '/images/countries/cn/xinyongan-road-shanghai-960.webp',
    bahasa:  '/images/countries/cn/tianzifang-signboard-960.webp',
    kuliner: '/images/countries/cn/jiaozi-dumplings-960.webp',
  },
};

const N = 18;          // 18 strips for authentic smooth paper curvature
const SPAN = 0.449;    // Gutter to outer page edge ratio
const BETA = 0.60;     // Peak curl of the arc

interface TurnState {
  dir: 'next' | 'prev';
  from: number;
  to: number;
  t: number;
}

interface SpringState {
  v: number;
  target: number;
  k: number;
  c: number;
  t0: number;
  onDone?: () => void;
}

export default function StoryPhase({
  countryId,
  countryName,
  speechLang,
  panels,
  onComplete,
}: StoryPhaseProps) {
  const [spreads, setSpreads] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [loupeOn, setLoupeOn] = useState(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const box3dRef = useRef<HTMLDivElement>(null);
  const fullImgRef = useRef<HTMLImageElement>(null);
  const lensImgRef = useRef<HTMLImageElement>(null);

  // Synchronous page tracking to eliminate stale closure artifacts
  const idxRef = useRef(0);
  const urlsRef = useRef<string[]>([]);

  // Persistent references to active turn elements
  const turnRef = useRef<TurnState | null>(null);
  const turnHalfLeftRef = useRef<HTMLDivElement | null>(null);
  const turnHalfRightRef = useRef<HTMLDivElement | null>(null);
  const turnCurlRef = useRef<HTMLDivElement | null>(null);
  const stripsRef = useRef<HTMLDivElement[]>([]);

  const dragRef = useRef<{
    dir: 'next' | 'prev';
    x0: number;
    w: number;
    moved: number;
    vel: number;
    tPrev: number;
  } | null>(null);

  const viewRef = useRef({ rx: 0, ry: 0, z: 1, trx: 0, try_: 0, tz: 1 });
  const springRef = useRef<SpringState | null>(null);
  const lastTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const total = panels.length;
  const currentPanel = panels[idx] ?? panels[0]!;

  // ── 1. Generate High-Res Spreads into In-Memory Blobs on Mount ─────────────
  useEffect(() => {
    let cancelled = false;
    async function gen() {
      setLoading(true);

      // Clean up previous blob URLs if any
      urlsRef.current.forEach(u => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
      urlsRef.current = [];

      const urls: string[] = [];
      const countryMap = COUNTRY_PHOTOS[countryId] ?? COUNTRY_PHOTOS['jp']!;

      for (let i = 0; i < panels.length; i++) {
        const p = panels[i]!;
        const photo = countryMap[p.backgroundVariant] ?? '/images/countries/jp/mount-fuji-lake-960.webp';
        const url = await renderStorySpread(p, i, panels.length, countryName, photo);
        if (cancelled) return;
        urls.push(url);
      }

      urlsRef.current = urls;
      setSpreads(urls);
      setLoading(false);
    }

    gen();
    return () => {
      cancelled = true;
      urlsRef.current.forEach(u => {
        if (u.startsWith('blob:')) URL.revokeObjectURL(u);
      });
    };
  }, [countryId, countryName, panels]);

  // Keep `--bw` updated for responsive strip calculations
  useEffect(() => {
    const updateBw = () => {
      if (bookRef.current) {
        bookRef.current.style.setProperty('--bw', `${bookRef.current.clientWidth}px`);
      }
    };
    updateBw();
    window.addEventListener('resize', updateBw);
    return () => window.removeEventListener('resize', updateBw);
  }, [loading]);

  // ── 2. Speech Narration on Page Change ────────────────────────────────────
  useEffect(() => {
    if (loading || spreads.length === 0) return;
    const t = setTimeout(() => {
      speak(currentPanel.body.slice(0, 200), {
        lang: speechLang,
        rate: 0.85,
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
      setIsSpeaking(true);
    }, 500);
    return () => {
      clearTimeout(t);
      cancelSpeech();
      setIsSpeaking(false);
    };
  }, [idx, currentPanel.body, speechLang, loading, spreads.length]);

  // ── 3. DOM & Curl Helpers ─────────────────────────────────────────────────
  const applyTurn = useCallback((t: number) => {
    const box = box3dRef.current;
    if (!box) return;
    const th = Math.PI * t;
    const beta = BETA * Math.sin(Math.PI * t);
    const D = 180 / Math.PI;
    const tt = th + beta;
    const td = (2 * beta) / N;

    box.style.setProperty('--tt', `${(tt * D).toFixed(2)}deg`);
    box.style.setProperty('--td', `${(td * D).toFixed(3)}deg`);
    box.style.setProperty('--shade', Math.sin(Math.PI * t).toFixed(3));

    // Per-frame strip dynamic lighting & curved shadows
    const strips = stripsRef.current;
    for (let i = 0; i < strips.length; i++) {
      const s = strips[i];
      if (!s) continue;
      const l1 = Math.abs(Math.cos(tt - i * td));
      const l2 = Math.abs(Math.cos(tt - (i + 1) * td));
      const st = s.style;
      st.setProperty('--lit', l1.toFixed(3));
      st.setProperty('--a1', ((1 - l1) * 0.62).toFixed(3));
      st.setProperty('--a2', ((1 - l2) * 0.62).toFixed(3));
    }
  }, []);

  const cleanupTurnElements = useCallback(() => {
    if (turnHalfLeftRef.current) {
      turnHalfLeftRef.current.remove();
      turnHalfLeftRef.current = null;
    }
    if (turnHalfRightRef.current) {
      turnHalfRightRef.current.remove();
      turnHalfRightRef.current = null;
    }
    if (turnCurlRef.current) {
      turnCurlRef.current.remove();
      turnCurlRef.current = null;
    }
    stripsRef.current = [];
  }, []);

  const buildCurl = useCallback((dir: 'next' | 'prev', from: number, to: number) => {
    stripsRef.current = [];
    const curlEl = document.createElement('div');
    curlEl.className = `sk-curl ${dir}`;
    curlEl.style.setProperty('--n', String(N));
    curlEl.style.setProperty('--span', String(SPAN));
    curlEl.style.setProperty('--front-img', `url("${spreads[from]}")`);
    curlEl.style.setProperty('--back-img', `url("${spreads[to]}")`);

    let host: HTMLElement = curlEl;
    for (let i = 0; i < N; i++) {
      const s = document.createElement('div');
      s.className = 'sk-strip';
      s.style.setProperty('--i', String(i));

      const gut = 'calc(var(--bw) * 0.5)';
      const sw = `calc(var(--bw) * ${SPAN} / ${N})`;
      const A = `calc(-1 * (${gut} + ${i} * ${sw}))`;
      const B = `calc(${(i + 1)} * ${sw} - ${gut})`;

      const f = document.createElement('div');
      f.className = 'sk-face front';
      f.style.backgroundPositionX = dir === 'next' ? A : B;
      const fSh = document.createElement('div');
      fSh.className = 'sh';
      const fGl = document.createElement('div');
      fGl.className = 'gl';
      f.appendChild(fSh);
      f.appendChild(fGl);

      const b = document.createElement('div');
      b.className = 'sk-face back';
      b.style.backgroundPositionX = dir === 'next' ? B : A;
      const bSh = document.createElement('div');
      bSh.className = 'sh';
      const bGl = document.createElement('div');
      bGl.className = 'gl';
      b.appendChild(bSh);
      b.appendChild(bGl);

      s.appendChild(f);
      s.appendChild(b);

      if (i === N - 1) {
        s.classList.add('edge');
      }

      host.appendChild(s);
      host = s;
      stripsRef.current.push(s);
    }
    return curlEl;
  }, [spreads]);

  const mountTurnElements = useCallback((dir: 'next' | 'prev', from: number, to: number, t: number) => {
    const book = bookRef.current;
    if (!book) return;

    cleanupTurnElements();

    const bw = book.clientWidth;
    book.style.setProperty('--bw', `${bw}px`);

    const next = dir === 'next';

    // Left half
    const leftHalf = document.createElement('div');
    leftHalf.className = 'sk-half left';
    const leftImg = document.createElement('img');
    leftImg.className = 'sk-half-img left';
    leftImg.src = spreads[next ? from : to] ?? '';
    leftImg.draggable = false;
    const leftShade = document.createElement('div');
    leftShade.className = 'sk-gutter-shade left';
    leftHalf.appendChild(leftImg);
    leftHalf.appendChild(leftShade);
    book.appendChild(leftHalf);
    turnHalfLeftRef.current = leftHalf;

    // Right half
    const rightHalf = document.createElement('div');
    rightHalf.className = 'sk-half right';
    const rightImg = document.createElement('img');
    rightImg.className = 'sk-half-img right';
    rightImg.src = spreads[next ? to : from] ?? '';
    rightImg.draggable = false;
    const rightShade = document.createElement('div');
    rightShade.className = 'sk-gutter-shade right';
    rightHalf.appendChild(rightImg);
    rightHalf.appendChild(rightShade);
    book.appendChild(rightHalf);
    turnHalfRightRef.current = rightHalf;

    // Curl leaf
    const curl = buildCurl(dir, from, to);
    book.appendChild(curl);
    turnCurlRef.current = curl;

    // Pre-warm the target spread on fullImg underneath
    if (fullImgRef.current && spreads[to]) {
      fullImgRef.current.src = spreads[to];
    }

    applyTurn(t);
  }, [spreads, buildCurl, applyTurn, cleanupTurnElements]);

  // ── 4. Continuous Frame-by-Frame Spring Physics & View Easing ───────────────
  const viewSpring = useCallback(() => {
    const v = viewRef.current;
    const e = 0.14;
    let moved = false;
    for (const [curr, target] of [['rx', 'trx'], ['ry', 'try_'], ['z', 'tz']] as const) {
      const diff = v[target] - v[curr];
      if (Math.abs(diff) > 0.0006) {
        v[curr] += diff * e;
        moved = true;
      } else {
        v[curr] = v[target];
      }
    }
    if (moved) {
      if (box3dRef.current) {
        box3dRef.current.style.setProperty('--rx', `${v.rx.toFixed(2)}deg`);
        box3dRef.current.style.setProperty('--ry', `${v.ry.toFixed(2)}deg`);
        box3dRef.current.style.setProperty('--zoom', v.z.toFixed(3));
      }
      if (stageRef.current) {
        stageRef.current.style.setProperty('--zoom', v.z.toFixed(3));
      }
    }
    return moved;
  }, []);

  const tick = useCallback((now: number) => {
    animFrameRef.current = null;
    const last = lastTimeRef.current || now;
    const dt = Math.min(0.032, (now - last) / 1000 || 0.016);
    lastTimeRef.current = now;

    let turnActive = false;
    if (springRef.current && turnRef.current) {
      const s = springRef.current;
      // Sub-stepped semi-implicit Euler integration for silky stability
      const subDt = dt / 2;
      for (let step = 0; step < 2; step++) {
        const x = turnRef.current.t - s.target;
        s.v += (-s.k * x - s.c * s.v) * subDt;
        turnRef.current.t += s.v * subDt;
      }

      if (Math.abs(turnRef.current.t - s.target) < 0.002 && Math.abs(s.v) < 0.02) {
        turnRef.current.t = s.target;
        applyTurn(s.target);
        const done = s.onDone;
        springRef.current = null;
        if (done) done();
      } else {
        applyTurn(turnRef.current.t);
        turnActive = true;
      }
    }

    const viewMoved = viewSpring();

    if ((turnActive || viewMoved) && animFrameRef.current === null) {
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [applyTurn, viewSpring]);

  const kick = useCallback(() => {
    if (animFrameRef.current === null) {
      lastTimeRef.current = performance.now();
      animFrameRef.current = requestAnimationFrame(tick);
    }
  }, [tick]);

  const animateTo = useCallback((target: number, onDone?: () => void, stiff = 170, damp = 26, v0 = 0) => {
    if (!turnRef.current) return;
    springRef.current = { v: v0, target, k: stiff, c: damp, t0: performance.now(), onDone };
    kick();
  }, [kick]);

  const startTurn = useCallback((dir: 'next' | 'prev', t = 0) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    springRef.current = null;

    // Settle in-flight turn if any
    if (turnRef.current) {
      const settledIdx = turnRef.current.to;
      idxRef.current = settledIdx;
      setIdx(settledIdx);
      turnRef.current = null;
      cleanupTurnElements();
      if (fullImgRef.current && spreads[settledIdx]) {
        fullImgRef.current.src = spreads[settledIdx];
      }
    }

    const from = idxRef.current;
    const to = dir === 'next' ? Math.min(total - 1, from + 1) : Math.max(0, from - 1);
    if (from === to) return;

    turnRef.current = { dir, from, to, t };
    mountTurnElements(dir, from, to, t);
  }, [total, spreads, cleanupTurnElements, mountTurnElements]);

  const commit = useCallback((v0 = 0) => {
    if (!turnRef.current) return;
    const initialVel = Math.max(0, Math.min(5, v0 * 0.9));
    animateTo(1, () => {
      if (!turnRef.current) return;
      const targetIdx = turnRef.current.to;
      idxRef.current = targetIdx;
      setIdx(targetIdx);
      turnRef.current = null;
      cleanupTurnElements();
      if (box3dRef.current) {
        box3dRef.current.style.setProperty('--shade', '0');
      }
      if (fullImgRef.current && spreads[targetIdx]) {
        fullImgRef.current.src = spreads[targetIdx];
      }
    }, 170, 26, initialVel);
  }, [animateTo, cleanupTurnElements, spreads]);

  const cancel = useCallback(() => {
    if (!turnRef.current) return;
    animateTo(0, () => {
      if (!turnRef.current) return;
      const originalIdx = turnRef.current.from;
      turnRef.current = null;
      cleanupTurnElements();
      if (box3dRef.current) {
        box3dRef.current.style.setProperty('--shade', '0');
      }
      if (fullImgRef.current && spreads[originalIdx]) {
        fullImgRef.current.src = spreads[originalIdx];
      }
    }, 150, 24, 0);
  }, [animateTo, cleanupTurnElements, spreads]);

  const step = useCallback((dir: 'next' | 'prev') => {
    cancelSpeech();
    setIsSpeaking(false);
    if (dir === 'next' && idxRef.current >= total - 1) return;
    if (dir === 'prev' && idxRef.current <= 0) return;
    if (turnRef.current) {
      const settledIdx = turnRef.current.to;
      idxRef.current = settledIdx;
      setIdx(settledIdx);
      turnRef.current = null;
      cleanupTurnElements();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      springRef.current = null;
      if (fullImgRef.current && spreads[settledIdx]) {
        fullImgRef.current.src = spreads[settledIdx];
      }
    }
    startTurn(dir, 0);
    commit(0);
  }, [startTurn, commit, cleanupTurnElements, spreads]);

  const goTo = useCallback((target: number) => {
    if (target === idxRef.current) return;
    cancelSpeech();
    setIsSpeaking(false);
    if (Math.abs(target - idxRef.current) === 1) {
      step(target > idxRef.current ? 'next' : 'prev');
      return;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    springRef.current = null;
    turnRef.current = null;
    cleanupTurnElements();
    idxRef.current = target;
    setIdx(target);
    if (fullImgRef.current && spreads[target]) {
      fullImgRef.current.src = spreads[target];
    }
    if (box3dRef.current) {
      box3dRef.current.style.setProperty('--shade', '0');
    }
  }, [step, cleanupTurnElements, spreads]);

  // ── 5. Pointer Drag to Turn ───────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !bookRef.current) return;
    const r = bookRef.current.getBoundingClientRect();
    const dir: 'next' | 'prev' = (e.clientX - r.left) / r.width > 0.5 ? 'next' : 'prev';

    if (dir === 'prev' && idxRef.current === 0) return;
    if (dir === 'next' && idxRef.current === total - 1) return;

    startTurn(dir, 0);
    dragRef.current = {
      dir,
      x0: e.clientX,
      w: r.width,
      moved: 0,
      vel: 0,
      tPrev: performance.now(),
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (drag && turnRef.current) {
      // Dragging page: update curl without layout reflow
      const dx = e.clientX - drag.x0;
      drag.moved = Math.max(drag.moved, Math.abs(dx));
      const raw = (drag.dir === 'next' ? -dx : dx) / (drag.w * 0.62);
      const t = Math.max(0, Math.min(1, raw));
      const now = performance.now();
      drag.vel = (t - turnRef.current.t) / Math.max(0.001, (now - drag.tPrev) / 1000);
      drag.tPrev = now;

      turnRef.current.t = t;
      applyTurn(t);
      return;
    }

    // 3D tilt tracking only when NOT dragging (smooth RAF spring)
    if (e.pointerType !== 'touch' && bookRef.current) {
      const r = bookRef.current.getBoundingClientRect();
      if (r.width > 0) {
        const nx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.62)));
        const ny = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9)));
        viewRef.current.trx = -ny * 4.5;
        viewRef.current.try_ = nx * 6.5;
        kick();
      }
    }
  };

  const handlePointerUp = () => {
    const drag = dragRef.current;
    if (!drag) return;
    const initialVel = drag.vel;
    dragRef.current = null;
    if (!turnRef.current) return;

    if (drag.moved < 6) {
      // Tap on left/right half -> commit smooth turn
      commit(initialVel);
      return;
    }
    const go = turnRef.current.t > 0.38 || initialVel > 0.8;
    if (go) commit(initialVel);
    else cancel();
  };

  // ── 6. Magnifying Glass (Loupe) Placement ─────────────────────────────────
  const updateLoupe = useCallback((clientX: number, clientY: number) => {
    if (!bookRef.current || !lensImgRef.current || !box3dRef.current) return;
    const b = bookRef.current.getBoundingClientRect();
    const box3d = box3dRef.current.getBoundingClientRect();

    const lr = 260; // diameter
    const R = lr / 2;

    const xInBox = clientX - box3d.left;
    const yInBox = clientY - box3d.top;

    const clampedX = Math.max(-R * 0.4, Math.min(box3d.width - R * 0.6, xInBox - R));
    const clampedY = Math.max(-R * 0.4, Math.min(box3d.height - R * 0.6, yInBox - R));
    setLoupePos({ x: clampedX, y: clampedY });

    // Magnify relative to book
    const centerOnBookX = (clampedX + R) - (b.left - box3d.left);
    const centerOnBookY = (clampedY + R) - (b.top - box3d.top);

    const relX = centerOnBookX / b.width;
    const relY = centerOnBookY / b.height;

    const magX = -relX * b.width * 2.6 + R;
    const magY = -relY * b.height * 2.6 + R;

    lensImgRef.current.style.width = `${b.width * 2.6}px`;
    lensImgRef.current.style.height = `${b.height * 2.6}px`;
    lensImgRef.current.style.transform = `translate3d(${magX}px, ${magY}px, 0)`;
  }, []);

  const handleLoupePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const onMove = (ev: PointerEvent) => {
      updateLoupe(ev.clientX, ev.clientY);
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  };

  // ── 7. Keyboard Arrows ────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        if (idxRef.current < total - 1) step('next');
        else onComplete();
      } else if (e.key === 'ArrowLeft') {
        if (idxRef.current > 0) step('prev');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [total, step, onComplete]);

  // Reset 3D tilt on leave
  const handleStageLeave = () => {
    viewRef.current.trx = 0;
    viewRef.current.try_ = 0;
    kick();
  };

  return (
    <div className="sk-wrap">
      {/* Background paper texture & botanical art */}
      <div className="sk-atmo" aria-hidden="true" />
      <img
        src="/landing-pages/meng-to-sketchbook/botany-left.png"
        alt=""
        className="sk-botany-left"
        aria-hidden="true"
      />
      <img
        src="/landing-pages/meng-to-sketchbook/botany-right.png"
        alt=""
        className="sk-botany-right"
        aria-hidden="true"
      />

      {/* Stage: arrows + 3D book */}
      <div
        className="sk-stage"
        ref={stageRef}
        onPointerLeave={handleStageLeave}
        onDoubleClick={() => {
          setZoom(1);
          viewRef.current.tz = 1;
          kick();
        }}
      >
        {/* Left Arrow */}
        <button
          className="sk-nav-arrow left"
          onClick={() => step('prev')}
          disabled={idx === 0 || loading}
          aria-label="Halaman sebelumnya"
          title={idx === 0 ? 'Halaman pertama' : 'Halaman sebelumnya'}
        >
          <ChevronLeft size={20} />
        </button>

        {/* 3D Perspective Box */}
        <div className="sk-3d" ref={box3dRef}>
          {loading ? (
            <div className="sk-loading">
              <span>Menyiapkan lembaran sketsa {countryName}...</span>
            </div>
          ) : (
            <div
              className="sk-tilt"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              {/* Ground Cast Shadows (Meng To Tri-Layer) */}
              <div className="sk-cast ambient" aria-hidden="true" />
              <div className="sk-cast contact" aria-hidden="true" />
              <div className="sk-cast hair" aria-hidden="true" />

              {/* The Sketchbook */}
              <div className="sk-book" ref={bookRef}>
                <div className="sk-full">
                  <img
                    ref={fullImgRef}
                    src={spreads[idx] ?? ''}
                    alt={currentPanel.title}
                    draggable={false}
                  />
                </div>
                <div className="sk-zone prev" aria-hidden="true" />
                <div className="sk-zone next" aria-hidden="true" />
              </div>
            </div>
          )}

          {/* Draggable Magnifying Glass (Loupe) */}
          {loupeOn && spreads[idx] && (
            <div
              className="sk-loupe on"
              style={{
                transform: loupePos ? `translate3d(${loupePos.x}px, ${loupePos.y}px, 0)` : 'translate3d(100px, 80px, 0)',
              }}
              onPointerDown={handleLoupePointerDown}
            >
              <div className="sk-ring">
                <div className="sk-lens">
                  <img
                    ref={lensImgRef}
                    src={spreads[idx]}
                    alt=""
                    draggable={false}
                  />
                </div>
                <div className="sk-glare" />
              </div>
              <div className="sk-stem" />
            </div>
          )}
        </div>

        {/* Right Arrow */}
        <button
          className="sk-nav-arrow right"
          onClick={() => step('next')}
          disabled={idx === total - 1 || loading}
          aria-label="Halaman berikutnya"
          title={idx === total - 1 ? 'Halaman terakhir' : 'Halaman berikutnya'}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Bottom Floating Bar */}
      <div className="sk-bar">
        {/* Page Dots Navigation */}
        <div className="sk-dots" role="tablist" aria-label="Navigasi halaman">
          {panels.map((p, i) => (
            <button
              key={p.id}
              className={`sk-dot${i === idx ? ' active' : ''}`}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Halaman ${i + 1}: ${p.title}`}
              title={`Halaman ${i + 1}: ${p.title}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* Toolbar: Narasi, Loupe, Zoom */}
        <div className="sk-toolbar" role="toolbar" aria-label="Kontrol Buku Sketsa">
          <button
            className={`sk-btn${isSpeaking ? ' sk-btn--active' : ''}`}
            onClick={() => {
              if (isSpeaking) {
                cancelSpeech();
                setIsSpeaking(false);
              } else {
                cancelSpeech();
                speak(currentPanel.body.slice(0, 200), {
                  lang: speechLang,
                  rate: 0.85,
                  onEnd: () => setIsSpeaking(false),
                  onError: () => setIsSpeaking(false),
                });
                setIsSpeaking(true);
              }
            }}
            aria-label={isSpeaking ? 'Hentikan narasi' : 'Dengarkan narasi'}
            title={isSpeaking ? 'Hentikan narasi suara' : 'Dengarkan narasi suara'}
          >
            {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isSpeaking ? 'Berhenti' : 'Dengarkan'}</span>
          </button>

          <div className="sk-sep" aria-hidden="true" />

          <button
            className={`sk-btn${loupeOn ? ' sk-btn--active' : ''}`}
            onClick={() => {
              const next = !loupeOn;
              setLoupeOn(next);
              if (next) {
                setTimeout(() => updateLoupe(window.innerWidth / 2, window.innerHeight / 2), 20);
              }
            }}
            aria-label="Kaca pembesar"
            aria-pressed={loupeOn}
            title={loupeOn ? 'Tutup kaca pembesar' : 'Buka kaca pembesar 2.6x'}
          >
            <Search size={14} />
            <span>Kaca Pembesar</span>
          </button>

          <div className="sk-sep" aria-hidden="true" />

          <div className="sk-zoom-controls">
            <button
              className="sk-btn sk-btn--icon"
              onClick={() => {
                const z = Math.max(0.85, zoom - 0.15);
                setZoom(z);
                viewRef.current.tz = z;
                kick();
              }}
              disabled={zoom <= 0.85}
              aria-label="Perkecil"
              title="Perkecil zoom buku"
            >
              <ZoomOut size={13} />
            </button>
            <span className="sk-zoom-label">{Math.round(zoom * 100)}%</span>
            <button
              className="sk-btn sk-btn--icon"
              onClick={() => {
                const z = Math.min(1.4, zoom + 0.15);
                setZoom(z);
                viewRef.current.tz = z;
                kick();
              }}
              disabled={zoom >= 1.4}
              aria-label="Perbesar"
              title="Perbesar zoom buku"
            >
              <ZoomIn size={13} />
            </button>
            {zoom !== 1 && (
              <button
                className="sk-btn sk-btn--icon"
                onClick={() => {
                  setZoom(1);
                  viewRef.current.tz = 1;
                  kick();
                }}
                aria-label="Reset zoom"
                title="Reset zoom ke 100%"
              >
                <RotateCcw size={12} />
              </button>
            )}
          </div>

          {idx === total - 1 && (
            <>
              <div className="sk-sep" aria-hidden="true" />
              <button
                className="sk-btn sk-btn--quest"
                onClick={onComplete}
                aria-label="Mulai Quest"
                title="Selesai membaca dan mulai quest tantangan"
              >
                <span>Mulai Quest</span>
                <ArrowRight size={13} />
              </button>
            </>
          )}
        </div>

        <p className="sk-hint">
          {idx === total - 1
            ? 'Lembaran terakhir selesai dibaca • Klik Mulai Quest untuk melanjutkan'
            : 'Tarik sudut halaman untuk membuka • Geser kaca pembesar untuk melihat detail'}
        </p>
      </div>
    </div>
  );
}
