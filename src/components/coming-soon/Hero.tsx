import { DisplayHeading } from "./DisplayHeading";

/** Hero content; the headline is editorially set and defaults to the launch line. */
interface HeroProps {
  headline?: string;
}

/** Full-bleed grayscale hero photo with a quiet, bottom-aligned lockup. */
export function Hero({ headline = "Redefining Your Hydration Routine. Soon" }: HeroProps) {
  return (
    <section className="relative bg-wi-black text-wi-paper overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url(/coming-soon/hero-race.avif)] bg-cover bg-center grayscale"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-b from-black/[0.38] via-black/[0.30] to-black/[0.72]"
      />
      <div className="relative max-w-[1200px] mx-auto pt-16 px-7 pb-[88px] min-h-[calc(100vh-66px)] box-border flex items-end">
        <div className="max-w-[640px]">
          <DisplayHeading as="h1" dark className="text-[clamp(38px,4.8vw,62px)]">
            {headline}
          </DisplayHeading>
          <p className="mt-[18px] mb-0 max-w-[420px] text-wi-on-dark-2 text-[17px] leading-[1.55]">
            Essential recovery nutrients in a single-serve sachet. No additives. Launching
            soon, made in Indonesia.
          </p>
        </div>
      </div>
    </section>
  );
}
