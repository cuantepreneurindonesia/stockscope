import type { Financials } from "@/types/stock";
import type { Metrics } from "@/types/metrics";

/**
 * Compute precomputed financial metrics from raw financials.
 *
 * Note: P/E and P/BV ratios require market data (share price and book value
 * per share) that is not available in the base Financials type. Those fields
 * are therefore accepted as explicit parameters. When the caller cannot supply
 * them, pass 0 and the resulting metric will be set to 0 accordingly.
 *
 * @param financials        - Single-period financials for a stock
 * @param sharesOutstanding - Number of shares outstanding (for EPS calculation)
 * @param marketPrice       - Current share price
 * @param bookValuePerShare - Book value per share
 * @param previousRevenue   - Previous period revenue for growth calculation
 * @returns Computed Metrics object; fields default to 0 when inputs are invalid
 */
export function computeMetrics(
  financials: Financials,
  sharesOutstanding: number,
  marketPrice: number,
  bookValuePerShare: number,
  previousRevenue?: number,
): Metrics {
  const { symbol, period, revenue, netIncome, totalEquity } = financials;

  const eps =
    sharesOutstanding > 0 ? netIncome / sharesOutstanding : 0;
  const pe = eps > 0 && marketPrice > 0 ? marketPrice / eps : 0;
  const pbv =
    bookValuePerShare > 0 && marketPrice > 0
      ? marketPrice / bookValuePerShare
      : 0;
  const roe =
    totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
  const revenueGrowth =
    previousRevenue && previousRevenue > 0
      ? ((revenue - previousRevenue) / previousRevenue) * 100
      : 0;
  const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;

  return {
    symbol,
    asOf: period,
    pe: round2(pe),
    pbv: round2(pbv),
    roe: round2(roe),
    revenueGrowth: round2(revenueGrowth),
    netMargin: round2(netMargin),
    debtToEquity: 0, // requires total-debt data not in base Financials type
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Derive a basic debt-to-equity ratio when total debt is available.
 */
export function computeDebtToEquity(
  totalDebt: number,
  totalEquity: number,
): number {
  if (totalEquity <= 0) return 0;
  return Math.round((totalDebt / totalEquity) * 100) / 100;
}
