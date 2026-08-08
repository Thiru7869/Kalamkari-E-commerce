/**
 * Snapshots the server-action manifest immediately after a build.
 *
 * The smoke test drives real server actions over HTTP, which means it needs the
 * action id Next assigns to each one. Those ids live in
 * `.next/server/server-reference-manifest.json` — but that file is written for
 * the running server's benefit, not ours, and a server started against the
 * build can rewrite it to contain only the actions it has had reason to load.
 * Reading it after the server is up therefore finds a subset, and the smoke
 * test fails with "no action id for placeOrder" on a build where placeOrder is
 * perfectly fine.
 *
 * So this copies the complete map out at the one moment it is guaranteed
 * complete: the end of the build, before anything has served a request.
 *
 * Runs as part of `npm run build`. Failing to write the snapshot is not fatal —
 * a deployment does not need it, only the smoke test does.
 */

import { readFileSync, writeFileSync } from 'node:fs';

const SOURCE = new URL('../.next/server/server-reference-manifest.json', import.meta.url);
const TARGET = new URL('../.next/smoke-action-ids.json', import.meta.url);

try {
  const manifest = JSON.parse(readFileSync(SOURCE, 'utf8'));

  const ids = {};
  for (const [id, entry] of Object.entries(manifest.node ?? {})) {
    if (entry?.exportedName) ids[entry.exportedName] = id;
  }
  for (const [id, entry] of Object.entries(manifest.edge ?? {})) {
    if (entry?.exportedName) ids[entry.exportedName] = id;
  }

  writeFileSync(TARGET, JSON.stringify(ids, null, 2));
  console.log(`  snapshotted ${Object.keys(ids).length} server action ids`);
} catch (error) {
  console.warn('  could not snapshot server action ids:', error.message);
}
