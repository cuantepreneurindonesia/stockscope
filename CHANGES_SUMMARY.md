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

## Phase 8: Stripe Frontend SDK TypeScript Fix (redirectToCheckout removed in v2+)
- Audited `app/pricing/PricingClient.tsx`: imports were already correct (`loadStripe` from `@stripe/stripe-js`). The error `Property 'redirectToCheckout' does not exist on type 'Stripe'` is caused by `@stripe/stripe-js@9.1.0` having removed `redirectToCheckout` entirely in v2+.
- Chose **Path B** (URL redirect pattern): instead of downgrading the SDK, migrated to the modern Stripe Checkout redirect flow.
- Fixed `app/api/checkout/session/route.ts`: added `url: session.url` to the JSON response alongside the existing `sessionId`.
- Fixed `app/pricing/PricingClient.tsx`: removed `loadStripe`/`stripePromise` and the deprecated `stripe.redirectToCheckout()` call; replaced with `window.location.href = data.url` — the correct modern pattern for Stripe-hosted Checkout Sessions.
- No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `STRIPE_FRONTEND_TS_AUDIT.md` documenting the version history, why Path A (import fix) does not apply, and the chosen Path B strategy.

## Phase 9: Chart.js TypeScript Options Fix (stacked at root level)
- Audited `src/components/analytics/StockChartOverlay.tsx`: the `options` object passed to `<Chart>` contained `stacked: false` at the root level.
- In Chart.js v3+, `stacked` is a per-axis scale property, not a root `ChartOptions` field. TypeScript correctly rejects it with `Object literal may only specify known properties, and 'stacked' does not exist in type...`.
- Chose **Path B** (remove the line): all chart series already use separate y-axes (`y`, `y1`, `y2`), so stacking is inherently off and the explicit declaration is redundant.
- Removed `stacked: false` from the root of the `options` object in `StockChartOverlay.tsx`.
- No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `CHARTJS_TS_AUDIT.md` documenting the version API change, both resolution paths, and the chosen strategy.

## Phase 14: Stripe Build-Time Environment Variable Error Fix
- Audited `app/api/checkout/session/route.ts`: three top-level blocks (env check throw, `new Stripe(...)` init, price-ID validation throw) were executing at module-load time during Next.js's "Collecting page data" build phase, crashing with `Error: STRIPE_SECRET_KEY must be set in production`.
- Path A applied: moved all three blocks inside the `POST` handler so they only execute at request runtime. The price-ID validation `throw` was converted to a proper `NextResponse.json` 500 response.
- `tsc --noEmit` produces no errors for the route file after the change.
- `talib` warning already handled via `serverExternalPackages` in `next.config.ts` — no change required.
- Created `STRIPE_ENV_BUILD_AUDIT.md` documenting the cause and chosen fix.

## Phase 13: EnrichedStock TypeScript Property Mismatch Fix (missing hhi, floatPercentage, c1, c3)
- Audited `src/components/features/screener/ScreenerWorkspace.tsx` line 150: `.map()` transform was projecting 14 fields but omitting four required properties (`hhi`, `floatPercentage`, `c1`, `c3`) inherited from the base `Stock` interface, causing `TS2739`.
- Path A chosen: added the four missing fields with `?? 0` fallbacks to the map expression. Fields are expected from the screener API (same MongoDB documents), and the fallback guards against partial responses.
- After the fix, `tsc --noEmit` no longer reports `TS2739` for `ScreenerWorkspace.tsx`.
- `talib` warning already handled via `serverExternalPackages` in `next.config.ts` — no change required.
- Created `ENRICHEDSTOCK_TS_AUDIT.md` documenting the mismatch and chosen fix path.

## Phase 12: react-modal TypeScript Declaration Fix (missing @types package)
- Audited `src/components/features/screener/ScreenerWorkspace.tsx`: imports `ReactModal` from `react-modal` v3, which ships no bundled TypeScript declarations. With `strict: true` in `tsconfig.json`, this caused `TS7016: Could not find a declaration file for module 'react-modal'` on Vercel.
- Confirmed `@types/react-modal@3.16.3` exists on DefinitelyTyped with no known CVEs; installed via `npm i --save-dev @types/react-modal`.
- After installation, `npx tsc --noEmit` no longer reports `TS7016` for `ScreenerWorkspace.tsx`.
- `talib` warning is already handled via `serverExternalPackages` in `next.config.ts` from a prior session — no change required.
- Created `REACT_MODAL_TS_AUDIT.md` documenting the missing declarations and chosen fix path.

## Phase 11: react-table TypeScript Declaration Fix (missing @types package + module augmentation)
- **Phase 11a** — Audited `src/components/features/screener/ScreenerTable.tsx`: imports `useTable`, `useSortBy`, `usePagination`, and `Column` from `react-table` v7, which ships no bundled TypeScript declarations. With `strict: true` in `tsconfig.json`, this caused `Could not find a declaration file for module 'react-table'` on Vercel.
- Confirmed `@types/react-table@7.7.20` exists on DefinitelyTyped with no known CVEs; installed via `npm i --save-dev @types/react-table`.
- **Phase 11b** — After installing `@types/react-table`, `npx tsc --noEmit` revealed deeper plugin-type errors: react-table v7 requires **module augmentation** to merge plugin interfaces into the core types. Without it, `page`, `sortBy`, `isSorted`, `getSortByToggleProps`, `isSortedDesc`, `pageSize`, etc. are all unknown properties.
- Created `src/types/react-table-plugins.d.ts` with module augmentation that merges `UseSortByOptions`, `UseSortByState`, `UseSortByColumnProps`, `UseSortByInstanceProps`, `UsePaginationOptions`, `UsePaginationState`, and `UsePaginationInstanceProps` into the corresponding `TableOptions`, `TableState`, `ColumnInstance`, and `TableInstance` interfaces. This is the officially recommended pattern from DefinitelyTyped.
- Fixed two implicit `any` errors in Cell renderers for function-accessor columns (composite score `number | undefined`, aiTier label `string | undefined`) by adding explicit inline type annotations.
- All 13 `ScreenerTable.tsx` TypeScript errors are now resolved. No changes needed for `talib` (already fixed in Phase 6 via `serverExternalPackages`).
- Created `REACT_TABLE_TS_AUDIT.md` documenting the missing declarations, module augmentation pattern, and chosen strategy.

## Phase 10: react-slider TypeScript Declaration Fix (missing @types package)
