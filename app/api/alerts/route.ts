import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { checkAlertRateLimit } from '@/lib/rateLimitAlerts';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.user) {
      // Mock user for testing if no session
      // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Default to a mock userId if not authenticated for Phase 4 testing
    const userId = session?.user?.id || '650e8a7c93e4f1a0b3f5c2b0'; // Mock valid ObjectId
    
    // Check rate limit (Free Tier: 3 alerts/day)
    // We assume default plan is 'free' if no user session
    const plan = session?.user?.plan || 'free';
    const isAllowed = await checkAlertRateLimit(userId, plan);

    if (!isAllowed) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Free tier is limited to 3 alerts per day. Upgrade to Premium for unlimited alerts.' 
      }, { status: 429 });
    }

    const body = await req.json();
    const { ticker, condition, targetPrice, notifyEmail, notifySms } = body;

    if (!ticker || !condition || !targetPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const alert = await prisma.priceAlert.create({
      data: {
        userId,
        ticker,
        condition,
        targetPrice: parseFloat(targetPrice),
        notifyEmail: Boolean(notifyEmail),
        notifySms: Boolean(notifySms),
      }
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
