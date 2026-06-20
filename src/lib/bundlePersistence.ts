import type { LineItem } from "@/types";

export const STORAGE_KEY = "wyze_bundle_v3";

export function persistBundleItems(items: LineItem[]): boolean {
  if (typeof window === "undefined") return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
