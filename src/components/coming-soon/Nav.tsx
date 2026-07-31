import { InstagramLogo } from "@phosphor-icons/react/ssr";

import { WithinLogo } from "@/components/brand/WithinLogo";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { WaitlistOverlay } from "./WaitlistOverlay";

/** Sticky clinical top bar: wordmark, a mono status, Instagram, and the waitlist action. */
export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-wi-line bg-wi-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--wi-nav-h)] w-full max-w-[1240px] items-center gap-4 px-5 md:px-7">
        <WithinLogo kind="logotype" color="black" height={15} priority />
        <span className="hidden text-[11px] font-medium uppercase tracking-[0.12em] text-wi-ink-300 min-[420px]:inline">
          Coming soon
        </span>
        <div className="flex-1" />
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WITHIN on Instagram, ${INSTAGRAM_HANDLE}`}
          className="inline-flex items-center gap-2 text-wi-ink-500 no-underline transition-colors hover:text-wi-black"
        >
          <InstagramLogo size={20} />
          <span className="hidden text-[13px] font-medium tracking-[0.01em] min-[560px]:inline">
            {INSTAGRAM_HANDLE}
          </span>
        </a>
        <WaitlistOverlay tone="default" />
      </div>
    </header>
  );
}
