/**
 * Screener V1 API client helpers.
 *
 * These thin wrappers keep fetch calls out of component files and make
 * testing / mocking easier.
 */

import type { ScreenerRequest, ScreenerResponse } from "@/types/screener";

/**
 * Call the Screener V1 API with a full request payload.
 */
export async function fetchScreenerResults(
  request: ScreenerRequest,
): Promise<ScreenerResponse> {
  const res = await fetch("/api/screener-v1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    throw new Error(`Screener API error: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { success: boolean } & ScreenerResponse;

  if (!json.success) {
    throw new Error("Screener API returned an unsuccessful response");
  }

  return { data: json.data, total: json.total, page: json.page, limit: json.limit };
}

/**
 * Call the Screener V1 API using a preset.
 */
export async function fetchScreenerPreset(
  presetId: string,
  page = 1,
  limit = 50,
): Promise<ScreenerResponse> {
  return fetchScreenerResults({ filters: [], presetId, page, limit });
}
