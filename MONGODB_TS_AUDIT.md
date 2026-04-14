# MongoDB TypeScript Interface Conflict Audit

## Issue Summary

Vercel deployment fails during the TypeScript compilation phase (`Running TypeScript ...`) with Exit Code 1.

### Primary Error

```
Type 'WithId<Document>[]' is not assignable to parameter of type 'Stock[]'
  in app/api/export/csv/route.ts (line ~87)
```

### Secondary Warning

```
Module not found: Can't resolve 'talib'
  in src/services/analysis.ts
```
*(Already resolved in Phase 6 via `serverExternalPackages: ["talib"]` in `next.config.ts`.)*

---

## Root Cause Analysis

### Primary Issue — Untyped MongoDB Collection

| Item | Value |
|---|---|
| Failing file | `app/api/export/csv/route.ts` |
| Failing call | `database.collection("stocks").find(...).toArray()` |
| Inferred return type | `WithId<Document>[]` |
| Expected type by `enrichStocks()` | `Stock[]` |

The MongoDB Node.js driver's `Collection.toArray()` infers its return type from the generic parameter passed to `db.collection<T>()`. When no generic is provided, `T` defaults to `Document` (i.e., `Record<string, any>`), so `.toArray()` returns `WithId<Document>[]`. TypeScript's strict mode rejects assigning `WithId<Document>[]` to `Stock[]` because `Document` does not satisfy the structural requirements of `Stock`.

### Why the Mismatch

```ts
// enrichStocks signature
export function enrichStocks(stocks: Stock[]): EnrichedStock[]

// The Stock interface already defines _id as optional string
export interface Stock {
  _id?: string;
  code: string;
  issuer: string;
  tier: "Red" | "Amber" | "Green";
  // ...
}

// Current route (broken)
const rawData = await database
  .collection("stocks")       // Collection<Document>
  .find(matchStage)
  .toArray();                 // WithId<Document>[] ← incompatible with Stock[]

const enriched = enrichStocks(rawData); // TS ERROR
```

### Why Path A is Safe

MongoDB's `WithId<T>` is defined as:
```ts
type WithId<TSchema> = EnhancedOmit<TSchema, '_id'> & { _id: InferIdType<TSchema> }
```

Because `Stock._id` is typed as `string | undefined`, `InferIdType<Stock>` resolves to `string`. Therefore:

```ts
WithId<Stock> = (Stock without _id) & { _id: string }
```

`string` satisfies `string | undefined`, so `WithId<Stock>` is a structural subtype of `Stock` — assignment is valid without any mapping or runtime conversion.

---

## Resolution Paths

### Path A — Pass `Stock` generic to the collection call ✅ CHOSEN

```ts
import type { Stock } from "@/types";

const rawData = await database
  .collection<Stock>("stocks")  // Collection<Stock>
  .find(matchStage)
  .toArray();                   // WithId<Stock>[] — assignable to Stock[]

const enriched = enrichStocks(rawData); // ✅ compiles cleanly
```

**Why chosen:**
- Zero runtime changes — purely a TypeScript type annotation
- No data mapping/transformation needed (no `_id` stripping required because `Stock._id` is `string | undefined`)
- Does not modify `enrichStocks`'s signature or logic (as required by Section 3)
- Idiomatic MongoDB driver pattern for typed collections

### Path B — Type assertion after fetch

```ts
const rawData = (await database
  .collection("stocks")
  .find(matchStage)
  .toArray()) as unknown as Stock[];
```

**Why rejected:** Using `as unknown as T` is a type escape hatch that bypasses the type system without providing any structural guarantee. The problem statement explicitly prohibits `@ts-ignore`-style bypasses; a double-cast assertion carries the same risk of masking real schema mismatches at runtime.

---

## talib Fix Status

Already resolved in Phase 6 (commit `f3b980a`):

```ts
// next.config.ts
const nextConfig: NextConfig = {
  serverExternalPackages: ["talib"], // ✅ prevents webpack from bundling native binary
  // ...
};
```

The existing `try/catch` in `src/services/analysis.ts` handles the missing native module gracefully at runtime.

---

## Files to Change

| File | Change |
|---|---|
| `app/api/export/csv/route.ts` | Import `Stock` from `@/types`; type collection as `collection<Stock>` |

---

## Future Technical Debt

| Item | Recommendation |
|---|---|
| MongoDB schema vs. TypeScript interface drift | Consider using `zod` or a shared Prisma/Mongoose schema to keep the `Stock` interface in sync with the actual MongoDB document shape. |
| `talib` native module | Replace with a pure-JS TA library (e.g., `technicalindicators`) for full Vercel edge/serverless compatibility. |
