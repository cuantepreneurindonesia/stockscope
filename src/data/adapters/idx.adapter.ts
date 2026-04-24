import type { StockV1 } from "@/types/stock";
import type { Metrics } from "@/types/metrics";
import type { ScreenerDataset } from "@/types/screener";

/**
 * Shape of a raw IDX stock record as returned from the database.
 * Fields are optional because not all stocks have complete data.
 */
interface RawIdxStock {
  code?: string;
  issuer?: string;
  sector?: string;
  industry?: string;
  pe?: number;
  pb?: number;
  roe?: number;
  revenueGrowth?: number;
  netMargin?: number;
  debtToEquity?: number;
  [key: string]: unknown;
}

/**
 * Transform a raw database record into the unified (StockV1 & Metrics) shape
 * expected by the screener engine.
 *
 * @param raw - Raw document from the MongoDB stocks collection
 * @returns Combined StockV1 + Metrics record, or null if the record is invalid
 */
export function adaptIdxStock(raw: RawIdxStock): (StockV1 & Metrics) | null {
  if (!raw.code) return null;

  const stock: StockV1 = {
    symbol: raw.code,
    name: raw.issuer ?? raw.code,
    sector: raw.sector ?? "Unknown",
    industry: raw.industry ?? raw.sector ?? "Unknown",
  };

  const metrics: Metrics = {
    symbol: raw.code,
    asOf: new Date().toISOString().slice(0, 10),
    pe: typeof raw.pe === "number" ? raw.pe : 0,
    pbv: typeof raw.pb === "number" ? raw.pb : 0,
    roe: typeof raw.roe === "number" ? raw.roe : 0,
    revenueGrowth:
      typeof raw.revenueGrowth === "number" ? raw.revenueGrowth : 0,
    netMargin: typeof raw.netMargin === "number" ? raw.netMargin : 0,
    debtToEquity:
      typeof raw.debtToEquity === "number" ? raw.debtToEquity : 0,
  };

  return { ...stock, ...metrics };
}

/**
 * Batch-adapt an array of raw IDX stock records.
 *
 * Invalid records are silently dropped.
 */
export function adaptIdxStocks(raws: RawIdxStock[]): ScreenerDataset {
  return raws.reduce<ScreenerDataset>((acc, raw) => {
    const adapted = adaptIdxStock(raw);
    if (adapted) acc.push(adapted);
    return acc;
  }, []);
}
