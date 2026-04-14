# EnrichedStock TypeScript Property Mismatch — Audit Document

## Date
2026-04-14

## Error Reported by Vercel

```
Type error: Type '{ code: any; issuer: any; tier: any; sector: any; price: any; change: any;
volume: any; marketCap: any; pe: any; pb: any; roe: any; dividendYield: any; scores: any;
aiTier: any; }' is missing the following properties from type 'EnrichedStock':
hhi, floatPercentage, c1, c3
  at ./src/components/features/screener/ScreenerWorkspace.tsx:150:84
```

TypeScript error code: `TS2739`

---

## Phase 0 — Audit Findings

### Files Audited
- `src/components/features/screener/ScreenerWorkspace.tsx` — line 150, `.map()` transform
- `src/types/unified.ts` — `EnrichedStock` interface
- `src/types/index.ts` — `Stock` base interface

### Root Cause

`EnrichedStock` extends the base `Stock` interface. The `Stock` interface declares four fields as **required** (non-optional):

```typescript
// src/types/index.ts
export interface Stock {
  hhi: number;
  floatPercentage: number;
  c1: number;
  c3: number;
  // ...
}
```

The `.map()` transform in `ScreenerWorkspace.tsx` was mapping the API response to `EnrichedStock` but only projected 14 explicitly named fields, omitting `hhi`, `floatPercentage`, `c1`, and `c3`. With `strict: true` in `tsconfig.json`, TypeScript rejects the incomplete object literal as an assignment to the typed return value.

### Are these fields available from the API?

These fields are sourced from the same MongoDB `Stock` documents that power the screener endpoint. The API response object `s` should carry them. Adding `s.hhi ?? 0` etc. safely forwards the field if present, and falls back to `0` if the API response schema ever diverges.

---

## Resolution Path Chosen

**Path A** — Supply the missing required fields in the `.map()` object literal with `??` fallbacks.

Rationale:
- The `Stock` type intentionally requires these fields; making them optional would weaken guarantees across the entire application.
- The API response is expected to include them (same DB document shape).
- `?? 0` fallbacks prevent a hard build break if a legacy or partial API response omits them.

---

## Fix Applied

```diff
// src/components/features/screener/ScreenerWorkspace.tsx
  const transformed = (data.data as any[]).map((s: any): EnrichedStock => ({
    code: s.code,
    issuer: s.issuer,
    tier: s.tier,
    sector: s.sector,
    price: s.price,
    change: s.change,
    volume: s.volume,
    marketCap: s.marketCap,
    pe: s.pe,
    pb: s.pb,
    roe: s.roe,
    dividendYield: s.dividendYield,
    scores: s.scores,
    aiTier: s.aiTier,
+   hhi: s.hhi ?? 0,
+   floatPercentage: s.floatPercentage ?? 0,
+   c1: s.c1 ?? 0,
+   c3: s.c3 ?? 0,
  }));
```

### Verification

After the fix, `tsc --noEmit` no longer reports `TS2739` for `ScreenerWorkspace.tsx`.

---

## talib Warning Status

The `Module not found: Can't resolve 'talib'` warning is **already resolved** via `next.config.ts`:

```typescript
serverExternalPackages: ["talib"],
```

No additional action required.

---

## Files Changed

| File | Change |
|---|---|
| `src/components/features/screener/ScreenerWorkspace.tsx` | Add `hhi`, `floatPercentage`, `c1`, `c3` with `?? 0` fallbacks to `.map()` |
| `ENRICHEDSTOCK_TS_AUDIT.md` | This document |
| `CHANGES_SUMMARY.md` | Phase 13 entry |
