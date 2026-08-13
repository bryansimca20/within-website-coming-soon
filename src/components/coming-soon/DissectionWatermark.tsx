"use client";

import { AnimatePresence, motion } from "motion/react";

import { EASE } from "./Reveal";

/** The mark each reading prints behind the page, in dissection order. */
const MARKS = ["Na", "K", "Mg", "0"];

/**
 * The dissection's backdrop: the active reading set enormous and nearly invisible, so the
 * field itself is the data. Non-interactive; drop it in as the first child of the stage.
 */
export function DissectionWatermark({ step }: { step: number }) {
  const mark = MARKS[Math.min(step, MARKS.length - 1)];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mark}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="wi-readout absolute -bottom-[9%] left-[-3%] text-[46vw] font-semibold leading-none tracking-[-0.06em] text-wi-black/[0.05] lg:text-[27vw]"
        >
          {mark}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
