"use client";

import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";

/** How the unwritten story is drawn. Three renderings of one reserved space. */
type StoryBlankVariant = "ruled" | "manuscript" | "caret";

/** Surface the blank sits on. `dark` flips its hairlines to the on-dark line token. */
type StoryBlankTone = "paper" | "dark";

/** Ruled-line widths as utility classes, so nothing is computed into a style attribute. */
const RULE_WIDTHS = ["w-full", "w-[96%]", "w-[99%]", "w-[91%]", "w-[97%]", "w-[93%]"];

/** The short closing line. It is what makes the block read as unwritten prose, not a table. */
const LAST_RULE_WIDTH = "w-[58%]";

interface StoryBlankProps {
  variant?: StoryBlankVariant;
  tone?: StoryBlankTone;
  /** How many ruled lines to draw. The `caret` variant ignores it. */
  lines?: number;
  className?: string;
}

/**
 * The space a founding member's story will occupy, drawn as a deliberately empty field
 * rather than left as absence. Shared by all three cohort layouts so the blank reads as
 * one system element.
 */
export function StoryBlank({
  variant = "ruled",
  tone = "paper",
  lines = 4,
  className,
}: StoryBlankProps) {
  const reduceMotion = useReducedMotion();
  const onDark = tone === "dark";
  const ruleColor = onDark ? "bg-wi-on-dark-line" : "bg-wi-line-strong";
  const labelColor = onDark ? "text-wi-on-dark-2" : "text-wi-ink-500";

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "flex items-baseline justify-between gap-3 border-t pt-3",
          onDark ? "border-wi-on-dark-line" : "border-wi-line-strong"
        )}
      >
        <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em]", labelColor)}>
          Story
        </span>
        <span className={cn("font-mono text-[10.5px] uppercase tracking-[0.14em]", labelColor)}>
          To be written
        </span>
      </div>

      {variant === "caret" ? (
        <div className="mt-7 flex min-h-[112px] items-start">
          <motion.span
            aria-hidden
            className={cn("block h-[30px] w-[10px]", onDark ? "bg-wi-on-dark-1" : "bg-wi-signal")}
            animate={reduceMotion ? undefined : { opacity: [1, 1, 0, 0] }}
            transition={
              reduceMotion
                ? undefined
                : { duration: 1.06, times: [0, 0.5, 0.5, 1], ease: "linear", repeat: Infinity }
            }
          />
        </div>
      ) : (
        <div className={cn("flex flex-col", variant === "manuscript" ? "mt-7" : "mt-5")}>
          {variant === "manuscript" && (
            <span
              aria-hidden
              className={cn(
                "mb-8 block h-[2px] w-[62%]",
                onDark ? "bg-wi-on-dark-1" : "bg-wi-black"
              )}
            />
          )}
          <div
            className={cn("flex flex-col", variant === "manuscript" ? "gap-[19px]" : "gap-[13px]")}
          >
            {Array.from({ length: lines }, (_, i) => (
              <span
                key={i}
                aria-hidden
                className={cn(
                  "block h-px",
                  ruleColor,
                  i === lines - 1 ? LAST_RULE_WIDTH : RULE_WIDTHS[i % RULE_WIDTHS.length]
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
