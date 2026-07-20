"use client";

import { motion } from "motion/react";

import { DisplayHeading } from "./DisplayHeading";
import { Eyebrow } from "./Eyebrow";
import { EASE, Reveal, RevealGroup, RevealItem } from "./Reveal";
import { Section } from "./Section";

const REASONS: [string, string, string][] = [
  ["01", "Not just water", "Water puts the fluid back but not the minerals that left with it."],
  ["02", "The three that matter", "Sodium holds it, Potassium moves it, and Magnesium helps regulate muscle contractions."],
  ["03", "Dosed to your loss", "1000mg sodium + 250mg potassium. Enough to replace an hour of hard sweat, not a pinch for taste."],
];

/** name, low value, high value, low label, high label, axis max (mg) — sweat loss per hour. */
const STATS: [string, number, number, string, string, number][] = [
  ["Sodium", 900, 1250, "900", "1,250", 1600],
  ["Potassium", 125, 200, "125", "200", 400],
];

/** A horizontal range band (min–max) that grows against a per-stat mg scale when scrolled to. */
function RangeBar({
  min,
  max,
  scale,
  delay = 0,
}: {
  min: number;
  max: number;
  scale: number;
  delay?: number;
}) {
  const left = (min / scale) * 100;
  const width = ((max - min) / scale) * 100;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(scale * fraction));
  return (
    <div className="mt-3">
      <div className="relative h-4 bg-wi-paper-dim border border-wi-line rounded-[3px]">
        {[25, 50, 75].map((t) => (
          <span
            key={t}
            style={{ left: `${t}%` }}
            className="absolute top-0 bottom-0 w-px bg-wi-line"
          />
        ))}
        <motion.div
          className="absolute top-[2px] bottom-[2px] bg-wi-black rounded-[2px]"
          style={{ left: `${left}%` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${width}%` }}
          viewport={{ once: true, margin: "0px 0px -60px 0px" }}
          transition={{ duration: 0.9, ease: EASE, delay: delay / 1000 }}
        />
      </div>
      <div className="flex justify-between mt-[7px] text-[10.5px] font-bold tracking-[0.08em] text-wi-ink-300">
        {ticks.map((tick, i) => (
          <span key={tick}>
            {tick.toLocaleString("en-US")}
            {i === ticks.length - 1 ? " MG" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** "Why WITHIN" — the heat/humidity case, three reasons beside loss bars that grow in. */
export function WhyWithin() {
  return (
    <Section surface="paper" borderTop fullHeight>
      <Reveal>
        <Eyebrow>Why WITHIN</Eyebrow>
        <DisplayHeading as="h2" className="mt-3 max-w-[560px] text-[56px]">
          Built for the heat and humidity.
        </DisplayHeading>
        <p className="mt-[22px] max-w-[820px] text-base leading-[1.6] text-wi-ink-500">
          Train in Indonesia&apos;s heat and your sweat can&apos;t evaporate fast enough to cool
          you, so your body just makes more of it. Every drop carries minerals out with it,
          mostly sodium, some potassium. Tropical sweat isn&apos;t saltier. You just lose far
          more of it.
        </p>
      </Reveal>
      <div className="mt-14 grid grid-cols-1 items-start gap-10 border-t-2 border-wi-black min-[860px]:grid-cols-2 min-[860px]:gap-16">
        <RevealGroup>
          {REASONS.map(([n, title, body]) => (
            <RevealItem key={n} className="border-b border-wi-line py-[26px]">
              <div className="flex items-baseline gap-4">
                <span className="text-[13px] font-bold tracking-[0.1em] text-wi-ink-300">{n}</span>
                <span className="text-[22px] font-bold uppercase tracking-[-0.015em] text-wi-black">
                  {title}
                </span>
              </div>
              <p className="mb-0 mt-[10px] text-[15px] leading-[1.6] text-wi-ink-500">{body}</p>
            </RevealItem>
          ))}
        </RevealGroup>
        <div className="pt-[26px]">
          <Eyebrow className="mb-[26px]">Lost per hour of training</Eyebrow>
          {STATS.map(([name, min, max, lo, hi, scale], i) => (
            <div key={name} className="mb-[30px]">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-[13px] font-bold uppercase tracking-[0.12em] text-wi-black">
                  {name}
                </span>
                <span className="whitespace-nowrap">
                  <span className="text-[32px] font-bold tracking-[-0.03em] text-wi-black">{lo}</span>
                  <span className="mx-[6px] text-[15px] font-bold text-wi-ink-300">to</span>
                  <span className="text-[32px] font-bold tracking-[-0.03em] text-wi-black">{hi}</span>
                  <span className="ml-[5px] text-sm font-bold text-wi-ink-500">mg</span>
                </span>
              </div>
              <RangeBar min={min} max={max} scale={scale} delay={i * 160} />
            </div>
          ))}
          <p className="mb-0 mt-[22px] max-w-[420px] text-[11.5px] leading-[1.55] text-wi-ink-300">
            Sweat loss measured in runners at ~30°C / 70% humidity.{" "}
            <a
              href="https://pmc.ncbi.nlm.nih.gov/articles/PMC8072971/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-inherit"
            >
              Surapongchai et al., Nutrients (2021)
            </a>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}
