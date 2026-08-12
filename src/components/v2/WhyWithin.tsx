"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { CountUp } from "./CountUp";
import { EASE, Reveal } from "./Reveal";
import { SectionContainer } from "./Section";

/** name, low, high, axis-max (mg) — sweat loss per hour of hard training. */
const LOSS: readonly [string, number, number, number][] = [
  ["Sodium", 900, 1250, 1600],
  ["Potassium", 125, 200, 400],
];

/** A measured range plotted on a ruler axis — the signal segment grows in on scroll. */
function LossScale({ name, low, high, max }: { name: string; low: number; high: number; max: number }) {
  const left = (low / max) * 100;
  const width = ((high - low) / max) * 100;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  return (
    <div className="border-t border-wi-line py-6 first:border-t-0 first:pt-0">
      <div className="flex items-baseline justify-between gap-4">
        <span className="wi-readout text-[12px] uppercase tracking-[0.12em] text-wi-ink-500">{name}</span>
        <span className="flex items-baseline gap-1">
          <CountUp value={low} className="wi-readout text-[28px] font-semibold text-wi-black" />
          <span className="wi-readout text-[13px] text-wi-ink-300">to</span>
          <CountUp value={high} className="wi-readout text-[28px] font-semibold text-wi-black" />
          <span className="wi-readout text-[12px] text-wi-ink-500">mg</span>
        </span>
      </div>
      <div className="relative mt-4 h-8">
        {/* ruler */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-wi-line" />
        {[0, 25, 50, 75, 100].map((t) => (
          <span key={t} style={{ left: `${t}%` }} className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-wi-line-strong" />
        ))}
        {/* the measured loss segment */}
        <motion.div
          className="absolute top-1/2 h-[9px] -translate-y-1/2 rounded-full bg-wi-signal"
          style={{ left: `${left}%` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.85, ease: EASE }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {ticks.map((t, i) => (
          <span key={t} className="wi-readout text-[10.5px] tracking-[0.04em] text-wi-ink-300">
            {t.toLocaleString("en-US")}
            {i === ticks.length - 1 ? " mg" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "Why WITHIN": the heat/humidity case, beside the measured sweat-loss scales. */
export function WhyWithin() {
  return (
    <section className="relative overflow-hidden border-t border-wi-line bg-wi-paper">
      {/* Subtle athletic backdrop — the sweat that carries the minerals out. */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <Image
          src="/coming-soon/sweat-closeup.jpeg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[22%_center] opacity-[0.6]"
        />
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-wi-paper/70 to-wi-paper" />
      </div>
      <SectionContainer className="relative">
        <div
          id="why"
          className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16"
        >
        <Reveal>
          <h2 className="m-0 max-w-[12ch] text-[clamp(30px,4vw,52px)] font-medium leading-[1.0] tracking-[-0.035em] text-wi-black text-balance">
            Built for the heat and humidity.
          </h2>
          <p className="mt-6 mb-0 max-w-[46ch] text-[17px] leading-[1.6] text-wi-ink-500">
            Train in Indonesia&apos;s heat and your sweat cannot evaporate fast enough to cool you,
            so your body just makes more of it. Every drop carries minerals out, mostly sodium and
            some potassium. Tropical sweat is not saltier. You simply lose far more of it.
          </p>
        </Reveal>
        <Reveal delay={100} className="md:pt-2">
          <p className="wi-readout m-0 mb-5 text-[11px] uppercase tracking-[0.14em] text-wi-ink-500">
            Lost per hour of hard training
          </p>
          {LOSS.map(([name, low, high, max]) => (
            <LossScale key={name} name={name} low={low} high={high} max={max} />
          ))}
          <p className="mt-6 mb-0 max-w-[44ch] text-[12px] leading-[1.5] text-wi-ink-300">
            Measured in runners at roughly 30°C and 70% humidity.{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8072971/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-wi-ink-500 underline decoration-wi-line underline-offset-2 hover:text-wi-black"
            >
              Surapongchai et al., Nutrients (2021)
            </a>
            .
          </p>
        </Reveal>
        </div>
      </SectionContainer>
    </section>
  );
}
