# Feedback Audit Report (Preliminary)
**Repository:** stockscope (main branch)  
**Date:** 2026-03-27  
**Status:** Preliminary analysis (background agent still running)

## Executive Summary
- **Total issues:** 11
- **Critical bugs:** 3 (page reload, blank page, light mode visibility)
- **Mobile issues:** 4 (Google Sign In, search bar, placeholder, layouts)
- **UX issues:** 3 (search experience, empty state, duplicate button)
- **UI polish:** 1 (search colors)

---

## Issue Mapping

### CRITICAL BUGS

#### Issue #1: Tab/Filter Causes Full Page Reload ⚠️ HIGH PRIORITY
**User Feedback:** "ketika ganti tab atau ganti filter selalu loading page"

**Analysis:**
- **File:** `app/[locale]/screener/page.tsx`
- **Lines:** 45-89 (useEffect for data fetching)
- **Root Cause:** Every filter/search change triggers `setLoading(true)` and full data refetch with visible loading state
- **Current Behavior:** 
  - Line 63: `queueMicrotask(() => setLoading(true))` called on every filter change
  - Lines 64-78: Full API fetch that blocks UI
  - No debounce on search input
  - Loading state shows skeleton, creating "reload" feeling

**Evidence:**
```tsx
// Lines 52-89 in app/[locale]/screener/page.tsx
useEffect(() => {
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  // ... more filters
  
  queueMicrotask(() => setLoading(true)); // ← Sets loading on EVERY change
  fetch(`/api/stocks/enriched?${params.toString()}`)
    .then(...)
    .finally(() => setLoading(false));
}, [searchQuery, selectedSector, selectedAiTier, ...]); // ← Triggers on every dependency
```

**Impact:** Severe - affects every filter interaction, creates perception of "page reload"

**Fix Strategy:**
1. Add debounce (300ms) to search input specifically
2. Change loading behavior: keep old data visible, show subtle spinner in header
3. Use optimistic UI: don't immediately show skeleton on filter change
4. Consider SWR or React Query for better caching

---

#### Issue #2: Landing Page Blank on First Load ⚠️ CRITICAL
**User Feedback:** "ketika pertama kali buka, tampilan landing page nya gk keliatan cmn keluar tab nya aja"

**Analysis:**
- **File:** `app/[locale]/screener/page.tsx`
- **Lines:** 20-21, 162-173
- **Root Cause:** Initial `loading={true}` hides ALL content until first data fetch completes
- **Current Behavior:**
  - Line 20: `const [loading, setLoading] = useState(true);` - starts as true
  - Lines 172-173: Shows skeleton ONLY, no header/filters visible during initial load
  - Layout (header, sidebar) is rendered but main content area is completely empty

**Evidence:**
```tsx
// Line 20
const [loading, setLoading] = useState(true); // ← Initial state is loading

// Lines 162-184 - Content rendering
<div className="mt-6">
  {error ? (
    <div>Error display</div>
  ) : loading ? (
    <SkeletonLoader rows={5} columns={7} /> // ← ONLY skeleton shown, nothing else
  ) : view === 'cards' ? (
    <ScreenerCardList stocks={stocks} />
  ) : (
    <ScreenerTable stocks={stocks} ... />
  )}
</div>
```

**Impact:** Critical - users see blank page on first visit, bad first impression

**Fix Strategy:**
1. Change initial loading state to `false` OR show layout immediately
2. Always render filter panel and header, even during initial load
3. Show skeleton WITHIN the content area, not replacing everything
4. Add SSR/SSG if possible to render initial content server-side

---

#### Issue #3: Values Not Visible in Light Mode ⚠️ HIGH
**User Feedback:** "untuk bagian value nya gk keliatan meskipun light mode"

**Analysis:**
- **Files:** Multiple components using hardcoded dark mode colors
- **Root Cause:** No light mode support, all colors hardcoded for dark backgrounds
- **Affected Components:**
  - `components/screener/ScreenerTable.tsx` - uses text-on-surface (light text)
  - `components/screener/ScreenerCard.tsx` - uses text-on-surface (light text)
  - `components/screener/FilterPanel.tsx` - uses text-on-surface (light text)
  - `app/layout.tsx` line 53 - body has hardcoded dark bg: `bg-[#0c1324]`

