# SP1-05: Release Checklist & Rollback Runbook

**Status:** ✅ Complete  
**Assigned:** QA Engineer  
**Story Points:** 2  
**Sprint:** 1 - Foundation & Instrumentation

---

## 📋 Purpose

This document provides:
1. **Pre-release checklist** - Steps to verify before deploying to production
2. **Release procedure** - How to deploy safely
3. **Rollback runbook** - How to revert a bad deployment
4. **Post-release verification** - Health checks after deployment

**Audience:** Engineering team, QA, DevOps

---

## ✅ Pre-Release Checklist

### 1. Code Quality & Tests

#### Local Verification
- [ ] All tests passing locally
  ```bash
  npm run test              # Unit tests
  npm run test:e2e          # E2E smoke tests
  npm run lint              # ESLint checks
  npm run type-check        # TypeScript validation
  ```

- [ ] Build succeeds without warnings
  ```bash
  npm run build
  # Check for: TypeScript errors, bundle size warnings
  ```

- [ ] No console errors in development
  ```bash
  npm run dev
  # Open browser console, navigate all routes, check for errors
  ```

#### Git Status
- [ ] All changes committed to feature branch
- [ ] Branch up-to-date with `main`
  ```bash
  git fetch origin
  git merge origin/main
  # Resolve conflicts if any
  ```

- [ ] Clean git status (no uncommitted changes)
  ```bash
  git status
  # Should show: "working tree clean"
  ```

---

### 2. Environment Configuration

