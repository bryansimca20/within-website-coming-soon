import { Fragment } from "react";
import { Check, Minus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { WithinLogo } from "@/components/brand/WithinLogo";

import { Eyebrow } from "./Eyebrow";
import { Hero909 } from "./Hero909";

/** One comparison cell: a verdict plus an optional qualifying note. */
type CellState = "yes" | "no" | "part";
interface Cell {
  s: CellState;
  note?: string;
}

const yes = (note?: string): Cell => ({ s: "yes", note });
const no = (note?: string): Cell => ({ s: "no", note });
const part = (note?: string): Cell => ({ s: "part", note });

const HEAD = ["", "Water", "Sports drink", "WITHIN"];
const ROWS: [string, Cell, Cell, Cell][] = [
  ["Replaces fluid", yes(), yes(), yes("mix with 500ml water")],
  ["Sodium, dosed to loss", no("0mg"), part("~450mg per litre"), yes("1000mg")],
  ["Potassium + magnesium", no(), part("trace"), yes("250mg + 50mg")],
  ["No added sugar", yes(), no("~30g per bottle"), yes("zero")],
  ["No colors, flavors, sweeteners", yes(), no(), yes()],
];

const CELL = "py-5 px-[14px] border-t border-wi-line flex items-center justify-center";

/** A single verdict marker — filled black/paper for a strong yes, hairline otherwise. */
function CmpMark({ cell, onDark = false }: { cell: Cell; onDark?: boolean }) {
  const icon =
    cell.s === "yes" ? <Check size={17} strokeWidth={2.6} /> : cell.s === "no" ? <X size={16} strokeWidth={2.2} /> : <Minus size={16} strokeWidth={2.2} />;
  const strong = cell.s === "yes";
  return (
    <div className="flex flex-col items-center gap-[5px]">
      <span
        className={cn(
          "inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 border",
          onDark ? "border-wi-on-dark-line" : "border-wi-line",
          strong
            ? onDark
              ? "bg-wi-paper text-wi-black"
              : "bg-wi-black text-wi-paper"
            : onDark
              ? "bg-transparent text-wi-on-dark-2"
              : "bg-transparent text-wi-ink-300"
        )}
      >
        {icon}
      </span>
      {cell.note && (
        <span
          className={cn(
            "text-[11.5px] font-semibold leading-[1.3] text-center",
            onDark ? "text-wi-on-dark-2" : "text-wi-ink-500"
          )}
        >
          {cell.note}
        </span>
      )}
    </div>
  );
}

/** The four-column water / sports drink / WITHIN comparison grid. */
function CompareTable() {
  return (
    <div
      className="wi-compare grid [grid-template-columns:1.25fr_1fr_1fr_1.1fr] border border-wi-line rounded-lg overflow-hidden bg-wi-paper"
    >
      {HEAD.map((h, c) => (
        <div
          key={c}
          className={cn(
            "p-4 px-[14px] flex items-center font-bold text-xs tracking-[0.13em] uppercase",
            c === 0 ? "justify-start" : "justify-center",
            c === 3 ? "text-wi-paper bg-wi-black" : "text-wi-ink-500 bg-transparent"
          )}
        >
          {c === 3 ? <WithinLogo kind="logotype" color="white" height={12} /> : h}
        </div>
      ))}
      {ROWS.map(([label, water, sports, within]) => (
        <Fragment key={label}>
          <div
            className={cn(CELL, "justify-start font-bold text-[14.5px] tracking-[-0.01em] text-wi-black text-left")}
          >
            {label}
          </div>
          <div className={CELL}>
            <CmpMark cell={water} />
          </div>
          <div className={CELL}>
            <CmpMark cell={sports} />
          </div>
          <div className={cn(CELL, "bg-wi-black border-t border-wi-on-dark-line")}>
            <CmpMark cell={within} onDark />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** "How WITHIN compares" — intro copy over the comparison table. */
export function Compare() {
  return (
    <section className="bg-wi-paper-dim border-t border-wi-line">
      <div className="max-w-[1200px] mx-auto pt-24 px-7 pb-[88px]">
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <div>
            <Eyebrow>Side by side</Eyebrow>
            <Hero909 as="h2" className="mt-3 max-w-[640px] text-[54px]">
              How WITHIN compares.
            </Hero909>
          </div>
          <p className="max-w-[360px] text-[15px] leading-[1.55] text-wi-ink-500 mb-0">
            Hydration is fluid plus minerals. Most of what&apos;s sold gets the minerals wrong:
            too little, or buried in sugar.
          </p>
        </div>
        <div className="wi-compare-wrap mt-12">
          <CompareTable />
        </div>
      </div>
    </section>
  );
}
