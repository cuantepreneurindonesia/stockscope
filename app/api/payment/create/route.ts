/**
 * POST /api/payment/create
 * Creates a Midtrans Snap transaction token for the logged-in user.
 * SP5-03: Persist pending transaction BEFORE Midtrans redirect.
 * Returns { token, orderId, transactionId } on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { snap, PREMIUM_PRICE_IDR, ADMIN_FEE_IDR, PRODUCT_NAME } from '@/lib/midtrans';
import prisma from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user from database to get proper ObjectId
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Already premium — no need to pay again
  if (user.plan === 'premium' || user.plan === 'pro') {
    return NextResponse.json({ 
      error: 'Already subscribed', 
      plan: user.plan 
    }, { status: 400 });
  }

  // Parse request body for optional parameters
  const body = await req.json().catch(() => ({}));
  const planId = body.planId || 'premium'; // Default to premium
  const billingCycle = body.billingCycle || 'monthly';

  // Calculate amount based on plan
  const baseAmount = planId === 'pro' ? 149000 : PREMIUM_PRICE_IDR;
  const totalAmount = baseAmount + ADMIN_FEE_IDR;

  // Generate unique order ID
  const orderId = `ORDER-${user.id.slice(-8)}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  
  // Generate idempotency key
  const idempotencyKey = `${user.id}-${Date.now()}-${uuidv4()}`;

  // Capture request context for audit trail
  const ipAddress = req.headers.get('x-forwarded-for') || 
                   req.headers.get('x-real-ip') || 
                   'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';

  try {
    // STEP 1: Create pending transaction record BEFORE Midtrans
    // This ensures we have a record even if user abandons checkout
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        idempotencyKey,
        orderId,
        amount: totalAmount,
        currency: 'IDR',
        status: 'pending',
        transactionType: 'subscription',
        paymentMethod: 'qris', // Will be updated by webhook if different
        planId,
        ipAddress,
        userAgent,
        metadata: {
          billingCycle,
          baseAmount,
          adminFee: ADMIN_FEE_IDR,
          createdVia: 'checkout',
          sessionInfo: {
            userName: session.user.name,
            userEmail: session.user.email
          }
        }
      }
    });

    console.log(`[CHECKOUT] Created pending transaction: ${transaction.id} | Order: ${orderId} | User: ${user.email}`);

    // Track checkout started event (analytics)
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'checkout_started',
          userId: user.id,
          sessionId: 'server-checkout',
          timestamp: new Date(),
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            orderId,
            planId,
            amount: totalAmount,
            billingCycle
          }
        }
      });
    } catch (analyticsError) {
      console.warn('[ANALYTICS] Failed to track checkout_started:', analyticsError);
    }

    // STEP 2: Create Midtrans Snap token
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      item_details: [
        {
          id: `${planId}-${billingCycle}`,
          price: baseAmount,
          quantity: 1,
          name: planId === 'pro' ? 'Stockscope Pro Plan' : PRODUCT_NAME,
        },
        {
          id: 'admin-fee',
          price: ADMIN_FEE_IDR,
          quantity: 1,
          name: 'Admin Fee',
        },
      ],
      customer_details: {
        first_name: session.user.name ?? 'User',
        email: session.user.email ?? '',
      },
      // Restrict payment to QRIS only
      enabled_payments: ['other_qris'],
      // Redirect URLs after payment completes
      callbacks: {
        finish: `${process.env.NEXTAUTH_URL}/upgrade?status=success&orderId=${orderId}`,
        error: `${process.env.NEXTAUTH_URL}/upgrade?status=error&orderId=${orderId}`,
        pending: `${process.env.NEXTAUTH_URL}/upgrade?status=pending&orderId=${orderId}`,
      },
    };

    const midtransTransaction = await snap.createTransaction(parameter);

    console.log(`[CHECKOUT] Midtrans Snap token created: ${orderId}`);

    return NextResponse.json({
      token: midtransTransaction.token,
      orderId,
      transactionId: transaction.id,
      amount: totalAmount,
      planId
    });

  } catch (err: any) {
    console.error('[CHECKOUT ERROR]', err);

    // Track checkout error (analytics)
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'api_error',
          userId: user.id,
          sessionId: 'server-checkout-error',
          timestamp: new Date(),
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            endpoint: '/api/payment/create',
            errorMessage: err.message,
            errorCode: err.code || 'UNKNOWN'
          }
        }
      });
    } catch (analyticsError) {
      console.warn('[ANALYTICS] Failed to track api_error:', analyticsError);
    }

    // If transaction was created but Midtrans failed, mark as failed
    if (err.message?.includes('Midtrans')) {
      try {
        await prisma.paymentTransaction.updateMany({
          where: { orderId },
          data: { 
            status: 'failed',
            errorMessage: err.message
          }
        });
      } catch (updateError) {
        console.error('[CHECKOUT] Failed to update transaction status:', updateError);
      }
    }

    return NextResponse.json({ 
      error: 'Failed to create transaction',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    }, { status: 500 });
  }
}
