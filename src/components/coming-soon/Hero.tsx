"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { CountUp } from "./CountUp";
import { MeasureGrid } from "./MeasureGrid";
import { EASE } from "./Reveal";
import { WaitlistOverlay } from "./WaitlistOverlay";

/** name, value, unit — the three actives, read off the specimen below the sachet. */
const READOUT: readonly [string, number, string][] = [
  ["Na", 1000, "Sodium"],
  ["K", 250, "Potassium"],
  ["Mg", 50, "Magnesium"],
];

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE, delay: d } }),
};

/** Split specimen hero: value-prop + waitlist on the left, the sachet framed as a lab specimen on the right. */
export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-wi-line bg-wi-paper">
      <MeasureGrid fade="edges" />
      <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 py-16 md:px-7 md:py-20 lg:min-h-[calc(100svh-var(--wi-nav-h))] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-0">
        {/* Left: the message + the action */}
        <div className="max-w-[600px]">
          <motion.h1
            custom={0.05}
            variants={rise}
            initial="hidden"
            animate="show"
            className="m-0 text-[clamp(40px,6.4vw,72px)] font-medium leading-[0.98] tracking-[-0.04em] text-wi-black text-balance"
          >
            Put back what
            <br />
            the heat takes out.
          </motion.h1>
          <motion.p
            custom={0.22}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-6 mb-0 max-w-[44ch] text-[18px] leading-[1.5] text-wi-ink-500"
          >
            An electrolyte drink sachet with the minerals you lose in sweat, dosed to the milligram.
            Made in Indonesia.
          </motion.p>
          <motion.div custom={0.34} variants={rise} initial="hidden" animate="show" className="mt-8">
            <WaitlistOverlay tone="default" />
          </motion.div>
        </div>

        {/* Right: the specimen */}
        <motion.div
          custom={0.28}
          variants={rise}
          initial="hidden"
          animate="show"
          className="relative"
        >
          <div className="wi-crosshair relative mx-auto grid aspect-[4/5] w-full max-w-[420px] place-items-center overflow-hidden rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper-dim">
            <MeasureGrid fade="none" className="opacity-70" />
            {/* corner register ticks */}
            <span className="absolute left-3 top-3 h-3 w-3 border-l border-t border-wi-line-strong" />
            <span className="absolute right-3 top-3 h-3 w-3 border-r border-t border-wi-line-strong" />
            <span className="absolute bottom-3 left-3 h-3 w-3 border-b border-l border-wi-line-strong" />
            <span className="absolute bottom-3 right-3 h-3 w-3 border-b border-r border-wi-line-strong" />
            <motion.div
              className="relative z-1 w-[52%] rotate-[8deg]"
              animate={{ y: [-6, 8, -6] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            >
              <Image
                src="/coming-soon/sachet-single.png"
                alt="A single WITHIN electrolyte sachet"
                width={1632}
                height={3526}
                sizes="(max-width: 1024px) 60vw, 220px"
                priority
                draggable={false}
                className="h-auto w-full drop-shadow-[0_20px_40px_rgba(11,13,18,0.18)]"
              />
            </motion.div>
          </div>

          {/* Instrument readout: the three actives, counting up */}
          <div className="mx-auto mt-4 grid max-w-[420px] grid-cols-3 divide-x divide-wi-line rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper">
            {READOUT.map(([sym, val, name]) => (
              <div key={sym} className="relative px-3 py-4 text-center">
                <span className="absolute inset-x-3 top-0 h-px bg-wi-electric" />
                <div className="wi-readout text-[11px] uppercase tracking-[0.14em] text-wi-ink-300">
                  {sym}
                </div>
                <div className="mt-1 flex items-baseline justify-center gap-1">
                  <CountUp
                    value={val}
                    className="wi-readout text-[26px] font-semibold text-wi-black md:text-[30px]"
                  />
                  <span className="wi-readout text-[12px] text-wi-ink-500">mg</span>
                </div>
                <div className="mt-1 text-[11px] text-wi-ink-500">{name}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
