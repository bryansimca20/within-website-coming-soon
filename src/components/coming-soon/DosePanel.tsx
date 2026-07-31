import { CountUp } from "./CountUp";
import { MeasureGrid } from "./MeasureGrid";
import { Reveal } from "./Reveal";

/** symbol, name, dose (mg), one-line job — the three actives on the instrument panel. */
const DOSES: readonly [string, string, number, string][] = [
  ["Na", "Sodium", 1000, "Holds the water in"],
  ["K", "Potassium", 250, "Moves it into cells"],
  ["Mg", "Magnesium", 50, "Steadies muscle and nerve"],
];

/**
 * The one dark moment: a full-bleed instrument panel. The exact per-sachet doses
 * read out in large mono numerals against the dark measurement grid.
 */
export function DosePanel() {
  return (
    <section id="dose" className="relative overflow-hidden bg-wi-black text-wi-paper">
      <MeasureGrid dark fade="edges" />
      <div className="relative mx-auto w-full max-w-[1240px] px-5 py-20 md:px-7 md:py-28">
        <Reveal className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
          <h2 className="m-0 max-w-[16ch] text-[clamp(30px,4.4vw,54px)] font-medium leading-[1.0] tracking-[-0.035em] text-wi-paper text-balance">
            The dose, printed on the front.
          </h2>
          <p className="wi-readout m-0 text-[12px] uppercase tracking-[0.14em] text-wi-on-dark-3">
            Per sachet · in 500ml water
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 border-t border-wi-on-dark-line sm:grid-cols-3">
          {DOSES.map(([sym, name, dose, job]) => (
            <div
              key={sym}
              className="relative border-b border-wi-on-dark-line py-8 sm:border-b-0 sm:border-r sm:px-8 sm:py-6 sm:last:border-r-0 sm:first:pl-0"
            >
              <span className="absolute left-0 top-0 h-px w-10 bg-wi-electric-bright sm:left-8 sm:first:left-0" />
              <div className="flex items-baseline gap-2">
                <span className="wi-readout text-[13px] uppercase tracking-[0.14em] text-wi-electric-bright">
                  {sym}
                </span>
                <span className="text-[13px] uppercase tracking-[0.12em] text-wi-on-dark-3">{name}</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1.5">
                <CountUp
                  value={dose}
                  className="wi-readout text-[clamp(54px,7vw,88px)] font-semibold leading-[0.9] tracking-[-0.03em] text-wi-paper"
                />
                <span className="wi-readout text-[18px] font-semibold text-wi-on-dark-2">mg</span>
              </div>
              <p className="mt-3 mb-0 text-[14px] leading-[1.5] text-wi-on-dark-2">{job}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-wi-on-dark-line pt-6 wi-readout text-[11px] uppercase tracking-[0.14em] text-wi-on-dark-3">
          <span>Under 8 ingredients</span>
          <span>No added sugar</span>
          <span>Nothing artificial</span>
        </div>
      </div>
    </section>
  );
}
