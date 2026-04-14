import { NextResponse } from "next/server";

import { getDB } from "@/lib/mongodb";

export const revalidate = 300; // cache for 5 minutes

export async function GET() {
  try {
    const database = await getDB();

    const [advancing, declining, totalResult, marketCapResult] = await Promise.all([
      database.collection("stocks").countDocuments({ changePercent: { $gt: 0 } }),
      database.collection("stocks").countDocuments({ changePercent: { $lt: 0 } }),
      database.collection("stocks").countDocuments({}),
      database
        .collection("stocks")
        .aggregate([
          { $group: { _id: null, total: { $sum: "$marketCap" } } },
        ])
        .toArray(),
    ]);

    const totalMarketCapBillions = marketCapResult[0]?.total
      ? marketCapResult[0].total / 1_000_000_000_000
      : null;

    return NextResponse.json({
      success: true,
      advancing,
      declining,
      total: totalResult,
      marketCap: totalMarketCapBillions
        ? `Rp ${totalMarketCapBillions.toFixed(1)}T`
        : null,
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
