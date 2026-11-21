/**
 * Toasts, without the toast library in the page.
 *
 * `sonner` is about 33 KB, and nothing needs it until the visitor does
 * something that produces a message. Importing `toast` from it directly put
 * it in every page that has a product card, and the layout's `<Toaster>`
 * fetched it straight after hydration besides. This module exposes the two
 * calls the site uses and loads the library on the first one.
 *
 * The handshake matters: sonner drops a toast raised before a `<Toaster>` has
 * subscribed, so the first call asks the layout to mount the renderer and
 * waits until it says it is listening (`toaster-layer.tsx`).
 */

type Sonner = typeof import('sonner');
type Args = Parameters<Sonner['toast']['success']>;

export const TOASTER_WANTED = 'svl:toaster-wanted';
export const TOASTER_READY = 'svl:toaster-ready';

let ready = false;

/** Called by the mounted renderer once it is subscribed. */
export function markToasterReady() {
  ready = true;
  window.dispatchEvent(new Event(TOASTER_READY));
}

async function show(kind: 'success' | 'error', args: Args) {
  if (!ready) {
    await new Promise<void>((resolve) => {
      const onReady = () => {
        window.removeEventListener(TOASTER_READY, onReady);
        resolve();
      };
      window.addEventListener(TOASTER_READY, onReady);
      window.dispatchEvent(new Event(TOASTER_WANTED));
    });
  }
  const { toast } = await import('sonner');
  toast[kind](...args);
}

export const toast = {
  success: (...args: Args) => void show('success', args),
  error: (...args: Args) => void show('error', args),
};
