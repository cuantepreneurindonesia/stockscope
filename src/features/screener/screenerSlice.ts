/**
 * Screener state slice
 *
 * A pure reducer that manages all UI state for the Screener V1 workspace.
 * No external state library is required – consumers should use this with
 * React's `useReducer`.
 */

import type { Filter, ScreenPreset } from "@/types/screener";

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export interface ScreenerState {
  filters: Filter[];
  activePreset: ScreenPreset | null;
  sortField: string | undefined;
  sortDirection: "asc" | "desc";
  page: number;
  showCharts: boolean;
}

export const initialScreenerState: ScreenerState = {
  filters: [],
  activePreset: null,
  sortField: undefined,
  sortDirection: "desc",
  page: 1,
  showCharts: false,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type ScreenerAction =
  | { type: "SET_FILTERS"; payload: Filter[] }
  | { type: "ADD_FILTER"; payload: Filter }
  | { type: "REMOVE_FILTER"; payload: number }
  | { type: "SET_PRESET"; payload: ScreenPreset | null }
  | { type: "SET_SORT"; payload: { field: string; direction: "asc" | "desc" } }
  | { type: "SET_PAGE"; payload: number }
  | { type: "TOGGLE_CHARTS" }
  | { type: "RESET" };

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function screenerReducer(
  state: ScreenerState,
  action: ScreenerAction,
): ScreenerState {
  switch (action.type) {
    case "SET_FILTERS":
      return { ...state, filters: action.payload, page: 1 };

    case "ADD_FILTER":
      return { ...state, filters: [...state.filters, action.payload], page: 1 };

    case "REMOVE_FILTER":
      return {
        ...state,
        filters: state.filters.filter((_, i) => i !== action.payload),
        page: 1,
      };

    case "SET_PRESET":
      return { ...state, activePreset: action.payload, page: 1 };

    case "SET_SORT":
      return {
        ...state,
        sortField: action.payload.field,
        sortDirection: action.payload.direction,
        page: 1,
      };

    case "SET_PAGE":
      return { ...state, page: action.payload };

    case "TOGGLE_CHARTS":
      return { ...state, showCharts: !state.showCharts };

    case "RESET":
      return initialScreenerState;

    default:
      return state;
  }
}
