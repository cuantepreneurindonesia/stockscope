/**
 * @swagger
 * /alerts:
 *   post:
 *     summary: Create a new price alert
 *     description: Creates a price alert for a specified stock ticker based on target price conditions.
 *     tags:
 *       - Alert
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ticker
 *               - condition
 *               - targetPrice
 *             properties:
 *               ticker:
 *                 type: string
 *               condition:
 *                 type: string
 *                 enum: [above, below]
 *               targetPrice:
 *                 type: number
 *               notifyEmail:
 *                 type: boolean
 *               notifySms:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Alert successfully created
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Internal server error
 */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkAlertRateLimit } from '@/lib/rateLimitAlerts';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id as string;
    
    // Check rate limit (Free Tier: 3 alerts/day)
    const plan = (session.user as any).plan || 'free';
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
