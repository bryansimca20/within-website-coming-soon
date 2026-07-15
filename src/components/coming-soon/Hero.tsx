"use client";

import { motion } from "motion/react";

import { DisplayHeading } from "./DisplayHeading";
import { EASE } from "./Reveal";

/** Hero content; the headline is editorially set and defaults to the launch line. */
interface HeroProps {
  headline?: string;
}

/** Full-bleed grayscale hero photo with a quiet, bottom-aligned lockup that rises in on load. */
export function Hero({ headline = "Redefining Your Hydration Routine. Soon" }: HeroProps) {
  return (
    <section className="relative bg-wi-black text-wi-paper overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[url(/coming-soon/hero-race.avif)] bg-cover bg-center grayscale"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/[0.38] via-black/[0.30] to-black/[0.72]"
      />
      <div className="relative max-w-[1200px] mx-auto pt-16 px-7 pb-[88px] min-h-[calc(100vh-66px)] box-border flex items-end">
        <div className="max-w-[640px]">
          <div className="overflow-hidden">
            <motion.div
              initial={{ y: "115%" }}
              animate={{ y: 0 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            >
              <DisplayHeading as="h1" dark className="text-[clamp(38px,4.8vw,62px)]">
                {headline}
              </DisplayHeading>
            </motion.div>
          </div>
          <motion.p
            className="mt-[18px] mb-0 max-w-[420px] text-wi-on-dark-2 text-[17px] leading-[1.55]"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE, delay: 0.35 }}
          >
            The stuff your body actually loses when you sweat, in a single sachet. No sugar,
            no additives, no artificial stuff. Made in Indonesia.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
