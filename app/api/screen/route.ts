import { NextRequest, NextResponse } from "next/server";

import { getDB } from "@/lib/mongodb";
import { enrichStocks } from "@/lib/services/enrichmentService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Validate and clamp page to be >= 1
    const rawPage = parseInt(searchParams.get("page") || "1", 10);
    const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
    const limit = 50;
    const skip = (page - 1) * limit;

    const sector = searchParams.get("sector");
    const rawMinPrice = searchParams.get("minPrice");
    const rawMaxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search")?.trim() || "";
    const sortBy = searchParams.get("sortBy") || "lastPrice";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    // Only use price filter values when they are finite numbers
    const minPrice = rawMinPrice !== null ? Number(rawMinPrice) : NaN;
    const maxPrice = rawMaxPrice !== null ? Number(rawMaxPrice) : NaN;

    const matchStage: Record<string, any> = {};

    // Reverse mapping from Sector to DB stored format (hierarchyLevel)
    if (sector && sector !== "All") {
      if (sector === "Finance") {
        matchStage.hierarchyLevel = "High";
      } else if (sector === "Infrastructure") {
        matchStage.hierarchyLevel = "Moderate";
      } else if (sector === "Miscellaneous Industry") {
        matchStage.hierarchyLevel = "Low";
      } else {
        matchStage.sector = sector; // fallback
      }
    }

    if (!Number.isNaN(minPrice) || !Number.isNaN(maxPrice)) {
      matchStage.lastPrice = {};
      if (!Number.isNaN(minPrice) && Number.isFinite(minPrice)) matchStage.lastPrice.$gte = minPrice;
      if (!Number.isNaN(maxPrice) && Number.isFinite(maxPrice)) matchStage.lastPrice.$lte = maxPrice;
    }

    if (search) {
      const regex = { $regex: search, $options: "i" };
      matchStage.$or = [{ code: regex }, { issuer: regex }];
    }

    // Map UI sort field names to DB field names
    const sortFieldMap: Record<string, string> = {
      composite: "scores.composite",
      fundamental: "scores.fundamental",
      technical: "scores.technical",
      price: "lastPrice",
      change: "changePercent",
      volume: "volume",
      marketCap: "marketCap",
      pe: "pe",
      pb: "pb",
      roe: "roe",
    };
    const dbSortField = sortFieldMap[sortBy] ?? "lastPrice";

    const database = await getDB();

    // Aggregation pipeline to do filtering, count total, and paginate inside the DB
    const pipeline = [
      { $match: matchStage },
      { $sort: { [dbSortField]: sortOrder } },
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await database
      .collection("stocks")
      .aggregate(pipeline)
      .toArray();

    const metadata = result[0]?.metadata[0] || { total: 0 };
    const rawData = result[0]?.data || [];

    // Format like the original screener but we only map what's fetched this page!
    const enriched = enrichStocks(rawData);

    const data = enriched.map((s) => ({
      code: s.code,
      issuer: s.issuer,
      sector: s.sector,
      price: s.price,
      change: s.change,
      volume: s.volume,
      marketCap: s.marketCap,
      pe: s.pe,
      pb: s.pb,
      roe: s.roe,
      dividendYield: s.dividendYield,
      // Governance tier string ("Red" | "Amber" | "Green") — kept separate from aiTier
      tier: s.tier,
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
      // AI rating tier (distinct from governance tier)
      aiTier: s.aiTier || {
        level: 5,
        label: "N/A",
        color: "#999",
        bg: "rgba(153,153,153,0.12)",
      },
    }));

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      total: metadata.total,
      page,
      limit,
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