#### Environment Variables Check
- [ ] All required env vars documented in `.env.example`
- [ ] Production env vars set in Vercel dashboard
  - `DATABASE_URL` (MongoDB production URI)
  - `NEXTAUTH_URL` (https://stockscope.com)
  - `NEXTAUTH_SECRET` (strong random secret)
  - `MIDTRANS_SERVER_KEY` (production key)
  - `MIDTRANS_CLIENT_KEY` (production key)
  - `MIDTRANS_IS_PRODUCTION=true`
  - `SENTRY_DSN` (production DSN)
  - `NEXT_PUBLIC_SENTRY_DSN` (same as above)
  - `SENTRY_AUTH_TOKEN` (for source maps)
  - `ANTHROPIC_API_KEY` (production key)

- [ ] Secrets rotation completed (if scheduled)
  - Database credentials rotated every 90 days
  - API keys rotated every 90 days
  - JWT secrets rotated every 180 days

#### Database Status
- [ ] Migration dry-run successful
  ```bash
  npm run migrate:dev
  # Check output for errors
  ```

- [ ] Database backup created (production)
  ```bash
  # MongoDB Atlas: Create manual backup
  # OR local: mongodump --uri=$DATABASE_URL --out=backup-$(date +%Y%m%d)
  ```

- [ ] Migration plan documented (if schema changes)
  - Document in `prisma/migrations/README.md`
  - Estimate downtime (if any)
  - Rollback SQL prepared

---

### 3. Security Audit

#### Dependency Vulnerabilities
- [ ] No high/critical vulnerabilities
  ```bash
  npm audit
  # If issues found: npm audit fix
  # If cannot auto-fix: assess risk and document exceptions
  ```

- [ ] Dependencies up-to-date (or documented exceptions)
  ```bash
  npm outdated
  # Update non-breaking changes: npm update
  # Document major version holds in SECURITY.md
  ```

#### Security Headers
- [ ] Security headers configured in `next.config.ts`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security`
  - `Referrer-Policy`

- [ ] No hardcoded secrets in code
  ```bash
  # Search for common secret patterns
  git grep -E "(api_key|secret|password|token)\s*=\s*['\"][^'\"]{10,}"
  # Should return no matches with actual secrets
  ```

#### Authentication & Authorization
- [ ] NextAuth session expiry set (default: 30 days)
- [ ] Payment webhook signature validation enabled
- [ ] API rate limiting configured (if applicable)

---

### 4. Performance & Monitoring

#### Bundle Size
- [ ] Total bundle size < 500KB (gzipped)
  ```bash
  npm run build
  # Check "First Load JS" column in build output
  # Largest route should be < 200KB
  ```

- [ ] No unexpected bundle size increases (>20% growth)
  - Compare with previous build
  - Investigate large increases

#### Monitoring Setup
- [ ] Vercel Analytics enabled (automatic in production)
- [ ] Sentry DSN configured (errors will be tracked)
- [ ] Health check endpoint responding
  ```bash
  curl https://stockscope.com/api/health
  # Expected: 200 OK with JSON response
  ```

#### Web Vitals Baseline
- [ ] Current Web Vitals recorded (for comparison)
  - Go to Vercel Dashboard → Speed Insights
  - Note: LCP, FID, CLS values before deploy

---

### 5. Feature Flags & Rollout Plan

#### Feature Gates
- [ ] Premium features gated properly (if applicable)
- [ ] Feature flags set for gradual rollout (if applicable)
- [ ] Beta features disabled in production (if applicable)

#### Rollout Strategy
- [ ] Deployment type selected:
  - **Instant:** All users immediately (low-risk changes)
  - **Canary:** 10% → 50% → 100% (high-risk changes)
  - **Blue-Green:** Deploy to staging, swap after verification

---

### 6. Communication & Documentation

#### Team Notification
- [ ] Engineering team notified of deployment window
- [ ] On-call engineer assigned for next 24h
- [ ] Customer support team briefed (if user-facing changes)

#### Documentation Updated
- [ ] CHANGELOG.md updated with release notes
- [ ] API documentation updated (if API changes)
- [ ] User-facing docs updated (if UI changes)

---

## 🚀 Release Procedure

### Option A: Vercel Automatic Deployment (Recommended)

#### Step 1: Merge to Main
```bash
# From feature branch
git checkout main
git pull origin main
git merge --no-ff sprint-1/foundation
git push origin main
```

**Result:** Vercel automatically builds and deploys to production.

#### Step 2: Monitor Deployment
1. Go to [Vercel Dashboard → Deployments](https://vercel.com/dashboard)
2. Watch build progress (typically 2-5 minutes)
3. Check build logs for errors
4. Wait for "Ready" status

#### Step 3: Verify Deployment
See "Post-Release Verification" section below.

---

### Option B: Manual Deployment via Vercel CLI

#### Step 1: Install Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### Step 2: Deploy to Preview First
```bash
# Deploy to preview URL for final check
vercel --prod=false

# Test preview URL: https://stockscope-<hash>.vercel.app
# Run smoke tests against preview
```

#### Step 3: Promote to Production
```bash
# After preview verification passes
vercel --prod

# Or alias preview to production domain
vercel alias https://stockscope-<hash>.vercel.app stockscope.com
```

---

### Option C: Database Migration Deployment (Schema Changes)

**⚠️ Use this for releases with database schema changes.**

#### Step 1: Enable Maintenance Mode (if needed)
```bash
# Set environment variable in Vercel
MAINTENANCE_MODE=true

# App will show maintenance page (create one if not exists)
```

#### Step 2: Run Migration
```bash
# Connect to production database
export DATABASE_URL="mongodb+srv://production-uri"

# Run migration
npm run migrate:deploy

# Verify migration
npm run prisma db pull
```

#### Step 3: Deploy Code
```bash
# Deploy application code
git push origin main

# Wait for Vercel deployment
```

#### Step 4: Disable Maintenance Mode
```bash
# Remove maintenance mode in Vercel dashboard
MAINTENANCE_MODE=false
```

---

## 🔄 Rollback Runbook

### When to Rollback

**Immediate Rollback Triggers (P0):**
- Payment processing broken (cannot charge users)
- Authentication broken (cannot sign in)
- Data corruption detected
- Error rate > 10% for 5 minutes
- Site completely down

**Assess Before Rollback (P1):**
- Error rate 2-10% (investigate root cause first)
- Performance degradation (check if temporary spike)
- Non-critical feature broken (may be acceptable temporarily)

---

### Rollback Method 1: Vercel Instant Rollback (Fastest)

**Time to rollback:** 30 seconds

#### Step 1: Identify Previous Deployment
1. Go to [Vercel Dashboard → Deployments](https://vercel.com/dashboard)
2. Find last known-good deployment (marked "Production" before current)
3. Note the deployment URL

#### Step 2: Promote Previous Deployment
1. Click on the good deployment
2. Click "Promote to Production" button
3. Confirm promotion

**Result:** Traffic instantly switches to previous version.

#### Step 3: Verify Rollback
```bash
# Check production is serving old version
curl -I https://stockscope.com
# Look for x-vercel-id header (should match old deployment)

# Run health check
curl https://stockscope.com/api/health
```

---

### Rollback Method 2: Git Revert (Code-Level)

**Time to rollback:** 5-10 minutes (includes build time)

#### Step 1: Identify Bad Commit
```bash
git log --oneline -10
# Find the commit that introduced the issue
```

#### Step 2: Revert Commit
```bash
# Revert the bad commit (keeps history)
git revert <bad-commit-hash>

# OR create a revert merge commit
git revert -m 1 <merge-commit-hash>
```

#### Step 3: Push to Main
```bash
git push origin main
# Vercel will auto-deploy the revert
```

---

### Rollback Method 3: Database Migration Rollback

**⚠️ Only if schema changes caused the issue.**

#### Step 1: Assess Data Loss Risk
- Will rolling back migration delete user data?
- Are there irreversible changes?
- **STOP if data loss is possible** → Consult team first

#### Step 2: Backup Current State
```bash
# Create emergency backup
mongodump --uri=$DATABASE_URL --out=emergency-backup-$(date +%Y%m%d-%H%M)
```

#### Step 3: Revert Migration
```bash
# MongoDB: Manual revert (no built-in down migrations)
# 1. Drop new collections/fields
# 2. Restore from backup if needed

# Example: Remove new field
mongo $DATABASE_URL --eval 'db.users.updateMany({}, {$unset: {newField: ""}})'
```

#### Step 4: Deploy Old Code
```bash
# Use Vercel rollback to previous deployment
# OR git revert and redeploy
```

---

### Rollback Method 4: Environment Variable Rollback

**If issue is caused by wrong env var value.**

#### Step 1: Identify Problem Variable
- Check Sentry errors for clues
- Compare current vs previous env vars

#### Step 2: Revert in Vercel Dashboard
1. Go to [Vercel → Project → Settings → Environment Variables](https://vercel.com/dashboard)
2. Find the problematic variable
3. Edit to previous value
4. Click "Save"

#### Step 3: Redeploy
```bash
# Trigger redeploy with new env vars
vercel --prod

# OR use Vercel dashboard: Deployments → Redeploy
```

---

## ✅ Post-Release Verification

**Run within 15 minutes of deployment.**

### 1. Critical Path Testing

#### Authentication Flow
```bash
# Manual test:
1. Go to https://stockscope.com
2. Click "Sign In with Google"
3. Complete OAuth flow
4. Verify you're signed in (see profile picture)
5. Sign out
6. Verify signed out (see "Sign In" button again)
```

**Expected:** All steps succeed without errors.

#### Payment Flow (if payment changes deployed)
```bash
# Manual test:
1. Go to https://stockscope.com/upgrade
2. Click "Upgrade to Premium"
3. Fill payment form (use test card)
4. Complete payment
5. Verify subscription activated (dashboard shows premium badge)
```

**Expected:** Payment processes successfully.

#### API Health Checks
```bash
# Automated checks:
curl https://stockscope.com/api/health
# Expected: {"status": "ok", "timestamp": "..."}

curl https://stockscope.com/api/stocks?limit=10
# Expected: 200 OK with stock array

curl https://stockscope.com/api/stocks/enriched?limit=5
# Expected: 200 OK with enriched data
```

**All checks must return 200 OK.**

---

### 2. Error Monitoring

#### Sentry Dashboard
1. Go to [Sentry Dashboard → Issues](https://sentry.io)
2. Filter: Last 15 minutes
3. Check: No new critical errors
4. Acceptable: < 1% error rate

#### Vercel Logs
```bash
# View real-time logs
vercel logs --follow

# Look for:
# - 500 Internal Server Errors
# - Uncaught exceptions
# - Database connection errors
```

**Action:** If error rate > 2%, investigate immediately.

---

### 3. Performance Verification

#### Web Vitals Check
1. Go to [Vercel → Speed Insights](https://vercel.com/dashboard)
2. Compare to pre-deployment baseline
3. Check for degradation:
   - LCP increase > 1s → Investigate
   - FID increase > 50ms → Investigate
   - CLS increase > 0.1 → Investigate

#### API Response Times
```bash
# Test API latency
time curl https://stockscope.com/api/stocks/enriched?limit=10

# Expected: < 2 seconds
# If > 3 seconds: Check database connection and queries
```

---

### 4. Database Health

#### Connection Pool Status
```bash
# Check active connections (MongoDB Atlas)
# Dashboard → Metrics → Connections
# Should be < 100 connections normally
```

#### Query Performance
```bash
# Check slow query log (if enabled)
# Look for queries > 1s execution time
```

---

### 5. Feature Verification

#### Smoke Test All New Features
For each feature in this release:
- [ ] Feature accessible to target users
- [ ] Feature behaves as documented
- [ ] Feature doesn't break existing flows

#### Regression Check
Test 2-3 core features NOT changed in this release:
- [ ] Screener still works
- [ ] Dashboard still loads
- [ ] Search still returns results

**Purpose:** Ensure deployment didn't break unrelated features.

---

## 📊 Post-Deployment Monitoring Schedule

### First Hour
- [ ] Check Sentry every 15 minutes
- [ ] Monitor Vercel logs continuously
- [ ] Watch for user reports in support channels

### First 24 Hours
- [ ] Check Sentry every 2 hours
- [ ] Review error rate trends (should be stable)
- [ ] Monitor payment success rate (should be > 99%)

### First Week
- [ ] Daily Sentry review (morning standup)
- [ ] Compare Web Vitals to baseline (weekly meeting)
- [ ] Check for any regression reports

---

## 🔔 Alerting Configuration

### Sentry Alerts (Configure in Sentry Dashboard)

#### Critical Alerts (PagerDuty)
- Error rate > 5% for 5 minutes → Page on-call
- Payment webhook failure → Page on-call immediately
- Database connection errors → Page on-call

#### High Priority Alerts (Slack)
- Error rate > 2% for 10 minutes
- API P95 latency > 5s
- Authentication failure rate > 1%

#### Informational Alerts (Email)
- Daily error summary
- Weekly performance report
- Monthly security scan results

---

## 📝 Incident Response Template

**Use this template when rollback is triggered:**

```markdown
## Incident Report: [Brief Title]

**Date:** YYYY-MM-DD HH:MM UTC
**Severity:** P0 / P1 / P2
**Status:** Investigating / Mitigated / Resolved

### Timeline
- HH:MM - Deployment completed
- HH:MM - Issue detected (how?)
- HH:MM - Rollback initiated
- HH:MM - Rollback completed
- HH:MM - Incident resolved

### Impact
- **Users affected:** X users / Y% of total
- **Duration:** X minutes
- **Functionality broken:** [describe]

### Root Cause
[What caused the issue? Be specific.]

### Resolution
- [x] Rolled back to deployment: [deployment-id]
- [x] Verified rollback successful
- [x] Notified team in #incidents Slack channel

### Preventive Measures
1. [Action to prevent recurrence]
2. [Additional testing needed]
3. [Monitoring improvement]

### Follow-up Tasks
- [ ] Create Jira ticket for root cause fix
- [ ] Update pre-release checklist with new check
- [ ] Schedule post-mortem meeting (if P0/P1)
```

---

## 🧰 Emergency Contacts

### On-Call Rotation
| Week | Primary | Backup |
|------|---------|--------|
| Week 1 | [Engineer A] | [Engineer B] |
| Week 2 | [Engineer B] | [Engineer C] |
| Week 3 | [Engineer C] | [Engineer A] |

### Escalation Path
1. **On-call engineer** (check PagerDuty)
2. **Engineering Lead** (if on-call unavailable)
3. **CTO** (if critical and leads unavailable)

### Communication Channels
- **Slack:** #incidents (for real-time coordination)
- **PagerDuty:** Critical alerts
- **Email:** Weekly summaries

---

## 🔐 Access Requirements

### Required Accesses for Release Engineer

- [ ] GitHub: Write access to repository
- [ ] Vercel: Admin access to project
- [ ] MongoDB Atlas: Read/Write access to production cluster
- [ ] Sentry: Admin access to project
- [ ] PagerDuty: On-call schedule access (if on rotation)

---

## 📚 References

- [Vercel Deployment Docs](https://vercel.com/docs/deployments/overview)
- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [MongoDB Backup Guide](https://www.mongodb.com/docs/atlas/backup-restore/)
- [Sentry Alerting Docs](https://docs.sentry.io/product/alerts/)

---

## ✅ Sprint 1 Completion Checklist

**Before marking Sprint 1 complete:**

- [ ] SP1-01: Migration framework & schema versioning ✅
- [ ] SP1-02: Smoke tests for auth, stocks, webhooks ✅
- [ ] SP1-03: Observability dashboards ✅
- [ ] SP1-04: Event taxonomy v1 ✅
- [ ] SP1-05: Release checklist & rollback runbook ✅
- [ ] All Sprint 1 code merged to `main`
- [ ] All Sprint 1 documentation in `docs/` folder
- [ ] Sprint 1 branch cleaned up (optional)

**Sprint 1 Success Criteria:**
- Database migrations automated with CI/CD
- 17 E2E smoke tests passing
- Vercel + Sentry monitoring live
- Event taxonomy frozen for Sprint 4
- Release runbook ready for production deployments

---

## 🔄 Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-03-30 | Initial release checklist | QA Engineer |

---

**Status:** 🔒 **APPROVED FOR USE**
