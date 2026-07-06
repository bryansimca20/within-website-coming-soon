import Link from "next/link";

import { WiEyebrow } from "@/components/brand/WiEyebrow";
import { WiHero } from "@/components/brand/WiHero";
import { WithinLogo } from "@/components/brand/WithinLogo";
import { buttonVariants } from "@/components/ui/button";

/** On-brand 404 — the only reachable route besides the coming-soon placeholder. */
export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-24 text-center">
      <WithinLogo kind="logotype" height={24} />
      <div className="flex flex-col items-center gap-4">
        <WiEyebrow>404</WiEyebrow>
        <WiHero as="h1" size="display-md" className="max-w-[14ch]">
          Nothing here.
        </WiHero>
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
