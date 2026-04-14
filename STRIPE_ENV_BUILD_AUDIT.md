# Stripe Build-Time Environment Variable Error — Audit Document

## Date
2026-04-14

## Error Reported by Vercel

```
Error: STRIPE_SECRET_KEY must be set in production
  at .next/server/app/api/checkout/session/route.js:7:3
```

Vercel deployment failed during the **Collecting page data** phase (TypeScript checks had already passed).

---

## Phase 0 — Audit Findings

### File Audited
`app/api/checkout/session/route.ts`

### Root Cause

Next.js App Router statically evaluates the **module-level (top-level) scope** of every API route file during the build's "Collecting page data" phase, even before any request is made. The original file had three top-level blocks that execute unconditionally at import time:

```typescript
// ❌ Block 1 — throws at build time in production
if (process.env.NODE_ENV === "production" && !process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY must be set in production"); // line 5
}

// ❌ Block 2 — runs at module load, not at request time
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_dev", {
  apiVersion: "2022-08-01",
});

// ❌ Block 3 — throws at build time in production
if (process.env.NODE_ENV === "production") {
  const missingPriceIds = ...
  if (missingPriceIds.length > 0) {
    throw new Error(`Missing required Stripe price ID env vars ...`);
  }
}
```

Because `STRIPE_SECRET_KEY` and the price ID env vars are only available at **runtime** (Vercel injects them into the running container, not into the build container), these checks always fail during the build phase, crashing with Exit Code 1.

---

## Resolution Path Chosen

**Path A** — Move all env validation and Stripe initialization inside the `POST` handler.

Rationale:
- The handler body only executes when an actual HTTP request arrives, never during the build.
- All runtime logic (validation, error responses) is preserved — nothing is removed.
- The price-ID validation `throw` was converted to a proper `NextResponse.json` 500 response (more correct for an API handler anyway).

---

## Fix Applied

```diff
- if (process.env.NODE_ENV === "production" && !process.env.STRIPE_SECRET_KEY) {
-   throw new Error("STRIPE_SECRET_KEY must be set in production");
- }
-
- const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_dev", {
-   apiVersion: "2022-08-01",
- });
-
- const PRICE_ID_MAP = { ... };
-
- if (process.env.NODE_ENV === "production") {
-   ...
-   throw new Error(`Missing required Stripe price ID env vars ...`);
- }
-
  export async function POST(req: NextRequest) {
+   if (!process.env.STRIPE_SECRET_KEY) {
+     if (process.env.NODE_ENV === "production") {
+       throw new Error("STRIPE_SECRET_KEY must be set in production");
+     }
+   }
+
+   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_key_for_dev", {
+     apiVersion: "2022-08-01",
+   });
+
+   const PRICE_ID_MAP = { ... };
+
+   if (process.env.NODE_ENV === "production") {
+     ...
+     return NextResponse.json({ error: "Missing required Stripe price ID env vars ..." }, { status: 500 });
+   }
+
    try { ... }
  }
```

### Verification

`tsc --noEmit` produces no errors for `app/api/checkout/session/route.ts` after the change.

---

## talib Warning Status

`Module not found: Can't resolve 'talib'` is **already resolved** in a prior session via:

```typescript
// next.config.ts
serverExternalPackages: ["talib"],
```

No additional action required.

---

## Files Changed

| File | Change |
|---|---|
| `app/api/checkout/session/route.ts` | Moved all top-level env checks and Stripe init inside `POST` handler |
| `STRIPE_ENV_BUILD_AUDIT.md` | This document |
| `CHANGES_SUMMARY.md` | Phase 14 entry |
