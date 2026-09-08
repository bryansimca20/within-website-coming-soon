import Image from "next/image";

import { StoryBlank } from "./StoryBlank";
import type { ICohortMember } from "./utils/members";
import { memberRegister } from "./utils/members";

interface RosterPlateProps {
  member: ICohortMember;
}

/**
 * One founding member in the roster grid: portrait plate, identity rule, and the ruled
 * form where their story will be written.
 */
export function RosterPlate({ member }: RosterPlateProps) {
  // The first plate is the roster grid's LCP candidate.
  const isLeadPortrait = member.index === 1;

  return (
    <article className="flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper-dim">
        <Image
          src={member.portrait}
          alt={member.name}
          fill
          sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 280px"
          draggable={false}
          priority={isLeadPortrait}
          // Grayscale unifies eight portraits shot in different light and holds them inside
          // the monochrome system. Sources are pre-cropped on the subject, so centre is right.
          className="object-cover object-center grayscale"
        />
      </div>
      <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-wi-black pt-3">
        <h3 className="m-0 text-[17px] font-medium tracking-[-0.015em] text-wi-black">
          {member.name}
        </h3>
        <span className="wi-readout shrink-0 text-[10.5px] uppercase tracking-[0.1em] text-wi-ink-500">
          {memberRegister(member.index)}
        </span>
      </div>
      <StoryBlank variant="ruled" lines={4} className="mt-7" />
    </article>
  );
}
