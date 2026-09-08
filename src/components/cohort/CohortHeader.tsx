import Link from "next/link";

import { WithinLogo } from "@/components/brand/WithinLogo";
import { cn } from "@/lib/utils";

interface CohortHeaderProps {
  /** Surface the bar sits on. `dark` inverts it for the stage layout. */
  tone?: "paper" | "dark";
  /** Which prototype is on screen. Useful when switching variants live. */
  label: string;
}

/**
 * A deliberately thin bar for the cohort prototypes. It carries no waitlist action: these
 * pages are a story preview, and the signup Server Action is only BotID-protected on `/`.
 */
export function CohortHeader({ tone = "paper", label }: CohortHeaderProps) {
  const onDark = tone === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-md",
        onDark ? "border-wi-on-dark-line bg-wi-black/85" : "border-wi-line bg-wi-paper/85"
      )}
    >
      <div className="mx-auto flex h-[var(--wi-nav-h)] w-full max-w-[1240px] items-center gap-4 px-5 md:px-7">
        <Link href="/cohort" className="inline-flex items-center">
          <WithinLogo
            kind="logotype"
            color={onDark ? "white" : "black"}
            height={15}
            alt="WITHIN cohort prototypes"
            priority
          />
        </Link>
        <span
          className={cn(
            "wi-readout text-[11px] uppercase tracking-[0.12em]",
            onDark ? "text-wi-on-dark-2" : "text-wi-ink-500"
          )}
        >
          {label}
        </span>
      </div>
    </header>
  );
}
