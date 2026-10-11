import { DialogClose, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import { WaitlistCloseGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY, WAITLIST_ELECTROLYTES } from "./utils/waitlist-copy";

/** The nutrition-label card: white, 2px ink border, thick black rules. Doses, then sugar and ingredient count, then the list. */
export function WaitlistFactsCard() {
  const { facts } = WAITLIST_COPY;

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <DialogTitle className="m-0 text-2xl leading-7 font-bold tracking-[-0.01em] desk:text-[30px] desk:leading-[34px]">
            {facts.title}
          </DialogTitle>
          <p className="mt-0.5 mb-0 text-[13px] leading-[18px]">{facts.serving}</p>
        </div>
        <DialogClose
          aria-label={facts.closeLabel}
          className="-mt-2.5 -mr-3 flex size-11 cursor-pointer items-center justify-center text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          <WaitlistCloseGlyph />
        </DialogClose>
      </div>
      <div className="mt-2 h-1.5 bg-brand-ink desk:h-2.5" />
      <p className="m-0 border-b border-brand-ink pt-2 pb-[5px] text-xs leading-4 font-bold tracking-[0.06em]">
        {facts.electrolytesHeading}
      </p>
      {WAITLIST_ELECTROLYTES.map((row, index) => (
        <div
          key={row.name}
          className={cn(
            "flex items-baseline justify-between py-[7px]",
            index === WAITLIST_ELECTROLYTES.length - 1
              ? "border-b-[3px] border-brand-ink desk:border-b-[5px]"
              : "border-b border-brand-ink/24"
          )}
        >
          <span className="text-sm leading-5 desk:text-base desk:leading-[22px]">{row.name}</span>
          <span className="text-lg leading-[22px] font-semibold tracking-[-0.02em] desk:text-2xl desk:leading-7">
            {row.amount}
          </span>
        </div>
      ))}
      {[
        { name: facts.sugarName, amount: facts.sugarAmount },
        { name: facts.ingredientsName, amount: facts.ingredientsAmount },
      ].map((row, index) => (
        <div
          key={row.name}
          className={cn(
            "flex items-baseline justify-between py-[9px]",
            index === 0
              ? "border-b border-brand-ink/24"
              : "border-b-[6px] border-brand-ink desk:border-b-[10px]"
          )}
        >
          <span className="text-sm leading-5 font-bold desk:text-base desk:leading-[22px]">{row.name}</span>
          <span className="text-lg leading-[22px] font-semibold tracking-[-0.02em] desk:text-2xl desk:leading-7">
            {row.amount}
          </span>
        </div>
      ))}
      <p className="mt-2.5 mb-0 text-sm leading-5">{facts.ingredients}</p>
    </>
  );
}
