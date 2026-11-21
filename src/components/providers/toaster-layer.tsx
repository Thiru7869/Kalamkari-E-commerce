'use client';

import { useEffect } from 'react';
import { Toaster } from 'sonner';
import { markToasterReady } from '@/lib/toast';

/**
 * The renderer. Mounted by `LazyToaster` the first time a toast is raised.
 * Effects run child-first, so by the time this one fires the `Toaster` below
 * has subscribed and a toast raised now will be shown.
 */
export default function ToasterLayer() {
  useEffect(() => markToasterReady(), []);

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
