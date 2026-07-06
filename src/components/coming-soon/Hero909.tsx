import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The WITHIN display voice: Bold-700, uppercase, tight tracking, near-solid leading. */
interface Hero909Props {
  children: ReactNode;
  /** Heading element to render (defaults to a non-semantic div, matching the source). */
  as?: "div" | "h1" | "h2" | "h3";
  /** Render on a dark surface (paper ink instead of strong ink). */
  dark?: boolean;
  /** Pass the font size (and any layout) as Tailwind classes, e.g. `text-[54px]`. */
  className?: string;
}

/** Oversized WITHIN headline. `wi-h9` lets the global stylesheet cap the size on phones. */
export function Hero909({ children, as: Tag = "div", dark, className }: Hero909Props) {
  return (
    <Tag
      className={cn(
        "wi-h9 m-0 font-bold uppercase tracking-[-0.03em] leading-[0.96] text-balance",
        dark ? "text-wi-paper" : "text-wi-black",
        className
      )}
    >
      {children}
    </Tag>
  );
}
