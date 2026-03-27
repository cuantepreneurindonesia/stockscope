# UI/UX Integration Plan (Phase 0)

## Scope And Guardrails
- Objective: redesign frontend UI/UX from the ground up while preserving existing backend APIs, database schema, and business logic.
- Non-goals: no endpoint contract changes, no collection/schema changes, no auth/payment logic changes.
- Current stack baseline: Next.js App Router, React, Tailwind CSS v4, NextAuth, next-intl, MongoDB.

## 1) Backend Feature Audit (Verified)

### 1.1 API Capability Map
1. `GET /api/stocks`
- Purpose: governance stock list with filtering, sorting, pagination.
- Query: `tier`, `hierarchyLevel`, `flag`, `search`, `limit`, `skip`, `sortBy`, `sortDir`.
- Response shape: `{ success, data: Stock[], total, limit, skip, error? }`.

2. `GET /api/stocks/enriched`
- Purpose: governance stocks enriched with market + AI scores.
- Query: `tier`, `hierarchyLevel`, `flag`, `search`, `sector`, `aiTier`, `minScore`, `maxScore`, `sortBy`, `order`, `limit`, `skip`.
- Response shape: `{ success, data: EnrichedStock[], total, limit, skip, error? }`.

3. `GET /api/screener`
- Purpose: screener-focused legacy-compatible payload for UI table/cards.
- Query: `q`, `sector`, `tier`, `minScore`, `maxScore`, `sortBy`, `order`.
- Response shape: `{ success, timestamp, total, data: ScreenerRow[], error? }`.

4. `GET /api/screener/filters`
- Purpose: sector options.
- Response shape: `{ sectors: string[] }`.

5. `GET /api/analytics`
- Purpose: aggregate analytics from filtered governance stocks.
- Query: `tier`, `hierarchyLevel`, `flag`, `ownerType`.
- Response shape: `{ success, data: AnalyticsStats, error? }`.

6. `GET /api/owners`
- Purpose: top owners, with optional detailed portfolios.
- Query: `limit`, `detailed`.
- Response shape: `{ success, data: TopOwner[] | OwnerWithPortfolio[], error? }`.

7. `POST /api/payment/create`
- Purpose: create Midtrans snap transaction for logged-in non-premium user.
- Response shape: `{ token, orderId }` or `{ error }`.

8. `POST /api/payment/webhook`
- Purpose: Midtrans signature verify + user plan upgrade on paid status.
- Response shape: `{ ok: true }` or auth/format errors.

9. `GET /api/health`
- Purpose: liveness/readiness with DB ping.
- Response shape: `{ status, timestamp, database }`.

10. `api/auth/*` (NextAuth)
- Purpose: session/auth lifecycle.

### 1.2 Existing Backend Features To Integrate In UI
1. Governance analytics workspace
- Tier distribution, HHI concentration, float and ownership-derived risk signals.

2. Enriched AI screener
- Composite score with sub-scores, valuation and market fields, AI tier badges.

3. Owner intelligence
- Top owners, owner type distribution, owner portfolio drilldowns.

4. Auth + plan gating
- Session-aware UI states and premium upgrade pathway.

5. Payment flow
- Upgrade page invoking Midtrans Snap + webhook-backed entitlement update.

6. Internationalization
- Locale-aware routes (`id`, `en`) via next-intl.

## 2) Data Structure Audit (Driving UI Shape)

### 2.1 Core Domain Objects
1. `Stock`
- Core fields: `code`, `issuer`, `tier`, `hhi`, `floatPercentage`, `c1`, `c3`, optional `flags`, `ownerType`, `topHolder`, `volume`, `lastPrice`, `marketCap`.

2. `EnrichedStock` extends `Stock`
- Adds market and scoring: `price`, `change`, `sector`, `pe`, `pb`, `roe`, `dividendYield`, `scores`, `aiTier`.

3. `AnalyticsStats`
- `totalStocks`, `byTier`, `avgHHI`, `avgFloat`, `avgC1`, `avgC3`, `byFlag`, optional `topOwners`.

4. `OwnerWithPortfolio`
- `name`, `type`, `count`, `totalPct`, `stocks[]` where each stock has `code`, `pct`, `issuer`.

