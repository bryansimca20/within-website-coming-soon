"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

/**
 * Emil-design-eng strong ease-out — starts fast, feels responsive. Shared across
 * every scroll reveal and entrance on the page. Matches CSS `--ease-out`.
 */
export const EASE: [number, number, number, number] = [0.23, 1, 0.32, 1];

/** The one spring — press/hover feedback only. Subtle, never on reveals or loops. */
export const TOUCH_SPRING = { type: "spring", stiffness: 360, damping: 28 } as const;

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

const groupVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Reveals its `RevealItem` children in a staggered cascade on scroll (30-80ms feel). */
export function RevealGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
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
export function RevealItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
