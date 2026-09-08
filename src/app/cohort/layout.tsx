import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MotionProvider } from "@/components/coming-soon/MotionProvider";

/**
 * The cohort prototypes are an internal preview for the kickoff dinner: kept out of search
 * results, out of the sitemap, and unlinked from the coming-soon page.
 */
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
};

export default function CohortLayout({ children }: { children: ReactNode }) {
  return <MotionProvider>{children}</MotionProvider>;
}
