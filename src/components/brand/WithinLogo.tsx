import Image from "next/image"

import { cn } from "@/lib/utils"

/** Props for the WITHIN brand mark. */
interface WithinLogoProps {
  /** Which mark: the full wordmark or the angular "W". */
  kind?: "logotype" | "logomark"
  /** Ink color; `white` inverts the black PNG for dark surfaces. */
  color?: "black" | "white"
  /** Rendered height in px; width scales to the mark's aspect ratio. */
  height?: number
  /** Accessible label; pass "" when decorative alongside visible text. */
  alt?: string
  className?: string
  /** Eager-load above the fold. */
  priority?: boolean
}

/** Intrinsic aspect ratios (width / height) of the shipped PNGs — measured, see plan Task 4 Step 3. */
const SOURCES = {
  logotype: { src: "/brand/within-logotype.png", ratio: 5.54 },
  logomark: { src: "/brand/within-logomark.png", ratio: 1.68 },
} as const

/** The WITHIN logotype/logomark, drawn from the official assets. Never redraw the mark. */
export function WithinLogo({
  kind = "logotype",
  color = "black",
  height = 24,
  alt = "WITHIN",
  className,
  priority = false,
}: WithinLogoProps) {
  const { src, ratio } = SOURCES[kind]
  return (
    <Image
      src={src}
      alt={alt}
      height={height}
      width={Math.round(height * ratio)}
      priority={priority}
      className={cn(color === "white" && "invert", className)}
    />
  )
}
