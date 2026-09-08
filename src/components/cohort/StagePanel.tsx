import Image from "next/image";

import { Reveal } from "@/components/coming-soon/Reveal";
import { cn } from "@/lib/utils";

import { StoryBlank } from "./StoryBlank";
import type { ICohortMember } from "./utils/members";
import { memberRegister } from "./utils/members";

interface StagePanelProps {
  member: ICohortMember;
}

/**
 * One founding member as a full-viewport instrument panel: portrait bled off one edge on
 * desktop, stacked above the name on phones, and an empty readout with a waiting caret.
 * Sides alternate down the page so the eye is handed across on every scroll.
 */
export function StagePanel({ member }: StagePanelProps) {
  const portraitOnLeft = member.index % 2 === 0;
  // The first panel is the page's LCP candidate.
  const isLeadPortrait = member.index === 1;

  return (
    <section className="relative flex min-h-svh flex-col justify-center border-t border-wi-on-dark-line bg-wi-black">
      {/* One portrait for both breakpoints: in flow on phones, bled off one edge from `lg`
          up. Rendering a second <Image> for mobile would download every portrait twice. */}
      <div
        className={cn(
          "relative mx-5 mt-20 aspect-[3/4] overflow-hidden rounded-[var(--wi-radius-card)] border border-wi-on-dark-line md:mx-7 lg:absolute lg:inset-y-0 lg:m-0 lg:aspect-auto lg:w-[46%] lg:rounded-none lg:border-0",
          portraitOnLeft ? "lg:left-0" : "lg:right-0"
        )}
      >
        <Image
          src={member.portrait}
          alt={member.name}
          fill
          sizes="(max-width: 1024px) 100vw, 46vw"
          draggable={false}
          priority={isLeadPortrait}
          // See RosterPlate for the grayscale reasoning.
          className="object-cover object-center grayscale"
        />
        {/* Scrim always fades toward the copy, so it flips with the portrait. */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 hidden from-wi-black from-8% via-wi-black/45 to-wi-black/0 lg:block",
            portraitOnLeft ? "bg-linear-to-l" : "bg-linear-to-r"
          )}
        />
      </div>

      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-14 md:px-7 lg:py-20">
        <div className={cn("max-w-[560px]", portraitOnLeft && "lg:ml-auto")}>
          <Reveal>
            <span className="wi-readout block text-[11px] uppercase tracking-[0.14em] text-wi-on-dark-2">
              {memberRegister(member.index)}
            </span>
            <h2 className="mt-6 mb-0 text-[clamp(38px,5.6vw,72px)] font-medium leading-[0.98] tracking-[-0.04em] text-wi-paper text-balance">
              {member.name}
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-12">
            <StoryBlank variant="caret" tone="dark" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
