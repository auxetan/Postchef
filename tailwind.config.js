/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // PostChef palette — bold editorial
        'pc-green':       '#1D9E75',
        'pc-green-dark':  '#0F6E56',
        'pc-green-mid':   '#5DCAA5',
        'pc-green-light': '#EBF9F2',

        // Ink scale
        'pc-ink':    '#0A0A0A',
        'pc-ink-2':  '#404040',
        'pc-ink-3':  '#737373',
        'pc-ink-4':  '#A3A3A3',

        // Surface scale — warm neutrals (not blue-grey)
        'pc-bg':      '#F7F7F5',
        'pc-surface': '#FFFFFF',
        'pc-border':  '#E8E8E6',
        'pc-rule':    '#EFEFED',
        'pc-divider': '#F2F2F0',

        // Legacy aliases (backward compat with onboarding, paywall)
        'pc-text':  '#0A0A0A',
        'pc-body':  '#0A0A0A',
        'pc-muted': '#737373',
        'pc-hint':  '#A3A3A3',
        'pc-white': '#FFFFFF',
      },
      borderRadius: {
        'pill': '100px',
        'card': '16px',
        'elem': '12px',
        'btn':  '10px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      fontSize: {
        'display': ['48px', { lineHeight: '1', letterSpacing: '-0.05em', fontWeight: '900' }],
        'h1':      ['28px', { lineHeight: '1.1', letterSpacing: '-0.04em', fontWeight: '800' }],
        'h2':      ['20px', { lineHeight: '1.2', letterSpacing: '-0.03em', fontWeight: '700' }],
        'label':   ['10px', { lineHeight: '1', letterSpacing: '0.10em', fontWeight: '700' }],
      },
      letterSpacing: {
        'hero':    '-0.05em',
        'title':   '-0.04em',
        'section': '-0.02em',
        'caps':    '0.10em',
        'tight':   '-0.02em',
      },
      boxShadow: {
        'none': 'none',
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slideUp 0.2s ease-out',
        'fade-in':  'fadeIn 0.15s ease-out',
      },
    },
  },
  plugins: [],
}
