'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { TOASTER_WANTED } from '@/lib/toast';

const ToasterLayer = dynamic(() => import('./toaster-layer'), { ssr: false });

/**
 * The toast layer, kept out of the page until it is needed.
 *
 * A toast is only ever raised by something the visitor did (add to bag, save
 * to wishlist), so nothing needs the renderer during the load itself. This
 * listens for the first request from `@/lib/toast` and only then fetches and
 * mounts sonner.
 */
export function LazyToaster() {
  const [wanted, setWanted] = useState(false);

  useEffect(() => {
    const onWanted = () => setWanted(true);
    window.addEventListener(TOASTER_WANTED, onWanted);
    return () => window.removeEventListener(TOASTER_WANTED, onWanted);
  }, []);

  return wanted ? <ToasterLayer /> : null;
}
