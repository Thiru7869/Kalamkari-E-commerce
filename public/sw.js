/* eslint-disable no-restricted-globals */

/**
 * Service worker for Sri Vijaya Lakshmi Fine Kalamkari Arts.
 *
 * Deliberately conservative. An e-commerce site that serves stale prices,
 * stale stock on one-of-one pieces, or a cached signed-in state is worse than
 * one that simply fails offline. So:
 *
 *   - Navigations and API calls: network-first, cache only as an offline
 *     fallback. Never used while the network is available.
 *   - Static build assets (/_next/static/*): cache-first — they are
 *     content-hashed and therefore immutable.
 *   - Images: stale-while-revalidate, capped, since they are the heavy part
 *     and rarely change under a given URL.
 *   - Anything authenticated, any POST, any cart or checkout route: never
 *     cached at all.
 */

const VERSION = 'svl-v1';
const SHELL_CACHE = `${VERSION}-shell`;
const STATIC_CACHE = `${VERSION}-static`;
const IMAGE_CACHE = `${VERSION}-images`;

const OFFLINE_URL = '/offline';
const MAX_IMAGE_ENTRIES = 80;

/** Routes whose responses must never be stored. */
const NEVER_CACHE = [/^\/api\//, /^\/cart/, /^\/checkout/, /^\/account/, /^\/admin/, /^\/signin/];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([OFFLINE_URL]))
      // A missing offline page must not prevent the worker installing.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => !key.startsWith(VERSION)).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

/** Trim a cache to a maximum number of entries, oldest first. */
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  await Promise.all(keys.slice(0, keys.length - maxEntries).map((key) => cache.delete(key)));
}

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Third-party requests are left entirely alone.
  if (url.origin !== self.location.origin) return;

  if (NEVER_CACHE.some((pattern) => pattern.test(url.pathname))) return;

  // Immutable, content-hashed build output.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ??
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
            return response;
          }),
      ),
    );
    return;
  }

  // Images: serve what we have, refresh in the background.
  if (
    request.destination === 'image' ||
    url.pathname.startsWith('/_next/image') ||
    /\.(?:png|jpe?g|webp|avif|gif|svg)$/i.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
              trimCache(IMAGE_CACHE, MAX_IMAGE_ENTRIES);
            }
            return response;
          })
          .catch(() => cached);
        return cached ?? network;
      }),
    );
    return;
  }

  // Page navigations: always try the network first. Prices and stock matter.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached ?? (await caches.match(OFFLINE_URL)) ?? Response.error();
        }),
    );
  }
});

// Lets the page trigger an immediate update instead of waiting for all tabs
// to close after a deploy.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
