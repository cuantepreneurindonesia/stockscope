# Stripe Frontend SDK TypeScript Conflict Audit

## Issue Summary

Vercel deployment fails during the TypeScript compilation phase (`Running TypeScript ...`) with Exit Code 1.

### Primary Error

```
Property 'redirectToCheckout' does not exist on type 'Stripe'
  in app/pricing/PricingClient.tsx (line ~64)
```

### Secondary Warning

```
Module not found: Can't resolve 'talib'
  in src/services/analysis.ts
```
*(Already resolved in Phase 6 via `serverExternalPackages: ["talib"]` in `next.config.ts`.)*

---

## Root Cause Analysis

### Primary Issue — `redirectToCheckout` Removed in `@stripe/stripe-js` v2+

| Item | Value |
|---|---|
| Failing file | `app/pricing/PricingClient.tsx` |
| Failing call | `stripe.redirectToCheckout({ sessionId: data.sessionId })` |
| Installed version | `@stripe/stripe-js@9.1.0` |
| `redirectToCheckout` present? | **No** — removed in v2.0 (released Oct 2022) |

#### Why the Error Occurs

The problem statement's framing — "accidentally using backend stripe types instead of @stripe/stripe-js types" — does not apply here. The `PricingClient.tsx` file already imports correctly from `@stripe/stripe-js`:

```ts
import { loadStripe } from '@stripe/stripe-js';
```

There are **no backend `stripe` imports** in the client component. The real root cause is a **version mismatch**: `redirectToCheckout` was deprecated in `@stripe/stripe-js` v1.x and completely **removed** in v2.0. The codebase was written against the v1 API pattern but now runs against v9.1.0 where the method simply does not exist on the `Stripe` interface.

Evidence: Extracting and searching the `@stripe/stripe-js@9.1.0` type definitions confirms `redirectToCheckout` appears **zero times** in all `.d.ts` files.

#### The Old v1 Pattern (broken)

```ts
const stripe = await loadStripe(key);
const { error } = await stripe.redirectToCheckout({ sessionId: 'cs_...' });
//                              ^^^^^^^^^^^^^^^^^^^
//                              ❌ does not exist in v2+
```

#### The Modern Pattern (v2+)

Stripe removed `redirectToCheckout` in favour of a simpler URL-based redirect:
1. The backend creates a Checkout Session and returns `session.url` (a pre-built Stripe-hosted URL)
2. The frontend redirects to that URL with `window.location.href = data.url`

This eliminates the need for `loadStripe`/`stripePromise` in the checkout flow entirely.

---

## Resolution Paths

### Path A — Fix imports to use `@stripe/stripe-js` types

**Not applicable.** The imports are already correct. The issue is the deprecated method, not a wrong import source. Adding `import { Stripe } from '@stripe/stripe-js'` and explicitly typing `stripePromise` would still fail because the `Stripe` interface in v9 genuinely has no `redirectToCheckout` method.

### Path B — Replace deprecated `redirectToCheckout` with URL redirect ✅ CHOSEN

```ts
// BEFORE (broken in v2+)
const stripe = await stripePromise;
if (stripe) {
  const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
}

// AFTER (modern pattern)
if (data.url) {
  window.location.href = data.url;
}
```

**Why chosen:**
- The only correct fix given `@stripe/stripe-js@9.1.0` — `redirectToCheckout` is gone, period
- Aligns with Stripe's official migration guide for Checkout Sessions
- Removes an unnecessary `loadStripe` call at module level (a JS bundle load + network request to Stripe CDN on every page load)
- Simpler, fewer failure modes (no Stripe.js load failure, no async await chain)
- Completely type-safe with no assertions or escape hatches needed
- Does not require downgrading `@stripe/stripe-js`

**Required backend change:** The existing checkout session endpoint returns `{ sessionId: session.id }`. The `stripe.checkout.sessions.create` response includes a `url` field. The backend must also expose `session.url` so the frontend can redirect to it.

---

## Files to Change

| File | Change |
|---|---|
| `app/api/checkout/session/route.ts` | Return `url: session.url` in the JSON response |
| `app/pricing/PricingClient.tsx` | Remove `loadStripe`/`stripePromise`; redirect via `window.location.href = data.url` |

---

## talib Fix Status

Already resolved in Phase 6 (commit `f3b980a`):

```ts
// next.config.ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["talib"], // ✅ prevents webpack from bundling native binary
};
```

---

## Future Technical Debt

| Item | Recommendation |
|---|---|
| `@stripe/react-stripe-js` is installed but unused | Remove `@stripe/react-stripe-js` (v6.1.0) if only using Checkout Sessions via URL redirect — it's dead weight. |
| `loadStripe` import still in file | Remove after applying fix — no longer needed for this flow. |
| Stripe API version pinned to `"2022-08-01"` | Consider upgrading to a more recent `stripe` version and API version when time allows. |
