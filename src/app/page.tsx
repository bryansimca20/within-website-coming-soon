import { Close } from "@/components/coming-soon/Close";
import { Compare } from "@/components/coming-soon/Compare";
import { Dissection } from "@/components/coming-soon/Dissection";
import { DosePanel } from "@/components/coming-soon/DosePanel";
import { Faq } from "@/components/coming-soon/Faq";
import { Footer } from "@/components/coming-soon/Footer";
import { Hero } from "@/components/coming-soon/Hero";
import { Ledger } from "@/components/coming-soon/Ledger";
import { MotionProvider } from "@/components/coming-soon/MotionProvider";
import { Nav } from "@/components/coming-soon/Nav";
import { WhyWithin } from "@/components/coming-soon/WhyWithin";
import { FAQS } from "@/components/coming-soon/utils/faqs";
import { INSTAGRAM_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

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

/** WITHIN coming-soon landing page — Transparency Lab. */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MotionProvider>
        <div className="bg-wi-paper">
          <Nav />
          <main>
            <Hero />
            <Dissection />
            <WhyWithin />
            <DosePanel />
            <Compare />
            <Ledger />
            <Faq />
            <Close />
          </main>
          <Footer />
        </div>
      </MotionProvider>
    </>
  );
}
