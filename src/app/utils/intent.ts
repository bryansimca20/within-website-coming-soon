import type { WouldReachAgain } from "./sample-options";

/** Where personal follow-up goes first: the check-in's "would you reach for it again" answer. */
export enum IntentGroup {
  Hot = "hot",
  Warm = "warm",
  Cold = "cold",
}

/** "Yes, definitely" is hot, "Probably" is warm, anything else is cold. */
export function groupIntent(answer: WouldReachAgain): IntentGroup {
  if (answer === "yes_definitely") {
    return IntentGroup.Hot;
  }

  if (answer === "probably") {
    return IntentGroup.Warm;
  }

  return IntentGroup.Cold;
}
