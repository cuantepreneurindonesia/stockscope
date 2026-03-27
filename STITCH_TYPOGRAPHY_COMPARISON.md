# Typography Comparison - Current vs Stitch

## Current Implementation

### Font Stack
```typescript
// app/layout.tsx
import { Manrope, Inter, Space_Grotesk } from 'next/font/google'

const manrope = Manrope({ 
  subsets: ['latin'], 
  weight: ['700', '800'],
  variable: '--font-headline' 
})

const inter = Inter({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600'],
  variable: '--font-body' 
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'], 
  weight: ['400', '500', '700'],
  variable: '--font-label' 
})
```

### Usage Pattern
```typescript
// Headlines (Eyebrow labels, Section titles)
font-headline  →  Manrope Bold/ExtraBold
Example: "STOCK SCREENER", "SCREENING MATRIX"

// Body text (Descriptions, UI labels, Names)
font-body  →  Inter Regular/Medium/SemiBold
Example: Company names, filter labels, descriptions

// Numbers & Labels (Prices, Scores, Tickers)
font-label  →  Space Grotesk Regular/Medium/Bold
Example: "4,500", "85", "BBCA", "+2.5%"
```

### Visual Examples

**Headline (Manrope 800):**
```
SCREENING MATRIX
──────────────────────────────
• Geometric, modern
• Very bold, high contrast
• Good for impact headers
• Slightly quirky personality
```

**Body (Inter 400-600):**
```
Bank Central Asia Tbk - Indonesia's largest private bank
────────────────────────────────────────────────────────
• Neutral, professional
• Excellent readability
• Standard UI font choice
• Clean, minimal personality
```

**Numbers (Space Grotesk 400-700):**
```
4,500.00  |  85  |  +2.56%  |  BBCA
────────────────────────────────────
• Geometric, technical
• Great for tabular data
• Monospaced feel (but not truly monospaced)
• Modern, slightly quirky
```

---

## Stitch Specification

### Font Stack
```typescript
// Stitch requirement
Body/UI: DM Sans (400, 500, 600, 700)
Labels/Numbers: DM Mono (400, 500)
```

### Usage Pattern
```typescript
// All UI text, body copy, company names
font-body  →  DM Sans Regular/Medium/SemiBold/Bold
Example: Descriptions, buttons, labels, names

// Terminal labels, numbers, tickers, codes
font-label  →  DM Mono Regular/Medium
Example: "STOCK SCREENER", prices, tickers, eyebrow labels
```

### Visual Examples

**DM Sans (Body/UI):**
```
Bank Central Asia Tbk - Indonesia's largest private bank
────────────────────────────────────────────────────────
• Geometric sans-serif
• Similar to Inter but slightly warmer
• Excellent readability
• Professional but friendly
```

**DM Mono (Labels/Numbers):**
```
STOCK SCREENER  |  4,500.00  |  85  |  +2.56%  |  BBCA
─────────────────────────────────────────────────────────
• True monospaced font
• Perfect tabular alignment
• Classic terminal aesthetic
• Retro computing feel
```

---

## Side-by-Side Character Comparison

### Headlines/Eyebrows
```
Current (Manrope 800):     STOCK SCREENER
Stitch (DM Mono 500):      STOCK SCREENER
                           ^^^^^^^^^^^^^^
                           • Monospaced = wider, more terminal-like
                           • Less geometric, more traditional
                           • Classic "green screen" vibe
```

### Numbers
```
Current (Space Grotesk):   4,500.00    85    +2.56%
Stitch (DM Mono):          4,500.00    85    +2.56%
                           ^^^^^^^^    ^^    ^^^^^^
                           • True monospace = perfect alignment
                           • Each digit same width
                           • Better for tables
```

### Body Text
```
Current (Inter):           Bank Central Asia Tbk
Stitch (DM Sans):          Bank Central Asia Tbk
                           ^^^^^^^^^^^^^^^^^^^^^
                           • Very similar!
                           • DM Sans slightly warmer
                           • Both excellent for UI
```

---

## Detailed Font Analysis

### DM Sans (Stitch Body Font)

**Characteristics:**
- Geometric sans-serif with humanist warmth
- Designed for UI at small sizes (14px+)
- Excellent x-height (tall lowercase letters)
- Open apertures (easy to read)
- Similar to: Inter, Open Sans, Source Sans

**Best For:**
- UI labels and buttons
- Company names and descriptions
- Filter labels
- Body copy

**Preview:**
```
Regular (400):   The quick brown fox jumps over the lazy dog
Medium (500):    The quick brown fox jumps over the lazy dog
SemiBold (600):  The quick brown fox jumps over the lazy dog
Bold (700):      The quick brown fox jumps over the lazy dog
```

---

### DM Mono (Stitch Label/Number Font)

**Characteristics:**
- True monospaced font (all characters same width)
- Designed for code and data display
- Perfect tabular alignment
- Classic terminal aesthetic
- Similar to: IBM Plex Mono, Roboto Mono, Courier

**Best For:**
- Stock tickers (BBCA, TLKM, BBRI)
- Prices and numbers (4,500.00)
- Percentage changes (+2.56%)
- Scores (85, 72, 91)
- Eyebrow labels (STOCK SCREENER, AI SCORE)
- Timestamps and dates

**Preview:**
```
Regular (400):   0123456789  |  BBCA  |  +2.56%
Medium (500):    0123456789  |  BBCA  |  +2.56%
                 ^^^^^^^^^^     ^^^^     ^^^^^^
                 All perfectly aligned in columns!
```

