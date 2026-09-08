import Image from "next/image";

import { cn } from "@/lib/utils";

import { StoryBlank } from "./StoryBlank";
import type { ICohortMember } from "./utils/members";
import { memberRegister } from "./utils/members";

interface DossierSpreadProps {
  member: ICohortMember;
}

/**
 * One founding member as an unset magazine spread: portrait on one side, an unwritten
 * feature page on the other. Sides alternate down the page.
 */
export function DossierSpread({ member }: DossierSpreadProps) {
  const portraitLeads = member.index % 2 === 1;
  // The first spread is the page's LCP candidate.
  const isLeadPortrait = member.index === 1;

  return (
    <article className="grid items-center gap-10 border-t border-wi-line py-16 md:py-24 lg:grid-cols-12 lg:gap-16">
      <div
        className={cn(
          "relative aspect-[4/5] overflow-hidden rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper-dim lg:col-span-5",
          portraitLeads ? "lg:order-1" : "lg:order-2"
        )}
      >
        <Image
          src={member.portrait}
          alt={member.name}
          fill
          sizes="(max-width: 1024px) 90vw, 460px"
          draggable={false}
          priority={isLeadPortrait}
          // See RosterPlate for the grayscale and crop reasoning.
          className="object-cover object-center grayscale"
        />
      </div>

      <div className={cn("lg:col-span-7", portraitLeads ? "lg:order-2" : "lg:order-1")}>
        <span className="wi-readout block text-[11px] uppercase tracking-[0.14em] text-wi-ink-500">
          {memberRegister(member.index)}
        </span>
        <h2 className="mt-5 mb-0 text-[clamp(32px,4.4vw,56px)] font-medium leading-[1] tracking-[-0.035em] text-wi-black text-balance">
          {member.name}
        </h2>
        <StoryBlank variant="manuscript" lines={6} className="mt-12 max-w-[54ch]" />
      </div>
    </article>
  );
}
