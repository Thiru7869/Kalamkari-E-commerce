# Deploying this site

No Docker, anywhere — not in production and not on your own machine. The stack
is a single Next.js 15 application plus a managed PostgreSQL database, and both
halves have a native, free path.

For what the code does and why, see `README.md` and `CLAUDE.md`. This file is
only about getting it running on a host.

---

## The shape of the deployment

**One web service, one database. That is all.**

There is no separate backend to deploy. The "API" is Next route handlers and
server actions running inside the same process as the pages, so there is no
second service, no CORS configuration and no reverse proxy to write. Do not
split this into frontend/backend services — there is nothing to put in the
second one.

It is also **not a static site**. `next export` / "static site" hosting cannot
run it: checkout, sign-in, the admin area, the Razorpay webhook and the
assistant are all server code, and the catalogue is read from Postgres at build
and request time. The correct product on any host is a **Node web service**.

| Piece | What it needs | Free option used here |
| --- | --- | --- |
| The app | Node 24, a long-lived HTTP server or serverless functions | **Vercel** (or Render) |
| The database | PostgreSQL 14+, reachable over TLS | **Neon** |
| Everything else | nothing — no S3, no Redis, no queue | — |

Commission reference images are stored as bytes in Postgres on purpose, so
there is no file host to provision and nothing on disk to persist. Both hosts
below have an ephemeral filesystem, and that is fine.

---

## Which host

**Use Vercel** unless the store takes real money. It is the native target for
Next.js: server actions, streaming, ISR, the image optimiser and middleware all
work without configuration, and there is no cold-start problem.

**One caveat you should decide on before you start.** Vercel's free *Hobby*
plan is for personal, non-commercial projects — a portfolio, a demo, a
launch-preview of the store. Vercel's terms treat a site that takes payments or
otherwise earns money as commercial use, which requires Pro (currently
$20/month). So:

- **Showcase, demo, portfolio, staging — no live payments.** → Vercel Hobby.
  Free, and the best fit technically.
- **A real shop taking real orders.** → Vercel Pro, or the Render path below.

**Render's** free tier permits commercial use, but a free Render web service
**spins down after 15 minutes without traffic** and takes about a minute to
come back. For a store that means the first visitor after a quiet spell waits a
minute, and — worse — a Razorpay webhook can time out against a sleeping
service. Orders still confirm through the browser callback, but you lose the
authoritative confirmation path. Render's own answer to cold starts is a paid
instance ($7/month), and that is the honest cost of a commercially-licensed,
always-on host.

Whichever you pick, **the database goes on Neon, not on the host.** Render's
free PostgreSQL expires 30 days after creation and takes your catalogue with
it. Neon's free tier has no such expiry.

---

## Step 1 — The database (Neon)

This also replaces the local Docker Postgres container, so you can remove that
container and never think about it again.

1. Sign up at <https://neon.tech> (GitHub login is fine).
2. **Create a project.** Name it `kalamkari`. Pick the region closest to where
   your app will run — not to where you live. Latency between the app and the
   database is paid on every query; latency to your laptop is paid once.
   - Vercel Hobby serves functions from one region, `iad1` (Washington) by
     default → choose Neon's **AWS us-east-1**.
   - If you set the Vercel function region to Mumbai/Singapore, or deploy to
     Render in Singapore, choose Neon's **ap-southeast-1** instead.
3. On the project dashboard click **Connect**, and choose **Prisma** in the
   framework dropdown if offered. Neon then shows both strings you need.
4. With **Connection pooling ON**, copy the string — its host contains
   `-pooler`. This is `DATABASE_URL`.
5. Toggle **Connection pooling OFF** and copy again — same host without
   `-pooler`. This is `DIRECT_DATABASE_URL`.
6. Keep `?sslmode=require` on both. Neon refuses unencrypted connections.

Getting these two the wrong way round fails in opposite directions: connection
exhaustion under traffic one way, a migration that hangs forever the other.

**A second branch for local development.** In Neon, **Branches → New branch**
off `main`, call it `dev`, and take its two connection strings the same way.
Put those in your local `.env`. You now develop against a real, isolated
Postgres with no container running, and production data is never at risk. (A
branch is a copy-on-write clone, so it costs almost nothing.)

---

## Step 2 — Prepare the repository (once, locally)

```bash
cp .env.example .env          # then fill in the Neon `dev` branch URLs
npx auth secret               # writes AUTH_SECRET into .env
npm install
npm run setup                 # prisma generate + migrate deploy + seed
npm run build                 # must pass before you deploy anything
```

`npm run build` is the same command the host will run:
`prisma generate → prisma migrate deploy → next build → snapshot-actions`.
Migrations are therefore applied automatically on every deploy and there is no
separate migrate step to configure anywhere.

Push to GitHub — both hosts deploy from a Git repository, not from your disk.
Check that `.env` is *not* in the push (`git status` should never list it;
`.gitignore` already covers it).

