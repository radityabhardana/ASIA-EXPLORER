# CONTRACT — Scene B (K7 intro, K8 relief, K9 hover→panel)

Binding for `src/scene/AsiaScene.tsx` + `src/sections/landing/*`. Source: `docs/PRD_V2_6_DELTA.md:10-36`, gates `:120-125`.
File state at read time: **mid-edit by @designer**. Brief is stale on two points: `targetSpan=1.98` / `offsetRight=7.0` no longer exist (`src/scene/AsiaScene.tsx:829-831`, removed per `docs/DEFECTS_R4.md:11`); target NDC-Y is a prop defaulting to `0` (`AsiaScene.tsx:335`), not `0.315`. Everything below is written against the file on disk.

## 0. Canonical hero pose — single source of truth
`HERO_POSE` **must be measured, never restated as literals**. Capture it from the routine that already produces the gate-approved frame (`fitCamera`, `AsiaScene.tsx:833-937`) with `azimuth=0`, `elevation=52°` (`:135`), `scroll=0`, `introZoom=1`:

```ts
export interface CameraPose {
  azimuth: number;   // rad, 0 = hero yaw
  distance: number;  // world units, camera→target
  elevation: number; // rad above horizontal
  tx: number; ty: number; tz: number;      // look-at target
}
// camera world Y (height) = ty + sin(elevation) * distance — derived, never stored twice.
export const HERO_POSE: Readonly<CameraPose>; // filled once after model load (AsiaScene.tsx:1129-1137)
```

Rules: (a) write `HERO_POSE` after `center` (`:1131-1132`) and `silhouette` (`:1292-1294`) exist; (b) it is the **only** authority for the final frame — no second constant may restate yaw/tilt/span; (c) the mobile span branch (`:844-846`) lives inside `fitCamera`, so `HERO_POSE` is per-viewport and is recaptured on `resize` only while owner ≠ intro.

## 1. K7 — drone intro
```ts
/** Pure. Writes into `out` (zero allocation). Clamps progress to [0,1]. */
export function introPose(progress: number, hero: Readonly<CameraPose>, out: CameraPose): CameraPose;

export const INTRO = {
  durationMs: 2600,                 // PRD: 2200–2800 (PRD_V2_6_DELTA.md:13)
  orbitRad: (120 * Math.PI) / 180,  // start = hero.azimuth + orbitRad, end = hero.azimuth
  distanceFrom: 1.85,               // × hero.distance
  elevationFrom: (68 * Math.PI) / 180,
  targetLiftFrom: 0.06,             // × hero.distance, +Y
} as const;
```

- **Easing**: exactly one, `easeInOutCubic` = `t<0.5 ? 4t³ : 1-(-2t+2)³/2`. Monotonic, `f(0)=0`, `f(1)=1` exact, no overshoot, zero velocity at both ends; one eased `t` drives all four channels.
- **Exact landing**: `if (p >= 1) { copy(hero, out); return out; }` — never trust `lerp(a,b,1)` float identity.
- **Determinism**: `p = clamp((now - startedAt) / durationMs, 0, 1)` from the rAF timestamp. No delta accumulation, no spring. Same wall-clock ⇒ same `p` at 30 and 144 fps.
- **Start gate**: today the intro starts on the first tick after GLB load (`:981-984`), which can run behind the preloader (`LandingPage.tsx:47-56`). Bind it to `document.documentElement.dataset.ready === 'true'` (or an `introStartRef` prop); never start before the preloader exits.
- **Delete the old animation**: `introStartMs` field (`:131`, `:1260`, `:1285`), `introOffsetY` block (`:1051-1064`), `y = -1.6` seed (`:1296-1300`) — K7 removes "surface rises" explicitly (`PRD_V2_6_DELTA.md:17`).

**Camera ownership — one writer per frame:**

