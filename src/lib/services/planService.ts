/**
 * Plan service layer
 * Separation of Concerns: Pure functions for plan/limit logic
 */
import { PREMIUM_TABS } from "@/lib/auth/constants";

/**
 * Split items into visible and blurred count based on limit.
 */
export function applyLimit<T>(
  items: T[],
  limit: number,
): { visible: T[]; blurredCount: number } {
  if (limit <= 0 || !Number.isFinite(limit)) {
    return { visible: items, blurredCount: 0 };
  }
  const visible = items.slice(0, limit);
  const blurredCount = Math.max(0, items.length - limit);
  return { visible, blurredCount };
}

/**
 * Check if tab requires premium access.
 */
export function isPremiumTab(tabId: string): boolean {
  return PREMIUM_TABS.includes(tabId);
}
