# Sri Vijaya Lakshmi Fine Kalamkari Arts

E-commerce and storytelling site for a family store in **Srikalahasti, Tirupati district, Andhra Pradesh**, painting traditional Srikalahasti pen Kalamkari — freehand, with natural dyes only.

Next.js 15 (App Router) · TypeScript · Tailwind · Prisma · Auth.js · React Three Fiber · GSAP · Lenis · PWA.

---

## Quick start

```bash
npm install --legacy-peer-deps
cp .env.example .env          # then set AUTH_SECRET (see below)
npm run setup                 # prisma generate + migrate deploy + seed
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
| `npm run build` | generate, apply migrations, build, snapshot action ids |
| `npm start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm test` | Vitest — the pure logic (money, schemas, markdown, serialisation) |
| `npm run test:watch` | The same, in watch mode |
| `npm run setup` | generate + migrate + seed, in one go |
| `npm run db:migrate` | Create and apply a migration after a schema change |
| `npm run db:deploy` | Apply pending migrations (what CI and production run) |
| `npm run db:seed` | Reseed catalogue, journal and admin user |
| `npm run db:reset` | Wipe, re-migrate and reseed (destructive) |
| `npm run db:studio` | Prisma Studio — the CMS for editing pieces |
| `npm run db:push` | Push the schema without a migration. Local spikes only. |
| `npm run placeholders` | Write placeholder images (`--force` to overwrite) |
| `npm run smoke` | End-to-end test of the purchase path against a running server |

Schema changes go through **migrations**, not `db push`. `prisma/migrations/`
is the history; `npm run db:migrate` adds to it.

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

Action ids come from a snapshot written at the end of `npm run build`
(`.next/smoke-action-ids.json`). Reading the live manifest instead is
unreliable: a running server can rewrite it to hold only the actions it has
had reason to load, and the test then fails on actions that are perfectly fine.

### Unit tests

`npm test` covers the logic that is worth testing in isolation — `computeTotals`
(what a customer is charged), every Zod schema, the markdown renderer's escaping
(its output goes through `dangerouslySetInnerHTML`, so those are security tests),
the newline-delimited list serialisation, order-number generation, and the
offline assistant's routing. No jsdom, no database, no mocks of the framework:
the paths that need a real server are covered by the smoke test above.

---

## What you need to replace before launch

These are the only things standing between this and a live site. Each is deliberately obvious rather than plausible-looking, so none can ship by accident.

| What | Where | Notes |
| --- | --- | --- |
| Email, phone, WhatsApp | `src/content/site.ts` → `site.contact` | Empty by default. An unpublished channel renders as nothing rather than as a dead link — read them through `contactEmail()`, `contactPhone()`, `whatsappHref()`. WhatsApp wants digits only, country code first. |
| Product photography | `public/images/products/` | Four views per piece. Paths are set in `prisma/seed.ts`. |
| Family photographs | `public/images/family/` | Five portraits. |
| Store and journal images | `public/images/store/`, `public/images/journal/` | |
| Open Graph images | `public/images/og/` | 1200×630. |
| App icons | `public/icons/` | 192 and 512, plus maskable variants with safe-zone padding. |
| Social links | `src/content/site.ts` → `site.social` | Empty by default; unset links simply do not render. |
| Shipping rates | `src/content/site.ts` → `site.shipping` | In paise. |
| Street address | `src/app/contact/page.tsx` | Currently town-level only. Add the full address if the store wants it published. |
| Privacy & terms | `src/app/privacy`, `src/app/terms` | Written plainly as a starting point — have a lawyer review before trading. |
| SMTP credentials | environment | Without them nothing is emailed; messages are printed to the server console instead. |
| Razorpay keys + webhook secret | environment | Without them the online payment option is not offered and cash on delivery is used. |

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
    actions/             Server actions: cart, checkout, forms, admin, account
    api/                 Auth.js handler, Razorpay create/verify, Razorpay webhook
  components/
    three/               R3F scenes and the cloth shader
    process/             The scroll journey
    shop/  cart/  checkout/  orders/  admin/  account/  forms/  layout/
    ui/  motion/  assistant/  providers/
  content/               site.ts · process.ts · family.ts · assistant.ts —
                         all editorial copy
  lib/                   prisma · queries · cart · totals · orders · payments ·
                         order-payment · order-access · validation · markdown ·
                         errors · mail/
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

Cash on delivery works out of the box. Razorpay is wired end to end
(`src/lib/payments.ts`, `src/app/api/razorpay/route.ts`) but inert without keys —
with none set, the online option is simply not offered rather than faking
success. The signature check is timing-safe and also verifies the payment
belongs to *that* order.

Two things report a successful payment: the browser, when the checkout widget
hands back a signature, and the **webhook** at `/api/razorpay/webhook`, which
arrives server-to-server. Either can be first and either can be the only one to
arrive — a customer who closes the tab the instant the payment clears produces
the webhook and nothing else. Both come through `confirmOrderPaid()`
(`src/lib/order-payment.ts`), which claims the order with a conditional update,
so whichever wins sends the receipt and the other is a no-op. Webhook delivery
is at-least-once; anything added there must stay idempotent.

The webhook verifies the **raw request body** before parsing it — re-serialising
a parsed object produces different bytes and a signature that never matches.

### Email

`src/lib/mail/` — order confirmation, dispatch, cancellation, return requests,
and store-side notices for new orders, enquiries and commissions. It reuses the
SMTP configuration Auth.js already uses for magic links rather than introducing
a second mail setup.

**Nothing is delivered outside `NODE_ENV=production`.** In development every
message is printed to the console in full and dropped, so a dispatch notice can
never reach a real customer from a developer's laptop. Sending never throws
either: an order that succeeded must not be reported as failed because a mail
host was slow.

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
- Under `prefers-reduced-motion`, decorative motion stops but scroll-driven **content** still resolves to its final state. The preference is *subscribed*, not sampled once, so turning it on mid-session takes effect without a reload.
- **Text is never streamed into an `aria-live` region.** The assistant announces a completed reply once, from a dedicated `sr-only` region; streaming into a live region makes a screen reader announce every few tokens.
- Filter state is visible outside the mobile filter sheet as dismissible chips, so a closed sheet never leaves a short list with no visible reason for being short.

Colour choices come from the dyes themselves and are checked for contrast; the hero has a gradient scrim so text stays legible across the whole dye sweep.

---

## Light and dark

Both palettes are sampled from the same dyes; the dark one is defined
independently in `globals.css` as "the store at night, or an indigo vat", with
madder lifted in value so it still reads against a dark ground. `next-themes`
drives it, defaulting to the system preference, with a toggle in the header and
in the mobile drawer.

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
3. Delete `prisma/migrations/` and regenerate it against the new provider —
   the existing migration is SQLite DDL and will not replay on Postgres:
   `npx prisma migrate dev --name initial_schema`, then `npm run db:seed`.
4. In `src/lib/queries.ts`, add `mode: 'insensitive'` to the `contains` clauses in `buildWhere` — SQLite is case-insensitive for ASCII by default and rejects the option, Postgres is not and needs it.

---

## Deploying

Works on Vercel, or any Node host, with no configuration beyond environment variables.

Set in production: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_SITE_URL`, and — if used — `AUTH_GOOGLE_ID`/`AUTH_GOOGLE_SECRET`, the `EMAIL_SERVER_*` block plus `STORE_NOTIFICATION_EMAIL`, and the Razorpay keys plus `RAZORPAY_WEBHOOK_SECRET`.