---

## Step 3 — Deploy to Vercel

1. <https://vercel.com> → **Add New… → Project** → import the repository.
2. **Framework Preset: Next.js** (detected automatically).
3. Leave the build settings alone. For the record, the correct values are:

   | Setting | Value | Note |
   | --- | --- | --- |
   | Build Command | `npm run build` | the default; already does migrations |
   | Output Directory | *(leave empty)* | Vercel manages `.next` itself — do **not** type `.next`, `out` or `dist` |
   | Install Command | `npm install` | `.npmrc` supplies `legacy-peer-deps` |
   | Root Directory | *(leave empty)* | the app is at the repo root |
   | Node.js Version | 24.x | `engines.node` already pins this and overrides the setting |

4. **Do not deploy yet** — open **Environment Variables** first and add the
   variables from Step 4. A first deploy without them fails during
   `prisma migrate deploy`, which is confusing but harmless.
5. Deploy. Then **Settings → Domains** to attach a custom domain, and come back
   to update `NEXT_PUBLIC_SITE_URL` and `NEXTAUTH_URL` to it (and redeploy —
   see the pitfalls).

No `vercel.json` is needed and none exists in this repository.

### Environment variables on Vercel

**Settings → Environment Variables.** Each variable has checkboxes for
Production / Preview / Development — tick **Production** for everything below.
Values are encrypted and cannot be read back, so keep your own copy.

Required — the build fails without these:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | the Neon **pooled** string (`-pooler` in the host) |
| `DIRECT_DATABASE_URL` | the Neon **direct** string |
| `AUTH_SECRET` | a fresh `npx auth secret` — not your local one |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` |
| `NEXTAUTH_URL` | the same origin |

Optional — each feature switches off cleanly when the value is absent, so add
them when you are ready:

| Feature | Variables |
| --- | --- |
| Google sign-in | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` |
| Real email | `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`, `STORE_NOTIFICATION_EMAIL` |
| Online payment | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_WEBHOOK_SECRET` |
| Generative assistant | `ANTHROPIC_API_KEY` |

Never add `SEED_ADMIN_EMAIL` here — seeding is a local operation, on purpose.

**Preview deployments.** Anything you push to a non-production branch builds
with the Preview environment, and that build runs `prisma migrate deploy`
against whatever database it is given. If you only ever push to `master` this
never comes up. If you do use branches, make a Neon branch for previews and
give Preview its own `DATABASE_URL` / `DIRECT_DATABASE_URL`. Do not let a
preview point at production.

---

## Step 4 — Seed the catalogue, once

The build deliberately never seeds — a build that re-seeds is a build that can
overwrite live data. Run it yourself, from your machine, against the
**direct** URL, once:

```bash
DATABASE_URL="<production-direct-url>" \
DIRECT_DATABASE_URL="<production-direct-url>" \
SEED_ADMIN_EMAIL="you@your-domain.com" \
npm run db:seed
```

On PowerShell:

```powershell
$env:DATABASE_URL="<production-direct-url>"
$env:DIRECT_DATABASE_URL="<production-direct-url>"
$env:SEED_ADMIN_EMAIL="you@your-domain.com"
npm run db:seed
```

`SEED_ADMIN_EMAIL` becomes the only admin account. Sign in at `/signin` with
that address to reach `/admin`; with SMTP configured the magic link arrives by
email, so use an address you can actually receive at.

---

## Step 5 — Verify the deployment

Work down this list; each line tells you which piece is wrong when it fails.

| Check | What a failure means |
| --- | --- |
| Build log shows `prisma migrate deploy` applying migrations | DB variables are right |
| Build log ends with `snapshotted N server action ids` | the build completed fully |
| `/` renders | the app is up |
| `/shop` lists products | `DATABASE_URL` is good **and** the seed ran. An error boundary on every product page is almost always the database, not the code |
| `/api/search?q=ramayana` returns results | case-insensitive search works (an empty-but-valid response is the classic regression) |
| `/signin` sends a magic link by email, not to the console | SMTP is configured |
| Google button appears and returns to *your* domain | OAuth origins and redirect URIs are registered |
| The assistant answers conversationally, not from canned text | `ANTHROPIC_API_KEY` is live and funded |
| `POST /api/razorpay/webhook` returns 401 without a signature | correct — that is the endpoint refusing an unsigned request |
| Razorpay dashboard → Webhooks shows 200s for a test delivery | the webhook secret matches |
| View source on a product page: canonical URL is your domain | `NEXT_PUBLIC_SITE_URL` was set *before* the build |

---

## The Render path (if you need a commercially-licensed free tier)

Same repository, same build, one service. Database still on Neon.

1. <https://dashboard.render.com> → **New + → Web Service** → connect the repo.
2. Branch `master`. **Runtime: Node.** Root Directory blank. Region: the same
   one you chose for Neon.
3. **Build Command:** `npm ci && npm run build`
4. **Start Command:** `npm start`
   (`next start` binds to Render's injected `PORT` automatically. If a health
   check ever fails on port binding, use `npm start -- -p $PORT`.)
5. There is **no publish/output directory** to set — that field belongs to
   Render's *Static Site* type, which cannot run this app. If you see it, you
   created the wrong service type.
6. Instance type: Free to try it, but see the spin-down warning above.
7. **Environment** (left menu) → add the same variables as the Vercel table.
   Render exposes them to both build and runtime, so there is no build/runtime
   split to configure. Two differences from Vercel:
   - `NEXT_PUBLIC_SITE_URL` is **mandatory** here. Vercel injects a fallback
     deployment URL; Render does not, so an unset value publishes
     `http://localhost:3000` into every canonical tag, OG image and sitemap
     entry on the live site. Nothing errors — the damage lands in Google.
   - Set both URL variables to `https://your-service.onrender.com` until you
     attach a custom domain.
