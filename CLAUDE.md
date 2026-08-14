# Working on this codebase

Conventions and invariants that are not obvious from reading a single file, and
that have each cost something to learn. Read this before changing anything in
`src/lib`, `src/app/actions` or `src/content`.

For what the project *is*, see `README.md`.

---

## Money

**Money is integer paise. Everywhere. Without exception.**

- Database columns, function arguments, return values, comparisons, sums.
- It becomes text exactly once, in `formatPrice` (`src/lib/utils.ts`).
- Nothing else divides by 100. If you find yourself writing `/ 100` outside that
  function, you are about to introduce a rounding bug in somebody's total.
- Commission budgets are entered in rupees on the form and multiplied to paise
  in the action, which is the only conversion in the other direction.

Cart arithmetic lives in `src/lib/totals.ts`, deliberately free of the auth
stack so it can be unit-tested. `src/lib/cart.ts` re-exports it.

## Server actions

**A `'use server'` file may only export async functions.**

Exporting a plain object or constant from one is a runtime error —

```
A "use server" file can only export async functions, found object.
```

— and it does not break only that export. It takes down **every action in the
module graph**. Add to cart, checkout, contact, commission and reviews were all
dead once, while `tsc`, `eslint` and `next build` all reported success.

Non-function values live in `src/lib/form-state.ts`. Types are fine to export
from an action file; they are erased at compile time. Values are not.

## Admin routes

**`requireAdmin()` is the first statement of every admin page, not just the
layout.**

Next renders a layout and its page concurrently. A `redirect()` in the layout
does bounce the browser, but the page component has already run its queries by
then, and the results are serialised into the flight payload of the very
response that carries the redirect. An anonymous `curl /admin` once read the
dashboard figures straight out of the HTML.

`requireAdmin()` (`src/lib/require-admin.ts`) must be awaited before any query
runs. If it does not return, nothing is fetched, so there is nothing to leak.
The layout guard stays for navigation.

The same shape of bug is worth checking anywhere a layout guards data a page
fetches.

## Cookies

**Cookies may only be mutated inside a Server Action or a Route Handler.**

Calling `cookies().set()` or `.delete()` during a Server Component render
throws. This is easy to reach by accident: the site header renders a cart badge
on every page, so anything the cart read path touches runs during render.

Hence the split in `src/lib/cart.ts`:

| Function | May write? | Called from |
| --- | --- | --- |
| `resolveCart()` | No | Anywhere, including render |
| `resolveCartForWrite()` | Yes | Server actions only |
| `mergeGuestCart()` | Yes | The Auth.js `signIn` event |
| `readRecentlyViewed()` | No | Anywhere, including render |
| `recordRecentlyViewed()` | Yes | Server actions only |

`src/lib/recently-viewed.ts` follows the same split for the same reason. The
rail is rendered during `/shop` and every product page, so the read path must
never write; the write happens in `recordProductView` (`src/app/actions/`),
called from an effect after paint.

**"Recently viewed" is per-visitor and `viewCount` is not.** `viewCount` is one
integer on the row counting how many times *anybody* opened a piece — it cannot
express whose history it is, so a rail built on it would show every visitor the
same six pieces under a heading that says otherwise. History lives in the
`svl_seen` cookie. `viewCount` is incremented alongside it and is now a real
popularity figure rather than a column nothing writes to.

## Stock and pricing

- Prices and stock are read **from the database inside the checkout
  transaction**, never from the request body.
- Stock decrements through a **conditional `updateMany`**, so the database
  decides who won. On a one-of-one catalogue this is the difference between
  selling a piece once and selling it twice.
- Cancelling — by the customer or by an admin — **returns stock to the
  catalogue**. Failing to do this permanently destroys a saleable piece.
- Orders **snapshot** the shipping address and every line item. A customer who
  moves house or a piece that is later archived must not rewrite history.

## Payments

Both the browser callback and the Razorpay webhook confirm through
`confirmOrderPaid()` in `src/lib/order-payment.ts`. It claims the order with a
conditional update, so whichever arrives first wins and the other is a no-op.
Only the winner sends the receipt. Webhook delivery is at-least-once; anything
added there must be idempotent.

