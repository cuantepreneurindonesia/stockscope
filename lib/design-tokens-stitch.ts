/**
 * Stockscope "Digital Architect's Ledger" Design System
 * Based on Google Stitch Material Design 3 specifications
 * 
 * Philosophy: "The Digital Architect's Ledger"
 * Treating financial data not as noise, but as a blueprint.
 * Custom-machined instrument aesthetic with intentional asymmetry and tonal depth.
 * 
 * Core Rules:
 * 1. No-Line Rule: Use background color shifts, not 1px borders
 * 2. Tabular Numbers: All financial data uses DM Mono with font-feature-settings: 'tnum'
 * 3. Architect's Marks: 4px square blocks for status indicators
 * 4. Glassmorphism: 80% opacity + 20px blur for floating elements
 * 5. Asymmetric Layouts: Golden Ratio (60/40) splits, not generic 12-column grids
 * 
 * @see B:\Download\Codes\stitch_risk_map_hhi_analysisn_new\stitch_risk_map_hhi_analysis\
 */

export const stitchColors = {
  // Surface Layers (from deepest to highest)
  surface: {
    containerLowest: '#070e19',           // Foundation "desk" layer
    dim: '#0c141f',                       // Alternative surface
    base: '#0c141f',                      // Primary workspace
    background: '#0c141f',                // Same as surface
    containerLow: '#151c27',              // Slightly raised
    container: '#19202c',                 // Standard container (glassmorphism base)
    containerHigh: '#232a36',             // Elevated panels
    containerHighest: '#2e3541',          // Floating modals
    bright: '#323946',                    // Brightest surface
    variant: '#2e3541',                   // Alternative surface
  },

  // Primary Colors (Teal)
  primary: {
    base: '#6fd8c8',                      // Main teal - active states, CTAs, positive data
    container: '#30a193',                 // Gradient endpoints, hover states
    fixed: '#8cf5e4',                     // Light teal fixed
    fixedDim: '#6fd8c8',                  // Same as base
    onPrimary: '#003731',                 // Text on primary bg
    onPrimaryContainer: '#00302a',        // Text on primary container
    onPrimaryFixed: '#00201c',            // Text on primary fixed
    onPrimaryFixedVariant: '#005048',     // Text variant
    inverse: '#006a60',                   // Inverse primary
    surfaceTint: '#6fd8c8',               // Surface tint color
  },

  // Secondary Colors (Blue)
  secondary: {
    base: '#98cdf2',                      // Supportive data visualizations
    container: '#0b4e6e',                 // Blue container
    fixed: '#c7e7ff',                     // Light blue fixed
    fixedDim: '#98cdf2',                  // Same as base
    onSecondary: '#00344c',               // Text on secondary
    onSecondaryContainer: '#8abfe4',      // Text on container
    onSecondaryFixed: '#001e2e',          // Text on fixed
    onSecondaryFixedVariant: '#064c6b',   // Text variant
  },

  // Tertiary Colors (Amber)
  tertiary: {
    base: '#e7c268',                      // Warning/medium risk
    container: '#ad8d39',                 // Amber container
    fixed: '#ffdf96',                     // Light amber
    fixedDim: '#e7c268',                  // Same as base
    onTertiary: '#3e2e00',                // Text on tertiary
    onTertiaryContainer: '#362800',       // Text on container
    onTertiaryFixed: '#251a00',           // Text on fixed
    onTertiaryFixedVariant: '#5a4400',    // Text variant
  },

  // Error Colors (Red)
  error: {
    base: '#ffb4ab',                      // Soft red for high risk
    container: '#93000a',                 // Dark red container
    onError: '#690005',                   // Text on error
    onErrorContainer: '#ffdad6',          // Text on error container
  },

  // Risk Indicators (Mobile Dashboard specific)
  risk: {
    emerald: '#10b981',                   // Low risk / strong positive
    amber: '#f59e0b',                     // Medium risk
    rose: '#f43f5e',                      // High risk / danger
  },

  // Text Colors
  text: {
    onSurface: '#dce3f3',                 // Primary text (never use pure white!)
    onSurfaceVariant: '#bcc9c6',          // Secondary text, labels
    onBackground: '#dce3f3',              // Same as onSurface
  },

  // Outline Colors (Ghost Borders)
  outline: {
    base: '#879390',                      // Standard outline
    variant: '#3d4947',                   // At 20% opacity for ghost borders
  },

  // Inverse Colors (for light mode compatibility)
  inverse: {
    surface: '#dce3f3',                   // Light mode surface
    onSurface: '#29313d',                 // Text on inverse surface
    primary: '#059669',                   // Inverse primary
  },
} as const;