```ts
type CameraOwner = 'boot' | 'intro' | 'scroll';
// boot  : hold HERO_POSE
// intro : introPose() is the ONLY writer; scroll ref is read, never applied
// scroll: existing path — fitCamera(sway, elevation(scroll), scroll, 1) (AsiaScene.tsx:1000-1001)
```

- While `intro`, `scrollProgressRef` is read-only; a value > 0.002 at the first intro frame ⇒ skip (deep link / restored scroll).
- **Skip** = owner `'scroll'` + drop the timer in the same rAF **before** `renderer.render` (`:1090`). No fade, no tween-out, no second animation.
- **Scroll at t=900 ms**: skip fires; that same frame renders `fitCamera(scrollNow)`. Post-skip pose is `baseline(scrollNow)` (not `HERO_POSE`) when `scrollNow>0`; it is `HERO_POSE` bit-exact when `scrollNow≈0`. Both are gated.
- **Interrupts**: `wheel`, `touchmove` (passive), any `scrollProgressRef` change, `pointerdown`+`pointerup` on canvas, `Escape`, `Space` on the focused scene. A click during intro **skips and is swallowed** — it must not activate a country.
- **`prefers-reduced-motion`**: owner starts `'scroll'`, `introPose` never called, `data-intro="reduced"`. Mid-intro toggle (`:483-494` already listens) ⇒ skip next frame.
- **Idle sway** (`:992-998`, ±1.5°) is phase-shifted by intro duration and would break final-frame equality: ramp amplitude from 0 over 1200 ms **starting at intro end**, or allow `idleSway={false}`.

**Assertion — "final frame after intro === frame without intro":**
1. `pose()` (§5) at `data-intro="done"` vs `pose()` under `reducedMotion:'reduce'`, same viewport/DPR: `maxAbsDiff < 1e-6` across all 7 fields.
2. Pixel fallback: clip-screenshot both, diff with `sharp` (already a dep, `e2e/round4-gates.spec.ts:204`); pixels with channel delta > 2 must be **< 2 %** (`PRD_V2_6_DELTA.md:122`).
3. Frame-rate independence: repeat with CDP `Emulation.setCPUThrottlingRate(6)` — identical `pose()` at done, `intro().progress` monotonic.
4. Interrupt at 900 ms via `Escape`: `data-intro==='done'` within 1 rAF, `pose()===HERO_POSE`, elapsed < 1000 ms.
5. Scroll-skip: `|pose() − baseline(scrollNow)| == 0` on the skip frame (no double-eased pop).

## 2. K9 — hover → info panel, no dialog
Delete the cursor-following label (`AsiaScene.tsx:1074-1088`, `LABEL_TAU` `:176-177`), the per-moved-frame layout read (`:1014`) and the per-id re-measure (`:546-548`). *Correction to the brief*: `onHoverCountry` is **not** fired per `pointermove` on disk — `pointermove` only sets a dirty flag (`:582-589`), the raycast runs once per tick (`:1005-1021`) behind a change-guard (`:521-524`). The real residue is the per-frame `getBoundingClientRect` and a whole-`LandingPage` re-render per id change (`LandingPage.tsx:37`, `:321`).

```ts
export interface CountryHit {
  id: string;
  anchor: { x: number; y: number };   // CSS px, container-relative, from the 3D anchor
  side: 'left' | 'right';             // panel sits beside the continent, never under the cursor
}
export interface AsiaSceneProps {
  onHoverCountry?: (hit: CountryHit | null) => void;  // ONLY on id change
  onCountryAnchor?: (id: string, anchor: CountryHit['anchor'], side: 'left'|'right') => void; // debounced
  onActivateCountry?: (id: string) => void;           // replaces onSelectCountry
  introEnabled?: boolean;  // default true
  idleSway?: boolean;      // default true
}
```

