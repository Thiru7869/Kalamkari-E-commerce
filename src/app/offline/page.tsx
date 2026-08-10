import type { Metadata } from 'next';
import Link from 'next/link';
import { WifiOff } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Offline',
  robots: { index: false, follow: false },
};

/**
 * Served by the service worker when a navigation fails and there is no cached
 * copy of the requested page. Kept entirely static so it works with no network
 * and no JavaScript execution beyond the shell.
 */
export default function OfflinePage() {
  return (
    <div className="container section-y-lg">
      <div className="mx-auto max-w-md text-center">
        <WifiOff className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <h1 className="mt-5 text-display-md">You are offline</h1>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          This page has not been saved to your device. Pages you have already visited will
          still open — and everything will come back as soon as you have a connection.
        </p>
        <p className="mt-6">
          <Link href="/" className="text-primary underline underline-offset-4">
            Try the home page
          </Link>
        </p>
      </div>
    </div>
  );
}
