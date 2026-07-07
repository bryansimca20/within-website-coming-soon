import { Compare } from "@/components/coming-soon/Compare";
import { Faq } from "@/components/coming-soon/Faq";
import { Footer } from "@/components/coming-soon/Footer";
import { Formula } from "@/components/coming-soon/Formula";
import { Header } from "@/components/coming-soon/Header";
import { Hero } from "@/components/coming-soon/Hero";
import { Marquee } from "@/components/coming-soon/Marquee";
import { Story } from "@/components/coming-soon/Story";
import { MotionProvider } from "@/components/coming-soon/MotionProvider";
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

/** WITHIN coming-soon landing page. */
export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MotionProvider>
        <div className="min-h-screen bg-wi-paper-dim">
          <Header />
          <main>
            <Hero />
            <Marquee />
            <WhyWithin />
            <Compare />
            <Formula />
            <Story />
            <Faq />
          </main>
          <Footer />
        </div>
      </MotionProvider>
    </>
  );
}
