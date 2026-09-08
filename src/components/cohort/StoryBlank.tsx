"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

interface StoryBlankProps {
  className?: string;
}

/**
 * The space a founding member's story will occupy, drawn as a deliberately empty field
 * rather than left as absence: a labelled readout with a caret waiting to be typed into.
 * Its own client component so the panels around it stay server-rendered.
 */
export function StoryBlank({ className }: StoryBlankProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-baseline justify-between gap-3 border-t border-wi-on-dark-line pt-3">
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-wi-on-dark-2">
          Story
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-wi-on-dark-2">
          To be written
        </span>
      </div>
      <div className="mt-7 flex min-h-[112px] items-start">
        {/* The one authored moment on the page: a terminal-square blink, so the field reads
            as awaiting input rather than as something that failed to load. */}
        <motion.span
          aria-hidden
          className="block h-[30px] w-[10px] bg-wi-on-dark-1"
          animate={reduceMotion ? undefined : { opacity: [1, 1, 0, 0] }}
          transition={
            reduceMotion
              ? undefined
              : { duration: 1.06, times: [0, 0.5, 0.5, 1], ease: "linear", repeat: Infinity }
          }
        />
      </div>
    </div>
  );
}