---

## "Terminal" Aesthetic Comparison

### Current Fonts (Modern Tech)
```
┌─────────────────────────────────────────┐
│  SCREENING MATRIX                       │  ← Manrope (modern, bold)
│  Find high-potential stocks             │  ← Inter (neutral, clean)
│                                         │
│  BBCA    4,500    +2.5%    85          │  ← Space Grotesk (geometric)
└─────────────────────────────────────────┘

Vibe: Modern fintech app (Robinhood, Revolut, N26)
```

### Stitch Fonts (Terminal Computing)
```
┌─────────────────────────────────────────┐
│  SCREENING MATRIX                       │  ← DM Mono (monospace, terminal)
│  Find high-potential stocks             │  ← DM Sans (clean, readable)
│                                         │
│  BBCA    4,500    +2.5%    85          │  ← DM Mono (perfect alignment)
└─────────────────────────────────────────┘

Vibe: Professional terminal (Bloomberg, Reuters, E*TRADE)
```

**Key Difference:** DM Mono adds the classic "computing terminal" feel with its monospaced characters, making it look more like a professional trading terminal than a consumer app.

---

## Implementation Impact

### Files to Change
```typescript
// 1. app/layout.tsx
- Remove: Manrope, Space_Grotesk imports
+ Add: DM_Sans, DM_Mono imports

// 2. tailwind.config.ts
fontFamily: {
-  headline: ['var(--font-headline)', 'sans-serif'],
-  body: ['var(--font-body)', 'sans-serif'],
-  label: ['var(--font-label)', 'sans-serif'],
+  body: ['var(--font-dm-sans)', 'sans-serif'],
+  label: ['var(--font-dm-mono)', 'monospace'],
+  headline: ['var(--font-dm-sans)', 'sans-serif'],  // or keep DM Mono for eyebrows
}

// 3. Update ALL components
// Find: font-headline, font-body, font-label
// Review usage and ensure correct font for purpose
```

### Component Examples

**Before (Current):**
```tsx
<h1 className="font-headline text-5xl font-extrabold">
  SCREENING MATRIX
</h1>
<p className="font-body text-sm">
  Bank Central Asia Tbk
</p>
<span className="font-label text-lg tabular-nums">
  4,500.00
</span>
```

**After (Stitch):**
```tsx
<h1 className="font-label text-5xl font-medium uppercase tracking-widest">
  SCREENING MATRIX
</h1>
<p className="font-body text-sm">
  Bank Central Asia Tbk
</p>
<span className="font-label text-lg tabular-nums">
  4,500.00
</span>
```

**Key Changes:**
- Headlines use `font-label` (DM Mono) for terminal aesthetic
- Add `uppercase tracking-widest` to eyebrow labels
- Keep `font-body` (DM Sans) for readable text
- Keep `font-label` (DM Mono) for numbers (already correct)

---

## Performance Comparison

### Font File Sizes (Approximate)

**Current:**
```
Manrope 700,800:        ~40 KB (2 weights)
Inter 400,500,600:      ~60 KB (3 weights)
Space Grotesk 400,500,700: ~75 KB (3 weights)
─────────────────────────────────────────
Total:                  ~175 KB
```

**Stitch:**
```
DM Sans 400,500,600,700:   ~80 KB (4 weights)
DM Mono 400,500:           ~40 KB (2 weights)
─────────────────────────────────────────
Total:                     ~120 KB
```

**Result:** Stitch fonts are ~55 KB lighter! ✅

---

## Accessibility

### Readability at Small Sizes (12-14px)

| Font | Score | Notes |
|------|-------|-------|
| **Inter** (Current) | 9/10 | Excellent, designed for UI |
| **DM Sans** (Stitch) | 8.5/10 | Very good, slightly less neutral |
| **Space Grotesk** (Current) | 7/10 | Good but quirky at small sizes |
| **DM Mono** (Stitch) | 8/10 | Good for data, harder for prose |

### Tabular Data Alignment

| Font | Alignment | Score |
|------|-----------|-------|
| **Space Grotesk** | Proportional | 7/10 - Nearly aligned but not perfect |
| **DM Mono** | Monospaced | 10/10 - Perfect alignment guaranteed |

**Winner for data tables:** DM Mono ✅

---

## Recommendation

### Visual Impact
**Stitch fonts (DM Sans + DM Mono) give a more "terminal computing" feel** which aligns better with the "beginner-friendly Bloomberg Terminal" positioning.

### Technical Benefits
- ✅ Lighter file size (~55 KB saved)
- ✅ Perfect tabular alignment (DM Mono)
- ✅ Classic terminal aesthetic
- ✅ Professional credibility

### User Experience
- ✅ Familiar to finance professionals (monospace = data)
- ✅ Clear visual hierarchy (mono vs sans)
- ✅ Excellent readability for both UI and data

### Implementation
- ⚠️ **Effort:** 3-4 hours (font swap + component review)
- ⚠️ **Risk:** Low (fonts similar, no layout breaks expected)
- ⚠️ **Testing:** Need to verify all text renders correctly

---

## My Opinion

**Switch to DM Sans + DM Mono.** It's a better match for the "terminal" aesthetic and gives perfect data alignment. The monospaced labels add professional credibility that Space Grotesk doesn't quite achieve.

**Priority:** HIGH - This is what makes it look like a "terminal" vs a consumer app.
