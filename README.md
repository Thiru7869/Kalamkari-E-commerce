# Sri Vijaya Lakshmi Fine Kalamkari Arts

E-commerce and storytelling site for a family store in **Srikalahasti, Tirupati district, Andhra Pradesh**, painting traditional Srikalahasti pen Kalamkari — freehand, with natural dyes only.

Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · Auth.js · React Three Fiber · GSAP · Lenis · PWA.

---

## Quick start

```bash
npm install --legacy-peer-deps
cp .env.example .env          # then set AUTH_SECRET (see below)
npm run setup                 # prisma generate + db push + seed
node scripts/generate-placeholders.mjs
npm run dev
```

Open <http://localhost:3000>.

`--legacy-peer-deps` is needed because several three.js ecosystem packages have not yet widened their React 19 peer ranges. The code itself is React 19 compatible.

Generate an auth secret with `npx auth secret`, or:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Signing in locally

There is no SMTP account required. With `EMAIL_SERVER_HOST` blank, sign-in links are **printed to the terminal** instead of emailed — look for the boxed link in the `npm run dev` output. This override is refused outright in production.

The seed creates an admin user (`SEED_ADMIN_EMAIL`, default `admin@example.com`). Sign in as that address to reach `/admin`.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` then production build |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run setup` | generate + push schema + seed, in one go |
| `npm run db:seed` | Reseed catalogue, journal and admin user |
| `npm run db:reset` | Wipe and reseed (destructive) |
| `npm run db:studio` | Prisma Studio — the CMS for editing pieces |
| `npm run placeholders` | Write placeholder images (`--force` to overwrite) |
| `npm run smoke` | End-to-end test of the purchase path against a running server |

### The smoke test

`npm run smoke` drives the real server actions over HTTP — add to cart, read the
cart, place a COD order — then asserts against the database that the order was
created with the right total, the stock decremented, the cart emptied and a
timeline event was written. Run it against a production build:

```bash
npm run build && npm start     # one terminal
npm run smoke                  # another
```

It exists because two of the bugs found while building this were invisible to
`tsc`, `eslint` and `next build`, and only appeared when the code actually ran.
See below.

---

## What you need to replace before launch

These are the only things standing between this and a live site. Each is deliberately obvious rather than plausible-looking, so none can ship by accident.

| What | Where | Notes |
| --- | --- | --- |
| Email, phone, WhatsApp | `src/content/site.ts` → `site.contact` | Currently `TODO-…`. WhatsApp wants digits only, country code first. |
| Product photography | `public/images/products/` | Four views per piece. Paths are set in `prisma/seed.ts`. |
| Family photographs | `public/images/family/` | Five portraits. |
| Store and journal images | `public/images/store/`, `public/images/journal/` | |
| Open Graph images | `public/images/og/` | 1200×630. |
| App icons | `public/icons/` | 192 and 512, plus maskable variants with safe-zone padding. |
| Social links | `src/content/site.ts` → `site.social` | Empty by default; unset links simply do not render. |
| Shipping rates | `src/content/site.ts` → `site.shipping` | In paise. |
| Street address | `src/app/contact/page.tsx` | Currently town-level only. Add the full address if the store wants it published. |
| Privacy & terms | `src/app/privacy`, `src/app/terms` | Written plainly as a starting point — have a lawyer review before trading. |

The placeholder images are flat woven swatches in the store's dye palette, obviously synthetic so nobody mistakes one for real work. Files ending `.jpg` contain PNG bytes; the extension is kept so real photography drops in without touching the seed data, and Next's optimiser detects format from the bytes.

---

## Architecture

```
prisma/
  schema.prisma          Catalogue, orders, auth, commissions, journal
  seed.ts                35 products, 30 fabrics, 10 motifs, 5 journal entries
scripts/
  generate-placeholders.mjs
src/
  auth.ts                Auth.js config (Google + email magic link)
  app/
    page.tsx             Home
    shop/[[...category]] Shop index and the five category routes
    product/[slug]       Product detail
    process/             The 23 steps, scroll-driven 3D
    our-story/           The family
    custom/              Commission enquiry (/commission redirects here)
    journal/             Journal index and posts
    contact/  care/  shipping/  privacy/  terms/
    cart/  checkout/  orders/track/  account/  wishlist/  search/  signin/
    admin/               Dashboard, orders, catalogue, commissions, enquiries
    actions/             Server actions: cart, checkout, forms, admin
    api/                 Auth.js handler, Razorpay create/verify
  components/
    three/               R3F scenes and the cloth shader
    process/             The scroll journey
    shop/  cart/  checkout/  orders/  admin/  forms/  layout/  ui/  motion/
  content/               site.ts · process.ts · family.ts — all editorial copy
  lib/                   prisma · queries · cart · orders · payments · validation · markdown
```

