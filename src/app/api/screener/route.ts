import { NextRequest, NextResponse } from "next/server";

import { enrichStocks } from "@/lib/services/enrichmentService";
import { fetchAllStocks } from "@/lib/services/stockService";

import type { EnrichedStock } from "@/types/unified";

type ScreenerSortKey = "composite" | "pe" | "change" | "dividendYield" | "roe";

const SCREENER_SORT_KEYS: ScreenerSortKey[] = [
  "composite",
  "pe",
  "change",
  "dividendYield",
  "roe",
];

function parseScreenerSort(raw: string | null): ScreenerSortKey {
  const fallback: ScreenerSortKey = "composite";
  if (!raw) return fallback;
  return SCREENER_SORT_KEYS.includes(raw as ScreenerSortKey)
    ? (raw as ScreenerSortKey)
    : fallback;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters (supporting both old and new param names for compatibility)
    const sector = searchParams.get("sector");
    const aiTier = searchParams.get("tier")
      ? parseInt(searchParams.get("tier")!)
      : null;
    const minScore = searchParams.get("minScore")
      ? parseInt(searchParams.get("minScore")!)
      : null;
    const maxScore = searchParams.get("maxScore")
      ? parseInt(searchParams.get("maxScore")!)
      : null;
    const sortBy = parseScreenerSort(searchParams.get("sortBy"));
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";
    const q = searchParams.get("q");

    // 1. Fetch governance data from MongoDB
    let stocks = await fetchAllStocks(10000);

    // 2. Apply governance filters (only text search in legacy endpoint)
    if (q) {
      stocks = stocks.filter(
        (s) =>
          s.code.toLowerCase().includes(q.toLowerCase()) ||
          s.issuer.toLowerCase().includes(q.toLowerCase()),
      );
    }

    // 3. Enrich with market data and AI scores
    let enriched = enrichStocks(stocks);

    // 4. Apply post-enrichment filters
    if (sector && sector !== "All") {
      enriched = enriched.filter((s) => s.sector === sector);
    }

    if (aiTier) {
      enriched = enriched.filter((s) => s.aiTier?.level === aiTier);
    }

    if (minScore !== null) {
      enriched = enriched.filter(
        (s) => s.scores && s.scores.composite >= minScore,
      );
    }

    if (maxScore !== null) {
      enriched = enriched.filter(
        (s) => s.scores && s.scores.composite <= maxScore,
      );
    }

    // 5. Sort
    const sortOrder = order === "asc" ? 1 : -1;
    enriched.sort((a: EnrichedStock, b: EnrichedStock) => {
      let aVal: number;
      let bVal: number;

      switch (sortBy) {
        case "composite":
          aVal = a.scores?.composite ?? -Infinity;
          bVal = b.scores?.composite ?? -Infinity;
          break;
        case "pe":
          aVal = a.pe ?? Infinity;
          bVal = b.pe ?? Infinity;
          break;
        case "change":
          aVal = a.change ?? -Infinity;
          bVal = b.change ?? -Infinity;
          break;
        case "dividendYield":
          aVal = a.dividendYield ?? -Infinity;
          bVal = b.dividendYield ?? -Infinity;
          break;
        case "roe":
          aVal = a.roe ?? -Infinity;
          bVal = b.roe ?? -Infinity;
          break;
      }

      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // Format response (legacy format for backward compatibility)
    const data = enriched.map((s) => ({
      ticker: s.code,
      name: s.issuer,
      sector: s.sector,
      price: s.price,
      change: s.change,
      volume: s.volume,
      marketCap: s.marketCap,
      pe: s.pe,
      pb: s.pb,
      roe: s.roe,
      dividendYield: s.dividendYield,
      scores: s.scores
        ? {
            composite: s.scores.composite,
            fundamental: s.scores.fundamental,
            technical: s.scores.technical,
            sentiment: s.scores.sentiment,
            liquidity: s.scores.liquidity,
          }
        : {
            composite: 0,
            fundamental: 0,
            technical: 0,
            sentiment: 0,
            liquidity: 0,
          },
      tier: s.aiTier || {
        level: 5,
        label: "N/A",
        color: "#999",
        bg: "rgba(153,153,153,0.12)",
      },
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: data.length,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
