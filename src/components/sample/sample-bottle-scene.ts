// WITHIN bottle turntable — WebGL scene of the black squeeze bottle, floating at a lean.
// Shape is a lathe traced from a straight-on photo; logos are printed onto the body
// from the brand files. Loaded lazily by SampleBottle3D so three.js stays out of the
// initial bundle.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type BottleSceneOptions = {
  /** White logomark + white logotype image URLs (transparent PNG/WebP). */
  logos: { mark: string; word: string };
  tilt?: number;
  speed?: number;
  initialAngle?: number;
  lean?: number;
  lift?: number;
  onFace?: (phi: number) => void;
  onAngle?: (deg: number) => void;
  /** Called once, after both logos have loaded and the first printed frame is drawn. */
  onReady?: () => void;
};

export type BottleScene = {
  readonly paused: boolean;
  setPaused(p: boolean): void;
  goTo(phi: number): void;
  turn(dir: 1 | -1): void;
  dispose(): void;
};

// ---------- traced profile ----------
// Pixels from the straight-on photo: [distance from the top, radius]. Body diameter = 834 px.
const PX = 834;
const H_PX = 2604;
const VALVE: [number, number][] = [
  [0, 0], [2, 40], [8, 82], [18, 98], [34, 104], [52, 101], [66, 88], [80, 77],
  [98, 84], [128, 102], [160, 110], [192, 113], [216, 113],
];
const CAP: [number, number][] = [
  [204, 111], [222, 132], [236, 146], [244, 152], [258, 178], [276, 216], [294, 258],
  [306, 292], [314, 326], [322, 350], [334, 364], [352, 372], [390, 376], [450, 380],
  [506, 386], [522, 386], [530, 380], [535, 366], [538, 340],
];
const BODY: [number, number][] = [
  [534, 330], [538, 380], [544, 390], [552, 393], [600, 393], [640, 389], [680, 374],
  [720, 348], [756, 328], [788, 321], [816, 327], [852, 352], [892, 384], [930, 403],
  [970, 413], [1010, 417], [1300, 417.5], [1600, 417.5], [1900, 417.5], [2150, 417],
  [2210, 415.5], [2260, 412], [2310, 403], [2360, 390], [2410, 372], [2460, 348],
  [2500, 322], [2536, 292], [2564, 262], [2584, 232], [2597, 200], [2603, 165],
  [2604, 120], [2602, 60], [2600, 0],
];

// Where the prints sit (fractions of bottle height from the top, measured from the photos).
const MARK_Y = 0.66, MARK_ARC = 74;        // logomark spans ~74° around the bottle
const WORD_Y = 0.675, WORD_LEN = 2.17 / 2; // logotype length in bottle diameters