### Where the writing lives

All narrative copy is in `src/content/`, not scattered through components:

- **`site.ts`** — business identity, navigation, shipping. One source of truth.
- **`process.ts`** — the 23 steps in six phases, the dye index, and the "what we never use" list.
- **`family.ts`** — the five family members and the three story chapters.

`family.ts` follows a strict editorial rule: state only what is known publicly or was given by the store, and stay with the craft where the record is silent. No invented biography, no fabricated quotes. The one quoted line is on the record.

---

## The 3D

Three scenes, all built on one custom shader (`components/three/cloth-material.ts`) that makes a plane read as dyed cotton rather than a coloured polygon: a woven warp/weft grid, dye that bleeds along the weave instead of stopping at a hard edge, and ink whose density varies as a real pen running dry.

- **Home hero** — cloth hanging in the store, madder red striking across it as you scroll. It illustrates the single most counter-intuitive fact about the craft: colour arrives in a boiling bath, days after it was painted on as a clear liquid.
- **`/process`** — one canvas, pinned, cross-fading through six states as you read: bare cloth → charcoal sketch → iron black → madder red → indigo → sun-washed. Six separate canvases would exhaust the browser's WebGL context limit on mobile.

**Constraints the 3D is held to:**

- three.js is code-split behind `next/dynamic` and requested only after client capability detection resolves. It never delays LCP — `/process` is 161 kB first load, not 390 kB.
- Every scene has a meaningful static fallback. **No information exists only inside a canvas.** Turn off WebGL and `/process` is still the complete article.
- Canvases are `aria-hidden`. Phase changes are announced through a separate live region.
- Scroll progress is written into refs, not React state, so scrolling never triggers a re-render.
- `prefers-reduced-motion` renders a single still frame rather than an animation loop.
- DPR is capped at 2 (1.5 on low-power devices), and segment counts drop on phones.

