/**
 * Screener V1 API Route
 *
 * Wraps the core screener engine without modifying the existing
 * /api/screener or /api/stocks/enriched contracts.
 *
 * POST /api/screener-v1
 * Body: ScreenerRequest (JSON)
 *
 * GET  /api/screener-v1
 * Query params: page, limit, presetId, sort, sortDir
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { runScreener } from "@/core/screener/engine";
import { getScreenerDataset } from "@/data/repositories/screener.repository";
import type { ScreenerRequest } from "@/types/screener";

// ---------------------------------------------------------------------------
// Zod validation schema
// ---------------------------------------------------------------------------

const filterSchema = z.object({
  field: z.enum([
    "pe",
    "pbv",
    "roe",
    "revenueGrowth",
    "netMargin",
    "debtToEquity",
  ]),
  operator: z.enum([">", "<", ">=", "<=", "="]),
  value: z.number(),
});

const screenerRequestSchema = z.object({
  filters: z.array(filterSchema).default([]),
  presetId: z.string().optional(),
  sort: z
    .object({
      field: z.string(),
      direction: z.enum(["asc", "desc"]),
    })
    .optional(),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(200).default(50),
});

// ---------------------------------------------------------------------------
// POST handler – full request body
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  try {
    const body: unknown = await req.json();
    const parsed = screenerRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const request: ScreenerRequest = parsed.data;
    const dataset = await getScreenerDataset();
    const result = runScreener(dataset, request);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// GET handler – query-string convenience wrapper
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;

    const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);
    const limit = Math.min(
      200,
      Math.max(1, parseInt(params.get("limit") ?? "50", 10) || 50),
    );
    const presetId = params.get("presetId") ?? undefined;
    const sortField = params.get("sort") ?? undefined;
    const sortDir =
      params.get("sortDir") === "asc"
        ? ("asc" as const)
        : ("desc" as const);

    const request: ScreenerRequest = {
      filters: [],
      presetId,
      sort: sortField ? { field: sortField, direction: sortDir } : undefined,
      page,
      limit,
    };

    const dataset = await getScreenerDataset();
    const result = runScreener(dataset, request);

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
