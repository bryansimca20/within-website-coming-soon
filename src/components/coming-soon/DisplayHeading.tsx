import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The WITHIN display voice: Bold-700, uppercase, tight tracking, near-solid leading. */
interface DisplayHeadingProps {
  children: ReactNode;
  /** Element to render — h1 for the hero, h2 for section titles, div where decorative. */
  as?: "div" | "h1" | "h2" | "h3";
  /** Render on a dark surface (paper ink instead of strong ink). */
  dark?: boolean;
  /** Pass the font size (and any layout) as Tailwind classes, e.g. `text-[54px]`. */
  className?: string;
}

/** Oversized WITHIN display heading. `wi-display` lets the stylesheet cap the size on phones. */
export function DisplayHeading({ children, as: Tag = "div", dark, className }: DisplayHeadingProps) {
  return (
    <Tag
      className={cn(
        "wi-display m-0 font-bold uppercase tracking-[-0.03em] text-balance",
        dark ? "text-wi-paper" : "text-wi-black",
        className,
        // Must come after any caller `text-[size]`: tailwind-merge treats an arbitrary
        // font-size as carrying line-height, so an earlier `leading-*` gets dropped.
        "leading-[0.96]"
      )}
    >
      {children}
    </Tag>
  );
}
