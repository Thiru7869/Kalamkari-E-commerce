/**
 * Inline field error. Rendered only when there is a message, and always wired
 * to its input via aria-describedby by the calling form.
 */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-destructive">
      {message}
    </p>
  );
}
