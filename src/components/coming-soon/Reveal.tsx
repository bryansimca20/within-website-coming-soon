"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

/**
 * Emil-design-eng strong ease-out — starts fast, feels responsive. Shared across
 * every scroll reveal and entrance on the page. Matches CSS `--ease-out`.
 */
export const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

interface RevealProps {
  children: ReactNode;
  /** Extra delay in ms (to stagger sibling reveals). */
  delay?: number;
  className?: string;
}

/** Fades + lifts a block into view once, from an already-laid-out position. */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <motion.div
      className={className}
      custom={delay / 1000}
      variants={revealVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
    >
      {children}
    </motion.div>
  );
}
