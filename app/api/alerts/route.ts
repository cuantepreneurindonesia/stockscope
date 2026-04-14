/**
 * @deprecated This endpoint is deprecated. Use /api/price-alerts instead.
 * Kept for backwards compatibility — returns 410 Gone to signal migration.
 */
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint has been deprecated. Please use /api/price-alerts instead.',
      migration: '/api/price-alerts',
    },
    { status: 410 }
  );
}

