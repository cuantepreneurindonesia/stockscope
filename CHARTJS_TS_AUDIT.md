# Chart.js TypeScript Options Conflict — Audit Document

## Date
2026-04-14

## Error Reported by Vercel

```
Type error: Object literal may only specify known properties, and 'stacked' does not exist in type...
  at ./src/components/analytics/StockChartOverlay.tsx:97:5
```

---

## Phase 0 — Audit Findings

### File Audited
`src/components/analytics/StockChartOverlay.tsx`

### Root Cause

`stacked: false` is placed at the **root** of the `ChartOptions` object:

```typescript
const options: ChartOptions = {
  responsive: true,
  interaction: { mode: 'index', intersect: false },
  stacked: false,   // ❌ Not a valid top-level ChartOptions property in Chart.js v3+
  plugins: { ... },
  scales: { ... }
};
```

In **Chart.js v2**, `stacked` was accepted as a root-level option. In **Chart.js v3+** (this project uses v4.x), stacking is a per-axis property configured inside the individual `scales` definitions, not at the chart root. The `CoreChartOptions<TType>` TypeScript interface does not include `stacked` at the top level, so the compiler correctly rejects it.

### Installed Versions

| Package | Version |
|---|---|
| `chart.js` | v4.x |
| `react-chartjs-2` | v5.x |

### Why This Is Not a Type Suppression Problem

`@ts-ignore` or `as any` are explicitly prohibited by the task requirements and would mask a real API misuse. The property does not belong at the root — the fix must restructure the options correctly.

---

## Resolution Path Selected: Path B — Remove `stacked: false`

### Path A vs Path B Analysis

| | Path A: Move to `scales.x`/`scales.y` | Path B: Remove the line |
|---|---|---|
| **Correct?** | ✅ Correct placement per Chart.js v3+ API | ✅ Correct — stacking is off by default |
| **Necessary?** | Only if we need to explicitly override inherited stacking | Not needed; no stacked datasets exist |
| **Chart behavior change?** | None | None |
| **Code change scope** | Adds two scale properties | Removes one root property |

**Chosen: Path B.** The chart has no stacked datasets (all series use separate y-axes: `y`, `y1`, `y2`). Stacking is disabled by default in Chart.js v3+. Explicitly setting `stacked: false` at the scale level would be redundant and add noise. The cleanest fix is to remove the invalid root-level line entirely.

---

## talib Warning Strategy

The `Module not found: Can't resolve 'talib'` warning in `src/services/analysis.ts` is **already resolved**. `next.config.ts` already contains:

```ts
serverExternalPackages: ["talib"],
```

This tells webpack/Turbopack to treat `talib` as an external (server-side native binary) and skip bundling it — eliminating the warning while preserving the runtime fallback logic in `analysis.ts` for local development.

**No additional action required for talib.**

---

## Files Changed

| File | Change |
|---|---|
| `src/components/analytics/StockChartOverlay.tsx` | Remove `stacked: false` from root of `options` object |
| `CHANGES_SUMMARY.md` | Add Phase 9 entry |
| `CHARTJS_TS_AUDIT.md` | This document |
