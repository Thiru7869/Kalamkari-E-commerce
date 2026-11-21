'use client';

import Link, { useLinkStatus } from 'next/link';
import { cn } from '@/lib/utils';

/** Reads the navigation's state from inside the link, so it can say it is working. */
function Pending({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus();
  return (
    <span className={cn('inline-flex items-center justify-center', pending && 'animate-pulse')} aria-busy={pending}>
      {children}
    </span>
  );
}

/**
 * One link in the catalogue's pager.
 *
 * A real anchor — it can be opened in a new tab, shared, and followed by a
 * crawler — that Next turns into a transition. The server answers with the
 * next eight pieces; until it does, the number pulses so the tap is visibly
 * received on a slow connection, where there is otherwise nothing to see.
 */
export function PagerLink({
  href,
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Link>, 'scroll' | 'prefetch'>) {
  return (
    <Link href={href} className={className} prefetch={false} {...props}>
      <Pending>{children}</Pending>
    </Link>
  );
}
