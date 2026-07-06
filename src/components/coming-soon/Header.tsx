import { WithinLogo } from "@/components/brand/WithinLogo";

import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { InstagramGlyph } from "./svg/InstagramGlyph";

/** Sticky black top bar: wordmark, a "coming soon" pill, and the Instagram link. */
export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-wi-black border-b border-wi-on-dark-line">
      <div className="max-w-[1200px] mx-auto h-[66px] px-7 flex items-center gap-4">
        <WithinLogo kind="logotype" color="white" height={17} priority />
        <span className="py-1 px-[9px] border border-wi-on-dark-line rounded-full text-[10px] font-bold tracking-[0.14em] uppercase text-wi-on-dark-2">
          Coming soon
        </span>
        <div className="flex-1" />
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-wi-paper text-xs font-bold tracking-[0.1em] uppercase no-underline"
        >
          <InstagramGlyph size={17} />
          <span className="wi-ig-label">{INSTAGRAM_HANDLE}</span>
        </a>
      </div>
    </header>
  );
}
