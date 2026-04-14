# Dependency Audit — React 19 ERESOLVE Conflict

## Summary

The Vercel CI/CD pipeline fails at `npm install` with `ERESOLVE` because several direct and transitive dependencies declare a peer dependency of `react@"^16 || ^17 || ^18"`, which excludes the project's current `react@19.2.3`.

---

## Conflicting Packages

| Package | Installed Version | Peer React Requirement | Conflict |
|---|---|---|---|
| `react-slider` | `^2.0.4` | `^15 \|\| ^16 \|\| ^17 \|\| ^18` | ❌ React 19 excluded |
| `swagger-ui-react` | `^5.32.2` | `^16 \|\| ^17 \|\| ^18` | ❌ React 19 excluded |
| `react-copy-to-clipboard` | transitive (via swagger-ui-react) | `^16 \|\| ^17 \|\| ^18` | ❌ React 19 excluded |
| `react-debounce-input` | transitive (via swagger-ui-react) | `^16 \|\| ^17 \|\| ^18` | ❌ React 19 excluded |
| `react-inspector` | transitive (via swagger-ui-react) | `^16 \|\| ^17 \|\| ^18` | ❌ React 19 excluded |

---

## Resolution Paths

### Path A — Legacy Peer Deps (Keep React 19) ✅ CHOSEN

Create `.npmrc` in the project root with:

```
legacy-peer-deps=true
```

This instructs npm to fall back to the npm v6 peer-dependency resolution algorithm, which installs packages without enforcing strict peer conflicts. React 19 is kept and the application continues to benefit from its improvements.

**Pros:** No runtime changes; React 19 features remain available.  
**Cons:** Peer-dependency mismatches are silenced, not fixed. Any package that genuinely breaks on React 19 will surface at runtime.

### Path B — Downgrade to React 18

Update `package.json`:

```json
"react": "^18.3.1",
"react-dom": "^18.3.1"
```

Then:

```bash
rm -rf node_modules package-lock.json
npm install
```

**Pros:** Peer requirements are fully satisfied.  
**Cons:** Loses React 19 features and requires coordinated updates if/when the codebase targets React 19 APIs.

---

## Known React-19-Compatible Alternatives (Future Technical Debt)

| Current Package | Status | Recommended Action |
|---|---|---|
| `react-slider` | No official React 19 release as of 2026-04 | Monitor releases; consider `@radix-ui/react-slider` as a drop-in replacement |
| `swagger-ui-react` | Team is aware; no stable React 19 release yet | Monitor swagger-ui v6 releases |
| `react-modal` | May have unofficial React 19 compat | Test; switch to a headless dialog if issues arise |
| `react-tooltip` | v5+ supports React 18+ (upgrade recommended) | Upgrade to `react-tooltip@^5` |

---

## Decision

**Path A** was selected to unblock Vercel deployment while keeping React 19. The fix is a single-file addition (`.npmrc`) with no runtime code changes.
