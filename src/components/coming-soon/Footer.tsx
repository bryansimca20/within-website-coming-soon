import { WithinLogo } from "@/components/brand/WithinLogo";

import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from "@/lib/site";

import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";
import { Reveal } from "./Reveal";
import { SignupForm } from "./SignupForm";
import { SectionContainer } from "./Section";
import { InstagramGlyph } from "./svg/InstagramGlyph";

/** Black footer: pre-launch signup, wordmark, tagline, Instagram follow, and a legal row. */
export function Footer() {
  return (
    <footer className="bg-wi-black text-wi-paper">
      <div className="max-w-[1200px] mx-auto px-7 pt-[88px] pb-14">
        <Reveal>
          <Eyebrow dark>Before launch</Eyebrow>
          <DisplayHeading as="h2" dark className="mt-4 text-[clamp(30px,3.6vw,46px)] max-w-[620px]">
            Get the launch discount
          </DisplayHeading>
          <p className="mt-[18px] mb-0 max-w-[440px] text-wi-on-dark-2 text-[17px] leading-[1.55]">
            Leave your email and we will send you a code on launch day. Add your Instagram if
            you want us to reach you there too.
          </p>
          <SignupForm tone="inverse" className="mt-8" />
        </Reveal>
      </div>
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