- **Raycast**: ≤1/frame (`:1005-1021` unchanged in spirit). NDC uses a **cached** container rect invalidated by `ResizeObserver` (`:508`) + passive `scroll` — never `getBoundingClientRect()` per frame.
- **State**: `onHoverCountry` iff `nextId !== hoveredId` (guard at `:521-524` stays). `onCountryAnchor` only when the projected anchor moved ≥ 6 px since last emit **and** ≥ 100 ms elapsed; emit a mutable `{x,y}`, not React state.
- **Anchor**: project `country.anchor` with the same math as `debug.projected` (`:669-682`); `side = anchor.x > containerW/2 ? 'left' : 'right'`; keep ≥ 12 px gap and never intersect the hovered country's projected bbox.
- **React boundary**: panel *content* (name, native+roman, language, depth) may re-render on id change. Panel *position* is written imperatively as CSS vars on the container. **Zero React writes from `pointermove`.**
- **Keyboard**: one roving-tabindex list of 15 `<button data-scene-country="<id>">` (visually hidden) inside the existing `role="group"` (`AsiaSceneLazy.tsx:144-146`). Tab enters once; arrows move focus in `band` order (`:1270-1274`) then by `anchor.y`; focus ⇒ same `setHovered(id, …, immediate=true)` path as touch; `Enter`/`Space` ⇒ `onActivateCountry`; `Escape` ⇒ clear. Avoids inventing a composite ARIA role over a `aria-hidden` canvas (`:1421`).
- **Touch**: tap 1 = select + panel (`immediate`, no hysteresis); tap 2 on the **same** id = activate — reference implementation is the existing branch (`:625-641`). Empty tap clears. Hit test gains a 22 px nearest-anchor fallback so small countries (SG/TH) still meet the ≥ 44 px effective target (`PRD_V2_6_DELTA.md:36`).
- **Pointer leave**: mouse only, **immediate** clear (no 130 ms exit hysteresis); `pointercancel` (scroll start) clears; touch `pointerleave` stays ignored (`:591-605`).
- **Scroll**: panel does not follow scroll; re-project anchor ≤ 1/100 ms; if the anchor leaves the container rect, clear synchronously.
- **Route change**: `onActivateCountry(id)` → `navigate('/negara/'+id)` (`routes.tsx:8`); clear hover and blur the active element first. After dispose (`:1350-1361`) every emit is behind the `disposed` guard.
- **Remove dialog from landing**: delete `CountryDialog` import/usage (`LandingPage.tsx:7`, `:340-343`); footer buttons drop `aria-haspopup="dialog"` and become `<Link to="/negara/:id">` (`:361-367`). Dialog may remain for `/dashboard` (`PRD_V2_6_DELTA.md:35`). `e2e/landing.spec.ts:192-205` asserts the dialog → must be rewritten in the same change.

## 3. K8 — brown relief terrain
**Shape: 2 objects.** (a) one displaced base plate (`PlaneGeometry` 72×48 segments = 6 912 tris, vertex displacement computed once at init with deterministic value noise); (b) one `InstancedMesh` of 180 low-poly ridge prisms (32 tris each = 5 760 tris). Total **12 672 tris / 2 draw calls**, ceiling **16 000 tris**. No per-frame vertex work, no shader noise, no post FX. Base segment ≤ 3.5 world units over the central 60 % of the plate.

**Invariants:**
- **Picking**: terrain is never in `pickTargets` (`AsiaScene.tsx:439`, `:573`) and never inside `gltf.scene`, whose `traverse` makes meshes pickable (`:1139-1173`).
- **Camera fit**: hull is built from `pickTargets` only (`:1293`) ⇒ terrain never widens the fit. Do not feed terrain into `computeSilhouette`.
- **Ink gate (critical)**: `measureInk` hides only `ground` (`:713-719`) and measures alpha; terrain would inflate the bbox and break 59–65 vw / 81–89 vw (`e2e/gates.spec.ts:196-221`). Replace `ground.visible` with `groundLike: Object3D[]` (ground + plate + instances + shadow catcher).
- **Depth**: plate top within `[-0.45, +0.25]` world Y; peaks clamp to `min(countryBottomY) − 0.15` from `Box3` (`:1147-1150`). `renderOrder=0`, `depthWrite=true`, `castShadow=false`, `receiveShadow=true`. Keep country `polygonOffset` (`:1220-1222`) — fix z-fighting with height, not by removing it.
- **Ground plane**: the 520×520 `ShadowMaterial` plane (`:429-435`) stays but must be alpha-0 outside the relief footprint, or go away once terrain receives shadows.

