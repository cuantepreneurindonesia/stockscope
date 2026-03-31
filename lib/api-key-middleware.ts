// API Key Validation Middleware
// Validates API keys, enforces rate limits, and tracks usage

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { checkRateLimit } from '@/lib/rate-limit';
import { getCachedApiKey, cacheValidatedApiKey } from '@/lib/rate-limit';
import { 
  getRequiredScope, 
  hasScope, 
  getScopeDescription,
  getUpgradeSuggestion,
} from '@/lib/api-scopes';

// =============================================================================
// TYPES
// =============================================================================

export interface ValidatedApiKey {
  id: string;
  userId: string;
  keyPrefix: string;
  scopes: string[];
  rateLimit: number;
  environment: string;
  ipWhitelist: string[];
}

export interface ApiUsageMetrics {
  apiKeyId: string;
  userId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  bytesTransferred: number;
}

// =============================================================================
// API KEY VALIDATION
// =============================================================================

/**
 * Validate API key from request header
 * Returns validated key record or null if invalid
 * 
 * Performance: Uses Redis cache (1-hour TTL) to avoid bcrypt O(n) bottleneck
 */
export async function validateApiKey(
  apiKey: string
): Promise<ValidatedApiKey | null> {
  try {
    // Check Redis cache first (FAST PATH: 1ms)
    const cached = await getCachedApiKey(apiKey);
    if (cached) {
      return cached;
    }

    // SLOW PATH: Query database and validate with bcrypt
    // This only happens on cache miss (once per hour per key)
    const allKeys = await prisma.apiKey.findMany({
      where: { isActive: true },
      select: {
        id: true,
        userId: true,
        keyHash: true,
        keyPrefix: true,
        scopes: true,
        rateLimit: true,
        environment: true,
        ipWhitelist: true,
      },
    });

    for (const keyRecord of allKeys) {
      const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash);
      if (isValid) {
        const validatedKey: ValidatedApiKey = {
          id: keyRecord.id,
          userId: keyRecord.userId,
          keyPrefix: keyRecord.keyPrefix,
          scopes: keyRecord.scopes,
          rateLimit: keyRecord.rateLimit,
          environment: keyRecord.environment,
          ipWhitelist: keyRecord.ipWhitelist,
        };

        // Cache validated key (1-hour TTL)
        await cacheValidatedApiKey(apiKey, validatedKey, 3600);

        return validatedKey;
      }
    }

    return null; // No matching key found
  } catch (error) {
    console.error('Error validating API key:', error);
    return null;
  }
}

/**
 * Check if client IP is whitelisted (if IP whitelist configured)
 */
export function checkIpWhitelist(
  req: NextRequest,
  ipWhitelist: string[]
): boolean {
  if (ipWhitelist.length === 0) return true; // No whitelist = allow all

  const clientIp =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  return ipWhitelist.includes(clientIp);
}

/**
 * Check if API key has required scope for endpoint
 */
export function checkScope(
  keyScopes: string[],
  endpoint: string,
  method: string
): { allowed: boolean; requiredScope: string | null; message?: string } {
  const requiredScope = getRequiredScope(endpoint, method);
  
  // No scope required (public endpoint or internal)
  if (!requiredScope) {
    return { allowed: true, requiredScope: null };
  }
  
  // Check if key has required scope
  const allowed = hasScope(keyScopes as any, requiredScope);
  
  if (!allowed) {
    const scopeDescription = getScopeDescription(requiredScope);
    return {
      allowed: false,
      requiredScope,
      message: `This endpoint requires the '${requiredScope}' scope (${scopeDescription})`,
    };
  }
  
  return { allowed: true, requiredScope };
}

// =============================================================================
// USAGE TRACKING
// =============================================================================

/**
 * Track API usage metrics (in-memory buffer, flushed hourly)
 * This increments counters that will be aggregated by cron job
 */
