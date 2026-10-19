import type { MouseEvent } from "react";

import { cn } from "@/lib/utils";

import { WaitlistArrowGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

interface WaitlistCtaProps {
  /** True once the visitor has signed up; swaps the label. */
  isJoined: boolean;
  /** Opens the waitlist sheet; receives the button so focus can return to it. */
  onOpen: (trigger: HTMLButtonElement) => void;
  className?: string;
}

/** The one orange call to action on the page. */
export function WaitlistCta({ isJoined, onOpen, className }: WaitlistCtaProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    onOpen(event.currentTarget);
  }

  return (
    <div className={cn("flex flex-none flex-col", className)}>
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={handleClick}
        className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 bg-flavor-orange px-5 text-base font-semibold text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink transition-transform duration-150 ease-brand active:scale-[0.97] motion-reduce:transition-none desk:h-16 desk:px-6 desk:text-lg"
      >
        <span>{isJoined ? WAITLIST_COPY.ctaJoined : WAITLIST_COPY.cta}</span>
        <WaitlistArrowGlyph className="transition-transform duration-150 ease-brand group-hover:translate-x-1 motion-reduce:transition-none" />
      </button>
    </div>
  );
}
