import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Stitch "Digital Architect's Ledger" Design System - Material Design 3
        // Surface layers
        'surface-container-lowest': '#070e19',
        'surface-dim': '#0c141f',
        'surface': '#0c141f',
        'surface-container-low': '#151c27',
        'surface-container': '#19202c',
        'surface-container-high': '#232a36',
        'surface-container-highest': '#2e3541',
        'surface-bright': '#323946',
        'surface-variant': '#2e3541',
        'background': '#0c141f',

        // Primary (Teal)
        'primary': '#6fd8c8',
        'primary-container': '#30a193',
        'primary-fixed': '#8cf5e4',
        'primary-fixed-dim': '#6fd8c8',
        'on-primary': '#003731',
        'on-primary-container': '#00302a',
        'on-primary-fixed': '#00201c',
        'on-primary-fixed-variant': '#005048',
        'inverse-primary': '#006a60',
        'surface-tint': '#6fd8c8',

        // Secondary (Blue)
        'secondary': '#98cdf2',
        'secondary-container': '#0b4e6e',
        'secondary-fixed': '#c7e7ff',
        'secondary-fixed-dim': '#98cdf2',
        'on-secondary': '#00344c',
        'on-secondary-container': '#8abfe4',
        'on-secondary-fixed': '#001e2e',
        'on-secondary-fixed-variant': '#064c6b',

        // Tertiary (Amber)
        'tertiary': '#e7c268',
        'tertiary-container': '#ad8d39',
        'tertiary-fixed': '#ffdf96',
        'tertiary-fixed-dim': '#e7c268',
        'on-tertiary': '#3e2e00',
        'on-tertiary-container': '#362800',
        'on-tertiary-fixed': '#251a00',
        'on-tertiary-fixed-variant': '#5a4400',

        // Error (Red)
        'error': '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        // Risk indicators
        'emerald-risk': '#10b981',
        'amber-risk': '#f59e0b',
        'rose-danger': '#f43f5e',

        // Text
        'on-surface': '#dce3f3',
        'on-surface-variant': '#bcc9c6',
        'on-background': '#dce3f3',

        // Outline
        'outline': '#879390',
        'outline-variant': '#3d4947',

        // Inverse
        'inverse-surface': '#dce3f3',
        'inverse-on-surface': '#29313d',
        
        // Legacy colors (keep for gradual migration)
        'bg-primary': '#06050f',
        'bg-alt': '#0d1e30',
        'bg-content': '#09131f',
        'bg-card-alt': '#060d18',
        'text-primary': '#e8f4f8',
        'text-secondary': '#a8c8e8',
        'text-tertiary': '#6b8aad',
        'border-primary': '#1e3a52',
        'border-alt': '#132030',
        'accent-blue': '#457b9d',
        'tier-red': '#e76f51',
        'tier-amber': '#e9c46a',
        'tier-green': '#2a9d8f',
        // Owner type colors
        'owner-individual': '#2a9d8f',
        'owner-corporate': '#e9c46a',
        'owner-bank': '#457b9d',
        'owner-foundation': '#d4a574',
        'owner-government': '#c55a7e',
        'owner-otherbanks': '#8491a3',
        'owner-other': '#666666',
      },
      fontFamily: {
        headline: ['var(--font-space-grotesk)', 'sans-serif'],  // Headlines, display
        body: ['var(--font-dm-sans)', 'sans-serif'],             // UI text, descriptions
        label: ['var(--font-space-grotesk)', 'sans-serif'],      // Uppercase labels
        mono: ['var(--font-dm-mono)', 'monospace'],              // ALL numbers, tickers, data
        // Legacy fallbacks
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '0.125rem',  // 2px - minimal
        sm: '0.125rem',       // 2px
        md: '0.25rem',        // 4px
        lg: '0.5rem',         // 8px
        xl: '0.75rem',        // 12px - maximum for professional tone
        full: '9999px',       // pill-shaped
      },
      spacing: {
        full: '100%',
      },
      fontSize: {
        // Responsive font sizes using clamp
        xs: 'clamp(0.75rem, 2vw, 0.875rem)',
        sm: 'clamp(0.875rem, 2.5vw, 1rem)',
        base: 'clamp(0.875rem, 3vw, 1rem)',
        lg: 'clamp(1rem, 4vw, 1.125rem)',
        xl: 'clamp(1.125rem, 5vw, 1.25rem)',
        '2xl': 'clamp(1.375rem, 6vw, 1.5rem)',
        '3xl': 'clamp(1.75rem, 7vw, 2rem)',
      },
      gridTemplateColumns: {
        'auto-fit': 'repeat(auto-fit, minmax(150px, 1fr))',
        'auto-fill': 'repeat(auto-fill, minmax(200px, 1fr))',
      },
      boxShadow: {
        'terminal': '0 20px 40px rgba(0, 0, 0, 0.4)',  // Ambient shadow for modals
        'glow': '0 0 12px rgba(111, 216, 200, 0.3)',   // Primary glow (teal)
        'glow-secondary': '0 0 12px rgba(152, 205, 242, 0.3)',
        'glow-tertiary': '0 0 12px rgba(231, 194, 104, 0.3)',
        'glow-error': '0 0 12px rgba(255, 180, 171, 0.3)',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',  // Ticker tape (25s for Stitch)
        'pulse-slow': 'pulse 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s ease-in-out infinite',
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
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
      },
      transitionTimingFunction: {
        'in-out': 'ease-in-out',
      },
    },
  },
  plugins: [],
};

export default config;
