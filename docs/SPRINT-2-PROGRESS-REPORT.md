# Sprint 2 Progress Report

**Epic:** EPIC-02: User-Owned Data Features  
**Status:** IN PROGRESS (8/32 SP complete, 25%)  
**Branch:** `sprint-1/foundation` (continuing from Sprint 1)  
**Started:** March 30, 2026  
**Target Completion:** April 7, 2026

---

## Overview

Sprint 2 focuses on user personalization features:
- Watchlists for tracking favorite stocks
- Saved screener filter configurations  
- Price threshold alerts with notifications
- User profile and locale preferences

These features enable users to customize their research experience and receive timely market insights.

---

## Task Progress

| Task | Title | SP | Status | Completion | Notes |
|------|-------|----|----|------------|-------|
| SP2-01 | Watchlists & Items APIs | 8 | ✅ Done | 100% | 3 API routes, 2 models, Prisma 5 |
| SP2-02 | Saved Screeners APIs | 5 | 📋 Pending | 0% | Similar pattern to watchlists |
| SP2-03 | Watchlist UI | 8 | 📋 Pending | 0% | Depends on SP2-01 ✅ |
| SP2-04 | Price Threshold Alerts | 8 | 📋 Pending | 0% | Requires cron job setup |
| SP2-05 | Profile & Locale Preferences | 3 | 📋 Pending | 0% | Lightweight task |

**Total:** 8/32 SP complete (25%)

---

## SP2-01: Watchlists & Items APIs ✅

**Completion Date:** March 30, 2026  
**Story Points:** 8  
**Files Created:** 4 (3 routes + 1 doc)  
**Lines of Code:** 666 (routes only)

### Deliverables

#### API Endpoints (8 total)

1. **GET /api/watchlists** - List user's watchlists
2. **POST /api/watchlists** - Create new watchlist
3. **GET /api/watchlists/[id]** - Get watchlist with items
4. **PATCH /api/watchlists/[id]** - Update watchlist metadata
5. **DELETE /api/watchlists/[id]** - Delete watchlist (cascade)
6. **POST /api/watchlists/[id]/items** - Add stock to watchlist
7. **DELETE /api/watchlists/[id]/items** - Remove stock from watchlist
8. **PATCH /api/watchlists/[id]/items** - Reorder items (bulk update)

#### Database Schema

**Watchlist Model:**
- `id`, `userId`, `name`, `description`, `color`, `position`
- Indexes on `userId` and `userId + position`
- Timestamps: `createdAt`, `updatedAt`

**WatchlistItem Model:**
- `id`, `watchlistId`, `ticker`, `notes`, `position`, `addedAt`
- Indexes on `watchlistId` and `watchlistId + position`
- Cascade delete relation to Watchlist

#### Features Implemented

- ✅ Session-based authentication (NextAuth)
- ✅ User lookup by email from session
- ✅ Ownership verification on all write operations
- ✅ Drag-and-drop ordering via `position` field
- ✅ Duplicate ticker prevention (409 Conflict)
- ✅ Cascade deletes (delete watchlist → delete all items)
- ✅ Bulk position updates (transaction for reorder)
- ✅ Input validation (name, description length limits)
- ✅ Ticker normalization (uppercase)

### Technical Challenges

#### Issue: Prisma 7 MongoDB Adapter Requirement

**Problem:**
Prisma 7.6.0 throws error when using MongoDB:
```
Using engine type "client" requires either "adapter" or "accelerateUrl"
to be provided to PrismaClient constructor.
```

**Root Cause:**
Prisma 7 changed MongoDB client architecture to require:
- A database adapter (not available for vanilla MongoDB)
- Prisma Accelerate URL (requires paid account)

**Attempted Fixes:**
1. ❌ Added `engineType = "library"` to generator → still failed
2. ❌ Created `prisma.config.ts` with explicit config → still failed
3. ✅ **Downgraded to Prisma 5.22.0** → build passed

**Solution Details:**
- Removed `prisma.config.ts` (Prisma 7 only)
- Restored `url = env("DATABASE_URL")` in datasource block
- Updated `package.json`: `prisma@5.22.0`, `@prisma/client@5.22.0`
- Regenerated client with `npm run prisma:generate`

**Impact:** None. Prisma 5.22.0 is stable, production-ready, and fully supports MongoDB.

### Files Created

```
app/api/watchlists/route.ts                  154 lines
app/api/watchlists/[id]/route.ts             238 lines
app/api/watchlists/[id]/items/route.ts       274 lines
docs/SP2-01-WATCHLIST-API.md                 542 lines (13.5KB)
```

### Files Modified

