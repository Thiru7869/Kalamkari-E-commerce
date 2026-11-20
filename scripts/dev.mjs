/**
 * `npm run dev` — one command from a fresh clone to a running site.
 *
 * 1. Makes a `.env` from `.env.example` if there is none.
 * 2. If that `.env` has no real database URL, starts a local PostgreSQL
 *    (embedded-postgres, data kept in `.local-db/`), applies the migrations and,
 *    on the very first run, seeds the catalogue.
 * 3. Starts `next dev`, and stops the database when you press Ctrl+C.
 *
 * A `.env` that already points at a real database (Neon, your own Postgres) is
 * respected: nothing is started, created or changed, and this just runs Next.
 * It is real PostgreSQL either way — see CLAUDE.md on why not SQLite.
 */

import { execSync, spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const envPath = resolve(root, '.env');
const dataDir = resolve(root, '.local-db');
const PORT = 54320;
const DB = 'kalamkari_dev';
const localUrl = `postgresql://svl:svl-local-dev@127.0.0.1:${PORT}/${DB}?schema=public`;

const log = (m) => console.log(`\x1b[36m[dev]\x1b[0m ${m}`);

/** The value of KEY in a dotenv text, or ''. */
function read(text, key) {
  const m = new RegExp(`^${key}=(.*)$`, 'm').exec(text);
  return m ? m[1].trim().replace(/^["']|["']$/g, '') : '';
}

function set(text, key, value) {
  const line = `${key}="${value}"`;
  return new RegExp(`^${key}=.*$`, 'm').test(text)
    ? text.replace(new RegExp(`^${key}=.*$`, 'm'), line)
    : `${text.trimEnd()}\n${line}\n`;
}

const isReal = (url) => Boolean(url) && !/USER:PASSWORD|HOST[-.]/.test(url);

/* ------------------------------ 1. .env file ------------------------------ */

if (!existsSync(envPath)) {
  writeFileSync(envPath, readFileSync(resolve(root, '.env.example'), 'utf8'));
  log('Created .env from .env.example');
}

let env = readFileSync(envPath, 'utf8');
let changed = false;

if (read(env, 'AUTH_SECRET').length < 32) {
  env = set(env, 'AUTH_SECRET', randomBytes(32).toString('base64'));
  changed = true;
  log('Generated an AUTH_SECRET');
}

const useLocalDb = !isReal(read(env, 'DATABASE_URL'));
if (useLocalDb) {
  env = set(env, 'DATABASE_URL', localUrl);
  env = set(env, 'DIRECT_DATABASE_URL', localUrl);
  changed = true;
}
if (changed) writeFileSync(envPath, env);

// Tell the child processes the same thing the file now says.
const childEnv = { ...process.env };
for (const key of ['DATABASE_URL', 'DIRECT_DATABASE_URL', 'AUTH_SECRET']) {
  childEnv[key] = read(env, key);
}

/* ---------------------------- 2. local database --------------------------- */

let pg = null;

if (useLocalDb || read(env, 'DATABASE_URL') === localUrl) {
  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const fresh = !existsSync(resolve(dataDir, 'PG_VERSION'));

  pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'svl',
    password: 'svl-local-dev',
    port: PORT,
    persistent: true,
    // Windows initialises WIN1252, which cannot store the Telugu in the catalogue.
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    onLog: () => undefined,
    onError: () => undefined,
  });

  try {
    if (fresh) {
      log('Setting up a local PostgreSQL in .local-db/ (first run only)…');
      await pg.initialise();
    }
    await pg.start();
    if (fresh) await pg.createDatabase(DB);
    log(`PostgreSQL running on port ${PORT}`);
  } catch (error) {
    console.error(
      `\n[dev] Could not start the local database on port ${PORT}.\n` +
        `      Another copy of "npm run dev" may already be running, or the port is taken.\n` +
        `      ${error?.message ?? error}\n`,
    );
    process.exit(1);
  }
}

const run = (command) => execSync(command, { cwd: root, env: childEnv, stdio: 'inherit' });

try {
  log('Applying database migrations…');
  run('npx prisma generate');
  run('npx prisma migrate deploy');

  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient({ datasources: { db: { url: childEnv.DATABASE_URL } } });
  const products = await prisma.product.count().catch(() => 0);
  await prisma.$disconnect();
  if (products === 0) {
    log('Seeding the catalogue (first run only)…');
    run('npm run db:seed');
  }
} catch (error) {
  console.error(`\n[dev] Database setup failed: ${error?.message ?? error}\n`);
  if (pg) await pg.stop().catch(() => undefined);
  process.exit(1);
}

/* ------------------------------- 3. Next dev ------------------------------ */

// No port is pinned: Next starts on 3000 and moves up to the next free port
// if it is taken. An explicit -p / --port on the command line still wins.
const extra = process.argv.slice(2);
const next = spawn('npx', ['next', 'dev', ...extra], {
  cwd: root,
  env: childEnv,
  stdio: 'inherit',
  shell: true,
});

let stopping = false;
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  if (process.platform === 'win32') {
    try {
      execSync(`taskkill /pid ${next.pid} /T /F`, { stdio: 'ignore' });
    } catch {
      // already gone
    }
  } else {
    next.kill('SIGTERM');
  }
  if (pg) await pg.stop().catch(() => undefined);
  process.exit(code);
}

next.on('exit', (code) => void shutdown(code ?? 0));
process.on('SIGINT', () => void shutdown(0));
process.on('SIGTERM', () => void shutdown(0));
