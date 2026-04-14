# react-modal TypeScript Declaration Error — Audit Document

## Date
2026-04-14

## Error Reported by Vercel

```
Type error: Could not find a declaration file for module 'react-modal'.
  '/node_modules/react-modal/lib/index.js' implicitly has an 'any' type.
  at ./src/components/features/screener/ScreenerWorkspace.tsx:6:24
```

TypeScript error code: `TS7016`

---

## Phase 0 — Audit Findings

### File Audited
`src/components/features/screener/ScreenerWorkspace.tsx`

### Import at issue (line 6)
```typescript
import ReactModal from "react-modal";
```

### Root Cause

`react-modal` v3 is a JavaScript-only package — it ships no bundled TypeScript declaration files (`.d.ts`). With `strict: true` in `tsconfig.json`, TypeScript treats un-typed third-party imports as a hard error (`TS7016`) rather than silently inferring `any`.

### Package Status

| Item | Status |
|---|---|
| `react-modal` in `dependencies` | ✅ `"^3.14.4"` |
| `@types/react-modal` in `devDependencies` | ❌ Missing |
| `@types/react-modal` on DefinitelyTyped | ✅ `3.16.3` available |
| Known CVEs in `@types/react-modal@3.16.3` | ✅ None |

---

## Resolution Path Chosen

**Path A (Official DefinitelyTyped types)** — install `@types/react-modal@^3.16.3`

This is the preferred path because:
- Official DefinitelyTyped package exists and is actively maintained.
- No known security vulnerabilities.
- Compatible with the installed `react-modal@^3.14.4` runtime.
- No custom declaration file to maintain.

---

## Fix Applied

```bash
npm install --save-dev @types/react-modal
```

Added `"@types/react-modal": "^3.16.3"` to `devDependencies` in `package.json`.

### Verification

After installing, `npx tsc --noEmit` no longer reports `TS7016` for `ScreenerWorkspace.tsx`. The `react-modal` import resolves cleanly against the installed type declarations.

---

## talib Warning Status

The `Module not found: Can't resolve 'talib'` warning was **already resolved** in a previous session via `next.config.ts`:

```typescript
serverExternalPackages: ["talib"],
```

This instructs webpack/Turbopack to treat `talib` as an external server-side native binary and skip bundling it. **No additional action required.**

---

## Files Changed

| File | Change |
|---|---|
| `package.json` | Add `"@types/react-modal": "^3.16.3"` to `devDependencies` |
| `CHANGES_SUMMARY.md` | Phase 12 entry |
| `REACT_MODAL_TS_AUDIT.md` | This document |
