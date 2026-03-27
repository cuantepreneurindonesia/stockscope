/**
 * Owner service layer
 * Separation of Concerns: Owner data fetching and API communication
 */
import type { ApiResponse, OwnerWithPortfolio } from "@/types";

const OWNERS_API = "/api/owners";

export interface FetchOwnersOptions {
  limit?: number;
  detailed?: boolean;
}

/**
 * Fetch owners from API
 */
export async function fetchOwnersWithPortfolio(
  options: FetchOwnersOptions = {},
): Promise<OwnerWithPortfolio[]> {
  const { limit = 100, detailed = true } = options;
  const params = new URLSearchParams({
    limit: String(Math.min(limit, 1000)),
    detailed: String(detailed),
  });

  const response = await fetch(`${OWNERS_API}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch owners: ${response.statusText}`);
  }

  const json: ApiResponse<OwnerWithPortfolio[]> = await response.json();
  if (!json.success || !json.data) {
    return [];
  }

  return json.data;
}
