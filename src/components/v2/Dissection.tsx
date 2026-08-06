"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";

import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { CountUp } from "./CountUp";
import { DissectionWatermark } from "./DissectionWatermark";

interface Step {
  sym: string;
  name: string;
  dose: number;
  unit: string;
  body: string;
  /** The closing "left out" beat rather than an active mineral. */
  exclude?: boolean;
}

const STEPS: readonly Step[] = [
  { sym: "Na", name: "Sodium", dose: 1000, unit: "mg", body: "Holds the fluid in, so it is not passed straight through." },
  { sym: "K", name: "Potassium", dose: 250, unit: "mg", body: "Moves the water into your cells and steadies muscle function." },
  { sym: "Mg", name: "Magnesium", dose: 50, unit: "mg", body: "Supports energy and calms muscle and nerve after the grind." },
  { sym: "0", name: "Everything else", dose: 0, unit: "", body: "No added sugar. No artificial colors, flavors, or sweeteners.", exclude: true },
];

/** One annotation row: a rail node plus the mineral's readout, lit electric when active. */
function Annotation({ step, active, current }: { step: Step; active: boolean; current: boolean }) {
  return (
    <div
      className={cn(
        "relative pl-9 transition-opacity duration-300",
        active ? "opacity-100" : "opacity-60"
      )}
    >
      {/* rail node */}
      <span
        className={cn(
          "absolute left-0 top-1.5 grid size-[15px] place-items-center rounded-full border transition-colors duration-300",
          active ? "border-wi-electric bg-wi-electric" : "border-wi-line-strong bg-wi-paper"
        )}
      >
        <span className={cn("size-[5px] rounded-full", active ? "bg-wi-paper" : "bg-transparent")} />
      </span>
      <div className="flex items-baseline gap-2">
        <span
          className={cn(
            "text-[12px] uppercase tracking-[0.12em]",
            step.exclude
              ? "font-medium text-wi-ink-500"
              : cn("wi-readout tracking-[0.14em]", current ? "text-wi-electric" : "text-wi-ink-500")
          )}
        >
          {step.exclude ? "Left out" : step.sym}
        </span>
        {!step.exclude && (
          <span className="text-[12px] uppercase tracking-[0.1em] text-wi-ink-500">{step.name}</span>
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <CountUp
          value={step.dose}
          className={cn(
            "wi-readout text-[clamp(34px,3.9vw,56px)] font-semibold leading-[0.95] tracking-[-0.03em]",
            current ? "text-wi-electric" : "text-wi-black"
          )}
        />
        {step.unit && <span className="wi-readout text-[15px] font-semibold text-wi-ink-500">{step.unit}</span>}
        {step.exclude && (
          <span className="text-[15px] font-medium text-wi-ink-500">g sugar, and nothing artificial</span>
        )}
      </div>
      <p className="mt-2 mb-0 max-w-[42ch] text-[15px] leading-[1.55] text-wi-ink-500">{step.body}</p>
    </div>
  );
}

/**
 * The dissection: the sachet pins center-stage while its contents read out. Desktop
 * sweeps an electric highlight down the rail on scroll; every numeral counts up to its
 * true value on entering view and rests there, so a reading is never left at zero.
 * Smaller screens and reduced-motion show every reading at once.
 */
export function Dissection() {
  const wrap = useRef<HTMLDivElement>(null);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!isDesktop || reduce) return;
    const idx = Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length)));
    setStep(idx);
  });

  // Rail fill tracks scroll progress on desktop; full otherwise.
  const railScale = useTransform(scrollYProgress, [0, 0.92], [0.02, 1]);

  const drivePin = isDesktop && !reduce;
  const activeStep = drivePin ? step : STEPS.length - 1;

  return (
    <section
      id="inside"
      ref={wrap}
      className={cn("relative border-t border-wi-line bg-wi-paper", drivePin && "h-[360vh]")}
    >
      <div
        className={cn(
          "flex flex-col justify-center",
          drivePin
            ? "sticky top-[var(--wi-nav-h)] h-[calc(100svh-var(--wi-nav-h))] overflow-hidden"
            : "py-16 md:py-20"
        )}
      >
        <DissectionWatermark step={activeStep} />
        <div className="relative mx-auto grid w-full max-w-[1240px] items-center gap-12 px-5 md:px-7 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* specimen */}
          <div>
            <h2 className="m-0 mb-8 max-w-[14ch] text-[clamp(28px,3.6vw,46px)] font-medium leading-[1.0] tracking-[-0.035em] text-wi-black text-balance lg:mb-10">
              Three minerals in. The rest, left out.
            </h2>
            <div className="relative mx-auto flex aspect-[4/5] w-full max-w-[340px] items-center justify-center">
              <motion.div
                className="w-[50%] rotate-[6deg]"
                animate={{ y: [-9, 11, -9] }}
                transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              >
                <Image
                  src="/coming-soon/sachet-single.png"
                  alt="A WITHIN sachet, shown as a specimen"
                  width={1632}
                  height={3526}
                  sizes="(max-width: 1024px) 55vw, 220px"
                  draggable={false}
                  className="h-auto w-full drop-shadow-[0_26px_48px_rgba(11,13,18,0.22)]"
                />
              </motion.div>
            </div>
          </div>

          {/* the readings on a progress rail */}
          <div className="relative">
            {/* rail track + electric fill */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-wi-line" />
            {drivePin && (
              <motion.div
                className="absolute left-[7px] top-2 bottom-2 w-px origin-top bg-wi-electric"
                style={{ scaleY: railScale }}
              />
            )}
            <div className="flex flex-col gap-8 lg:gap-9">
              {STEPS.map((s, i) => (
                <Annotation
                  key={s.name}
                  step={s}
                  active={i <= activeStep}
                  current={drivePin ? i === activeStep : false}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
