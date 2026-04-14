/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // PostChef palette — bold editorial v2
        'pc-green':       '#1D9E75',
        'pc-green-dark':  '#0F6E56',
        'pc-green-mid':   '#5DCAA5',
        'pc-green-light': '#EBF9F2',

        // Ink scale
        'pc-ink':    '#0A0A0A',
        'pc-ink-2':  '#404040',
        'pc-ink-3':  '#737373',
        'pc-ink-4':  '#A3A3A3',

        // Surface scale — warm neutrals
        'pc-bg':      '#F7F7F5',
        'pc-surface': '#FFFFFF',
        'pc-border':  '#E8E8E6',
        'pc-rule':    '#EFEFED',
        'pc-divider': '#F2F2F0',

        // Glass — liquid glass system
        'glass-bg':     'rgba(255,255,255,0.72)',
        'glass-border': 'rgba(255,255,255,0.50)',
        'glass-dark':   'rgba(10,10,10,0.08)',

        // Premium (violet)
        'pc-premium':        '#7C3AED',
        'pc-premium-dark':   '#6D28D9',
        'pc-premium-light':  '#F5F3FF',

        // Danger (rouge)
        'pc-danger':         '#EF4444',
        'pc-danger-dark':    '#DC2626',
        'pc-danger-light':   '#FECACA',
        'pc-danger-bg':      '#FEF2F2',

        // Amber / avertissement
        'pc-amber':          '#F59E0B',
        'pc-amber-dark':     '#D97706',
        'pc-amber-text':     '#92400E',
        'pc-amber-light':    '#FEF3C7',
        'pc-amber-border':   '#FDE68A',

        // Blue / info (Facebook, statuts)
        'pc-blue':           '#2563EB',
        'pc-blue-dark':      '#1D4ED8',
        'pc-blue-light':     '#EFF6FF',
        'pc-blue-border':    '#BFDBFE',

        // Green statut (success / publié)
        'pc-success':        '#16A34A',

        // Legacy aliases
        'pc-text':  '#0A0A0A',
        'pc-body':  '#0A0A0A',
        'pc-muted': '#737373',
        'pc-hint':  '#A3A3A3',
        'pc-white': '#FFFFFF',
      },
      borderRadius: {
        'pill':  '100px',
        'card':  '20px',
        'card-lg': '28px',
        'elem':  '14px',
        'btn':   '12px',
        'glass': '24px',
        'nav':   '26px',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'display': ['52px', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '800' }],
        'display-sm': ['38px', { lineHeight: '1', letterSpacing: '-0.035em', fontWeight: '800' }],
        'h1':      ['28px', { lineHeight: '1.1', letterSpacing: '-0.03em', fontWeight: '800' }],
        'h2':      ['20px', { lineHeight: '1.2', letterSpacing: '-0.025em', fontWeight: '700' }],
        'label':   ['10px', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '700' }],
      },
      letterSpacing: {
        'hero':    '-0.04em',
        'title':   '-0.03em',
        'section': '-0.02em',
        'caps':    '0.08em',
        'tight':   '-0.02em',
      },
      boxShadow: {
        'none':    'none',
        'glass':   '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.80)',
        'glass-lg':'0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.80)',
        'card':    '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 24px rgba(0,0,0,0.10)',
        'green':   '0 4px 16px rgba(29,158,117,0.30)',
      },
      backdropBlur: {
        'glass': '24px',
        'nav':   '32px',
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in':  'fadeIn 0.20s ease-out',
        'float':    'float 4s ease-in-out infinite',
        'shimmer':  'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
}
