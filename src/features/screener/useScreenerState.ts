"use client";

/**
 * useScreenerState
 *
 * Custom hook that manages the Screener V1 workspace state.
 *
 * Responsibilities:
 *  - Wraps `useReducer` with `screenerReducer`
 *  - Fetches paginated results from the Screener V1 API on every meaningful
 *    state change (filters, preset, sort, page)
 *  - Exposes stable dispatch helpers so consumers never import action creators
 *    directly
 */

import { useCallback, useEffect, useReducer, useState } from "react";

import { fetchScreenerResults } from "@/lib/api";
import type { Filter, ScreenPreset, ScreenerResponse } from "@/types/screener";

import {
  initialScreenerState,
  screenerReducer,
  type ScreenerState,
} from "./screenerSlice";

const LIMIT = 50;

// ---------------------------------------------------------------------------
// Return type
// ---------------------------------------------------------------------------

export interface UseScreenerStateReturn {
  // -- Derived UI state --
  state: ScreenerState;
  result: ScreenerResponse | null;
  loading: boolean;
  error: string | null;

  // -- Actions --
  setFilters: (filters: Filter[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (index: number) => void;
  setPreset: (preset: ScreenPreset | null) => void;
  setSort: (field: string, direction: "asc" | "desc") => void;
  setPage: (page: number) => void;
  toggleCharts: () => void;
  reset: () => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useScreenerState(): UseScreenerStateReturn {
  const [state, dispatch] = useReducer(screenerReducer, initialScreenerState);

  const [result, setResult] = useState<ScreenerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch whenever the query parameters change
  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchScreenerResults({
      filters: state.filters,
      presetId: state.activePreset?.id,
      sort: state.sortField
        ? { field: state.sortField, direction: state.sortDirection }
        : undefined,
      page: state.page,
      limit: LIMIT,
    })
      .then((res) => {
        if (!cancelled) setResult(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    state.filters,
    state.activePreset,
    state.sortField,
    state.sortDirection,
    state.page,
  ]);

  // Stable dispatch helpers
  const setFilters = useCallback(
    (filters: Filter[]) => dispatch({ type: "SET_FILTERS", payload: filters }),
    [],
  );

  const addFilter = useCallback(
    (filter: Filter) => dispatch({ type: "ADD_FILTER", payload: filter }),
    [],
  );

  const removeFilter = useCallback(
    (index: number) => dispatch({ type: "REMOVE_FILTER", payload: index }),
    [],
  );

  const setPreset = useCallback(
    (preset: ScreenPreset | null) =>
      dispatch({ type: "SET_PRESET", payload: preset }),
    [],
  );

  const setSort = useCallback(
    (field: string, direction: "asc" | "desc") =>
      dispatch({ type: "SET_SORT", payload: { field, direction } }),
    [],
  );

  const setPage = useCallback(
    (page: number) => dispatch({ type: "SET_PAGE", payload: page }),
    [],
  );

  const toggleCharts = useCallback(
    () => dispatch({ type: "TOGGLE_CHARTS" }),
    [],
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
    state,
    result,
    loading,
    error,
    setFilters,
    addFilter,
    removeFilter,
    setPreset,
    setSort,
    setPage,
    toggleCharts,
    reset,
  };
}
