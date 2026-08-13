"use client";

import Image from "next/image";
import { motion } from "motion/react";

import { EASE } from "./Reveal";
import { WaitlistOverlay } from "./WaitlistOverlay";

const rise = {
  hidden: { opacity: 0, y: 22 },
  show: (d: number) => ({ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE, delay: d } }),
};

/**
 * The hero: the argument on paper at left, the double sachet at right, both standing on a
 * track band that runs up the left edge and fades into the page before it reaches the product.
 */
export function Hero() {
  return (
    <section className="relative min-h-[calc(100svh-var(--wi-nav-h))] overflow-hidden">
      <div aria-hidden className="absolute inset-0 bg-wi-paper" />
      <div aria-hidden className="absolute inset-y-0 left-0 w-[62%] overflow-hidden">
        <Image
          src="/coming-soon/aerial-runner.jpeg"
          alt=""
          fill
          sizes="62vw"
          priority
          className="object-cover object-center"
        />
        {/* fade the band's inner edge into paper, toward the product */}
        <div className="absolute inset-0 bg-linear-to-l from-wi-paper via-wi-paper/10 to-transparent" />
      </div>
      {/* wash behind the headline so the ink type stays legible over the track */}
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-r from-wi-paper/90 from-5% via-wi-paper/45 to-transparent to-55%"
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-var(--wi-nav-h))] w-full max-w-[1240px] items-center gap-10 px-5 py-16 md:px-7 lg:grid-cols-[1fr_0.9fr] lg:gap-16 lg:py-0">
        {/* the argument */}
        <div className="order-2 lg:order-1">
          <motion.h1
            custom={0.1}
            variants={rise}
            initial="hidden"
            animate="show"
            className="m-0 max-w-[15ch] text-[clamp(46px,7.2vw,92px)] font-medium leading-[0.92] tracking-[-0.045em] text-wi-black text-balance"
          >
            Put back what the heat takes out.
          </motion.h1>
          <motion.p
            custom={0.26}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-6 mb-0 max-w-[46ch] text-[18px] leading-[1.55] text-wi-ink-700"
          >
            An electrolyte drink sachet with the minerals you lose in sweat, dosed to the milligram.
            Made in Indonesia.
          </motion.p>
          <motion.div
            custom={0.38}
            variants={rise}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3"
          >
            <WaitlistOverlay tone="default" />
            <span className="wi-readout text-[11px] uppercase tracking-[0.14em] text-wi-ink-500">
              Waitlist · 10% off at launch
            </span>
          </motion.div>
        </div>

        {/* the pair */}
        <motion.div
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: EASE, delay: 0.2 } }}
          className="relative order-1 flex h-[48vh] items-center justify-center lg:order-2 lg:h-[calc(100svh-var(--wi-nav-h))]"
        >
          <div
            aria-hidden
            className="absolute bottom-[16%] left-1/2 h-[7%] w-[46%] -translate-x-1/2 rounded-[50%] bg-wi-black/20 blur-2xl"
          />
          <motion.div
            animate={{ y: [-10, 12, -10] }}
            transition={{ duration: 7.5, ease: "easeInOut", repeat: Infinity }}
          >
            <Image
              src="/coming-soon/sachet-double.png"
              alt="Two WITHIN electrolyte sachets"
              width={2163}
              height={4460}
              sizes="(max-width: 1024px) 56vw, 300px"
              priority
              draggable={false}
              className="h-[42vh] max-h-[520px] w-auto drop-shadow-[0_44px_74px_rgba(11,13,18,0.4)] lg:h-[66vh]"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
