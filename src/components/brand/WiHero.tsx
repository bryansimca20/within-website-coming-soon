import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Display steps available to the hero voice, mapped to the WITHIN type scale. */
type WiHeroSize = "h1" | "display-md" | "display-lg" | "display-xl" | "display-2xl"

/** Props for the WITHIN hero voice. */
interface WiHeroProps {
  /** Heading element to render. */
  as?: "h1" | "h2" | "h3" | "p"
  /** Type-scale step. */
  size?: WiHeroSize
  className?: string
  children: ReactNode
}

const SIZE_CLASS: Record<WiHeroSize, string> = {
  h1: "text-h1",
  "display-md": "text-display-md",
  "display-lg": "text-display-lg",
  "display-xl": "text-display-xl",
  "display-2xl": "text-display-2xl",
}

/** Bold-700, uppercase, tightly-tracked hero headline in the WITHIN voice. */
export function WiHero({
  as: Tag = "h1",
  size = "display-lg",
  className,
  children,
}: WiHeroProps) {
  return (
    <Tag
      className={cn(
        "font-bold uppercase tracking-[-0.03em] leading-[0.98] text-wi-black",
        SIZE_CLASS[size],
        className
      )}
    >
      {children}
    </Tag>
  )
}
