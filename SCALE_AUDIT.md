# Scalability Audit (Phase 0)

## 1. API Endpoints Map for Swagger Documentation
*Note: The project leverages Next.js App Router API routes rather than Express. Swagger definitions will be structured as JSDoc comments over standard Next.js route handlers (`app/api/**/route.ts`).*

### Core Endpoints Identified
- **Screening & Market Data**
  - `/api/stocks` - Fetch general stock data.
  - `/api/screener` & `/api/screen` - Query logic for filtering tabular data.
  - `/api/daily-facts`, `/api/company-master` - Static and time-series facts.
- **User Tools**
  - `/api/alerts`, `/api/price-alerts` - Alert targets (Target for Redis/DB optimizations).
  - `/api/watchlists` - CRUD operations for user watchlists.
  - `/api/saved-screeners` - Retrieve user-configured screens.
- **AI & Indicators**
  - `/api/ai-scores` - Composite scoring and confidence intervals.
- **Billing & Account**
  - `/api/auth`, `/api/sessions`, `/api/preferences`
  - `/api/subscription`, `/api/payment`, `/api/transactions`

## 2. Caching Strategy (Redis v4.3.1)
- **Use Case**: Protect MongoDB from high-volume reads on public market data.
- **Configuration Details**:
  - **Global TTL (Time-to-Live)**: `60 seconds` for quote and screener queries that change frequently but operate identically across all users.
  - **Cache Key Design**: Format keys dynamically (`cache:route:{queryString}`).
- **Constraints**:
  - **DO NOT** globally cache user-owned data (e.g. `/api/watchlists`). If caching user-specific collections, keys must be strictly partitioned by `userId` and invalidated upon writes.

## 3. Database Indexes Review (Prisma/MongoDB)
*Note: The repository uses Prisma vs. native Mongoose, so indexes must be defined natively in `schema.prisma` via `@@index()` directives.*

### Current Observation
- Existent compound indexes check user associations e.g., `@@unique([watchlistId, ticker])`.
- Existing `DailyFact` has `@@unique([ticker, date])`.

### Required Indexes for Optimization
1. **Screener Optimization** 
   - Queries perform intensive sorting mathematically (`composite`, `pe`, `change`). 
   - **Recommendation**: Ensure index sets explicitly cover filtered categories like `sector` alongside sort metrics like `compositeScore` within `ai_score_snapshots`.
2. **Alert Triggering Validation**
   - The alert engine sweeps targets frequently.
   - **Recommendation**: Add a compound index targeting `@@index([isActive, targetPrice, ticker])` to rapidly fetch actionable targets during chron events.
3. **Ownership Filtering**
   - **Recommendation**: Compound index on `@@index([ticker, date, holderType])` to quickly surface institutional vs retail ownership.

---

**Next Steps**: Awaiting approval to proceed to Phase 1 (Branching, Installing Swagger & Cypress).