Lenis and GSAP share **one** rAF loop (GSAP's ticker drives Lenis), and Lenis is not mounted at all under reduced motion. Touch scrolling is left native — hijacking momentum scroll on a phone is the fastest way to make a site feel broken.

---

## E-commerce behaviour

The catalogue is almost entirely **one-of-one** pieces, which changes several defaults:

- Stock is re-checked and decremented **inside the checkout transaction** with a conditional `updateMany`. Two people reaching the same saree cannot both buy it.
- Prices are read from the database at checkout, never from the request body.
- Quantity steppers are hidden where stock is 1, because they would be meaningless.
- Sold-out product pages point at `/commission` rather than a dead "notify me".
- Cancelling an order in the admin returns its pieces to the catalogue.
- Money is integer **paise** everywhere, formatted exactly once in `formatPrice`.

Guest carts live in an httpOnly cookie and are merged into the user's cart on sign-in.

Order tracking requires **both** the order number and the matching email — a guessable reference alone must never expose an address and phone number.

### Payments

Cash on delivery works out of the box. Razorpay is wired end to end (`src/lib/payments.ts`, `src/app/api/razorpay/route.ts`) but inert without keys — with none set, the online option is simply not offered rather than faking success. The signature check is timing-safe and also verifies the payment belongs to *that* order.

---

## Accessibility

Built to WCAG 2.2 AA rather than retrofitted:

- Skip link; one `<h1>` per page; headings in order.
- Every interactive target is at least 44×44 px.
- Visible focus rings everywhere, never removed.
- Radix primitives for menus, dialogs and selects — correct roles, focus trapping and Escape handling.
- Native `<select>` for sorting and states: smaller, faster, and the OS picker on a phone.
- Filters live in the URL, so a filtered view is shareable and survives back/refresh.
- Live regions on result counts, cart quantity, gallery position and process phase.
- Honeypot fields are `aria-hidden` and `tabIndex={-1}`.
- `maximum-scale=5` — pinch-zoom is never disabled.
- Under `prefers-reduced-motion`, decorative motion stops but scroll-driven **content** still resolves to its final state.

Colour choices come from the dyes themselves and are checked for contrast; the hero has a gradient scrim so text stays legible across the whole dye sweep.

---

## PWA

`public/manifest.webmanifest` plus a conservative service worker (`public/sw.js`):

- Navigations and API calls: **network-first.** Stale prices or stale stock on a one-of-one catalogue are worse than failing offline.
- `/_next/static/*`: cache-first (content-hashed, immutable).
- Images: stale-while-revalidate, capped at 80 entries.
- Cart, checkout, account, admin, sign-in and all POSTs: **never cached.**

Registered in production only; in development any existing worker is actively unregistered. The phone tab bar hides on checkout, where navigating away is a lost order.

---

## Moving to PostgreSQL

The schema avoids provider-specific features on purpose (no native enums, no arrays, no JSON columns — lists are newline-delimited text read through `src/lib/serialize.ts`). To switch:

1. `provider = "postgresql"` in `prisma/schema.prisma`.
2. Point `DATABASE_URL` at your instance.
3. `npx prisma db push && npm run db:seed`.
4. In `src/lib/queries.ts`, add `mode: 'insensitive'` to the `contains` clauses in `buildWhere` — SQLite is case-insensitive for ASCII by default and rejects the option, Postgres is not and needs it.

---

## Deploying

Works on Vercel, or any Node host, with no configuration beyond environment variables.

Set in production: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and — if used — `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, the `EMAIL_SERVER_*` block, and the Razorpay keys.

Google OAuth redirect URI: `https://yourdomain/api/auth/callback/google`.

Admin routes are gated in `src/app/admin/layout.tsx` — a server layout, not middleware, because middleware runs on the edge where Prisma cannot read a user's role.

---

## Two traps this codebase already fell into

Both passed `tsc`, `eslint` and `next build`, and both were only found by
running the thing. If you extend this project, keep them in mind.

### 1. A `'use server'` file may only export async functions

`src/app/actions/forms.ts` exported `initialFormState`, a plain object, for
`useActionState` to use as its initial value. That is a runtime error:

```
A "use server" file can only export async functions, found object.
```

and it does not just break that one export — it takes down **every action in
the module graph**. Add to cart, checkout, contact, commission and reviews were
all dead, while the build reported success.

Non-function values now live in `src/lib/form-state.ts`. Types are fine to
export from an action file (they are erased at compile time); values are not.

### 2. A `redirect()` in a layout does not stop the page from querying

Next renders a layout and its page **concurrently**. The admin layout called
`redirect()` for unauthenticated users, and the browser did bounce to
`/signin` — but the page component had already run its Prisma queries by then,
and the results were serialised into the flight payload of the very response
that carried the redirect. An anonymous `curl /admin` read the dashboard
figures straight out of the HTML.

The fix is `requireAdmin()` in `src/lib/require-admin.ts`, awaited as the first
statement of **every** admin page, not just the layout. If it does not return,
no query runs, so there is nothing to leak. The layout guard remains for
navigation.

The same shape of bug is worth checking anywhere a layout guards data a page
fetches.

---

## Verified state

- `npm run typecheck` — clean
- `npm run lint` — clean
- `npm run build` — succeeds; 35 products and 5 journal posts prerendered
- `npm run smoke` — 12/12 checks pass against a production build
- All routes return 200; 404 and error boundaries render
- Sign-in verified end to end (magic link printed to console in dev, session established, admin dashboard reachable)
- Admin routes and order tracking verified to disclose nothing to anonymous requests

First-load JS: 103 kB shared, 162–174 kB on the heaviest content routes and
207 kB on the home page, with three.js in a lazy chunk.

---

## A note on the content

This site makes a specific factual claim on every page — that the work is drawn freehand with natural dyes, and is not the block-printed or screen-printed cloth that the word "Kalamkari" usually now refers to. The copy is written to be defensible: the 23 steps describe real operations with real materials in the right order, the dye index names actual sources, and `/journal` includes a guide to telling hand-painted work from a print that would embarrass the store if the work did not hold up.

Keep it that way when you edit it.
