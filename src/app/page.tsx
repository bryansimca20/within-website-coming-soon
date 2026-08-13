import { Close } from "@/components/coming-soon/Close";
import { Compare } from "@/components/coming-soon/Compare";
import { Dissection } from "@/components/coming-soon/Dissection";
import { Faq } from "@/components/coming-soon/Faq";
import { Footer } from "@/components/coming-soon/Footer";
import { Hero } from "@/components/coming-soon/Hero";
import { Ledger } from "@/components/coming-soon/Ledger";
import { MotionProvider } from "@/components/coming-soon/MotionProvider";
import { Nav } from "@/components/coming-soon/Nav";
import { TheIdea } from "@/components/coming-soon/TheIdea";
import { WhyWithin } from "@/components/coming-soon/WhyWithin";
import { FAQS } from "@/components/coming-soon/utils/faqs";
import { INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/**
 * Impeccable direction contract (new-work section 5). Emitted as a real HTML comment inside
 * the tree so it survives the production build and stays greppable.
 */
const DIRECTION_CONTRACT = `<!--
WITHIN-TRANSPARENCY-LAB
THESIS: WITHIN is a transparency instrument. The page dissects the product so the exact dose and every ingredient are provable, refusing the sugary sports-drink hero and the generic three-card supplement grid.
OWN-WORLD: paper-white clinical canvas, one true-black signal on actives + data over greyed resting states, Geist Sans display over Geist Mono readouts, crisp 2px edges; red only for the Indonesian flag.
STORY: the visitor meets a labelled specimen, learns why humid-heat training drains minerals, reads the exact doses, compares against water and sports drinks, and joins the waitlist.
FIRST VIEWPORT: split. Left, the value-prop headline and the waitlist action over a track band; right, the double sachet lifting off paper.
FORM: transparency-lab / measurement-instrument. User-pinned direction, no concept roll.
-->`;

/** Organization + WebSite + FAQ structured data for search engines. */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      logo: `${SITE_URL}/brand/within-logotype.png`,
      sameAs: [INSTAGRAM_URL],
      areaServed: "ID",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: FAQS.map(([question, answer]) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

/** WITHIN coming-soon landing page, the Transparency Lab design. */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="bg-wi-paper">
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
    </>
  );
}