```
prisma/schema.prisma                         +50 lines (Watchlist, WatchlistItem)
package.json                                 Prisma 7.6.0 → 5.22.0
```

### Testing

**Build Status:** ✅ Passing  
**Routes Compiled:** 22 total (3 new watchlist routes)

**Manual Testing Required:**
- Test with authenticated session token
- Verify CRUD operations work end-to-end
- Test ownership verification (403 Forbidden)
- Test duplicate ticker prevention (409 Conflict)
- Test cascade delete behavior

**E2E Tests:** TODO in SP2-03 (when UI is built)

### Commit

```
602cf08 feat(api): watchlist CRUD APIs with Prisma 5
```

**Commit Message:**
```
SP2-01: Watchlists & Items APIs (8 SP)

Endpoints: GET/POST /api/watchlists, GET/PATCH/DELETE /api/watchlists/[id],
POST/DELETE/PATCH /api/watchlists/[id]/items

Schema: Watchlist, WatchlistItem models with position-based ordering

Auth: Session-based via NextAuth, ownership verification

Features: drag-drop ordering, duplicate prevention, cascade deletes,
bulk position updates

Technical: Downgraded Prisma 7.6.0 → 5.22.0 (MongoDB adapter issue)

Build: ✅ Passing (all 22 routes compiled)
```

---

## Next Steps

### SP2-02: Saved Screeners APIs (5 SP)

**Goal:** Persist user filter configurations so they can save and reload screener searches.

**Endpoints:**
- POST /api/saved-screeners (save current filters)
- GET /api/saved-screeners (list saved)
- GET /api/saved-screeners/[id] (load filters)
- DELETE /api/saved-screeners/[id] (delete saved)

**Schema:**
```prisma
model SavedScreener {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  name        String
  filters     Json     // { sector, aiTier, govTier, scoreRange, ... }
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@map("saved_screeners")
}
```

**Similar Pattern:** Same auth flow as watchlists (session → user lookup → ownership check)

**Estimated Time:** 3-4 hours (simpler than watchlists, no nested items)

---

### SP2-03: Watchlist UI (8 SP)

**Depends On:** SP2-01 ✅ (APIs complete)

**Goal:** Build frontend components that consume watchlist APIs.

**Components:**
1. **WatchlistSidebar** - List all watchlists, create button
2. **WatchlistDetail** - Display items, drag-drop reorder
3. **AddToWatchlistModal** - Add stock from screener/detail
4. **WatchlistCard** - Mobile-optimized card view

**Features:**
- Drag-and-drop reordering (react-beautiful-dnd or dnd-kit)
- Bulk add/remove stocks
- Share watchlist (public link)
- Real-time stock price updates

**Integration Points:**
- Screener table: "Add to Watchlist" button on each row
- Stock detail page: "Add to Watchlist" in header
- Navigation: "Watchlists" menu item

**Estimated Time:** 8-10 hours (complex interactions, drag-drop)

---

### SP2-04: Price Threshold Alerts (8 SP)

**Goal:** Notify users when a stock crosses their defined price threshold.

**Schema:**
```prisma
model PriceAlert {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  userId      String   @db.ObjectId
  ticker      String
  condition   String   // "above" | "below"
  targetPrice Float
  isActive    Boolean  @default(true)
  triggeredAt DateTime?
  createdAt   DateTime @default(now())
  
  @@index([userId])
  @@index([isActive])
  @@map("price_alerts")
}
```

**Cron Job:**
- Run every 15 minutes (Vercel Cron or external scheduler)
- Fetch all active alerts
- Check current prices against thresholds
- Send notifications if triggered
- Mark alerts as triggered

**Notifications:**
- Email via SendGrid/Resend
- Push notifications via Firebase Cloud Messaging (optional)

**Estimated Time:** 8-10 hours (cron setup, notification service)

---

### SP2-05: Profile & Locale Preferences (3 SP)

**Goal:** Persist user UI preferences in database.

**Schema:**
```prisma
model UserPreferences {
  id            String  @id @default(auto()) @map("_id") @db.ObjectId
  userId        String  @unique @db.ObjectId
  language      String  @default("en") // "en" | "id"
  theme         String  @default("dark") // "light" | "dark" | "system"
  defaultView   String  @default("table") // "table" | "cards"
  emailNotifications Boolean @default(true)
  pushNotifications  Boolean @default(false)
  
  @@map("user_preferences")
}
```

**API Endpoints:**
- GET /api/preferences (load current user preferences)
- PATCH /api/preferences (update preferences)

**Integration:**
- Settings page UI
- Auto-apply on session load
- Override next-intl locale if language preference set

