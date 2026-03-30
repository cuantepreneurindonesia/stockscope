/**
 * POST /api/payment/webhook
 * Midtrans payment notification handler (SP5-04: Enhanced)
 * 
 * Flow:
 * 1. Verify Midtrans signature (HMAC-SHA512)
 * 2. Find transaction by orderId
 * 3. Idempotency check (already processed?)
 * 4. Update transaction status
 * 5. Create/update subscription
 * 6. Update user plan
 * 7. Track analytics events
 *
 * IMPORTANT: This route must be excluded from CSRF protection.
 * Next.js App Router API routes do not have CSRF by default.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { upgradePlan } from '@/lib/services/userService';
import prisma from '@/lib/prisma';

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

/**
 * Verify Midtrans webhook signature
 * Formula: SHA512(order_id + status_code + gross_amount + server_key)
 */
function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string
): boolean {
  const raw = orderId + statusCode + grossAmount + serverKey;
  const expected = crypto.createHash('sha512').update(raw).digest('hex');
  return expected === receivedSignature;
}

// =============================================================================
// STATUS MAPPING
// =============================================================================

/**
 * Map Midtrans transaction_status to our internal status
 */
function mapTransactionStatus(
  transactionStatus: string,
  fraudStatus: string
): 'pending' | 'success' | 'failed' | 'expired' {
  // Success cases
  if (transactionStatus === 'settlement') return 'success';
  if (transactionStatus === 'capture' && fraudStatus === 'accept') return 'success';
  
  // Failed cases
  if (transactionStatus === 'deny') return 'failed';
  if (transactionStatus === 'cancel') return 'failed';
  if (fraudStatus === 'deny') return 'failed';
  
  // Expired
  if (transactionStatus === 'expire') return 'expired';
  
  // Still pending
  return 'pending';
}

// =============================================================================
// WEBHOOK HANDLER
// =============================================================================

