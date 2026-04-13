# ALERT SYSTEM AUDIT (Phase 0)

This document outlines the architecture review for **Sprint 3: Real-Time Alert System Upgrade**. Based on the codebase inspection, this project is built on **Next.js 14 App Router** with **Prisma** and **MongoDB**. 

> [!WARNING]
> **Stack Discrepancy Alert**
> The instructions mentioned "Mongoose schema" and an "Express router setup." Since the existing project uses **Prisma** with **Next.js API Routes (App Router)**, the schema design will be presented as a Prisma model, and we must handle the Socket.io integration via a **custom Next.js server (`server.ts`)** or a **standalone Node.js microservice**, as Next.js serverless functions do not inherently support long-lived WebSocket connections like Socket.io out-of-the-box.

## 1. Socket.io Room & Event Structure
To securely route alerts to individual users without broadcasting sensitive financial data to everyone, we will use a **User-Specific Room** pattern.

### Event Naming Convention
- **Rooms**: `user:<userId>` (Each connected client joins a room corresponding to their authenticated `userId`).
- **Events**:
  - `Client -> Server`: `join_room` (Triggered on connection with auth token).
  - `Server -> Client`: `alert:triggered` (Sent when a threshold is breached).
  - `Server -> Client`: `alert:status` (Connection and health monitoring).

### Connection Flow
1. Client connects to `/socket.io`.
2. Middleware validates session/JWT.
3. Socket joins room `user:<userId>`.
4. Polling engine emits `io.to('user:<userId>').emit('alert:triggered', payload)`.

## 2. Alert Configuration Schema (Prisma)
We already have a `PriceAlert` schema in `prisma/schema.prisma`. We will update it to support the new Premium notification channels (Twilio SMS and Nodemailer Email).

```prisma
// Proposed modifications to existing PriceAlert model
model PriceAlert {
  id            String    @id @default(auto()) @map("_id") @db.ObjectId
  userId        String    @db.ObjectId
  ticker        String    // Stock ticker symbol (e.g., "BBCA")
  condition     String    // "above" | "below"
  targetPrice   Float
  
  // Notification Channels (New)
  notifyEmail   Boolean   @default(false)
  notifySms     Boolean   @default(false)
  
  isActive      Boolean   @default(true)
  triggeredAt   DateTime?
  lastCheckedAt DateTime  @default(now())
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@index([isActive])
  @@index([ticker, isActive])
  @@map("price_alerts")
}
```

## 3. WebSocket Polling Loop & Constraints
The polling engine queries external data sources (like the IDX API) to evaluate alert conditions against the database.

**Polling Strategy**:
1. **Interval**: Every 15 seconds (To avoid severe rate limiting from IDX).
2. **Chunking**: Fetch all `isActive: true` alerts from the db, group by `ticker`.
3. **Execution**: Query IDX API for active tickers *only*.
4. **Evaluation**: If current price breaches `targetPrice` and condition (`above`/`below`) is met:
   - Mark `triggeredAt` and `isActive: false` (to prevent spam).
   - Emit Socket event.
   - Dispatch to external notification queue if `notifySms` or `notifyEmail` is true (and user is Premium).

> [!CAUTION]
> Polling from within a standard Next.js API route is not possible because API routes are stateless and terminate. We must instantiate a persistent Node.js process (e.g., a custom Next.js `server.ts` that initializes Socket.io and runs `setInterval`).

## 4. Redis Rate-Limiting Strategy
To enforce the **Free Tier limit (3 alerts/day)**, we will utilize Redis (`redis@4.3.1`). 

### Redis Architecture
- **Key Pattern**: `alerts:creation:<userId>:<YYYY-MM-DD>`
- **TTL**: 24 hours (86400 seconds)
- **Increment Logic**:
  1. User submits React Hook Form to create an alert.
  2. Read user `plan` from the database. If `plan === "premium"`, allow unlimited.
  3. If `plan === "free"`, run `INCR <redis_key>`.
  4. If value > 3, block request (Return `429 Too Many Requests`).
  5. If value === 1, set `EXPIRE <redis_key> 86400`.
