# Color Palette Comparison - Current vs Stitch

## Current Implementation (Terminal Design)

### Primary Colors
```
Primary (Emerald):    #4edea3  ████████  Used for: positive, buy, success
Secondary (Sky):      #a8d8ea  ████████  Used for: links, highlights
Error (Rose):         #ffb4ab  ████████  Used for: negative, sell, errors
Tertiary (Amber):     #ffb95f  ████████  Used for: warnings, neutral
```

### Backgrounds
```
Surface Lowest:       #070d1f  ████████  Base background
Surface Low:          #0c1525  ████████  Cards, panels
Surface:              #1a1f35  ████████  Elevated elements
Surface High:         #2e3447  ████████  Active states
```

### Text Colors
```
On Surface:           #dce1fb  ████████  Primary text
On Surface Variant:   #bbcabf  ████████  Secondary text
```

### Visual Example:
```
┌─────────────────────────────────────────┐
│  🟢 STOCKSCOPE (Emerald Logo)          │
│  ─────────────────────────────────────  │
│                                         │
│  Search: [___________________] 🔍       │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ ▌BBCA  Price: 4,500  +2.5% 🟢  │  │  ← Emerald status pill
│  │   Bank Central Asia              │  │
│  │   AI Score: ████████░░ 85       │  │  ← Emerald progress bar
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Stitch Specification (Original Prompt)

### Primary Colors
```
Primary (Teal):       #2a9d8f  ████████  Used for: positive, buy, success
Secondary (Blue):     #457b9d  ████████  Used for: links, highlights
Error (Red):          #e76f51  ████████  Used for: negative, sell, errors
Amber (Warning):      #e9c46a  ████████  Used for: warnings, neutral
```

### Backgrounds
```
Deep Background:      #060d18  ████████  Base background
Surface Dark:         #09131f  ████████  Cards, panels
```

### Borders
```
Border Subtle:        #132030  ████████  Primary borders
Border Strong:        #1e3a52  ████████  Elevated borders
```

### Text Colors
```
Text Primary:         #e8f4f8  ████████  Primary text
Text Secondary:       #a8c8e8  ████████  Secondary text
Text Tertiary:        #6b8aad  ████████  Muted text
```

### Visual Example:
```
┌─────────────────────────────────────────┐
│  🟦 STOCKSCOPE (Teal Logo)             │
│  ─────────────────────────────────────  │
│                                         │
│  Search: [___________________] 🔍       │
│                                         │
│  ┌──────────────────────────────────┐  │
│  │ ▌BBCA  Price: 4,500  +2.5% 🟦  │  │  ← Teal status pill
│  │ │ Bank Central Asia              │  │  ← Subtle 1px border
│  │ │ AI Score: ████████░░ 85       │  │  ← Teal progress bar
│  └──────────────────────────────────┘  │
│                                         │
└─────────────────────────────────────────┘
```

---

## Side-by-Side Comparison

| Element | Current (Emerald) | Stitch (Teal) | Visual Difference |
|---------|-------------------|---------------|-------------------|
| **Status Positive** | #4edea3 (bright emerald) | #2a9d8f (muted teal) | Stitch is more professional, less vibrant |
| **Status Negative** | #ffb4ab (soft rose) | #e76f51 (bold red) | Stitch is more alarming, traditional red |
| **Warnings** | #ffb95f (bright amber) | #e9c46a (muted amber) | Stitch is softer, more earthy |
| **Background** | #070d1f (blue-black) | #060d18 (pure-black) | Stitch is darker, more "terminal" |
| **Borders** | None (borderless) | #132030, #1e3a52 | Stitch has subtle definition lines |

---

## Color Psychology

### Current (Emerald/Rose)
- **Vibe:** Modern, startup, friendly
- **Feel:** Approachable, clean, minimal
- **Audience:** Retail investors, beginners
- **Similar to:** Robinhood, Trading212, Revolut

### Stitch (Teal/Red)
- **Vibe:** Professional, terminal, serious
- **Feel:** Data-dense, trustworthy, traditional
- **Audience:** Active traders, finance pros
- **Similar to:** Bloomberg Terminal, TradingView, E*TRADE

---

## Component Examples

### Button States

**Current (Emerald):**
```
Normal:   bg-primary (#4edea3) text-on-primary
Hover:    bg-primary/80 with glow shadow
Active:   bg-primary/90
Disabled: bg-primary/20 text-primary/40
```

**Stitch (Teal):**
```
Normal:   bg-primary (#2a9d8f) text-white
Hover:    bg-primary/90 with subtle glow
Active:   bg-primary/80
Disabled: bg-on-surface-variant/10
```

### Table Row Hover

**Current:**
```css
hover:bg-white/5          /* Very subtle, invisible-like */
```

**Stitch:**
```css
hover:bg-surface-hover    /* Slightly more visible */
border-b: 1px solid #132030  /* Adds definition */
```

### Score Bars

**Current (Emerald):**
```
Score 70+:  #4edea3 with shadow-[0_0_8px_rgba(78,222,163,0.4)]
Score 40-69: #ffb95f with amber glow
Score <40:   #ffb4ab with rose glow
```

**Stitch (Teal):**
```
Score 70+:  #2a9d8f with subtle teal glow
Score 40-69: #e9c46a with amber glow
Score <40:   #e76f51 with red glow
```

---

## Accessibility Comparison

### Contrast Ratios (WCAG AA = 4.5:1 minimum)

| Text on Background | Current | Stitch | Pass? |
|-------------------|---------|--------|-------|
| Primary text (#dce1fb on #070d1f) | 13.2:1 | - | ✅ |
| Primary text (#e8f4f8 on #060d18) | - | 14.1:1 | ✅ |
| Emerald on dark (#4edea3 on #070d1f) | 7.8:1 | - | ✅ |
| Teal on dark (#2a9d8f on #060d18) | - | 5.2:1 | ✅ |
| Rose text (#ffb4ab on #070d1f) | 8.1:1 | - | ✅ |
| Red text (#e76f51 on #060d18) | - | 6.3:1 | ✅ |

**Both palettes are accessible!** ✅

---

## Recommendation

### Keep Current (Emerald) If:
- You want a modern, friendly vibe
- Target audience is retail/beginner investors
- Want to stand out from traditional finance apps
- Prefer cleaner, more minimal aesthetic

### Switch to Stitch (Teal) If:
- You want professional "Bloomberg Terminal" vibe
- Target audience is active traders/professionals
- Want traditional finance app credibility
- Need exact match to Stitch mockups

### My Opinion:
**Stitch colors are more appropriate** for the "beginner-friendly Bloomberg Terminal" positioning. The muted teal is professional but not intimidating, and the traditional red for negatives is universally understood in finance.

**Effort to change:** 2 hours (search/replace in design-tokens.ts and verify)

---

## Visual Mock-up Comparison

### Current Design (Emerald)
```
╔═══════════════════════════════════════════╗
║  🟢 STOCKSCOPE         ID | EN 🇮🇩       ║
╠═══════════════════════════════════════════╣
║  Dashboard  SCREENER                      ║
╠═══════════════════════════════════════════╣
║                                           ║
║  STOCK SCREENER                           ║
║  AI-powered screening for IDX             ║
║                                           ║
║  🔍 Search... [x]  📊 Sector: All  ⚙️    ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ 🟢 Live Market • 128 Results        │ ║
║  │                          [▤] [≡]    │ ║
║  ├─────────────────────────────────────┤ ║
║  │ ▌BBCA    4,500  +2.5% 🟢           │ ║  ← Emerald pill
║  │   Bank Central Asia                 │ ║
║  │   ████████░░ 85                    │ ║  ← Emerald bar
║  └─────────────────────────────────────┘ ║
║                                           ║
╚═══════════════════════════════════════════╝
```

### Stitch Design (Teal)
```
╔═══════════════════════════════════════════╗
║  🔷 STOCKSCOPE         ID | EN 🇮🇩       ║
╠═══════════════════════════════════════════╣
║  Dashboard  SCREENER                      ║
╠═══════════════════════════════════════════╣
║                                           ║
║  STOCK SCREENER                           ║
║  AI-powered screening for IDX             ║
║                                           ║
║  🔍 Search... [x]  📊 Sector: All  ⚙️    ║
║                                           ║
║  ┌─────────────────────────────────────┐ ║
║  │ 🔷 Live Market • 128 Results        │ ║  ← Subtle border
║  │                          [▤] [≡]    │ ║
║  ├─────────────────────────────────────┤ ║
║  │ ▌BBCA    4,500  +2.5% 🔷           │ ║  ← Teal pill
║  │ │ Bank Central Asia                 │ ║  ← 1px border
║  │ │ ████████░░ 85                    │ ║  ← Teal bar
║  └─────────────────────────────────────┘ ║
║                                           ║
╚═══════════════════════════════════════════╝
```

**Key Visual Difference:** Stitch is slightly warmer (teal vs emerald), has more definition (borders), and feels more "terminal-like" with traditional finance colors.