**Evidence:**
```tsx
// app/layout.tsx line 53 - HARDCODED dark background
<body className={`${inter.className} bg-[#0c1324] text-[#dce1fb] antialiased`}>

// components/screener/ScreenerCard.tsx line 96 - light text
<div className="font-label text-xl font-semibold text-on-surface tabular-nums">

// app/globals.css lines 20-35 - NO light mode variables defined
:root {
  --color-surface: #0c1324;  // Only dark colors
  --color-text: #dce1fb;     // Light text for dark bg
  // No @media (prefers-color-scheme: light) overrides!
}
```

**Impact:** High - app completely unusable in light mode, text invisible

**Fix Strategy:**
1. Add light mode CSS variables in `app/globals.css`
2. Use Tailwind dark mode with `dark:` prefix for all text/bg colors
3. Replace all hardcoded colors with semantic classes
4. Test at: body should use `bg-background` not `bg-[#0c1324]`

---

### MOBILE BUGS

#### Issue #4: Google Sign In Not Visible on Mobile 📱
**User Feedback:** "sign in dengan google gk keliatan untuk mobile"

**Analysis:**
- **File:** Could not locate Google Sign In button component yet
- **Status:** ⏳ Waiting for background agent to identify exact component
- **Likely Location:** `components/layout/TerminalHeader.tsx` or `components/layout/AuthButton.tsx`
- **Suspected Cause:** Hidden on mobile with `hidden md:block` or similar

**Current Findings:**
- `TerminalHeader.tsx` shows user avatar (lines 55-59) but no sign-in button visible
- Need to check `AuthButton.tsx` component (found via grep)

**Fix Strategy:**
1. Find the Google Sign In button component
2. Remove mobile-hiding classes (`hidden md:block`)
3. Ensure button visible at all breakpoints
4. Add responsive sizing: larger touch target on mobile (min 44x44px)

---

#### Issue #5: Search Bar Not Full Width on Mobile 📱
**User Feedback:** "di hp ku ga full di baris searchnya"

**Analysis:**
- **File:** `components/screener/FilterPanel.tsx`
- **Lines:** 58-82 (search input)
- **Root Cause:** Input has `w-full` BUT parent container may have constraints
- **Current Behavior:**
  - Line 62: Input has `className="w-full"` ✓
  - Line 44: Parent div has fixed padding `p-6` 
  - Line 113: FilterPanel shown on mobile at lines 136-152 (duplicated for mobile)

**Evidence:**
```tsx
// Lines 58-82 in FilterPanel.tsx
<div className="relative group">
  <input
    type="text"
    value={searchQuery}
    className="w-full bg-surface-container-highest ..." // ← Has w-full
    // But container padding might constrain it
  />
</div>

// app/[locale]/screener/page.tsx lines 136-152
<div className="lg:hidden mb-6"> {/* ← Mobile filter */}
  <FilterPanel ... /> {/* ← Same component, might need responsive padding */}
</div>
```

**Impact:** Medium - search bar not utilizing full mobile width, poor UX

**Fix Strategy:**
1. Reduce mobile padding: `p-6 md:p-6` → `p-4 md:p-6`
2. Check if parent containers have max-width constraints
3. Test at 320px width (smallest phones)

---

#### Issue #6: Placeholder Text Getting Cut Off 📱
**User Feedback:** "placeholder nya kepotong, lebih disarankan kalau search bar lebih besar lagi atau hanya icon"

**Analysis:**
- **File:** `components/screener/FilterPanel.tsx`
- **Line:** 66
- **Root Cause:** Placeholder text too long for mobile screens
- **Current Text:** Uses translation key `searchPlaceholder`

**Translation Values:**
- **EN:** `messages/en.json` - Need to check actual text
- **ID:** `messages/id.json` - Need to check actual text

**Evidence:**
```tsx
// Line 66 in FilterPanel.tsx
placeholder={t('searchPlaceholder')}
// Need to check what this translates to
```

**Impact:** Low-Medium - placeholder text unreadable on mobile

**Fix Strategy:**
1. Shorten placeholder text: "Search ticker..." instead of long text
2. OR use responsive placeholder with conditional rendering
3. OR make icon-only on very small screens (<375px)
4. Increase input height on mobile: `py-3` → `py-3.5 md:py-3`

---

#### Issue #7: Layout Differs Between Mobile and Desktop 📱
**User Feedback:** "Frontend nya harus bikin kode beda untuk hp ama laptop/pc karna beda"

**Analysis:**
- **Files:** Multiple layout components lacking responsive classes
- **Main Issues Found:**
  1. FilterPanel duplicated (lines 113-131 and 136-152 in screener page)
  2. Table not responsive - needs horizontal scroll wrapper
  3. Fixed widths not responsive
  
**Evidence:**
```tsx
// app/[locale]/screener/page.tsx
// Lines 113-131: Desktop filter (hidden on mobile)
<div className="w-80 flex-shrink-0 hidden lg:block">

// Lines 136-152: Mobile filter (DUPLICATE component)
<div className="lg:hidden mb-6">
  <FilterPanel ... /> {/* ← Same props, different wrapper */}
</div>

// components/screener/ScreenerTable.tsx line 109
<div className="w-full overflow-x-auto"> {/* ← Has scroll wrapper ✓ */}
  <table className="w-full"> {/* ← But may need min-width */}
```

**Impact:** Medium - inconsistent experience between devices

**Fix Strategy:**
1. Use single FilterPanel with responsive styling (not duplicate)
2. Ensure all tables have `overflow-x-auto` wrapper with `min-w-[600px]`
3. Apply mobile-first Tailwind: `flex-col md:flex-row`, `text-sm md:text-base`
4. Test at: 320px, 375px, 390px, 768px, 1024px, 1440px

---

### UX ISSUES

#### Issue #8: Search Experience Poor 🔍
**User Feedback:** "search nya si jo tadi ku coba kurang sip"

**Analysis:**
- **File:** `components/screener/FilterPanel.tsx`
- **Lines:** 62-82 (search input)
- **Root Cause:** NO DEBOUNCE - triggers API call on every keystroke
- **Current Behavior:**
  - Line 65: `onChange={(e) => onSearchChange(e.target.value)}` 
  - This immediately updates parent state → triggers useEffect in page.tsx
  - Lines 52-89 in page.tsx: Every state change fetches API
  - Result: Typing "BBCA" triggers 4 API calls (B, BB, BBC, BBCA)

**Evidence:**
```tsx
// FilterPanel.tsx lines 62-65
<input
  type="text"
  value={searchQuery}
  onChange={(e) => onSearchChange(e.target.value)} // ← Immediate update!
/>

// app/[locale]/screener/page.tsx lines 52-89
useEffect(() => {
  // ... builds params
  fetch(`/api/stocks/enriched?${params.toString()}`) // ← Runs on EVERY keystroke
}, [searchQuery, ...]); // ← searchQuery in dependency array
```

**Impact:** High - poor performance, too many API calls, laggy typing

**Fix Strategy:**
1. Add 300ms debounce using `useDebouncedCallback` from `use-debounce`
2. Make search input uncontrolled or use local state with debounced sync
3. Add loading indicator inside search input (not full page)
4. Keep clear (×) button functionality (line 72-81) ✓

---

#### Issue #9: Empty Search Results Bad Wording 📝
**User Feedback:** "jika stock yang dicari tidak ada, wording yang dipakai jangan itu"

**Analysis:**
- **Files:** 
  - `components/screener/ScreenerTable.tsx` lines 397-409
  - `components/screener/ScreenerCardList.tsx` lines 11-25
- **Current Wording:** "No stocks found" + "Try adjusting your filters"
- **Issue:** Generic, not helpful, sounds like an error

**Evidence:**
```tsx
// ScreenerTable.tsx lines 397-409
{stocks.length === 0 && (
  <div className="text-center py-16">
    <span className="material-symbols-outlined text-6xl text-on-surface-variant/20 mb-4 block">
      search_off
    </span>
    <p className="font-headline text-sm uppercase tracking-widest text-on-surface-variant">
      No stocks found  {/* ← TOO GENERIC */}
    </p>
    <p className="font-body text-sm text-on-surface-variant/60 mt-2">
      Try adjusting your filters  {/* ← NOT HELPFUL */}
    </p>
  </div>
)}
```

**Impact:** Low-Medium - confusing for users, not actionable

**Fix Strategy:**
1. Create proper EmptyState component with helpful messaging
2. New wording: "No results for '[query]'" + actionable help
3. Add "Clear search" button prominently
4. Use friendly tone, not error-like
5. Example: 🔍 "No results for 'BBCA'" + "Try a different ticker or company name"

---

#### Issue #10: Duplicate Reset Filter Button 🔄
**User Feedback:** "reset filter jangan ada 2 (desktop laptop)"

**Analysis:**
- **File:** `components/screener/FilterPanel.tsx`
- **Lines:** 189-204 ("Clear Filters" button inside Advanced accordion)
- **Issue:** FilterPanel rendered TWICE on page (desktop + mobile versions)
- **Current Structure:**
  - Lines 113-131 in page.tsx: Desktop FilterPanel (hidden on mobile)
  - Lines 136-152 in page.tsx: Mobile FilterPanel (hidden on desktop)
  - BUT: Both might be visible at some breakpoints causing duplicate

**Evidence:**
```tsx
// app/[locale]/screener/page.tsx
// Desktop version (line 113)
<div className="w-80 flex-shrink-0 hidden lg:block">
  <FilterPanel ... /> {/* Has reset button */}
</div>

// Mobile version (line 136)  
<div className="lg:hidden mb-6">
  <FilterPanel ... /> {/* Same button again! */}
</div>

// FilterPanel.tsx lines 189-204
{advancedFilterCount > 0 && (
  <button onClick={() => { /* Clear filters */ }}>
    {t('clearAdvancedFilters')}  {/* ← This button appears twice */}
  </button>
)}
```

**Impact:** Low - confusing UI, looks unprofessional

**Fix Strategy:**
1. Don't duplicate FilterPanel component - use responsive CSS instead
2. OR: If must duplicate, move clear button outside FilterPanel to parent
3. OR: Use single FilterPanel with responsive width/positioning

---

### UI POLISH

#### Issue #11: Search Bar and Button Same Color 🎨
**User Feedback:** "form search sama button harusnya warna nya di bedain"

**Analysis:**
- **File:** `components/screener/FilterPanel.tsx`
- **Lines:** 58-82 (search input - no separate button)
- **Current Design:** Input has integrated clear (×) button, no separate search button
- **Colors:**
  - Input: `bg-surface-container-highest` (dark gray)
  - Clear button: `text-on-surface-variant` (gray text)
  - No accent color anywhere

**Evidence:**
```tsx
// Lines 62-82 in FilterPanel.tsx
<input
  className="w-full bg-surface-container-highest border-b border-outline-variant/20
             focus:border-primary ..." // ← Neutral colors only
/>
{searchQuery && (
  <button className="... text-on-surface-variant hover:text-error ...">
    <span className="material-symbols-outlined text-sm">close</span>
  </button>
)}
```

**Current State:** No separate search button exists - only integrated clear button

**Impact:** Low - but could improve visual hierarchy

**Fix Strategy:**
1. Add separate search button with accent color
2. Create input group: `input` + `button` side-by-side
3. Input: neutral `bg-surface-container-highest`
4. Button: accent `bg-primary hover:bg-primary-hover`
5. OR: Keep current design but add accent color to search icon

---

## Files Requiring Changes

### Critical Priority (Issues #1-3)
| File | Lines | Change Type | Complexity |
|------|-------|-------------|------------|
| `app/[locale]/screener/page.tsx` | 20, 63, 52-89 | Add debounce, change loading behavior | Medium |
| `app/layout.tsx` | 53 | Replace hardcoded colors with semantic classes | Low |
| `app/globals.css` | 1-50 | Add light mode CSS variables | Medium |
| `components/screener/FilterPanel.tsx` | 62-82 | Add search debounce | Low |

### High Priority (Issues #4-7)
| File | Lines | Change Type | Complexity |
|------|-------|-------------|------------|
| `components/layout/AuthButton.tsx` | TBD | Show Google Sign In on mobile | Low |
| `components/screener/FilterPanel.tsx` | 44, 62-82 | Responsive padding, shorter placeholder | Low |
| `app/[locale]/screener/page.tsx` | 113-152 | Remove duplicate FilterPanel | Medium |
| `components/screener/ScreenerTable.tsx` | 109-110 | Add min-width for mobile scroll | Low |

### Medium Priority (Issues #8-11)
| File | Lines | Change Type | Complexity |
|------|-------|-------------|------------|
| `components/screener/ScreenerTable.tsx` | 397-409 | Improve empty state wording | Low |
| `components/screener/ScreenerCardList.tsx` | 11-25 | Improve empty state wording | Low |
| `components/screener/FilterPanel.tsx` | 189-204 | Fix duplicate button issue | Low |
| `components/screener/FilterPanel.tsx` | 58-82 | Add search button with accent color | Medium |

---

## Risk Assessment

### High Risk Changes
1. **Loading state refactor** - Could break existing loading UX if not careful
2. **Light mode support** - Need to test ALL components in both modes
3. **Debounce implementation** - Must not break existing search functionality

### Medium Risk Changes
1. **Duplicate FilterPanel removal** - Need to ensure responsive behavior works
2. **Empty state updates** - Need to update translation files

### Low Risk Changes
1. **Placeholder text shortening** - Simple translation file edit
2. **Search button styling** - Pure visual change
3. **Mobile padding adjustments** - CSS only

---

## Next Steps

1. **Wait for background agent** to complete full audit
2. **Merge findings** from background agent into this document
3. **Prioritize fixes** based on impact and complexity
4. **Create fix branches:**
   - `fix/critical-bugs` - Issues #1-3
   - `fix/mobile-issues` - Issues #4-7
   - `fix/ux-polish` - Issues #8-11
5. **Test each fix** at multiple breakpoints
6. **Generate CHANGES_SUMMARY.md** after completion

---

**Status:** ⏳ Waiting for background agent to complete comprehensive audit  
**Next Update:** When feedback-audit agent completes (estimated 3-5 minutes)
