/**
 * Auth and plan constants
 */

export const FREE_LIMIT = 50;

/**
 * Utility: PREMIUM_TABS
 */
export const PREMIUM_TABS: readonly string[] = [
  "scatter",
  "hhi",
  "flags",
  "stats",
] as const;
export type PremiumTabId = (typeof PREMIUM_TABS)[number];
