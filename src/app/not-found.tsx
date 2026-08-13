import Link from "next/link";

import { WithinLogo } from "@/components/brand/WithinLogo";
import { buttonVariants } from "@/components/ui/button";

/** On-brand 404 — the only reachable route besides the coming-soon placeholder. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-24 text-center">
      <WithinLogo kind="logotype" height={24} />
      <div className="flex flex-col items-center gap-4">
        <span className="wi-readout text-[11px] uppercase tracking-[0.14em] text-wi-ink-500">
          404
        </span>
        <h1 className="m-0 max-w-[14ch] text-[clamp(34px,5vw,48px)] font-medium leading-[1.02] tracking-[-0.03em] text-wi-black text-balance">
          Nothing here.
        </h1>
        <p className="max-w-[42ch] leading-normal text-wi-ink-700">
          The page you&apos;re after doesn&apos;t exist.
        </p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
        Back to start
      </Link>
    </main>
  );
}
