import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const TITLE = "WITHIN - Coming soon";

/**
 * Impeccable direction contract (new-work section 5). Emitted as a real HTML
 * comment and kept as the first child of <body> so it survives the production
 * build and stays greppable (seed key: WITHIN-TRANSPARENCY-LAB).
 */
const DIRECTION_CONTRACT = `<!--
WITHIN-TRANSPARENCY-LAB
THESIS: WITHIN is a transparency instrument. The page dissects the product so the exact dose and every ingredient are provable, refusing the sugary sports-drink hero and the generic three-card supplement grid.
OWN-WORLD: paper-white clinical canvas, hairline measurement grid, one electric-blue signal on actives + data, Geist Sans display over Geist Mono readouts, crisp 2px edges, a single dark instrument panel for the dose; red only for the Indonesian flag.
STORY: the visitor meets a labelled specimen, learns why humid-heat training drains minerals, reads the exact doses on a dark instrument panel, compares against water and sports drinks, and joins the waitlist.
FIRST VIEWPORT: split. Left, the value-prop headline and the waitlist action over a faint measurement grid; right, the sachet framed as a specimen with hairline crosshairs and the three doses ticking up in mono.
FORM: transparency-lab / measurement-instrument. User-pinned direction, no concept roll.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
-->`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: "%s · WITHIN" },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "WITHIN",
    "electrolytes",
    "electrolyte sachet",
    "hydration",
    "recovery",
    "sodium",
    "potassium",
    "magnesium",
    "zero sugar",
    "sports supplement",
    "Indonesia",
    "made in Indonesia",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "health",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: DIRECTION_CONTRACT }} />
        {children}
      </body>
    </html>
  );
}
