'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp, ArrowUpRight, MessageCircle, Mic, Square, X } from 'lucide-react';
import {
  assistantIdentity,
  bookingActions,
  bookingIntent,
  starterPrompts,
} from '@/content/assistant';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * The store assistant.
 *
 * Design intent: it should read like being handed to someone at a counter, not
 * like a support widget. So — a bamboo-nib mark rather than a speech bubble, a
 * cloth-coloured panel rather than a white card, no proactive pop-up, and one
 * plain sentence disclosing what it is before the visitor types anything.
 *
 * On phones it takes the bottom sheet an app would use, sized to leave the
 * page visible above it; on desktop it is a panel anchored to the launcher.
 */

type Role = 'user' | 'assistant';

type Message = {
  id: string;
  role: Role;
  content: string;
  /** Attached by the offline engine when it has a page worth pointing at. */
  link?: { label: string; href: string };
};

const HISTORY_LIMIT = 20;

/** How long a pair of suggestions stays before the next pair takes its place. */
const SUGGESTION_ROTATE_MS = 2000;

/**
 * Has the visitor started asking to order something rather than to understand
 * something?
 *
 * Matched against their own words. See `bookingIntent` for why the list is
 * deliberately narrow and why "price" is not in it.
 */
function wantsToOrder(text: string) {
  const t = text.toLowerCase();
  return bookingIntent.some((phrase) => t.includes(phrase));
}

