"use client";

import { motion, useReducedMotion } from "motion/react";

import { type IWaitlistSweatLoss, WAITLIST_COPY } from "./utils/waitlist-copy";

/** Where the ruler's five ticks sit, as fractions of its length. */
const TICK_FRACTIONS = [0, 0.25, 0.5, 0.75, 1];

/** Prints a milligram amount with a thousands separator. */
function formatMg(amountMg: number): string {
  return amountMg.toLocaleString("en-US");
}

interface WaitlistLossScaleProps {
  /** The mineral, its measured range, and the ruler's maximum. */
  loss: IWaitlistSweatLoss;
}

/** One measured range plotted on a ruler: the orange segment grows in when the card opens. */
export function WaitlistLossScale({ loss }: WaitlistLossScaleProps) {
  const reduceMotion = useReducedMotion();
  const { heat } = WAITLIST_COPY;
  const left = `${(loss.lowMg / loss.axisMaxMg) * 100}%`;
  const width = `${((loss.highMg - loss.lowMg) / loss.axisMaxMg) * 100}%`;

  return (
    <div className="border-b border-brand-mist/24 pt-2.5 pb-2 last-of-type:border-b-0">
      <div className="flex items-baseline justify-between">
        <span className="text-sm leading-5 desk:text-base desk:leading-[22px]">{loss.name}</span>
        <span className="text-lg leading-[22px] font-semibold tracking-[-0.02em] desk:text-2xl desk:leading-7">
          {formatMg(loss.lowMg)} {heat.rangeJoiner} {formatMg(loss.highMg)} {heat.unit}
        </span>
      </div>
      <div aria-hidden className="relative mt-1.5 h-5">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-brand-mist/24" />
        {TICK_FRACTIONS.map((fraction) => (
          <span
            key={fraction}
            style={{ left: `${fraction * 100}%` }}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-brand-mist/45 last:-translate-x-full"
          />
        ))}
        <motion.div
          style={{ left, width }}
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="absolute top-1/2 h-1.5 origin-left -translate-y-1/2 bg-flavor-orange"
        />
      </div>
      <div aria-hidden className="relative h-4 text-[11px] leading-4 text-brand-muted-dark">
        {TICK_FRACTIONS.map((fraction, index) => (
          <span
            key={fraction}
            style={{ left: `${fraction * 100}%` }}
            className="absolute top-0 -translate-x-1/2 whitespace-nowrap first:translate-x-0 last:-translate-x-full"
          >
            {formatMg(Math.round(loss.axisMaxMg * fraction))}
            {index === TICK_FRACTIONS.length - 1 ? ` ${heat.unit}` : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
