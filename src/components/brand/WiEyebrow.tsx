import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Props for the WITHIN micro-label voice. */
interface WiEyebrowProps {
  /** Element to render as. */
  as?: "span" | "p" | "div"
  className?: string
  children: ReactNode
}

/** Uppercase, tracked-out micro-label in the WITHIN voice. */
export function WiEyebrow({ as: Tag = "span", className, children }: WiEyebrowProps) {
  return (
    <Tag
      className={cn(
        "font-bold uppercase tracking-[0.14em] text-2xs text-muted-foreground",
        className
      )}
    >
      {children}
    </Tag>
  )
}