The webhook verifies the **raw request body** before parsing it. Re-serialising
a parsed object produces different bytes and a signature that never matches.

## Email

`src/lib/mail/` — one transport, reusing the SMTP configuration Auth.js already
uses for magic links.

- **Nothing is delivered outside `NODE_ENV=production`.** Every message is
  printed to the console instead. Do not add an escape hatch for this.
- **Sending never throws.** Functions return a result. An order that succeeded
  must not report failure because a mail host was slow.
- Store-side notifications go to `STORE_NOTIFICATION_EMAIL`, falling back to
  `site.contact.email`. With neither set they are previewed, never dropped
  silently.

## Content

**All narrative copy lives in `src/content/`**, not in components:

- `site.ts` — business identity, navigation, announcements, search placeholders,
  the Explore map. One source of truth.
- `process.ts` — the 23 steps in six phases, the dye index, the seven-tone wash
  behind /process, and the eight colour stories.
- `family.ts` — the five family members and the three story chapters.

  It used to carry `heritageNumbers` too, six counted figures rendered on the
  home page by `heritage-numbers.tsx`. Both were deleted when *Best Works*
  replaced that section: every figure they carried is still stated on the page
  it linked to, so nothing was lost, and a content list with no consumer is a
  thing that goes stale silently.

  **The rule they existed under still applies to anything numeric here.** A
  number looks like evidence whether or not it is one, so a figure may only be
  printed if it is stated elsewhere on the site or derived from a list in
  `src/content`, and it must carry the page where it is defended. No "since
  1952", no units sold. Where a count exists in code — the step count is
  `totalSteps` — import it rather than writing it down twice.
- `best-works.ts` — the six grounds the Best Works rail is mounted on, each
  sampled off a dye ramp and each stating its own `ink`. `npm run audit:ink`
  checks them against the same contrast ladder as the flooded dye colours; a
  ground that cannot carry text fails the check rather than shipping.
- `catalogue.ts` — the editorial layer over the shop: the type and collection
  pages, and the commission-first note on the narrative motifs.
- `commission.ts` — the guided questions, the attachment limits, the timeline.
- `welcome.ts` — the doorway and the six tour stops.
- `assistant.ts` — Lakshmi's knowledge base, which also backs the offline
  answer engine. The assistant's name, launcher label and role all come from
  `assistantIdentity` in that file; nothing hardcodes them.

### The workshop outranks the literature

`colourStories` in `process.ts` is **the family's own account**, and where a
published description of Srikalahasti Kalamkari disagrees with it, this site
follows the workshop. Two entries are deliberately not what a dye manual says:

- **Pink** is prepared as its own colour from *seval podi* worked with roots
  kept for it — not madder struck over a thinner alum layer.
- **Brown** is processed down to crystals that keep and are brought back with
  water — not catechu bark boiled on the day.
- **Green** has *four* traditional routes (yellow with kasim, yellow under
  blue, blue under yellow, hibiscus), not one. The order is the recipe, and the
  routes give different shades.

These were corrected by the store on 2026-08-12. `naturalDyes`, the `Dye` seed
`source` strings and the eight-stage summary in `saree-stages.tsx` were all
brought into line at the same time — if you change one, change all four, or the
product page, the shop filter and the home page will describe the same pot
differently.

`openPalette` is deliberately **not** a member of `colourStories`. That array
mirrors the closed `Dye` set the shop filters on; an open-ended ninth entry
with no single hex would corrupt both.

### Questions the family has not answered yet

`src/content/faq.ts` holds every question, including four about the household's
own motives and arrangements that nothing in this repository answers. They
carry `draft: true`, have no `answer`, and **render nowhere** — `publishedFaqs`
filters them out once so no surface has to remember to.

A FAQ is the page where an invented answer is least likely to be noticed and
most likely to be believed. To publish one, delete `draft: true` and write the
answer; `resolveFaq` throws on an entry that is neither answered nor drafted,
so a half-finished one cannot render blank.

### The editorial rule

