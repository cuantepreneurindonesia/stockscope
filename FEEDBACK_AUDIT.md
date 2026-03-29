# 🔍 FEEDBACK AUDIT - COMPLETE
**Repository:** stockscope (main branch)  
**Date:** 2026-03-27  
**Agent:** explore (completed in 9.2 minutes)  
**Status:** ✅ COMPLETE - Ready for fixes

---

## 📊 Executive Summary

- **Total Issues:** 11
- **Critical Bugs:** 3 (blocking UX)
- **High Priority:** 4 (mobile bugs)
- **Medium Priority:** 3 (UX polish)
- **Low Priority:** 1 (UI aesthetics)
- **Estimated Fix Time:** 10-17 hours

**Priority Matrix:**
```
🔴 CRITICAL (Fix First)    → Issues #1, #2, #3 (6-8 hours)
🟠 HIGH (Mobile Blockers)   → Issues #4, #5, #7 (3-5 hours)
🟡 MEDIUM (UX Polish)       → Issues #6, #8, #9 (2-3 hours)
🟢 LOW (Nice-to-Have)       → Issues #10, #11 (1 hour)
```

---

## 🔴 CRITICAL BUGS (MUST FIX FIRST)

### Issue #1: Tab/Filter Causes Full Page Reload ⚠️

**User Feedback:** "ketika ganti tab atau ganti filter selalu loading page"

| Attribute | Details |
|-----------|---------|
| **File** | `app/[locale]/screener/page.tsx` |
| **Lines** | 45-89 (useEffect), 63 (setLoading trigger) |
| **Component** | Screener page data fetching |
| **Root Cause** | **NO DEBOUNCE.** Every filter/search change triggers immediate `setLoading(true)` → shows `SkeletonLoader` → feels like page reload. User types "BBCA" = 4 API calls. |
| **Impact** | 🔥 HIGH - Core filtering UX broken |
| **Complexity** | MEDIUM (2-3 hours) |

**Evidence:**
```tsx
// Lines 52-89: useEffect triggers on EVERY dependency change
useEffect(() => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);  // ← No debounce!
  
  queueMicrotask(() => setLoading(true));  // ← Shows skeleton immediately
  fetch(`/api/stocks/enriched?${params.toString()}`)
    .finally(() => setLoading(false));
}, [searchQuery, selectedSector, selectedAiTier, ...]); // ← All filters
```

