import type { Metrics, MetricsField } from "@/types/metrics";

/**
 * Human-readable labels and formatting hints for each metric field.
 */
export const METRIC_META: Record<
  MetricsField,
  { label: string; unit?: string; higherIsBetter: boolean }
> = {
  pe: { label: "P/E Ratio", higherIsBetter: false },
  pbv: { label: "P/BV Ratio", higherIsBetter: false },
  roe: { label: "ROE", unit: "%", higherIsBetter: true },
  revenueGrowth: { label: "Revenue Growth", unit: "%", higherIsBetter: true },
  netMargin: { label: "Net Margin", unit: "%", higherIsBetter: true },
  debtToEquity: { label: "Debt/Equity", higherIsBetter: false },
};

/**
 * All filterable metric field names.
 */
export const METRIC_FIELDS: MetricsField[] = Object.keys(
  METRIC_META,
) as MetricsField[];

/**
 * Validate that a raw object contains the minimum required metrics fields.
 */
export function isValidMetrics(obj: unknown): obj is Metrics {
  if (typeof obj !== "object" || obj === null) return false;
  const m = obj as Record<string, unknown>;
  return (
    typeof m.symbol === "string" &&
    typeof m.asOf === "string" &&
    typeof m.pe === "number" &&
    typeof m.pbv === "number" &&
    typeof m.roe === "number" &&
    typeof m.revenueGrowth === "number" &&
    typeof m.netMargin === "number" &&
    typeof m.debtToEquity === "number"
  );
}
