import type { ScreenPreset } from "@/types/screener";

/**
 * Predefined screening presets for the IDX market.
 *
 * Each preset bundles a curated set of filter conditions and an optional
 * default ranking field so users can get meaningful results with one click.
 */
export const presets: ScreenPreset[] = [
  {
    id: "value",
    name: "Value",
    description:
      "Low P/E, low P/BV, positive earnings – classic value-investing criteria.",
    filters: [
      { field: "pe", operator: ">", value: 0 },
      { field: "pe", operator: "<=", value: 15 },
      { field: "pbv", operator: "<=", value: 1.5 },
      { field: "netMargin", operator: ">", value: 0 },
    ],
    ranking: { field: "pe", direction: "asc" },
  },
  {
    id: "growth",
    name: "Growth",
    description:
      "Strong revenue growth and healthy margins – high-growth candidates.",
    filters: [
      { field: "revenueGrowth", operator: ">=", value: 15 },
      { field: "netMargin", operator: ">", value: 5 },
      { field: "roe", operator: ">", value: 10 },
    ],
    ranking: { field: "revenueGrowth", direction: "desc" },
  },
  {
    id: "quality",
    name: "Quality",
    description:
      "High ROE, low leverage, solid margins – quality-compounding stocks.",
    filters: [
      { field: "roe", operator: ">=", value: 15 },
      { field: "debtToEquity", operator: "<=", value: 1 },
      { field: "netMargin", operator: ">", value: 10 },
    ],
    ranking: { field: "roe", direction: "desc" },
  },
];

/**
 * Retrieve a preset by its ID.
 *
 * @param id - The preset identifier
 * @returns The matching ScreenPreset
 * @throws Error if no preset with the given id exists
 */
export function getPreset(id: string): ScreenPreset {
  const preset = presets.find((p) => p.id === id);
  if (!preset) {
    throw new Error(`Unknown preset: "${id}"`);
  }
  return preset;
}
