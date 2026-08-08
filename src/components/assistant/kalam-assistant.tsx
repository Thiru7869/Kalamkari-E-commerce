'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUp, MessageCircle, Square, X } from 'lucide-react';
import { assistantIdentity, starterPrompts } from '@/content/assistant';
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

export function KalamAssistant() {
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
          'group pointer-events-auto relative flex h-12 items-center gap-2.5 rounded-full pl-3.5 pr-4',
          'border border-primary/25 bg-primary text-primary-foreground',
          'shadow-[0_8px_24px_-10px_hsl(var(--primary)/0.7)]',
          'transition-transform duration-300 ease-out hover:scale-[1.03]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          open && 'scale-95',
        )}
      >
        {open ? (
          <X className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
        )}
        <span className="font-inscription text-[0.8125rem] tracking-[0.06em]">
          {open ? 'Close' : 'Ask ' + assistantIdentity.name}
        </span>
      </button>

      {/* Panel */}
      {open && (
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
            aria-label={`${assistantIdentity.name}, ${assistantIdentity.role}`}
            className={cn(
              'pointer-events-auto fixed z-50 flex flex-col overflow-hidden',
              'border border-border bg-cotton-50 shadow-2xl dark:bg-card',
              // Phone: bottom sheet, clear of the tab bar.
              'inset-x-0 bottom-0 h-[78svh] rounded-t-xl',
              // Desktop: anchored panel above the launcher.
              'md:inset-x-auto md:bottom-24 md:right-6 md:h-[min(34rem,72svh)] md:w-[24.5rem] md:rounded-sm',
              'motion-safe:animate-rise-in',
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
              <div className="min-w-0">
                <p className="font-display text-lg leading-none">{assistantIdentity.name}</p>
                <p className="mt-1 truncate text-[0.6875rem] uppercase tracking-[0.14em] text-cotton-200/70">
                  {assistantIdentity.role}
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
              <p className="rounded-sm border border-border bg-muted/50 px-3 py-2 text-[0.75rem] leading-relaxed text-muted-foreground">
                {assistantIdentity.disclosure}
              </p>

              {messages.length === 0 && (
                <>
                  <p className="text-sm leading-relaxed">{assistantIdentity.greeting}</p>
                  <ul className="flex flex-col gap-2 pt-1">
                    {starterPrompts.map((prompt) => (
                      <li key={prompt}>
                        <button
                          type="button"
                          onClick={() => void send(prompt)}
                          className="w-full rounded-sm border border-border bg-background px-3 py-2 text-left text-[0.8125rem] leading-snug transition-colors hover:border-primary/40 hover:bg-primary/5"
                        >
                          {prompt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
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
                      className="mt-2.5 inline-flex text-[0.8125rem] font-medium text-primary underline underline-offset-4"
                    >
                      {message.link.label} →
                    </Link>
                  )}
                </div>
              ))}

              {error && (
                <p className="rounded-sm border border-destructive/40 bg-destructive/5 px-3 py-2 text-[0.8125rem] text-destructive">
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
        </>
      )}
    </>
  );
}
