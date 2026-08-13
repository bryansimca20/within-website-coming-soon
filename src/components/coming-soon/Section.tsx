import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Every page-rhythm number lives in this file. No other component in `coming-soon/`
 * writes a max-width, a horizontal gutter, or a section-level vertical padding.
 */
const GUTTER = "mx-auto w-full max-w-[1200px] px-5 md:px-7";

/** Vertical rhythm: tighter on phones, roomier from `md` up. */
const SIZE = {
  default: "py-14 md:pt-14 md:pb-[88px]",
  snug: "py-10 md:py-14",
} as const;

/** The three page surfaces. Black carries its own foreground so callers never restate it. */
const SURFACE = {
  paper: "bg-wi-paper",
  paperDim: "bg-wi-paper-dim",
  black: "bg-wi-black text-wi-paper",
} as const;

type SectionSize = keyof typeof SIZE;
type SectionSurface = keyof typeof SURFACE;

interface SectionContainerProps extends ComponentProps<"div"> {
  /** Vertical rhythm step; `snug` for bands that sit tight against their neighbours. */
  size?: SectionSize;
  /** Drop the vertical padding entirely — for containers that only need the gutter. */
  flush?: boolean;
}

/**
 * The centred, guttered content column. Used directly by sections whose outer element is
 * irregular (sticky header, `<footer>`, a section holding several stacked containers).
 */
export function SectionContainer({
  children,
  size = "default",
  flush = false,
  className,
  ...rest
}: SectionContainerProps) {
  return (
    <div className={cn(GUTTER, !flush && SIZE[size], className)} {...rest}>
      {children}
    </div>
  );
}

interface SectionProps {
  children: ReactNode;
  /** Page surface; `black` also sets the paper foreground. */
  surface?: SectionSurface;
  size?: SectionSize;
  /** Hairline rule above the section. */
  borderTop?: boolean;
  /** Hairline rule below the section. */
  borderBottom?: boolean;
  /** Fill the small viewport height — `svh`, so mobile browser chrome cannot overrun it. */
  fullHeight?: boolean;
  /** Classes for the `<section>` itself. Container classes go on `containerClassName`. */
  className?: string;
  /** Classes for the inner content column. */
  containerClassName?: string;
}

/** A page section: surface and rules outside, one guttered content column inside. */
export function Section({
  children,
  surface = "paper",
  size = "default",
  borderTop = false,
  borderBottom = false,
  fullHeight = false,
  className,
  containerClassName,
}: SectionProps) {
  const onDark = surface === "black";
  return (
    <section
      className={cn(
        SURFACE[surface],
        borderTop && (onDark ? "border-t border-wi-on-dark-line" : "border-t border-wi-line"),
        borderBottom && (onDark ? "border-b border-wi-on-dark-line" : "border-b border-wi-line"),
        fullHeight && "flex min-h-svh flex-col justify-center",
        className
      )}
    >
      <SectionContainer size={size} className={containerClassName}>
        {children}
      </SectionContainer>
    </section>
  );
}
