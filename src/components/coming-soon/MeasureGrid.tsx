import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/** How the grid fades out so it never fights the content. */
type Fade = "none" | "edges" | "bottom" | "top";

const MASK: Record<Fade, string | undefined> = {
  none: undefined,
  edges: "radial-gradient(120% 100% at 50% 0%, #000 40%, transparent 100%)",
  bottom: "linear-gradient(to bottom, #000 30%, transparent 100%)",
  top: "linear-gradient(to top, #000 30%, transparent 100%)",
};

interface MeasureGridProps {
  /** Grid tuned for dark instrument surfaces instead of the paper canvas. */
  dark?: boolean;
  /** Edge fade so the grid dissolves into the surface. */
  fade?: Fade;
  className?: string;
}

/**
 * The clinical measurement grid — a non-interactive background layer. Absolutely
 * positioned; drop it inside a `relative` section as the first child.
 */
export function MeasureGrid({ dark = false, fade = "edges", className }: MeasureGridProps) {
  const mask = MASK[fade];
  const style: CSSProperties | undefined = mask
    ? { WebkitMaskImage: mask, maskImage: mask }
    : undefined;
  return (
    <div
      aria-hidden
      style={style}
      className={cn("pointer-events-none absolute inset-0", dark ? "wi-grid-dark" : "wi-grid", className)}
    />
  );
}
