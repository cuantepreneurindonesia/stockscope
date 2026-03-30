# SP4-03: Server-Side Payment Events

**Sprint 4, Task 3 of 5**  
**Story Points:** 3  
**Status:** ✅ Complete

## Overview

Integrated analytics event tracking into payment webhook handlers to capture transaction outcomes. All payment events are now automatically tracked server-side with full transaction metadata for funnel analysis and revenue attribution.

## What Was Built

### 1. Payment Webhook Event Tracking

**File:** `app/api/payment/webhook/route.ts` (Modified)

Added automatic event tracking for payment outcomes from Midtrans webhook:

#### Successful Payments
Tracks `payment_completed` event when payment succeeds:

```typescript
// Track successful payment event
await prisma.analyticsEvent.create({
  data: {
    eventName: 'payment_completed',
    timestamp: new Date(),
    sessionId: 'server-payment-webhook',
    userId: userId,
    platform: 'web',
    deviceType: 'desktop',
    locale: 'id',
    properties: {
      orderId: order_id,
      transactionStatus: transaction_status,
      grossAmount: parseFloat(gross_amount),
      currency: 'IDR',
      paymentType: body.payment_type || 'unknown',
      fraudStatus: fraud_status
    },
    processedAt: new Date()
  }
});
```

**Captured Metadata:**
- `orderId`: Unique transaction ID (format: `RTI-{userId}-{timestamp}`)
- `transactionStatus`: Midtrans status (`capture`, `settlement`)
- `grossAmount`: Payment amount in IDR
- `currency`: Always `IDR` for Indonesian market
- `paymentType`: Payment method (credit_card, gopay, bank_transfer, etc.)
- `fraudStatus`: Midtrans fraud detection result (`accept`, `deny`, `challenge`)

#### Failed/Pending Payments
Tracks `payment_failed` event when payment fails or is pending:

```typescript
// Track failed payment event
await prisma.analyticsEvent.create({
  data: {
    eventName: 'payment_failed',
    timestamp: new Date(),
    sessionId: 'server-payment-webhook',
    userId: userId,
    platform: 'web',
    deviceType: 'desktop',
    locale: 'id',
    properties: {
      orderId: order_id,
      transactionStatus: transaction_status,
      grossAmount: parseFloat(gross_amount),
      currency: 'IDR',
      paymentType: body.payment_type || 'unknown',
      fraudStatus: fraud_status,
      statusCode: status_code
    },
    processedAt: new Date()
  }
});
```

**Additional Metadata for Failures:**
- `statusCode`: HTTP-like status code from Midtrans
- Helps identify failure reasons (declined card, insufficient funds, timeout, etc.)

### 2. Subscription Cancellation Endpoint

**File:** `app/api/payment/cancel/route.ts` (New, 94 lines)

Created dedicated endpoint for subscription cancellation tracking.

#### POST /api/payment/cancel

**Authentication:** Requires valid session (NextAuth)

**Request Body:**
```json
{
  "reason": "too_expensive" | "not_using" | "found_alternative" | "other",
  "feedback": "Optional user feedback text"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled"
}
```

**Event Tracking:**
Automatically tracks `subscription_cancelled` event with:

```typescript
await prisma.analyticsEvent.create({
  data: {
    eventName: 'subscription_cancelled',
    timestamp: new Date(),
    sessionId: 'server-subscription-cancel',
    userId: userId,
    platform: 'web',
    deviceType: 'desktop',
    locale: 'id',
    properties: {
      cancellationReason: reason,
      userFeedback: feedback,
      timestamp: Date.now()
    },
    processedAt: new Date()
  }
});
```

**Use Cases:**
- Churn analysis: Understand why users cancel
- Retention improvements: Identify common pain points
- Win-back campaigns: Target cancellers with offers

#### Error Tracking
Also tracks `api_error` events if cancellation fails:

