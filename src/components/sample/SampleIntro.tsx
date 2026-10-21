"use client";

import { motion, type Variants } from "motion/react";

import { EASE } from "@/components/coming-soon/Reveal";
import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";

import { SampleBox3D } from "./SampleBox3D";
import { SAMPLE_COPY } from "./utils/sample-copy";

const { intro } = SAMPLE_COPY;

const cascade: Variants = { hidden: {}, shown: { transition: { staggerChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
};

interface SampleIntroProps {
  /** Moves the visitor into step 1. */
  onContinue: () => void;
}

/** The first screen of `/sample`: the spinning box, why we're sharing it, what's in it, one button. */
export function SampleIntro({ onContinue }: SampleIntroProps) {
  return (
    <motion.div
      variants={cascade}
      initial="hidden"
      animate="shown"
      className="flex flex-1 flex-col desk:grid desk:grid-cols-2 desk:grid-rows-[1fr_auto_auto_auto_auto_1fr] desk:gap-x-12"
    >
      <motion.p variants={rise} className="m-0 text-xs leading-4 font-bold tracking-[0.06em] text-brand-muted desk:col-start-2 desk:row-start-2">
        {intro.label}
      </motion.p>
      <motion.h1
        variants={rise}
        className="mt-3 mb-0 text-[32px] leading-9 font-normal tracking-[-0.02em] text-balance desk:col-start-2 desk:row-start-3 desk:text-[48px] desk:leading-[52px]"
      >
        {intro.headline}
      </motion.h1>
      <motion.div
        variants={rise}
        className="mt-1 [--sample-box-w:72px] desk:col-start-1 desk:row-span-6 desk:row-start-1 desk:mt-0 desk:self-center desk:[--sample-box-w:116px]"
      >
        <SampleBox3D width="var(--sample-box-w)" speed={-14} />
      </motion.div>
      <motion.div
        variants={rise}
        className="flex flex-col gap-3 text-[17px] leading-[26px] text-pretty desk:col-start-2 desk:row-start-4 desk:mt-6 desk:max-w-[440px]"
      >
        <p className="m-0">{intro.why}</p>
        <p className="m-0">
          {intro.offerBefore}
          <span className="font-semibold">{intro.offerBold}</span>
          {intro.offerAfter}
        </p>
      </motion.div>
      <motion.div
        variants={rise}
        className="sticky bottom-0 -mx-4 mt-4 bg-linear-to-b from-white/0 to-white to-[18px] px-4 pt-[22px] pb-[max(16px,env(safe-area-inset-bottom))] desk:static desk:col-start-2 desk:row-start-5 desk:mx-0 desk:mt-8 desk:max-w-[440px] desk:bg-none desk:p-0"
      >
        <button
          type="button"
          onClick={onContinue}
          className="flex h-14 w-full cursor-pointer items-center justify-between bg-brand-ink px-5 text-base font-semibold text-brand-mist transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] motion-reduce:transition-none"
        >
          <span>{intro.cta}</span>
          <WaitlistArrowGlyph />
        </button>
        <p className="mt-2.5 mb-0 text-center text-[13px] leading-[18px] text-brand-muted desk:text-left">{intro.note}</p>
      </motion.div>
    </motion.div>
  );
}
