import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Wordmark } from '@/components/layout/wordmark';
import { authProviders } from '@/auth';

export const metadata: Metadata = {
  title: 'Check your email',
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-cotton-100 px-5 py-16 dark:bg-background">
      <Link href="/" className="mb-10">
        <Wordmark />
      </Link>

      <div className="w-full max-w-sm rounded-sm border border-border bg-background p-8 text-center">
        <Mail className="mx-auto h-8 w-8 text-primary" aria-hidden="true" />
        <h1 className="mt-5 text-display-sm">Check your email</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          We have sent a sign-in link. Open it on this device and you will be signed in —
          the link works once and expires shortly.
        </p>

        {!authProviders.smtp && process.env.NODE_ENV !== 'production' && (
          <p className="mt-5 rounded-sm border border-myrobalan-500/40 bg-myrobalan-100 p-3 text-left text-xs leading-relaxed text-myrobalan-900 dark:bg-myrobalan-950 dark:text-myrobalan-100">
            <strong>Development mode:</strong> nothing was actually emailed. The link is in
            your terminal, in the <code>npm run dev</code> output.
          </p>
        )}

        <p className="mt-6 text-sm text-muted-foreground">
          Nothing arrived? Check spam, then{' '}
          <Link href="/signin" className="text-primary underline underline-offset-4">
            request another
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
