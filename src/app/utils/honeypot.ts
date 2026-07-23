/** Hidden field name. Plausible enough that naive form-fillers will populate it. */
export const HONEYPOT_TRAP_FIELD = "company";

/** Hidden field carrying the millisecond timestamp of when the form mounted. */
export const HONEYPOT_TIMESTAMP_FIELD = "renderedAt";

/**
 * Below this, the submission was almost certainly not typed by a person. Kept low (1s) because
 * the timer starts when the signup overlay opens: no human can open, fill, and submit under it,
 * but a fast autofill under the old 2s window could be dropped as a false positive.
 */
export const HONEYPOT_MIN_ELAPSED_MS = 1_000;

/** The hidden values a submission carries alongside the real fields. */
export interface IHoneypotFields {
  trap: string;
  renderedAt: string;
  now: number;
}

/** True when the submission looks automated and should be silently discarded. */
export function isHoneypotTripped({ trap, renderedAt, now }: IHoneypotFields): boolean {
  if (trap.trim() !== "") {
    return true;
  }

  const renderedAtMs = Number(renderedAt);
  if (renderedAt.trim() === "" || Number.isNaN(renderedAtMs)) {
    return true;
  }

  const elapsedMs = now - renderedAtMs;

  return elapsedMs < HONEYPOT_MIN_ELAPSED_MS;
}