**Estimated Time:** 3-4 hours (straightforward CRUD)

---

## Sprint 2 Timeline

```
Week 1 (March 30 - April 5):
┌──────────────┬──────────────┬──────────────┐
│   SP2-01     │   SP2-02     │   SP2-03     │
│ Watchlists   │   Saved      │  Watchlist   │
│    APIs      │  Screeners   │     UI       │
│   (8 SP)     │   (5 SP)     │   (8 SP)     │
│     ✅       │   📋 TODO    │   📋 TODO    │
└──────────────┴──────────────┴──────────────┘

Week 2 (April 6-7):
┌──────────────┬──────────────┐
│   SP2-04     │   SP2-05     │
│    Price     │   Profile    │
│   Alerts     │ Preferences  │
│   (8 SP)     │   (3 SP)     │
│   📋 TODO    │   📋 TODO    │
└──────────────┴──────────────┘
```

**Current Status:** Week 1, Day 1 (March 30)  
**Progress:** 8/32 SP (25%)  
**On Track:** Yes ✅

---

## Key Learnings

### 1. Prisma Version Compatibility

**Lesson:** Prisma major version upgrades can introduce breaking changes in adapter requirements.

**Recommendation:** 
- Pin Prisma versions in `package.json` (no `^` caret)
- Test major version upgrades in isolated branches
- Check Prisma release notes for breaking changes

### 2. MongoDB Adapter Ecosystem

**Discovery:** Prisma 7 requires adapters for MongoDB, but no official adapter exists for vanilla MongoDB (only Prisma Accelerate).

**Implication:** Prisma 7 effectively requires Prisma Accelerate subscription for MongoDB users.

**Decision:** Stay on Prisma 5.x until:
- Official MongoDB adapter is released, OR
- Project switches to Prisma Accelerate (paid), OR
- Project migrates to PostgreSQL

### 3. Session-Based Auth Pattern

**Pattern:** NextAuth session → email lookup → user ID → ownership check

**Pros:**
- Simple and secure
- Works with existing NextAuth setup
- No need for user ID in JWT

**Cons:**
- Extra DB query per request (user lookup)
- Slightly higher latency (~10-20ms)

**Optimization Opportunity:**
- Store user ID in JWT token to skip lookup
- Implement in SP2-05 when refactoring session callback

---

## Dependencies for Next Sprint

### From Sprint 1 ✅
- ✅ Migration framework (Prisma)
- ✅ Event taxonomy (watchlist events defined)
- ✅ Monitoring (track API usage)

### For Sprint 2 Tasks
- SP2-03 needs SP2-01 ✅ (watchlist APIs)
- SP2-04 needs cron job setup (Vercel Cron or external)
- SP2-04 needs notification service (SendGrid/Resend API key)
- SP2-05 needs settings page UI

---

## Risk & Mitigation

### Risk 1: Drag-and-Drop Complexity (SP2-03)

**Risk:** Drag-and-drop can be tricky with React state + API updates.

**Mitigation:**
- Use battle-tested library (dnd-kit or react-beautiful-dnd)
- Optimistic updates (update UI immediately, then sync to API)
- Rollback on API error

### Risk 2: Cron Job Rate Limits (SP2-04)

**Risk:** Checking prices every 15 minutes for 1000+ alerts could hit API rate limits.

**Mitigation:**
- Batch price fetches (fetch all unique tickers once)
- Cache prices for 15 minutes
- Implement exponential backoff on errors

### Risk 3: Notification Delivery (SP2-04)

**Risk:** Email deliverability issues (spam, rate limits).

**Mitigation:**
- Use reputable service (SendGrid/Resend)
- Implement rate limiting (max 5 alerts per user per day)
- Add unsubscribe option

---

## Success Metrics (Sprint 2)

### Technical Metrics
- [ ] All 5 tasks completed (32 SP)
- [ ] Build passing with 0 errors
- [ ] API response times <200ms (p95)
- [ ] Test coverage >70% on new APIs

### User-Facing Metrics (Post-Deploy)
- [ ] Watchlist creation rate (target: 30% of active users)
- [ ] Average items per watchlist (target: 5-10)
- [ ] Saved screener usage (target: 15% of searches saved)
- [ ] Alert creation rate (target: 10% of users)
- [ ] Alert trigger success rate (target: >95%)

---

## Branch Status

**Current Branch:** `sprint-1/foundation`  
**Commits:** 10 total (1 new in Sprint 2)  
**Build:** ✅ Passing  
**Merge Target:** `main` (after Sprint 2 complete)

---

**Report Generated:** March 30, 2026  
**Next Update:** After SP2-02 completion
