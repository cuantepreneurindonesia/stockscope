# Sprint 3 - Real-Time Alert System Upgrade Summary

## Execution Overview
The Sprint 3 architecture successfully implements a monetizable real-time alert engine utilizing a Next.js custom server configuration, Socket.io for WebSockets, and Redis for rate-limiting.

### 1. WebSocket & Polling Engine
- **Custom Application Server**: Configured `server.ts` to boot Next.js while attaching `Socket.io` to the same HTTP port.
- **PriceAlert Schema Modification**: Extended Prisma's `PriceAlert` schema to include new toggles: `notifyEmail` and `notifySms`.
- **Polling Loop implementation**: Built a resilient background loop (`setInterval(..., 15000)`) in `server.ts` that safely fetches mock IDX price data, cross-references active alerts from the database, and emits tailored JSON payloads securely to authenticated users' active socket rooms (e.g., `user:<userId>`).

### 2. Notification Channels (Premium Features)
- **Twilio SMS**: Integrated `twilio@3.80.0` inside `src/lib/notifications.ts` for instantaneous text delivery using mock sandbox credentials or production env vars.
- **Email Nodemailer**: Integrated `nodemailer@6.7.8` leveraging fallback SMTP configurations for immediate user awareness.
- **Targeted Dispatch**: Ensured only users flagged `plan === "premium"` route to SMS/Email utility paths within the backend.

### 3. Protection & Caching Strategy
- **Redis Rate Limiting**: Built `src/lib/rateLimitAlerts.ts` tying `redis@4.3.1` (via existing implementation strategies) to track `alerts:creation:<userId>:<date>`. Safely limits `free` users to 3 alerts continuously, blocking further REST API usage iteratively with HTTP 429.

### 4. Alert Form User Interface
- **Form Component**: Deployed scalable, robust `AlertForm.tsx` leveraging `react-hook-form@7.33.0`.
- **Socket Connectivity**: Implemented `useEffect` hook capturing `alert:triggered` WebSocket push notifications natively on the client. UI subsequently displays pulsating live DOM alerts and native browser alerts seamlessly.

---

# Sprint 2 - UI/UX Overhaul & Advanced Filtering Summary

## Execution Overview
All goals for Sprint 2 have been successfully achieved, and the filtering system now scales linearly with the MongoDB backend rather than pulling 10,000 strings into memory.

### 1. Database-Level Aggregation (Backend)
- Designed and built `/api/screen` endpoint.
- Handled filtering safely through mapping query params to MongoDB's `$match` aggregation stage.
- Integrated accurate backend pagination with `$skip` and `$limit` to exactly 50 items/page, resolving the prior performance bottleneck.
- Evaluated and mapped frontend variables correctly to legacy backend constraints seamlessly.

### 2. Frontend Overhaul
- **Table System Upgrade**: Replaced the previous monolithic grid rendering and manual logic with fully functional `react-table` driven pipelines via `@useTable`/`@useSortBy`/`@usePagination`. Sorting interacts elegantly across desktop views.
- **Select Overhaul**: Replaced native generic browser `<select>` dropdowns with highly-customized `react-select` single/multi-selection wrappers, adhering to dark mode aesthetics.
- **Range Control Implementation**: Integrated `react-slider` for continuous visual manipulation of `minPrice` and `maxPrice`.
- **Mobile First Approach**: Implemented `react-modal` that handles small-viewport filtering with an elegant side-sheet modal toggle logic, preventing cluttered navigation.

### 3. Testing & Performance Check
- Audited render times and reduced overall layout shift through structured conditional loading (React pulse skeletons / empty state implementations remain intact).
- Verified pagination correctly handles data slicing (checked manual boundaries).
- Committed basic Jest testing in `tests/api/screen.test.ts` to solidify logic regressions against DB structure changes.

### Future Recommendations
Ensure next sprints evaluate moving away from artificial generation mappings if actual real-time price variables emerge in database schema updates, making aggregations natively queryable directly from the stock entries.
