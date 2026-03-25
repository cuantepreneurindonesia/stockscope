import { NextRequest, NextResponse } from 'next/server';
// Premium free-tier cap (uncomment to restore):
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth/config';
import { fetchAllStocks } from '@/lib/services/stockService';
import { filterStocks } from '@/lib/services/dataTransformService';
import { enrichStocks } from '@/lib/services/enrichmentService';
// import { FREE_LIMIT } from '@/lib/auth/constants';
import type { StockFilter } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    // const session = await getServerSession(authOptions);
    // const isPaidTier = session?.user?.plan === 'premium';

    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const tier = searchParams.get('tier') as 'Red' | 'Amber' | 'Green' | null;
    const hierarchyLevel = searchParams.get('hierarchyLevel') as 'Low' | 'Moderate' | 'High' | null;
    const flag = searchParams.get('flag');
    const search = searchParams.get('search');
    const sector = searchParams.get('sector');
    const aiTier = searchParams.get('aiTier') ? parseInt(searchParams.get('aiTier')!) : null;
    const minScore = searchParams.get('minScore') ? parseInt(searchParams.get('minScore')!) : null;
    const maxScore = searchParams.get('maxScore') ? parseInt(searchParams.get('maxScore')!) : null;
    const sortBy = searchParams.get('sortBy') || 'code';
    const order = (searchParams.get('order') || 'asc') as 'asc' | 'desc';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : 0;

    // if (!isPaidTier) {
    //   limit = Math.min(limit, FREE_LIMIT);
    // }

    // 1. Fetch governance data from MongoDB
    let stocks = await fetchAllStocks(10000);

    // 2. Apply governance filters
    const govFilters: StockFilter = {};
    if (tier) govFilters.tier = tier;
    if (hierarchyLevel) govFilters.hierarchyLevel = hierarchyLevel;
    if (flag) govFilters.flag = flag;
    if (search) govFilters.searchText = search;

    stocks = filterStocks(stocks, govFilters);

    // 3. Enrich with market data and AI scores
    let enriched = enrichStocks(stocks);

    // 4. Apply post-enrichment filters
    if (sector) {
      enriched = enriched.filter(s => s.sector === sector);
    }

    if (aiTier) {
      enriched = enriched.filter(s => s.aiTier?.level === aiTier);
    }

    if (minScore !== null) {
      enriched = enriched.filter(s => s.scores && s.scores.composite >= minScore);
    }

    if (maxScore !== null) {
      enriched = enriched.filter(s => s.scores && s.scores.composite <= maxScore);
    }

    // 5. Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    enriched.sort((a, b) => {
      let aVal: number | null | undefined;
      let bVal: number | null | undefined;

      // Governance fields
      if (sortBy === 'code') {
        return a.code.localeCompare(b.code) * sortOrder;
      }
      if (sortBy === 'hhi') {
        aVal = a.hhi ?? Infinity;
        bVal = b.hhi ?? Infinity;
      } else if (sortBy === 'floatPercentage') {
        aVal = a.floatPercentage ?? Infinity;
        bVal = b.floatPercentage ?? Infinity;
      } else if (sortBy === 'c1') {
        aVal = a.c1 ?? Infinity;
        bVal = b.c1 ?? Infinity;
      } else if (sortBy === 'c3') {
        aVal = a.c3 ?? Infinity;
        bVal = b.c3 ?? Infinity;
      }
      // Market/score fields
      else if (sortBy === 'composite') {
        aVal = a.scores?.composite ?? -Infinity;
        bVal = b.scores?.composite ?? -Infinity;
      } else if (sortBy === 'pe') {
        aVal = a.pe ?? Infinity;
        bVal = b.pe ?? Infinity;
      } else if (sortBy === 'roe') {
        aVal = a.roe ?? Infinity;
        bVal = b.roe ?? Infinity;
      } else if (sortBy === 'price') {
        aVal = a.price ?? -Infinity;
        bVal = b.price ?? -Infinity;
      } else if (sortBy === 'change') {
        aVal = a.change ?? -Infinity;
        bVal = b.change ?? -Infinity;
      } else if (sortBy === 'dividendYield') {
        aVal = a.dividendYield ?? -Infinity;
        bVal = b.dividendYield ?? -Infinity;
      } else {
        return 0;
      }

      if (aVal < bVal) return -1 * sortOrder;
      if (aVal > bVal) return 1 * sortOrder;
      return 0;
    });

    // 6. Paginate
    const total = enriched.length;
    const paginatedData = enriched.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedData,
      total,
      limit,
      skip,
    });
  } catch (error) {
    console.error('Error in /api/stocks/enriched:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch enriched stocks' },
      { status: 500 }
    );
  }
}
