/**
 * Closed answer sets for the request and check-in forms. The keys here are what the database
 * stores and the CSV exports; labels live in the copy files.
 */

/** Old request form (before 2026-10-22). Kept so stored rows still type-check and export. */
export const MAIN_SPORT = ["running", "cycling", "gym", "padel", "other"] as const;
export type MainSport = (typeof MAIN_SPORT)[number];

/** "How do you train?": pick all. */
export const TRAINING_TYPE = ["running", "hyrox", "gym", "cycling", "padel", "other"] as const;
export type TrainingType = (typeof TRAINING_TYPE)[number];

/** "How did you hear about us?": pick one. */
export const HEARD_FROM = ["friend", "founding_member", "instagram", "community", "other"] as const;
export type HeardFrom = (typeof HEARD_FROM)[number];

/** "Why do you want to try it?": pick all. */
export const WHY_REASON = [
  "sweat_heat",
  "cramps_fade",
  "current_drink",
  "no_sugar",
  "recommended",
  "local_brand",
  "other",
] as const;
export type WhyReason = (typeof WHY_REASON)[number];

/** "What do you hope it does for you?": pick all. Keys match the check-in's felt keys one to one. */
export const HOPE = ["more_energy", "less_cramping", "faster_recovery", "felt_hydrated", "other"] as const;
export type Hope = (typeof HOPE)[number];

export const SESSIONS_PER_WEEK = ["one_to_two", "three_to_four", "five_plus"] as const;
export type SessionsPerWeek = (typeof SESSIONS_PER_WEEK)[number];

export const SESSION_LENGTH = ["under_45", "from_45_to_90", "over_90"] as const;
export type SessionLength = (typeof SESSION_LENGTH)[number];

/** Old request form only. */
export const TRAIN_WHERE = ["outdoors", "mix", "indoors"] as const;
export type TrainWhere = (typeof TRAIN_WHERE)[number];

/** Old request form only. */
export const HYDRATION_GOAL = ["energy", "cramps", "recovery", "hydration", "other"] as const;
export type HydrationGoal = (typeof HYDRATION_GOAL)[number];

export const FEEDBACK_SESSION = ["long_run", "short_run", "gym", "padel", "other"] as const;
export type FeedbackSession = (typeof FEEDBACK_SESSION)[number];

export const FEEDBACK_FELT = [
  "more_energy",
  "less_cramping",
  "faster_recovery",
  "felt_hydrated",
  "no_difference",
  "other",
] as const;
export type FeedbackFelt = (typeof FEEDBACK_FELT)[number];

export const WOULD_REACH_AGAIN = ["yes_definitely", "probably", "not_sure", "not_for_me"] as const;
export type WouldReachAgain = (typeof WOULD_REACH_AGAIN)[number];

/** Taste is scored 1 to 5. */
export const TASTE_MIN = 1;
export const TASTE_MAX = 5;
