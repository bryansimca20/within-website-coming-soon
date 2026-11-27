import { AnimatePresence, motion } from "motion/react";

import { WaitlistArrowGlyph } from "@/components/waitlist/svg/WaitlistGlyphs";
import { cn } from "@/lib/utils";

interface SampleSubmitButtonProps {
  label: string;
  disabled: boolean;
  /** The pay step: orange, where every other step is ink. */
  isLast: boolean;
}

/** The request form's full-width button. Its label cross-fades as it changes. */
export function SampleSubmitButton({ label, disabled, isLast }: SampleSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "flex h-14 w-full cursor-pointer items-center justify-between px-5 text-base font-semibold transition-transform duration-150 ease-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink active:scale-[0.97] disabled:cursor-default disabled:opacity-60 motion-reduce:transition-none",
        isLast ? "bg-flavor-orange text-brand-ink" : "bg-brand-ink text-brand-mist"
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={label}
          initial={{ opacity: 0, filter: "blur(2px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(2px)" }}
          transition={{ duration: 0.1 }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
      <WaitlistArrowGlyph />
    </button>
  );
}
