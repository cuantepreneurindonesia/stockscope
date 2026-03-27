/**
 * Stockscope Terminal Design System
 * Color tokens based on "The High-Precision Terminal" aesthetic
 *
 * Philosophy: "The Abyss" - Deep slates and blacks for eye strain reduction
 * Primary: Emerald (#4edea3) for positive indicators and primary actions
 *
 * @see design-screener-layout.html for complete specification
 */

export const terminalColors = {
  // Background Layers (The Abyss)
  surface: {
    base: "#09131f", // Base surface (deepest background)
    containerLowest: "#060d18", // Absolute deepest (header, footer)
    containerLow: "#09131f", // Filter panel, sidebar
    container: "#132030", // Cards, table rows
    containerHigh: "#1e3a52", // Hover states
    containerHighest: "#233f57", // Inputs, active elements
    bright: "#305373", // Modals with backdrop blur
    dim: "#09131f", // Same as base
    variant: "#1e3a52", // Surface variant
  },

  // Primary Colors (Emerald)
  primary: {
    base: "#2a9d8f", // Main teal
    container: "#187b6e", // Darker teal (buttons)
    fixed: "#5cc7b9", // Lighter teal (hover)
    fixedDim: "#2a9d8f", // Same as base
    onPrimary: "#002824", // Text on primary bg
    onPrimaryContainer: "#00423a", // Text on primary container
    onPrimaryFixed: "#001a17", // Text on primary fixed
    onPrimaryFixedVariant: "#004c44", // Text variant
  },

  // Secondary Colors (Cool Blue)
  secondary: {
    base: "#b7c8e1", // Informational blue
    container: "#3a4a5f", // Blue container
    fixed: "#d3e4fe", // Light blue fixed
    fixedDim: "#b7c8e1", // Same as base
    onSecondary: "#213145", // Text on secondary
    onSecondaryContainer: "#a9bad3", // Text on container
    onSecondaryFixed: "#0b1c30", // Text on fixed
    onSecondaryFixedVariant: "#38485d", // Text variant
  },

  // Tertiary Colors (Amber)
  tertiary: {
    base: "#e9c46a", // Warning amber
    container: "#c79d38", // Amber container
    fixed: "#fae3a5", // Light amber
    fixedDim: "#e9c46a", // Same as base
    onTertiary: "#4a3b0f", // Text on tertiary
    onTertiaryContainer: "#6b5820", // Text on container
    onTertiaryFixed: "#2e2304", // Text on fixed
    onTertiaryFixedVariant: "#857030", // Text variant
  },

  // Error Colors (Rose)
  error: {
    base: "#e76f51", // Soft red
    container: "#ba4326", // Dark red container
    onError: "#601908", // Text on error
    onErrorContainer: "#fed2c7", // Text on error container
  },

  // Text Colors
  text: {
    onSurface: "#e8f4f8", // Primary text
    onSurfaceVariant: "#a8c8e8", // Secondary text, labels
    onBackground: "#e8f4f8", // Same as onSurface
  },

  // Outline Colors (Ghost Borders)
  outline: {
    base: "#1e3a52", // Standard outline
    variant: "#132030", // At 10% opacity for ghost borders
  },

  // Inverse Colors
  inverse: {
    surface: "#e8f4f8", // Light mode surface
    onSurface: "#09131f", // Text on inverse surface
    primary: "#187b6e", // Inverse primary
  },

  // Special Colors
  surfaceTint: "#2a9d8f", // Tint overlay
  background: "#060d18", // Page background
} as const;

/**
 * CSS Custom Properties for Terminal Design System
 * Use these in Tailwind config or CSS-in-JS
 */
export const terminalCSSVars = {
  "--color-surface": terminalColors.surface.base,
  "--color-surface-lowest": terminalColors.surface.containerLowest,
  "--color-surface-low": terminalColors.surface.containerLow,
  "--color-surface-container": terminalColors.surface.container,
  "--color-surface-high": terminalColors.surface.containerHigh,
  "--color-surface-highest": terminalColors.surface.containerHighest,
  "--color-surface-bright": terminalColors.surface.bright,

  "--color-primary": terminalColors.primary.base,
  "--color-primary-container": terminalColors.primary.container,
  "--color-primary-hover": terminalColors.primary.fixed,

  "--color-error": terminalColors.error.base,
  "--color-warning": terminalColors.tertiary.base,
  "--color-info": terminalColors.secondary.base,

  "--color-text": terminalColors.text.onSurface,
  "--color-text-secondary": terminalColors.text.onSurfaceVariant,

  "--color-outline": terminalColors.outline.variant,
} as const;

/**
 * Tailwind-compatible color object
 * Add this to tailwind.config.ts under theme.extend.colors
 */
