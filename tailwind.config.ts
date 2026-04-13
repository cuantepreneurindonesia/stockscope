import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          base:     '#060d18',
          card:     '#09131f',
          elevated: '#132030',
          input:    '#09131f',
        },
        border: {
          DEFAULT: '#1e3a52',
          subtle:  '#132030',
          strong:  '#3F4354',
        },
        brand: {
          DEFAULT: '#2a9d8f',
          dim:     '#2a9d8f20',
          hover:   '#228579',
          muted:   '#2a9d8f60',
        },
        bull: {
          DEFAULT: '#2a9d8f',
          bg:      '#2a9d8f15',
          text:    '#2a9d8f',
        },
        bear: {
          DEFAULT: '#e76f51',
          bg:      '#e76f5115',
          text:    '#e76f51',
        },
        warning: {
          DEFAULT: '#e9c46a',
          bg:      '#e9c46a15',
          text:    '#e9c46a',
        },
        neutral: {
          DEFAULT: '#8A8FA8',
          bg:      '#8A8FA815',
        },
        text: {
          primary:   '#e8f4f8',
          secondary: '#a8c8e8',
          muted:     '#6b8aad',
          disabled:  '#475569',
        },
        tier: {
          s: '#2a9d8f',
          a: '#3B82F6',
          b: '#e9c46a',
          c: '#8B5CF6',
          d: '#e76f51',
        },
        sector: {
          finance:    '#3B82F6',
          energy:     '#e9c46a',
          tech:       '#8B5CF6',
          consumer:   '#EC4899',
          industrial: '#06B6D4',
          property:   '#10B981',
          healthcare: '#e76f51',
          mining:     '#F97316',
        },
      },
      fontFamily: {
        sans:    ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-dm-mono)', 'monospace'],
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
