/**
 * Screener V1 - Stock entity types
 */

export type StockV1 = {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
};

export type Financials = {
  symbol: string;
  period: string;
  revenue: number;
  netIncome: number;
  totalAssets: number;
  totalEquity: number;
};
