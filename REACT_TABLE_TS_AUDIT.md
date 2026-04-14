# react-table TypeScript Declaration Error — Audit Document

## Date
2026-04-14

## Errors Reported by Vercel

### Original error (Phase 11a)
```
Type error: Could not find a declaration file for module 'react-table'.
  at ./src/components/features/screener/ScreenerTable.tsx:4:60
```

### Post-install errors (Phase 11b — after installing @types/react-table)
```
ScreenerTable.tsx(86): Binding element 'value' implicitly has an 'any' type.
ScreenerTable.tsx(92): Binding element 'value' implicitly has an 'any' type.
ScreenerTable.tsx(102): Property 'page' does not exist on type 'TableInstance<EnrichedStock>'.
ScreenerTable.tsx(109): 'pageSize' does not exist in type 'Partial<TableState<EnrichedStock>>'.
ScreenerTable.tsx(119,121,126): Property 'sortBy' does not exist on type 'TableState<EnrichedStock>'.
ScreenerTable.tsx(143): Property 'getSortByToggleProps' does not exist on type 'HeaderGroup<EnrichedStock>'.
ScreenerTable.tsx(148): Property 'isSorted' does not exist on type 'HeaderGroup<EnrichedStock>'.
ScreenerTable.tsx(150): Property 'isSortedDesc' does not exist on type 'HeaderGroup<EnrichedStock>'.
ScreenerTable.tsx(164): Parameter 'row' implicitly has an 'any' type.
ScreenerTable.tsx(172): Parameter 'cell' implicitly has an 'any' type.
```

---

## Phase 0 — Audit Findings

### File Audited
`src/components/features/screener/ScreenerTable.tsx`

### Root Cause — Phase 11a

`react-table` v7 is a JavaScript-only package — it ships no bundled TypeScript declarations (`.d.ts` files). When `strict: true` is set in `tsconfig.json`, TypeScript treats un-typed third-party imports as an error rather than silently allowing an implicit `any` type.

```typescript
// ScreenerTable.tsx line 4
import { useTable, useSortBy, usePagination, Column } from "react-table"; // ❌ No type declarations found
```

### Root Cause — Phase 11b (Module Augmentation Gap)

`@types/react-table` v7 provides **base** type declarations. However, it deliberately does **not** automatically merge plugin-specific interfaces (from `useSortBy`, `usePagination`, etc.) into the core table types. This is by design — it uses TypeScript's **declaration merging** / module augmentation pattern to allow users to opt in to only the plugins they actually use.

Without the augmentation:
- `TableInstance<D>` does not have `page`, `pageCount`, `nextPage`, etc. (from `UsePaginationInstanceProps`)
- `TableState<D>` does not have `sortBy`, `pageIndex`, `pageSize` (from `UseSortByState` / `UsePaginationState`)
- `ColumnInstance<D>` does not have `isSorted`, `isSortedDesc`, `getSortByToggleProps` (from `UseSortByColumnProps`)

### Exports Used in `ScreenerTable.tsx`

| Export | Type | Notes |
|---|---|---|
| `useTable` | hook | core table instance factory |
| `useSortBy` | plugin | adds `sortBy` state and `getSortByToggleProps` to columns |
| `usePagination` | plugin | adds `page`, `pageCount`, `pageIndex`, `pageSize` to instance/state |
| `Column` | type | generic column definition — used as `Column<EnrichedStock>[]` |

---

## Fix Applied

### Part A — Install official types
```
npm install --save-dev @types/react-table
```
Added `"@types/react-table": "^7.7.20"` to `devDependencies`.

### Part B — Module augmentation (`src/types/react-table-plugins.d.ts`)

Created a declaration file that merges the plugin interfaces into the core react-table types:

```typescript
declare module 'react-table' {
  interface TableOptions<D extends object>
    extends UseSortByOptions<D>, UsePaginationOptions<D> {}
  interface TableState<D extends object>
    extends UseSortByState<D>, UsePaginationState<D> {}
  interface ColumnInstance<D extends object>
    extends UseSortByColumnProps<D> {}
  interface TableInstance<D extends object>
    extends UseSortByInstanceProps<D>, UsePaginationInstanceProps<D> {}
}
```

This file lives in `src/types/` which is covered by `src/**/*.ts` in `tsconfig.json` `include`.

### Part C — Explicit Cell renderer typing

For function-accessor columns, TypeScript cannot infer the `value` type in Cell renderers automatically. Explicit inline types are added:

