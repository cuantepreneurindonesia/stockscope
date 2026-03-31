import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { invalidateCachedApiKey } from '@/lib/rate-limit';
import { getPlanScopes, getPlanRateLimit } from '@/lib/api-scopes';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Generate a secure API key
 * Format: sk_live_<32 random chars> or sk_test_<32 random chars>
 */
function generateApiKey(environment: 'production' | 'development'): string {
  const prefix = environment === 'production' ? 'sk_live_' : 'sk_test_';
  const randomPart = crypto.randomBytes(24).toString('base64url'); // URL-safe base64
  return prefix + randomPart;
}

/**
 * Get key prefix for display (first 12 chars)
 * Example: sk_live_abcd
 */
function getKeyPrefix(fullKey: string): string {
  return fullKey.substring(0, 12);
}

/**
 * Get default rate limit based on user plan
 */
function getDefaultRateLimit(plan: string): number {
  return getPlanRateLimit(plan);
}

/**
 * Get default scopes based on user plan
 */
function getDefaultScopes(plan: string): string[] {
  return getPlanScopes(plan);
}

// =============================================================================
// POST /api/v1/api-keys - Create API Key
// =============================================================================

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const {
      name,
      environment = 'production',
      scopes,
      rateLimit,
      ipWhitelist = [],
    } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'API key name is required' },
        { status: 400 }
      );
    }

    if (environment !== 'production' && environment !== 'development') {
      return NextResponse.json(
        { error: 'Environment must be "production" or "development"' },
        { status: 400 }
      );
    }

    // Check if user already has too many keys (limit: 10)
    const existingKeysCount = await prisma.apiKey.count({
      where: { userId: user.id },
    });

    if (existingKeysCount >= 10) {
      return NextResponse.json(
        { error: 'Maximum 10 API keys per user. Please delete unused keys.' },
        { status: 400 }
      );
    }

    // Generate API key
    const fullKey = generateApiKey(environment);
    const keyPrefix = getKeyPrefix(fullKey);
    const keyHash = await bcrypt.hash(fullKey, 12); // Secure hashing

    // Use provided or default values
    const finalScopes = scopes || getDefaultScopes(user.plan);
    const finalRateLimit = rateLimit || getDefaultRateLimit(user.plan);

    // Create API key record
    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        keyHash,
        keyPrefix,
        name: name.trim(),
        scopes: finalScopes,
        rateLimit: finalRateLimit,
        environment,
        ipWhitelist,
        isActive: true,
        totalRequests: 0,
      },
    });

    // Track analytics event
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventName: 'API Key Created',
          timestamp: new Date(),
          sessionId: crypto.randomUUID(),
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            apiKeyId: apiKey.id,
            environment,
            scopes: finalScopes,
            rateLimit: finalRateLimit,
          },
        },
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
      // Non-blocking error
    }

    // Return API key ONLY ONCE (never shown again)
    return NextResponse.json({
      success: true,
      message: 'API key created successfully. Save it now - it will not be shown again.',
      apiKey: {
        id: apiKey.id,
        key: fullKey, // ⚠️ ONLY TIME THIS IS RETURNED
        keyPrefix,
        name: apiKey.name,
        scopes: apiKey.scopes,
        rateLimit: apiKey.rateLimit,
        environment: apiKey.environment,
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/v1/api-keys - List User's API Keys
// =============================================================================

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Query parameters
    const { searchParams } = new URL(req.url);
    const includeInactive = searchParams.get('includeInactive') === 'true';

    // Build query
    const where: any = { userId: user.id };
    if (!includeInactive) {
      where.isActive = true;
    }

    // Fetch API keys (NEVER include keyHash in response)
    const apiKeys = await prisma.apiKey.findMany({
      where,
      select: {
        id: true,
        keyPrefix: true, // Only prefix (sk_live_abcd)
        name: true,
        scopes: true,
        rateLimit: true,
        environment: true,
        isActive: true,
        lastUsedAt: true,
        totalRequests: true,
        ipWhitelist: true,
        createdAt: true,
        updatedAt: true,
        // keyHash: NEVER returned
        // userId: Not needed (user already knows)
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      keys: apiKeys,
      count: apiKeys.length,
      plan: user.plan,
      limits: {
        maxKeys: 10,
        currentKeys: apiKeys.length,
        remainingSlots: 10 - apiKeys.length,
      },
    });

  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/v1/api-keys - Update API Key (name, revoke/activate)
// =============================================================================

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const { keyId, name, isActive, scopes, rateLimit } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: 'keyId is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    if (existingKey.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this API key' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (isActive !== undefined) updateData.isActive = isActive;
    if (scopes !== undefined) updateData.scopes = scopes;
    if (rateLimit !== undefined) updateData.rateLimit = rateLimit;

    // Update API key
    const updatedKey = await prisma.apiKey.update({
      where: { id: keyId },
      data: updateData,
      select: {
        id: true,
        keyPrefix: true,
        name: true,
        scopes: true,
        rateLimit: true,
        environment: true,
        isActive: true,
        lastUsedAt: true,
        totalRequests: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Invalidate cache (key permissions/status changed)
    // Note: We don't have the full key here, but we can invalidate by reconstructing
    // In practice, cache will expire in 1 hour anyway
    // For immediate revocation, consider storing keyId → fullKey mapping
    // For now, cache invalidation on next validation attempt is acceptable

    // Track analytics event
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventName: 'API Key Updated',
          timestamp: new Date(),
          sessionId: crypto.randomUUID(),
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            apiKeyId: keyId,
            changes: updateData,
          },
        },
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'API key updated successfully',
      key: updatedKey,
    });

  } catch (error) {
    console.error('Error updating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/v1/api-keys - Delete API Key
// =============================================================================

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse request body
    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json(
        { error: 'keyId is required' },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    if (existingKey.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own this API key' },
        { status: 403 }
      );
    }

    // Delete API key (hard delete, not soft delete)
    await prisma.apiKey.delete({
      where: { id: keyId },
    });

    // Note: Usage history in ApiUsageHourly is preserved for audit

    // Track analytics event
    try {
      await prisma.analyticsEvent.create({
        data: {
          userId: user.id,
          eventName: 'API Key Deleted',
          timestamp: new Date(),
          sessionId: crypto.randomUUID(),
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            apiKeyId: keyId,
            keyPrefix: existingKey.keyPrefix,
            name: existingKey.name,
          },
        },
      });
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
