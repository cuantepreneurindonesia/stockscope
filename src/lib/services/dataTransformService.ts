/**
 * Data transformation service
 * Separation of Concerns: All data formatting and transformation
 */
import type { Stock, StockFilter } from "@/types";

/**
 * Format number with K/M suffix
 */
export function formatNumber(value: number, decimals: number = 0): string {
  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(decimals) + "M";
  }
  if (value >= 1_000) {
    return (value / 1_000).toFixed(decimals) + "K";
  }
  return value.toFixed(decimals);
}

/**
 * Format percentage (values are already in 0-100 range)
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return value.toFixed(decimals) + "%";
}

/**
 * Get heat color based on value position in range
 * Returns {r, g, b} matching the React app's warm gradient
 */
export function getHeatColor(
  value: number,
  min: number,
  max: number,
  reverse: boolean = false,
): { r: number; g: number; b: number } {
  const pct = max === min ? 0.5 : (value - min) / (max - min);
  const heat = reverse ? 1 - pct : pct;
  const r = Math.round(231 * heat);
  const g = Math.round(Math.max(158 - heat * 100, 60));
  const b = Math.round(81 + (1 - heat) * 90);
  return { r, g, b };
}

/**
 * Get heat color as RGB string
 */
export function getHeatColorString(
  value: number,
  min: number,
  max: number,
  reverse: boolean = false,
): string {
  const { r, g, b } = getHeatColor(value, min, max, reverse);
  return `rgb(${r},${g},${b})`;
}

/**
 * Filter stocks by multiple criteria
 */
export function filterStocks(stocks: Stock[], filters: StockFilter): Stock[] {
  let result = stocks;

  if (filters.tier) {
    result = result.filter((s) => s.tier === filters.tier);
  }

  if (filters.hierarchyLevel) {
    const hl = filters.hierarchyLevel;
    result = result.filter((s) => {
      const computed =
        s.hierarchyLevel ??
        (s.hhi < 1500 ? "Low" : s.hhi <= 2500 ? "Moderate" : "High");
      return computed === hl;
    });
  }

  if (filters.flag) {
    const flagToCheck = filters.flag;
    result = result.filter((s) => s.flags?.includes(flagToCheck) ?? false);
  }

  if (filters.ownerType) {
    result = result.filter((s) => s.ownerType === filters.ownerType);
  }

  if (filters.searchText) {
    const searchLower = filters.searchText.toLowerCase();
    result = result.filter(
      (s) =>
        s.code.toLowerCase().includes(searchLower) ||
        s.issuer.toLowerCase().includes(searchLower) ||
        s.topHolder?.toLowerCase().includes(searchLower),
    );
  }

  return result;
}

/**
 * Sort stocks by field
 */
export function sortStocks(
  stocks: Stock[],
  sortBy: keyof Stock = "code",
  direction: "asc" | "desc" = "asc",
): Stock[] {
  const sorted = [...stocks];

  sorted.sort((a, b) => {
    const aValue = a[sortBy] as string | number | undefined;
    const bValue = b[sortBy] as string | number | undefined;

    // Handle null/undefined
    if (aValue == null || bValue == null) {
      return 0;
    }

    // Handle numeric comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      const cmp = aValue.localeCompare(bValue);
      return direction === "asc" ? cmp : -cmp;
    }

    // Handle other types
    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * Paginate items
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number = 50,
): {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
} {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return {
    data: items.slice(start, end),
    total: items.length,
    pages: Math.ceil(items.length / pageSize),
    currentPage: page,
  };
}

/**
 * Group stocks by tier
 */
export function groupByTier(
  stocks: Stock[],
): Record<"Red" | "Amber" | "Green", Stock[]> {
  return {
    Red: stocks.filter((s) => s.tier === "Red"),
    Amber: stocks.filter((s) => s.tier === "Amber"),
    Green: stocks.filter((s) => s.tier === "Green"),
  };
}

/**
 * Get min and max values for heat coloring
 */
export function getMinMaxForField(
  stocks: Stock[],
  field: keyof Stock,
): {
  min: number;
  max: number;
} {
  const values = stocks
    .map((s) => s[field])
    .filter((v) => typeof v === "number") as number[];

  if (values.length === 0) {
    return { min: 0, max: 100 };
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}
