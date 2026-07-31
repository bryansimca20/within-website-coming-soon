import { InstagramLogo } from "@phosphor-icons/react/ssr";

import { WithinLogo } from "@/components/brand/WithinLogo";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

/** Minimal clinical footer: wordmark, one-line promise, Instagram, and a legal row. */
export function Footer() {
  return (
    <footer className="border-t border-wi-line bg-wi-paper">
      <div className="mx-auto w-full max-w-[1240px] px-5 py-14 md:px-7">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div>
            <WithinLogo kind="logotype" color="black" height={20} />
            <p className="mt-4 mb-0 max-w-[300px] text-[14px] leading-[1.5] text-wi-ink-500">
              The minerals you sweat out, dosed to the milligram, and nothing you do not. Made in
              Indonesia.
            </p>
          </div>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-[10px] rounded-[var(--wi-radius-control)] border border-wi-line px-4 py-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-wi-black no-underline transition-colors hover:border-wi-black"
          >
            <InstagramLogo size={18} />
            Follow {INSTAGRAM_HANDLE}
          </a>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-wi-line pt-6 text-[12px] text-wi-ink-300">
          <span className="wi-readout tracking-[0.02em]">© 2026 WITHIN</span>
          <span className="wi-readout tracking-[0.02em]">Jakarta, Indonesia</span>
        </div>
      </div>
    </footer>
  );
}