`family.ts` states only what is known publicly or was given by the store, and
stays with the craft where the record is silent. **No invented biography, no
fabricated quotes.** The one quoted line is on the record. Keep it that way.

The same discipline applies site-wide. This site makes a specific factual claim
on every page — that the work is drawn freehand with natural dyes, and is not
the block- or screen-printed cloth the word "Kalamkari" usually now refers to.
The 23 steps describe real operations with real materials in the right order,
and `/journal` includes a guide to telling hand-painted work from a print.

**Do not describe a feature the site does not have.** A design editor was once
promised in four places, including the assistant's knowledge base, and never
existed. If a feature is not built, the copy does not mention it.

### Contact details

`site.contact` fields are empty until the store supplies real ones, and are read
through `contactEmail()`, `contactPhone()` and `whatsappHref()`. An unpublished
channel renders as nothing. Never render a bare `mailto:` or `tel:` from these
without the guard — a dead contact link is worse than an absent one, because
somebody writes to it and believes they have reached the store.

## The database

**PostgreSQL, everywhere, including local development.** Not a preference: the
deploy target is serverless, where the filesystem is read-only and discarded
between invocations, so a SQLite file has nowhere to live. Running SQLite in
production is what put the error boundary on every page of the first
deployment.

- The schema avoids provider-specific features on purpose: no native enums, no
  arrays, no JSON columns. Lists are newline-delimited text read through
  `src/lib/serialize.ts`. That is what kept the SQLite → PostgreSQL move down
  to the provider line, a regenerated migration and one query option.
- Schema changes go through **migrations** (`npm run db:migrate`), not
  `db push`. `db:push` remains for quick local spikes only.
- **Colour is a relation, not a substring.** `Product.naturalDyes` is the
  human sentence shown on the product page; `Dye` + `ProductDye` is the
  filterable index over it. Both are written from the same array in
  `prisma/seed.ts`, and an unrecognised dye phrase throws during the seed —
  matching `contains` against the newline text instead works until the first
  piece is described as "Madder red, thinned" and silently stops appearing
  under its own colour. The eight pots are a closed set and match the swatches
  in `two-crafts.tsx`.
- `buildWhere` (`src/lib/queries.ts`) states `mode: 'insensitive'` on every
  `contains` clause. Do not remove it: Postgres' `LIKE` is case-sensitive, and
  without it a search for "ramayana" returns nothing while rendering a
  perfectly good "nothing found". No build step can catch that — the query is
  valid, it just has no rows. This is the reason development runs on Postgres
  too.
- **Two URLs.** `DATABASE_URL` is the *pooled* endpoint and carries every
  query; `DIRECT_DATABASE_URL` is *unpooled* and is used by `prisma migrate`
  alone, because migrations hold an advisory lock that a transaction pooler
  cannot. Mixing them up fails in opposite directions: connection exhaustion
  one way, a hanging migration the other.
- Prisma CLI configuration lives in `prisma.config.ts`, not the `prisma` key in
  `package.json`. That file has to load `.env` itself — the CLI stops doing it
  the moment a config file exists.

## Per-request caching

Anything read more than once in a single render is wrapped in `React.cache`:
`resolveCart`, `getCart`, `getCartCount`, `getWishlistIds`, `getProductBySlug`,
`getCategoryBySlug`, `getCategories`, `getBlogPost`, `getReviewEligibility`.
Prisma calls are not deduplicated the way `fetch` is. `generateMetadata` and the
page body both run, so an uncached query on a product page costs two.

## Layout

**There is no `overflow-x: hidden` on `body`, and none should be added.**

There was one, and it was hiding a bug rather than preventing one. The header
wordmark's second line — "Fine Kalamkari Arts · Srikalahasti", 9px but tracked
to 0.2em — is **222px wide**, which fixed the wordmark block at 256px. On a
`shrink-0` flex item that meant the search and cart buttons sat 103px past the
right edge of every page on the site, at every width below about 500px. The
rule meant nobody could scroll to see it, so it read as a cramped header rather
than a broken one.

