/**
 * Screener Engine – single source of truth for all screening logic.
 *
 * This module is the ONLY place where filtering and ranking logic may live.
 * All other modules must delegate to this engine.
 */

import type { ScreenerRequest, ScreenerResponse, ScreenerDataset } from "@/types/screener";
import type { Filter } from "@/types/screener";
import { evaluateStock } from "./evaluator";
import { rankStocks } from "./ranking";
import { getPreset } from "./preset";

/**
 * Run the screener against a preloaded dataset.
 *
 * Execution order:
 *  1. Merge preset filters with user-supplied filters
 *  2. Apply combined filter set to every stock
 *  3. Apply ranking (preset ranking is overridden by an explicit sort request)
 *  4. Paginate and return the result
 *
 * @param stocks  - Full preloaded dataset (Stock & Metrics combined)
 * @param request - Screener configuration from the client
 * @returns Paginated ScreenerResponse
 */
export function runScreener(
  stocks: ScreenerDataset,
  request: ScreenerRequest,
): ScreenerResponse {
  const { filters: userFilters, presetId, sort, page, limit } = request;

  // 1. Merge preset filters with user filters
  let combinedFilters: Filter[] = [...userFilters];
  let defaultSort = sort;

  if (presetId) {
    try {
      const preset = getPreset(presetId);
      combinedFilters = [...preset.filters, ...userFilters];

      // Use preset ranking only when no explicit sort is provided
      if (!sort && preset.ranking) {
        defaultSort = preset.ranking;
      }
    } catch {
      // Unknown preset – proceed with user filters only
    }
  }

  // 2. Filter
  const filtered = stocks.filter((stock) =>
    evaluateStock(stock, combinedFilters),
  );

  // 3. Rank / sort
  let ranked = filtered;
  if (defaultSort) {
    ranked = rankStocks(filtered, defaultSort.field, defaultSort.direction);
  }

  // 4. Paginate
  const total = ranked.length;
  const safeLimit = Math.max(1, limit);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;
  const data = ranked.slice(offset, offset + safeLimit);

  return { data, total, page: safePage, limit: safeLimit };
}
