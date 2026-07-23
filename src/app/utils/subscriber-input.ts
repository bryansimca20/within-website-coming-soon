/** Raw, untrusted signup values as they arrive from the form. */
export interface ISubscriberInput {
  fullName: string;
  email: string;
  instagramHandle: string;
}

/** A validated signup, or the first field that failed with a message for that field. */
export type ParsedSubscriber =
  | { ok: true; firstName: string; lastName: string | null; email: string; instagramHandle: string | null }
  | { ok: false; field: keyof ISubscriberInput; message: string };

/** Deliberately permissive: Shopify is the real authority on address validity. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Instagram's own rule: letters, digits, periods and underscores, 30 characters max. */
const HANDLE_PATTERN = /^[a-z0-9._]{1,30}$/;

/** A full name is unlikely past this length; longer input is treated as invalid, not truncated. */
const MAX_FULL_NAME_LENGTH = 100;

/** First and last name split from one free-text field. `lastName` is null for a single token. */
export interface ISplitName {
  firstName: string;
  lastName: string | null;
}

/** Trims and collapses whitespace, then splits on the first space. Null when empty or too long. */
export function normalizeFullName(raw: string): ISplitName | null {
  const collapsed = raw.trim().replace(/\s+/g, " ");

  if (collapsed === "" || collapsed.length > MAX_FULL_NAME_LENGTH) {
    return null;
  }

  const firstSpace = collapsed.indexOf(" ");
  if (firstSpace === -1) {
    return { firstName: collapsed, lastName: null };
  }

  return {
    firstName: collapsed.slice(0, firstSpace),
    lastName: collapsed.slice(firstSpace + 1),
  };
}

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

/** Validates a whole submission. Name and email are required; a supplied handle must be valid. */
export function parseSubscriberInput(input: ISubscriberInput): ParsedSubscriber {
  const name = normalizeFullName(input.fullName);
  if (name === null) {
    return { ok: false, field: "fullName", message: "Enter your name." };
  }

  const email = normalizeEmail(input.email);
  if (email === null) {
    return { ok: false, field: "email", message: "Enter a valid email address." };
  }

  if (input.instagramHandle.trim() === "") {
    return { ok: true, firstName: name.firstName, lastName: name.lastName, email, instagramHandle: null };
  }

  const instagramHandle = normalizeInstagramHandle(input.instagramHandle);
  if (instagramHandle === null) {
    return { ok: false, field: "instagramHandle", message: "Enter a valid Instagram handle." };
  }

  return { ok: true, firstName: name.firstName, lastName: name.lastName, email, instagramHandle };
}
