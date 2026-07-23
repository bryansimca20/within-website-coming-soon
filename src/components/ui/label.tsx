"use client"

import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "flex items-center gap-2 font-bold uppercase leading-none tracking-[0.14em] select-none text-2xs group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      tone: {
        default: "text-wi-ink-500",
        inverse: "text-wi-on-dark-3",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

/** WITHIN-restyled field label: uppercase, bold, wide tracking. */
function Label({
  className,
  tone,
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return <label data-slot="label" className={cn(labelVariants({ tone, className }))} {...props} />
}

export { Label, labelVariants }
