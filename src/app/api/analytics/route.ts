/**
 * GET /api/analytics
 * Get aggregated analytics and statistics
 * Separation of Concerns: API layer handles HTTP, service layer handles calculations
 */
import { NextRequest, NextResponse } from "next/server";

import { calculateAnalytics } from "@/lib/services/analyticsService";
import { filterStocks } from "@/lib/services/dataTransformService";
import { fetchAllStocks } from "@/lib/services/stockService";

import type {
  AnalyticsStats,
  ApiResponse,
  OwnerType,
  StockFilter,
} from "@/types";

const OWNER_TYPES: OwnerType[] = [
  "ID",
  "CP",
  "IB",
  "IS",
  "SC",
  "PF",
  "MF",
  "YD",
  "GY",
  "BK",
  "OT",
];

function parseOwnerTypeParam(value: string | null): OwnerType | undefined {
  if (!value) return undefined;
  return OWNER_TYPES.includes(value as OwnerType)
    ? (value as OwnerType)
    : undefined;
}

type AnalyticsResponse = ApiResponse<AnalyticsStats>;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<AnalyticsResponse>> {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters with type safety
    const tier = searchParams.get("tier");
    const hierarchyLevel = searchParams.get("hierarchyLevel");
    const flag = searchParams.get("flag");
    const ownerType = searchParams.get("ownerType");

    // Fetch all stocks for analysis
    const allStocks = await fetchAllStocks();

    // Build filter object
    const filter: StockFilter = {};
    if (tier === "Red" || tier === "Amber" || tier === "Green") {
      filter.tier = tier;
    }
    if (hierarchyLevel) {
      filter.hierarchyLevel = hierarchyLevel;
    }
    if (flag) {
      filter.flag = flag;
    }
    const parsedOwnerType = parseOwnerTypeParam(ownerType);
    if (parsedOwnerType) {
      filter.ownerType = parsedOwnerType;
    }

    // Apply filters
    const filteredStocks = filterStocks(allStocks, filter);

    // Calculate analytics
    const stats = calculateAnalytics(filteredStocks);

    return NextResponse.json<AnalyticsResponse>({
      success: true,
      data: stats,
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch analytics";

    return NextResponse.json<AnalyticsResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
