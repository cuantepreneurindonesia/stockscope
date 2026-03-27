/**
 * POST /api/payment/webhook
 * Midtrans payment notification handler.
 * Verifies the signature, then upgrades the user's plan on successful payment.
 *
 * IMPORTANT: This route must be excluded from CSRF protection.
 * Next.js App Router API routes do not have CSRF by default, so no extra config needed.
 */
import { NextRequest, NextResponse } from "next/server";

import crypto from "crypto";

import { upgradePlan } from "@/lib/services/userService";

// Midtrans sends a SHA512 hash to verify the notification is authentic.
// Formula: SHA512(order_id + status_code + gross_amount + server_key)
function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  receivedSignature: string,
): boolean {
  const raw = orderId + statusCode + grossAmount + serverKey;
  const expected = crypto.createHash("sha512").update(raw).digest("hex");
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
      signature_key,
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // Determine if payment is successful
    // transaction_status 'capture' (credit card) or 'settlement' (GoPay/bank) = paid
    const isPaid =
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement";

    if (isPaid) {
      // Extract userId from orderId format: "RTI-{userId}-{timestamp}"
      const parts = order_id.split("-");
      // order_id is RTI-{userId}-{timestamp}
      // userId might itself contain hyphens (e.g. google-oauth2|123456789 has no hyphens, but to be safe):
      // parts[0] = 'RTI', parts[parts.length-1] = timestamp, everything in between = userId
      const userId = parts.slice(1, parts.length - 1).join("-");

      if (!userId) {
        return NextResponse.json({ error: "Bad order_id" }, { status: 400 });
      }

      await upgradePlan(userId);
    }

    // Always return 200 to Midtrans — it will retry if it gets a non-2xx response
    return NextResponse.json({ ok: true });
  } catch {
    // Still return 200 to prevent Midtrans from retrying a broken payload
    return NextResponse.json({ ok: true });
  }
}
