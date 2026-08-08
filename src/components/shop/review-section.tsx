'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/primitives';
import { submitReview } from '@/app/actions/forms';
import { initialFormState } from '@/lib/form-state';
import { formatDate, cn } from '@/lib/utils';

type Review = {
  id: string;
  rating: number;
  title: string | null;
  body: string;
  verified: boolean;
  createdAt: Date;
  user: { name: string | null; image: string | null };
};

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(
            size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5',
            n <= value ? 'fill-myrobalan-500 text-myrobalan-500' : 'text-foreground/20',
          )}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">{value} out of 5</span>
    </span>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Posting…' : 'Post review'}
    </Button>
  );
}

export function ReviewSection({
  productId,
  reviews,
  rating,
  count,
}: {
  productId: string;
  reviews: Review[];
  rating: number | null;
  count: number;
}) {
  const [state, formAction] = useActionState(submitReview, initialFormState);
  const [showForm, setShowForm] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);

  return (
    <section
      id="reviews"
      className="scroll-mt-24 border-t border-border bg-cotton-100 py-14 md:py-20 dark:bg-card"
    >
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-display-sm">
              {count === 0 ? 'No reviews yet' : `${count} ${count === 1 ? 'review' : 'reviews'}`}
            </h2>
            {rating != null && (
              <div className="mt-2 flex items-center gap-2">
                <Stars value={Math.round(rating)} size="md" />
                <span className="tabular text-sm text-muted-foreground">
                  {rating.toFixed(1)} out of 5
                </span>
              </div>
            )}
          </div>

          {state.status !== 'success' && (
            <Button variant="outline" onClick={() => setShowForm((v) => !v)}>
              {showForm ? 'Cancel' : 'Write a review'}
            </Button>
          )}
        </div>

        {showForm && state.status !== 'success' && (
          <form
            action={formAction}
            className="mt-8 max-w-xl rounded-sm border border-border bg-background p-5 md:p-6"
          >
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="rating" value={selectedRating} />

            <fieldset>
              <legend className="text-sm font-medium">Your rating</legend>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSelectedRating(n)}
                    aria-pressed={selectedRating === n}
                    aria-label={`${n} out of 5`}
                    className="rounded-sm p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Star
                      className={cn(
                        'h-7 w-7',
                        n <= selectedRating
                          ? 'fill-myrobalan-500 text-myrobalan-500'
                          : 'text-foreground/25',
                      )}
                    />
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5">
              <Label htmlFor="review-title">Headline</Label>
              <Input
                id="review-title"
                name="title"
                className="mt-1.5"
                maxLength={120}
                placeholder="Optional"
              />
            </div>

            <div className="mt-4">
              <Label htmlFor="review-body" required>
                Your review
              </Label>
              <Textarea
                id="review-body"
                name="body"
                required
                className="mt-1.5"
                aria-invalid={Boolean(state.errors?.body)}
                aria-describedby={state.errors?.body ? 'review-body-error' : undefined}
                placeholder="What is the cloth like in the hand? How does the colour read in daylight?"
              />
              {state.errors?.body && (
                <p id="review-body-error" className="mt-1.5 text-sm text-destructive">
                  {state.errors.body}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center gap-4">
              <SubmitButton />
              {state.status === 'error' && (
                <p role="alert" className="text-sm text-destructive">
                  {state.message}
                </p>
              )}
            </div>
          </form>
        )}

        {state.status === 'success' && (
          <p role="status" className="mt-6 rounded-sm border border-border bg-background p-4 text-sm">
            {state.message}
          </p>
        )}

        {reviews.length > 0 ? (
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <li
                key={review.id}
                className="rounded-sm border border-border bg-background p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <Stars value={review.rating} />
                  {review.verified && <Badge variant="muted">Verified purchase</Badge>}
                </div>
                {review.title && (
                  <h3 className="mt-3 font-display text-lg leading-snug">{review.title}</h3>
                )}
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {review.body}
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  {review.user.name ?? 'A customer'} · {formatDate(review.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-8 max-w-md text-muted-foreground">
            Nobody has written about this piece yet. If you have bought from the store,
            we would genuinely like to know how the cloth has worn.
          </p>
        )}
      </div>
    </section>
  );
}
