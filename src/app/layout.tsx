import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

/** Inter carries everything on the waitlist page; Geist stays for the cohort preview and the 404. */
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

/** Handwritten accent. Letters only: the cut has no digits or punctuation. */
const biroScript = localFont({
  src: "./fonts/BiroScriptPlus.otf",
  variable: "--font-biro-script",
  display: "swap",
});

const TITLE = "WITHIN | Coming soon";

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
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${inter.variable} ${biroScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
