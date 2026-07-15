"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Atom, Ban, Droplet, Leaf, Zap, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";

/** A Lucide glyph key, or the `flag` sentinel for the Indonesia mark. */
type CalloutIcon = "droplet" | "zap" | "atom" | "ban" | "leaf" | "flag";

/** Maps each glyph key to its Lucide component (the `flag` sentinel is handled separately). */
const LUCIDE: Record<Exclude<CalloutIcon, "flag">, LucideIcon> = {
  droplet: Droplet,
  zap: Zap,
  atom: Atom,
  ban: Ban,
  leaf: Leaf,
};

/** title, icon, expandable description — the six things inside a WITHIN sachet. */
const CALLOUTS: readonly [string, CalloutIcon, string][] = [
  [
    "1000mg Sodium",
    "droplet",
    "The primary electrolyte lost in sweat. Sodium restores fluid balance, keeps blood volume up and enables muscle contractions during hard efforts.",
  ],
  [
    "250mg Potassium",
    "zap",
    "Works with sodium to move water into your cells and steady muscle function, helping prevent cramps late in a session.",
  ],
  [
    "50mg Magnesium",
    "atom",
    "Supports energy metabolism and normal muscle and nerve function, helping you recover after the grind.",
  ],
  ["Zero Sugar", "ban", "No sugar added, no sweetener bloat. Hydration without the crash."],
  [
    "All Natural",
    "leaf",
    "Less than 8 ingredients, no additives, no artificial sweeteners or colors. Just the minerals your body loses.",
  ],
  [
    "Made in Indonesia",
    "flag",
    "Formulated and produced in Indonesia, for the heat and humidity of the real Indonesian environment.",
  ],
];

/** The Indonesian flag (red over white) — the one factual spot of hue, sized beside a Lucide glyph. */
function IndonesiaFlag() {
  return (
    <svg width={22} height={16} viewBox="0 0 30 22" aria-hidden="true" className="block">
      <rect width="30" height="11" fill="#ce1126" />
      <rect y="11" width="30" height="11" fill="#ffffff" />
      <rect x="0.5" y="0.5" width="29" height="21" fill="none" stroke="rgba(0,0,0,0.25)" />
    </svg>
  );
}

/** The dotted ellipse the sachet floats inside — 34 marks on a near-circular path. */
function DottedRing() {
  const dots = Array.from({ length: 34 }, (_, i) => {
    const angle = (i / 34) * Math.PI * 2;
    return (
      <circle
        key={i}
        cx={50 + 46 * Math.cos(angle)}
        cy={50 + 47 * Math.sin(angle)}
        r={0.55}
        fill="currentColor"
      />
    );
  });
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full text-wi-black"
    >
      {dots}
    </svg>
  );
}

interface SachetCalloutProps {
  title: string;
  icon: CalloutIcon;
  tip: string;
  /** Which orbit column it sits in — flips icon/text order and anchors the tooltip. */
  side: "left" | "right";
  /** Nudge toward the sachet to trace the ring's curve (outer rows only). */
  inset?: boolean;
  open: boolean;
  onToggle: (open: boolean) => void;
}

/** One labelled callout with a click-to-open description tooltip. */
function SachetCallout({ title, icon, tip, side, inset = false, open, onToggle }: SachetCalloutProps) {
  const left = side === "left";
  const Glyph = icon === "flag" ? null : LUCIDE[icon];
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={open}
      onClick={(e) => {
        e.stopPropagation();
        onToggle(!open);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle(!open);
        }
      }}
      className={cn(
        "relative flex cursor-pointer items-center justify-start gap-[5px]",
        left ? "flex-row-reverse" : "flex-row",
        inset && (left ? "-mr-9" : "-ml-9"),
        "max-[760px]:mx-0 max-[760px]:w-full max-[760px]:flex-row max-[760px]:justify-start",
      )}
    >
      <span className={cn("grid flex-none place-items-center text-wi-black", left ? "ml-[7px]" : "mr-[7px]")}>
        {Glyph ? <Glyph size={22} strokeWidth={2} aria-hidden="true" /> : <IndonesiaFlag />}
      </span>
      <span className="whitespace-nowrap font-bold uppercase leading-[1.15] tracking-[-0.01em] text-wi-black text-[clamp(15px,1.5vw,19px)] max-[760px]:whitespace-normal max-[760px]:text-sm">
        {title}
      </span>
      <span
        aria-hidden="true"
        className="inline-block flex-none -translate-y-px self-center text-h3 font-bold leading-px text-wi-black max-[760px]:ml-auto max-[760px]:pl-2"
      >
        +
      </span>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "absolute top-[calc(100%+10px)] z-[5] w-[260px] rounded-[var(--wi-radius-control)] bg-wi-black px-4 py-[14px] text-left text-[13.5px] font-normal normal-case leading-[1.5] text-wi-on-dark-1 shadow-[var(--wi-shadow-lg)]",
            left ? "right-0" : "left-0",
            "max-[760px]:left-0 max-[760px]:right-auto max-[760px]:w-[min(260px,78vw)]",
          )}
        >
          {tip}
        </div>
      )}
    </div>
  );
}

