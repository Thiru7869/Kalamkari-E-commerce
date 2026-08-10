import path from 'node:path';
import { defineConfig } from 'prisma/config';

/*
  Load .env ourselves.

  The moment a Prisma config file exists, the CLI stops reading .env for you —
  so `prisma migrate deploy` starts failing with "Environment variable not
  found: DIRECT_DATABASE_URL" against a .env that is sitting right there. This
  is the one piece of behaviour the package.json key was quietly providing.

  Node's own loader rather than a dotenv dependency, and guarded twice: the API
  landed in Node 20.12, and in production there is no .env file at all —
  Vercel injects the variables into the environment directly, and `loadEnvFile`
  throws rather than shrugging when the file is missing.
*/
if (typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile();
  } catch {
    // No .env on this machine. The variables are expected to be set already.
  }
}

/**
 * Prisma CLI configuration.
 *
 * This replaces the `"prisma"` key in package.json, which Prisma 6.19 warns
 * about on every single CLI invocation ("deprecated and will be removed in
 * Prisma 7") — twice per production build, since the build runs both
 * `generate` and `migrate deploy`.
 *
 * The only thing that key carried was the seed command, and it moves here
 * under `migrations`, where `prisma migrate reset` and `prisma db seed` both
 * still find it.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
