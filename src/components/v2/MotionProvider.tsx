"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** Makes every Motion animation on the page honor `prefers-reduced-motion` (drops movement, keeps fades). */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
