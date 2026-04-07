import { redisClient } from './redis';

/**
 * Validates whether the user has exceeded their daily alert creation limit.
 * Free tier users: 3 alerts/day. Premium users: unlimited.
 * 
 * @param userId - ID of the user creating the alert
 * @param plan - Subscription plan ('free' or 'premium')
 * @returns boolean indication if the creation is allowed
 */
export async function checkAlertRateLimit(userId: string, plan: string): Promise<boolean> {
  // Premium users have unlimited alerts
  if (plan === 'premium' || plan === 'pro') return true;

  // Fallback to true if Redis isn't configured in this env
  if (!redisClient) return true;

  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const redisKey = `alerts:creation:${userId}:${dateStr}`;

  try {
    const currentCountStr = await redisClient.get(redisKey);
    let count = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    if (count >= 3) {
      return false; // Limit exceeded
    }

    // Increment count
    await redisClient.incr(redisKey);
    
    // Set expiry if it's the first time
    if (count === 0) {
      await redisClient.expire(redisKey, 86400); // 24 hours
    }

    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open in case of Redis errors rather than blocking the user entirely
    return true;
  }
}
