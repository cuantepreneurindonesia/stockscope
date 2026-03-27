/**
 * Core type definitions
 */

export interface Stock {
  _id?: string;
  code: string;
  issuer: string;
  tier: "Red" | "Amber" | "Green";
  hhi: number;
  floatPercentage: number;
  c1: number;
  c3: number;
  hierarchyLevel?: string;
  flags?: string[];
  ownerType?: string;
  topHolder?: string;
  volume?: number;
  lastPrice?: number;
  marketCap?: number;
}

export interface Owner {
  _id?: string;
  name: string;
  type: OwnerType;
  totalHoldings: number;
  percentage: number;
}

export type OwnerType =
  | "ID"
  | "CP"
  | "IB"
  | "IS"
  | "SC"
  | "PF"
  | "MF"
  | "YD"
  | "GY"
  | "BK"
  | "OT";

export interface OwnershipHolding {
  _id?: string;
  stockCode: string;
  ownerName: string;
  ownerType: OwnerType;
  percentage: number;
  quantity?: number;
  purchasedAt?: Date;
}

export interface AnalyticsStats {
  totalStocks: number;
  byTier: TierDistribution;
  avgHHI: number;
  avgFloat: number;
  avgC1: number;
  avgC3: number;
  byFlag: FlagDistribution;
  topOwners?: TopOwner[];
}

export interface TierDistribution {
  red: number;
  amber: number;
  green: number;
}

export interface FlagDistribution {
  [key: string]: number;
}

export interface TopOwner {
  name: string;
  type: OwnerType;
  holdings: number;
  percentage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  limit: number;
  skip: number;
}

export interface StockFilter {
  tier?: Stock["tier"];
  hierarchyLevel?: string;
  flag?: string;
  ownerType?: OwnerType;
  searchText?: string;
}

export interface SortOptions {
  sortBy: keyof Stock;
  direction: "asc" | "desc";
}

export interface QueryOptions {
  limit?: number;
  skip?: number;
  sort?: SortOptions;
}

export interface DashboardFilters {
  tier?: Stock["tier"];
  searchText?: string;
  ownerType?: OwnerType;
  hierarchyLevel?: string;
  flag?: string;
}

export interface StockDataState {
  loading: boolean;
  error: string | null;
  RAW: Stock[];
  filtered: Stock[];
}

export type UseStockDataReturn = StockDataState;

export interface UseAnalyticsReturn {
  stats: AnalyticsStats | null;
  loading: boolean;
  error: string | null;
}

export interface DataTransformOptions {
  normalize?: boolean;
  cache?: boolean;
}

export interface HeatColorOptions {
  value: number;
  min: number;
  max: number;
  reverse?: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

/** HHI concentration level derived from hhi value */
export type HierarchyLevel = "Low" | "Moderate" | "High";

/** Tab-specific stats computed from filtered stocks */
export interface TabStats {
  total: number;
  red: number;
  amber: number;
  green: number;
  avgHHI: number;
  avgFF: number;
  lowFloat: number;
  highConc: number;
}

/** HHI histogram bin for stacked bar chart */
export interface HhiHistBin {
  range: string;
  Low: number;
  Moderate: number;
  High: number;
}

/** Flag count for governance flags chart */
export interface FlagCount {
  flag: GovernanceFlag;
  count: number;
}

/** Known governance flag identifiers */
export type GovernanceFlag =
  | "LowFloat<15%"
  | "Insider>75%"
  | "SingleCP>50%"
  | "ZeroForeign"
  | "CriticalFloat<5%";

/** Single stock in owner portfolio */
export interface PortfolioStock {
  code: string;
  pct: number;
  issuer: string;
}

/** Owner with portfolio holdings for Owners tab */
export interface OwnerWithPortfolio {
  name: string;
  type: OwnerType;
  count: number;
  totalPct: number;
  stocks: PortfolioStock[];
}

/** Owner type distribution for pie chart */
export interface OwnerTypeData {
  name: string;
  value: number;
  color: string;
}

/** Top owners bar chart data */
export interface TopOwnersBarData {
  name: string;
  fullName: string;
  count: number;
}

/** Scatter chart data point (Stock with ff alias for recharts) */
export interface ScatterChartPoint extends Stock {
  ff: number;
}

/** Recharts BarChart click payload for flag filter */
export interface BarChartClickPayload<T> {
  activePayload?: { payload: T }[];
}

/** MongoDB owner document (internal) */
export interface MongoOwnerDocument {
  name: string;
  type?: string;
  portfolio?: MongoPortfolioItem[];
  stats?: { totalConcentration?: number };
}

/** MongoDB portfolio item (internal) */
export interface MongoPortfolioItem {
  stockCode: string;
  percentage?: number;
}
