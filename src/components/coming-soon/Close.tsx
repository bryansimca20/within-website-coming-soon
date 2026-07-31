import { MeasureGrid } from "./MeasureGrid";
import { Reveal } from "./Reveal";
import { SignupForm } from "./SignupForm";

/** The closing waitlist moment: a real inline capture over the measurement grid. */
export function Close() {
  return (
    <section id="waitlist" className="relative overflow-hidden border-t border-wi-line bg-wi-paper-dim">
      <MeasureGrid fade="top" />
      <div className="relative mx-auto w-full max-w-[1240px] px-5 py-20 md:px-7 md:py-28">
        <Reveal className="max-w-[640px]">
          <h2 className="m-0 text-[clamp(34px,5vw,60px)] font-medium leading-[0.98] tracking-[-0.035em] text-wi-black text-balance">
            Be first when it goes live.
          </h2>
          <p className="mt-5 mb-0 max-w-[46ch] text-[17px] leading-[1.55] text-wi-ink-500">
            Join the waitlist for a 10% launch discount. One email the day WITHIN is available, and
            nothing else.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-9">
          <SignupForm tone="default" />
        </Reveal>
      </div>
    </section>
  );
}
