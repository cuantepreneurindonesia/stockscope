/**
 * Tab stats service layer
 * Separation of Concerns: Pure analytics for dashboard tabs (HHI, Flags, etc.)
 */
import type {
  FlagCount,
  GovernanceFlag,
  HhiHistBin,
  HierarchyLevel,
  Stock,
  TabStats,
} from "@/types";

const GOVERNANCE_FLAGS: readonly GovernanceFlag[] = [
  "LowFloat<15%",
  "Insider>75%",
  "SingleCP>50%",
  "ZeroForeign",
  "CriticalFloat<5%",
] as const;

const HHI_BIN_BOUNDS = [
  { max: 1500, range: "<1,500" },
  { max: 2000, range: "1,500\n-\n2,000" },
  { max: 2500, range: "2,000\n-\n2,500" },
  { max: 5000, range: "2,500\n-\n5,000" },
  { max: Infinity, range: ">5,000" },
] as const;

/**
 * Derive hierarchy level from HHI value
 */
export function getHierarchyLevel(hhi: number): HierarchyLevel {
  if (hhi < 1500) return "Low";
  if (hhi <= 2500) return "Moderate";
  return "High";
}

/**
 * Calculate tab-specific stats from filtered stocks
 */
export function calculateTabStats(stocks: Stock[]): TabStats {
  if (!stocks.length) {
    return {
      total: 0,
      red: 0,
      amber: 0,
      green: 0,
      avgHHI: 0,
      avgFF: 0,
      lowFloat: 0,
      highConc: 0,
    };
  }

  const total = stocks.length;
  const red = stocks.filter((s) => s.tier === "Red").length;
  const amber = stocks.filter((s) => s.tier === "Amber").length;
  const green = stocks.filter((s) => s.tier === "Green").length;
  const avgHHI = stocks.reduce((sum, s) => sum + s.hhi, 0) / total;
  const avgFF =
    stocks.reduce((sum, s) => sum + (s.floatPercentage ?? 0), 0) / total;
  const lowFloat = stocks.filter((s) => (s.floatPercentage ?? 0) < 15).length;
  const highConc = stocks.filter(
    (s) => getHierarchyLevel(s.hhi) === "High",
  ).length;

  return {
    total,
    red,
    amber,
    green,
    avgHHI,
    avgFF,
    lowFloat,
    highConc,
  };
}

/**
 * Calculate HHI histogram bins for stacked bar chart
 */
export function calculateHhiHistogram(stocks: Stock[]): HhiHistBin[] {
  const bins: HhiHistBin[] = HHI_BIN_BOUNDS.map(({ range }) => ({
    range,
    Low: 0,
    Moderate: 0,
    High: 0,
  }));

  for (const stock of stocks) {
    const hl = getHierarchyLevel(stock.hhi);
    const binIndex = HHI_BIN_BOUNDS.findIndex((b) => stock.hhi <= b.max);
    const bin = bins[binIndex >= 0 ? binIndex : bins.length - 1];
    bin[hl] = (bin[hl] ?? 0) + 1;
  }

  return bins;
}

/**
 * Calculate flag counts for governance flags chart
 */
export function calculateFlagCounts(stocks: Stock[]): FlagCount[] {
  return [...GOVERNANCE_FLAGS]
    .map((flag) => ({
      flag,
      count: stocks.filter((s) => s.flags?.includes(flag)).length,
    }))
    .sort((a, b) => b.count - a.count);
}
