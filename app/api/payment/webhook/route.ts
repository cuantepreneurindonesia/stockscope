/**
 * POST /api/payment/webhook
 * Midtrans payment notification handler.
 * Verifies the signature, then upgrades the user's plan on successful payment.
 *
 * IMPORTANT: This route must be excluded from CSRF protection.
 * Next.js App Router API routes do not have CSRF by default, so no extra config needed.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { upgradePlan } from '@/lib/services/userService';
import { prisma } from '@/lib/prisma';

// Midtrans sends a SHA512 hash to verify the notification is authentic.
// Formula: SHA512(order_id + status_code + gross_amount + server_key)
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature to ensure this request is genuinely from Midtrans
    const isValid = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key
    );

    if (!isValid) {
      console.warn('Midtrans webhook: invalid signature', { order_id });
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Determine if payment is successful
    // transaction_status 'capture' (credit card) or 'settlement' (GoPay/bank) = paid
    const isPaid =
      (transaction_status === 'capture' && fraud_status === 'accept') ||
      transaction_status === 'settlement';

    if (isPaid) {
      // Extract userId from orderId format: "RTI-{userId}-{timestamp}"
      const parts = order_id.split('-');
      // order_id is RTI-{userId}-{timestamp}
      // userId might itself contain hyphens (e.g. google-oauth2|123456789 has no hyphens, but to be safe):
      // parts[0] = 'RTI', parts[parts.length-1] = timestamp, everything in between = userId
      const userId = parts.slice(1, parts.length - 1).join('-');

      if (!userId) {
        console.error('Midtrans webhook: could not extract userId from order_id', order_id);
        return NextResponse.json({ error: 'Bad order_id' }, { status: 400 });
      }

      await upgradePlan(userId);
      console.log(`User ${userId} upgraded to premium via order ${order_id}`);

      // Track successful payment event
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'payment_completed',
          timestamp: new Date(),
          sessionId: 'server-payment-webhook',
          userId: userId,
          platform: 'web',
          deviceType: 'desktop',
          locale: 'id',
          properties: {
            orderId: order_id,
            transactionStatus: transaction_status,
            grossAmount: parseFloat(gross_amount),
            currency: 'IDR',
            paymentType: body.payment_type || 'unknown',
            fraudStatus: fraud_status
          },
          processedAt: new Date()
        }
      });
    } else {
      // Payment failed or pending
      const parts = order_id.split('-');
      const userId = parts.slice(1, parts.length - 1).join('-');

      if (userId) {
        // Track failed payment event
        await prisma.analyticsEvent.create({
          data: {
            eventName: 'payment_failed',
            timestamp: new Date(),
            sessionId: 'server-payment-webhook',
            userId: userId,
            platform: 'web',
            deviceType: 'desktop',
            locale: 'id',
            properties: {
              orderId: order_id,
              transactionStatus: transaction_status,
              grossAmount: parseFloat(gross_amount),
              currency: 'IDR',
              paymentType: body.payment_type || 'unknown',
              fraudStatus: fraud_status,
              statusCode: status_code
            },
            processedAt: new Date()
          }
        });
      }
    }

    // Always return 200 to Midtrans — it will retry if it gets a non-2xx response
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Midtrans webhook error:', err);
    // Still return 200 to prevent Midtrans from retrying a broken payload
    return NextResponse.json({ ok: true });
  }
}
