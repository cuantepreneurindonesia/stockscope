# Stockscope Roadmap V3 - Implementation Summary

**Date:** 2026-03-29  
**Status:** DOCUMENTED & TRACKED  
**Total Tasks:** 35 tasks across 7 sprints  
**Total Story Points:** 193 SP  
**Estimated Duration:** 21 weeks (~5 months)

---

## ✅ What Was Completed

### 1. Plan Documentation
- ✅ **plan.md updated** with complete 7-sprint roadmap
- ✅ **35 SQL todos created** for tracking (sp1-01 through sp7-05)
- ✅ **Epic summaries** with priorities and story points
- ✅ **Timeline visualization** showing Q1-Q2 2026 schedule

### 2. Todo Database Structure

All 35 tasks are now tracked in SQL:

| Sprint | Tasks | Story Points | Status |
|--------|-------|--------------|--------|
| Sprint 1 | 5 | 18 SP | pending |
| Sprint 2 | 5 | 32 SP | pending |
| Sprint 3 | 5 | 31 SP | pending |
| Sprint 4 | 5 | 29 SP | pending |
| Sprint 5 | 5 | 31 SP | pending |
| Sprint 6 | 5 | 31 SP | pending |
| Sprint 7 | 5 | 21 SP | pending |

### 3. Three Parallel Initiatives Now Tracked

#### Initiative 1: User Feedback Fixes (ACTIVE)
- **Branch:** `fix/user-feedback-critical`
- **Status:** IN PROGRESS (1/11 issues)
- **Current:** Fixing Issue #2 (blank page on first load)
- **See:** FEEDBACK_AUDIT.md

#### Initiative 2: Stitch Redesign
- **Branch:** `feature/stitch-complete-redesign`
- **Status:** 20% complete (Phase 1 done)
- **Next:** Phase 2 - Core Components

#### Initiative 3: Product Roadmap V3 (NEW)
- **Status:** DOCUMENTED, ready to start
- **Next Sprint:** Sprint 1 (Foundation & Instrumentation)

---

## 📋 Sprint Breakdown

### Sprint 1: Foundation & Instrumentation (18 SP)
**Goal:** Production infrastructure readiness

- SP1-01: Migration framework & schema versioning (5 SP)
- SP1-02: Smoke tests for auth, stocks, webhooks (5 SP)
- SP1-03: API & webhook observability dashboards (3 SP)
- SP1-04: Define event taxonomy v1 (3 SP)
- SP1-05: Release checklist & rollback runbook (2 SP)

**Key Deliverables:**
- Database migration tool integrated with CI/CD
- E2E test suite with Playwright/Cypress
- Monitoring dashboards for APIs and webhooks
- Event naming standards documentation

---

### Sprint 2: User-Owned Data (32 SP)
**Goal:** Personalization features

- SP2-01: Watchlists & items APIs (8 SP)
- SP2-02: Saved screeners APIs (5 SP)
- SP2-03: Watchlist UI with drag-drop (8 SP)
- SP2-04: Price threshold alerts with notifications (8 SP)
- SP2-05: Profile & locale preferences persistence (3 SP)

**Key Deliverables:**
- Watchlist CRUD endpoints
- Saved filter configurations
- Email/push notification system
- User preferences storage

---

### Sprint 3: Research Data Pipeline (31 SP)
**Goal:** Historical data and ownership tracking

- SP3-01: Split master & daily fact datasets (8 SP)
- SP3-02: Ownership snapshot pipeline (5 SP)
- SP3-03: AI/sentiment score versioning (5 SP)
- SP3-04: Data lineage & quality snapshots (5 SP)
- SP3-05: 1-3 year historical backfill (8 SP)

**Key Deliverables:**
- Separated time-series from master data
- Daily ownership snapshots from IDX
- AI model versioning system
- Historical data archive

---

### Sprint 4: Product Analytics (29 SP)
**Goal:** User behavior tracking

- SP4-01: Event ingestion API with validation (8 SP)
- SP4-02: Client tracking wrapper for core events (5 SP)
- SP4-03: Server-side payment outcome events (3 SP)
- SP4-04: Sessions & identity stitching (5 SP)
- SP4-05: Daily funnel aggregation job (8 SP)

**Key Deliverables:**
- Event collection endpoint
- Frontend instrumentation
- Session management
- Conversion funnel reports

---

### Sprint 5: Billing Ledger (31 SP)
**Goal:** Robust payment tracking

- SP5-01: Subscriptions collection & indexes (5 SP)
- SP5-02: Payment transactions with idempotency (8 SP)
- SP5-03: Persist pending transaction at checkout (5 SP)
- SP5-04: Webhook updates before plan upgrade (8 SP)
- SP5-05: Billing admin read endpoints (5 SP)

**Key Deliverables:**
- Subscription management schema
- Idempotent payment ledger
- Webhook-driven plan upgrades
- Admin billing dashboard

---

### Sprint 6: API Monetization (31 SP)
**Goal:** Developer platform

- SP6-01: API keys with secure hashing (5 SP)
- SP6-02: API usage hourly metering (8 SP)
- SP6-03: Rate limit & quota enforcement (8 SP)
- SP6-04: API packages by plan scope (5 SP)
- SP6-05: Usage dashboard & billing export (5 SP)

