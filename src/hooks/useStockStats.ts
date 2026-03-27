"use client";

import { useEffect, useMemo, useState } from "react";

import { fetchOwnersWithPortfolio } from "@/lib/services/ownerService";
import {
  filterOwnersByName,
  transformOwnerTypeData,
  transformTopOwnersBarData,
} from "@/lib/services/ownerTransformService";
import {
  calculateFlagCounts,
  calculateHhiHistogram,
  calculateTabStats,
} from "@/lib/services/tabStatsService";

import type {
  FlagCount,
  HhiHistBin,
  OwnerTypeData,
  OwnerWithPortfolio,
  Stock,
  TabStats,
  TopOwnersBarData,
} from "@/types";

export interface UseStockStatsReturn {
  stats: TabStats;
  hhiHist: HhiHistBin[];
  flagCounts: FlagCount[];
  filteredOwners: OwnerWithPortfolio[];
  ownerTypeData: OwnerTypeData[];
  topOwnersBarData: TopOwnersBarData[];
  loading: boolean;
}

/**
 * Hook for tab-specific stats (HHI, Flags, Owners).
 * Orchestrates data fetching and delegates calculations to services.
 */
export function useStockStats(
  filteredStocks: Stock[],
  ownerSearch = "",
): UseStockStatsReturn {
  const [ownerStats, setOwnerStats] = useState<OwnerWithPortfolio[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadOwners(): Promise<void> {
      try {
        setLoading(true);
        const data = await fetchOwnersWithPortfolio({
          limit: 100,
          detailed: true,
        });
        if (!cancelled) setOwnerStats(data);
      } catch {
        if (!cancelled) setOwnerStats([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOwners();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(
    () => calculateTabStats(filteredStocks),
    [filteredStocks],
  );

  const hhiHist = useMemo(
    () => calculateHhiHistogram(filteredStocks),
    [filteredStocks],
  );

  const flagCounts = useMemo(
    () => calculateFlagCounts(filteredStocks),
    [filteredStocks],
  );

  const filteredOwners = useMemo(
    () => filterOwnersByName(ownerStats, ownerSearch),
    [ownerStats, ownerSearch],
  );

  const ownerTypeData = useMemo(
    () => transformOwnerTypeData(filteredOwners),
    [filteredOwners],
  );

  const topOwnersBarData = useMemo(
    () => transformTopOwnersBarData(filteredOwners),
    [filteredOwners],
  );

  return {
    stats,
    hhiHist,
    flagCounts,
    filteredOwners,
    ownerTypeData,
    topOwnersBarData,
    loading,
  };
}
