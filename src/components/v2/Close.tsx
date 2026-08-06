import Image from "next/image";

import { Reveal } from "./Reveal";
import { SignupForm } from "./SignupForm";

/** The closing waitlist over a cinematic training frame — the emotional finish. */
export function Close() {
  return (
    <section id="waitlist" className="relative overflow-hidden bg-wi-black">
      <Image
        src="/coming-soon/cycling-gobik.jpeg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      {/* Scrims: keep the form column dark enough for the inverse fields, let the frame show upper-right. */}
      <div aria-hidden className="absolute inset-0 bg-linear-to-r from-wi-black via-wi-black/85 to-wi-black/45" />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-wi-black/70 to-transparent" />
      <div className="relative mx-auto w-full max-w-[1200px] px-5 py-24 md:px-7 md:py-32">
        <Reveal className="max-w-[640px]">
          <h2 className="m-0 text-[clamp(40px,6vw,74px)] font-medium leading-[0.96] tracking-[-0.04em] text-wi-paper text-balance">
            Be first when it goes live.
          </h2>
          <p className="mt-5 mb-0 max-w-[46ch] text-[17px] leading-[1.55] text-wi-on-dark-2">
            Join the waitlist for a 10% launch discount. One email the day WITHIN is available, and
            nothing else.
          </p>
        </Reveal>
        <Reveal delay={120} className="mt-9">
          <SignupForm tone="inverse" />
        </Reveal>
      </div>
    </section>
  );
}