### 2.2 Complex Payload Example A (Enriched Screener)
```json
{
  "success": true,
  "total": 2,
  "limit": 50,
  "skip": 0,
  "data": [
    {
      "code": "BBCA",
      "issuer": "Bank Central Asia Tbk",
      "tier": "Green",
      "hhi": 1432.5,
      "floatPercentage": 45,
      "c1": 28.2,
      "c3": 55.1,
      "flags": ["LowFloat<15%"],
      "price": 9425,
      "change": 1.2,
      "marketCap": 1050000,
      "pe": 28.5,
      "pb": 4.2,
      "roe": 15.8,
      "dividendYield": 1.8,
      "sector": "Finance",
      "scores": {
        "composite": 81,
        "fundamental": 88,
        "technical": 72,
        "sentiment": 80,
        "liquidity": 84
      },
      "aiTier": {
        "level": 1,
        "label": "STRONG BUY",
        "color": "#10b981",
        "bg": "rgba(16,185,129,0.15)"
      }
    }
  ]
}
```

### 2.3 Complex Payload Example B (Owners Detailed)
```json
{
  "success": true,
  "data": [
    {
      "name": "Example Fund",
      "type": "MF",
      "count": 3,
      "totalPct": 19.4,
      "stocks": [
        { "code": "BBCA", "pct": 7.1, "issuer": "Bank Central Asia Tbk" },
        { "code": "BMRI", "pct": 6.5, "issuer": "Bank Mandiri Tbk" },
        { "code": "TLKM", "pct": 5.8, "issuer": "Telkom Indonesia Tbk" }
      ]
    }
  ]
}
```

## 3) Data-To-Component Mapping

### 3.1 Mapping Matrix
1. `Stock[]` (`/api/stocks`)
- Components: `GovernanceTable`, `RiskHeatmap`, `TierBreakdownCards`, `StockQuickPeekDrawer`.
- UI behavior: sortable columns for governance fields, compact mobile cards, pinned filter chips.

2. `AnalyticsStats` (`/api/analytics`)
- Components: `KpiStrip`, `TierDonut`, `FlagFrequencyBars`, `ConcentrationSummaryPanel`.
- UI behavior: incremental loading skeletons for each metric tile/chart.

3. `EnrichedStock[]` (`/api/stocks/enriched`)
- Components: `ScreenerGrid`, `ScreenerTable`, `ScoreBreakdownCell`, `ValuationCell`, `AiTierBadge`.
- UI behavior: dual-mode (table/cards), server-synced sort/filter state.

4. Legacy `ScreenerRow[]` (`/api/screener`)
- Components: `ScreenerAdapterBoundary` to normalize into shared row model.
- UI behavior: compatibility path to avoid UI breakage during migration.

5. `{ sectors }` (`/api/screener/filters`)
- Components: `SectorFacetGroup`, `FilterSidebar`, `FilterPillsRow`.
- UI behavior: lazy-loaded facets with optimistic chip toggles.

6. `OwnerWithPortfolio[]` (`/api/owners?detailed=true`)
- Components: `OwnerLeaderboard`, `OwnerTypeChart`, `PortfolioExpandTable`.
- UI behavior: virtualized list with per-owner expandable rows.

7. `TopOwner[]` (`/api/owners?detailed=false`)
- Components: `TopOwnerMiniList`, `InsightCallouts`.
- UI behavior: lightweight side panel snippet.

8. Auth session (`next-auth`)
- Components: `UserRail`, `PlanBadge`, `ProtectedFeatureGate`.
- UI behavior: clear locked-state messaging + upgrade CTA.

9. Payment token flow (`/api/payment/create`)
- Components: `UpgradePricingCard`, `CheckoutAction`, `PaymentStateBanner`.
- UI behavior: disabled submit, pending/success/error status states.

## 4) Proposed Routing Structure (Frontend-Only Re-architecture)

### 4.1 Route Tree
1. `/{locale}`
- Purpose: market overview command center.
- Data: `/api/stocks`, `/api/analytics`, optional `/api/owners` snippet.

2. `/{locale}/screener`
- Purpose: AI + valuation screening workspace.
- Data: `/api/stocks/enriched` as primary; `/api/screener/filters` for facets.

3. `/{locale}/owners`
- Purpose: ownership intelligence and portfolio concentration.
- Data: `/api/owners?detailed=true` plus optional `/api/analytics` overlays.

4. `/{locale}/watchlist`
- Purpose: user-saved symbols and notes (future-ready shell).
- Data: no backend change; consume current auth/session and existing endpoints as available.

5. `/{locale}/profile`
- Purpose: account + plan status center.
- Data: next-auth session and user plan.

6. `/{locale}/upgrade`
- Purpose: subscription conversion flow.
- Data: `/api/payment/create`; webhook remains backend-side.

