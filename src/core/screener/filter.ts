import type { FilterOperator } from "@/types/screener";

/**
 * Apply a single numeric filter comparison.
 *
 * @param metricValue - The stock's current metric value
 * @param operator    - Comparison operator
 * @param value       - Threshold value from the filter definition
 * @returns true if the stock passes the filter
 */
export function applyFilter(
  metricValue: number,
  operator: FilterOperator,
  value: number,
): boolean {
  switch (operator) {
    case ">":
      return metricValue > value;
    case "<":
      return metricValue < value;
    case ">=":
      return metricValue >= value;
    case "<=":
      return metricValue <= value;
    case "=":
      return metricValue === value;
  }
}
