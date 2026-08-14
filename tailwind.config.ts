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
        /**
         * pachcha — the green, and the only colour on the cloth that is made
         * of two other colours.
         *
         * There is no green dye in this workshop. Green is obtained the way it
         * has always been obtained here: a yellow ground struck from myrobalan
         * or pomegranate rind, then dipped in the indigo vat, so the blue lies
         * over the yellow and the eye resolves the pair. That is why these
         * swatches sit between the `myrobalan` and `indigo` ramps rather than
         * on a pure green hue — a saturated emerald would be a colour this
         * cloth cannot produce.
         *
         * Used for the states that mean "this is settled": in stock, verified,
         * a step completed. Never for a call to action — madder does that.
         */
        pachcha: {
          50: '#F2F5EC',
          100: '#E1E8D4',
          200: '#C4D0AC',
          300: '#A3B481',
          400: '#84975E',
          500: '#697B47',
          600: '#526138',
          700: '#414D2E',
          800: '#353E27',
          900: '#2B3220',
          950: '#161A11',
        },

        /**
         * geru — red ochre earth, the warm terracotta between madder and
         * catechu.
         *
         * `chay` is a dyed red and `katha` is a bark brown; neither is the
         * warm burnt-sienna the ground of a finished cloth actually goes when
         * the alum was laid thin. This ramp fills that gap, and is what the
         * site's warm surfaces are tinted with — section grounds, borders on
         * cloth-coloured cards, the wash behind a quotation.
         */
        geru: {
          50: '#FBF3EE',
          100: '#F5E2D5',
          200: '#E8C3AB',
          300: '#D89F7C',
          400: '#C57B53',
          500: '#AC5F39',
          600: '#8D4A2C',
          700: '#713B25',
          800: '#5A3020',
          900: '#48281C',
          950: '#28140E',
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

        /**
         * Gold — struck from myrobalan, and the site's one *pointing* colour.
         *
         * It is deliberately not in the 60-30-10 body of the page. Madder does
         * the 10%; gold sits outside the scheme entirely and is spent only on
         * things that single something out for the visitor right now: the quick
         * tour's ring, the rule under the name in the opening, the active mark
         * in a sub-navigation. Using it anywhere decorative would cost it the
         * only property that makes it useful.
         */
        gold: {
          DEFAULT: 'hsl(var(--gold))',
          foreground: 'hsl(var(--gold-foreground))',
        },

        /**
         * The settled state, in pachcha green. Theme-aware, because a green
         * that reads on cream is invisible on kasim black — it lifts in the
         * dark exactly as madder and gold do.
         *
         * This is the site's only *semantic* colour: it means "confirmed",
         * not "good". In stock, paid, dispatched, a step completed.
         */
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
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
        // Display: Fraunces. The storytelling voice, and the only face on the
        // site allowed to be loud. Nib contrast, not machine contrast, but it
        // holds a real 700 — see the note in `src/app/layout.tsx`.
        display: ['var(--font-display)', 'Georgia', 'serif'],
        /*
          Inscription: eyebrows, the wordmark's second line, step numerals.

          This now resolves to the *body* face rather than to a third family.
          The name is kept — seventy-one files ask for `font-inscription` — but
          what it points at changed, so those files inherited tracked capitals
          in Plus Jakarta Sans without one of them being edited. Keeping the
          role name and repointing the variable is the whole reason the swap
          was a two-file change instead of a two-hundred-file one.
        */
        inscription: ['var(--font-body)', 'system-ui', 'sans-serif'],
        // Body: high x-height geometric humanist, for long-form legibility.
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        /*
          There was a `brand` family here, pointing at Kalam, for the company
          name alone. It is gone: the name is set in `display` now, because a
          script face cannot be read at 15px in a phone header and a wordmark
          that is only legible when it is large is not a wordmark. See the note
          in `src/components/layout/wordmark.tsx`.
        */
        // Telugu, for the few places the local name of a thing is the true name.
        telugu: ['var(--font-telugu)', 'var(--font-body)', 'sans-serif'],
      },
      /**
       * The type scale, re-struck to fit a phone.
       *
       * The previous scale was built from `clamp(min, Nvw, max)` with no
       * intercept, which has a specific failure mode: below the width where
       * `Nvw` overtakes `min`, the type stops responding at all and sits flat
       * on its floor. `display-xl` was `clamp(3rem, 8.6vw, 6rem)`, and 8.6vw
       * does not reach 3rem until 558px — so every phone on earth got the
       * same 48px headline, and 48px on a 390px screen spent four lines and
       * 196px of vertical space on six words.
       *
       * Each line below is instead a real linear ramp, `Nvw + Crem`, solved
       * through two points: a comfortable size at 320px and the intended size
       * at 1440px. The type now actually scales across the whole range, the
       * floors are reachable sizes rather than parked ones, and the ceilings
       * come down too — the desktop headline was also larger than the writing
       * underneath it deserved.
       *
       * Re-struck a second time, downward. The ramps were the right shape but
       * the desktop end of every one of them was set for a poster rather than
       * for a page: `display-xl` reached 84px at 1440px, which put six words of
       * the home page headline across four lines and pushed the paragraph that
       * explains the claim below the fold on a 900px-tall laptop. The same
       * two-point solve is used, with the ceilings brought down about 20% and
       * the floors about 10% — proportional, so a phone gets the identical
       * layout at a smaller size rather than a different one.
       *
       *                 320px      390px     1024px     1440px    (previous max)
       *   display-xl     30px       32px       52px       66px     (84)
       *   display-lg     26px       27px       40px       48px     (60)
       *   display-md     22px       23px       29px       34px     (42)
       *   display-sm     19px       19px       23px       25px     (30)
       *   body-lg        16px       16px       17px       18px     (18, unchanged)
       *
       * `body-lg` is deliberately untouched. Reading size is set by what is
       * comfortable to read, not by what is in proportion to the headings.
       */
      fontSize: {
        'display-xl': [
          'clamp(1.875rem, 3.214vw + 1.232rem, 4.125rem)',
          { lineHeight: '1.06', letterSpacing: '-0.012em' },
        ],
        'display-lg': [
          'clamp(1.625rem, 1.964vw + 1.232rem, 3rem)',
          { lineHeight: '1.1', letterSpacing: '-0.01em' },
        ],
        'display-md': [
          'clamp(1.375rem, 1.071vw + 1.161rem, 2.125rem)',
          { lineHeight: '1.18', letterSpacing: '-0.006em' },
        ],
        'display-sm': [
          'clamp(1.1875rem, 0.536vw + 1.08rem, 1.5625rem)',
          { lineHeight: '1.26', letterSpacing: '-0.002em' },
        ],
        'body-lg': ['clamp(1rem, 0.18vw + 0.96rem, 1.125rem)', { lineHeight: '1.65' }],
        'body-base': ['1rem', { lineHeight: '1.62' }],
        // 11px, and the tracking comes down with it. At 12px/0.2em the location
        // eyebrow — "Srikalahasti · Tirupati district · Andhra Pradesh" — wrapped
        // to two lines on every phone, which is a caption pretending to be a
        // label. `.eyebrow` in globals.css sets the tracking per breakpoint.
        'eyebrow': ['0.6875rem', { lineHeight: '1.45', letterSpacing: '0.14em' }],
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
        // The quick tour's ring, breathing. Slow enough to read as attention
        // rather than as an alarm. Struck in gold rather than madder: madder is
        // the site's primary and is already on every heading and price, so a
        // madder ring reads as part of the page instead of as a pointer at it.
        'tour-pulse': {
          '0%, 100%': { outlineColor: 'hsl(var(--gold) / 0.95)' },
          '50%': { outlineColor: 'hsl(var(--gold) / 0.4)' },
        },
        // The preloader's name, arriving out of a slow cinematic push-in. The
        // scale is small on purpose: a big zoom is a title sequence, a small one
        // is a camera settling.
        'name-arrive': {
          from: { opacity: '0', transform: 'scale(1.12)', filter: 'blur(6px)' },
          '60%': { opacity: '1' },
          to: { opacity: '1', transform: 'scale(1)', filter: 'blur(0px)' },
        },
        // The rule under the name, drawn outward from the centre.
        'rule-draw': {
          from: { transform: 'scaleX(0)' },
          to: { transform: 'scaleX(1)' },
        },
        /**
         * The wordmark's pen, re-laying its line every couple of seconds.
         *
         * The *stroke* moves, never the letters. Animating the name itself —
         * a sheen across the glyphs, a colour cycle, a breath of scale — buys
         * a moment of interest at the cost of the one thing a wordmark has to
         * do, which is sit still and be read. So the ornament carries all of
         * it: the line the kalam leaves is drawn on, held, and lifted, and the
         * name underneath never changes weight or colour.
         *
         * Two thirds of the cycle is the rest between passes. Continuous
         * movement in a fixed header is a distraction; a mark that happens and
         * then stops is a detail somebody notices once and then stops seeing.
         */
        'kalam-trail': {
          '0%': { strokeDashoffset: '48', opacity: '0' },
          '18%': { opacity: '0.55' },
          '46%': { strokeDashoffset: '0', opacity: '0.55' },
          '66%': { strokeDashoffset: '0', opacity: '0.55' },
          '86%, 100%': { strokeDashoffset: '0', opacity: '0' },
        },
        // The announcement bar. Translated rather than animating `left`, so it
        // stays on the compositor.
        marquee: {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        /**
         * The scroll cue at the foot of the hero — a short mark travelling
         * down a hairline, then gone.
         *
         * Not a bouncing chevron. A chevron that bounces forever is a piece of
         * generic UI and reads as one; a line drawn downward is the same
         * gesture the wordmark's kalam makes, and it is the mark this site
         * already owns. Two thirds of the cycle is the pause between passes,
         * for the same reason `kalam-trail` is mostly rest: continuous motion
         * in the corner of the eye is a distraction, a thing that happens and
         * stops is a detail.
         *
         * `translateY` and `opacity` only, so it never leaves the compositor.
         */
        'scroll-hint': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '25%': { opacity: '1' },
          '60%': { transform: 'translateY(160%)', opacity: '0' },
          '100%': { transform: 'translateY(160%)', opacity: '0' },
        },
        /**
         * A colour story arriving when its pot is pressed.
         *
         * Shorter and shallower than `rise-in`: this fires on six or seven
         * elements at once behind a stagger, and at 14px each the block reads
         * as a list assembling itself rather than as one thing arriving. Eight
         * pixels and a hair of blur is the smallest move that still tracks the
         * eye down the column.
         *
         * `opacity`, `transform` and `filter` only — all compositor
         * properties, and the element is in normal flow, so nothing else is
         * competing for `transform` on it.
         */
        'story-in': {
          from: { opacity: '0', transform: 'translateY(8px)', filter: 'blur(3px)' },
          to: { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },

        /* ------------------------------------------------------------------
           The doorway sequence
           ------------------------------------------------------------------
           Five animations that run once, in order, at the top of the landing
           page: the film settles, a keyline draws itself around it, four
           corner rosettes open, the greeting arrives, and the store's name is
           inked in. The order is the whole point — the name is the last thing
           to appear, so it lands on a reader who has already watched a hand
           draw a line.

           Every one is `both`-filled and delay-staggered from the component,
           and every one is applied through `motion-safe:`. Under reduced
           motion no class is attached at all, so the entire block is simply
           present at its final state — the delays never get a chance to hold
           anything invisible, which is the failure mode a `!important`
           duration override does not fix.
           ------------------------------------------------------------------ */

        /* The keyline, drawn by a pen rather than switched on. `pathLength`
           is normalised to 100 on the path so one keyframe fits any perimeter. */
        'frame-draw': {
          from: { strokeDashoffset: '100' },
          to: { strokeDashoffset: '0' },
        },

        /* A corner rosette opening once the line has reached it. Rotation is
           small and one-directional: a petal that spins reads as a loader. */
        'petal-open': {
          from: { opacity: '0', transform: 'scale(0.35) rotate(-14deg)' },
          to: { opacity: '1', transform: 'scale(1) rotate(0deg)' },
        },

        /* The vines at the edge of the screen, breathing.

           Opacity only, and it never reaches 0.4. This runs forever in the
           reader's peripheral vision on every screen of the landing page, so
           it is held to the shallowest change that still reads as alive; a
           vine that pulses to full is a notification, not a border. */
        'vine-breathe': {
          '0%, 100%': { opacity: '0.14' },
          '50%': { opacity: '0.32' },
        },

        /* The name, arriving the way dye arrives in cloth: out of focus first,
           then sharp.

           `opacity`, `filter` and `transform` only. The obvious alternative —
           opening the letter-spacing as it lands — reflows the heading on
           every frame, and this heading is the widest line on the page. */
        'ink-in': {
          from: { opacity: '0', filter: 'blur(9px)', transform: 'translateY(9px)' },
          '65%': { opacity: '1' },
          to: { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },

        /**
         * The footer name, catching the light every two and a half seconds.
         *
         * The rule this has to obey is the one already written up on the
         * wordmark: **the letters never move.** A wordmark that breathes,
         * drifts or changes weight buys a moment of interest and pays for it
         * with the only thing a name has to do, which is sit still and be
         * read. So nothing here touches geometry — no scale, no translate, no
         * tracking. A gold band travels across the glyphs through
         * `background-clip: text` and the letterforms underneath are
         * bit-for-bit identical at every frame.
         *
         * It is `background-position` only, which is paint, not layout: it
         * cannot reflow the name and cannot shift the footer around it.
         *
         * Two thirds of the cycle is rest, exactly as `kalam-trail` and
         * `scroll-hint` are. A 2.5s loop that is *moving* for 2.5s is a
         * distraction sitting at the bottom of every page on the site; one
         * that happens, stops, and happens again is a detail somebody notices
         * once and then stops seeing.
         */
        'name-sheen': {
          '0%': { backgroundPosition: '160% 0' },
          '38%, 100%': { backgroundPosition: '-60% 0' },
        },

        /**
         * The assistant panel, arriving from the launcher.
         *
         * A short lift with a small scale, not a fade. The panel is anchored to
         * a button in the corner and should read as having come out of it; a
         * cross-fade reads as a modal that was always there and has just become
         * visible, which is the wrong relationship between a launcher and the
         * thing it launches.
         *
         * `scale` is 0.98 rather than something dramatic — this opens on top of
         * the page the reader is on, several times a session, and a panel that
         * makes an entrance is a panel that becomes irritating by the third
         * time. Under reduced motion the class is not applied at all.
         */
        'panel-open': {
          from: { opacity: '0', transform: 'translateY(18px) scale(0.98)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.22s ease-out',
        'accordion-up': 'accordion-up 0.22s ease-out',
        'draw-stroke': 'draw-stroke 1.4s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'dye-bloom': 'dye-bloom 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'rise-in': 'rise-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        /*
          The staggered page-load entrance. `both` rather than `forwards` is
          the whole difference: a delayed animation with `forwards` sits at its
          *normal* state until its delay elapses and then snaps to the first
          keyframe, so a staggered row would flash fully-formed and then blink
          out before arriving. `both` applies `from` through the delay too.

          Pure CSS, deliberately. The equivalent in JavaScript has to hide the
          element in an effect, which runs after a paint has already happened —
          the same flicker, only harder to see coming. A stylesheet animation's
          first keyframe is in place before the first paint.
        */
        'enter-rise': 'rise-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        shimmer: 'shimmer 1.8s infinite',
        'tour-pulse': 'tour-pulse 2.4s ease-in-out infinite',
        'name-arrive': 'name-arrive 1.5s cubic-bezier(0.16, 1, 0.3, 1) both',
        'rule-draw': 'rule-draw 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both',
        'kalam-trail': 'kalam-trail 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        marquee: 'marquee var(--marquee-duration, 42s) linear infinite',
        'scroll-hint': 'scroll-hint 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        // `both`, for the same reason `enter-rise` uses it: every one of these
        // carries a stagger delay, and `forwards` would flash each line fully
        // formed before blinking out to its first keyframe.
        'story-in': 'story-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',

        // The doorway sequence. `both` throughout — see the keyframe note.
        'frame-draw': 'frame-draw 1.5s cubic-bezier(0.65, 0, 0.35, 1) both',
        'petal-open': 'petal-open 0.7s cubic-bezier(0.34, 1.4, 0.64, 1) both',
        'vine-breathe': 'vine-breathe 9s ease-in-out infinite',
        'ink-in': 'ink-in 1.15s cubic-bezier(0.16, 1, 0.3, 1) both',
        // Exactly 2.5s, and mostly rest. See the keyframe note.
        'name-sheen': 'name-sheen 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite',
        /*
          The assistant panel opening.

          `rise-in` did this before and was borrowed from the page-load
          entrance: a 14px lift over 600ms, which on a bottom sheet reads as the
          sheet arriving late rather than as being opened. This is shorter, lifts
          further, and settles on a spring-ish curve — the panel comes *up* from
          the launcher instead of fading in where it already was. Opacity and
          transform only, so it never leaves the compositor.
        */
        'panel-open': 'panel-open 0.34s cubic-bezier(0.16, 1, 0.3, 1) both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
