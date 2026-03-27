/**
 * Midtrans server-side client helper.
 * Only import this in server-side code (API routes, server components).
 * Never import in 'use client' files.
 */
import { Snap } from "midtrans-client";

const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

/**
 * Utility: snap
 */
export const snap = new Snap({
  isProduction,
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
  clientKey: process.env.MIDTRANS_CLIENT_KEY!,
});

/** Pricing in IDR (Indonesian Rupiah). Adjust as needed. */
export const PREMIUM_PRICE_IDR = 15000; // Rp 15.000
/**
 * Utility: ADMIN_FEE_IDR
 */
export const ADMIN_FEE_IDR = 2000; // Rp 2.000

/** Product name shown in Midtrans payment page */
export const PRODUCT_NAME = "RTI Premium — Monthly Access";
