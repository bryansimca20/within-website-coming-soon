import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/ssr";

import { CohortHeader } from "@/components/cohort/CohortHeader";
import { Footer } from "@/components/coming-soon/Footer";
import { Reveal } from "@/components/coming-soon/Reveal";
import { SectionContainer } from "@/components/coming-soon/Section";

export const metadata: Metadata = {
  title: "Cohort story prototypes",
};

/** slug, name, what the layout does, how the unwritten story is drawn. */
const PROTOTYPES: readonly [string, string, string, string][] = [
  [
    "roster",
    "Roster",
    "All eight together on one clinical grid, every member given the same frame and the same weight.",
    "Blank drawn as a ruled form",
  ],
  [
    "dossier",
    "Dossier",
    "One spread per member, portrait and page alternating down the scroll like an unset magazine feature.",
    "Blank drawn as an unset page",
  ],
  [
    "stage",
    "Stage",
    "Full-height panels on the dark instrument surface, one member at a time, built to project in a dark room.",
    "Blank drawn as a waiting caret",
  ],
];

/** Internal chooser for the three cohort story prototypes. Not linked from the live site. */
export default function CohortPrototypesPage() {
  return (
    <div className="flex flex-1 flex-col bg-wi-paper">
      <CohortHeader label="Prototypes" />
      <main className="flex-1">
        <SectionContainer flush className="pt-16 pb-20 md:pt-24 md:pb-28">
          <Reveal>
            <h1 className="m-0 max-w-[18ch] text-[clamp(34px,4.6vw,56px)] font-medium leading-[1] tracking-[-0.035em] text-wi-black text-balance">
              Three ways to show the cohort.
            </h1>
            <p className="mt-6 mb-0 max-w-[52ch] text-[17px] leading-[1.55] text-wi-ink-500">
              Each one holds the same eight founding members and leaves the same space empty.
              They differ in how that emptiness is drawn.
            </p>
          </Reveal>

          <div className="mt-14">
            {PROTOTYPES.map(([slug, name, description, blank], i) => (
              <Reveal key={slug} delay={80 + i * 60}>
                <Link
                  href={`/cohort/${slug}`}
                  className="group grid items-baseline gap-4 border-t border-wi-line py-8 no-underline transition-colors hover:border-wi-black md:grid-cols-12 md:gap-8"
                >
                  <span className="flex items-center gap-3 text-[22px] font-medium tracking-[-0.02em] text-wi-black md:col-span-3">
                    {name}
                    <ArrowRight
                      size={17}
                      className="translate-x-0 text-wi-ink-500 transition-[transform,color] duration-[190ms] ease-[var(--wi-ease-out)] group-hover:translate-x-1 group-hover:text-wi-black"
                    />
                  </span>
                  <span className="text-[15px] leading-[1.55] text-wi-ink-500 md:col-span-6">
                    {description}
                  </span>
                  <span className="wi-readout text-[10.5px] uppercase tracking-[0.12em] text-wi-ink-500 md:col-span-3 md:text-right">
                    {blank}
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </SectionContainer>
      </main>
      <Footer />
    </div>
  );
}
