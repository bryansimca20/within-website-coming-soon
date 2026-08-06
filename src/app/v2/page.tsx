import type { Metadata, Viewport } from "next";

import { Close } from "@/components/v2/Close";
import { Compare } from "@/components/v2/Compare";
import { Dissection } from "@/components/v2/Dissection";
import { Faq } from "@/components/v2/Faq";
import { Footer } from "@/components/v2/Footer";
import { Hero } from "@/components/v2/Hero";
import { Ledger } from "@/components/v2/Ledger";
import { MotionProvider } from "@/components/v2/MotionProvider";
import { Nav } from "@/components/v2/Nav";
import { TheIdea } from "@/components/v2/TheIdea";
import { WhyWithin } from "@/components/v2/WhyWithin";

/**
 * Impeccable direction contract (new-work section 5). Emitted as a real HTML comment inside
 * the v2 tree so it survives the production build and stays greppable.
 */
const DIRECTION_CONTRACT = `<!--
WITHIN-TRANSPARENCY-LAB
THESIS: WITHIN is a transparency instrument. The page dissects the product so the exact dose and every ingredient are provable, refusing the sugary sports-drink hero and the generic three-card supplement grid.
OWN-WORLD: paper-white clinical canvas, one electric-blue signal on actives + data, Geist Sans display over Geist Mono readouts, crisp 2px edges; red only for the Indonesian flag.
STORY: the visitor meets a labelled specimen, learns why humid-heat training drains minerals, reads the exact doses, compares against water and sports drinks, and joins the waitlist.
FIRST VIEWPORT: split. Left, the value-prop headline and the waitlist action over a track band; right, the double sachet lifting off paper.
FORM: transparency-lab / measurement-instrument. User-pinned direction, no concept roll.
-->`;

/**
 * Kept out of search while `/` is still the published page — two indexed copies of the same
 * coming-soon content would compete with each other.
 */
export const metadata: Metadata = {
  alternates: { canonical: "/v2" },
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

/** Paper-white world, against the root layout's near-black theme color. */
export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

/**
 * WITHIN coming-soon, v2 — the Transparency Lab rebuild. `theme-v2` scopes the whole
 * design system (palette, Geist type, 2px radii) to this tree so `/` keeps its own.
 */
export default function V2Page() {
  return (
    <div className="theme-v2 bg-wi-paper">
      <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
      <MotionProvider>
        <Nav />
        <main>
          <Hero />
          <Dissection />
          <WhyWithin />
          <TheIdea />
          <Compare />
          <Ledger />
          <Faq />
          <Close />
        </main>
        <Footer />
      </MotionProvider>
    </div>
  );
}
