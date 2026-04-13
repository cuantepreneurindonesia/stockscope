import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

if (process.env.NODE_ENV === "production" && !process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set in production");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_dev", {
  apiVersion: "2022-11-15",
});

// Server-side allowlist: maps tier+cycle to a real Stripe price ID.
// Set the corresponding env vars to your Stripe dashboard price IDs.
const PRICE_ID_MAP: Record<string, string | undefined> = {
  premium_monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  premium_annual:  process.env.STRIPE_PRICE_PREMIUM_ANNUAL,
  pro_monthly:     process.env.STRIPE_PRICE_PRO_MONTHLY,
  pro_annual:      process.env.STRIPE_PRICE_PRO_ANNUAL,
};

// In production, validate that all required price IDs are configured
if (process.env.NODE_ENV === "production") {
  const missingPriceIds = Object.entries(PRICE_ID_MAP)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missingPriceIds.length > 0) {
    throw new Error(`Missing required Stripe price ID env vars for: ${missingPriceIds.join(', ')}`);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, tierId, billingCycle } = body;

    if (!userId || !tierId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map tierId + billingCycle to an allowlisted Stripe price ID
    const cycle = billingCycle === "annual" ? "annual" : "monthly";
    const priceKey = `${tierId}_${cycle}`;
    const priceId = PRICE_ID_MAP[priceKey];

    if (!priceId) {
      // In non-production we allow a mock flow for known test tiers
      if (process.env.NODE_ENV !== "production" && (tierId === "premium" || tierId === "pro")) {
        return NextResponse.json({ sessionId: `sess_mock_${Date.now()}` });
      }
      return NextResponse.json({ error: "Invalid tier or billing cycle" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      client_reference_id: userId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error: any) {
    console.error("Stripe Checkout Session Error:", error.message);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
