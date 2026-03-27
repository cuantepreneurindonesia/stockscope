/**
 * Utility: THEME_COLORS
 */
export const THEME_COLORS = {
  bg: "#06050f",
  bgAlt: "#0d1e30",
  bgContent: "#09131f",
  bgCardAlt: "#060d18",
  text: "#e8f4f8",
  textSecondary: "#a8c8e8",
  textTertiary: "#6b8aad",
  border: "#1e3a52",
  borderAlt: "#132030",
  accent: "#457B9D",
};

/**
 * Utility: TIER_COLORS
 */
export const TIER_COLORS: Record<string, string> = {
  Red: "#E76F51",
  Amber: "#E9C46A",
  Green: "#2A9D8F",
};

/**
 * Utility: HHI_COLORS
 */
export const HHI_COLORS: Record<string, string> = {
  High: "#E76F51",
  Moderate: "#E9C46A",
  Low: "#2A9D8F",
};

/**
 * Utility: OWNER_TYPE_STYLES
 */
export const OWNER_TYPE_STYLES: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  ID: {
    label: "Individual",
    color: "#2A9D8F",
    bg: "#2A9D8F22",
    border: "#2A9D8F55",
  },
  CP: {
    label: "Corporate",
    color: "#E9C46A",
    bg: "#E9C46A22",
    border: "#E9C46A55",
  },
  IB: { label: "Bank", color: "#457B9D", bg: "#457B9D22", border: "#457B9D55" },
  IS: {
    label: "Insurance",
    color: "#A8DADC",
    bg: "#A8DADC22",
    border: "#A8DADC55",
  },
  SC: {
    label: "Securities",
    color: "#e9843a",
    bg: "#e9843a22",
    border: "#e9843a55",
  },
  PF: {
    label: "Pension Fund",
    color: "#9b72cf",
    bg: "#9b72cf22",
    border: "#9b72cf55",
  },
  MF: {
    label: "Mutual Fund",
    color: "#c77dff",
    bg: "#c77dff22",
    border: "#c77dff55",
  },
  OT: {
    label: "Other",
    color: "#8d99ae",
    bg: "#8d99ae22",
    border: "#8d99ae55",
  },
};

/**
 * Utility: FLAG_COLORS
 */
export const FLAG_COLORS: Record<string, string> = {
  "Insider>75%": "#e76f51",
  "SingleCP>50%": "#e9843a",
  "LowFloat<15%": "#e9c46a",
  "CriticalFloat<5%": "#d62828",
  ZeroForeign: "#6d6875",
};

/**
 * Utility: FLAG_DESCRIPTIONS
 */
export const FLAG_DESCRIPTIONS: Record<string, string> = {
  "Insider>75%":
    "Combined stake of corporate & individual insiders exceeds 75% of shares",
  "SingleCP>50%": "A single corporate entity holds more than 50% of shares",
  "LowFloat<15%": "Free float below IDX minimum listing guideline of 15%",
  "CriticalFloat<5%":
    "Extremely thin float under 5% — virtually illiquid for institutional trading",
  ZeroForeign: "No foreign investor holds a reportable position in this stock",
};

/**
 * Utility: METRIC_DESCRIPTIONS
 */
export const METRIC_DESCRIPTIONS: Record<string, string> = {
  totalStocks: "Total number of securities tracked",
  redStocks: "Highly concentrated ownership (HHI > 2500)",
  amberStocks: "Moderate concentration (HHI 1500-2500)",
  greenStocks: "Well-distributed ownership (HHI < 1500)",
  avgHHI: "Average Herfindahl-Hirschman Index across all stocks",
  avgFloat: "Average percentage of shares available for trading",
  totalOwners: "Unique shareholders identified",
  foreignOwned: "Stocks with foreign investor presence",
  HHI: "Herfindahl-Hirschman Index — measures ownership concentration. >2500 = highly concentrated.",
};
