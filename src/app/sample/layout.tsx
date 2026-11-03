import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/coming-soon/MotionProvider";

/** Sample pages are reached by link only: out of search results and the sitemap. */
export const metadata: Metadata = {
  title: "Samples",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function SampleLayout({ children }: { children: ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
