/**
 * Analytics service layer
 * Separation of Concerns: All analytics calculations and data aggregation
 */
import type {
  AnalyticsStats,
  FlagDistribution,
  Stock,
  TierDistribution,
} from "@/types";

/**
 * Calculate comprehensive analytics from stocks
 */
export function calculateAnalytics(stocks: Stock[]): AnalyticsStats {
  if (!stocks || stocks.length === 0) {
    return {
      totalStocks: 0,
      byTier: { red: 0, amber: 0, green: 0 },
      avgHHI: 0,
      avgFloat: 0,
      avgC1: 0,
      avgC3: 0,
      byFlag: {},
    };
  }

  const byTier = calculateTierDistribution(stocks);
  const avgHHI = calculateAverage(stocks, (s) => s.hhi);
  const avgFloat = calculateAverage(stocks, (s) => s.floatPercentage);
  const avgC1 = calculateAverage(stocks, (s) => s.c1);
  const avgC3 = calculateAverage(stocks, (s) => s.c3);
  const byFlag = calculateFlagDistribution(stocks);

  return {
    totalStocks: stocks.length,
    byTier,
    avgHHI,
    avgFloat,
    avgC1,
    avgC3,
    byFlag,
  };
}

/**
 * Calculate tier distribution
 */
export function calculateTierDistribution(stocks: Stock[]): TierDistribution {
  return {
    red: stocks.filter((s) => s.tier === "Red").length,
    amber: stocks.filter((s) => s.tier === "Amber").length,
    green: stocks.filter((s) => s.tier === "Green").length,
  };
}

/**
 * Calculate HHI distribution buckets
 */
export function calculateHhiDistribution(
  stocks: Stock[],
): Record<string, number> {
  const buckets: Record<string, number> = {
    "< 1500": 0,
    "1500-2500": 0,
    "> 2500": 0,
  };

  stocks.forEach((s) => {
    if (s.hhi < 1500) {
      buckets["< 1500"]++;
    } else if (s.hhi <= 2500) {
      buckets["1500-2500"]++;
    } else {
      buckets["> 2500"]++;
    }
  });

  return buckets;
}

/**
 * Calculate flag distribution
 */
export function calculateFlagDistribution(stocks: Stock[]): FlagDistribution {
  const distribution: FlagDistribution = {};

  stocks.forEach((s) => {
    if (s.flags && s.flags.length > 0) {
      s.flags.forEach((flag: string) => {
        distribution[flag] = (distribution[flag] ?? 0) + 1;
      });
    }
  });

  return distribution;
}

/**
 * Calculate average from stocks using selector function
 */
function calculateAverage(
  stocks: Stock[],
  selector: (stock: Stock) => number,
): number {
  if (stocks.length === 0) return 0;
  const sum = stocks.reduce((acc, stock) => acc + selector(stock), 0);
  return sum / stocks.length;
}

/**
 * Get concentration metrics
 */
export function getConcentrationMetrics(stocks: Stock[]): {
  highlyConcentrated: number;
  moderatelyConcentrated: number;
  wellDistributed: number;
  percentage: {
    highlyConcentrated: number;
    moderatelyConcentrated: number;
    wellDistributed: number;
  };
} {
  const total = stocks.length;

  const highlyConcentrated = stocks.filter((s) => s.hhi > 2500).length;
  const moderatelyConcentrated = stocks.filter(
    (s) => s.hhi > 1500 && s.hhi <= 2500,
  ).length;
  const wellDistributed = stocks.filter((s) => s.hhi <= 1500).length;

  return {
    highlyConcentrated,
    moderatelyConcentrated,
    wellDistributed,
    percentage: {
      highlyConcentrated: total > 0 ? (highlyConcentrated / total) * 100 : 0,
      moderatelyConcentrated:
        total > 0 ? (moderatelyConcentrated / total) * 100 : 0,
      wellDistributed: total > 0 ? (wellDistributed / total) * 100 : 0,
    },
  };
}

/**
 * Get top metrics
 */
export function getTopMetrics(stocks: Stock[]): {
  topByHhi: Stock[];
  topByFloat: Stock[];
  topByC1: Stock[];
} {
  const sorted = [...stocks];

  return {
    topByHhi: sorted.sort((a, b) => b.hhi - a.hhi).slice(0, 10),
    topByFloat: sorted
      .sort((a, b) => b.floatPercentage - a.floatPercentage)
      .slice(0, 10),
    topByC1: sorted.sort((a, b) => b.c1 - a.c1).slice(0, 10),
  };
}
