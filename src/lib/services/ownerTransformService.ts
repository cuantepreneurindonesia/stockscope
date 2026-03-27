/**
 * Owner transform service layer
 * Separation of Concerns: Pure transformations for owner data display
 */
import { OWNER_TYPE_STYLES } from "@/lib/constants";

import type {
  OwnerTypeData,
  OwnerWithPortfolio,
  TopOwnersBarData,
} from "@/types";

const OWNER_TYPE_DEFAULT = "OT" as const;
const MAX_BAR_NAME_LENGTH = 15;
const TOP_OWNERS_LIMIT = 5;

/**
 * Filter owners by search term (case-insensitive name match)
 */
export function filterOwnersByName(
  owners: OwnerWithPortfolio[],
  searchTerm: string,
): OwnerWithPortfolio[] {
  const trimmed = searchTerm.trim();
  if (!trimmed || !owners.length) return owners;

  const lower = trimmed.toLowerCase();
  return owners.filter((o) => o.name.toLowerCase().includes(lower));
}

/**
 * Transform filtered owners to owner type distribution for pie chart
 */
export function transformOwnerTypeData(
  owners: OwnerWithPortfolio[],
): OwnerTypeData[] {
  const counts: Record<string, number> = {};

  for (const owner of owners) {
    const key = (owner.type ?? OWNER_TYPE_DEFAULT) as string;
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: OWNER_TYPE_STYLES[k]?.label ?? k,
      value: v,
      color: OWNER_TYPE_STYLES[k]?.color ?? "#8d99ae",
    }));
}

/**
 * Transform filtered owners to top owners bar chart data
 */
export function transformTopOwnersBarData(
  owners: OwnerWithPortfolio[],
  limit: number = TOP_OWNERS_LIMIT,
): TopOwnersBarData[] {
  return owners.slice(0, limit).map((o) => ({
    name:
      o.name.length > MAX_BAR_NAME_LENGTH
        ? o.name.substring(0, MAX_BAR_NAME_LENGTH) + "..."
        : o.name,
    fullName: o.name,
    count: o.count,
  }));
}
