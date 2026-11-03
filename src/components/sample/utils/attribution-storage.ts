import type { IAttribution } from "@/app/utils/attribution";

const STORAGE_KEY = "within:attribution";

/** The attribution saved on an earlier visit, or null. Storage can throw in private windows. */
export function readStoredAttribution(): IAttribution | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === null ? null : (JSON.parse(raw) as IAttribution);
  } catch {
    return null;
  }
}

/** Saves the merged attribution for a later visit. Silently does nothing when storage is unavailable. */
export function storeAttribution(attribution: IAttribution): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage unavailable: the URL still carries the values for this visit.
  }
}