**Palette** — new tokens (none exist today: `tokens.css:10-41`; `--paper` from K18). Ratios computed with WCAG 2.x relative luminance:

| token | hex | `--ink` | `--accent-ink` | usage |
|---|---|---|---|---|
| `--paper` | `#f4ede1` | 14.26 | 1.15 | page bg (K18) |
| `--terrain-100` | `#eadfc9` | 12.56 | 1.31 | plate base, far field |
| `--terrain-200` | `#ddc9a6` | 10.26 | 1.60 | mid field |
| `--terrain-300` | `#c9a97a` | 7.46 | 2.20 | near field |
| `--terrain-400` | `#a8814f` | **4.68** | 3.51 | darkest fill allowed under `--ink` text |
| `--terrain-500` | `#8f6b3f` | 3.43 | **4.79** | slope shadow; `--accent-ink` text only |
| `--terrain-600` | `#6b4f2e` | 2.20 | 7.47 | cast/crevice only — **no text ever** |

Rule: text over terrain is `--ink` and only over `≤ --terrain-400`; over `--terrain-500/600` only `--terrain-ink (#fffef9)`. Relief is confined to the lower 55–65 % of the scene container so the 64 px navbar band sits on `--paper` (`PRD_V2_6_DELTA.md:43`).

**Not-flat at 375**: ≥ 3 ridge instances inside the visible terrain band and a p90−p10 luminance spread ≥ 14/255 across it (threshold calibrated on first render).

## 4. Budgets
| Budget | Limit | Measurement |
|---|---|---|
| Raycast | ≤ 1 / frame | `stats().picks / stats().frames ≤ 1.02` after 400 synthetic `pointermove` over 2 s |
| React writes | 0 from `pointermove`; ≤ id changes total | DEV `window.__asiakin_stats.renders` flat during a 60-event sweep inside one country |
| Intro cost | 0 heap allocs / frame | `performance.memory.usedJSHeapSize` delta < 1.5 MB over 2.6 s (Chromium, DEV) + `ast_grep` rule: no `new`/array literal inside `tick` (`:976-1111`) |
| Terrain | 12 672 tris / 2 calls / ≤ 16 000 | `stats().triangles`, `stats().drawCalls` from `renderer.info.render` |
| Frame rate | p95 ≤ 20 ms, p99 ≤ 33 ms @1440 | 300 rAF deltas after `data-intro="done"`, **GPU-enabled project only**; headless here is ~3 fps (`e2e/round4-gates.spec.ts:24`) → skip on SwiftShader |

E2E runs `vite` in dev (`playwright.config.ts:22`), so `import.meta.env.DEV` is on and DEV hooks are live; they are stripped in prod.

## 5. Testability hooks
```ts
// DEV only — same guard as AsiaScene.tsx:799-809
interface AsiaSceneDebug {
  pose(): CameraPose;
  intro(): { state: 'boot'|'intro'|'scroll'|'reduced'; progress: number; elapsedMs: number };
  hovered(): string | null;
  panelAnchor(): { x: number; y: number; w: number; h: number; side: 'left'|'right' } | null;
  stats(): { frames: number; picks: number; drawCalls: number; triangles: number; hoverEmits: number; maxFrameMs: number };
  warnings?(): string[]; // 'terrain-in-measure' | 'pick-without-cache'
}
```

Production DOM (real UI, no geometry, no secrets): `.asia-scene[data-intro]` = `boot|intro|done|skipped|reduced`; `[data-hovered]` = id or empty; `[data-panel-side]`; `[data-country-panel][data-panel-for="<id>"]` (rect via `getBoundingClientRect`); a11y buttons `[data-scene-country="<id>"]`.

