import Image from "next/image";

import { Reveal, RevealGroup, RevealItem } from "./Reveal";
import { Section } from "./Section";

/** name, class, role, symbol, amount, unit, image — every ingredient as a ledger line. */
interface Line {
  name: string;
  cls: string;
  role: string;
  sym?: string;
  amount?: number;
  unit?: string;
  img: string;
}

const LINES: readonly Line[] = [
  { name: "Sodium chloride", cls: "Mineral salt", role: "Holds water in the body instead of letting it run straight through.", sym: "Na", amount: 1000, unit: "mg", img: "/coming-soon/mineral-sodium.webp" },
  { name: "Potassium chloride", cls: "Mineral salt", role: "Pulls water into your cells and keeps muscles steady.", sym: "K", amount: 250, unit: "mg", img: "/coming-soon/mineral-potassium.avif" },
  { name: "Magnesium carbonate", cls: "Mineral salt", role: "Backs energy production and helps muscles settle after a session.", sym: "Mg", amount: 50, unit: "mg", img: "/coming-soon/mineral-magnesium.webp" },
  { name: "Natural flavoring", cls: "Real fruit", role: "Flavor from real fruit. Nothing synthetic.", img: "/coming-soon/flavoring-orange.avif" },
  { name: "Natural sweetener", cls: "Stevia leaf", role: "A clean sweetness with no sugar and no calories.", img: "/coming-soon/sweetener-stevia.jpg" },
];

/** What is deliberately absent. */
const EXCLUDED: readonly string[] = [
  "Artificial colors",
  "Artificial flavors",
  "Artificial sweeteners",
  "Added sugar",
];

/** The amount cell: a mono readout for the dosed actives, a quiet "Trace" otherwise. */
function Amount({ sym, amount, unit }: { sym?: string; amount?: number; unit?: string }) {
  if (amount === undefined) {
    return <span className="text-[13px] text-wi-ink-300">Trace</span>;
  }
  return (
    <span className="flex items-baseline gap-1.5 md:justify-end">
      <span className="wi-readout text-[11px] uppercase tracking-[0.12em] text-wi-electric">{sym}</span>
      <span className="wi-readout text-[22px] font-semibold text-wi-black">{amount.toLocaleString("en-US")}</span>
      <span className="wi-readout text-[12px] text-wi-ink-500">{unit}</span>
    </span>
  );
}

/** The formula laid open: an ingredient ledger over an exclusions ledger. */
export function Ledger() {
  return (
    <Section surface="paper" borderTop>
      <div id="ledger">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <h2 className="m-0 max-w-[16ch] text-[clamp(30px,4vw,52px)] font-medium leading-[1.0] tracking-[-0.035em] text-wi-black text-balance">
            Under 8 ingredients. Every one named.
          </h2>
          <p className="mb-0 max-w-[38ch] text-[15px] leading-[1.55] text-wi-ink-500">
            Mineral salts for the actives, real fruit for flavor, stevia leaf for sweetness. Nothing
            you need a chemistry degree to read.
          </p>
        </Reveal>

        {/* Ingredient ledger */}
        <RevealGroup className="mt-12 border-t-2 border-wi-black">
          {LINES.map((line) => (
            <RevealItem
              key={line.name}
              className="flex flex-col gap-3 border-b border-wi-line py-5 md:grid md:grid-cols-[56px_1.3fr_1.7fr_auto] md:items-center md:gap-6"
            >
              <div className="relative size-14 shrink-0 overflow-hidden rounded-[var(--wi-radius-control)] border border-wi-line bg-wi-paper-dim grayscale">
                <Image src={line.img} alt="" fill sizes="56px" draggable={false} className="object-cover" />
              </div>
              <div>
                <div className="text-[16px] font-medium tracking-[-0.01em] text-wi-black">{line.name}</div>
                <div className="mt-0.5 text-[12px] uppercase tracking-[0.08em] text-wi-ink-300">{line.cls}</div>
              </div>
              <p className="m-0 max-w-[46ch] text-[14.5px] leading-[1.5] text-wi-ink-500">{line.role}</p>
              <div className="md:text-right">
                <Amount sym={line.sym} amount={line.amount} unit={line.unit} />
              </div>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Exclusions ledger */}
        <div className="mt-12">
          <p className="m-0 mb-5 text-[12px] font-semibold uppercase tracking-[0.1em] text-wi-ink-500">
            What is not in it
          </p>
          <ul className="m-0 grid list-none grid-cols-1 gap-x-12 gap-y-0 p-0 sm:grid-cols-2 sm:gap-x-16">
            {EXCLUDED.map((item) => (
              <li key={item} className="flex items-baseline justify-between gap-4 border-b border-wi-line py-4">
                <span className="text-[16px] font-medium text-wi-black">{item}</span>
                <span className="wi-readout text-[12px] uppercase tracking-[0.14em] text-wi-electric">None</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
