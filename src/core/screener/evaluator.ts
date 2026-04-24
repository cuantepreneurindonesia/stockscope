import type { Filter } from "@/types/screener";
import type { Metrics } from "@/types/metrics";
import { applyFilter } from "./filter";

/**
 * Evaluate whether a stock passes ALL of the provided filters.
 *
 * A stock passes if every filter condition is satisfied. An undefined or
 * NaN metric value automatically fails the filter for that field.
 *
 * @param stock   - The stock's precomputed metrics
 * @param filters - Array of filter conditions to evaluate
 * @returns true if the stock satisfies every filter
 */
export function evaluateStock(stock: Metrics, filters: Filter[]): boolean {
  return filters.every((filter) => {
    const metricValue = stock[filter.field];
    if (typeof metricValue !== "number" || !isFinite(metricValue)) {
      return false;
    }
    return applyFilter(metricValue, filter.operator, filter.value);
  });
}