## 6. Risk register
| Feature | Breaks at 375 | Perf regression | Gate must measure |
|---|---|---|---|
| K7 intro | 1.85× start distance can push ink past the container mid-intro while `overflow:hidden` clips a hard edge (span constants `:155-164`) | `fitCamera` re-projects the whole silhouette up to 20× (`:868-927`) per frame under a changing yaw | ink bbox at p = 0/.25/.5/.75/1 (no edge contact), `pose()===HERO_POSE`, elapsed ≤ 2800 ms, progress monotonic and never > 1 |
| K8 terrain | reads flat (ridges < 8 px at 812 height) or touches the bottom edge, violating "no decoration stuck to viewport edge" | extra `receiveShadow` mesh doubles shadow-map cost; 16 k tris at DPR 1.5 on iGPU; forgetting the `groundLike` hide-list ⇒ false ink failures | luminance spread ≥ 14/255 in the terrain band at 375; terrain bbox strictly inside canvas; `drawCalls ≤ 40`, `triangles ≤ 60 k`; ink gate still 59–65 / 81–89 vw |
| K9 panel | panel overlaps the continent (85 vw wide at 375) or hides the hovered country; 44 px target fails on SG/TH-scale countries | whole-`LandingPage` re-render per id change (`LandingPage.tsx:37`); `getBoundingClientRect` + `offsetWidth` per event (`:1014`, `:546-548`) | panel rect ∩ hovered-country bbox = 0 px²; panel fully inside container; `picks/frames ≤ 1.02`; `renders` flat during sweep; tap-1/tap-2 at 375 with `hasTouch`; zero `dialog` in landing |

### Report contract

- **Ringkasan**: Contract for K7/K8/K9 in `docs/CONTRACT_SCENE_B.md`: measured `HERO_POSE` (no duplicated constants), single-easing intro with explicit camera ownership, hover→panel API with change-only callbacks and a roving-tabindex keyboard path, 2-object terrain at 12 672 tris, palette with computed contrast, budgets, DEV-gated hooks.
- **Klaim**: `AsiaScene.tsx` no longer contains `targetSpan=1.98`/`offsetRight=7.0`; hover already raycasts ≤1/frame; intro currently starts at GLB load, not preloader exit; `measureInk` hides only `ground` and will mis-measure once terrain exists.
- **Bukti**: `src/scene/AsiaScene.tsx:829-831,335,981-984,1051-1064,1296-1300,992-998,1005-1021,582-589,713-719,429-435,439,573,833-937,844-846,1270-1274,625-641,591-605,1074-1088,155-164,868-927,976-1111`; `src/app/pages/LandingPage.tsx:7,30,36-37,47-56,321-322,340-343,361-367`; `src/sections/landing/AsiaSceneLazy.tsx:144-146`; `src/app/routes.tsx:8`; `src/styles/tokens.css:10-41`; `playwright.config.ts:22`; `e2e/gates.spec.ts:196-221`; `e2e/landing.spec.ts:192-205,213`; `e2e/round4-gates.spec.ts:24,204`; ratios from WCAG 2.x relative luminance (node, sRGB).
- **Tidak diketahui**: no `heightVh ≥ 70` gate exists today (only `widthVw`), so that floor is a new assertion with no baseline; current draw-call/triangle baseline was never recorded; the designer's in-flight edit may land `fitTargetNdcY=0.315` and move `HERO_POSE` — recapture, don't port; the 14/255 anti-flat threshold is uncalibrated; 60 fps on integrated graphics cannot be proven in this headless env (~3 fps measured).
- **Risiko**: K7 and K8 depend on capturing `HERO_POSE` after the designer's edit settles. Removing the dialog breaks `e2e/landing.spec.ts:192-205` in the same commit. Leaving `CountryDialog` mounted violates K9 (`PRD_V2_6_DELTA.md:134`).
