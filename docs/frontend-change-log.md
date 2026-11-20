# Frontend excellence work — change log

Each entry: what changed, why, how it was verified, and what is still open.
"Code-verified" means unit tests, integration tests, `tsc`, `next lint` or the audit
scripts. "Browser-verified" means observed in a real browser. "Device-verified" means
observed on a physical phone or with assistive technology. Nothing is claimed beyond
the level stated.

## Baseline (before any change)

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next lint` | clean |
| `npm test` | 13 files, 190 tests passed |
| `npm run audit:contrast` / `audit:ink` | all pairs meet target |
| `npx next build` | success, 89 pages (the first two attempts failed, see note) |

Build sizes (`First Load JS`): shared 103 kB; `/` 197 kB; `/product/[slug]` 178 kB;
`/shop` 177 kB; `/process` 195 kB; `/our-story` 184 kB; `/checkout` 165 kB;
middleware 81.3 kB. Full table: scratchpad `baseline-build.log`.

Note: the first baseline build raced a concurrent `tsc` and `vitest` over `.next` and
failed with `PageNotFoundError`; the second failed on a corrupted `.next`. A clean
`.next` and nothing else running produced the baseline above.

## WP1 — Safety and correctness

### 1.1 `callbackUrl` open redirect — DONE (code-verified)

- **Bug (confirmed by reading):** `signin/page.tsx` called `redirect(callbackUrl || '/account')`
  with the raw query string, so a signed-in visitor following
  `/signin?callbackUrl=https://elsewhere.example` was sent off-site.
  Auth.js's own `signIn({ redirectTo })` already refuses cross-origin targets;
  only the page-level `redirect()` was exposed.
- **Files:** `src/lib/safe-redirect.ts` (new), `src/lib/safe-redirect.test.ts` (new, 21 tests),
  `src/app/signin/page.tsx`.
- **Fix:** `safeCallbackPath()` accepts only a single-slash path; refuses `//`, `/\`,
  schemes, encoded forms, control characters and over-long values; falls back to
  `/account`. Used for both the redirect and the sign-in target.
- **Open:** runtime check that a signed-in visit to `/signin?callbackUrl=https://…`
  lands on `/account` (browser).

### 1.3 Guest wishlist — DONE (code- and integration-verified)

- **Bug (confirmed by reading):** `toggleWishlist` returned "Sign in to save pieces…" to
  anyone not signed in, so every heart on every card was a rejection for guests.
- **Files:** `src/lib/guest-wishlist.ts` (new, pure), `src/lib/guest-wishlist.test.ts`
  (new, 12 tests), `src/lib/guest-wishlist.int.test.ts` (new, 13 tests against a real
  Postgres), `src/lib/cart.ts` (`readGuestWishlist`, guest branch of `getWishlistIds`,
  `mergeGuestWishlist`), `src/app/actions/cart.ts` (guest branch of `toggleWishlist`),
  `src/auth.ts` (merge in the `signIn` event), `src/app/wishlist/page.tsx`.
- **Design:** `svl_wish` cookie of product ids, newest first, capped at 50, httpOnly,
  lax, 60 days. Written only inside the Server Action; read path never writes. The
  product is checked against the database before an id is stored. Adding past the cap is
  refused (never evicts); removing always works. On sign-in the list is merged with
  `createMany({ skipDuplicates })`, only for ACTIVE products, then the cookie is deleted.
  A failing wishlist merge cannot block sign-in or the cart merge. No schema change.
  The signed-in path is unchanged and tested.
- **Open:** browser check of the heart on a card and the guest wishlist page;
  Auth.js sign-in merge exercised end to end (the event wiring itself is not covered by
  the integration test, which calls `mergeGuestWishlist` directly).
- **Docs:** `CLAUDE.md` cookie table to be updated in WP4.

### 1.5 Route loading states — DONE (code-verified)

- **Files:** `src/components/ui/page-skeletons.tsx` (new); `loading.tsx` added for
  `shop/[[...category]]`, `product/[slug]`, `search`, `account`, `wishlist`.
- Shapes use the real card ratio (5:6) and `PRODUCT_GRID_GAP`; each announces once via
  `role="status"`; the grey boxes are `aria-hidden`.
- **Open:** whether the skeletons match the loaded layout without shift (browser);
  the product route is statically generated so its skeleton will rarely show.

### 1.2 Checkout and form value preservation — NOT STARTED (blocked on confirmation)

- **Suspected bug:** `CheckoutState` carries no submitted values and the inputs are
  uncontrolled with `defaultValue` from the saved address only. React 19 resets
  uncontrolled fields after a `<form action>` completes, which would wipe a visitor's
  entries on any validation error.
- **Confirmed so far:** source level only (state shape, `defaultValue` usage).
- **Not yet confirmed in a browser**, so no fix has been written, as instructed.

### 1.4 Scroll restoration — NOT STARTED (blocked on confirmation)

- **Suspected bug:** `smooth-scroll-provider.tsx` calls `scrollTo(0)` on every pathname
  change, including back and forward. Needs a browser to confirm.

## Environment incident (mine)

- `npm run dev` (port 3000) was already running against the same `.next` directory.
  My baseline `npx next build` overwrote its build output, so product pages on that dev
  server now return 500 (`webpack-runtime.js … reading 'call'`). The cure is to restart
  the dev server, which regenerates `.next`.
- I started `npx next start -p 3100` for a browser reproduction. It also served broken
  output once the dev server rewrote `.next`. It is still listening on 3100; I was not
  permitted to stop it, so it needs to be stopped by you (see report).
- Consequence for later: `audit:layout` needs a production build served by `npm start`,
  which cannot coexist with `npm run dev` on one `.next`.
- **Recovery:** the user authorised stopping my port 3100 server (PIDs 19168, 8240);
  done, and port 3100 is confirmed closed. The user restarts their own dev server on
  port 3000. Agreed rules from here: no production build while the dev server is
  active; the 1.2 and 1.4 reproductions run against the user's dev server; for
  `audit:layout` the dev server is stopped first, then a clean build and `npm start`.
- Baseline bundle measurements are preserved above and must not be overwritten:
  shared JS 103 kB, `/` 197 kB, `/product/[slug]` 178 kB.

## Current verification status (after WP1 code work)

| Check | Result |
| --- | --- |
| `tsc --noEmit` | clean |
| `next lint` | clean |
| `npm test` | 15 files, 223 tests passed (baseline 190, +33 new) |
| `npm run test:integration` | 5 files, 142 tests passed (13 new) |
| `audit:contrast`, `audit:ink` | pass |
| `audit:layout`, `smoke`, browser checks | not run (no clean server) |
