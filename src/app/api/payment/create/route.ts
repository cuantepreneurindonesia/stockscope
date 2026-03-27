/**
 * POST /api/payment/create
 * Creates a Midtrans Snap transaction token for the logged-in user.
 * Returns { token, orderId } on success.
 */
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth/config";
import {
  ADMIN_FEE_IDR,
  PREMIUM_PRICE_IDR,
  PRODUCT_NAME,
  snap,
} from "@/lib/midtrans";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Already premium — no need to pay again
  if ((session.user as { plan?: string }).plan === "premium") {
    return NextResponse.json({ error: "Already premium" }, { status: 400 });
  }

  // Generate a unique order ID: userId + timestamp
  const orderId = `RTI-${session.user.id}-${Date.now()}`;

  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: PREMIUM_PRICE_IDR + ADMIN_FEE_IDR,
    },
    item_details: [
      {
        id: "premium-monthly",
        price: PREMIUM_PRICE_IDR,
        quantity: 1,
        name: PRODUCT_NAME,
      },
      {
        id: "admin-fee",
        price: ADMIN_FEE_IDR,
        quantity: 1,
        name: "Admin Fee",
      },
    ],
    customer_details: {
      first_name: session.user.name ?? "User",
      email: session.user.email ?? "",
    },
    // Restrict payment to QRIS only.
    enabled_payments: ["other_qris"],
    // Redirect URLs after payment completes (Snap popup closes and redirects)
    callbacks: {
      finish: `${process.env.NEXTAUTH_URL}/upgrade?status=success`,
      error: `${process.env.NEXTAUTH_URL}/upgrade?status=error`,
      pending: `${process.env.NEXTAUTH_URL}/upgrade?status=pending`,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({
      token: transaction.token,
      orderId,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 },
    );
  }
}