The rule also costs something: `overflow` on the body makes it a scroll
container, which breaks `position: sticky` on its descendants and changes what
`scrollIntoView` does.

So horizontal scroll is treated as a bug with a location. To find it:

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth
```

Two shapes account for most of it, and both were live here:

- **`min-width: auto`.** A flex item will not shrink below its content unless
  told to. `min-w-0` on the item, not `shrink-0` — `shrink-0` is what caused
  this.
- **Intrinsic widths that ignore `min-w-0`.** An `<input>` carries a default
  `size="20"` — about 223px — and that width still counts toward the *flex
  container's* min-content even when the input itself is `min-w-0 flex-1`. The
  newsletter row sized the whole footer column this way. `size={1}` removes the
  floor; `flex-1` still grows it.

Sections that genuinely need to clip a bleeding decoration carry
`overflow-hidden` themselves, where the intent is local and visible.

**A section that clips is a section that can hide a layout bug.** The hero
carried `overflow-hidden` for its 3D canvas, and behind it the banner's six
tick labels — `flex-1` with `min-width: auto`, each holding a `truncate`
(therefore `nowrap`) label — held a combined min-content of 456px against a
350px column. The document measured clean and nothing scrolled sideways. What
actually happened was that 86px of the headline and body copy were clipped, so
every line of the hero paragraph lost its last few letters, and two of the six
ticks were laid out past the right edge where nobody could reach them.

So there are two failures to look for, not one, and

```bash
npm run audit:layout          # dev server or `npm start` must be running
```

checks every important route at 320/375/390/430px for **four** failures:
documents that scroll sideways, elements that clip their own text, visible
elements hanging past the viewport edge, and pages that rendered no `<h1>` at
all. The last one is not a layout rule — it is how the script knows a route
still renders its page. An unknown product slug answers **200** and paints the
error boundary, which measures perfectly clean; without the heading check a
stale route in the list would report `ok` forever while covering nothing. It excludes `sr-only` (a 1×1 box
hiding a sentence is the point) and anything with `text-overflow: ellipsis`
(clipping *with* a mark is a decision; clipping silently is the bug). It exits
non-zero, so it can gate a build.

**`position: fixed` overflow does not move `scrollWidth`.** A fixed box cannot
widen the scroll area — it simply sits off-screen, unreadable, with no
scrollbar to reveal it. The quick-tour card hung 163px off the right edge of a
390px phone while `documentElement.scrollWidth - clientWidth` read a clean 0.
So the audit scans for edge-crossing elements *unconditionally*, not only when
the document already overflows.

**Anything that can cover the viewport must be measured on the viewport.** The
audit dismisses the preloader, welcome overlay and quick tour by default,
because otherwise they are the only thing it measures. That default is also how
the tour bug shipped: the audit suppressed the one component that was broken.
`--intro=preloader|welcome|tour` marks the earlier stages as seen so the named
one renders and can be measured. Run it after touching any of them.

## Transform is one property, not several

**An element positioned by `transform` may not also be animated by
`transform`.**

The quick-tour card centred itself with `left-1/2 -translate-x-1/2` and also
carried `animate-rise-in`, whose keyframes end on `transform: translateY(0)`.
That is not composited with the centring translate — it *replaces* it, and
`animation-fill-mode: forwards` makes the replacement stick. The card settled
at exactly `left: 50%` and ran off the right edge of every phone, with every
line of its own copy clipped. Desktop never showed it, because from `md` the
card is anchored to `right` and never used the translate.

Centre out-of-flow boxes with `inset-x-0` + `mx-auto` + a width instead
(CSS 2.1 §10.3.7 splits the leftover space between two auto margins). That
leaves `transform` free for the animation to own. The same trap applies to
`-translate-y-1/2` on vertically centred absolute elements.

## `cn()` and the custom font sizes

**Every custom key in `theme.extend.fontSize` must also be listed in
`extendTailwindMerge` in `src/lib/utils.ts`.**

tailwind-merge resolves conflicts by class *group*, and `text-*` is two groups
sharing a prefix: `font-size` and `text-color`. It tells them apart from a list
of known size keys — the stock Tailwind scale, which has never heard of
`display-xl`. So `cn('text-display-xl', 'text-cotton-50')` filed the size as a
colour, found a conflict, and returned only `text-cotton-50`.

It fails silently and only through `cn()`. A plain
`className="text-display-xl text-cotton-50"` string is never merged and renders
correctly, which is why it survived: it appears only where a component merges a
caller's classes. The symptom is a heading quietly inheriting 16px — the home
page `h1` and the `two-crafts` `h2` were both rendering *smaller than the body
copy underneath them*. `src/lib/utils.test.ts` pins every key.

## Accessibility

Built to WCAG 2.2 AA rather than retrofitted. The non-obvious parts:

- **Never stream text into an `aria-live` region.** The assistant announces a
  completed reply once, from a dedicated `sr-only` region. Streaming into a live
  region makes a screen reader announce every few tokens.
- Focus rings are never removed. `maximum-scale=5` — pinch-zoom is never
  disabled.
- Every interactive target is at least 44×44 px.
- Under `prefers-reduced-motion`, decorative motion stops but scroll-driven
  **content** still resolves to its final state. A user who asks for less motion
  must not lose information.
- Media queries are subscribed, not sampled (`useMediaQuery`). A preference read
  once on mount is wrong as soon as the visitor changes it.

## The 3D

- three.js is code-split behind `next/dynamic` and requested only after client
  capability detection resolves. It must never delay LCP.
- **No information exists only inside a canvas.** Every scene has a meaningful
  static fallback; turn off WebGL and `/process` is still the complete article.
- Canvases are `aria-hidden`; phase changes are announced through a separate
  live region.
- Scroll progress is written into refs, not React state, so scrolling never
  triggers a re-render.
- Lenis and GSAP share **one** rAF loop (GSAP's ticker drives Lenis). Lenis is
  not mounted at all under reduced motion, and touch scrolling is left native.

## Interruptions

The welcome overlay and the quick tour are the only two things on this site that
interrupt. Both are governed by `src/components/welcome/first-visit.tsx`:

- Never on `/checkout`, `/admin`, `/account`, `/signin` or `/orders`.
- Never for somebody who has already scrolled past 200px — that is a reader, not
  an arrival.
- Never twice. Dismissal is stored under a version, so changing the copy is what
  brings it back, not a cleared cache.

The announcement bar is server-rendered and hidden *before paint* by an inline
script in the root layout, not in an effect. Deciding it in an effect either
shifts the page down 36px on every first load or flashes the bar at everybody
who has closed it.

## Errors

Use typed errors, not sentinel strings. `SoldOutError` in `src/lib/errors.ts`
replaced a `throw new Error('SOLD_OUT:' + name)` matched by
`message.startsWith(...)` — which would have failed silently, as the wrong kind
of error, the first time a piece was named with a colon in it.

## Before you push

```bash
npm run typecheck
npm run lint
npm test
npm run audit:contrast   # theme tokens, both themes
npm run audit:ink        # the flooded colours and the Best Works grounds
npm run build
npm start          # one terminal
npm run smoke      # another
npm run audit:layout
```

CI runs exactly this. The smoke test exists because two real bugs passed
`tsc`, `eslint` and `next build`, and only appeared when the code ran.

`audit:contrast` and `audit:ink` exist for the same reason one layer down: a
palette written in HSL is read by humans, and moving a lightness by four points
takes a heading under AA without anything failing. Both are pure functions over
the content files, so they cost a second and need no server.

They have each already caught a live defect. `audit:contrast` found the gold
token at **3.32:1** on the cotton ground — under AA, on the one colour reserved
for whatever is being pointed at. `audit:ink` found eight tone-on-ground pairs
under AA in the flooded dye section, three of them on pink, where most of that
colour's story was illegible.

**Run `audit:layout` against `npm start`, not `next dev`.** Measured on a dev
server it reports intermittent one-pixel overflows and missing `<h1>`s that do
not reproduce on a build — the first paint is racing a compile. Two dev servers
open at once makes it much worse, because they fight over `.next`.