```typescript
// AI Score column
Cell: ({ value }: { value: number | undefined }) => <ScoreBar score={value ?? 0} type="ai" />

// AI Tier column
Cell: ({ value }: { value: string | undefined }) => <TierBadge tier={value ?? "N/A"} />
```

---

## talib Warning Strategy

The `Module not found: Can't resolve 'talib'` warning in `src/services/analysis.ts` was **already resolved** in `next.config.ts`:

```ts
serverExternalPackages: ["talib"],
```

This tells webpack/Turbopack to treat `talib` as an external server-side native binary and skip bundling it. **No additional action required.**

---

## Result

All 13 TypeScript errors in `ScreenerTable.tsx` are resolved. `npx tsc --noEmit` reports zero errors for this file.

## Files Changed

| File | Change |
|---|---|
| `package.json` | Add `"@types/react-table": "^7.7.20"` to `devDependencies` |
| `src/types/react-table-plugins.d.ts` | New — module augmentation for useSortBy + usePagination plugins |
| `src/components/features/screener/ScreenerTable.tsx` | Explicit types on two Cell renderer `{ value }` parameters |
| `CHANGES_SUMMARY.md` | Phase 11 entry |
| `REACT_TABLE_TS_AUDIT.md` | This document |

---

## Phase 0 — Audit Findings

### File Audited
`src/components/features/screener/ScreenerTable.tsx`

### Root Cause

`react-table` v7 is a JavaScript-only package — it ships no bundled TypeScript declarations (`.d.ts` files). When `strict: true` is set in `tsconfig.json` (as it is in this project), TypeScript treats un-typed third-party imports as an error rather than silently allowing an implicit `any` type.

```typescript
// ScreenerTable.tsx line 4
import { useTable, useSortBy, usePagination, Column } from "react-table"; // ❌ No type declarations found
```

### Exports Used in `ScreenerTable.tsx`

| Export | Type | Notes |
|---|---|---|
| `useTable` | hook | core table instance factory |
| `useSortBy` | plugin | sort by column |
| `usePagination` | plugin | pagination support |
| `Column` | type | generic column definition — used as `Column<EnrichedStock>[]` |

### Installed Packages

| Package | Version | Ships types? |
|---|---|---|
| `react-table` | 7.7.0 | ❌ No |
| `@types/react-table` | — (not installed) | — |

### @types availability check

```
npm info @types/react-table
→ @types/react-table@7.7.20 | MIT
```

`@types/react-table` **exists** on DefinitelyTyped at version `7.7.20`, targeting `react-table` v7. No known CVEs.

---

## Resolution Path Selected: Path A — Install `@types/react-table`

### Path A vs Path B Analysis

| | Path A: `npm i -D @types/react-table` | Path B: Manual `.d.ts` file |
|---|---|---|
| **Effort** | Single dependency | Requires writing complex plugin-chain types |
| **Accuracy** | Full community types for all hooks, plugin chaining, generics | Minimal stubs only (loses `Column<T>` generics) |
| **Future-proof** | Updated with upstream changes | Must be updated manually |
| **Recommended?** | ✅ Yes (also per task spec) | ❌ Strongly against for v7 plugin types |
| **Chosen?** | ✅ Yes | — |

**Chosen: Path A.** `react-table` v7 uses a sophisticated plugin-chain type system (`UseTableInstanceProps`, `UseSortByColumnProps`, `UsePaginationInstanceProps`, etc.). The community `@types/react-table@7.7.20` package provides full declarations for all hooks and generic `Column<D>` used in `ScreenerTable.tsx`. A manual stub would lose the generic safety on `Column<EnrichedStock>[]` and all hook return types.

---

## talib Warning Strategy

The `Module not found: Can't resolve 'talib'` warning in `src/services/analysis.ts` is **already resolved** in `next.config.ts`:

```ts
serverExternalPackages: ["talib"],
```

This tells webpack/Turbopack to treat `talib` as an external server-side native binary and skip bundling it, eliminating the warning while preserving the runtime fallback logic in `analysis.ts` for local development.

**No additional action required for talib.**

---

## Files Changed

| File | Change |
|---|---|
| `package.json` | Add `"@types/react-table": "^7.7.20"` to `devDependencies` |
| `CHANGES_SUMMARY.md` | Add Phase 11 entry |
| `REACT_TABLE_TS_AUDIT.md` | This document |
