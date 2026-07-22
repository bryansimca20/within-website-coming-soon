import { Fragment } from "react";
import { Check, Minus, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { WithinLogo } from "@/components/brand/WithinLogo";

import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

/** One comparison cell: a verdict plus an optional qualifying note. */
type CellState = "yes" | "no" | "part";
interface Cell {
  s: CellState;
  note?: string;
}

const yes = (note?: string): Cell => ({ s: "yes", note });
const no = (note?: string): Cell => ({ s: "no", note });
const part = (note?: string): Cell => ({ s: "part", note });

const HEAD = ["", "WITHIN", "Sports drink", "Water"];
const ROWS: [string, Cell, Cell, Cell][] = [
  ["Replaces fluid", yes(), yes(), yes("mix with 500ml water")],
  ["Sodium, dosed to loss", no("0mg"), part("~245mg per bottle"), yes("1000mg")],
  ["Potassium + magnesium", no(), part("100mg, no magnesium"), yes("250mg + 50mg")],
  ["No added sugar", yes(), no("~31g per bottle"), yes("zero")],
  ["No colors, flavors, sweeteners", yes(), no(), yes()],
];

// A fixed row height is what makes the grid read as tidy: markers land on one baseline
// whether or not a cell's note wraps to a second line.
const CELL =
  "flex min-h-[86px] items-center justify-center border-t border-wi-line px-2 py-4 md:min-h-[96px] md:px-[14px] md:py-5";

/** The baseline column (`Water`) is dropped below `md` so phones need no sideways scroll. */
const DESKTOP_ONLY_COLUMN = "hidden md:flex";

/** A single verdict marker — filled black/paper for a strong yes, hairline otherwise. */
function CmpMark({ cell, onDark = false }: { cell: Cell; onDark?: boolean }) {
  const strong = cell.s === "yes";
  // WITHIN's own affirmatives are stamped with the brand mark instead of a pill + check.
  const isBrandMark = strong && onDark;
  const icon = isBrandMark ? (
    <WithinLogo kind="logomark" color="white" height={20} alt="" />
  ) : cell.s === "yes" ? (
    <Check size={17} strokeWidth={2.6} />
  ) : cell.s === "no" ? (
    <X size={16} strokeWidth={2.2} />
  ) : (
    <Minus size={16} strokeWidth={2.2} />
  );
  return (
    <div className="flex flex-col items-center gap-[5px]">
      <span
        className={
          isBrandMark
            ? "inline-flex items-center justify-center h-7 shrink-0"
            : cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-full shrink-0 border",
                onDark ? "border-wi-on-dark-line" : "border-wi-line",
                strong
                  ? onDark
                    ? "bg-wi-paper text-wi-black"
                    : "bg-wi-black text-wi-paper"
                  : onDark
                    ? "bg-transparent text-wi-on-dark-2"
                    : "bg-transparent text-wi-ink-300"
              )
        }
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
    <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-wi-line bg-wi-paper md:grid-cols-4">
      {HEAD.map((h, c) => (
        <div
          key={c}
          className={cn(
            "flex items-center p-3 text-[11px] font-bold uppercase tracking-[0.13em] md:p-4 md:px-[14px] md:text-xs",
            c === 0 ? "justify-start" : "justify-center text-center",
            c === 1 ? "bg-wi-black text-wi-paper" : "bg-transparent text-wi-ink-500",
            c === 3 && DESKTOP_ONLY_COLUMN
          )}
        >
          {c === 1 ? <WithinLogo kind="logotype" color="white" height={12} /> : h}
        </div>
      ))}
      {ROWS.map(([label, water, sports, within]) => (
        <Fragment key={label}>
          <div
            className={cn(
              CELL,
              "justify-start text-left text-[13.5px] font-bold tracking-[-0.01em] text-wi-black md:text-[14.5px]"
            )}
          >
            {label}
          </div>
          {/* The dark column keeps a light rule so every row separator reads as one
              continuous hairline across the table rather than stepping at the seam. */}
          <div className={cn(CELL, "bg-wi-black")}>
            <CmpMark cell={within} onDark />
          </div>
          <div className={CELL}>
            <CmpMark cell={sports} />
          </div>
          <div className={cn(CELL, DESKTOP_ONLY_COLUMN)}>
            <CmpMark cell={water} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

/** "How WITHIN compares" — intro copy over the comparison table. */
export function Compare() {
  return (
    <Section surface="paperDim" borderTop>
      <Reveal className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <Eyebrow>Side by side</Eyebrow>
          <DisplayHeading as="h2" className="mt-3 max-w-[640px] text-[54px]">
            How WITHIN compares.
          </DisplayHeading>
        </div>
        <p className="mb-0 max-w-[360px] text-[15px] leading-[1.55] text-wi-ink-500">
          Hydration is fluid plus minerals. Most of what&apos;s sold gets the minerals wrong:
          too little, or buried under sugar.
        </p>
      </Reveal>
      <Reveal className="mt-10 md:mt-12" delay={100}>
        <CompareTable />
      </Reveal>
    </Section>
  );
}
