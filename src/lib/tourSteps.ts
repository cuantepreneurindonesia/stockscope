export type TourStepId =
  | "kpiCards"
  | "tabOverview"
  | "tabScreener"
  | "search"
  | "presets";

export interface TourStepDef {
  id: TourStepId;
  selector: string;
}

/**
 * Utility: TOUR_STEP_DEFS
 */
export const TOUR_STEP_DEFS: TourStepDef[] = [
  {
    id: "kpiCards",
    selector: "[data-tour='kpi-cards']",
  },
  {
    id: "tabOverview",
    selector: "[data-tour='tab-overview']",
  },
  {
    id: "tabScreener",
    selector: "[data-tour='tab-screener']",
  },
  {
    id: "search",
    selector: "[data-tour='search']",
  },
  {
    id: "presets",
    selector: "[data-tour='presets']",
  },
];
