"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import type { BottleScene } from "./sample-bottle-scene";
import styles from "./SampleBottle3D.module.css";

/**
 * Rotating 3D WITHIN squeeze bottle (matte black), rendered with three.js.
 * The shape is traced from a straight-on photo; the logomark (front) and the vertical
 * WITHIN logotype (back) are printed onto the body from /public/sample/bottle/.
 *
 * - Floats above the floor leaning `lean`° (top to the right) with a gentle hover,
 *   spinning around its own tilted axis. Camera sits slightly below the bottle centre.
 * - Auto-rotates slowly; drag (mouse/touch) to spin with inertia.
 * - Arrow keys turn 90°, Space pauses. Honors prefers-reduced-motion (starts paused).
 * - three.js is loaded lazily, only once the bottle scrolls near the viewport.
 *   The bottle fades in once its prints are drawn; a still render shows only without WebGL.
 */

type Props = {
  /** Bottle diameter on screen. Height is 3.12× (measured from the real bottle). */
  width?: string;
  /** Degrees per second when idle. 0 = static. */
  speed?: number;
  /** Starting turn in degrees. 0 faces the logomark, 180 the WITHIN logotype. */
  initialAngle?: number;
  /** Camera angle in degrees. Positive = looking up from below, negative = looking down. */
  tilt?: number;
  /** Lean in degrees, top to the right. Negative leans left, 0 = upright (no sway). */
  lean?: number;
  /** Gap between bottle and floor, in bottle diameters. */
  lift?: number;
  className?: string;
};

const LOGOS = {
  mark: "/sample/bottle/logomark.webp",
  word: "/sample/bottle/wordmark.webp",
};
const POSTERS = {
  leaning: "/sample/bottle/bottle-poster.webp",
  upright: "/sample/bottle/bottle-poster-upright.webp",
};

export function SampleBottle3D({
  width = "clamp(96px, 19vw, 140px)",
  speed = 14,
  initialAngle = -28,
  tilt = 4,
  lean = 20,
  lift = 0.35,
  className,
}: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<BottleScene | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let cancelled = false;

    const start = async () => {
      try {
        const { createBottleScene } = await import("./sample-bottle-scene");
        if (cancelled) return;
        sceneRef.current = createBottleScene(stage, {
          logos: LOGOS, speed, initialAngle, tilt, lean, lift,
          onReady: () => { if (!cancelled) setReady(true); },
        });
      } catch {
        // No WebGL: show the still render instead.
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
  }, [speed, initialAngle, tilt, lean, lift]);

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
      style={{ "--w": width } as CSSProperties}
      data-ready={ready || undefined}
      data-failed={failed || undefined}
      tabIndex={0}
      role="img"
      aria-label="WITHIN black squeeze bottle, rotating. Drag or use the arrow keys to turn it."
      onKeyDown={onKeyDown}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.poster} src={lean === 0 ? POSTERS.upright : POSTERS.leaning} alt="" aria-hidden="true" />
    </div>
  );
}
