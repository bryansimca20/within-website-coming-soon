"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "motion/react";

import { EASE, Reveal } from "./Reveal";
import { SectionContainer } from "./Section";

/** name, class, role, image — each ingredient as a labelled specimen in the gallery. */
const INGREDIENTS: readonly [string, string, string, string][] = [
  ["Sodium chloride", "Sodium salt", "Provides sodium for extracellular fluid balance. Works with potassium to help nerves signal and muscles contract.", "/coming-soon/mineral-sodium.webp"],
  ["Potassium chloride", "Potassium salt", "Provides potassium for intracellular fluid balance. Works with sodium to help nerves signal and muscles contract.", "/coming-soon/mineral-potassium.avif"],
  ["Magnesium carbonate", "Magnesium salt", "Provides magnesium for a range of biochemical reactions. Plays an important role in energy production and neuromuscular function.", "/coming-soon/mineral-magnesium.webp"],
  ["Natural flavoring", "Natural flavors", "Flavor from natural sources. No artificial flavors or colors.", "/coming-soon/flavoring-orange.avif"],
  ["Natural sweetener", "Stevia", "Provides sweetness without added sugar.", "/coming-soon/sweetener-stevia.jpg"],
];

/** The formula laid open: a drag-scrollable gallery of every ingredient, labelled. */
export function Ledger() {
  const scroller = useRef<HTMLDivElement>(null);
  const inView = useInView(scroller, { once: true, margin: "0px 0px -80px 0px" });

  return (
    <section id="ledger" className="border-t border-wi-line bg-wi-paper">
      <SectionContainer flush className="pt-16 md:pt-20">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 max-w-[16ch] text-[clamp(30px,4vw,52px)] font-medium leading-[1.0] tracking-[-0.035em] text-wi-black text-balance">
            Less than 8 ingredients. Each with a purpose.
          </h2>
          <p className="mb-0 max-w-[38ch] text-[15px] leading-[1.55] text-wi-ink-500">
            Nothing added without reason. Nothing hidden in fine print.
          </p>
        </Reveal>
      </SectionContainer>

      {/* Ingredient gallery — full colour, horizontally scrollable on every size.
          Padding lives on the outer container so the first card aligns with the heading;
          padding on the scroll container itself is dropped from the first item. */}
      <SectionContainer flush className="pb-14 md:pb-[88px]">
        <div
          ref={scroller}
          className="wi-noscrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pt-10 pb-2"
        >
        {INGREDIENTS.map(([name, cls, role, src], i) => (
          <motion.article
            key={name}
            className="w-[clamp(230px,26vw,320px)] shrink-0 snap-start"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.5, ease: EASE, delay: i * 0.07 }}
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--wi-radius-card)] border border-wi-line bg-wi-paper-dim">
              <Image
                src={src}
                alt={name}
                fill
                sizes="(max-width: 860px) 80vw, 320px"
                draggable={false}
                className="object-cover"
              />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-wi-black pt-3">
              <span className="text-[16px] font-medium tracking-[-0.01em] text-wi-black">{name}</span>
              <span className="shrink-0 text-[10.5px] uppercase tracking-[0.1em] text-wi-ink-300">{cls}</span>
            </div>
            <p className="mt-2 mb-0 text-[14px] leading-[1.5] text-wi-ink-500">{role}</p>
          </motion.article>
        ))}
        </div>
      </SectionContainer>
    </section>
  );
}
