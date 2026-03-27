import { NextResponse } from "next/server";

export async function GET() {
  // In production, fetch from database
  const sectors = [
    "All",
    "Finance",
    "Infrastructure",
    "Miscellaneous Industry",
    "Consumer Goods",
    "Mining",
    "Trade & Services",
    "Property & Real Estate",
    "Basic Industry",
    "Agriculture",
  ].sort();

  return NextResponse.json({ sectors });
}
