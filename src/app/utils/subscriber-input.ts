/** Raw, untrusted signup values as they arrive from the form. */
export interface ISubscriberInput {
  email: string;
  instagramHandle: string;
}

/** A validated signup, or the first field that failed with a message for that field. */
export type ParsedSubscriber =
  | { ok: true; email: string; instagramHandle: string | null }
  | { ok: false; field: keyof ISubscriberInput; message: string };

/** Deliberately permissive: Shopify is the real authority on address validity. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Instagram's own rule: letters, digits, periods and underscores, 30 characters max. */
const HANDLE_PATTERN = /^[a-z0-9._]{1,30}$/;

/** Lowercased and trimmed address, or null when it cannot be an email. */
export function normalizeEmail(raw: string): string | null {
  const candidate = raw.trim().toLowerCase();

  return EMAIL_PATTERN.test(candidate) ? candidate : null;
}

/** Bare lowercased handle from a handle, an @handle, or a pasted profile URL. Null when unusable. */
export function normalizeInstagramHandle(raw: string): string | null {
  let candidate = raw.trim().toLowerCase();

  const urlMarker = candidate.indexOf("instagram.com/");
  if (urlMarker !== -1) {
    candidate = candidate.slice(urlMarker + "instagram.com/".length);
  }

  candidate = candidate.split(/[/?#]/)[0].replace(/^@/, "");

  return HANDLE_PATTERN.test(candidate) ? candidate : null;
}

/** Validates a whole submission. The handle is optional, but a supplied one must be valid. */
export function parseSubscriberInput(input: ISubscriberInput): ParsedSubscriber {
  const email = normalizeEmail(input.email);
  if (email === null) {
    return { ok: false, field: "email", message: "Enter a valid email address." };
  }

  if (input.instagramHandle.trim() === "") {
    return { ok: true, email, instagramHandle: null };
  }

  const instagramHandle = normalizeInstagramHandle(input.instagramHandle);
  if (instagramHandle === null) {
    return { ok: false, field: "instagramHandle", message: "Enter a valid Instagram handle." };
  }

  return { ok: true, email, instagramHandle };
}