### 4.2 Suggested App-Shell Component Hierarchy
1. `AppShell`
- `GlobalSidebar` (desktop) / `MobileNavBar` (mobile)
- `TopCommandBar` (search, locale switcher, account, plan)
- `MainContentOutlet`
- `GlobalToaster` + `NetworkStatusPill`

2. Domain layout inside shell
- `GovernanceLayout`
- `ScreenerLayout`
- `OwnersLayout`

## 5) Design System Core Tokens (Domain-Appropriate)

### 5.1 Color Tokens
1. Base surfaces
- `--bg-canvas: #06131A`
- `--bg-panel: #0C1E27`
- `--bg-elevated: #112A36`

2. Content
- `--text-primary: #E8F2F7`
- `--text-secondary: #9FB7C4`
- `--text-muted: #6D8794`

3. Semantic
- `--accent-info: #2E8BC0`
- `--accent-positive: #2FA66A`
- `--accent-warning: #D7A33C`
- `--accent-danger: #D95C5C`

4. Tier/risk
- `--tier-green: #34C38F`
- `--tier-amber: #F4B740`
- `--tier-red: #E16363`
- `--risk-high: #E16363`
- `--risk-medium: #D7A33C`
- `--risk-low: #34C38F`

5. Borders and effects
- `--border-subtle: rgba(159, 183, 196, 0.22)`
- `--focus-ring: #52B6E8`
- `--shadow-soft: 0 10px 30px rgba(3, 10, 14, 0.35)`

### 5.2 Typography Tokens
1. Families
- UI sans: DM Sans (existing, keep for continuity).
- Data mono: DM Mono for tickers/numeric microcopy.

2. Scale
- `--text-xs: 12px`
- `--text-sm: 14px`
- `--text-md: 16px`
- `--text-lg: 20px`
- `--text-xl: 28px`
- `--text-2xl: 36px`

3. Weights
- `--weight-regular: 400`
- `--weight-medium: 500`
- `--weight-semibold: 600`
- `--weight-bold: 700`

### 5.3 Spacing / Radius / Touch
1. Spacing scale: `4, 8, 12, 16, 20, 24, 32, 40, 48`.
2. Radius: `10` (small controls), `14` (cards), `20` (panels).
3. Touch target minimum: `44px` for all interactive controls on mobile.

## 6) UX Strategy For Existing Complex Features

### 6.1 Multi-dimensional Filtering (Stocks + Screener)
1. Use a single filter state model serialized to URL query params.
2. Separate fast local UI interactions from debounced network fetch.
3. Show active filter chips with one-click remove and clear-all action.

### 6.2 High-density Financial Data Readability
1. Sticky table header + first column for large datasets.
2. Numeric alignment right, ticker/issuer left, trend color coding.
3. Progressive disclosure: compact row -> quick detail drawer -> full panel.

### 6.3 Owners Portfolio Drilldown
1. Expandable owner rows with clear count and concentration summary.
2. Lazy-render stock sublists to keep interaction smooth.
3. Empty/error states per block, not full-page failure.

### 6.4 Plan Gating And Upgrade Flow
1. Do not hard-hide features; show blurred previews with value proposition.
2. Preserve user context when redirecting to auth/payment.
3. Payment statuses (pending/success/error) surfaced as persistent banners.

### 6.5 Accessibility Strategy
1. Keyboard-first navigation through filters, tabs, and tables.
2. Full ARIA labels for icon-only controls and chart descriptions.
3. WCAG AA contrast targets with semantic color fallback for color-blind users.
4. Skeleton loaders mirror final layout shape to reduce perceived layout shift.

## 7) Current Console Error Audit (From Your Report)
1. `bybit:page provider inject code` and `i18next: ...`
- Likely source: browser extension/content script injection (not app runtime).
- Evidence: app uses `next-intl`, not i18next initialization in app code.

2. `Permissions-Policy ... Unrecognized feature ...`
- Likely source: third-party response headers (extension/injected context or upstream script context), not project-level headers currently set in Next config.
- Current app headers only include X-Frame-Options, X-Content-Type-Options, Referrer-Policy, HSTS.

3. Recommended verification step before Phase 1
- Re-test in clean browser profile or Incognito with extensions disabled.
- Re-check console to separate extension noise from app-originated errors.

## 8) Phase 0 Exit Criteria
- Completed: data-to-component mapping.
- Completed: proposed routing structure.
- Completed: design system core tokens (color + typography + spacing).
- Completed: UX strategy for complex existing features.
- Completed: console-error triage context.

## STOP
Phase 0 is complete. Awaiting your approval before any Phase 1 actions (git branching, legacy UI cleanup, dependency changes, and implementation).