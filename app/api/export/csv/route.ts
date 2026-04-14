import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth/config";
import { getDB } from "@/lib/mongodb";
import { enrichStocks } from "@/lib/services/enrichmentService";
import type { Stock } from "@/types";

/**
 * GET /api/export/csv
 * Export screener results as CSV. Requires Premium or Pro plan.
 * Accepts the same filter params as /api/screen: sector, search, minPrice, maxPrice, sortBy, sortOrder
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const plan = (session.user as { plan?: string }).plan ?? "free";
    if (plan === "free") {
      return NextResponse.json(
        { error: "CSV export requires a Premium or Pro plan." },
        { status: 402 },
      );
    }

    const { searchParams } = request.nextUrl;
    const sector = searchParams.get("sector");
    const search = searchParams.get("search")?.trim() || "";
    const rawMinPrice = searchParams.get("minPrice");
    const rawMaxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "lastPrice";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;

    const minPrice = rawMinPrice !== null ? Number(rawMinPrice) : NaN;
    const maxPrice = rawMaxPrice !== null ? Number(rawMaxPrice) : NaN;

    const matchStage: Record<string, any> = {};

    if (sector && sector !== "All") {
      if (sector === "Finance") {
        matchStage.hierarchyLevel = "High";
      } else if (sector === "Infrastructure") {
        matchStage.hierarchyLevel = "Moderate";
      } else if (sector === "Miscellaneous Industry") {
        matchStage.hierarchyLevel = "Low";
      } else {
        matchStage.sector = sector;
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
    const rawData = await database
      .collection<Stock>("stocks")
      .find(matchStage)
      .sort({ [dbSortField]: sortOrder })
      .limit(plan === "pro" ? 5000 : 1000)
      .toArray();

    const enriched = enrichStocks(rawData);

    // Build CSV
    const headers = [
      "Code",
      "Issuer",
      "Sector",
      "Price",
      "Change%",
      "Volume",
      "Market Cap",
      "P/E",
      "P/B",
      "ROE%",
      "Dividend Yield%",
      "Composite Score",
      "Tier",
    ];

    const rows = enriched.map((s) => [
      s.code ?? "",
      `"${(s.issuer ?? "").replace(/"/g, '""')}"`,
      `"${(s.sector ?? "").replace(/"/g, '""')}"`,
      s.price ?? "",
      s.change ?? "",
      s.volume ?? "",
      s.marketCap ?? "",
      s.pe ?? "",
      s.pb ?? "",
      s.roe ?? "",
      s.dividendYield ?? "",
      s.scores?.composite ?? "",
      s.tier ?? "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const filename = `stockscope-export-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
