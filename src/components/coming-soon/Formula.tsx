"use client";

import type { ComponentType } from "react";
import { useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";
import { Candy, Cookie, FlaskConical, Palette, X } from "lucide-react";

import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";
import { EASE, Reveal, RevealGroup, RevealItem } from "./Reveal";

/** name, description, image src — the ingredient carousel cards. */
const ITEMS: [string, string, string][] = [
  [
    "Sodium chloride",
    "The primary electrolyte lost in sweat. Restores fluid balance and keeps output high.",
    "/coming-soon/mineral-sodium.webp",
  ],
  [
    "Potassium chloride",
    "Works with sodium to move water into cells and steady muscle function.",
    "/coming-soon/mineral-potassium.avif",
  ],
  [
    "Magnesium carbonate",
    "Supports energy metabolism and helps muscles recover after the grind.",
    "/coming-soon/mineral-magnesium.webp",
  ],
  [
    "Natural flavoring",
    "Flavor from real fruit. Nothing synthetic, nothing artificial.",
    "/coming-soon/flavoring-orange.avif",
  ],
  [
    "Natural sweetener",
    "Stevia leaf. Zero sugar, zero calories. Sweetness without the crash.",
    "/coming-soon/sweetener-stevia.jpg",
  ],
];

/** label, Lucide icon — the "what's not in it" markers. */
const NOTINS: [string, ComponentType<{ size?: number; strokeWidth?: number }>][] = [
  ["No artificial colors", Palette],
  ["No artificial flavors", FlaskConical],
  ["No artificial sweeteners", Candy],
  ["No sugar added", Cookie],
];

/** The formula: a draggable ingredient gallery plus the "what's not in it" grid. */
export function Formula() {
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; sl: number } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = scroller.current;
    if (!el) return;
    drag.current = { x: e.clientX, sl: el.scrollLeft };
    el.style.scrollSnapType = "none";
    el.style.cursor = "grabbing";
    el.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const el = scroller.current;
    if (!d || !el) return;
    el.scrollLeft = d.sl - (e.clientX - d.x);
  };
  const endDrag = () => {
    const el = scroller.current;
    drag.current = null;
    if (el) {
      el.style.scrollSnapType = "x mandatory";
      el.style.cursor = "grab";
    }
  };

  return (
    <section className="bg-wi-paper text-wi-black">
      <div className="max-w-[1200px] mx-auto pt-24 px-7">
        <Reveal className="flex items-end justify-between gap-8 flex-wrap">
          <div>
            <Eyebrow>The formula</Eyebrow>
            <DisplayHeading as="h2" className="mt-3 max-w-[700px] text-[54px]">
              Less than 8 ingredients.
              <br />
              Nothing hidden.
            </DisplayHeading>
          </div>
          <p className="max-w-[340px] text-[15px] leading-[1.55] text-wi-ink-500 m-0">
            What your body loses, dosed for real output and printed in full on the front.
          </p>
        </Reveal>
      </div>

      <div
        ref={scroller}
        className="wi-form-scroll flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-p-[0_28px] cursor-grab select-none pt-11 px-7 pb-2 max-w-[1200px] mx-auto box-border"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {ITEMS.map(([name, desc, src]) => (
          <div
            key={name}
            className="shrink-0 grow-0 basis-auto w-[clamp(250px,27vw,330px)] snap-start"
          >
            <div className="relative w-full aspect-square overflow-hidden">
              <motion.div
                className="absolute inset-0"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                <Image
                  src={src}
                  alt={name}
                  fill
                  sizes="(max-width: 860px) 90vw, 330px"
                  draggable={false}
                  className="object-cover"
                />
              </motion.div>
            </div>
            <div className="mt-[18px] flex items-baseline justify-between gap-3 border-t border-wi-black pt-[14px]">
              <div className="font-bold text-base uppercase tracking-[0.02em]">
                {name}
              </div>
            </div>
            <p className="mt-[10px] mb-0 text-[14.5px] leading-[1.55] text-wi-ink-500">
              {desc}
            </p>
          </div>
        ))}
      </div>

      <div className="max-w-[1200px] mx-auto py-14 px-7 pb-[88px]">
        <div className="border-t-2 border-wi-black pt-10">
          <Eyebrow>What&apos;s not in it</Eyebrow>
          <RevealGroup className="wi-notins2 mt-7 grid grid-cols-4 gap-6">
            {NOTINS.map(([label, Icon], i) => (
              <RevealItem
                key={label}
                className={`flex flex-col gap-4 p-[4px_24px_4px_0]${i < NOTINS.length - 1 ? " border-r border-wi-line" : ""}`}
              >
                <span className="relative inline-flex items-center justify-center w-[46px] h-[46px] rounded-full border border-wi-line text-wi-black">
                  <Icon size={21} strokeWidth={1.9} />
                  <span className="absolute right-[-5px] top-[-5px] inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-wi-black text-wi-paper">
                    <X size={11} strokeWidth={2.4} />
                  </span>
                </span>
                <span className="font-bold text-base tracking-[-0.01em]">{label}</span>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}
