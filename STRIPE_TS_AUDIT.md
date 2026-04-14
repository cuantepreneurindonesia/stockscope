# Stripe TypeScript API Version Audit

## Issue Summary

Vercel deployment fails during the TypeScript compilation phase (`Running TypeScript ...`) with Exit Code 1.

### Primary Error

```
Type '"2022-11-15"' is not assignable to type '"2022-08-01"'
  in app/api/checkout/session/route.ts
```

### Secondary Warning

```
Module not found: Can't resolve 'talib'
  in src/services/analysis.ts
```

---

## Root Cause Analysis

### Primary Issue — Stripe API Version Mismatch

| Item | Value |
|---|---|
| Installed package | `stripe@10.17.0` (resolved from `^10.15.0`) |
| Package TypeScript definitions | `types/2022-08-01/index.d.ts` |
| TypeScript expected `apiVersion` | `"2022-08-01"` |
| Hardcoded `apiVersion` in `route.ts` | `"2022-11-15"` |

The `Stripe.StripeConstructorOptions.apiVersion` field is a string literal union type in `stripe@10.x`. The only accepted value in `stripe@10.17.0`'s type definitions is `"2022-08-01"`. Using any other string fails strict TypeScript compilation.

### Secondary Issue — talib Native Module

`src/services/analysis.ts` already wraps `require('talib')` in a `try/catch` block with a JS fallback, so runtime behavior is safe. However, webpack/Turbopack still **statically analyzes** `require('talib')` and emits a `Module not found` warning/error because the native binary is absent in Vercel's serverless environment. This can escalate to a build error depending on webpack's `bail` setting.

---

## Resolution Paths

### Path A — Fix the apiVersion string ✅ CHOSEN

Change `route.ts` line:
```ts
// Before
apiVersion: "2022-11-15",

// After
apiVersion: "2022-08-01",
```

**Why chosen:** `stripe@10.17.0` is already locked in `package-lock.json`. Path A requires a single-line change and zero dependency churn. The Stripe REST API behavior between `2022-08-01` and `2022-11-15` is identical for the checkout sessions endpoint used in this file.

### Path B — Upgrade stripe to latest (22.x)

```bash
npm install stripe@latest
```

`stripe@22.x` uses date-named API versions (e.g., `"2025-04-30.basil"`). This would require updating `apiVersion` **and** reviewing all Stripe SDK calls for breaking API changes between v10 and v22 — disproportionate risk for a build fix.

---

## talib Fix Strategy

Add `talib` to `serverExternalPackages` in `next.config.ts`. This instructs Next.js to **not bundle** `talib` and instead keep it as a native `require()` in the server runtime. Combined with the existing `try/catch` in `analysis.ts`, this eliminates the webpack warning while preserving the JS fallback path at runtime.

```ts
// next.config.ts
const nextConfig: NextConfig = {
  serverExternalPackages: ['talib'],
  // ...rest
};
```

---

## Files to Change

| File | Change |
|---|---|
| `app/api/checkout/session/route.ts` | `apiVersion: "2022-11-15"` → `"2022-08-01"` |
| `next.config.ts` | Add `serverExternalPackages: ['talib']` |

---

## Future Technical Debt

| Item | Recommendation |
|---|---|
| `stripe@10.17.0` → `stripe@22.x` | When Stripe SDK is upgraded, update `apiVersion` to the latest named version and audit all checkout/webhook handlers for breaking changes. |
| `talib` native module | Consider replacing with a pure-JS TA library (e.g., `technicalindicators`) for full Vercel edge/serverless compatibility. |
