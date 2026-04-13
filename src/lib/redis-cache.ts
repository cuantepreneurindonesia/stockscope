// Redis caching helpers — reuse the shared ioredis singleton from redis.ts
// to avoid a second client connection.
import { getRedisClient } from './redis';

export async function getCachedData(key: string) {
  try {
    const client = getRedisClient();
    if (!client) return null;
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
}

export async function setCachedData(key: string, data: any, ttlSeconds: number = 60) {
  try {
    const client = getRedisClient();
    if (client) {
      const result = await client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
      if (result !== 'OK') {
        console.warn(`Redis setCachedData: unexpected result for key "${key}":`, result);
      }
    }
  } catch (err) {
    console.warn('Redis setCachedData error:', err);
  }
}
