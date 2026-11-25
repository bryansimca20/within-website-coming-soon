const HANDLE_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** A Shopify product handle from the export form, or null for store reviews (blank) or anything malformed. */
export function parseProductHandle(value: string | null): string | null {
  const handle = (value ?? "").trim().toLowerCase();

  return handle.length <= 255 && HANDLE_PATTERN.test(handle) ? handle : null;
}