export async function POST(req: NextRequest) {
  const webhookReceivedAt = new Date();
  
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      transaction_id,
      payment_type,
      settlement_time,
    } = body;

    console.log(`[WEBHOOK] Received: ${order_id} | Status: ${transaction_status} | Fraud: ${fraud_status}`);

    // STEP 1: Verify signature
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key
    );

    if (!isValid) {
      console.error('[WEBHOOK] Invalid signature:', order_id);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // STEP 2: Find transaction by orderId
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { orderId: order_id }
    });

    if (!transaction) {
      console.error('[WEBHOOK] Transaction not found:', order_id);
      // Return 200 to prevent retries for non-existent orders
      return NextResponse.json({ 
        ok: true, 
        message: 'Transaction not found (may be from old system)' 
      });
    }

    // STEP 3: Idempotency check
    if (transaction.webhookProcessedAt) {
      console.log('[WEBHOOK] Already processed:', order_id);
      return NextResponse.json({ 
        ok: true, 
        message: 'Webhook already processed',
        idempotent: true
      });
    }

    // STEP 4: Map status
    const newStatus = mapTransactionStatus(transaction_status, fraud_status);
    const isPaid = newStatus === 'success';

    console.log(`[WEBHOOK] Mapping ${transaction_status}/${fraud_status} → ${newStatus}`);

    // STEP 5: Update transaction
    const updatedTransaction = await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: newStatus,
        midtransTransactionId: transaction_id,
        midtransStatus: transaction_status,
        fraudStatus: fraud_status,
        paymentChannel: payment_type,
        settlementTime: settlement_time ? new Date(settlement_time) : null,
        webhookReceivedAt,
        webhookProcessedAt: new Date(),
        metadata: {
          ...(transaction.metadata as object || {}),
          webhookPayload: body
        }
      }
    });

    console.log(`[WEBHOOK] Transaction updated: ${transaction.id} | Status: ${newStatus}`);

    // STEP 6: If paid, create/update subscription and upgrade user
    if (isPaid) {
      // Find existing active subscription for this plan
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId: transaction.userId,
          planId: transaction.planId!,
          status: 'active'
        }
      });

      let subscription;

      if (existingSubscription) {
        // Extend existing subscription
        const currentEnd = existingSubscription.currentPeriodEnd || new Date();
        const newEnd = new Date(currentEnd);
        newEnd.setMonth(newEnd.getMonth() + 1); // Add 1 month

        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            currentPeriodEnd: newEnd,
            updatedAt: new Date()
          }
        });

        console.log(`[WEBHOOK] Subscription extended: ${subscription.id} → ${newEnd.toISOString()}`);
      } else {
        // Create new subscription
        const now = new Date();
        const currentPeriodEnd = new Date(now);
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

        subscription = await prisma.subscription.create({
          data: {
            userId: transaction.userId,
            planId: transaction.planId!,
            status: 'active',
            startDate: now,
            billingCycle: 'monthly',
            currentPeriodStart: now,
            currentPeriodEnd,
            midtransSubscriptionId: transaction_id,
            metadata: {
              firstPaymentOrderId: order_id,
              firstPaymentAmount: transaction.amount
            }
          }
        });

        console.log(`[WEBHOOK] Subscription created: ${subscription.id}`);
      }

      // Update PaymentTransaction with subscriptionId
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { subscriptionId: subscription.id }
      });

      // Upgrade user plan (legacy support for user.plan field)
      await upgradePlan(transaction.userId);

      console.log(`[WEBHOOK] User upgraded: ${transaction.userId} → ${transaction.planId}`);

      // Track payment_completed event
      try {
        await prisma.analyticsEvent.create({
          data: {
            eventName: 'payment_completed',
            timestamp: new Date(),
            sessionId: 'server-payment-webhook',
            userId: transaction.userId,
            platform: 'web',
            deviceType: 'desktop',
            locale: 'en',
            properties: {
              orderId: order_id,
              transactionId: transaction.id,
              subscriptionId: subscription.id,
              transactionStatus: transaction_status,
              grossAmount: parseFloat(gross_amount),
              currency: 'IDR',
              paymentType: payment_type || 'unknown',
              fraudStatus: fraud_status,
              planId: transaction.planId
            }
          }
        });
      } catch (analyticsError) {
        console.warn('[WEBHOOK] Failed to track payment_completed:', analyticsError);
      }

    } else {
      // Payment failed or expired
      console.log(`[WEBHOOK] Payment not successful: ${order_id} | Status: ${newStatus}`);

      // Track payment_failed event
      try {
        await prisma.analyticsEvent.create({
          data: {
            eventName: 'payment_failed',
            timestamp: new Date(),
            sessionId: 'server-payment-webhook',
            userId: transaction.userId,
            platform: 'web',
            deviceType: 'desktop',
            locale: 'en',
            properties: {
              orderId: order_id,
              transactionId: transaction.id,
              transactionStatus: transaction_status,
              grossAmount: parseFloat(gross_amount),
              currency: 'IDR',
              paymentType: payment_type || 'unknown',
              fraudStatus: fraud_status,
              statusCode: status_code,
              planId: transaction.planId
            }
          }
        });
      } catch (analyticsError) {
        console.warn('[WEBHOOK] Failed to track payment_failed:', analyticsError);
      }
    }

    // Always return 200 to Midtrans (prevent retries)
    return NextResponse.json({ 
      ok: true,
      processed: true,
      orderId: order_id,
      status: newStatus
    });

  } catch (err: any) {
    console.error('[WEBHOOK ERROR]', err);

    // Track webhook error
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'api_error',
          timestamp: new Date(),
          sessionId: 'server-webhook-error',
          userId: null,
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            endpoint: '/api/payment/webhook',
            errorMessage: err.message,
            errorStack: err.stack
          }
        }
      });
    } catch (analyticsError) {
      console.warn('[WEBHOOK] Failed to track error:', analyticsError);
    }

    // Still return 200 to prevent Midtrans retries
    // (broken payloads shouldn't be retried)
    return NextResponse.json({ 
      ok: true,
      error: 'Webhook processing failed',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
}
