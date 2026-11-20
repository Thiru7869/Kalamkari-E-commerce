'use client';

import dynamic from 'next/dynamic';

/**
 * The toast layer, kept out of the initial bundle.
 *
 * A toast is only ever raised by something the visitor did (add to bag, save to
 * wishlist), so nothing needs the renderer during the load itself. Loading it
 * through a dynamic import takes sonner out of the shared chunk every page
 * downloads and parses before it can respond to a tap, and pulls it in right
 * after hydration instead.
 */
const Toaster = dynamic(() => import('sonner').then((m) => m.Toaster), { ssr: false });

export function LazyToaster() {
  return (
    <Toaster
      position="bottom-center"
      // Clear of the phone tab bar.
      offset={88}
      toastOptions={{
        classNames: {
          toast: 'font-sans rounded-sm border border-border bg-card text-card-foreground',
          description: 'text-muted-foreground',
        },
      }}
    />
  );
}
