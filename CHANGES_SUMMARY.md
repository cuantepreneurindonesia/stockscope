# Sprint 6 Beta Launch Changes Summary

## Phase 1: Setup
- Created branch `feature/sprint6-beta-launch`.
- Integrated missing PWA and monetization dependencies (`compression`, `stripe`, `@stripe/react-stripe-js`, `@stripe/stripe-js`, `@optimizely/optimizely-sdk`, `workbox-cli`).

## Phase 2: Mobile PWA & Optimization  
- Configured Express in `server.ts` to use `compression()` middleware for gzipping API responses.
- Registered a Progressive Web App (PWA) manifest at `public/manifest.json`.
- Handled mock visual icon setups for PWA `192x192` & `512x512`.
- Built `workbox-config.js` with defined offline fallbacks for Next.js app shells and offline caching functionality via NetworkFirst strictly for `/api/screen` JSON endpoints.
- Registered Service Worker automatically within `app/layout.tsx`.

## Phase 3: Stripe Monetization
- Created checkout endpoint in Next.js backend at `POST /api/checkout/session`.
- Migrated legacy `PricingClient.tsx` checkout handlers from Midtrans over to Stripe.
- Intercepted Stripe signature updates natively within `server.ts` utilizing `express.raw` to maintain complete buffer integrity before parsers execute, updating `prisma.user.plan` to `"premium"` for the upgraded user.

## Phase 4: A/B Testing
- Rewired `useCTAExperiment` to directly initialize and activate variations securely using an explicit reference to the `@optimizely/optimizely-sdk` framework for UI AB toggles based on IDs.

## Phase 5: Vercel ERESOLVE Fix (React 19 Peer Dependency)
- Audited all direct and transitive dependencies incompatible with `react@19.2.3` (`react-slider`, `swagger-ui-react`, `react-copy-to-clipboard`, `react-debounce-input`, `react-inspector`).
- Chose **Path A** (legacy peer deps) to keep React 19 and unblock Vercel CI/CD.
- Created `.npmrc` at the project root with `legacy-peer-deps=true` so npm skips strict peer-dependency enforcement during `npm install`.
- Created `DEPENDENCY_AUDIT.md` documenting conflicting packages, both resolution paths, and future technical debt items.

## Phase 6: Stripe TypeScript Build Fix & talib Warning Mitigation
- Audited `stripe@10.17.0` type definitions: `types/2022-08-01/index.d.ts` expects `apiVersion: "2022-08-01"`.
- Fixed `app/api/checkout/session/route.ts`: changed hardcoded `apiVersion` from `"2022-11-15"` to `"2022-08-01"` to match installed types and resolve the TypeScript compilation error on Vercel.
- Fixed `next.config.ts`: added `serverExternalPackages: ["talib"]` so webpack/Turbopack skips bundling the native `talib` binary, eliminating the `Module not found: Can't resolve 'talib'` build warning (runtime JS fallback in `src/services/analysis.ts` is preserved).
- Created `STRIPE_TS_AUDIT.md` documenting the version mismatch, resolution paths, and future upgrade path to `stripe@22.x`.

## Phase 7: MongoDB TypeScript Interface Fix (WithId<Document>[] → Stock[])
- Audited `app/api/export/csv/route.ts`: untyped `database.collection("stocks")` caused `.toArray()` to infer `WithId<Document>[]`, which is not assignable to the `Stock[]` expected by `enrichStocks()`.
- Chose **Path A**: added `<Stock>` generic to the collection call (`database.collection<Stock>("stocks")`), making `.toArray()` return `WithId<Stock>[]` — structurally assignable to `Stock[]` because `Stock._id` is already typed as `string | undefined`.
- Added `import type { Stock } from "@/types"` to the route file.
- No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `MONGODB_TS_AUDIT.md` documenting the type mismatch, both resolution paths, and future schema-sync recommendations.

## Phase 10: react-slider TypeScript Declaration Fix (missing @types package)
- Audited `src/components/features/screener/FilterSidebar.tsx`: imports `ReactSlider` from `react-slider`, which ships no bundled TypeScript declarations. With `strict: true` in `tsconfig.json`, this causes `Could not find a declaration file for module 'react-slider'` and a Vercel build failure.
- Confirmed `@types/react-slider@1.3.6` exists on DefinitelyTyped with no known CVEs.
- Chose **Path A** (install official types): added `"@types/react-slider": "^1.3.6"` to `devDependencies` in `package.json`. All props used in `FilterSidebar.tsx` (`min`, `max`, `step`, `value`, `onChange`, `pearling`, `minDistance`, `className`, `thumbClassName`, `trackClassName`) are covered by the community type definitions.
- No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `REACT_SLIDER_TS_AUDIT.md` documenting the missing declarations, both resolution paths, and the chosen strategy.

## Phase 9: Chart.js TypeScript Options Fix (stacked at root level)
- Audited `src/components/analytics/StockChartOverlay.tsx`: the `options` object passed to `<Chart>` contained `stacked: false` at the root level.
- In Chart.js v3+, `stacked` is a per-axis scale property, not a root `ChartOptions` field. TypeScript correctly rejects it with `Object literal may only specify known properties, and 'stacked' does not exist in type...`.
- Chose **Path B** (remove the line): all chart series already use separate y-axes (`y`, `y1`, `y2`), so stacking is inherently off and the explicit declaration is redundant.
- Removed `stacked: false` from the root of the `options` object in `StockChartOverlay.tsx`.
- No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `CHARTJS_TS_AUDIT.md` documenting the version API change, both resolution paths, and the chosen strategy.
- Audited `app/pricing/PricingClient.tsx`: imports were already correct (`loadStripe` from `@stripe/stripe-js`). The error `Property 'redirectToCheckout' does not exist on type 'Stripe'` is caused by `@stripe/stripe-js@9.1.0` having removed `redirectToCheckout` entirely in v2+.
- Chose **Path B** (URL redirect pattern): instead of downgrading the SDK, migrated to the modern Stripe Checkout redirect flow.
- Fixed `app/api/checkout/session/route.ts`: added `url: session.url` to the JSON response alongside the existing `sessionId`.
- Fixed `app/pricing/PricingClient.tsx`: removed `loadStripe`/`stripePromise` and the deprecated `stripe.redirectToCheckout()` call; replaced with `window.location.href = data.url` — the correct modern pattern for Stripe-hosted Checkout Sessions.
- No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `STRIPE_FRONTEND_TS_AUDIT.md` documenting the version history, why Path A (import fix) does not apply, and the chosen Path B strategy.
