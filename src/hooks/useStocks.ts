"use client";

import { useEffect, useMemo, useState } from "react";

import { filterStocks, sortStocks } from "@/lib/services/dataTransformService";

import type {
  SortOptions,
  Stock,
  StockDataState,
  StockFilter,
  UseStockDataReturn,
} from "@/types";

interface UseStockDataOptions extends StockFilter {
  sortBy?: keyof Stock;
  sortDir?: SortOptions["direction"];
}

/**
 * Utility: useStockData
 */
export function useStockData(
  options: UseStockDataOptions = {},
): UseStockDataReturn {
  const [state, setState] = useState<StockDataState>({
    loading: true,
    error: null,
    RAW: [],
    filtered: [],
  });

  const tier = options.tier;
  const searchText = options.searchText;
  const sortBy = options.sortBy;
  const sortDir = options.sortDir;
  const hierarchyLevel = options.hierarchyLevel;
  const flag = options.flag;

  useEffect(() => {
    async function fetchStocks(): Promise<void> {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));

        const params = new URLSearchParams();
        if (tier) params.append("tier", tier);
        if (hierarchyLevel) params.append("hierarchyLevel", hierarchyLevel);
        if (flag) params.append("flag", flag);
        if (searchText) params.append("search", searchText);
        params.append("limit", "10000");

        const response = await fetch(`/api/stocks?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch stocks");
        }

        const data = await response.json();
        const stocks: Stock[] = data.data || [];

        let filtered = stocks;
        if (searchText) {
          filtered = filterStocks(filtered, { searchText });
        }

        const sorted = sortStocks(
          filtered,
          sortBy || ("code" as keyof Stock),
          sortDir || "asc",
        );

        setState({
          loading: false,
          error: null,
          RAW: stocks,
          filtered: sorted,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch stocks";
        setState({
          loading: false,
          error: errorMessage,
          RAW: [],
          filtered: [],
        });
      }
    }

    fetchStocks();
  }, [tier, searchText, sortBy, sortDir, hierarchyLevel, flag]);

  return state;
}

/**
 * Utility: useStockStats
 */
export function useStockStats(stocks: Stock[]): {
  totalStocks: number;
  byTier: Record<"red" | "amber" | "green", number>;
  avgHHI: number;
  avgFloat: number;
} {
  return useMemo(() => {
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
  }, [stocks]);
}

/**
 * Utility: useFilteredStocks
 */
export function useFilteredStocks(
  stocks: Stock[],
  filters: UseStockDataOptions,
): Stock[] {
  return useMemo(() => {
    let filtered = stocks;

    const filterObj: StockFilter = {};
    if (filters.tier) filterObj.tier = filters.tier;
    if (filters.hierarchyLevel)
      filterObj.hierarchyLevel = filters.hierarchyLevel;
    if (filters.flag) filterObj.flag = filters.flag;
    if (filters.searchText) filterObj.searchText = filters.searchText;
    if (filters.ownerType) filterObj.ownerType = filters.ownerType;

    filtered = filterStocks(filtered, filterObj);

    return sortStocks(
      filtered,
      filters.sortBy || ("code" as keyof Stock),
      filters.sortDir || "asc",
    );
  }, [stocks, filters]);
}
