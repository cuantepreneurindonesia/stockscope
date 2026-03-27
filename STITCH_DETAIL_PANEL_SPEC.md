# Stock Detail Panel - Design Specification

## Overview
Right-side sticky panel (desktop) or bottom sheet (mobile) that displays detailed stock information when user clicks a stock row or card.

---

## Current Implementation (What We Have)

### Desktop
```
┌────────────────────────────────────────────┐
│  Table Row (Click to expand)              │
├────────────────────────────────────────────┤
│  ▼ Expanded Content (inline)              │
│                                            │
│  Technical  │  Fundamentals  │  Flags     │
│  RSI: 65    │  P/E: 12.5     │  • Flag1  │
│  MACD: 0.5  │  ROE: 15.2%    │  • Flag2  │
└────────────────────────────────────────────┘
```

**Pros:**
- Simple, no additional component
- Works inline in table

**Cons:**
- Pushes other rows down
- Limited space for rich content
- Not persistent across row selection

---

## Stitch Specification (What We Need)

### Desktop Layout
```
┌─────────────────────────┬──────────────────┐
│  Main Content (Table)   │  Detail Panel    │
│                         │  (Sticky Right)  │
│  ┌──────────────────┐  │  ┌────────────┐  │
│  │ BBCA  4,500  +2% │◄─┼──│ X  CLOSE   │  │
│  └──────────────────┘  │  │            │  │
│  ┌──────────────────┐  │  │ BBCA       │  │
│  │ TLKM  3,200  -1% │  │  │ Bank CA    │  │
│  └──────────────────┘  │  │            │  │
│                         │  │ HHI: ███   │  │
│                         │  │ Float: ██  │  │
│                         │  │            │  │
│                         │  │ Top Holder │  │
│                         │  │ Flags: 🏴  │  │
│                         │  └────────────┘  │
└─────────────────────────┴──────────────────┘
      70% width                 30% width
```

### Mobile Layout
```
┌─────────────────────────────┐
│  Main Content (Cards)       │
│                             │
│  ┌─────────────────────┐   │
│  │ BBCA  4,500  +2%    │◄──┼─ Click
│  └─────────────────────┘   │
│  ┌─────────────────────┐   │
│  │ TLKM  3,200  -1%    │   │
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
            ↓
┌─────────────────────────────┐
│  Dimmed Background          │
│  (Click to close)           │
│  ┌─────────────────────┐   │
│  │                     │   │
│  └─────────────────────┘   │
│  ╔═════════════════════╗   │
│  ║ X CLOSE     BBCA    ║   │  ← Slides up
│  ║                     ║   │     from bottom
│  ║ Bank Central Asia   ║   │
│  ║                     ║   │
│  ║ HHI: ████████░░     ║   │
│  ║ Float: ███████░░░   ║   │
│  ║                     ║   │
│  ║ [More details...]   ║   │
│  ╚═════════════════════╝   │
└─────────────────────────────┘
```

---

## Component Structure

### File: `components/screener/StockDetailPanel.tsx`

```typescript
'use client';

import { useState } from 'react';
import type { EnrichedStock } from '@/lib/types/unified';

interface StockDetailPanelProps {
  stock: EnrichedStock | null;
  onClose: () => void;
  isOpen: boolean;
}

export function StockDetailPanel({ stock, onClose, isOpen }: StockDetailPanelProps) {
  if (!stock || !isOpen) return null;

  return (
    <>
      {/* Mobile: Overlay */}
      <div 
        className="md:hidden fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      
      {/* Desktop: Fixed Right Panel */}
      <aside className="hidden md:block fixed right-0 top-[68px] w-[400px] h-[calc(100vh-68px)]
                        bg-surface border-l border-outline-variant
                        overflow-y-auto z-50 animate-in slide-in-from-right duration-300">
        <PanelContent stock={stock} onClose={onClose} />
      </aside>

      {/* Mobile: Bottom Sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 max-h-[80vh]
                      bg-surface rounded-t-2xl overflow-y-auto z-50
                      animate-in slide-in-from-bottom duration-300">
        <PanelContent stock={stock} onClose={onClose} />
      </div>
    </>
  );
}
```

