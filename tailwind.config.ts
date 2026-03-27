import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base:     '#0B0C10',
          card:     '#111218',
          elevated: '#1A1C23',
          input:    '#15161D',
        },
        border: {
          DEFAULT: '#272A35',
          subtle:  '#1E2028',
          strong:  '#3F4354',
        },
        brand: {
          DEFAULT: '#3B82F6',
          dim:     '#3B82F620',
          hover:   '#2563EB',
          muted:   '#3B82F660',
        },
        bull: {
          DEFAULT: '#00C805',
          bg:      '#00C80515',
          text:    '#00C805',
        },
        bear: {
          DEFAULT: '#FF3B30',
          bg:      '#FF3B3015',
          text:    '#FF3B30',
        },
        neutral: {
          DEFAULT: '#8A8FA8',
          bg:      '#8A8FA815',
        },
        text: {
          primary:   '#F8FAFC',
          secondary: '#94A3B8',
          muted:     '#64748B',
          disabled:  '#475569',
        },
        tier: {
          s: '#00C805',
          a: '#3B82F6',
          b: '#F59E0B',
          c: '#8B5CF6',
          d: '#FF3B30',
        },
        sector: {
          finance:    '#3B82F6',
          energy:     '#F59E0B',
          tech:       '#8B5CF6',
          consumer:   '#EC4899',
          industrial: '#06B6D4',
          property:   '#10B981',
          healthcare: '#EF4444',
          mining:     '#F97316',
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        xs:    ['11px', { lineHeight: '16px' }],
        sm:    ['13px', { lineHeight: '20px' }],
        base:  ['14px', { lineHeight: '20px' }],
        md:    ['16px', { lineHeight: '24px' }],
        lg:    ['20px', { lineHeight: '28px' }],
        xl:    ['24px', { lineHeight: '32px' }],
        '2xl': ['32px', { lineHeight: '40px' }],
        '3xl': ['40px', { lineHeight: '48px' }],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease both',
        'slide-up':   'slideUp 0.25s ease both',
        'slide-down': 'slideDown 0.25s ease both',
        'shimmer':    'shimmer 1.5s ease infinite',
        'pulse-dot':  'pulseDot 2s ease infinite',
        'flash-bull': 'flashBull 0.8s ease both',
        'flash-bear': 'flashBear 0.8s ease both',
        'scale-in':   'scaleIn 0.2s ease both',
      },
      keyframes: {
        fadeIn:    { from:{opacity:'0'}, to:{opacity:'1'} },
        slideUp:   { from:{opacity:'0', transform:'translateY(8px)'}, to:{opacity:'1', transform:'translateY(0)'} },
        slideDown: { from:{opacity:'0', transform:'translateY(-8px)'}, to:{opacity:'1', transform:'translateY(0)'} },
        scaleIn:   { from:{opacity:'0', transform:'scale(0.97)'}, to:{opacity:'1', transform:'scale(1)'} },
        shimmer:   {
          '0%':  {backgroundPosition:'-200% 0'},
          '100%':{backgroundPosition:'200% 0'},
        },
        pulseDot:  {
          '0%,100%':{opacity:'1'},
          '50%':{opacity:'0.3'},
        },
        flashBull: {
          '0%':  {backgroundColor:'#00C80520'},
          '100%':{backgroundColor:'transparent'},
        },
        flashBear: {
          '0%':  {backgroundColor:'#FF3B3020'},
          '100%':{backgroundColor:'transparent'},
        },
      },
    },
  },
  plugins: [],
};

export default config;
