import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";

import { WaitlistArrowGlyph, WaitlistCheckGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

interface WaitlistCtaProps {
  /** True once the visitor has signed up; ink stamps over the orange and the arrow becomes a check. */
  isJoined: boolean;
  /** Opens the waitlist sheet, or the confirmation once joined; receives the button so focus can return to it. */
  onOpen: (trigger: HTMLButtonElement) => void;
  className?: string;
}

/**
 * The one orange call to action on the page. Joining plays once: the label blur-crossfades, an ink
 * layer wipes in from the left carrying the new label, and a check draws itself as the wipe lands.
 * Leaving the joined state (editing details) reverses in a plain 150ms.
 */
export function WaitlistCta({ isJoined, onOpen, className }: WaitlistCtaProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onOpen(event.currentTarget);
  }

  return (
    <div className={cn("flex flex-none flex-col", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={isJoined ? WAITLIST_COPY.ctaJoined : WAITLIST_COPY.cta}
        data-joined={isJoined ? "" : undefined}
        onClick={handleClick}
        className="group relative block h-14 w-full cursor-pointer overflow-hidden bg-flavor-orange text-base font-semibold text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink transition-transform duration-150 ease-brand active:scale-[0.97] motion-reduce:transition-none desk:h-16 desk:text-lg"
      >
        {/* Orange layer: the resting button. Its label crossfades so the ink wipe reveals the same words. */}
        <span aria-hidden className="absolute inset-0 flex items-center justify-center gap-3 px-5 desk:px-6">
          <span className="grid">
            <span className="col-start-1 row-start-1 whitespace-nowrap transition-[opacity,filter] duration-[180ms] ease-brand group-data-joined:opacity-0 group-data-joined:blur-[2px]">
              {WAITLIST_COPY.cta}
            </span>
            <span className="col-start-1 row-start-1 whitespace-nowrap opacity-0 blur-[2px] transition-[opacity,filter] duration-[180ms] ease-brand group-data-joined:opacity-100 group-data-joined:blur-none">
              {WAITLIST_COPY.ctaJoined}
            </span>
          </span>
          <WaitlistArrowGlyph className="transition-[opacity,translate] duration-[160ms] ease-brand group-hover:translate-x-1 group-data-joined:translate-x-1 group-data-joined:opacity-0 motion-reduce:transition-none" />
        </span>
        {/* Ink layer: clipped to nothing until joined, then wiped open left to right. */}
        <span
          aria-hidden
          className="absolute inset-0 flex items-center justify-center gap-3 bg-brand-ink px-5 text-brand-mist transition-[clip-path] duration-150 ease-brand [clip-path:inset(0_100%_0_0)] group-data-joined:duration-[480ms] group-data-joined:[clip-path:inset(0_0_0_0)] motion-reduce:transition-none desk:px-6"
        >
          <span className="whitespace-nowrap">{WAITLIST_COPY.ctaJoined}</span>
          <WaitlistCheckGlyph pathClassName="transition-[stroke-dashoffset] duration-[260ms] delay-[260ms] ease-brand [stroke-dasharray:1] [stroke-dashoffset:1] group-data-joined:[stroke-dashoffset:0] motion-reduce:transition-none" />
        </span>
      </button>
    </div>
  );
}
