"use client";

import { motion, type Variants } from "motion/react";

import { EASE } from "@/components/coming-soon/Reveal";
import { WaitlistInstagramGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { SAMPLE_COPY } from "./utils/sample-copy";

const { feedback: copy } = SAMPLE_COPY;

const cascade: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.12 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

interface SampleFeedbackThanksProps {
  /** Greets by name when the check-in knows who this is. */
  firstName: string | null;
}

/** The end of the check-in: a genuine thank you, read slowly, then Instagram to follow along. */
export function SampleFeedbackThanks({ firstName }: SampleFeedbackThanksProps) {
  return (
    <motion.div variants={cascade} initial="hidden" animate="shown" className="flex flex-col gap-4" role="status">
      <motion.h1 variants={rise} className="m-0 mb-2 text-[32px] leading-9 font-normal tracking-[-0.02em] text-balance">
        {firstName === null ? copy.thanksHeadline : copy.thanksHeadlineNamed(firstName)}
      </motion.h1>
      {copy.thanksBody.map((line) => (
        <motion.p key={line} variants={rise} className="m-0 text-[17px] leading-[26px] text-pretty">
          {line}
        </motion.p>
      ))}
      <motion.a variants={rise} href={INSTAGRAM_URL} target="_blank" rel="noopener"
        className="mt-4 flex h-14 items-center justify-center gap-2.5 bg-brand-ink text-base font-semibold text-brand-mist no-underline transition-transform duration-150 ease-brand active:scale-[0.97] motion-reduce:transition-none">
        <WaitlistInstagramGlyph className="size-5" />
        <span>Follow {INSTAGRAM_HANDLE}</span>
      </motion.a>
    </motion.div>
  );
}
