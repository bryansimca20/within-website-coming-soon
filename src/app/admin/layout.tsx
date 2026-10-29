import type { Metadata } from "next";
import type { ReactNode } from "react";

/** The founder area: never indexed. */
export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div data-admin className="min-h-dvh bg-wi-paper-dim text-wi-ink-700">{children}</div>;
}
