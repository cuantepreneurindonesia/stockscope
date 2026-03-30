/**
 * Price Alerts API - List and Create
 * GET /api/price-alerts - List user's price alerts
 * POST /api/price-alerts - Create new price alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

// GET /api/price-alerts - List all price alerts for authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';

    const alerts = await prisma.priceAlert.findMany({
      where: {
        userId: user.id,
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('[Price Alerts GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/price-alerts - Create new price alert
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { ticker, condition, targetPrice } = body;

    // Validation
    if (!ticker || typeof ticker !== 'string' || ticker.trim().length === 0) {
      return NextResponse.json(
        { error: 'Stock ticker is required' },
        { status: 400 }
      );
    }

    if (!condition || !['above', 'below'].includes(condition)) {
      return NextResponse.json(
        { error: 'Condition must be "above" or "below"' },
        { status: 400 }
      );
    }

    if (typeof targetPrice !== 'number' || targetPrice <= 0) {
      return NextResponse.json(
        { error: 'Target price must be a positive number' },
        { status: 400 }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();

    // Check for duplicate active alert
    const existingAlert = await prisma.priceAlert.findFirst({
      where: {
        userId: user.id,
        ticker: normalizedTicker,
        condition,
        isActive: true,
      },
    });

    if (existingAlert) {
      return NextResponse.json(
        { error: 'You already have an active alert for this stock and condition' },
        { status: 409 }
      );
    }

    // Create alert
    const alert = await prisma.priceAlert.create({
      data: {
        userId: user.id,
        ticker: normalizedTicker,
        condition,
        targetPrice,
        isActive: true,
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('[Price Alerts POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
