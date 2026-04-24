import type { Metrics } from "@/types/metrics";

/**
 * Sort a dataset of stocks by a metrics field.
 *
 * Stocks with missing / non-finite values for the sort field are pushed to
 * the end of the result regardless of sort direction.
 *
 * @param data      - Array of metrics objects to sort
 * @param field     - The metrics field to sort by
 * @param direction - "asc" for ascending, "desc" for descending
 * @returns A new sorted array (original array is not mutated)
 */
export function rankStocks<T extends Metrics>(
  data: T[],
  field: string,
  direction: "asc" | "desc",
): T[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...data].sort((a, b) => {
    const aVal = (a as Record<string, unknown>)[field];
    const bVal = (b as Record<string, unknown>)[field];

    const aNum = typeof aVal === "number" && isFinite(aVal) ? aVal : null;
    const bNum = typeof bVal === "number" && isFinite(bVal) ? bVal : null;

    // Push null/invalid values to the end
    if (aNum === null && bNum === null) return 0;
    if (aNum === null) return 1;
    if (bNum === null) return -1;

    return (aNum - bNum) * multiplier;
  });
}
