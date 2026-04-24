import { getDB } from "@/lib/mongodb";
import { getRedisClient } from "@/lib/redis";
import { adaptIdxStocks } from "@/data/adapters/idx.adapter";
import { SCREENER_CACHE_TTL } from "@/data/cache/redis.client";
import type { ScreenerDataset } from "@/types/screener";

const CACHE_KEY = "screener-v1:dataset";

/**
 * Fetch the full screener dataset (Stock + Metrics).
 *
 * Tries Redis first. On cache miss, fetches from MongoDB and re-primes the
 * cache for subsequent calls.
 *
 * @returns Combined StockV1 & Metrics dataset ready for the engine
 */
export async function getScreenerDataset(): Promise<ScreenerDataset> {
  // 1. Try Redis cache
  const redis = getRedisClient();
  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as ScreenerDataset;
      }
    } catch {
      // Cache miss or error – proceed to DB
    }
  }

  // 2. Fetch from MongoDB
  const db = await getDB();
  const docs = await db
    .collection("stocks")
    .find(
      {},
      {
        projection: {
          code: 1,
          issuer: 1,
          sector: 1,
          industry: 1,
          pe: 1,
          pb: 1,
          roe: 1,
          revenueGrowth: 1,
          netMargin: 1,
          debtToEquity: 1,
        },
      },
    )
    .limit(10_000)
    .toArray();

  const dataset = adaptIdxStocks(docs as Parameters<typeof adaptIdxStocks>[0]);

  // 3. Prime Redis cache
  if (redis) {
    try {
      await redis.set(CACHE_KEY, JSON.stringify(dataset), "EX", SCREENER_CACHE_TTL);
    } catch {
      // Cache write failure is non-fatal
    }
  }

  return dataset;
}
