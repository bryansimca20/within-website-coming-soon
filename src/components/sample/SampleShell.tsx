import type { ReactNode } from "react";

import { WaitlistHeader } from "@/components/waitlist/WaitlistHeader";
import { cn } from "@/lib/utils";

interface SampleShellProps {
  children: ReactNode;
  /** Widens the column on desktop for the two-column sample intro. */
  isWide?: boolean;
}

/** The sample pages' frame: the waitlist header, then one centred, scrolling column. */
export function SampleShell({ children, isWide = false }: SampleShellProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-white px-4 pb-12 font-brand text-brand-ink desk:px-0">
      <WaitlistHeader />
      <div className={cn("mx-auto flex w-full flex-1 flex-col pt-8 desk:pt-14", isWide ? "max-w-[560px] desk:max-w-[1040px] desk:px-12" : "max-w-[560px]")}>
        {children}
      </div>
    </main>
  );
}
