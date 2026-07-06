import { WiEyebrow } from "@/components/brand/WiEyebrow";
import { WiHero } from "@/components/brand/WiHero";
import { WithinLogo } from "@/components/brand/WithinLogo";

/** Coming-soon placeholder — foundation smoke test, not the final design. */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-24 text-center">
      <WithinLogo kind="logotype" height={28} priority />
      <div className="flex flex-col items-center gap-4">
        <WiEyebrow>Essential recovery nutrients</WiEyebrow>
        <WiHero as="h1" size="display-lg" className="max-w-[16ch]">
          Everything you need. Nothing you don&apos;t.
        </WiHero>
        <p className="max-w-[46ch] leading-normal text-wi-ink-700">
          A new electrolyte, made in Indonesia. Coming soon.
        </p>
      </div>
    </main>
  );
}
