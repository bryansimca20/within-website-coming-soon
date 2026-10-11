import { WithinLogo } from "@/components/brand/WithinLogo";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { WaitlistInstagramGlyph } from "./svg/WaitlistGlyphs";
import { WAITLIST_COPY } from "./utils/waitlist-copy";

/** Logotype on the left, Instagram on the right, over the 1px ink rule. */
export function WaitlistHeader() {
  return (
    <header className="flex flex-none items-center justify-between border-b border-brand-ink pt-[18px] pb-3 desk:mx-12 desk:pt-8 desk:pb-3.5">
      <WithinLogo
        kind="logotype"
        height={22}
        alt={WAITLIST_COPY.logoAlt}
        priority
        className="block h-[18px] w-auto desk:h-[22px]"
      />
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener"
        aria-label={WAITLIST_COPY.instagramLabel}
        className="-my-3 -mr-2.5 flex size-11 items-center justify-center gap-2.5 text-sm leading-5 text-brand-ink no-underline hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink desk:mr-0 desk:w-auto"
      >
        <span className="hidden desk:inline">{INSTAGRAM_HANDLE}</span>
        <WaitlistInstagramGlyph className="size-[22px] desk:size-6" />
      </a>
    </header>
  );
}
