import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Uppercase tracked micro-label in the WITHIN voice; `dark` tints it for black surfaces. */
interface EyebrowProps {
  children: ReactNode;
  /** Render on a dark surface (white-at-opacity ink instead of muted ink). */
  dark?: boolean;
  className?: string;
}

/** The Coming Soon eyebrow label (12px, bold, uppercase, 0.14em tracking). */
export function Eyebrow({ children, dark, className }: EyebrowProps) {
  return (
    <div
      className={cn(
        "text-xs font-bold uppercase tracking-[0.14em]",
        dark ? "text-wi-on-dark-2" : "text-wi-ink-500",
        className
      )}
    >
      {children}
    </div>
  );
}
