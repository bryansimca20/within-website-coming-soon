"use client";

import { motion } from "motion/react";

import { EASE } from "@/components/coming-soon/Reveal";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SAMPLE_COPY } from "./utils/sample-copy";

interface SampleStepIndicatorProps {
  /** 1-based position in `labels`. */
  step: number;
  /** One name per step; the bar count follows its length. */
  labels: readonly string[];
  /** "Step 2 of 5", "Question 2 of 6". */
  counter: (step: number) => string;
  /** Goes one step back. Absent on a first step with nowhere to go back to. */
  onBack?: () => void;
}

/** Back at the top left, then one bar per step that fills as the visitor moves on, then the step's name and count. */
export function SampleStepIndicator({ step, labels, counter, onBack }: SampleStepIndicatorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      {onBack === undefined ? (
        <span aria-hidden className="block min-h-11" />
      ) : (
        <button
          type="button"
          onClick={onBack}
          className="-ml-1 flex min-h-11 cursor-pointer items-center gap-1.5 self-start px-1 text-[15px] leading-5 font-semibold transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none"
        >
          <WaitlistArrowGlyph className="size-4 rotate-180" />
          {SAMPLE_COPY.back}
        </button>
      )}
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))` }} aria-hidden>
        {labels.map((label, index) => (
          <span key={label} className="h-1 overflow-hidden bg-brand-mist">
            <motion.span
              className="block h-full origin-left bg-brand-ink"
              initial={{ scaleX: index < step - 1 ? 1 : 0 }}
              animate={{ scaleX: index < step ? 1 : 0 }}
              transition={{ duration: 0.32, ease: EASE }}
            />
          </span>
        ))}
      </div>
      <p className="m-0 flex justify-between text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted">
        <span>{(labels.at(step - 1) ?? "").toUpperCase()}</span>
        <span>{counter(step)}</span>
      </p>
    </div>
  );
}