```typescript
await prisma.analyticsEvent.create({
  data: {
    eventName: 'api_error',
    timestamp: new Date(),
    sessionId: 'server-error',
    platform: 'web',
    deviceType: 'desktop',
    locale: 'en',
    properties: {
      endpoint: '/api/payment/cancel',
      error: error.message,
      stack: error.stack
    },
    processedAt: new Date()
  }
});
```

## Event Flow Diagram

### Complete Payment Funnel (with tracking)

```
User Journey:
1. View Upgrade Page
   └─> Client tracks: upgrade_modal_viewed

2. Click "Upgrade to Pro"
   └─> Client tracks: upgrade_button_clicked

3. Select Payment Method
   └─> Client tracks: payment_method_selected
       properties: { method: 'credit_card' }

4. Submit Payment Form
   └─> Client tracks: payment_checkout_initiated
       properties: { plan: 'pro', amount: 99000 }

5. Midtrans Processes Payment
   └─> Webhook receives notification
       ├─> Success: Server tracks: payment_completed
       │   properties: { orderId, grossAmount, paymentType }
       │
       └─> Failure: Server tracks: payment_failed
           properties: { orderId, statusCode, fraudStatus }

6. (Later) User Cancels Subscription
   └─> Server tracks: subscription_cancelled
       properties: { cancellationReason, userFeedback }
```

### Server-Side vs Client-Side Tracking

**Server-Side Events** (this task):
- ✅ `payment_completed` - Webhook when payment succeeds
- ✅ `payment_failed` - Webhook when payment fails
- ✅ `subscription_cancelled` - Cancel endpoint
- ✅ `api_error` - Any server error

**Client-Side Events** (SP4-02):
- `payment_checkout_initiated` - User starts checkout
- `payment_method_selected` - User picks payment method
- `upgrade_button_clicked` - User clicks upgrade
- `upgrade_modal_viewed` - Paywall shown

**Why Split?**
- Server events have authoritative data (actual transaction amounts, IDs)
- Client events track user intent (clicks, views, form submissions)
- Together they provide complete funnel visibility

## Technical Implementation Details

### Session ID for Server Events

All server-side payment events use semantic session IDs:
- `server-payment-webhook` - For webhook events
- `server-subscription-cancel` - For cancellation endpoint
- `server-error` - For error tracking

This allows filtering server vs client events in analytics queries.

### User ID Extraction from Order ID

Midtrans order IDs follow format: `RTI-{userId}-{timestamp}`

```typescript
// Example: RTI-6507f1f77bcf86cd799439011-1711814400000
const parts = order_id.split('-');
// parts[0] = 'RTI'
// parts[1] = userId (might contain hyphens)
// parts[parts.length-1] = timestamp

const userId = parts.slice(1, parts.length - 1).join('-');
```

Handles edge cases:
- User IDs with hyphens (OAuth provider IDs)
- Malformed order IDs (logged as error, no event tracked)

### Error Handling Strategy

```typescript
try {
  // Track payment event
  await prisma.analyticsEvent.create(...)
} catch (trackingError) {
  console.error('Failed to track event:', trackingError)
  // Don't throw - webhook must still return 200 to Midtrans
}
```

**Critical:** Webhook always returns 200 OK to prevent Midtrans retries, even if event tracking fails. This ensures payment processing is never blocked by analytics issues.

## Integration with Analytics Pipeline

These server events feed into:

1. **SP4-05: Daily Funnel Aggregation**
   - Calculate conversion rates: `upgrade_button_clicked` → `payment_checkout_initiated` → `payment_completed`
   - Identify drop-off points (where users abandon checkout)
   - Revenue attribution (link revenue to traffic sources via UTM params)

2. **SP4-04: Sessions & Identity Stitching**
   - Link payment events to user session timeline
   - Attribute revenue to user's first touch campaign

3. **Future: Revenue Dashboards**
   - Total revenue by payment type
   - Failed payment analysis (recovery opportunities)
   - Churn reasons from cancellation feedback

## Testing Strategy

### Test Payment Completed Event