/**
 * Typography Scale
 * Font families: DM Sans (body), DM Mono (data), Space Grotesk (display)
 */
export const stitchTypography = {
  fontFamily: {
    headline: ['Space Grotesk', 'sans-serif'],  // Headlines, display text
    body: ['DM Sans', 'sans-serif'],             // UI text, descriptions
    label: ['Space Grotesk', 'sans-serif'],      // Uppercase labels
    mono: ['DM Mono', 'monospace'],              // ALL numbers, tickers, data
  },
  
  fontSize: {
    displayLg: '3.5rem',      // 56px - Portfolio totals, major indices
    displayMd: '3rem',        // 48px - Page titles
    headlineLg: '2rem',       // 32px - Section titles
    headlineMd: '1.5rem',     // 24px - Subsection headers
    headlineSm: '1.25rem',    // 20px - Card titles
    bodyLg: '1rem',           // 16px - Primary body text
    bodyMd: '0.875rem',       // 14px - Secondary body
    bodySm: '0.75rem',        // 12px - Tertiary/captions
    labelLg: '0.875rem',      // 14px - Large labels (uppercase)
    labelMd: '0.75rem',       // 12px - Standard labels (uppercase)
    labelSm: '0.6875rem',     // 11px - Micro labels (uppercase, mono)
  },
  
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  
  letterSpacing: {
    tight: '-0.025em',
    tighter: '-0.05em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },
} as const;

/**
 * Border Radius Scale
 * Keep corners minimal (4-8px max) for professional architectural tone
 */
export const stitchBorderRadius = {
  none: '0',
  sm: '0.125rem',          // 2px - Minimal, data-heavy containers
  md: '0.25rem',           // 4px - Primary button corners, CTA radius
  lg: '0.5rem',            // 8px - Card containers, input fields
  xl: '0.75rem',           // 12px - Maximum allowed
  full: '9999px',          // Pill-shaped filters, badges
} as const;

/**
 * Spacing Scale (based on Tailwind's 0.25rem increments)
 */
export const stitchSpacing = {
  0: '0',
  0.5: '0.125rem',         // 2px
  1: '0.25rem',            // 4px
  1.5: '0.375rem',         // 6px
  2: '0.5rem',             // 8px
  2.5: '0.625rem',         // 10px
  3: '0.75rem',            // 12px
  4: '1rem',               // 16px
  5: '1.25rem',            // 20px
  6: '1.5rem',             // 24px
  8: '2rem',               // 32px
  10: '2.5rem',            // 40px
  12: '3rem',              // 48px
  16: '4rem',              // 64px
} as const;

/**
 * Shadow System
 * Use tonal layering instead of drop shadows, but these are for special cases
 */
export const stitchShadows = {
  // Ambient shadow for floating modals
  ambient: '0 20px 40px rgba(0, 0, 0, 0.4)',
  
  // Interactive glow (hover states)
  glowPrimary: '0 0 12px rgba(111, 216, 200, 0.3)',
  glowSecondary: '0 0 12px rgba(152, 205, 242, 0.3)',
  glowTertiary: '0 0 12px rgba(231, 194, 104, 0.3)',
  glowError: '0 0 12px rgba(255, 180, 171, 0.3)',
  
  // Micro bar glow
  microBarGlow: '0 0 8px currentColor',
} as const;

/**
 * Animation/Transition System
 */
export const stitchAnimations = {
  transition: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
  },
  
  easing: {
    inOut: 'ease-in-out',
    out: 'ease-out',
    in: 'ease-in',
  },
  
  keyframes: {
    marquee: {
      '0%': { transform: 'translateX(0)' },
      '100%': { transform: 'translateX(-50%)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
  
  durations: {
    marquee: '25s',          // Ticker tape scroll
    pulse: '2s',             // Live indicators
    shimmer: '1.5s',         // Skeleton loading
  },
} as const;

/**
 * Glassmorphism Effect
 * For floating elements like dropdowns, hover cards, bottom sheets
 */
export const glassmorphismEffect = {
  background: 'rgba(25, 32, 44, 0.8)',   // surface-container @ 80% opacity
  backdropFilter: 'blur(20px)',
  border: `1px solid ${stitchColors.outline.variant}20`, // Ghost border at 20%
  borderRadius: stitchBorderRadius.lg,
  boxShadow: stitchShadows.ambient,
} as const;

/**
 * Architect Gradient (for Primary CTAs)
 * Creates tactile, metallic sheen
 */
export const architectGradient = `linear-gradient(135deg, ${stitchColors.primary.base} 0%, ${stitchColors.primary.container} 100%)`;

/**
 * Ghost Border (for accessibility only)
 * Use sparingly - prefer background color shifts
 */
export const ghostBorder = (color: string = stitchColors.outline.variant) => ({
  border: `1px solid ${color}20`, // 20% opacity
});

/**
 * Tabular Numbers Utility
 * Apply to ALL financial data displays
 */
export const tabularNums = {
  fontFamily: stitchTypography.fontFamily.mono.join(', '),
  fontFeatureSettings: "'tnum'",
  fontVariantNumeric: 'tabular-nums',
} as const;

/**
 * Helper: Create opacity variant of color
 */
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Tailwind-compatible color object
 * Add this to tailwind.config.ts under theme.extend.colors
 */
export const stitchTailwindColors = {
  // Surface layers
  'surface-container-lowest': stitchColors.surface.containerLowest,
  'surface-dim': stitchColors.surface.dim,
  'surface': stitchColors.surface.base,
  'surface-container-low': stitchColors.surface.containerLow,
  'surface-container': stitchColors.surface.container,
  'surface-container-high': stitchColors.surface.containerHigh,
  'surface-container-highest': stitchColors.surface.containerHighest,
  'surface-bright': stitchColors.surface.bright,
  'surface-variant': stitchColors.surface.variant,
  'background': stitchColors.surface.background,

  // Primary
  'primary': stitchColors.primary.base,
  'primary-container': stitchColors.primary.container,
  'primary-fixed': stitchColors.primary.fixed,
  'primary-fixed-dim': stitchColors.primary.fixedDim,
  'on-primary': stitchColors.primary.onPrimary,
  'on-primary-container': stitchColors.primary.onPrimaryContainer,
  'on-primary-fixed': stitchColors.primary.onPrimaryFixed,
  'on-primary-fixed-variant': stitchColors.primary.onPrimaryFixedVariant,
  'inverse-primary': stitchColors.primary.inverse,
  'surface-tint': stitchColors.primary.surfaceTint,

  // Secondary
  'secondary': stitchColors.secondary.base,
  'secondary-container': stitchColors.secondary.container,
  'secondary-fixed': stitchColors.secondary.fixed,
  'secondary-fixed-dim': stitchColors.secondary.fixedDim,
  'on-secondary': stitchColors.secondary.onSecondary,
  'on-secondary-container': stitchColors.secondary.onSecondaryContainer,
  'on-secondary-fixed': stitchColors.secondary.onSecondaryFixed,
  'on-secondary-fixed-variant': stitchColors.secondary.onSecondaryFixedVariant,

  // Tertiary
  'tertiary': stitchColors.tertiary.base,
  'tertiary-container': stitchColors.tertiary.container,
  'tertiary-fixed': stitchColors.tertiary.fixed,
  'tertiary-fixed-dim': stitchColors.tertiary.fixedDim,
  'on-tertiary': stitchColors.tertiary.onTertiary,
  'on-tertiary-container': stitchColors.tertiary.onTertiaryContainer,
  'on-tertiary-fixed': stitchColors.tertiary.onTertiaryFixed,
  'on-tertiary-fixed-variant': stitchColors.tertiary.onTertiaryFixedVariant,

  // Error
  'error': stitchColors.error.base,
  'error-container': stitchColors.error.container,
  'on-error': stitchColors.error.onError,
  'on-error-container': stitchColors.error.onErrorContainer,

  // Risk indicators
  'emerald-risk': stitchColors.risk.emerald,
  'amber-risk': stitchColors.risk.amber,
  'rose-danger': stitchColors.risk.rose,

  // Text
  'on-surface': stitchColors.text.onSurface,
  'on-surface-variant': stitchColors.text.onSurfaceVariant,
  'on-background': stitchColors.text.onBackground,

  // Outline
  'outline': stitchColors.outline.base,
  'outline-variant': stitchColors.outline.variant,

  // Inverse
  'inverse-surface': stitchColors.inverse.surface,
  'inverse-on-surface': stitchColors.inverse.onSurface,
} as const;

/**
 * Export default for convenience
 */
export default {
  colors: stitchColors,
  typography: stitchTypography,
  borderRadius: stitchBorderRadius,
  spacing: stitchSpacing,
  shadows: stitchShadows,
  animations: stitchAnimations,
  glassmorphism: glassmorphismEffect,
  architectGradient,
  ghostBorder,
  tabularNums,
  withOpacity,
  tailwindColors: stitchTailwindColors,
};
