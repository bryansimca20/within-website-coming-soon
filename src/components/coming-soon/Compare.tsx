"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { Check, Minus, X } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";
import { WithinLogo } from "@/components/brand/WithinLogo";

import { EASE, Reveal } from "./Reveal";
import { Section } from "./Section";

type Verdict = "yes" | "part" | "no";
interface Cell {
  v: Verdict;
  note?: string;
}
const y = (note?: string): Cell => ({ v: "yes", note });
const p = (note?: string): Cell => ({ v: "part", note });
const n = (note?: string): Cell => ({ v: "no", note });

const HEAD = ["", "WITHIN", "Sports drink", "Water"] as const;
const ROWS: readonly [string, Cell, Cell, Cell][] = [
  ["Replaces the fluid", y(), y(), y("mix with 500ml")],
  ["Sodium, dosed to loss", y("1000mg"), p("~245mg"), n("0mg")],
  ["Potassium and magnesium", y("250 + 50mg"), p("no magnesium"), n()],
  ["No added sugar", y(), n("~31g per bottle"), y()],
  ["No artificial colors, flavors, sweeteners", y(), n(), y()],
];

/** Column 3 (Water) is dropped below md so phones never scroll sideways. */
const MD_ONLY = "hidden md:flex";

/** One verdict: WITHIN's affirmatives read signal-strong; everything else is a hairline mark. */
function Mark({ cell, strong, delay }: { cell: Cell; strong: boolean; delay: number }) {
  const isYes = cell.v === "yes";
  const brand = strong && isYes;
  return (
    <motion.div
      className="flex flex-col items-center gap-1.5"
      initial={{ opacity: 0, scale: 0.7 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px" }}
      transition={{ duration: 0.35, ease: EASE, delay }}
    >
      {brand ? (
        <WithinLogo kind="logomark" color="black" height={20} alt="WITHIN" />
      ) : (
        <span className="inline-flex size-7 items-center justify-center rounded-full border border-wi-line-strong bg-transparent text-wi-ink-500">
          {cell.v === "yes" ? <Check size={16} weight="bold" /> : cell.v === "no" ? <X size={15} /> : <Minus size={15} />}
        </span>
      )}
      {cell.note && (
        <span className="wi-readout text-center text-[11px] leading-[1.3] text-wi-ink-500">{cell.note}</span>
      )}
    </motion.div>
  );
}

const CELL = "flex min-h-[84px] items-center justify-center px-2 py-4 md:px-3";

/** "How WITHIN compares": a precise matrix against a sports drink and plain water. */
function Matrix() {
  return (
    <div className="overflow-hidden rounded-[var(--wi-radius-card)] border border-wi-line">
      <div className="grid grid-cols-[1.4fr_1fr_1fr] md:grid-cols-[1.6fr_1fr_1fr_1fr]">
        {/* header */}
        {HEAD.map((h, c) => (
          <div
            key={c}
            className={cn(
              "flex items-center border-b border-wi-line px-3 py-4 text-[12px] font-semibold uppercase tracking-[0.1em] md:px-4",
              c === 0 ? "justify-start text-wi-ink-300" : "justify-center text-center",
              c === 1 ? "bg-wi-signal-tint text-wi-signal" : "bg-wi-paper text-wi-ink-500",
              c === 3 && MD_ONLY
            )}
          >
            {c === 1 ? <WithinLogo kind="logotype" color="black" height={12} /> : h}
          </div>
        ))}
        {/* rows */}
        {ROWS.map(([label, within, sports, water], r) => (
          <Fragment key={label}>
            <div
              className={cn(
                CELL,
                "justify-start border-t border-wi-line text-left text-[14px] font-medium leading-[1.25] tracking-[-0.01em] text-wi-black md:text-[15px]"
              )}
            >
              {label}
            </div>
            <div className={cn(CELL, "border-t border-wi-line bg-wi-signal-tint/40")}>
              <Mark cell={within} strong delay={r * 0.06} />
            </div>
            <div className={cn(CELL, "border-t border-wi-line")}>
              <Mark cell={sports} strong={false} delay={r * 0.06 + 0.04} />
            </div>
            <div className={cn(CELL, "border-t border-wi-line", MD_ONLY)}>
              <Mark cell={water} strong={false} delay={r * 0.06 + 0.08} />
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** Section wrapper: intro copy over the comparison matrix. */
export function Compare() {
  return (
    <Section surface="paperDim" borderTop>
      <div id="compare">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 max-w-[14ch] text-[clamp(30px,4vw,52px)] font-medium leading-[1.0] tracking-[-0.035em] text-wi-black text-balance">
            How WITHIN compares.
          </h2>
          <p className="mb-0 max-w-[40ch] text-[15px] leading-[1.55] text-wi-ink-500">
            Hydration is fluid plus minerals. Most of what is sold gets the minerals wrong: too
            little, or buried under sugar.
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <Matrix />
        </Reveal>
      </div>
    </Section>
  );
}
