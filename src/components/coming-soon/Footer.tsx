import { WithinLogo } from "@/components/brand/WithinLogo";

import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { SectionContainer } from "./Section";
import { InstagramGlyph } from "./svg/InstagramGlyph";

/** Black footer: wordmark, tagline, Instagram follow, and a legal row. */
export function Footer() {
  return (
    <footer className="bg-wi-black text-wi-paper">
      <SectionContainer
        className="flex flex-wrap items-end justify-between gap-[30px] pb-[30px]"
      >
        <div>
          <WithinLogo kind="logotype" color="white" height={20} />
          <p className="mt-4 max-w-[280px] text-sm leading-normal text-wi-on-dark-2">
            The electrolytes you sweat out, and nothing you don&apos;t. Made in Indonesia.
          </p>
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-[10px] rounded-md border border-wi-on-dark-line px-4 py-3 text-[13px] font-bold uppercase tracking-[0.1em] text-wi-paper no-underline"
        >
          <InstagramGlyph size={18} />
          Follow {INSTAGRAM_HANDLE}
        </a>
      </SectionContainer>
      <SectionContainer
        flush
        className="flex flex-wrap justify-between gap-2 border-t border-wi-on-dark-line py-[18px] text-xs text-wi-on-dark-3"
      >
        <span>© 2026 WITHIN</span>
        <span>Jakarta · Indonesia</span>
      </SectionContainer>
    </footer>
  );
}