8. Deploy, then seed once (Step 4) and verify (Step 5).
9. Point the Razorpay webhook at
   `https://your-service.onrender.com/api/razorpay/webhook`.

Render honours `engines.node` (`24.x`), so no `NODE_VERSION` variable is
needed.

---

## Pitfalls

Ordered roughly by how often they bite.

**`Environment variable not found: DIRECT_DATABASE_URL` during the build.**
The build runs migrations, so this variable is needed at *build* time, not just
at runtime. It is the single most common failed first deploy.

**A `NEXT_PUBLIC_*` change appears to do nothing.** Those values are compiled
into the JavaScript bundle by `next build`. Changing one requires a **new
build** — a Vercel redeploy, or on Render *Manual Deploy → Clear build cache &
deploy*. A restart is not enough.

**Environment changes don't apply to an existing deployment.** On Vercel,
adding a variable does not retro-fit the running build; redeploy. This catches
people who add `NEXT_PUBLIC_SITE_URL` after attaching a domain and see
`vercel.app` URLs persist.

**Pointing `DATABASE_URL` at the unpooled host.** Every serverless invocation
is its own process with its own connection. Without the pooler you will exhaust
Postgres' connection limit under any real traffic, and it will look like random
500s rather than a configuration mistake.

**`NEXTAUTH_URL` left at localhost in production.** Every sign-in link and
OAuth callback then points at the visitor's own machine. A *wrong* value here
is worse than an absent one — `trustHost: true` derives a correct origin from
the request when it is blank.

**Google `redirect_uri_mismatch`.** Google matches redirect URIs exactly, per
origin. Register `<origin>/api/auth/callback/google` for every origin you
serve: localhost, the platform domain, and the custom domain. Vercel preview
deployments get a new hostname each time, which Google cannot wildcard —
accept that Google sign-in works on Production only, or add a stable branch
alias and register that.

**Seeding from the pooled URL, or seeding on every build.** Seed through the
direct URL, by hand, once. Never add the seed to the build command.

**Render free tier cold starts.** Fifteen minutes idle → spun down → about a
minute to answer. Do not paper over this with an external pinger: it burns your
750 free instance-hours and Render's terms are explicit that the fix is a paid
instance. If the store is live, pay for the instance.

**Render free PostgreSQL expires after 30 days.** Do not host the database
there, even briefly. Neon has no expiry.

**Neon's free compute suspends after a few minutes idle.** It resumes in well
under a second on the next query, so this is usually invisible, but it is why
the very first request after a quiet night can feel a beat slow.

**The assistant's reply truncates on Vercel.** Hobby caps function duration
(10s by default, raisable to 60s). The assistant streams from the Anthropic
API, so if long replies cut off, add `export const maxDuration = 60;` to
`src/app/api/assistant/route.ts`. Everything else on the site answers well
inside the default.

**Deploying the app and the database in different regions.** Every query pays
the round trip, on a site that makes several per page. Match them.

**Treating a build failure as a code failure.** This build reads the database
(it pre-renders product, collection and journal pages from it). If the database
is unreachable, the *build* fails, in files that are perfectly correct.

---

## Routine maintenance

| Task | Command / action |
| --- | --- |
| Ship a change | push to `master` — migrations run automatically |
| Add a schema change | `npm run db:migrate` locally, commit the migration, push |
| Add a product | `/admin` on the live site |
| Rotate a secret | change it in the host's environment, then redeploy |
| Check before pushing | `npm run typecheck && npm run lint && npm test && npm run build`, then `npm start` + `npm run smoke` + `npm run audit:layout` |

---

## Sources

- [Vercel — supported Node.js versions](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions)
- [Vercel — Hobby plan](https://vercel.com/docs/plans/hobby) and [Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)
- [Render — deploy for free (spin-down, 750 instance hours, free database expiry)](https://render.com/docs/free)
