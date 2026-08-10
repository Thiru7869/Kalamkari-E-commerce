'use client';

import { useEffect } from 'react';

/**
 * The last resort.
 *
 * `error.tsx` catches anything thrown inside a page, but it renders *into* the
 * root layout — so it cannot catch the root layout itself. If a provider, a
 * font or the header throws, Next falls back to its own unstyled default page,
 * which says "Application error: a client-side exception has occurred" and
 * carries no route back to the store.
 *
 * This replaces that. It has to render its own <html> and <body>, because the
 * layout that would normally supply them is the thing that failed.
 *
 * Everything here is inline and self-contained on purpose: this page has to
 * work in exactly the situation where the stylesheet, the font variables and
 * the theme provider may all be unavailable. No imports from the design
 * system, no Tailwind classes, no Link — a plain anchor does a full navigation,
 * which is the correct behaviour when the app shell is broken anyway.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Replace with your error reporting service. The digest is the only part
    // safe to show a visitor — the message may contain internals.
    console.error('Root layout error:', error);
  }, [error]);

  return (
    <html lang="en-IN">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1.25rem',
          background: '#F4EDE0',
          color: '#22201D',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        <main style={{ maxWidth: '32rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: 600, margin: 0 }}>
            Something went wrong at our end
          </h1>

          <p style={{ marginTop: '1rem', lineHeight: 1.7, color: '#5C544B' }}>
            Not your fault. Reload the page — and if it keeps happening, tell us and we
            will fix it.
          </p>

          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
            }}
          >
            <button
              type="button"
              onClick={reset}
              style={{
                minHeight: '2.75rem',
                padding: '0 1.5rem',
                border: 0,
                borderRadius: 2,
                background: '#A94434',
                color: '#FDFBF6',
                font: 'inherit',
                fontSize: '1rem',
                cursor: 'pointer',
              }}
            >
              Try again
            </button>

            {/*
              A plain <a>, not next/link, and the rule is disabled rather than
              satisfied. next/link does a client-side navigation through the
              router — the same router living inside the React tree that has
              just failed hard enough to reach this boundary. A full document
              load is the only thing here that is guaranteed to work, and it is
              what we actually want: rebuild the app shell from scratch.
            */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              style={{
                minHeight: '2.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 1.5rem',
                border: '1px solid #C9BFAE',
                borderRadius: 2,
                color: 'inherit',
                textDecoration: 'none',
                fontSize: '1rem',
              }}
            >
              Back to the store
            </a>
          </div>

          {error.digest && (
            <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#7A7166' }}>
              Reference: {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
