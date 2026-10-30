/** An Indonesian mobile number has 9 to 12 digits after the country code and starts with 8. */
const NATIONAL_MOBILE_PATTERN = /^8\d{8,11}$/;

/**
 * Turns `08…`, `62…` or `+62…` with any spacing or punctuation into E.164 (`+628…`).
 * Null for landlines, short or long input, or anything that is not an Indonesian mobile.
 */
export function normalizeIndonesianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");

  let national: string;
  if (digits.startsWith("62")) {
    national = digits.slice(2);
  } else if (digits.startsWith("0")) {
    national = digits.slice(1);
  } else {
    national = digits;
  }

  return NATIONAL_MOBILE_PATTERN.test(national) ? `+62${national}` : null;
}
