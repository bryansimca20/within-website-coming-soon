"use client";

import { motion } from "motion/react";

import type { SampleStep } from "@/app/utils/sample-request-input";
import { EASE } from "@/components/coming-soon/Reveal";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SAMPLE_COPY } from "./utils/sample-copy";

interface SampleStepIndicatorProps {
  step: SampleStep;
  /** Goes one step back; from step 1, back to the intro. */
  onBack: () => void;
}

/** Back at the top left, then five bars that fill as the visitor moves on, then the step's name and count. */
export function SampleStepIndicator({ step, onBack }: SampleStepIndicatorProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <button
        type="button"
        onClick={onBack}
        className="-ml-1 flex min-h-11 cursor-pointer items-center gap-1.5 self-start px-1 text-[15px] leading-5 font-semibold transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none"
      >
        <WaitlistArrowGlyph className="size-4 rotate-180" />
        {SAMPLE_COPY.back}
      </button>
      <div className="grid grid-cols-5 gap-1.5" aria-hidden>
        {SAMPLE_COPY.steps.map((label, index) => (
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
        <span>{SAMPLE_COPY.steps[step - 1].toUpperCase()}</span>
        <span>{SAMPLE_COPY.stepCounter(step)}</span>
      </p>
    </div>
  );
}
