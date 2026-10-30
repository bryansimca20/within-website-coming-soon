// WITHIN box turntable — WebGL scene with naturally bowed panels, floating at a lean.
// Loaded lazily by SampleBox3D so three.js stays out of the initial bundle.
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type BoxSceneOptions = {
  textures: { front: string; back: string; left: string; right: string };
  tilt?: number;
  speed?: number;
  initialAngle?: number;
  bulge?: number;
  lean?: number;
  lift?: number;
  onFace?: (phi: number) => void;
  onAngle?: (deg: number) => void;
  /** Called once, after every texture has loaded and the first textured frame is drawn. */
  onReady?: () => void;
};

export type BoxScene = {
  readonly paused: boolean;
  setPaused(p: boolean): void;
  goTo(phi: number): void;
  turn(dir: 1 | -1): void;
  dispose(): void;
};

export function createBoxScene(host: HTMLElement, opts: BoxSceneOptions): BoxScene {
  const {
    textures,                 // { front, back, left, right } image URLs
    tilt: restTilt = 4,       // camera below the box centre, degrees (positive = looking up)
    speed = 14,               // idle spin, deg/s
    initialAngle = -28,
    bulge = 1.3,              // 0 = flat panels, ~1.3 = natural, 2.5 = exaggerated
    lean = 20,                // degrees the box leans, top to the right (negative = left)
    lift = 0.35,              // gap between the box and the floor, in box widths
    onFace = () => {},        // (phi) called when the face nearest the camera changes
    onAngle = () => {},       // (deg 0–359)
    onReady = () => {},       // first fully textured frame is on screen
  } = opts;

  const W = 1, D = 0.6, H = 3.75;           // measured proportions of the sample box
  const rad = (d: number) => (d * Math.PI) / 180;
  const shortest = (d: number) => (((d % 360) + 540) % 360) - 180;
  const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

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
  scene.environmentIntensity = 0.5;

  const key = new THREE.DirectionalLight(0xffffff, 1.5);
  key.position.set(-3.2, 5, 6);
  const rim = new THREE.DirectionalLight(0xffffff, 0.55);
  rim.position.set(4, 2, -5);
  scene.add(key, rim);

  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  // ---------- geometry: bowed panels ----------
  // Each side is a dense plane pushed outward: full bow across the width (sine),
  // held flat for the last ~10% at top and bottom where the tuck flaps pin it.
  // Vertex normals near every crease are bent 45° toward the neighbouring face,
  // so folds read as slightly rounded paperboard instead of razor-sharp CG edges.
  function panel(w: number, h: number, amp: number, material: THREE.Material) {
    const g = new THREE.PlaneGeometry(w, h, 32, 90);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      const u = x / w + 0.5, v = y / h + 0.5;
      const across = Math.sin(Math.PI * u);
      const along = smooth(v / 0.1) * smooth((1 - v) / 0.1) * (0.72 + 0.28 * Math.sin(Math.PI * v));
      p.setZ(i, amp * across * along);
    }
    g.computeVertexNormals();
    const n = g.attributes.normal, r = 0.024;
    const tmp = new THREE.Vector3();
    for (let i = 0; i < n.count; i++) {
      const x = p.getX(i), y = p.getY(i);
      tmp.set(n.getX(i), n.getY(i), n.getZ(i));
      const dx = w / 2 - Math.abs(x), dy = h / 2 - Math.abs(y);
      if (dx < r) tmp.x += Math.sign(x) * Math.pow(1 - dx / r, 2) * tmp.z;
      if (dy < r) tmp.y += Math.sign(y) * Math.pow(1 - dy / r, 2) * tmp.z;
      tmp.normalize();
      n.setXYZ(i, tmp.x, tmp.y, tmp.z);
    }
    return new THREE.Mesh(g, material);
  }

  const loader = new THREE.TextureLoader();
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  let dirty = true;
  // Textures still loading; the scene reports ready only once all of them are drawn.
  let pendingTextures = 0, texturesDone = false, announced = false;
  const settle = () => { dirty = true; if (--pendingTextures === 0) texturesDone = true; };
  const tex = (src: string) => {
    pendingTextures++;
    const t = loader.load(src, settle, undefined, settle);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = aniso;
    return t;
  };
  // Gloss laminate over dark board.
  const board = (map?: THREE.Texture) =>
    new THREE.MeshPhysicalMaterial({
      map: map || null,
      color: map ? 0xffffff : 0x1c1b1b,
      roughness: 0.45,
      metalness: 0,
      clearcoat: 0.4,
      clearcoatRoughness: 0.28,
    });

  // Floating pose: the box leans (top to the right) and hovers above the floor,
  // spinning around its own tilted long axis.
  const LEAN = rad(lean);
  const halfSpan = (H / 2) * Math.cos(LEAN) + (W / 2) * Math.abs(Math.sin(LEAN)); // half its on-screen height
  const FLOAT_Y = halfSpan + lift;                                         // box centre above the floor
  const box = new THREE.Group();
  const spin = new THREE.Group();
  spin.add(box);
  const pose = new THREE.Group();
  pose.position.y = FLOAT_Y;
  pose.rotation.z = -LEAN;
  pose.add(spin);
  scene.add(pose);

  const ampW = 0.034 * bulge, ampD = 0.026 * bulge;
  const front = panel(W, H, ampW, board(tex(textures.front)));
  front.position.z = D / 2;
  const back = panel(W, H, ampW, board(tex(textures.back)));
  back.rotation.y = Math.PI; back.position.z = -D / 2;
  const right = panel(D, H, ampD, board(tex(textures.right)));
  right.rotation.y = Math.PI / 2; right.position.x = W / 2;
  const left = panel(D, H, ampD, board(tex(textures.left)));
  left.rotation.y = -Math.PI / 2; left.position.x = -W / 2;
  const top = panel(W, D, 0.006 * bulge, board());
  top.rotation.x = -Math.PI / 2; top.position.y = H / 2;
  const bottom = panel(W, D, 0.004 * bulge, board());
  bottom.rotation.x = Math.PI / 2; bottom.position.y = -H / 2;
  box.add(front, back, right, left, top, bottom);

  // Soft floor shadow far below the floating box: wide, very blurred, slightly left
  // (under the leaning top). It fades and spreads as the box bobs up.
  const sc = document.createElement("canvas");
  sc.width = 512; sc.height = 256;
  const cx = sc.getContext("2d")!;
  const grd = cx.createRadialGradient(256, 128, 0, 256, 128, 128);
  grd.addColorStop(0, "rgba(0,0,0,0.85)");
  grd.addColorStop(0.45, "rgba(0,0,0,0.4)");
  grd.addColorStop(1, "rgba(0,0,0,0)");
  cx.setTransform(2, 0, 0, 1, -256, 0); // stretch the round gradient into an ellipse
  cx.fillStyle = grd;
  cx.fillRect(0, 0, 512, 256);
  const shadowTex = new THREE.CanvasTexture(sc);
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, opacity: 0.5 });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(W * 3.6, W * 3.2), shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set((H / 2) * Math.sin(LEAN) * 0.35, 0.002, 0);
  scene.add(shadow);

  // ---------- camera ----------
  // Aimed between the box and its shadow so both sit in frame; the camera stays
  // `tilt` degrees below the box centre, so the box is seen slightly from below.
  const frameHalf = (FLOAT_Y + halfSpan) / 2 + 0.15;
  const target = new THREE.Vector3(0, frameHalf - 0.15, 0);
  function placeCamera(t: number, floatY: number) {
    const fit = (frameHalf * 1.12) / Math.tan(rad(camera.fov / 2));
    const e = rad(-t);
    camera.position.set(0, floatY + fit * Math.sin(e), fit * Math.cos(e));
    camera.position.y = Math.max(1.2, camera.position.y); // keep the floor shadow readable
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
  let target2: number | null = null;
  let dragging = false, lastX = 0, lastY = 0, lastT = 0, last = performance.now();
  let raf = 0, visible = true;
  let lastFace: number | null = null, lastDeg: number | null = null;

  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const prevA = angle, prevT = tilt;
    if (!dragging) {
      if (target2 !== null) {
        const diff = shortest(target2 - angle);
        angle += diff * Math.min(1, dt * 7);
        if (Math.abs(diff) < 0.05) { angle = target2; target2 = null; }
        vel = 0;
      } else {
        vel += ((paused ? 0 : speed) - vel) * Math.min(1, dt * 1.8);
        angle += vel * dt;
      }
      tilt += (restTilt - tilt) * Math.min(1, dt * 4);
    }
    // Gentle hover: slow bob and a slight sway of the lean (off for reduced motion).
    const hover = !reduce.matches;
    const s = now / 1000;
    if (hover || dirty || angle !== prevA || Math.abs(tilt - prevT) > 1e-4 || dragging) {
      const bob = hover ? Math.sin(s * 1.1) * 0.06 : 0;
      pose.position.y = FLOAT_Y + bob;
      pose.rotation.z = -LEAN + (hover ? rad(1.2) * Math.sin(s * 0.7) : 0);
      // closer to the floor = tighter, darker shadow
      shadowMat.opacity = 0.62 - lift * 0.13 - bob * 1.2;
      shadow.scale.setScalar(0.7 + lift * 0.35 + bob * 0.6);
      spin.rotation.y = rad(angle);
      placeCamera(tilt, FLOAT_Y);
      renderer.render(scene, camera);
      if (texturesDone && !announced) { announced = true; onReady(); }
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
    dragging = true; target2 = null; vel = 0;
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
    goTo(phi: number) { target2 = angle + shortest(-phi - angle); paused = true; },
    turn(dir: 1 | -1) {
      const cur = target2 ?? angle;
      target2 = Math.round((cur + dir * 90) / 90) * 90;
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
