import { WithinLogo } from "@/components/brand/WithinLogo";

import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { InstagramGlyph } from "./svg/InstagramGlyph";

/** Black footer: wordmark, tagline, Instagram follow, and a legal row. */
export function Footer() {
  return (
    <footer className="bg-wi-black text-wi-paper">
      <div
        className="max-w-[1200px] mx-auto pt-14 px-7 pb-[30px] flex items-end justify-between gap-[30px] flex-wrap"
      >
        <div>
          <WithinLogo kind="logotype" color="white" height={20} />
          <p
            className="mt-4 text-sm text-wi-on-dark-2 max-w-[280px] leading-normal"
          >
            The electrolytes you sweat out, and nothing you don&apos;t. Made in Indonesia.
          </p>
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[10px] text-wi-paper text-[13px] font-bold tracking-[0.1em] uppercase no-underline border border-wi-on-dark-line rounded-md py-3 px-4"
        >
          <InstagramGlyph size={18} />
          Follow {INSTAGRAM_HANDLE}
        </a>
      </div>
      <div
        className="max-w-[1200px] mx-auto py-[18px] px-7 border-t border-wi-on-dark-line flex justify-between text-xs text-wi-on-dark-3 flex-wrap gap-2"
      >
        <span>© 2026 WITHIN</span>
        <span>Jakarta · Indonesia</span>
      </div>
    </footer>
  );
}
