import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

/** Sliding window: max requests per IP per minute (single-instance / Edge best-effort). */
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 60;

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  if (b.count >= RATE_LIMIT_MAX) return true;
  b.count += 1;
  return false;
}

function pruneBuckets(): void {
  const now = Date.now();
  if (buckets.size > 10_000) {
    for (const [key, v] of buckets) {
      if (now > v.resetAt) buckets.delete(key);
    }
  }
}

export default function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api')) {
    if (pathname.startsWith('/api/auth')) {
      return NextResponse.next();
    }
    if (pathname === '/api/payment/webhook') {
      return NextResponse.next();
    }
    if (pathname === '/api/health') {
      return NextResponse.next();
    }

    pruneBuckets();
    const ip = getClientIp(request);
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)', '/api/:path*'],
};