/** Turns bare site paths in the model's text into real links. */
function renderWithLinks(text: string) {
  const parts = text.split(/(\/(?:process|our-story|shop|custom|care|shipping|journal|contact|product)[a-z0-9/-]*)/gi);

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <Link
          key={i}
          href={part}
          className="font-medium text-primary underline underline-offset-2"
        >
          {part}
        </Link>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function newId() {
  return Math.random().toString(36).slice(2);
}

/**
 * The two places a person can actually start an order.
 *
 * Links, not chat messages — the handover to a human happens on a page.
 *
 * ---------------------------------------------------------------------------
 * Nothing closes the panel here, and that is deliberate
 * ---------------------------------------------------------------------------
 *
 * The obvious addition is `onClick={() => setOpen(false)}` so the sheet gets
 * out of the way. It is not here for two reasons. It is redundant — the
 * `pathname` effect already closes the panel on every route change, which is
 * the correct place for it because it fires *after* the navigation rather than
 * alongside it. And it is a hazard: closing the panel unmounts the portal these
 * anchors live in, in the same commit as the click, which is a good way to lose
 * the navigation the click was for.
 *
 * Verified end to end — pressing "Have a piece painted for you" lands on
 * `/custom` and the panel is gone when it gets there.
 */
function BookingActions() {
  return (
    <div className="pt-1">
      <p className="font-inscription text-label uppercase tracking-[0.16em] text-muted-foreground">
        To start one
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {bookingActions.map((action) => (
          <li key={action.href}>
            <Link
              href={action.href}
              className="group flex min-h-[2.75rem] items-center gap-3 rounded-sm border border-primary/35 bg-primary/[0.06] px-3 py-2 text-left transition-colors hover:border-primary/60 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium leading-snug text-foreground">
                  {action.label}
                </span>
                <span className="mt-0.5 block text-label leading-snug text-muted-foreground">
                  {action.hint}
                </span>
              </span>
              <ArrowUpRight
                className="h-4 w-4 shrink-0 text-primary transition-transform duration-300 motion-safe:group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Two suggestions, in two rows, changing every couple of seconds.
 *
 * Two rather than all eight because the panel opens on a phone at 78svh with a
 * greeting, a disclosure and a composer already in it — four buttons filled the
 * remaining space and turned an invitation into a form. Two is a pair of
 * examples; the rotation is what keeps it from also being a narrow one.
 *
 * ---------------------------------------------------------------------------
 * Reduced motion shows all eight instead
 * ---------------------------------------------------------------------------
 *
 * This is the site's rule applied literally: decorative motion stops, but
 * scroll- or time-driven *content* must still resolve to its full state. The
 * rotation is not decoration — it is the only way the other six questions are
 * ever seen — so switching it off has to be paired with showing them, or a
 * reduced-motion reader silently loses three quarters of the content.
 *
 * The buttons carry no `key` tied to the text, so React updates the label in
 * place rather than remounting: the pair cross-fades instead of the list
 * reflowing, and a button under the pointer stays the same DOM node.
 */
function Suggestions({
  pair,
  ordering,
  onAsk,
  onHoverChange,
}: {
  pair: number;
  ordering: boolean;
  onAsk: (prompt: string) => void;
  onHoverChange: (hovering: boolean) => void;
}) {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  // Ordering wins over everything: the visitor has stopped browsing.
  if (ordering) return <BookingActions />;

  const shown = reduced
    ? [...starterPrompts]
    : [starterPrompts[pair], starterPrompts[(pair + 1) % starterPrompts.length]];

  return (
    <div
      className="pt-1"
      onMouseEnter={() => onHoverChange(true)}
      onMouseLeave={() => onHoverChange(false)}
      onFocusCapture={() => onHoverChange(true)}
      onBlurCapture={() => onHoverChange(false)}
    >
      <ul className="flex flex-col gap-2">
        {shown.map((prompt, i) => (
          <li key={reduced ? prompt : i}>
            <button
              type="button"
              onClick={() => onAsk(prompt)}
              className={cn(
                'w-full rounded-sm border border-border bg-background px-3 py-2 text-left text-sm leading-snug',
                'transition-colors hover:border-primary/40 hover:bg-primary/5',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              )}
            >
              {prompt}
            </button>
          </li>
        ))}
      </ul>

      {/*
        The pair is not announced as it changes.

        A live region here would read two new questions aloud every two seconds,
        which is the `aria-live` failure this codebase already documents for
        streaming replies. A screen reader user gets the full list instead —
        `prefers-reduced-motion` is commonly set alongside, and the composer
        below is the real affordance in any case.
      */}
    </div>
  );
}

export function StoreAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /**
   * What the screen reader is told. Written once, when a reply is complete —
   * never during streaming. Kept separate from `messages` so re-rendering the
   * transcript cannot re-trigger an announcement.
   */
  const [announcement, setAnnouncement] = useState('');

  /**
   * Which pair of suggestions is showing.
   *
   * An index into `starterPrompts`, stepping by two. See the rotation effect.
   */
  const [pair, setPair] = useState(0);
  /** Latched once the visitor asks to order something. Never unlatched. */
  const [ordering, setOrdering] = useState(false);
  /** The pointer is over the suggestions, so the rotation holds still. */
  const [hoveringPrompts, setHoveringPrompts] = useState(false);

  /**
   * `document.body` does not exist while the tree is being described on the
   * server, and `createPortal` needs a real node. This component is already
   * `ssr: false` at its import site, but that is the dock's decision to make
   * and not something this file should depend on.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const panelId = useId();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close on route change: the visitor acted on something the assistant said,
  // and leaving the panel over the new page hides the thing they asked for.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  /*
    The two suggestions, changing every couple of seconds.

    Four conditions stop it, and each is a real one rather than a precaution:

      - **The panel is shut.** A timer running behind a closed sheet is pure
        waste on a control that sits on every page of the site.
      - **The conversation has started.** The suggestions are only rendered
        while `messages` is empty; rotating an unmounted list is the same waste.
      - **The pointer is on them.** Text that changes under a cursor about to
        click it is the oldest trap in this pattern — the visitor presses one
        question and sends another.
      - **Reduced motion.** Content that swaps itself on a timer is movement,
        and a reader who asked for less of it should get the first pair and be
        left alone. This is not a decorative animation that can simply be
        skipped: the other six questions have to stay reachable, so under
        reduced motion the panel shows all eight at once instead. Nothing is
        lost, which is the rule for reduced motion on this site.
  */
  useEffect(() => {
    if (!open || messages.length > 0 || ordering || hoveringPrompts) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = setInterval(() => {
      setPair((p) => (p + 2) % starterPrompts.length);
    }, SUGGESTION_ROTATE_MS);
    return () => clearInterval(id);
  }, [open, messages.length, ordering, hoveringPrompts]);

  // A fresh panel starts at the first pair rather than wherever the last
  // conversation left the rotation.
  useEffect(() => {
    if (open) setPair(0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keep the newest message in view while it streams in.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (question: string) => {
      const trimmed = question.trim();
      if (!trimmed || streaming) return;

      /*
        Latch the ordering intent from the visitor's own words.

        This changes what is offered *alongside* the answer; it does not
        intercept the question. Lakshmi still answers "can you paint something
        to my own design" properly — she simply also puts the two places a
        person can actually start one in front of the reader, because she is
        explicitly not allowed to agree a price or a date herself.

        Latched, never unlatched: somebody who has said "commission" once is in
        that conversation now, and taking the links away again when their next
        message happens not to contain a keyword would be worse than leaving
        them.
      */
      if (wantsToOrder(trimmed)) setOrdering(true);

      setError(null);
      setInput('');
      setAnnouncement('');

      const history = [...messages, { id: newId(), role: 'user' as const, content: trimmed }];
      const replyId = newId();

      // Accumulated separately from state so the completion announcement has
      // the whole reply without having to read it back out of `messages`.
      let replyText = '';

      setMessages([...history, { id: replyId, role: 'assistant', content: '' }]);
      setStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            messages: history
              .slice(-HISTORY_LIMIT)
              .map(({ role, content }) => ({ role, content })),
          }),
        });

        if (!response.ok || !response.body) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? 'The assistant is unreachable just now.');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        // Parse SSE frames incrementally — a chunk boundary can land anywhere,
        // including mid-frame, so only complete `\n\n`-terminated frames are
        // consumed and the remainder stays buffered.
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split('\n\n');
          buffer = frames.pop() ?? '';

          for (const frame of frames) {
            const eventLine = frame.match(/^event: (.+)$/m)?.[1];
            const dataLine = frame.match(/^data: (.+)$/m)?.[1];
            if (!eventLine || !dataLine) continue;

            const payload = JSON.parse(dataLine);

            if (eventLine === 'delta') {
              replyText += payload.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === replyId ? { ...m, content: m.content + payload.text } : m,
                ),
              );
            } else if (eventLine === 'done' && payload.link) {
              setMessages((prev) =>
                prev.map((m) => (m.id === replyId ? { ...m, link: payload.link } : m)),
              );
            }
          }
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message);
        setAnnouncement((err as Error).message);
        setMessages((prev) => prev.filter((m) => m.id !== replyId || m.content));
      } finally {
        setStreaming(false);
        abortRef.current = null;
        // One announcement, after the reply has finished arriving.
        if (replyText) setAnnouncement(replyText);
      }
    },
    [messages, streaming],
  );

  const stop = () => {
    abortRef.current?.abort();
    setStreaming(false);
  };

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        className={cn(
          /*
            A circle on a phone, a labelled pill from `sm` up.

            The pill is 132px wide, and it is fixed over the bottom-right of a
            390px screen — which is exactly where the hero's primary call to
            action sits when the page is at rest. "Ask Lakshmi" was drawn on
            top of "See what is in the store", so the one control the whole
            hero is built to earn was partly buried by a launcher for a
            secondary one. A 48px circle clears it, and costs nothing: the
            label is still announced, and there is room for the words again as
            soon as there is a screen wide enough to spare them.
          */
          'group pointer-events-auto relative flex h-12 items-center justify-center rounded-full',
          'w-12 sm:w-auto sm:justify-start sm:gap-2.5 sm:pl-3.5 sm:pr-4',
          'border border-primary/25 bg-primary text-primary-foreground',
          'shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.7)]',
          'transition-transform duration-300 ease-out hover:scale-[1.03]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          open && 'scale-95',
        )}
      >
        {open ? (
          <X className="h-[1.15rem] w-[1.15rem] shrink-0" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-[1.15rem] w-[1.15rem] shrink-0" aria-hidden="true" />
        )}
        <span className="sr-only font-inscription text-sm tracking-[0.06em] sm:not-sr-only">
          {open ? 'Close' : assistantIdentity.label}
        </span>
      </button>

      {/*
        Panel

        Portalled to <body>, and that is load-bearing rather than tidiness.

        This component is rendered inside `FloatingDock`, whose column carries
        `translate-y-0` so it can slide away on a phone. A transform on an
        ancestor makes that ancestor the containing block for every
        `position: fixed` descendant — so `inset-x-0 bottom-0` on the sheet
        below resolved against a 48px-wide column pinned to the right margin,
        not against the viewport. The chat panel opened 48px wide and 658px
        tall: a vertical ribbon of clipped words, on the one control that is
        supposed to answer questions. The `md:hidden` scrim was constrained the
        same way and covered nothing.

        Portalling also takes the panel out of the `inert` the dock sets on
        itself while retracted, which would otherwise make an open panel
        unfocusable the moment the reader scrolled down behind it.
      */}
      {open && mounted && createPortal(
        <>
          {/* Scrim, phones only — the sheet covers enough of the screen that the
              page behind it should stop competing for attention. */}
          <div
            className="fixed inset-0 z-40 bg-kasim-950/40 backdrop-blur-[2px] md:hidden"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div
            id={panelId}
            role="dialog"
            aria-modal="false"
            aria-label={`${assistantIdentity.label}, ${assistantIdentity.role}`}
            className={cn(
              'pointer-events-auto fixed z-50 flex flex-col overflow-hidden',
              'border border-border bg-cotton-50 shadow-2xl dark:bg-card',
              // Phone: bottom sheet, clear of the tab bar.
              'inset-x-0 bottom-0 h-[78svh] rounded-t-xl',
              // Desktop: anchored panel above the launcher.
              'md:inset-x-auto md:bottom-24 md:right-6 md:h-[min(34rem,72svh)] md:w-[24.5rem] md:rounded-sm',
              // Comes up out of the launcher rather than fading in where it
              // already was. See the `panel-open` keyframe note.
              'motion-safe:animate-panel-open',
            )}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border bg-kasim-900 px-4 py-3 text-cotton-100">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cotton-50/10"
                aria-hidden="true"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-myrobalan-300" fill="none">
                  <path
                    d="M17.8 3.4 20.6 6.2 9.9 16.9l-4.2 1.4 1.4-4.2z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M3.4 21c2.6-1.5 5.2-1.5 7.8 0s5.2 1.5 7.8 0"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    opacity="0.6"
                  />
                </svg>
              </span>
              {/*
                The store's name in full, at every width — phones included.

                It used to read "Store assistant · Srikalahasti", which names
                the job and the town but never the shop. A visitor who opens a
                chat panel on a phone should be able to see whose shop they
                have walked into without going back to the header, and on a
                phone the header wordmark is behind the sheet.

                Not `truncate`. "Sri Vijaya Lakshmi Fine Kalamkari Arts" is
                thirty-eight characters and truncating it produces "Sri Vijaya
                Lakshmi Fine Kalam…", which is worse than the line it replaced.
                It wraps to two lines on the narrowest phone instead, which the
                header has the room for. The role is still announced — it is in
                this dialog's `aria-label`.
              */}
              {/*
                "Ask Lakshmi", not "Lakshmi".

                A bare name is a signature; the invitation is the point of the
                panel, and it is the same words the launcher says — so opening
                the sheet confirms the visitor pressed what they meant to press
                rather than presenting them with a slightly different label.
                `assistantIdentity.label` is the single source for both.
              */}
              <div className="min-w-0">
                <p className="font-display text-lg leading-none">{assistantIdentity.label}</p>
                <p className="mt-1 font-inscription text-label uppercase leading-snug tracking-[0.12em] text-cotton-200/70">
                  {site.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="ml-auto -mr-1.5 flex h-9 w-9 items-center justify-center rounded-sm transition-colors hover:bg-cotton-50/10"
              >
                <X className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">Close the assistant</span>
              </button>
            </div>

            {/* Transcript */}
            {/*
              The transcript is deliberately NOT a live region. Streaming text
              into one makes a screen reader announce every few tokens, which
              turns a two-sentence answer into a minute of interruption. The
              reply is announced once, complete, from the region below.
            */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-4 overflow-y-auto px-4 py-4"
              // Lenis must not swallow this element's scroll.
              data-lenis-prevent
            >
              <p className="rounded-sm border border-border bg-muted/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                {assistantIdentity.disclosure}
              </p>

              {messages.length === 0 && (
                <>
                  <p className="text-sm leading-relaxed">{assistantIdentity.greeting}</p>
                  <Suggestions
                    pair={pair}
                    ordering={ordering}
                    onAsk={(prompt) => void send(prompt)}
                    onHoverChange={setHoveringPrompts}
                  />
                </>
              )}

              {/*
                The ordering pair, once the conversation is under way.

                Above, it replaces the suggestions before anybody has typed. Here
                it sits under the transcript, because a visitor who asked about a
                commission three messages ago should not have to scroll back to
                the top of the panel to find the way through to it.
              */}
              {messages.length > 0 && ordering && (
                <BookingActions />
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'max-w-[88%] rounded-sm px-3.5 py-2.5 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-muted/60 text-foreground',
                  )}
                >
                  <p className="whitespace-pre-wrap">
                    {message.role === 'assistant'
                      ? renderWithLinks(message.content)
                      : message.content}
                  </p>

                  {message.content === '' && streaming && (
                    <span className="flex gap-1 py-1" aria-label="Thinking">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground/40"
                          style={{ animationDelay: `${i * 160}ms` }}
                        />
                      ))}
                    </span>
                  )}

                  {message.link && (
                    <Link
                      href={message.link.href}
                      className="mt-2.5 inline-flex text-sm font-medium text-primary underline underline-offset-4"
                    >
                      {message.link.label} →
                    </Link>
                  )}
                </div>
              ))}

              {error && (
                <p className="rounded-sm border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            {/*
              The single live region for this panel. It holds the completed
              reply — announced once — plus the streaming status, so a screen
              reader user knows an answer is coming without hearing it built a
              token at a time.
            */}
            <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
              {streaming ? `${assistantIdentity.name} is answering…` : announcement}
            </p>

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
            >
              <div className="flex items-end gap-2 rounded-sm border border-input bg-card px-3 py-2 focus-within:border-primary/50">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Enter sends; Shift+Enter breaks the line. Standard in
                    // every chat the visitor already uses.
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Ask about the craft, a piece, or your order…"
                  className="max-h-24 flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none placeholder:text-muted-foreground"
                />

                {/*
                  Voice, present and honestly disabled.

                  Speech-to-text good enough for a Telugu place-name and a
                  Sanskrit motif is a paid service, and none is wired up. The
                  control is here because the layout has to be right the day one
                  is — a mic button added later would move the send button and
                  re-teach the composer — but it is `disabled` with a title
                  saying so, rather than a live-looking button that does nothing.

                  A button that silently fails is worse than no button. This one
                  states its state to the pointer, to the keyboard and to a
                  screen reader, and takes no focus out of the tab order it would
                  otherwise be wasting.

                  To enable: drop in a transcription provider, write its result
                  into `setInput`, and remove `disabled` plus the two hints.
                */}
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  title="Voice input is not connected yet"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground/60 disabled:cursor-not-allowed"
                >
                  <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Speak your question — not available yet</span>
                </button>

                {streaming ? (
                  <button
                    type="button"
                    onClick={stop}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-foreground transition-colors hover:bg-muted/70"
                  >
                    <Square className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                    <span className="sr-only">Stop</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-35"
                  >
                    <ArrowUp className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Send</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </>,
        document.body,
      )}
    </>
  );
}
