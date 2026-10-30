"use client";

import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";

import { EASE } from "@/components/coming-soon/Reveal";

interface SampleOtherRevealProps {
  /** True when the "Other" option is picked. */
  isOpen: boolean;
  children: ReactNode;
}

/** Opens the "Other" text field smoothly under its chips instead of letting the page jump. */
export function SampleOtherReveal({ isOpen, children }: SampleOtherRevealProps) {
  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22, ease: EASE }}
          className="overflow-hidden"
        >
          <div className="pt-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
