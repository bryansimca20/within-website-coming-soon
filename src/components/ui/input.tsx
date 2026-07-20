import { Input as InputPrimitive } from "@base-ui/react/input"
import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-[var(--wi-radius-control)] border bg-transparent text-base leading-none outline-none transition-[border-color,background-color,box-shadow] duration-[120ms] ease-[cubic-bezier(0.2,0,0,1)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
  {
    variants: {
      tone: {
        default:
          "border-wi-line bg-wi-paper text-wi-black placeholder:text-wi-ink-300 focus-visible:border-wi-black focus-visible:ring-[3px] focus-visible:ring-black/15 aria-invalid:border-[1.5px] aria-invalid:border-wi-black",
        inverse:
          "border-wi-on-dark-line bg-wi-on-dark-fill text-wi-paper placeholder:text-wi-on-dark-3 focus-visible:border-wi-paper focus-visible:ring-[3px] focus-visible:ring-white/20 aria-invalid:border-[1.5px] aria-invalid:border-wi-paper",
      },
      size: {
        default: "h-11 px-[14px]",
        lg: "h-[54px] px-[18px]",
      },
    },
    defaultVariants: {
      tone: "default",
      size: "default",
    },
  }
)

/** WITHIN-restyled text input. `tone="inverse"` for use on black panels. */
function Input({
  className,
  type,
  tone,
  size,
  ...props
}: Omit<React.ComponentProps<"input">, "size"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(inputVariants({ tone, size, className }))}
      {...props}
    />
  )
}

export { Input, inputVariants }
