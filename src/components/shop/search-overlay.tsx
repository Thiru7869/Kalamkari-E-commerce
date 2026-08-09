'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import type { SearchHit } from '@/app/api/search/route';
import { useTypewriter } from './use-typewriter';
import { searchPlaceholders } from '@/content/site';
import { cn, formatPrice } from '@/lib/utils';

/**
 * Search, opened over the page rather than instead of the page.
 *
 * Every search on this site used to be a navigation: the icon went to
 * `/search`, which meant that deciding to look for something cost you the page
 * you were reading and the scroll position you were at, and that changing your
 * mind cost another one going back. On a site whose whole argument is made in
 * long-form pages, that is an expensive way to answer "do they have anything
 * in indigo".
 *
 * So the panel opens in place, over whatever you were reading, and closing it
 * puts you back exactly where you were. Results arrive underneath as you type.
 *
 * Three things are deliberate:
 *
 *  - **The full page still exists.** Enter, or "see all", goes to `/search`
 *    with the query — that page has the filters, the pagination and the
 *    narrative note about commissioned motifs, and this panel does not try to
 *    reimplement any of it. It is a shortcut, not a replacement.
 *  - **Results are announced, not streamed.** The count is written into an
 *    `aria-live` region once each settled query resolves. Announcing every
 *    keystroke would make a screen reader unusable, which is the same reason
 *    the assistant announces a finished reply rather than tokens.
 *  - **Every request is superseded, not raced.** Typing "indigo" fires as many
 *    requests as it has letters; without the guard below, "ind" can land after
 *    "indigo" and the panel shows the wrong answer with the right query in the
 *    box.
 */

/** Quiet period after the last keystroke before anything is fetched. */
const DEBOUNCE_MS = 220;

/** Below this, the panel shows the suggestions instead of hunting. */
const MIN_QUERY = 2;