/** "What's Within" — the sachet floating in a dotted ring, ringed by six expandable callouts. */
export function SachetCallouts() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // A click anywhere else dismisses the open tooltip (callouts stop their own propagation).
  useEffect(() => {
    if (openIndex === null) return;
    const close = () => setOpenIndex(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openIndex]);

  /** Renders callout `index` on a given side, wired to the single-open tooltip state. */
  const callout = (index: number, side: "left" | "right", inset: boolean) => {
    const [title, icon, tip] = CALLOUTS[index];
    return (
      <SachetCallout
        title={title}
        icon={icon}
        tip={tip}
        side={side}
        inset={inset}
        open={openIndex === index}
        onToggle={(next) => setOpenIndex(next ? index : null)}
      />
    );
  };

  return (
    <section className="box-border flex min-h-svh items-center overflow-hidden bg-wi-paper px-7 py-[clamp(24px,4vh,72px)]">
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="mx-auto mb-3 max-w-[620px] text-center">
          <Eyebrow>What&apos;s Within</Eyebrow>
          <DisplayHeading as="h2" className="mt-[14px] text-[min(clamp(28px,4.5vw,52px),6.5vh)]">
            Three minerals in. The rest, left out.
          </DisplayHeading>
          <p className="mx-auto mt-3 max-w-[460px] leading-[1.5] text-wi-ink-500 text-[min(15px,2.4vh)]">
            One sachet. Only the minerals your body sweats out, at the dose it loses them. Nothing
            added to pad the label.
          </p>
        </div>

        <div className="grid grid-cols-[1fr_minmax(min(260px,40vh),min(400px,44vh))_1fr] items-center gap-x-2 gap-y-6 max-[760px]:grid-cols-2 max-[760px]:gap-x-8 max-[760px]:gap-y-0">
          <div className="grid justify-items-end gap-[min(110px,14vh)] max-[760px]:row-start-2 max-[760px]:mt-5 max-[760px]:content-start max-[760px]:gap-4 max-[760px]:justify-items-start">
            {callout(0, "left", true)}
            {callout(1, "left", false)}
            {callout(2, "left", true)}
          </div>

          <div className="relative grid aspect-[1/1.12] place-items-center max-[760px]:order-first max-[760px]:col-span-2 max-[760px]:row-start-1 max-[760px]:mx-auto max-[760px]:w-full max-[760px]:max-w-[min(300px,34vh)]">
            <DottedRing />
            <div className="w-[58%] rotate-[14deg]">
              <motion.div
                animate={{ y: [-8, 10, -8] }}
                transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              >
                <Image
                  src="/coming-soon/sachet-single.png"
                  alt="WITHIN electrolyte sachet"
                  width={1632}
                  height={3526}
                  sizes="(max-width: 760px) 300px, 240px"
                  draggable={false}
                  className="h-auto w-full drop-shadow-[0_24px_40px_rgba(0,0,0,0.22)]"
                />
              </motion.div>
            </div>
          </div>

          <div className="grid justify-items-start gap-[min(110px,14vh)] max-[760px]:row-start-2 max-[760px]:mt-5 max-[760px]:content-start max-[760px]:gap-4 max-[760px]:justify-items-start">
            {callout(3, "right", true)}
            {callout(4, "right", false)}
            {callout(5, "right", true)}
          </div>
        </div>
      </div>
    </section>
  );
}
