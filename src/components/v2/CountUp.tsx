"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

import { EASE } from "./Reveal";

interface CountUpProps {
  /** The final value to count to. */
  value: number;
  /** Optional formatter; defaults to a locale integer (1000 -> "1,000"). */
  format?: (n: number) => string;
  /** Count duration in seconds. */
  duration?: number;
  className?: string;
}

/**
 * A number that counts up from zero the first time it scrolls into view. Rendered
 * in the mono readout voice by the caller's className. Under reduced-motion it
 * renders the final value immediately (and no-JS shows the final value too).
 */
export function CountUp({ value, format, duration = 1.1, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });
  const reduce = useReducedMotion();
  const fmt = format ?? ((n: number) => Math.round(n).toLocaleString("en-US"));

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce || !inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // fmt is derived from format; value/duration are primitives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, duration, reduce]);

  // Initial paint: final value when reduced/no-JS, else zero (the effect animates up).
  return (
    <span ref={ref} className={className}>
      {reduce ? fmt(value) : fmt(0)}
    </span>
  );
}