`npm run build` applies pending migrations before building, so a deploy needs no
separate migration step.

Point the Razorpay webhook at `https://yourdomain/api/razorpay/webhook`,
subscribed to `payment.captured`, `order.paid` and `payment.failed`.

A `Content-Security-Policy-Report-Only` header ships enabled. Watch the reports,
then rename the header to `Content-Security-Policy` to enforce it — the two
allowances it still carries (`unsafe-inline` for the JSON-LD blocks and Next's
bootstrap, `unsafe-eval` for three.js shader compilation) are documented at the
header in `next.config.mjs`.

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
- `npm test` — 73 unit tests pass
- `npm run build` — succeeds; 35 products and 5 journal posts prerendered
- `npm run smoke` — 12/12 checks pass against a production build
- All routes return 200; 404 and error boundaries render
- Sign-in verified end to end (magic link printed to console in dev, session established, admin dashboard reachable)
- Admin routes and order tracking verified to disclose nothing to anonymous requests — an anonymous `curl /admin` returns the sign-in redirect and **zero** database-sourced content
- Degradation verified with nothing configured: the assistant answers from the local knowledge base, `/api/razorpay` returns 503, the webhook rejects an unsigned body with 400 and a forged one with 401, and every email is printed to the console rather than sent

CI (`.github/workflows/ci.yml`) runs all of the above on every push and pull
request, deliberately with no SMTP host and no payment keys — the degraded
configuration is the one most worth exercising.

First-load JS: 103 kB shared, 162–174 kB on the heaviest content routes and
207 kB on the home page, with three.js in a lazy chunk.

---

## Accounts and orders

A signed-in customer can edit their name and phone, and keep an address book
with one default. **Editing an address never changes an order**: orders carry
their own snapshot of where they were sent, written at checkout, which is the
whole reason the snapshot exists.

The email address is not editable. It is the identity Auth.js signs the account
in with and the second factor protecting order tracking, so changing it is an
account-recovery operation rather than a profile field.

Orders can be cancelled by the customer while nothing has been drawn
(`PENDING` or `CONFIRMED`). That returns stock to the catalogue in the same
transaction and marks a paid order `REFUNDED`. After that it becomes a written
request instead — weeks of one person's hand are already committed, and
hand-painted work has no returnable-condition checklist a form could apply, so
a person decides.

Reviews are restricted to the person a piece was delivered to. On a catalogue
that is almost entirely one-of-one there is only ever one buyer, so "someone who
owns this" is the only voice that can say anything the product page does not
already say.

**No email address appears in a URL.** The confirmation page entitles the
browser with a short-lived httpOnly cookie (`src/lib/order-access.ts`), and a
signed-in owner is recognised by session on the tracking page. Putting the
address in a query string would leak it into browser history, into access logs,
and into the `Referer` of every outbound link on the page — and that address is
exactly what stops an order number alone from exposing a home address and a
phone number.

---

## A note on the content

This site makes a specific factual claim on every page — that the work is drawn freehand with natural dyes, and is not the block-printed or screen-printed cloth that the word "Kalamkari" usually now refers to. The copy is written to be defensible: the 23 steps describe real operations with real materials in the right order, the dye index names actual sources, and `/journal` includes a guide to telling hand-painted work from a print that would embarrass the store if the work did not hold up.

Keep it that way when you edit it. In particular: **do not describe a feature
the site does not have.** A design editor was once promised in four places —
the home page, the nav hint, the assistant's knowledge base and a route
suppression list — and never existed. The assistant would tell customers about
it in detail. The copy now describes only the written commission brief that is
actually built, and `src/lib/assistant/system-prompt.ts` carries an explicit
instruction against reinventing it.
