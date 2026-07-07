"use client";

import { useEffect, useRef, useState } from "react";

import { Eyebrow } from "./Eyebrow";
import { DisplayHeading } from "./DisplayHeading";

const REASONS: [string, string, string][] = [
  ["01", "Not just water", "Water puts the fluid back. Not the minerals it left with."],
  ["02", "The right minerals", "Sodium holds it. Potassium moves it. Magnesium fires the muscle."],
  ["03", "Dosed to your loss", "1000mg sodium, not a trace. Nothing you don't need."],
];

/** name, low value, high value, low label, high label, axis max (mg) — sweat loss per hour. */
const STATS: [string, number, number, string, string, number][] = [
  ["Sodium", 900, 1250, "900", "1,250", 1600],
  ["Potassium", 125, 200, "125", "200", 400],
];

/**
 * Reveals bars on scroll-in for motion-OK users. Defaults to revealed, so SSR,
 * no-JS, and reduced-motion all render the bars at full width with no animation.
 */
function useInView() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    const prefersMotion = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    if (!prefersMotion || !el || !("IntersectionObserver" in window)) return;
    // Prime to hidden (off-screen, so no visible flash), then grow on scroll-in.
    const primer = window.setTimeout(() => setInView(false), 0);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => {
      window.clearTimeout(primer);
      observer.disconnect();
    };
  }, []);
  return { ref, inView };
}

/** A horizontal range band (min–max) plotted against a per-stat mg scale. */
function RangeBar({
  min,
  max,
  scale,
  inView,
  delay = 0,
}: {
  min: number;
  max: number;
  scale: number;
  inView: boolean;
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
        <div
          style={{ left: `${left}%`, width: inView ? `${width}%` : "0%", transition: `width 800ms var(--ease-out, ease-out) ${delay}ms` }}
          className="absolute top-[2px] bottom-[2px] bg-wi-black rounded-[2px]"
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

/** "Why WITHIN" — the heat/humidity case, three reasons beside animated loss bars. */
export function WhyWithin() {
  const { ref, inView } = useInView();
  return (
    <section className="bg-wi-paper border-t border-wi-line">
      <div className="max-w-[1200px] mx-auto pt-24 px-7 pb-[88px] min-h-screen box-border flex flex-col justify-center">
        <div>
          <Eyebrow>Why WITHIN</Eyebrow>
          <DisplayHeading as="h2" className="mt-3 max-w-[560px] text-[56px]">
            Built for the heat and humidity.
          </DisplayHeading>
          <p className="max-w-[820px] text-base leading-[1.6] text-wi-ink-500 mt-[22px]">
            In Indonesia&apos;s heat and humidity, sweat can&apos;t evaporate efficiently, so your
            body produces more of it to stay cool. Every drop carries electrolytes out with it,
            mostly sodium and potassium. It&apos;s not that tropical sweat is saltier. You simply
            lose a lot more of it.
          </p>
        </div>
        <div
          className="wi-science mt-14 grid grid-cols-2 gap-16 border-t-2 border-wi-black items-start"
        >
          <div>
            {REASONS.map(([n, title, body]) => (
              <div key={n} className="py-[26px] border-b border-wi-line">
                <div className="flex gap-4 items-baseline">
                  <span className="text-[13px] font-bold tracking-[0.1em] text-wi-ink-300">
                    {n}
                  </span>
                  <span className="font-bold text-[22px] tracking-[-0.015em] uppercase text-wi-black">
                    {title}
                  </span>
                </div>
                <p className="mt-[10px] mb-0 text-[15px] leading-[1.6] text-wi-ink-500">
                  {body}
                </p>
              </div>
            ))}
          </div>
          <div ref={ref} className="pt-[26px]">
            <Eyebrow className="mb-[26px]">Lost per hour of training</Eyebrow>
            {STATS.map(([name, min, max, lo, hi, scale], i) => (
              <div key={name} className="mb-[30px]">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[13px] font-bold tracking-[0.12em] uppercase text-wi-black">
                    {name}
                  </span>
                  <span className="whitespace-nowrap">
                    <span className="font-bold text-[32px] tracking-[-0.03em] text-wi-black">
                      {lo}
                    </span>
                    <span className="font-bold text-[15px] text-wi-ink-300 mx-[6px]">
                      to
                    </span>
                    <span className="font-bold text-[32px] tracking-[-0.03em] text-wi-black">
                      {hi}
                    </span>
                    <span className="font-bold text-sm text-wi-ink-500 ml-[5px]">
                      mg
                    </span>
                  </span>
                </div>
                <RangeBar min={min} max={max} scale={scale} inView={inView} delay={i * 160} />
              </div>
            ))}
            <p className="mt-[22px] mb-0 text-[11.5px] leading-[1.55] text-wi-ink-300 max-w-[420px]">
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
      </div>
    </section>
  );
}
