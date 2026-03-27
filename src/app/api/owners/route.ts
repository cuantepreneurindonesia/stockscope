/**
 * GET /api/owners
 * Get top owners by holdings
 */
import { NextRequest, NextResponse } from "next/server";

// Premium free-tier cap (uncomment to restore):
// import { getServerSession } from 'next-auth';
import { ownerQueries } from "@/lib/mongodb";

// import { authOptions } from '@/lib/auth/config';
// import { FREE_LIMIT } from '@/lib/auth/constants';
import type { ApiResponse, TopOwner } from "@/types";

type OwnersResponse = ApiResponse<TopOwner[]>;

export async function GET(
  request: NextRequest,
): Promise<NextResponse<OwnersResponse>> {
  try {
    // const session = await getServerSession(authOptions);
    // const plan = (session?.user as { plan?: 'free' | 'premium' })?.plan ?? 'free';

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "100", 10),
      1000,
    );
    // if (plan === 'free') {
    //   limit = Math.min(limit, FREE_LIMIT);
    // }
    const detailed = searchParams.get("detailed") === "true";

    // Fetch top owners (with or without portfolio)
    const owners = detailed
      ? await ownerQueries.getTopWithPortfolio(limit)
      : await ownerQueries.getTop(limit);

    return NextResponse.json<OwnersResponse>({
      success: true,
      data: owners as TopOwner[],
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch owners";

    return NextResponse.json<OwnersResponse>(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
