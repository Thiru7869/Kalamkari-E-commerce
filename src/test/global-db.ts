import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Vitest global setup for the integration suite: gives it a migrated database.
 * See vitest.integration.config.mts for the two modes.
 */

type Stoppable = { stop: () => Promise<void> };

let embedded: Stoppable | null = null;
let dataDir: string | null = null;

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(typeof address === 'object' && address ? address.port : 0));
    });
  });
}

function migrate(url: string) {
  // `shell: true` so `npx` resolves on Windows as well as POSIX.
  execFileSync('npx', ['prisma', 'migrate', 'deploy'], {
    env: { ...process.env, DATABASE_URL: url, DIRECT_DATABASE_URL: url },
    stdio: 'pipe',
    shell: true,
  });
}

export async function setup() {
  const provided = process.env.TEST_DATABASE_URL;
  if (provided) {
    migrate(provided);
    process.env.DATABASE_URL = provided;
    process.env.DIRECT_DATABASE_URL = provided;
    return;
  }

  const { default: EmbeddedPostgres } = await import('embedded-postgres');
  const port = await freePort();
  dataDir = mkdtempSync(join(tmpdir(), 'svl-int-pg-'));

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: 'svl',
    password: 'svl-test-only',
    port,
    persistent: false,
    // Windows initialises WIN1252 by default, which cannot store Indic text.
    initdbFlags: ['--encoding=UTF8', '--locale=C'],
    onLog: () => undefined,
    onError: () => undefined,
  });

  await pg.initialise();
  await pg.start();
  await pg.createDatabase('kalamkari_test');
  embedded = pg;

  const url = `postgresql://svl:svl-test-only@127.0.0.1:${port}/kalamkari_test?schema=public`;
  migrate(url);

  // Workers are spawned after this returns, so they inherit these.
  process.env.DATABASE_URL = url;
  process.env.DIRECT_DATABASE_URL = url;
}

export async function teardown() {
  if (embedded) await embedded.stop().catch(() => undefined);
  if (dataDir) rmSync(dataDir, { recursive: true, force: true });
}
