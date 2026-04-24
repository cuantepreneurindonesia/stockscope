/**
 * Screener V1 - Screener filter and request/response types
 */
import type { MetricsField } from "./metrics";
import type { StockV1 } from "./stock";

export type FilterOperator = ">" | "<" | ">=" | "<=" | "=";

export type Filter = {
  field: MetricsField;
  operator: FilterOperator;
  value: number;
};

export type ScreenPreset = {
  id: string;
  name: string;
  description?: string;
  filters: Filter[];
  ranking?: {
    field: MetricsField;
    direction: "asc" | "desc";
  };
};

export type ScreenerRequest = {
  filters: Filter[];
  presetId?: string;
  sort?: {
    field: string;
    direction: "asc" | "desc";
  };
  page: number;
  limit: number;
};

export type ScreenerResponse = {
  data: (StockV1 & import("./metrics").Metrics)[];
  total: number;
  page: number;
  limit: number;
};

export type ScreenerDataset = (StockV1 & import("./metrics").Metrics)[];