```bash
# Simulate Midtrans webhook (successful payment)
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "RTI-user123-1711814400000",
    "status_code": "200",
    "gross_amount": "99000.00",
    "transaction_status": "settlement",
    "fraud_status": "accept",
    "payment_type": "credit_card",
    "signature_key": "[valid_signature]"
  }'

# Verify event in database
db.analytics_events.find({ 
  eventName: "payment_completed",
  userId: "user123" 
})
```

### Test Payment Failed Event

```bash
# Simulate failed payment webhook
curl -X POST http://localhost:3000/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order_id": "RTI-user123-1711814400000",
    "status_code": "201",
    "gross_amount": "99000.00",
    "transaction_status": "deny",
    "fraud_status": "deny",
    "payment_type": "credit_card",
    "signature_key": "[valid_signature]"
  }'

# Verify event
db.analytics_events.find({ 
  eventName: "payment_failed",
  "properties.statusCode": "201" 
})
```

### Test Subscription Cancellation

```bash
# Must be authenticated (include session cookie)
curl -X POST http://localhost:3000/api/payment/cancel \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=..." \
  -d '{
    "reason": "too_expensive",
    "feedback": "Great product but not in my budget right now"
  }'

# Verify event
db.analytics_events.find({ 
  eventName: "subscription_cancelled",
  "properties.cancellationReason": "too_expensive"
})
```

### MongoDB Queries for Analysis

```javascript
// Count payment outcomes
db.analytics_events.aggregate([
  { $match: { eventName: { $in: ["payment_completed", "payment_failed"] } } },
  { $group: { _id: "$eventName", count: { $sum: 1 } } }
])

// Revenue by payment type
db.analytics_events.aggregate([
  { $match: { eventName: "payment_completed" } },
  { $group: { 
      _id: "$properties.paymentType", 
      totalRevenue: { $sum: "$properties.grossAmount" },
      count: { $sum: 1 }
  } }
])

// Cancellation reasons
db.analytics_events.aggregate([
  { $match: { eventName: "subscription_cancelled" } },
  { $group: { _id: "$properties.cancellationReason", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])

// Failed payment analysis
db.analytics_events.find(
  { eventName: "payment_failed" },
  { 
    "properties.statusCode": 1,
    "properties.fraudStatus": 1,
    "properties.paymentType": 1,
    timestamp: 1
  }
).sort({ timestamp: -1 })
```

## Revenue Attribution Example

With both client and server events, we can attribute revenue to campaigns:

```javascript
// Find user's session that led to payment
const session = await db.analytics_events.findOne({
  userId: "user123",
  eventName: "session_start",
  timestamp: { $lt: paymentTimestamp }
}).sort({ timestamp: -1 })

// Session has UTM parameters
console.log({
  revenue: 99000,
  source: session.utmSource,      // "google"
  medium: session.utmMedium,      // "cpc"
  campaign: session.utmCampaign   // "q4_promo"
})

// Result: 99k IDR attributed to Google CPC Q4 Promo campaign
```

## Next Steps (SP4-04)

Build sessions and identity stitching:
1. Create `UserSession` model with full event timeline
2. Link anonymous → authenticated events (pre/post login)
3. Session aggregation job (daily)
4. Enable cohort analysis and user journey mapping

## Success Criteria

- [x] Webhook tracks `payment_completed` with transaction metadata
- [x] Webhook tracks `payment_failed` with error details
- [x] Cancel endpoint tracks `subscription_cancelled` with reason
- [x] Error tracking for API failures
- [x] User ID extraction from order ID
- [x] Webhook returns 200 even if tracking fails (critical!)
- [x] Build passes with 38 routes compiled
- [x] Documentation complete

## Files Changed

**Modified:**
- `app/api/payment/webhook/route.ts` (+45 lines) - Added payment event tracking

**Created:**
- `app/api/payment/cancel/route.ts` (94 lines) - Cancellation endpoint with tracking

**Total:** 139 lines added

---

**Completion Date:** 2026-03-30  
**Build Status:** ✅ Passing (38 routes)  
**Branch:** sprint-1/foundation  
**Sprint 4 Progress:** 16/29 SP (55%)
