/** Couleurs = variables CSS (src/styles/index.css) pour gérer le mode clair/sombre. */
const v = (name) => `rgb(var(--${name}) / <alpha-value>)`

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        line: v('line'),
        fg: v('fg'),
        muted: v('muted'),
        accent: v('accent'),
      },
      fontFamily: {
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        sans: ['"Geist Variable"', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { label: '0.14em' },
      transitionTimingFunction: { cine: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      maxWidth: { site: '90rem' },
    },
  },
  plugins: [],
}