**Fix Strategy:**
1. Install `use-debounce`: `npm install use-debounce`
2. Wrap search in `useDebouncedCallback`:
```tsx
import { useDebouncedCallback } from 'use-debounce';

const debouncedSearch = useDebouncedCallback(
  (value) => setSearchQuery(value),
  300  // 300ms delay
);

// In FilterPanel:
<input onChange={(e) => debouncedSearch(e.target.value)} />
```
3. Keep old data visible during refetch (don't immediately show skeleton)
4. Add subtle loading spinner in header instead

---

### Issue #2: Landing Page Blank on First Load ⚠️

**User Feedback:** "ketika pertama kali buka, tampilan landing page nya gk keliatan cmn keluar tab nya aja"

| Attribute | Details |
|-----------|---------|
| **File** | `components/Dashboard.tsx` |
| **Lines** | 173-182 (early return on loading) |
| **Component** | Dashboard home page |
| **Root Cause** | Initial `loading === true` returns **full-screen overlay** with ONLY loading text. Header, tabs, KPI cards not visible until data loads. |
| **Impact** | 🔥 CRITICAL - First impression completely broken |
| **Complexity** | LOW (1 hour) |

**Evidence:**
```tsx
// Lines 173-182: Early return hides EVERYTHING
if (stockData.loading && stockData.RAW.length === 0) {
  return (
    <div className="app-root" style={{ background: '#060d18', minHeight: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <h2>{tDash('loadingTitle')}</h2>  {/* Only this visible! */}
        <p>{tDash('loadingSubtitle')}</p>
      </div>
    </div>  // ← Returns early, no header/tabs/KPIs rendered!
  );
}

// Lines 195+: AppHeader, TabBar, KpiCards render AFTER data loads
return (
  <>
    <AppHeader ... />   {/* Not visible during initial load */}
    <TabBar ... />      {/* Not visible during initial load */}
    <KpiCards ... />    {/* Not visible during initial load */}
  </>
);
```

**Fix Strategy:**
1. Always render AppHeader, TabBar outside loading condition
2. Show skeleton for KPI cards and chart area only
3. Change early return to:
```tsx
if (stockData.loading && stockData.RAW.length === 0) {
  return (
    <div className="app-root">
      <AppHeader ... />
      <TabBar ... />
      <div className="skeleton-kpi-cards" /> {/* Skeleton, not blank */}
    </div>
  );
}
```

---

### Issue #3: Values Not Visible in Light Mode ⚠️

**User Feedback:** "untuk bagian value nya gk keliatan meskipun light mode"

| Attribute | Details |
|-----------|---------|
| **File** | `app/globals.css` (primary), multiple components |
| **Lines** | CSS: 54-70, 158-167; Layout: app/layout.tsx:53 |
| **Component** | Entire app - no light mode support |
| **Root Cause** | **100% hardcoded dark theme.** NO `@media (prefers-color-scheme: light)` queries. All text colors are light (#dce3f3, #a8c8e8) - invisible on white backgrounds. |
| **Impact** | 🔥 HIGH - App unusable in light mode |
| **Complexity** | MEDIUM (3-4 hours) |

**Evidence:**
```css
/* globals.css - NO LIGHT MODE SUPPORT */
:root {
  --text-primary: #e8f4f8;      /* Light blue - only works on dark bg */
  --text-tertiary: #6b8aad;     /* Medium blue - invisible on light bg */
  --color-surface: #0c1324;     /* Dark only */
  /* NO @media (prefers-color-scheme: light) override! */
}

body {
  background-color: #0c141f;    /* Hardcoded dark */
  color: #dce3f3;               /* Hardcoded light text */
}
```

```tsx
// app/layout.tsx line 53 - Hardcoded dark background
<body className={`${inter.className} bg-[#0c1324] text-[#dce1fb] antialiased`}>
```

**Fix Strategy:**
1. Add light mode CSS variables:
```css
@media (prefers-color-scheme: light) {
  :root {
    --text-primary: #1a1a1a;
    --text-secondary: #4a4a4a;
    --color-surface: #ffffff;
    --color-surface-container: #f5f5f5;
  }
}
```

2. Replace hardcoded colors in layout.tsx:
```tsx
<body className={`${inter.className} bg-background text-foreground antialiased`}>
```

3. Update Tailwind config with semantic colors:
```js
theme: {
  extend: {
    colors: {
      background: 'var(--color-surface)',
      foreground: 'var(--text-primary)',
    }
  }
}
```

4. Test in both modes: Chrome DevTools → Rendering → "Emulate CSS media prefers-color-scheme"

---

## 🟠 HIGH PRIORITY (MOBILE BLOCKERS)

### Issue #4: Google Sign In Not Visible on Mobile 📱

**User Feedback:** "sign in dengan google gk keliatan untuk mobile"

| Attribute | Details |
|-----------|---------|
| **File** | `components/layout/AuthButton.tsx` |
| **Lines** | 44-64 (unauthenticated button) |
| **Root Cause** | Button has **fixed small size** (`padding: '8px 14px'`, `fontSize: 12`) - no responsive classes. Text truncates/overflows on screens <375px. |
| **Impact** | 🔥 HIGH - Cannot authenticate on mobile |
| **Complexity** | LOW (30 minutes) |

**Evidence:**
```tsx
// Lines 44-64: Fixed dimensions, no mobile adaptation
<button
  onClick={() => signIn('google')}
  style={{
    padding: '8px 14px',          // ← Too small for mobile
    fontSize: 12,                 // ← Fixed size
    // NO responsive sizing
  }}
>
  {t('signIn')}  {/* "Sign in with Google" overflows */}
</button>
```

**Fix Strategy:**
```tsx
<button
  onClick={() => signIn('google')}
  className="px-3 py-2 md:px-4 md:py-2.5 text-sm md:text-xs
             bg-white text-gray-900 rounded-lg font-medium
             hover:bg-gray-50 transition-colors
             min-h-[44px] min-w-[44px]"  {/* Minimum touch target */}
>
  <span className="hidden sm:inline">{t('signIn')}</span>
  <span className="sm:hidden">Sign In</span>  {/* Shorter on mobile */}
</button>
```

---

### Issue #5: Search Bar Not Full Width on Mobile 📱

**User Feedback:** "di hp ku ga full di baris searchnya"

| Attribute | Details |
|-----------|---------|
| **File** | `app/globals.css` |
| **Lines** | 158-167 (.search-input CSS) |
| **Root Cause** | `width: clamp(140px, 40vw, 260px)` locks to 140px minimum on 320px screens. Parent flex container doesn't wrap. |
| **Impact** | MEDIUM - Poor mobile search UX |
| **Complexity** | LOW (20 minutes) |

**Evidence:**
```css
.search-input {
  width: clamp(140px, 40vw, 260px);  /* On 320px: 40vw=128px < 140px → uses 140px */
  /* Should be 100% on mobile */
}

.header-right {
  display: flex;
  gap: 10px;
  /* No responsive wrapping or stacking */
}
```

**Fix Strategy:**
```css
@media (max-width: 768px) {
  .search-input {
    width: 100%;  /* Full width on mobile */
    max-width: 100%;
  }
  
  .header-right {
    flex-direction: column;  /* Stack vertically */
    width: 100%;
  }
}

@media (min-width: 769px) {
  .search-input {
    width: clamp(200px, 40vw, 320px);  /* Wider on desktop */
  }
}
```

---

### Issue #6: Placeholder Text Getting Cut Off 📱

**User Feedback:** "placeholder nya kepotong"

| Attribute | Details |
|-----------|---------|
| **File** | `components/screener/FilterPanel.tsx` |
| **Lines** | 62-70 (search input) |
| **Root Cause** | `pl-10` padding + search icon leaves minimal space for placeholder on small screens. |
| **Impact** | LOW - Minor usability issue |
| **Complexity** | LOW (15 minutes) |

**Evidence:**
```tsx
<input
  className="w-full ... text-sm pl-10 ..."  {/* pl-10 = 2.5rem */}
  placeholder={t('searchPlaceholder')}      {/* Can be long */}
/>
```

**Fix Strategy:**
1. Shorten placeholder in translation files:
```json
// messages/en.json
"searchPlaceholder": "Search..." // was: "Search stock, ticker, or company..."

// messages/id.json
"searchPlaceholder": "Cari..." // was: "Cari saham, ticker, atau nama perusahaan..."
```

2. OR use responsive placeholder:
```tsx
<input
  placeholder={
    window.innerWidth < 375 
      ? t('searchPlaceholderShort')  // "Search..."
      : t('searchPlaceholder')        // "Search ticker or company..."
  }
/>
```

---

### Issue #7: Layout Code Duplication (Mobile/Desktop) 📱

**User Feedback:** "Frontend nya harus bikin kode beda untuk hp ama laptop/pc karna beda"

| Attribute | Details |
|-----------|---------|
| **File** | `app/[locale]/screener/page.tsx` |
| **Lines** | 113-152 (duplicate FilterPanel) |
| **Root Cause** | FilterPanel rendered **TWICE** - once for desktop (`hidden lg:block`), once for mobile (`lg:hidden`). Unnecessary duplication. |
| **Impact** | MEDIUM - Technical debt, larger bundle |
| **Complexity** | MEDIUM (1-2 hours) |

**Evidence:**
```tsx
{/* Desktop FilterPanel - lines 113-131 */}
<div className="w-80 flex-shrink-0 hidden lg:block">
  <FilterPanel ... />  {/* Rendered but hidden on mobile */}
</div>

{/* Mobile FilterPanel - lines 136-152 */}
<div className="lg:hidden mb-6">
  <FilterPanel ... />  {/* Rendered but hidden on desktop */}
</div>
```

**Fix Strategy:**
Refactor to single responsive component:
```tsx
{/* Single FilterPanel with responsive positioning */}
<div className="w-full lg:w-80 mb-6 lg:mb-0 lg:flex-shrink-0">
  <div className="lg:sticky lg:top-24">
    <FilterPanel ... />
  </div>
</div>
```

---

## 🟡 MEDIUM PRIORITY (UX POLISH)

### Issue #8: Search Experience Poor (No Debounce) 🔍

**User Feedback:** "search nya si jo tadi ku coba kurang sip"

| Attribute | Details |
|-----------|---------|
| **File** | `app/[locale]/screener/page.tsx` + FilterPanel |
| **Lines** | 52-89 (screener), 62-82 (FilterPanel) |
| **Root Cause** | **No debounce!** Every keystroke = immediate API call. Type "GOOGL" = 5 requests. |
| **Impact** | MEDIUM - Laggy, wasteful |
| **Complexity** | LOW (30 minutes) |

**Fix:** Same as Issue #1 - implement debounce with `use-debounce`

---

### Issue #9: Empty Search Results Bad Wording 📝

**User Feedback:** "jika stock yang dicari tidak ada, wording yang dipakai jangan itu"

| Attribute | Details |
|-----------|---------|
| **File** | `components/screener/ScreenerCardList.tsx`, `components/screener/ScreenerTable.tsx` |
| **Lines** | 11-24 (CardList), 397-409 (Table) |
| **Root Cause** | Generic "No stocks found" - doesn't show search term, not actionable. |
| **Impact** | LOW - Confusing but functional |
| **Complexity** | LOW (30 minutes) |

**Evidence:**
```tsx
<p className="font-headline ...">No stocks found</p>  {/* Too generic */}
<p className="font-body ...">Try adjusting your filters</p>  {/* Not helpful */}
```

**Fix Strategy:**
```tsx
function EmptyState({ searchQuery, hasFilters }: { searchQuery: string; hasFilters: boolean }) {
  if (searchQuery) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl mb-4 block">🔍</span>
        <h3 className="text-lg font-semibold mb-2">
          No results for "{searchQuery}"
        </h3>
        <p className="text-sm text-muted mb-4">
          Try a different ticker symbol or company name
        </p>
        <button onClick={clearSearch} className="text-primary">
          Clear search
        </button>
      </div>
    );
  }
  
  if (hasFilters) {
    return (
      <div className="text-center py-16">
        <span className="text-6xl mb-4 block">🎯</span>
        <h3 className="text-lg font-semibold mb-2">
          No stocks match your filters
        </h3>
        <p className="text-sm text-muted mb-4">
          Try adjusting AI Tier, Sector, or Score Range
        </p>
        <button onClick={clearFilters} className="text-primary">
          Clear all filters
        </button>
      </div>
    );
  }
  
  return (
    <div className="text-center py-16">
      <span className="text-6xl mb-4 block">📊</span>
      <h3 className="text-lg font-semibold mb-2">
        No stocks available
      </h3>
    </div>
  );
}
```

---

### Issue #10: Duplicate Reset Filter Button 🔄

**User Feedback:** "reset filter jangan ada 2 (desktop laptop)"

| Attribute | Details |
|-----------|---------|
| **File** | `components/layout/AppHeader.tsx` |
| **Lines** | 98-99 (preset reset) + 223-239 (conditional clear) |
| **Root Cause** | TWO reset buttons: (1) Preset button, (2) Conditional "Clear filters" button. Both visible simultaneously on desktop. |
| **Impact** | LOW - UI clutter |
| **Complexity** | LOW (15 minutes) |

**Fix Strategy:**
Remove preset reset button, keep only the conditional one:
```tsx
// Remove from presets array (lines 98-99)
// Keep only conditional button (lines 223-239)

{hasFilter && (
  <button onClick={clearFilters} className="...">
    ✕ Clear all filters
  </button>
)}
```

---

## 🟢 LOW PRIORITY (UI POLISH)

### Issue #11: Search Bar and Button Same Color 🎨

**User Feedback:** "form search sama button harusnya warna nya di bedain"

| Attribute | Details |
|-----------|---------|
| **File** | `app/globals.css` |
| **Lines** | 158-167 (.search-input) |
| **Root Cause** | Input (`#0d1e30`) and button (`#132030`) nearly identical. No visual hierarchy. |
| **Impact** | LOW - Minor aesthetics |
| **Complexity** | LOW (15 minutes) |

**Fix Strategy:**
```css
.search-input {
  background: #0d1e30;  /* Keep neutral */
  border: 1px solid #1e3a52;
}

.search-button {
  background: #457B9D;  /* Accent color - distinct */
  border: 1px solid #457B9D;
}

.search-button:hover {
  background: #5a8fb0;  /* Lighter on hover */
}
```

---

## 📁 Files Requiring Changes

### Critical Priority
| File | Lines | Type | Effort |
|------|-------|------|--------|
| `app/[locale]/screener/page.tsx` | 20, 52-89 | Add debounce, fix loading | 2-3h |
| `components/Dashboard.tsx` | 173-182 | Fix blank page | 1h |
| `app/globals.css` | 1-70 | Add light mode | 2-3h |
| `app/layout.tsx` | 53 | Use semantic colors | 15m |

### High Priority
| File | Lines | Type | Effort |
|------|-------|------|--------|
| `components/layout/AuthButton.tsx` | 44-64 | Responsive button | 30m |
| `app/globals.css` | 158-167 | Full-width search | 20m |
| `components/screener/FilterPanel.tsx` | 62-70 | Shorter placeholder | 15m |
| `app/[locale]/screener/page.tsx` | 113-152 | Remove duplication | 1-2h |

### Medium Priority
| File | Lines | Type | Effort |
|------|-------|------|--------|
| `components/screener/ScreenerTable.tsx` | 397-409 | Better empty state | 30m |
| `components/screener/ScreenerCardList.tsx` | 11-24 | Better empty state | 30m |
| `components/layout/AppHeader.tsx` | 98-239 | Remove duplicate | 15m |

### Low Priority
| File | Lines | Type | Effort |
|------|-------|------|--------|
| `app/globals.css` | 158-167 | Distinct colors | 15m |

---

## 🎯 Recommended Fix Order

### Phase 1: Critical Bugs (6-8 hours)
1. **Issue #2** - Fix blank page (1h) → Immediate first impression fix
2. **Issue #3** - Add light mode (3-4h) → Makes app usable for 40% of users
3. **Issue #1 + #8** - Add debounce (2-3h) → Core UX improvement

### Phase 2: Mobile Blockers (3-5 hours)
4. **Issue #4** - Show Google Sign In (30m) → Auth access
5. **Issue #5** - Full-width search (20m) → Mobile search UX
6. **Issue #7** - Remove duplication (1-2h) → Clean architecture
7. **Issue #6** - Shorter placeholder (15m) → Polish

### Phase 3: UX Polish (1-2 hours)
8. **Issue #9** - Better empty states (1h) → Clear messaging
9. **Issue #10** - Remove duplicate button (15m) → Clean UI
10. **Issue #11** - Distinct search colors (15m) → Visual hierarchy

---

## ⚠️ Risk Assessment

### High Risk
- **Light mode implementation** - Must test ALL components in both modes
- **Debounce refactor** - Must not break existing search/filter behavior
- **Loading state changes** - Don't break SSR or cause hydration errors

### Medium Risk
- **FilterPanel duplication removal** - Ensure responsive behavior works
- **Dashboard loading fix** - Might affect loading performance

### Low Risk
- All UI/copy changes (placeholders, empty states, colors)
- Button styling and layout tweaks

---

## ✅ Success Criteria

### After Critical Fixes (Phase 1)
- [ ] Page loads show layout immediately (no blank screen)
- [ ] Light mode shows all text clearly (test with DevTools)
- [ ] Typing in search doesn't feel laggy (debounced API calls)
- [ ] Filter changes don't feel like "page reload"

### After Mobile Fixes (Phase 2)
- [ ] Google Sign In button visible and tappable on 320px screen
- [ ] Search bar uses full width on mobile
- [ ] Placeholder text not cut off at 320px-375px
- [ ] No horizontal scrolling on any screen size

### After UX Polish (Phase 3)
- [ ] Empty state shows helpful message with clear action
- [ ] Only ONE reset/clear filters button visible
- [ ] Search button visually distinct from input

### Cross-Device Testing
- [ ] iPhone SE (375px) - all features work
- [ ] iPhone 14 (390px) - all features work
- [ ] iPad (768px) - layout correct
- [ ] Desktop (1280px+) - unchanged from before

---

## 📦 Dependencies to Install

```bash
npm install use-debounce
```

---

## 🚀 Next Steps

1. **Create fix branch:** `git checkout -b fix/user-feedback-issues`
2. **Start with Phase 1** (critical bugs)
3. **Test after each fix** (don't batch test at end)
4. **Generate CHANGES_SUMMARY.md** with before/after
5. **Create PR** with screenshots showing fixes

---

**Status:** ✅ AUDIT COMPLETE  
**Ready to Start:** Phase 1 (Critical Bugs)  
**Estimated Total Time:** 10-17 hours  
**Branch Strategy:** `fix/user-feedback-issues` from `main`