export function createBottleScene(host: HTMLElement, opts: BottleSceneOptions): BottleScene {
  const {
    logos,
    tilt: restTilt = 4,       // camera below the bottle centre, degrees (positive = looking up)
    speed = 14,               // idle spin, deg/s
    initialAngle = -28,
    lean = 20,                // degrees the bottle leans, top to the right (negative = left)
    lift = 0.35,              // gap between the bottle and the floor, in bottle diameters
    onFace = () => {},        // (phi) called when the side nearest the camera changes
    onAngle = () => {},       // (deg 0–359)
    onReady = () => {},       // first fully printed frame is on screen
  } = opts;

  const W = 1, H = H_PX / PX;                 // diameter 1, height ≈ 3.12
  const rad = (d: number) => (d * Math.PI) / 180;
  const shortest = (d: number) => (((d % 360) + 540) % 360) - 180;

  // ---------- renderer / scene ----------
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.domElement.style.cssText = "display:block;width:100%;height:100%;";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  scene.environment = envRT.texture;
  scene.environmentIntensity = 0.7;

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-3.2, 5, 6);
  const rim = new THREE.DirectionalLight(0xffffff, 0.9);
  rim.position.set(4, 2, -5);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  // ---------- geometry ----------
  // Profile → lathe points (bottom up, centred on the bottle's middle).
  const SEG = 160;
  // Traced points are resampled along a smooth spline so the silhouette has no facets.
  const toPts = (prof: [number, number][], n: number) => {
    const raw = prof.map(([y, r]) => new THREE.Vector2(r / PX, (H_PX / 2 - y) / PX)).reverse();
    const pts = new THREE.SplineCurve(raw).getSpacedPoints(n);
    pts[0].x = Math.max(0, pts[0].x); pts[pts.length - 1].x = Math.max(0, pts[pts.length - 1].x);
    return pts;
  };
  function lathe(prof: [number, number][], steps: number, shape?: (p: THREE.Vector3, phi: number) => void) {
    const pts = toPts(prof, steps);
    const g = new THREE.LatheGeometry(pts, SEG);
    const p = g.attributes.position, uv = g.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.set(p.getX(i), p.getY(i), p.getZ(i));
      const phi = Math.atan2(v.x, v.z);
      if (shape) { shape(v, phi); p.setXYZ(i, v.x, v.y, v.z); }
      uv.setY(i, v.y / H + 0.5);   // height-based v so prints keep their proportions
    }
    g.computeVertexNormals();
    // weld the wrap seam: first and last columns share position, so share the normal too
    const n = g.attributes.normal, rows = pts.length;
    for (let j = 0; j < rows; j++) {
      const a = j, b = SEG * rows + j;
      v.set(n.getX(a) + n.getX(b), n.getY(a) + n.getY(b), n.getZ(a) + n.getZ(b)).normalize();
      n.setXYZ(a, v.x, v.y, v.z); n.setXYZ(b, v.x, v.y, v.z);
    }
    return g;
  }

  // Cap skirt: eight shallow grip windows around the upper skirt.
  const capTop = (H_PX / 2 - 330) / PX, capLow = (H_PX / 2 - 470) / PX;
  const notch = (v: THREE.Vector3, phi: number) => {
    if (v.y > capTop || v.y < capLow - 0.04) return;
    const k = Math.PI / 4;
    const a = Math.abs((((phi % k) + k) % k) - k / 2);        // distance to window centre
    const across = 1 - THREE.MathUtils.smoothstep(a, rad(5.5), rad(7.5));
    const down = v.y >= capLow ? 1 : 1 - (capLow - v.y) / 0.04; // rounded lower edge
    const depth = 0.012 * across * Math.max(0, down);
    const r = Math.hypot(v.x, v.z);
    if (r > 0) { const s = (r - depth) / r; v.x *= s; v.z *= s; }
  };

  // Printed body: canvas wrapped once around (u) over the full bottle height (v).
  const TEX = 2048;
  const canvas = document.createElement("canvas");
  canvas.width = TEX; canvas.height = TEX;
  const ctx = canvas.getContext("2d")!;
  const BODY_COLOR = "#222222";
  ctx.fillStyle = BODY_COLOR;
  ctx.fillRect(0, 0, TEX, TEX);
  const printTex = new THREE.CanvasTexture(canvas);
  printTex.colorSpace = THREE.SRGBColorSpace;
  printTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const circ = Math.PI * W;            // circumference in bottle units
  const pxU = TEX / circ, pxV = TEX / H;
  let pending = 2, printed = false, announced = false, dirty = true;
  const draw = (img: HTMLImageElement, which: "mark" | "word") => {
    ctx.save();
    ctx.globalAlpha = 0.94;            // slightly off-white, like the print
    if (which === "mark") {
      const w = (rad(MARK_ARC) * (W / 2)) * pxU;
      const h = w * (img.naturalHeight / img.naturalWidth) * (pxV / pxU);
      const y = MARK_Y * TEX - h / 2;
      // centred on u = 0 (front, +z): straddles the wrap seam, so draw it on both edges
      ctx.drawImage(img, -w / 2, y, w, h);
      ctx.drawImage(img, TEX - w / 2, y, w, h);
    } else {
      const len = WORD_LEN * pxV;
      const thick = (WORD_LEN / (img.naturalWidth / img.naturalHeight)) * pxU;
      ctx.translate(TEX / 2, WORD_Y * TEX);   // u = 0.5: the back
      ctx.rotate(-Math.PI / 2);               // reads bottom to top
      ctx.drawImage(img, -len / 2, -thick / 2, len, thick);
    }
    ctx.restore();
    printTex.needsUpdate = true;
  };
  const settle = () => { dirty = true; if (--pending === 0) printed = true; };
  const load = (src: string, which: "mark" | "word") => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => { draw(img, which); settle(); };
    img.onerror = settle;
    img.src = src;
  };
  load(logos.mark, "mark");
  load(logos.word, "word");

  // Soft-touch matte body, glossy cap, satin rubber valve.
  const bodyMat = new THREE.MeshPhysicalMaterial({
    map: printTex, roughness: 0.6, metalness: 0, sheen: 0.35, sheenRoughness: 0.7, sheenColor: 0x9a9a9a,
  });
  const capMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a0a0a, roughness: 0.3, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.2,
    envMapIntensity: 0.45,
  });
  const valveMat = new THREE.MeshPhysicalMaterial({ color: 0x161616, roughness: 0.55, metalness: 0 });

  const bottle = new THREE.Group();
  bottle.add(
    new THREE.Mesh(lathe(BODY, 260), bodyMat),
    new THREE.Mesh(lathe(CAP, 120, notch), capMat),
    new THREE.Mesh(lathe(VALVE, 60), valveMat),
  );

  // Floating pose: the bottle leans (top to the right) and hovers above the floor,
  // spinning around its own tilted long axis.
  const LEAN = rad(lean);
  const halfSpan = (H / 2) * Math.cos(LEAN) + (W / 2) * Math.abs(Math.sin(LEAN));
  const FLOAT_Y = halfSpan + lift;
  const spin = new THREE.Group();
  spin.add(bottle);
  const pose = new THREE.Group();
  pose.position.y = FLOAT_Y;
  pose.rotation.z = -LEAN;
  pose.add(spin);
  scene.add(pose);

  // Soft floor shadow below the floating bottle, wide and blurred, slightly offset under the lean.
  const sc = document.createElement("canvas");
  sc.width = 512; sc.height = 256;
  const cx = sc.getContext("2d")!;
  const grd = cx.createRadialGradient(256, 128, 0, 256, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,0.85)");
  grd.addColorStop(0.45, "rgba(0,0,0,0.4)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  cx.setTransform(2, 0, 0, 1, -256, 0);
  cx.fillStyle = grd;
  cx.fillRect(0, 0, 512, 256);
  const shadowTex = new THREE.CanvasTexture(sc);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 2.6, W * 2.4), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set((H / 2) * Math.sin(LEAN) * 0.35, 0.002, 0);
  scene.add(shadow);

  // ---------- camera ----------
  const frameHalf = (FLOAT_Y + halfSpan) / 2 + 0.15;
  const target = new THREE.Vector3(0, frameHalf - 0.15, 0);
  function placeCamera(t: number, floatY: number) {
    const fit = (frameHalf * 1.12) / Math.tan(rad(camera.fov / 2));
    const e = rad(-t);
    camera.position.set(0, floatY + fit * Math.sin(e), fit * Math.cos(e));
    camera.position.y = Math.max(1.2, camera.position.y);
    camera.lookAt(target);
  }

  function resize() {
    const w = host.clientWidth || 1, h = host.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();

  // ---------- motion ----------
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  let angle = initialAngle, tilt = restTilt, vel = 0, paused = reduce.matches;
  let goal: number | null = null;
  let dragging = false, lastX = 0, lastY = 0, lastT = 0, last = performance.now();
  let raf = 0, visible = true;
  let lastFace: number | null = null, lastDeg: number | null = null;

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const prevA = angle, prevT = tilt;
    if (!dragging) {
      if (goal !== null) {
        const diff = shortest(goal - angle);
        angle += diff * Math.min(1, dt * 7);
        if (Math.abs(diff) < 0.05) { angle = goal; goal = null; }
        vel = 0;
      } else {
        vel += ((paused ? 0 : speed) - vel) * Math.min(1, dt * 1.8);
        angle += vel * dt;
      }
      tilt += (restTilt - tilt) * Math.min(1, dt * 4);
    }
    const hover = !reduce.matches;
    const s = now / 1000;
    if (hover || dirty || angle !== prevA || Math.abs(tilt - prevT) > 1e-4 || dragging) {
      const bob = hover ? Math.sin(s * 1.1) * 0.06 : 0;
      pose.position.y = FLOAT_Y + bob;
      pose.rotation.z = -LEAN + (hover && lean !== 0 ? rad(1.2) * Math.sin(s * 0.7) : 0); // upright stays plumb
      shadowMat.opacity = 0.62 - lift * 0.13 - bob * 1.2;
      shadow.scale.setScalar(0.7 + lift * 0.35 + bob * 0.6);
      spin.rotation.y = rad(angle);
      placeCamera(tilt, FLOAT_Y);
      renderer.render(scene, camera);
      if (printed && !announced) { announced = true; onReady(); }
      dirty = false;
      let best = -2, bestPhi = 0;
      for (const phi of [0, 90, 180, 270]) {
        const c = Math.cos(rad(phi + angle));
        if (c > best) { best = c; bestPhi = phi; }
      }
      if (bestPhi !== lastFace) { lastFace = bestPhi; onFace(bestPhi); }
      const deg = Math.round(((-angle % 360) + 360) % 360);
      if (deg !== lastDeg) { lastDeg = deg; onAngle(deg); }
    }
    raf = visible ? requestAnimationFrame(frame) : 0;
  }

  const el = host;
  const onDown = (e: PointerEvent) => {
    dragging = true; goal = null; vel = 0;
    lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
    el.setPointerCapture(e.pointerId);
    el.dataset.dragging = "true";
  };
  const onMove = (e: PointerEvent) => {
    if (!dragging) return;
    const now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
    const dx = e.clientX - lastX, dy = e.clientY - lastY;
    angle += dx * 0.55;
    tilt = Math.max(restTilt - 18, Math.min(restTilt + 14, tilt - dy * 0.15));
    vel = vel * 0.6 + ((dx * 0.55) / dt) * 0.4;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    delete el.dataset.dragging;
    vel = Math.max(-720, Math.min(720, vel));
  };
  el.addEventListener("pointerdown", onDown);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", onUp);
  el.addEventListener("pointercancel", onUp);

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });
  io.observe(host);
  raf = requestAnimationFrame(frame);

  return {
    get paused() { return paused; },
    setPaused(p: boolean) { paused = p; },
    goTo(phi: number) { goal = angle + shortest(-phi - angle); paused = true; },
    turn(dir: 1 | -1) {
      const cur = goal ?? angle;
      goal = Math.round((cur + dir * 90) / 90) * 90;
      paused = true;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect(); ro.disconnect();
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          const m = o.material as THREE.MeshPhysicalMaterial | THREE.MeshBasicMaterial;
          m.map?.dispose();
          m.dispose();
        }
      });
      envRT.dispose(); pmrem.dispose(); renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
