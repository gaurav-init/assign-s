/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Skeuomorphic-Clean stack: DM Mono for interface, Instrument Serif for editorial voice.
        mono: [
          'DM Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
        serif: [
          'Instrument Serif',
          'ui-serif',
          'Iowan Old Style',
          'Georgia',
          'serif',
        ],
        sans: [
          'DM Mono',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },
      // Palette anchored on the Neuform "System Interface — Skeuomorphic Clean" tokens.
      // Amber #FFB900, tangerine #F78200, oxblood surface #521111, ink #000000.
      colors: {
        ink: {
          0: '#ffffff',
          50: '#f5f1e6',   // paper / warm cream (light-mode canvas)
          100: '#e6ded0',
          200: '#c7bfae',
          300: '#8b857a',
          400: '#5a5347',
          500: '#3a3730',
          600: '#26241f',
          700: '#181614',
          800: '#0d0c0a',
          900: '#050403',
          950: '#000000',
        },
        // "Oxblood" family for the primary surface + hairlines.
        blood: {
          50: '#f7e8e8',
          100: '#e6bcbc',
          200: '#c17777',
          300: '#8f3939',
          400: '#6b1e1e',
          500: '#521111',   // spec surface
          600: '#3d0b0b',
          700: '#2a0808',
          800: '#1a0505',
          900: '#0a0202',
        },
        amber: {
          400: '#ffd04a',
          500: '#FFB900',   // spec primary
          600: '#d99a00',
          700: '#a67700',
        },
        tangerine: {
          400: '#ff9f38',
          500: '#F78200',   // spec accent
          600: '#c66500',
          700: '#8f4900',
        },
        signal: {
          ok:   '#5EBD3E',
          warn: '#FFB900',
          alert:'#F78200',
          bad:  '#E23838',
          info: '#009CDF',
          note: '#973999',
        },
      },
      borderRadius: {
        // Skeuomorphic-Clean: hard corners. Card 2px, control 4px, pill kept for capsules.
        card: '2px',
        control: '4px',
        pill: '9999px',
      },
      boxShadow: {
        // Physical, single-direction. No colored glow halos.
        inset: 'inset 0 1px 0 0 rgba(255,255,255,0.04), inset 0 -1px 0 0 rgba(0,0,0,0.35)',
        bevel: '0 1px 0 0 rgba(255,255,255,0.06), 0 1px 2px 0 rgba(0,0,0,0.55)',
        panel: '0 1px 0 0 rgba(255,255,255,0.03), 0 8px 24px -12px rgba(0,0,0,0.75)',
      },
      keyframes: {
        scanline: {
          '0%':   { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blip: {
          '0%,100%': { opacity: '0.35' },
          '50%':     { opacity: '1' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%':   { boxShadow: '0 0 0 0 rgba(255,185,0,0.55)' },
          '100%': { boxShadow: '0 0 0 8px rgba(255,185,0,0)' },
        },
      },
      animation: {
        scanline: 'scanline 6s linear infinite',
        blip:     'blip 1.4s ease-in-out infinite',
        marquee:  'marquee 40s linear infinite',
        pulseRing:'pulseRing 1.6s ease-out infinite',
      },
    },
  },
  plugins: [],
};