export async function trackApiUsage(metrics: ApiUsageMetrics): Promise<void> {
  try {
    // Update lastUsedAt and totalRequests on API key
    await prisma.apiKey.update({
      where: { id: metrics.apiKeyId },
      data: {
        lastUsedAt: new Date(),
        totalRequests: { increment: 1 },
      },
    });

    // Store raw metrics for hourly aggregation
    // Note: This creates individual records that will be aggregated by cron
    // In production, consider buffering in Redis and batch-inserting
    const hour = new Date();
    hour.setMinutes(0, 0, 0); // Round down to hour start

    const isSuccess = metrics.statusCode >= 200 && metrics.statusCode < 300;
    const isClientError = metrics.statusCode >= 400 && metrics.statusCode < 500;
    const isServerError = metrics.statusCode >= 500;

    // Upsert hourly aggregate (increment counters)
    await prisma.apiUsageHourly.upsert({
      where: {
        hour_apiKeyId_endpoint_method: {
          hour,
          apiKeyId: metrics.apiKeyId,
          endpoint: metrics.endpoint,
          method: metrics.method,
        },
      },
      create: {
        hour,
        apiKeyId: metrics.apiKeyId,
        userId: metrics.userId,
        endpoint: metrics.endpoint,
        method: metrics.method,
        requestCount: 1,
        successCount: isSuccess ? 1 : 0,
        errorCount: isSuccess ? 0 : 1,
        error4xxCount: isClientError ? 1 : 0,
        error5xxCount: isServerError ? 1 : 0,
        avgResponseTime: metrics.responseTime,
        bytesTransferred: metrics.bytesTransferred,
      },
      update: {
        requestCount: { increment: 1 },
        successCount: { increment: isSuccess ? 1 : 0 },
        errorCount: { increment: isSuccess ? 0 : 1 },
        error4xxCount: { increment: isClientError ? 1 : 0 },
        error5xxCount: { increment: isServerError ? 1 : 0 },
        // Running average for response time
        avgResponseTime: {
          // Will be recalculated properly in aggregation job
          increment: metrics.responseTime / 1000, // Rough estimate
        },
        bytesTransferred: { increment: metrics.bytesTransferred },
      },
    });
  } catch (error) {
    console.error('Error tracking API usage:', error);
    // Non-blocking: Don't fail request if metrics fail
  }
}

// =============================================================================
// MIDDLEWARE (Applied to /api/v1/*)
// =============================================================================

export async function apiKeyMiddleware(req: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();

  // Extract API key from header
  const apiKey = req.headers.get('x-api-key') || req.headers.get('authorization')?.replace('Bearer ', '');

  if (!apiKey) {
    return NextResponse.json(
      { 
        error: 'Missing API key',
        message: 'Provide API key via X-API-Key header or Authorization: Bearer <key>'
      },
      { status: 401 }
    );
  }

  // Validate API key
  const validatedKey = await validateApiKey(apiKey);
  
  if (!validatedKey) {
    return NextResponse.json(
      { 
        error: 'Invalid API key',
        message: 'The provided API key is invalid or has been revoked'
      },
      { status: 401 }
    );
  }

  // Check IP whitelist (if configured)
  if (!checkIpWhitelist(req, validatedKey.ipWhitelist)) {
    return NextResponse.json(
      { 
        error: 'IP not whitelisted',
        message: 'Your IP address is not authorized to use this API key'
      },
      { status: 403 }
    );
  }

  // Check rate limit (Redis sliding window)
  const rateLimit = await checkRateLimit(
    validatedKey.id,
    validatedKey.rateLimit,
    3600 // 1 hour window
  );

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { 
        error: 'Rate limit exceeded',
        message: `You have exceeded your rate limit of ${rateLimit.limit} requests per hour`,
        limit: rateLimit.limit,
        remaining: 0,
        reset: rateLimit.reset,
        retryAfter: rateLimit.retryAfter,
      },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimit.limit.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': rateLimit.reset.toString(),
          'Retry-After': rateLimit.retryAfter?.toString() || '3600',
        },
      }
    );
  }

  // Check scopes (scope-based authorization)
  const scopeCheck = checkScope(
    validatedKey.scopes,
    req.nextUrl.pathname,
    req.method
  );
  
  if (!scopeCheck.allowed) {
    // Get upgrade suggestion
    const user = await prisma.user.findUnique({
      where: { id: validatedKey.userId },
      select: { plan: true },
    });
    
    const upgrade = user && scopeCheck.requiredScope
      ? getUpgradeSuggestion(user.plan, scopeCheck.requiredScope as any)
      : null;
    
    return NextResponse.json(
      { 
        error: 'Insufficient permissions',
        message: scopeCheck.message,
        requiredScope: scopeCheck.requiredScope,
        yourScopes: validatedKey.scopes,
        upgrade: upgrade ? {
          message: `Upgrade to ${upgrade.suggestedPlan} plan to access this endpoint`,
          suggestedPlan: upgrade.suggestedPlan,
          benefits: upgrade.benefits,
        } : undefined,
      },
      { status: 403 }
    );
  }

  // Proceed with request
  const response = NextResponse.next();

  // Attach API key info to request headers (for downstream use)
  response.headers.set('X-API-Key-Id', validatedKey.id);
  response.headers.set('X-API-User-Id', validatedKey.userId);

  // Attach rate limit headers to response
  response.headers.set('X-RateLimit-Limit', rateLimit.limit.toString());
  response.headers.set('X-RateLimit-Remaining', rateLimit.remaining.toString());
  response.headers.set('X-RateLimit-Reset', rateLimit.reset.toString());

  // Track usage metrics (async, non-blocking)
  const responseTime = Date.now() - startTime;
  const endpoint = req.nextUrl.pathname;
  const method = req.method;

  // Schedule usage tracking (don't await)
  trackApiUsage({
    apiKeyId: validatedKey.id,
    userId: validatedKey.userId,
    endpoint,
    method,
    statusCode: response.status,
    responseTime,
    bytesTransferred: 0, // Will be calculated from response body
  }).catch(err => console.error('Usage tracking failed:', err));

  return response;
}
