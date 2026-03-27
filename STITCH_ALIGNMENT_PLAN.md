# Stitch Design Alignment - Gap Analysis

## Current Implementation vs. Original Stitch Prompt

### ✅ ALIGNED (What We Got Right)

**Layout & Structure:**
- ✅ Dark terminal aesthetic
- ✅ Desktop-first with responsive mobile
- ✅ App shell with header + navigation tabs
- ✅ Filter panel with basic/advanced accordion
- ✅ Results container with table/card views
- ✅ Skeleton loading states
- ✅ Compact spacing, rounded corners

**Components:**
- ✅ Search input with icon + clear button
- ✅ Dropdown selectors (sector, tier)
- ✅ Accordion collapsible sections
- ✅ AI Score legend display
- ✅ Governance tier toggle buttons
- ✅ Card view for mobile
- ✅ Sortable table headers

**Interactions:**
- ✅ Hover states on all interactive elements
- ✅ Smooth transitions (150-300ms)
- ✅ Clear active/disabled states

### ❌ GAPS (What Needs Adjustment)

**1. Color Palette** ⚠️ MAJOR
**Current:**
- Primary: #4edea3 (emerald)
- Error: #ffb4ab (rose)
- Background: #070d1f

**Stitch Spec:**
- Primary: #2a9d8f (teal/green)
- Amber: #e9c46a (warnings)
- Red: #e76f51 (errors)
- Background: #060d18 and #09131f
- Borders: #132030 and #1e3a52
- Text: #e8f4f8 (primary), #a8c8e8 (secondary), #6b8aad (tertiary)

**Impact:** Medium - colors work but don't match Stitch spec exactly

---

**2. Typography** ⚠️ MAJOR
**Current:**
- Headlines: Manrope
- Body: Inter
- Numbers: Space Grotesk

**Stitch Spec:**
- Body/UI: **DM Sans**
- Labels/Numbers: **DM Mono**

**Impact:** High - wrong fonts, need to change imports

---

**3. Borders** ⚠️ MINOR
**Current:**
- "No-Line Rule" - removed all 1px borders
- Using surface layering only

