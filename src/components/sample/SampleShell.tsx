import type { ReactNode } from "react";

import { WaitlistHeader } from "@/components/waitlist/WaitlistHeader";

interface SampleShellProps {
  children: ReactNode;
}

/** The sample pages' frame: the waitlist header, then one centred, scrolling column. */
export function SampleShell({ children }: SampleShellProps) {
  return (
    <main className="flex min-h-dvh flex-col bg-white px-4 pb-12 font-brand text-brand-ink desk:px-0">
      <WaitlistHeader />
      <div className="mx-auto flex w-full max-w-[560px] flex-1 flex-col pt-8 desk:pt-14">{children}</div>
    </main>
  );
}
