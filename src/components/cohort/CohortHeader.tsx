import Link from "next/link";

import { WithinLogo } from "@/components/brand/WithinLogo";

/**
 * A deliberately thin bar for the cohort page. It carries no waitlist action: this page is a
 * story preview, and the signup Server Action is only BotID-protected on `/`.
 */
export function CohortHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-wi-on-dark-line bg-wi-black/85 backdrop-blur-md">
      <div className="mx-auto flex h-[var(--wi-nav-h)] w-full max-w-[1240px] items-center px-5 md:px-7">
        <Link href="/" className="inline-flex items-center">
          <WithinLogo kind="logotype" color="white" height={15} priority />
        </Link>
      </div>
    </header>
  );
}