export const terminalTailwindColors = {
  // Surface layers
  "surface-container-lowest": terminalColors.surface.containerLowest,
  "surface-container-low": terminalColors.surface.containerLow,
  "surface-container": terminalColors.surface.container,
  "surface-container-high": terminalColors.surface.containerHigh,
  "surface-container-highest": terminalColors.surface.containerHighest,
  "surface-bright": terminalColors.surface.bright,
  "surface-variant": terminalColors.surface.variant,
  surface: terminalColors.surface.base,
  background: terminalColors.background,

  // Primary
  primary: terminalColors.primary.base,
  "primary-container": terminalColors.primary.container,
  "primary-fixed": terminalColors.primary.fixed,
  "primary-fixed-dim": terminalColors.primary.fixedDim,
  "on-primary": terminalColors.primary.onPrimary,
  "on-primary-container": terminalColors.primary.onPrimaryContainer,
  "on-primary-fixed": terminalColors.primary.onPrimaryFixed,
  "on-primary-fixed-variant": terminalColors.primary.onPrimaryFixedVariant,

  // Secondary
  secondary: terminalColors.secondary.base,
  "secondary-container": terminalColors.secondary.container,
  "secondary-fixed": terminalColors.secondary.fixed,
  "secondary-fixed-dim": terminalColors.secondary.fixedDim,
  "on-secondary": terminalColors.secondary.onSecondary,
  "on-secondary-container": terminalColors.secondary.onSecondaryContainer,
  "on-secondary-fixed": terminalColors.secondary.onSecondaryFixed,
  "on-secondary-fixed-variant":
    terminalColors.secondary.onSecondaryFixedVariant,

  // Tertiary
  tertiary: terminalColors.tertiary.base,
  "tertiary-container": terminalColors.tertiary.container,
  "tertiary-fixed": terminalColors.tertiary.fixed,
  "tertiary-fixed-dim": terminalColors.tertiary.fixedDim,
  "on-tertiary": terminalColors.tertiary.onTertiary,
  "on-tertiary-container": terminalColors.tertiary.onTertiaryContainer,
  "on-tertiary-fixed": terminalColors.tertiary.onTertiaryFixed,
  "on-tertiary-fixed-variant": terminalColors.tertiary.onTertiaryFixedVariant,

  // Error
  error: terminalColors.error.base,
  "error-container": terminalColors.error.container,
  "on-error": terminalColors.error.onError,
  "on-error-container": terminalColors.error.onErrorContainer,

  // Text
  "on-surface": terminalColors.text.onSurface,
  "on-surface-variant": terminalColors.text.onSurfaceVariant,
  "on-background": terminalColors.text.onBackground,

  // Outline
  outline: terminalColors.outline.base,
  "outline-variant": terminalColors.outline.variant,

  // Inverse
  "inverse-surface": terminalColors.inverse.surface,
  "inverse-on-surface": terminalColors.inverse.onSurface,
  "inverse-primary": terminalColors.inverse.primary,

  // Special
  "surface-tint": terminalColors.surfaceTint,
} as const;

/**
 * Typography scale based on Terminal design system
 */
export const terminalTypography = {
  // Headlines (Manrope)
  headline: {
    large: {
      fontSize: "3.5rem", // 56px
      fontWeight: 800,
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    medium: {
      fontSize: "2.5rem", // 40px
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    small: {
      fontSize: "1.75rem", // 28px
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: "0",
    },
  },

  // Body text (Inter)
  body: {
    large: {
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    medium: {
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.43,
    },
    small: {
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.33,
    },
  },

  // Labels (Space Grotesk - for data/numbers)
  label: {
    large: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      lineHeight: 1.43,
      fontFeatureSettings: "'tnum'", // Tabular numbers
    },
    medium: {
      fontSize: "0.75rem", // 12px
      fontWeight: 500,
      lineHeight: 1.33,
      fontFeatureSettings: "'tnum'",
    },
    small: {
      fontSize: "0.625rem", // 10px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      fontFeatureSettings: "'tnum'",
    },
  },
} as const;

/**
 * Border radius tokens
 */
export const terminalBorderRadius = {
  DEFAULT: "0.125rem", // 2px - minimal
  lg: "0.25rem", // 4px - small elements
  xl: "0.5rem", // 8px - cards, modals
  full: "0.75rem", // 12px - pills, badges
} as const;

/**
 * Shadow tokens (sparingly used in Terminal design)
 */
export const terminalShadows = {
  terminal: "0 20px 40px rgba(0, 0, 0, 0.4)",
  glow: "0 0 20px rgba(78, 222, 163, 0.3)",
  none: "none",
} as const;

/**
 * Transition timing
 */
export const terminalTransitions = {
  fast: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
  base: "200ms ease-in-out",
  slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

/**
 * Helper: Get color with opacity
 */
export function withOpacity(color: string, opacity: number): string {
  // Convert hex to rgba
  const hex = color.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Helper: Ghost border (outline-variant at 10% opacity)
 */
export const ghostBorder = `1px solid ${withOpacity(terminalColors.outline.variant, 0.1)}`;

/**
 * Helper: Glassmorphism effect
 */
export const glassmorphismEffect = {
  background: withOpacity(terminalColors.primary.base, 0.1),
  backdropFilter: "blur(12px)",
  border: `1px solid ${withOpacity(terminalColors.primary.base, 0.2)}`,
} as const;
