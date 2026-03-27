"use client";

import { useEffect, useState } from "react";

import type { AnalyticsStats, StockFilter, UseAnalyticsReturn } from "@/types";

/**
 * Utility: useAnalytics
 */
export function useAnalytics(filters?: StockFilter): UseAnalyticsReturn {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tier = filters?.tier;
  const hierarchyLevel = filters?.hierarchyLevel;
  const flag = filters?.flag;
  const ownerType = filters?.ownerType;

  useEffect(() => {
    async function fetchAnalytics(): Promise<void> {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (tier) params.append("tier", tier);
        if (hierarchyLevel) params.append("hierarchyLevel", hierarchyLevel);
        if (flag) params.append("flag", flag);
        if (ownerType) params.append("ownerType", ownerType);

        const response = await fetch(`/api/analytics?${params.toString()}`);
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch analytics";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [tier, hierarchyLevel, flag, ownerType]);

  return { stats, loading, error };
}
