/**
 * Stock service layer
 * Separation of Concerns: All stock-related business logic
 */
import { stockQueries } from "@/lib/mongodb";

import type { QueryOptions, Stock, StockFilter } from "@/types";

/**
 * Fetch stocks with filtering and pagination
 */
export async function fetchStocks(
  filter: StockFilter = {},
  options: QueryOptions = {},
): Promise<Stock[]> {
  const mongoFilter = buildMongoFilter(filter);
  const sortOpt = options.sort;
  const mongoSort: Record<string, 1 | -1> | undefined =
    sortOpt != null
      ? {
          [sortOpt.sortBy]: sortOpt.direction === "asc" ? 1 : -1,
        }
      : undefined;
  const result = await stockQueries.find(mongoFilter, {
    limit: options.limit ?? 50,
    skip: options.skip ?? 0,
    sort: mongoSort,
  });
  return result as unknown as Stock[];
}

/**
 * Fetch all stocks for analysis
 */
export async function fetchAllStocks(limit: number = 10000): Promise<Stock[]> {
  const result = await stockQueries.findAll(limit);
  return result as unknown as Stock[];
}

/**
 * Count stocks matching filter
 */
export async function countStocks(filter: StockFilter = {}): Promise<number> {
  const mongoFilter = buildMongoFilter(filter);
  return stockQueries.count(mongoFilter);
}

/**
 * Find single stock by code
 */
export async function findStockByCode(code: string): Promise<Stock | null> {
  const result = await stockQueries.findByCode(code);
  return result as Stock | null;
}

/**
 * Get stock statistics
 */
export async function getStockStats(stocks: Stock[]): Promise<{
  totalStocks: number;
  byTier: Record<"red" | "amber" | "green", number>;
  avgHHI: number;
  avgFloat: number;
}> {
  if (!stocks || stocks.length === 0) {
    return {
      totalStocks: 0,
      byTier: { red: 0, amber: 0, green: 0 },
      avgHHI: 0,
      avgFloat: 0,
    };
  }

  const byTier = {
    red: stocks.filter((s) => s.tier === "Red").length,
    amber: stocks.filter((s) => s.tier === "Amber").length,
    green: stocks.filter((s) => s.tier === "Green").length,
  };

  const avgHHI = stocks.reduce((sum, s) => sum + s.hhi, 0) / stocks.length;
  const avgFloat =
    stocks.reduce((sum, s) => sum + s.floatPercentage, 0) / stocks.length;

  return {
    totalStocks: stocks.length,
    byTier,
    avgHHI,
    avgFloat,
  };
}

/**
 * Build MongoDB filter from StockFilter
 * Separation of Concerns: Database-specific logic isolated
 */
function buildMongoFilter(filter: StockFilter): Record<string, unknown> {
  const mongoFilter: Record<string, unknown> = {};

  if (filter.tier) {
    mongoFilter.tier = filter.tier;
  }

  if (filter.hierarchyLevel) {
    mongoFilter.hierarchyLevel = filter.hierarchyLevel;
  }

  if (filter.flag) {
    mongoFilter.flags = { $in: [filter.flag] };
  }

  if (filter.ownerType) {
    mongoFilter.ownerType = filter.ownerType;
  }

  if (filter.searchText) {
    mongoFilter.$or = [
      { code: { $regex: filter.searchText, $options: "i" } },
      { issuer: { $regex: filter.searchText, $options: "i" } },
      { topHolder: { $regex: filter.searchText, $options: "i" } },
    ];
  }

  return mongoFilter;
}
