"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { BoxScene } from "./sample-box-scene";
import styles from "./SampleBox3D.module.css";

/**
 * Rotating 3D WITHIN box (Electrolytes Orange sample box), rendered with three.js.
 * Textures are flattened photos of the four sides in /public/sample/box/.
 *
 * - Panels bow outward like a real assembled carton; creases are softly rounded.
 * - Floats above the floor leaning `lean`° (top to the right) with a gentle hover,
 *   spinning around its own tilted axis. Camera sits slightly below the box centre.
 * - Auto-rotates slowly; drag (mouse/touch) to spin with inertia.
 * - Arrow keys turn 90°, Space pauses. Honors prefers-reduced-motion (starts paused).
 * - three.js is loaded lazily, only once the box scrolls near the viewport.
 *   The box fades in once its textures are drawn; the front photo shows only without WebGL.
 */

type Props = {
  /** Front-face width. Height is 3.75×, depth 0.6× (measured from the real box). */
  width?: string;
  /** Degrees per second when idle. 0 = static. */
  speed?: number;
  /** Starting turn in degrees (negative shows the Hydration side). */
  initialAngle?: number;
  /** Camera angle in degrees. Positive = looking up from below, negative = looking down. */
  tilt?: number;
  /** Panel bow. 0 = flat, ~1.3 = natural, 2.5 = exaggerated. */
  bulge?: number;
  /** Lean in degrees, top to the right. Negative leans left, 0 = upright. */
  lean?: number;
  /** Gap between box and floor, in box widths. */
  lift?: number;
  className?: string;
};

const TEXTURES = {
  front: "/sample/box/box-front.webp",
  back: "/sample/box/box-back.webp",
  right: "/sample/box/box-right.webp",
  left: "/sample/box/box-left.webp",
};

export function SampleBox3D({
  width = "clamp(84px, 17vw, 124px)",
  speed = 14,
  initialAngle = -28,
  tilt = 4,
  bulge = 1.3,
  lean = 20,
  lift = 0.35,
  className,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BoxScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;

    const start = async () => {
      try {
        const { createBoxScene } = await import("./sample-box-scene");
        if (cancelled) return;
        sceneRef.current = createBoxScene(stage, {
          textures: TEXTURES, speed, initialAngle, tilt, bulge, lean, lift,
          onReady: () => { if (!cancelled) setReady(true); },
        });
      } catch {
        // No WebGL: show the static front photo instead.
        if (!cancelled) setFailed(true);
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { io.disconnect(); void start(); }
      },
      { rootMargin: "200px" }
    );
    io.observe(stage);

    return () => {
      cancelled = true;
      io.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
      setReady(false);
    };
  }, [speed, initialAngle, tilt, bulge, lean, lift]);

  const onKeyDown = (e: KeyboardEvent) => {
    const scene = sceneRef.current;
    if (!scene) return;
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      scene.turn(e.key === "ArrowRight" ? 1 : -1);
    } else if (e.key === " ") {
      e.preventDefault();
      scene.setPaused(!scene.paused);
    }
  };

  return (
    <div
      ref={stageRef}
      className={[styles.stage, className].filter(Boolean).join(" ")}
      style={{ "--w": width, "--lean": `${lean}deg` } as CSSProperties}
      data-ready={ready || undefined}
      data-failed={failed || undefined}
      tabIndex={0}
      role="img"
      aria-label="WITHIN Electrolytes Orange samples, rotating. Drag or use the arrow keys to turn it."
      onKeyDown={onKeyDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.poster} src={TEXTURES.front} alt="" aria-hidden="true" />
    </div>
  );
}
