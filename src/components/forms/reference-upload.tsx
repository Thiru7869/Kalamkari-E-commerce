'use client';

import { useEffect, useRef, useState } from 'react';
import { ImageUp, X } from 'lucide-react';
import { REFERENCE_LIMITS, REFERENCE_NOTE } from '@/content/commission';

/**
 * Reference pictures for a commission.
 *
 * A photograph of a saree somebody already owns, or of the wall a panel is
 * going on, tells the workshop more than three paragraphs of description —
 * particularly for colour, which is the thing words are worst at.
 *
 * The list is held in component state and written back into a real
 * `<input type="file" multiple>` through a DataTransfer, so the form submits
 * as an ordinary multipart post with no client-side upload endpoint and no
 * third-party storage. The server re-validates type, size and count; nothing
 * here is trusted.
 *
 * Previews are object URLs, revoked on removal and on unmount — without that,
 * selecting a dozen files leaks a dozen blobs for the life of the page.
 */
export function ReferenceUpload({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    () => () => {
      files.forEach((f) => URL.revokeObjectURL(f.url));
    },
    [files],
  );

  /** Push the current list back into the real input so the form carries it. */
  function sync(next: { file: File; url: string }[]) {
    setFiles(next);
    if (!inputRef.current) return;
    const transfer = new DataTransfer();
    next.forEach((f) => transfer.items.add(f.file));
    inputRef.current.files = transfer.files;
  }

  function add(incoming: FileList | null) {
    if (!incoming?.length) return;
    setError(null);

    const next = [...files];
    const problems: string[] = [];

    for (const file of Array.from(incoming)) {
      if (next.length >= REFERENCE_LIMITS.maxFiles) {
        problems.push(`Only ${REFERENCE_LIMITS.maxFiles} pictures can be attached.`);
        break;
      }
      if (!REFERENCE_LIMITS.accept.includes(file.type as (typeof REFERENCE_LIMITS.accept)[number])) {
        problems.push(`${file.name} is not a picture we can read.`);
        continue;
      }
      if (file.size > REFERENCE_LIMITS.maxBytes) {
        problems.push(`${file.name} is over 5 MB.`);
        continue;
      }
      if (next.some((f) => f.file.name === file.name && f.file.size === file.size)) continue;

      next.push({ file, url: URL.createObjectURL(file) });
    }

    sync(next);
    if (problems.length) setError(problems[0]);
  }

  function remove(index: number) {
    URL.revokeObjectURL(files[index].url);
    sync(files.filter((_, i) => i !== index));
  }

  return (
    <div className={className}>
      <p className="text-sm font-medium">
        Reference pictures{' '}
        <span className="font-normal text-muted-foreground">
          — optional, up to {REFERENCE_LIMITS.maxFiles}
        </span>
      </p>

      {/* The real control. Visually replaced by the button below, but kept in
          the DOM and in the tab order so this works without JavaScript and for
          anybody using the native file picker directly. */}
      <input
        ref={inputRef}
        id="c-references"
        name="references"
        type="file"
        multiple
        accept={REFERENCE_LIMITS.acceptAttribute}
        onChange={(e) => add(e.target.files)}
        className="sr-only"
        aria-describedby="c-references-note"
      />

      <label
        htmlFor="c-references"
        className="mt-2 flex min-h-[2.75rem] w-full cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-input bg-card px-4 py-3 text-sm transition-colors hover:border-primary/50 hover:bg-foreground/[0.02] focus-within:ring-2 focus-within:ring-ring"
      >
        <ImageUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {files.length === 0
          ? 'Attach a picture'
          : `Add another (${files.length} of ${REFERENCE_LIMITS.maxFiles})`}
      </label>

      {files.length > 0 && (
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {files.map((entry, i) => (
            <li key={`${entry.file.name}-${i}`} className="relative">
              <div className="relative aspect-square overflow-hidden rounded-sm border border-border bg-muted">
                {/* An object URL of a file the visitor just chose — next/image
                    cannot optimise a blob, and there is nothing to optimise. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={entry.url}
                  alt={`Reference: ${entry.file.name}`}
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-colors hover:border-destructive/50 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sr-only">Remove {entry.file.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <p id="c-references-note" className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {REFERENCE_NOTE}
      </p>
    </div>
  );
}
