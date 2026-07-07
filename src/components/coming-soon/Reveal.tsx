"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

/** DS strong ease-out — no bounce, matches `--wi-ease-out`. Shared across the page's motion. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const revealVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, delay },
  }),
};

/** Fades + lifts a block into view once, when it scrolls in. */
interface RevealProps {
  children: ReactNode;
  /** Extra delay in ms (for staggering sibling reveals). */
  delay?: number;
  className?: string;
}

/** Single-block scroll reveal. */
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

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Reveals its `RevealItem` children in a staggered cascade on scroll. */
export function RevealGroup({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={groupVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
    >
      {children}
    </motion.div>
  );
}

/** A single staggered child inside a `RevealGroup`. */
export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