**Key Deliverables:**
- API key generation system
- Usage metering and rate limiting
- Tiered API access by plan
- Developer portal

---

### Sprint 7: Paywall & Growth (21 SP)
**Goal:** Monetization optimization

- SP7-01: Backend feature-tier gating (5 SP)
- SP7-02: Frontend premium access controls (5 SP)
- SP7-03: Pricing & CTA experiments (5 SP)
- SP7-04: Cancellation flow & churn capture (3 SP)
- SP7-05: Hypercare with rollback triggers (3 SP)

**Key Deliverables:**
- Plan-based feature restrictions
- Upgrade prompts and modals
- A/B testing framework
- Cancellation flow with feedback

---

## 🎯 How to Use This Plan

### Query Todos by Sprint
```sql
-- Get all Sprint 1 tasks
SELECT id, title, status 
FROM todos 
WHERE id LIKE 'sp1-%' 
ORDER BY id;

-- Get pending tasks for current sprint
SELECT id, title, description 
FROM todos 
WHERE id LIKE 'sp1-%' AND status = 'pending';

-- Mark task in progress
UPDATE todos 
SET status = 'in_progress' 
WHERE id = 'sp1-01';

-- Mark task complete
UPDATE todos 
SET status = 'done' 
WHERE id = 'sp1-01';
```

### Track Sprint Progress
```sql
-- Sprint completion percentage
SELECT 
  SUBSTRING(id, 1, 4) as sprint,
  COUNT(*) as total_tasks,
  SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as completed,
  ROUND(100.0 * SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) / COUNT(*), 1) as completion_pct
FROM todos 
WHERE id LIKE 'sp%'
GROUP BY SUBSTRING(id, 1, 4)
ORDER BY sprint;
```

### Dependencies Between Sprints
Some sprints have dependencies:
- Sprint 4 (Analytics) depends on Sprint 1 (Event Taxonomy)
- Sprint 5 (Billing) required for Sprint 6 (API Monetization)
- Sprint 7 (Paywall) depends on Sprint 5 (Subscriptions)

---

## 📊 Resource Allocation

### By Role

| Role | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Sprint 6 | Sprint 7 | Total SP |
|------|----------|----------|----------|----------|----------|----------|----------|----------|
| Backend Engineer | 5 | 21 | 0 | 16 | 31 | 13 | 10 | 96 |
| Frontend Engineer | 0 | 11 | 0 | 5 | 0 | 5 | 10 | 31 |
| Data Engineer | 0 | 0 | 31 | 8 | 0 | 8 | 0 | 47 |
| QA Engineer | 7 | 0 | 0 | 0 | 0 | 0 | 0 | 7 |
| DevOps Engineer | 3 | 0 | 0 | 0 | 0 | 0 | 3 | 6 |
| Product Manager | 3 | 0 | 0 | 0 | 0 | 5 | 5 | 13 |

### Velocity Assumptions
- **Team Size:** 6 people (1 per role)
- **Sprint Duration:** 3 weeks
- **Target Velocity:** 25-32 SP per sprint
- **Actual Planned:** 18-32 SP per sprint (well-calibrated)

---

## 🚀 Next Steps

### To Start Sprint 1:
1. **Review plan.md** - Read Sprint 1 section in detail
2. **Query Sprint 1 todos:**
   ```sql
   SELECT * FROM todos WHERE id LIKE 'sp1-%';
   ```
3. **Assign tasks** to team members
4. **Mark first task in progress:**
   ```sql
   UPDATE todos SET status = 'in_progress' WHERE id = 'sp1-01';
   ```
5. **Create feature branch:** `git checkout -b sprint-1/foundation`

### Recommended Start Order:
1. SP1-04 (Event Taxonomy) - Defines standards for Sprint 4
2. SP1-01 (Migrations) - Foundation for all database work
3. SP1-03 (Observability) - Monitor as you build
4. SP1-02 (Smoke Tests) - Catch regressions early
5. SP1-05 (Runbook) - Prepare for production

---

## 📝 Status Tracking

### Current State (2026-03-29)
- **Sprint 1:** 0/5 tasks complete (0%)
- **Sprint 2:** 0/5 tasks complete (0%)
- **Sprint 3:** 0/5 tasks complete (0%)
- **Sprint 4:** 0/5 tasks complete (0%)
- **Sprint 5:** 0/5 tasks complete (0%)
- **Sprint 6:** 0/5 tasks complete (0%)
- **Sprint 7:** 0/5 tasks complete (0%)

**Overall Progress:** 0/35 tasks (0%)

### How to Update
After completing each task:
1. Update SQL: `UPDATE todos SET status = 'done' WHERE id = 'sp1-01';`
2. Update this file with new percentages
3. Commit both changes together

---

## 🔗 Related Documents

- **Full Plan:** `~/.copilot/session-state/.../plan.md`
- **Feedback Fixes:** `FEEDBACK_AUDIT.md` (separate initiative)
- **Stitch Redesign:** `STITCH_REDESIGN_MASTER_PLAN.md` (separate initiative)

---

**Last Updated:** 2026-03-29  
**Plan Version:** V3  
**Status:** Ready to Start Sprint 1 🚀