---

## Panel Content Layout

### Header Section
```
┌─────────────────────────────────┐
│  X                              │  ← Close button (top-right)
│                                 │
│  BBCA                           │  ← Ticker (DM Mono, 32px, bold)
│  PT Bank Central Asia Tbk       │  ← Name (DM Sans, 14px)
│                                 │
│  🟢 Green    T1: Strong Buy     │  ← Tier badges
└─────────────────────────────────┘
```

### Metrics Section (Micro Progress Bars)
```
┌─────────────────────────────────┐
│  HHI (Herfindahl Index)         │
│  ████████████░░░░░  2,458       │  ← Bar + Value
│  Moderate concentration          │  ← Status label
│                                 │
│  Free Float                     │
│  ███████████████░░  75.2%       │
│  Good liquidity                 │
│                                 │
│  C1 (Top Holder)                │
│  ████████░░░░░░░░░  42.3%       │
│  Concentrated                   │
│                                 │
│  C3 (Top 3 Holders)             │
│  ████████████░░░░░  67.8%       │
│  Moderate                       │
└─────────────────────────────────┘
```

### Top Holder Section
```
┌─────────────────────────────────┐
│  TOP HOLDER                     │  ← Eyebrow (DM Mono, 10px, uppercase)
│                                 │
│  State-Owned Enterprise         │  ← Type
│  PT XYZ Holdings                │  ← Name
│  42.3%                          │  ← Percentage (large, bold)
└─────────────────────────────────┘
```

### Governance Flags Section
```
┌─────────────────────────────────┐
│  GOVERNANCE FLAGS               │
│                                 │
│  🚩 Related Party Transaction   │  ← Flag pills
│  🚩 High Debt Ratio             │
│  ⚠️  Declining Revenue           │
└─────────────────────────────────┘
```

---

## Micro Progress Bar Component

### Visual Design
```
Label: HHI (Herfindahl Index)
─────────────────────────────
█████████████░░░░░░░  2,458
─────────────────────────────
Status: Moderate concentration

Components:
1. Label (DM Mono, 10px, uppercase, tracking-widest)
2. Bar container (h-2, bg-white/5, rounded-full)
3. Fill bar (h-2, bg-color based on threshold, shadow glow)
4. Value (DM Mono, 14px, tabular-nums, right-aligned)
5. Status text (DM Sans, 12px, muted color)
```

### Color Thresholds

