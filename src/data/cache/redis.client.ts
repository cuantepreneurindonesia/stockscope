/**
 * Shared Redis client for the Screener V1 data layer.
 *
 * Re-uses the existing singleton from @/lib/redis so only one
 * ioredis connection is maintained per server process.
 */
export { getRedisClient, closeRedis } from "@/lib/redis";

/**
 * Screener-specific cache key prefix.
 */
export const SCREENER_CACHE_PREFIX = "screener-v1:";

/**
 * Default TTL for screener dataset snapshots (5 minutes).
 */
export const SCREENER_CACHE_TTL = 300;
