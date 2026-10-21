import type { Variants } from "motion/react";

import { EASE } from "@/components/coming-soon/Reveal";

import type { SampleDirection } from "./use-sample-step-history";

/** Direction-aware slide: forward enters from the right, Back from the left. Exit is quicker than enter. */
export const SAMPLE_STEP_SLIDE: Variants = {
  enter: (direction: SampleDirection) => ({ opacity: 0, x: 12 * direction }),
  center: { opacity: 1, x: 0, transition: { duration: 0.24, ease: EASE } },
  exit: (direction: SampleDirection) => ({ opacity: 0, x: -12 * direction, transition: { duration: 0.14, ease: EASE } }),
};

/** Errors that appear inside a step fade up a few pixels instead of popping in. */
export const SAMPLE_ALERT_FADE =
  "[&_[role=alert]]:transition-[opacity,translate] [&_[role=alert]]:duration-200 [&_[role=alert]]:starting:translate-y-1 [&_[role=alert]]:starting:opacity-0 motion-reduce:[&_[role=alert]]:starting:translate-y-0";
