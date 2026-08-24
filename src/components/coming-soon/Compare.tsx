"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import { Check, Minus, X } from "@phosphor-icons/react/ssr";

import { cn } from "@/lib/utils";
import { WithinLogo } from "@/components/brand/WithinLogo";

import { EASE, Reveal } from "./Reveal";
import { Section } from "./Section";

/** Whether the row's substance is present, partly present, or absent. The label — "Sodium"
 * versus "Added sugar" — supplies whether presence is the good outcome. */
type Verdict = "yes" | "part" | "no";
interface Cell {
  v: Verdict;
  /** Readout lines under the mark, one per line. */
  notes: readonly string[];
}
const y = (...notes: string[]): Cell => ({ v: "yes", notes });
const p = (...notes: string[]): Cell => ({ v: "part", notes });
const n = (...notes: string[]): Cell => ({ v: "no", notes });

const HEAD = ["", "WITHIN", "Isotonic drinks", "H₂O"] as const;
const ROWS: readonly [string, Cell, Cell, Cell][] = [
  ["Fluid for rehydration", y("Prepared serving", "500 ml"), y(), y()],
  // Competitor figures below are label-derived, normalized to 500 ml, and span the three brands
  // named in the footnote. Pocari publishes electrolytes as mEq/L (mg = mEq x molar mass /
  // valence); Isoplus per 175 ml; Mizone per 250 ml. Re-source before changing any of them.
  // Na: Pocari ~240 (21 mEq/L, cross-checks against its own 120 mg / 250 ml), Isoplus ~243, Mizone ~110.
  ["Sodium", y("1000 mg"), p("110–245 mg"), n()],
  // K: Pocari ~98 (5 mEq/L), Isoplus ~100, Mizone ~70.
  ["Potassium", y("250 mg"), p("70–100 mg"), n()],
  // Mg: Pocari ~3 (0.5 mEq/L, divalent). Mizone Activ lists no magnesium salt at all, hence the 0.
  ["Magnesium", y("50 mg"), p("0–3 mg"), n()],
  // Sugar: Mizone ~22 g, Isoplus ~29 g, Pocari ~28-32 g.
  ["Added sugar", n("None"), y("22–32 g"), n("None")],
  // Indonesian isotonics are colourless by category convention: no colorant on any label checked.
  ["Artificial colors", n("None"), n("None"), n("None")],
  // Pocari Sweat and Mizone both print "perisa sintetik"; Isoplus uses nature-identical flavouring.
  ["Artificial flavors", n("None"), y("Synthetic"), n("None")],
  // Mizone carries acesulfame-K and sucralose; Pocari and Isoplus declare none.
  ["Artificial sweeteners", n("None"), p("Some brands"), n("None")],
];

/** Column 3 (H₂O) is dropped below md so phones never scroll sideways. */
const MD_ONLY = "hidden md:flex";

/**
 * One reading. WITHIN's column always carries the signal: the logomark where the substance is
 * ours to supply, a filled black cross where leaving it out is the point. Every other column
 * stays a hairline mark.
 */
function Mark({ cell, strong, delay }: { cell: Cell; strong: boolean; delay: number }) {
  const isYes = cell.v === "yes";
  const brand = strong && isYes;
  const omission = strong && cell.v === "no";
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
      ) : omission ? (
        <span className="inline-flex size-7 items-center justify-center rounded-full bg-wi-signal text-wi-paper">
          <X size={15} weight="bold" />
        </span>
      ) : (
        <span className="inline-flex size-7 items-center justify-center rounded-full border border-wi-line-strong bg-transparent text-wi-ink-500">
          {cell.v === "yes" ? <Check size={16} weight="bold" /> : cell.v === "no" ? <X size={15} /> : <Minus size={15} />}
        </span>
      )}
      {cell.notes.map((note) => (
        <span key={note} className="wi-readout text-center text-[11px] leading-[1.3] text-wi-ink-500">
          {note}
        </span>
      ))}
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
            Compare what&apos;s WITHIN.
          </h2>
          <p className="mb-0 max-w-[40ch] text-[15px] leading-[1.55] text-wi-ink-500">
            Formulated with precision, for those who train in the humid heat. Every ingredient
            earns its place.
          </p>
        </Reveal>
        <Reveal delay={100} className="mt-10">
          <Matrix />
          <p className="mt-5 mb-0 max-w-[40ch] text-[15px] leading-[1.55] text-wi-ink-500">
            * All values normalized to a 500 ml serving.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
