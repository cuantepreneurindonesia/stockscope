# SP1-03: API and Webhook Observability Dashboards

**Status:** ✅ Complete  
**Assigned:** DevOps Engineer  
**Story Points:** 3  
**Sprint:** 1 - Foundation & Instrumentation

---

## Overview

This task establishes comprehensive observability for the Stockscope platform, enabling real-time monitoring of application performance, errors, and user behavior. We've integrated Vercel Analytics, Speed Insights, and Sentry for error tracking.

---

## 📊 Observability Stack

### 1. **Vercel Analytics** (Web Vitals & Page Views)
- **What:** Tracks Core Web Vitals (LCP, FID, CLS, FCP, TTFB, INP)
- **Where:** Automatic in production, opt-in for development
- **Dashboard:** [Vercel Dashboard → Analytics](https://vercel.com/dashboard)

**Metrics Tracked:**
- Page load performance
- Route-specific performance
- User geography
- Device & browser distribution
- Bounce rates

### 2. **Vercel Speed Insights** (Real User Monitoring)
- **What:** Real user performance data
- **Where:** All routes in production
- **Dashboard:** [Vercel Dashboard → Speed Insights](https://vercel.com/dashboard)

**Metrics Tracked:**
- Real user latency (P50, P75, P95, P99)
- Route performance trends
- Device-specific performance
- Time to First Byte (TTFB)

### 3. **Sentry** (Error & Performance Monitoring)
- **What:** Full-stack error tracking and APM
- **Where:** Client, server, and edge runtimes
- **Dashboard:** [Sentry Dashboard](https://sentry.io)

**Features Enabled:**
- Error tracking (client + server)
- Performance monitoring (traces)
- Session replay (10% sample, 100% on errors)
- Source maps (production only)
- Environment isolation

---

## 🏗️ Implementation

### Files Created

1. **`sentry.client.config.ts`** - Client-side Sentry config
   - Error tracking
   - Session replay
   - Performance tracing
   - Masked PII in replays

2. **`sentry.server.config.ts`** - Server-side Sentry config
   - API error tracking
   - Server-side performance
   - Database query monitoring

3. **`sentry.edge.config.ts`** - Edge runtime Sentry config
   - Edge function errors
   - Middleware monitoring

4. **`instrumentation.ts`** - Next.js instrumentation hook
   - Auto-loads Sentry based on runtime
   - Enabled via `experimental.instrumentationHook`

### Files Modified

1. **`app/layout.tsx`**
   ```tsx
   import { Analytics } from '@vercel/analytics/react';
   import { SpeedInsights } from '@vercel/speed-insights/next';
   
   // Added to body:
   <Analytics />
   <SpeedInsights />
   ```

2. **`next.config.ts`**
   - Added `experimental.instrumentationHook: true`
   - Wrapped config with `withSentryConfig()`
   - Configured source maps upload

3. **`.env.local`**
   - Added `SENTRY_DSN`
   - Added `NEXT_PUBLIC_SENTRY_DSN`
   - Added Vercel Analytics comment

### Dependencies Added
```bash
npm install @vercel/analytics @vercel/speed-insights @sentry/nextjs
```

---

## 🔧 Configuration

### Environment Variables

**Production (Vercel):**
```bash
# Sentry (get from sentry.io after creating project)
SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
NEXT_PUBLIC_SENTRY_DSN=https://xxx@xxx.ingest.us.sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_PROJECT=stockscope
SENTRY_AUTH_TOKEN=sntrys_xxx  # For source map upload

# Vercel Analytics (automatic)
# No configuration needed - enabled by default in production
```

**Development (local):**
```bash
# Sentry disabled in development (enabled: false when NODE_ENV !== 'production')
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Vercel Analytics opt-in for dev:
# VERCEL_ENV=development
```

---

## 📈 Dashboard Access

### Vercel Analytics
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select `stockscope` project
3. Click **Analytics** tab
4. View:
   - **Overview:** Traffic, top pages, geography
   - **Web Vitals:** LCP, FID, CLS scores per route
   - **Audience:** Devices, browsers, locations

### Vercel Speed Insights
1. Same dashboard as Analytics
2. Click **Speed Insights** tab
3. View:
   - **Real User Monitoring:** P50/P75/P95/P99 latency
   - **Route Performance:** Slowest routes ranked
   - **Device Breakdown:** Mobile vs desktop performance

### Sentry Dashboard
1. Go to [sentry.io](https://sentry.io)
2. Select `stockscope` project
3. Key sections:
   - **Issues:** All errors grouped by type
   - **Performance:** Transaction traces, slow APIs
   - **Replays:** Session recordings (errors only)
   - **Releases:** Deploy tracking with source maps

---

## 🎯 Key Metrics to Monitor

### API Endpoints (`/api/*`)

**Response Time Targets:**
- `/api/stocks/enriched` → < 2s (P95)
- `/api/stocks/search` → < 500ms (P95)
- `/api/auth/*` → < 1s (P95)

**Error Rate Targets:**
- All APIs → < 1% error rate
- Payment webhooks → < 0.1% error rate

**Monitoring in Sentry:**
1. Go to **Performance** → **Transactions**
2. Filter by: `http.method:GET` or `transaction:/api/*`
3. Alert on: P95 > 3s or error rate > 2%

### Webhook Delivery (`/api/webhooks/midtrans`)

**Metrics to Track:**
- Delivery success rate → > 99.9%
- Processing time → < 500ms (P95)
- Retry attempts → < 5% of total

**Monitoring in Sentry:**
1. Tag webhooks with: `webhook.provider:midtrans`
2. Track: `webhook.event` (charge, refund, cancel)
3. Alert on: Failed webhooks with `status:500`

### Frontend Performance

**Core Web Vitals Targets:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **INP (Interaction to Next Paint):** < 200ms

**Pages to Monitor:**
1. Landing page (`/`)
2. Screener (`/screener`)
3. Dashboard (`/dashboard`)
4. Search results

**Monitoring in Vercel:**
- Automatically tracked in Web Vitals tab
- Shows per-route breakdown
- Compares against field data

---

## 🚨 Alerting Setup (Future: SP1-04)

**Recommended Alerts:**

1. **High Error Rate**
   - Condition: Error rate > 5% for 5 minutes
   - Action: Slack + Email to on-call

2. **Slow API Response**
   - Condition: P95 latency > 5s for 10 minutes
   - Action: Slack notification

3. **Payment Webhook Failures**
   - Condition: Any 500 error on `/api/webhooks/midtrans`
   - Action: Immediate PagerDuty alert

4. **Poor Web Vitals**
   - Condition: LCP > 4s for any route (P75)
   - Action: Weekly summary report

*Note: Alert configuration will be part of SP1-04 (Event Taxonomy) once taxonomy is finalized.*

---

## 🧪 Testing Observability

### Test Error Tracking
```tsx
// Add to any page during development:
<button onClick={() => { throw new Error("Test Sentry error") }}>
  Trigger Error
</button>
```

**Expected:**
- Error appears in Sentry dashboard
- Stack trace shows exact file + line
- Breadcrumbs show user actions before error

### Test Performance Tracking
```bash
# Run production build locally
npm run build
npm start

# Navigate to pages and check:
# - Vercel Analytics (if opted in)
# - Sentry Performance tab shows transactions
```

### Test Session Replay
1. Trigger an error on the page
2. Go to Sentry → Replays
3. Watch 30s video of user session leading to error

---

## 📝 Operational Runbook

### Daily Checklist
- [ ] Check Sentry for new errors (morning standup)
- [ ] Review API response times in Performance tab
- [ ] Scan for any P95 > 3s transactions
- [ ] Check webhook delivery success rate

### Weekly Review
- [ ] Analyze Web Vitals trends (improving or degrading?)
- [ ] Review slowest pages in Speed Insights
- [ ] Check error frequency by release
- [ ] Update alert thresholds if needed

### On-Call Procedures

**When Alert Fires:**
1. **Check Sentry Issue**
   - View full stack trace
   - Check breadcrumbs for user actions
   - See affected users count

2. **Assess Impact**
   - How many users affected?
   - Is it blocking critical flows? (auth, payment)
   - Error rate increasing or isolated?

3. **Triage**
   - P0 (Critical): Payment, auth, data loss → Fix immediately
   - P1 (High): Broken features → Fix within 24h
   - P2 (Medium): UX issues → Fix in next sprint
   - P3 (Low): Edge cases → Backlog

4. **Rollback if Needed**
   - Vercel: Instantly revert to previous deployment
   - Check: `git log --oneline` to identify bad commit
   - Run: Rollback procedure (SP1-05)

---

## 🔐 Security & Privacy

### PII Masking
- **Session Replay:** All text and media masked by default
- **Error Messages:** Never log passwords, tokens, or PII
- **Source Maps:** Only uploaded to Sentry (not public)

### Data Retention
- **Sentry:** 90 days (configurable per plan)
- **Vercel Analytics:** 30 days (upgrade for more)
- **Logs:** Rotate after 7 days

### Access Control
- **Sentry:** Team members only (require 2FA)
- **Vercel:** Project members with appropriate roles
- **API Keys:** Rotate every 90 days

---

## ✅ Verification

**SP1-03 is complete when:**
- [x] Vercel Analytics tracking page views in production
- [x] Speed Insights showing real user metrics
- [x] Sentry installed (client, server, edge)
- [x] Instrumentation hook enabled
- [x] Environment variables documented
- [x] Dashboard access guide written
- [x] Key metrics defined with targets
- [x] Operational runbook created

---

## 📚 Resources

- [Vercel Analytics Docs](https://vercel.com/docs/analytics)
- [Vercel Speed Insights Docs](https://vercel.com/docs/speed-insights)
- [Sentry Next.js Docs](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Next.js Instrumentation](https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation)

---

## 🔄 Next Steps (Sprint 1)

- **SP1-04:** Define Event Taxonomy v1 (custom tracking events)
- **SP1-05:** Create Release Checklist & Rollback Runbook
- **Sprint 2:** Add custom events for watchlist, screener, alerts
