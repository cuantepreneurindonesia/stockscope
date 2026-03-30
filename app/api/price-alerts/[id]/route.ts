/**
 * Price Alert Detail API - Update and Delete single price alert
 * PATCH /api/price-alerts/[id] - Update price alert (toggle active, update price)
 * DELETE /api/price-alerts/[id] - Delete price alert
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/price-alerts/[id] - Update price alert
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const alert = await prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Price alert not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (alert.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive, targetPrice, condition } = body;

    // Build update data
    const updateData: {
      isActive?: boolean;
      targetPrice?: number;
      condition?: string;
    } = {};

    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }

    if (targetPrice !== undefined) {
      if (typeof targetPrice !== 'number' || targetPrice <= 0) {
        return NextResponse.json(
          { error: 'Target price must be a positive number' },
          { status: 400 }
        );
      }
      updateData.targetPrice = targetPrice;
    }

    if (condition !== undefined) {
      if (!['above', 'below'].includes(condition)) {
        return NextResponse.json(
          { error: 'Condition must be "above" or "below"' },
          { status: 400 }
        );
      }
      updateData.condition = condition;
    }

    const updated = await prisma.priceAlert.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[Price Alert PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/price-alerts/[id] - Delete price alert
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
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

    const { id } = await context.params;

    const alert = await prisma.priceAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      return NextResponse.json(
        { error: 'Price alert not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (alert.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await prisma.priceAlert.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Price Alert DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