**HHI (Lower is better):**
- < 1,500: Green (#2a9d8f) - "Low concentration"
- 1,500-2,500: Amber (#e9c46a) - "Moderate concentration"  
- > 2,500: Red (#e76f51) - "High concentration"

**Float (Higher is better):**
- > 60%: Green - "Good liquidity"
- 40-60%: Amber - "Moderate liquidity"
- < 40%: Red - "Low liquidity"

**C1 (Lower is better):**
- < 30%: Green - "Diversified"
- 30-50%: Amber - "Concentrated"
- > 50%: Red - "Highly concentrated"

### Code Example
```tsx
function MicroBar({ 
  label, 
  value, 
  max, 
  thresholds,
  unit = ''
}: MicroBarProps) {
  const percent = (value / max) * 100;
  const color = getColorFromThresholds(value, thresholds);
  
  return (
    <div className="space-y-1">
      <div className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color.bg} ${color.shadow} transition-all duration-500`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="font-label text-sm tabular-nums text-on-surface min-w-[4rem] text-right">
          {value.toFixed(1)}{unit}
        </span>
      </div>
      <div className={`font-body text-xs ${color.text}`}>
        {color.label}
      </div>
    </div>
  );
}
```

---

## State Management

### In Screener Page
```typescript
// app/[locale]/screener/page.tsx

export default function ScreenerPage() {
  const [selectedStock, setSelectedStock] = useState<EnrichedStock | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleStockClick = (stock: EnrichedStock) => {
    setSelectedStock(stock);
    setIsPanelOpen(true);
  };

  const handlePanelClose = () => {
    setIsPanelOpen(false);
    // Don't clear selectedStock immediately to allow slide-out animation
    setTimeout(() => setSelectedStock(null), 300);
  };

  return (
    <div className="flex">
      {/* Main content */}
      <div className="flex-1">
        <ScreenerTable 
          stocks={stocks}
          onStockClick={handleStockClick}
        />
      </div>

      {/* Detail Panel */}
      <StockDetailPanel
        stock={selectedStock}
        isOpen={isPanelOpen}
        onClose={handlePanelClose}
      />
    </div>
  );
}
```

### In Table Component
```typescript
// components/screener/ScreenerTable.tsx

interface ScreenerTableProps {
  stocks: EnrichedStock[];
  onStockClick: (stock: EnrichedStock) => void;  // ← New prop
  // ... other props
}

export function ScreenerTable({ stocks, onStockClick }: ScreenerTableProps) {
  return (
    <tbody>
      {stocks.map((stock) => (
        <tr 
          key={stock.code}
          onClick={() => onStockClick(stock)}  // ← Click handler
          className="cursor-pointer hover:bg-white/5"
        >
          {/* ... table cells */}
        </tr>
      ))}
    </tbody>
  );
}
```

---

## Animations

### Desktop (Slide from Right)
```css
@keyframes slide-in-from-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Usage */
.animate-in.slide-in-from-right {
  animation: slide-in-from-right 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Mobile (Slide from Bottom)
```css
@keyframes slide-in-from-bottom {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

---

## Responsive Behavior

### Desktop (> 768px)
- Panel: Fixed right, 400px width
- Position: `right-0 top-[68px]` (below header)
- Height: `calc(100vh - 68px)`
- Main content: `margin-right: 400px` when panel open
- Overlay: None (panel beside content)

### Tablet (768px)
- Panel: Still fixed right but narrower (320px)
- Overlay: Optional dim behind
- Main content: Shifts left slightly

### Mobile (< 768px)
- Panel: Bottom sheet, max-height 80vh
- Overlay: Black 60% opacity, full screen
- Main content: Fixed, not shifted
- Close: Tap overlay or close button

---

## Accessibility

### Keyboard Navigation
- **Escape key**: Close panel
- **Tab**: Navigate through panel content
- **Focus trap**: Keep focus inside panel when open
- **Return focus**: Back to clicked row when closed

### Screen Readers
```html
<aside 
  role="complementary"
  aria-label="Stock detail panel"
  aria-modal="true"
>
  <button 
    aria-label="Close stock details"
    onClick={onClose}
  >
    ✕
  </button>
  <!-- Panel content -->
</aside>
```

---

## Comparison: Current vs Stitch

### Current (Inline Expansion)
```
Pros:
✓ Simple implementation
✓ No extra state management
✓ Works inline with table

Cons:
✗ Pushes other rows down
✗ Limited space
✗ Not persistent
✗ Hard to compare stocks
```

### Stitch (Side Panel)
```
Pros:
✓ Dedicated detail space
✓ Doesn't disrupt table layout
✓ Persistent across selections
✓ Easy to compare stocks
✓ More professional feel

Cons:
✗ More complex implementation
✗ Requires state management
✗ Takes horizontal space
```

---

## Recommendation

**Implement the Stitch detail panel.** It's a significant UX improvement that aligns with the "Bloomberg Terminal" professional aesthetic. The side panel is standard in professional trading platforms and provides a much better experience for viewing detailed stock information.

**Effort:** 6-8 hours
**Priority:** HIGH (major UX feature)
**Impact:** Makes the app feel professional vs consumer-grade

---

## Implementation Checklist

- [ ] Create `StockDetailPanel.tsx` component
- [ ] Create `MicroBar.tsx` component for progress bars
- [ ] Add `selectedStock` state to screener page
- [ ] Add `onStockClick` handler to table/cards
- [ ] Implement desktop layout (fixed right)
- [ ] Implement mobile layout (bottom sheet)
- [ ] Add slide-in animations
- [ ] Add overlay for mobile
- [ ] Implement close handlers (button, overlay, escape)
- [ ] Add keyboard navigation
- [ ] Test responsive breakpoints
- [ ] Verify accessibility

**Total:** ~6-8 hours of work for a major UX upgrade! 🚀