**Stitch Spec:**
- **Thin 1px borders** (#132030, #1e3a52)
- "Trading-terminal clean" with subtle borders

**Impact:** Medium - adds definition, more aligned with original intent

---

**4. Stock Detail Panel** ❌ MISSING
**Current:**
- Expandable table rows (inline expansion)
- Card expansion (inline)

**Stitch Spec:**
- **Right-side sticky panel** (desktop)
- **Bottom sheet** (mobile)
- Micro progress bars for metrics
- Top holder section
- Governance flags section

**Impact:** High - key feature missing, needed for UX

---

**5. Upgrade Page** ✅ EXISTS (already implemented)
- Located at `/[locale]/upgrade`
- Has paywall card with QRIS
- Needs minor styling adjustments to match Stitch colors

---

## Recommended Action Plan

### Phase 1: Color Palette Update (Quick Win)
**Priority:** HIGH
**Effort:** 2 hours
**Impact:** Visual consistency with Stitch

1. Update `lib/design-tokens.ts`:
   - Change primary: #2a9d8f
   - Change error: #e76f51
   - Add amber: #e9c46a
   - Update backgrounds: #060d18, #09131f
   - Update borders: #132030, #1e3a52
   - Update text colors: #e8f4f8, #a8c8e8, #6b8aad

2. Update `tailwind.config.ts` with new tokens

3. Find/replace color classes throughout components:
   - `text-primary` → remains (but color changes)
   - `bg-primary` → remains (but color changes)
   - `text-error` → remains (but color changes)
   - Add `text-amber`, `bg-amber` for warnings

---

### Phase 2: Typography Update (Medium Effort)
**Priority:** HIGH
**Effort:** 3 hours
**Impact:** Proper "terminal" aesthetic

1. Update `app/layout.tsx`:
   ```typescript
   import { DM_Sans, DM_Mono } from 'next/font/google'
   
   const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })
   const dmMono = DM_Mono({ weight: ['400', '500'], subsets: ['latin'], variable: '--font-dm-mono' })
   ```

2. Update `tailwind.config.ts`:
   - body: 'var(--font-dm-sans)' (replaces Inter)
   - label: 'var(--font-dm-mono)' (replaces Space Grotesk)
   - headline: 'var(--font-dm-sans)' (replaces Manrope)

3. Update components:
   - All numbers → `font-label` (DM Mono)
   - All UI text → `font-body` (DM Sans)
   - All eyebrow labels → `font-label uppercase` (DM Mono)

---

### Phase 3: Restore Subtle Borders (Quick Win)
**Priority:** MEDIUM
**Effort:** 1 hour
**Impact:** Terminal definition

1. Add borders to:
   - Table headers: `border-b border-outline-variant` (#132030)
   - Card containers: `border border-surface-border` (#1e3a52)
   - Filter panel: `border border-outline-variant`
   - Results container: `border border-surface-border`

2. Keep borderless:
   - Input fields (use shadow instead)
   - Buttons (use background only)
   - Navigation items

---

### Phase 4: Stock Detail Panel (New Feature)
**Priority:** HIGH
**Effort:** 6 hours
**Impact:** Major UX improvement

1. Create `components/screener/StockDetailPanel.tsx`:
   - Desktop: fixed right sidebar (400px width)
   - Mobile: bottom sheet with slide-up animation
   - Header: Ticker (large, DM Mono) + close button
   - Micro progress bars for metrics (HHI, Float, C1, C3)
   - Top holder section
   - Governance flags section

2. Add state management:
   - `selectedStock` state in screener page
   - Click handler on table rows/cards
   - Panel slides in from right (desktop)
   - Sheet slides up from bottom (mobile)

3. Styling:
   - Background: #09131f
   - Border-left: 1px solid #1e3a52 (desktop)
   - Shadow: subtle glow
   - Smooth slide animation (300ms)

---

## Implementation Strategy

### Option A: Full Stitch Alignment (Recommended)
**Timeline:** 12 hours
1. Color palette (2h)
2. Typography (3h)
3. Borders (1h)
4. Detail panel (6h)
**Result:** 100% Stitch-aligned

### Option B: Quick Refinement
**Timeline:** 3 hours
1. Color palette only (2h)
2. Typography only (3h)
**Result:** 80% aligned, keep existing features

### Option C: Hybrid Approach (Pragmatic)
**Timeline:** 8 hours
1. Color palette (2h)
2. Typography (3h)
3. Detail panel only (6h)
4. Skip borders (keep borderless)
**Result:** 90% aligned, best features

---

## Testing Checklist (After Changes)

### Visual Regression
- [ ] All teal (#2a9d8f) replaces emerald
- [ ] All amber (#e9c46a) for warnings
- [ ] All red (#e76f51) for errors
- [ ] DM Sans for all UI text
- [ ] DM Mono for all labels/numbers
- [ ] Borders visible but subtle

### Functionality
- [ ] Search/filter works
- [ ] Sorting works
- [ ] View toggle works
- [ ] Detail panel opens/closes
- [ ] Mobile bottom sheet works
- [ ] No layout breaks

### Performance
- [ ] Fonts load correctly (no FOIT)
- [ ] Animations smooth (60fps)
- [ ] No console errors
- [ ] Build passes

---

## Recommendation

**Start with Option C (Hybrid):**
1. Update colors to match Stitch exactly (teal/amber/red)
2. Update fonts to DM Sans/DM Mono
3. Build the Stock Detail Panel (biggest UX win)
4. Keep borderless design (it's cleaner)

This gives us 90% Stitch alignment while keeping the best parts of our current implementation (borderless, clean aesthetic).

**Next Steps:**
1. Create new branch: `feature/stitch-alignment`
2. Update colors first (quick visual win)
3. Update fonts (proper terminal aesthetic)
4. Build detail panel (major feature add)
5. Test locally before pushing
6. Deploy as separate PR

---

**Estimated Total Time:** 8-10 hours
**Deploy ETA:** Same day if we start now