export function SearchOverlay({
  children,
  className,
}: {
  /** The trigger. Rendered as-is via Radix's `asChild`. */
  children: React.ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [total, setTotal] = useState(0);
  const [pending, setPending] = useState(false);
  /** Set once a query has actually resolved, so "nothing found" is truthful. */
  const [resolved, setResolved] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  /**
   * Monotonic request id. A response is only allowed to paint if it is the
   * newest one issued — see the note on racing above.
   */
  const issued = useRef(0);

  const placeholder = useTypewriter(searchPlaceholders, { active: open && query === '' });

  const trimmed = query.trim();

  // ---- Fetching ----------------------------------------------------------
  useEffect(() => {
    if (!open) return;

    if (trimmed.length < MIN_QUERY) {
      setHits([]);
      setTotal(0);
      setResolved(false);
      setPending(false);
      return;
    }

    const id = ++issued.current;
    const controller = new AbortController();
    setPending(true);

    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));

        const data = (await response.json()) as { hits: SearchHit[]; total: number };
        if (id !== issued.current) return;

        setHits(data.hits);
        setTotal(data.total);
        setResolved(true);
      } catch {
        // An aborted or failed lookup is not worth an error state: the panel
        // still has a working submit, and `/search` will answer properly.
        if (id !== issued.current) return;
        setHits([]);
        setTotal(0);
        setResolved(true);
      } finally {
        if (id === issued.current) setPending(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed, open]);

  // Reset between openings. A panel that reopens holding last week's search is
  // showing the visitor somebody else's intent.
  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery('');
      setHits([]);
      setTotal(0);
      setResolved(false);
      issued.current++;
    }
  }, []);

  const submit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      setOpen(false);
      router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
    },
    [router, trimmed],
  );

  const showSuggestions = trimmed.length < MIN_QUERY;
  const showEmpty = resolved && !pending && hits.length === 0 && !showSuggestions;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild className={className}>
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] bg-kasim-950/60 backdrop-blur-[3px] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out data-[state=open]:fade-in data-[state=open]:duration-200" />

        <Dialog.Content
          className={cn(
            'fixed inset-x-0 top-0 z-[81] mx-auto w-full max-w-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:pt-16',
            'data-[state=closed]:animate-out data-[state=open]:animate-in',
            'data-[state=closed]:fade-out data-[state=open]:fade-in',
            'data-[state=closed]:slide-out-to-top-3 data-[state=open]:slide-in-from-top-3',
            'data-[state=open]:duration-200 data-[state=closed]:duration-150',
          )}
          onOpenAutoFocus={(event) => {
            // Radix would focus the panel; the field is the only thing anyone
            // opened this for.
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <Dialog.Title className="sr-only">Search the catalogue</Dialog.Title>
          <Dialog.Description className="sr-only">
            Type to search by piece, motif, cloth or story. Results appear below as you
            type. Press Enter for the full results page.
          </Dialog.Description>

          <div className="overflow-hidden rounded-sm border border-border bg-background shadow-[0_50px_120px_-40px_rgb(0_0_0/0.75)]">
            {/* ---- The field ------------------------------------------- */}
            <form role="search" onSubmit={submit} className="relative border-b border-border">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-[1.15rem] w-[1.15rem] -translate-y-1/2 text-primary"
                aria-hidden="true"
              />

              <input
                ref={inputRef}
                type="search"
                name="q"
                autoComplete="off"
                aria-label="Search for a piece, motif or cloth"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={placeholder}
                className="h-14 w-full bg-transparent pl-12 pr-24 text-base outline-none placeholder:text-muted-foreground/75"
              />

              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                {pending && (
                  <Loader2
                    className="mr-1 h-4 w-4 animate-spin text-muted-foreground"
                    aria-hidden="true"
                  />
                )}
                <Dialog.Close className="inline-flex h-11 w-11 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <X className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
                  <span className="sr-only">Close search</span>
                </Dialog.Close>
              </div>
            </form>

            {/* ---- What came back -------------------------------------- */}
            <div className="max-h-[min(60vh,30rem)] overflow-y-auto overscroll-contain" data-lenis-prevent>
              {showSuggestions && <Suggestions onPick={setQuery} />}

              {showEmpty && (
                <div className="px-4 py-10 text-center">
                  <p className="font-display text-lg">Nothing under that name</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Almost everything here is one of one, so a piece you saw before may
                    already be gone. The four narrative traditions are painted to order
                    rather than stocked.
                  </p>
                  <Link
                    href="/custom"
                    onClick={() => setOpen(false)}
                    className="mt-4 inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    Have one painted for you
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              )}

              {hits.length > 0 && (
                <ul className="divide-y divide-border">
                  {hits.map((hit) => (
                    <li key={hit.slug}>
                      <Link
                        href={`/product/${hit.slug}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-foreground/[0.04] focus-visible:bg-foreground/[0.04] focus-visible:outline-none"
                      >
                        <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded-[2px] bg-cotton-200 dark:bg-kasim-800">
                          <Image
                            src={hit.image}
                            alt=""
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-display text-[1.0625rem] leading-snug">
                            {hit.name}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {hit.category}
                          </span>
                        </span>

                        <span className="shrink-0 text-right">
                          <span className="tabular block text-sm font-medium">
                            {formatPrice(hit.price)}
                          </span>
                          {hit.soldOut && (
                            <span className="mt-0.5 block text-[0.6875rem] uppercase tracking-[0.12em] text-muted-foreground">
                              Sold
                            </span>
                          )}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* ---- Through to the real page ---------------------------- */}
            {!showSuggestions && resolved && total > 0 && (
              <button
                type="button"
                onClick={submit}
                className="flex min-h-[3rem] w-full items-center justify-center gap-2 border-t border-border bg-secondary/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                See all {total} {total === 1 ? 'result' : 'results'}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>

          {/*
            One announcement per settled query, from a region that is never
            written to mid-flight. Announcing each keystroke's partial result
            would make this unusable with a screen reader.
          */}
          <p className="sr-only" role="status" aria-live="polite">
            {pending || !resolved
              ? ''
              : total === 0
                ? `No pieces found for ${trimmed}`
                : `${total} ${total === 1 ? 'piece' : 'pieces'} found for ${trimmed}`}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * What to try, before anything has been typed.
 *
 * The same seven the `/search` page offers, for the same reason: they teach the
 * dimensions this catalogue is genuinely searchable by — a story, a cloth, a
 * motif — rather than a line of instructional copy saying so.
 */
const SUGGESTIONS = [
  'Ramayana',
  'Tree of Life',
  'Tussar silk',
  'Indigo',
  'Peacock',
  'Cotton saree',
  'Krishna',
];

function Suggestions({ onPick }: { onPick: (value: string) => void }) {
  return (
    <div className="px-4 py-5">
      <p className="eyebrow text-[0.625rem]">Try one of these</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <li key={suggestion}>
            <button
              type="button"
              onClick={() => onPick(suggestion)}
              className="inline-flex min-h-[2.25rem] items-center rounded-sm border border-border bg-card px-3 text-sm transition-colors hover:border-primary/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
