/**
 * Screener V1 - Precomputed financial metrics
 */

export type Metrics = {
  symbol: string;
  asOf: string;
  pe: number;
  pbv: number;
  roe: number;
  revenueGrowth: number;
  netMargin: number;
  debtToEquity: number;
};

export type MetricsField = keyof Omit<Metrics, "symbol" | "asOf">;
