import type { Config } from 'tailwindcss';

/**
 * The palette is not "inspired by" Kalamkari — it is sampled from what the dyes
 * actually do on myrobalan-treated cotton. Every named colour below corresponds
 * to a material in the studio:
 *
 *   chay      – alizarin from madder / chay root, struck over an alum mordant
 *   indigo    – vat indigo, the one colour applied by dipping rather than by pen
 *   myrobalan – karakkaya (chebulic myrobalan) over alum; the yellow, and also
 *               the buff ground the whole cloth starts from
 *   kasim     – fermented iron-and-jaggery liquor; the outline black, which is
 *               never a true black but a warm blue-grey-brown
 *   katha     – catechu bark brown
 *   cotton    – undyed and myrobalan-treated cloth
 *
 * Because these are earth pigments, none of them are saturated. Resisting the
 * urge to brighten them is the single most important design decision here.
 */
const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/app/**/*.{ts,tsx}',
    './src/content/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: '1.25rem', sm: '1.5rem', lg: '2rem', xl: '2.5rem' },
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        chay: {
          50: '#FBF1EE',
          100: '#F5DED8',
          200: '#E9BCB1',
          300: '#DA9384',
          400: '#C66857',
          500: '#A94434',
          600: '#8E2F22',
          700: '#74251B',
          800: '#5B1E17',
          900: '#451813',
          950: '#280C09',
        },
        indigo: {
          50: '#EEF2F7',
          100: '#D8E1EC',
          200: '#B0C3D8',
          300: '#8099BC',
          400: '#55719E',
          500: '#3A5680',
          600: '#2C4268',
          700: '#233553',
          800: '#1B2942',
          900: '#141F32',
          950: '#0B1320',
        },
        myrobalan: {
          50: '#FCF7EA',
          100: '#F7EBCA',
          200: '#EFD794',
          300: '#E3BE59',
          400: '#D4A337',
          500: '#B9862A',
          600: '#976823',
          700: '#775021',
          800: '#5E3F1E',
          900: '#4A3319',
          950: '#2A1C0C',
        },
        katha: {
          50: '#F8F3EE',
          100: '#EDE1D5',
          200: '#DAC3AC',
          300: '#C29E7F',
          400: '#A87A58',
          500: '#8C603F',
          600: '#6F4B31',
          700: '#583C28',
          800: '#463022',
          900: '#38271D',
          950: '#1F1510',
        },
        kasim: {
          50: '#F3F2F0',
          100: '#E2E0DC',
          200: '#C3BFB8',
          300: '#9E9990',
          400: '#7C766D',
          500: '#615C54',
          600: '#4C4842',
          700: '#3D3A35',
          800: '#2F2C29',
          900: '#22201D',
          950: '#141312',
        },
        cotton: {
          50: '#FDFBF6',
          100: '#FAF6EC',
          200: '#F4EDE0',
          300: '#EBE0CD',
          400: '#DDCDB2',
          500: '#CBB694',
          600: '#B29A74',
          700: '#8F7A5B',
          800: '#6E5D46',
          900: '#544736',
        },

        // shadcn/ui token surface, mapped onto the dye palette above.
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      fontFamily: {
        // Display: the storytelling voice. An old-style Garamond revival — nib
        // contrast, not machine contrast — beside hand-drawn line work.
        display: ['var(--font-display)', 'Georgia', 'serif'],
        // Inscription: Roman capitals, for eyebrows, numerals and the wordmark.
        inscription: ['var(--font-inscription)', 'var(--font-display)', 'serif'],
        // Body: high x-height humanist sans, for long-form legibility on phones.
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        // Telugu, for the few places the local name of a thing is the true name.
        telugu: ['var(--font-telugu)', 'var(--font-body)', 'sans-serif'],
      },
      fontSize: {
        // Cormorant sets optically smaller than a grotesque at the same px, and
        // its old-style forms want *positive* tracking at display sizes rather
        // than the negative tracking a geometric sans needs. Both are corrected
        // here so the scale reads at the same visual weight as before.
        'display-xl': ['clamp(3rem, 8.6vw, 6rem)', { lineHeight: '1.02', letterSpacing: '-0.012em' }],
        'display-lg': ['clamp(2.5rem, 6.4vw, 4.4rem)', { lineHeight: '1.06', letterSpacing: '-0.01em' }],
        'display-md': ['clamp(1.95rem, 4.8vw, 3rem)', { lineHeight: '1.13', letterSpacing: '-0.006em' }],
        'display-sm': ['clamp(1.5rem, 3.2vw, 2.05rem)', { lineHeight: '1.22', letterSpacing: '-0.002em' }],
        'body-lg': ['clamp(1.0625rem, 1.4vw, 1.1875rem)', { lineHeight: '1.7' }],
        'body-base': ['1rem', { lineHeight: '1.65' }],
        'eyebrow': ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.16em' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'tabbar': 'calc(4rem + env(safe-area-inset-bottom))',
      },
      backgroundImage: {
        'cloth-grain':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140' viewBox='0 0 140 140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        // The kalam draws: used for SVG stroke reveals on section rules.
        'draw-stroke': {
          from: { strokeDashoffset: '1' },
          to: { strokeDashoffset: '0' },
        },
        // Dye blooming outward in the vat.
        'dye-bloom': {
          '0%': { transform: 'scale(0.94)', opacity: '0' },
          '60%': { opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.22s ease-out',
        'accordion-up': 'accordion-up 0.22s ease-out',
        'draw-stroke': 'draw-stroke 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'dye-bloom': 'dye-bloom 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'rise-in': 'rise-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        shimmer: 'shimmer 1.8s infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
