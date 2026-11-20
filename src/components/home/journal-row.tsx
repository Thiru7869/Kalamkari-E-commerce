import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { RevealOnScroll } from '@/components/motion/reveal-on-scroll';
import { formatDate } from '@/lib/utils';
import { toList } from '@/lib/serialize';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  tags: string;
  readMinutes: number;
  publishedAt: Date;
};

/**
 * The three most recent notes from the journal.
 *
 * Reads posts that are already published and renders nothing when there are
 * none — an empty "From the journal" heading over no posts would be the
 * landing page's only dead section.
 */
export function JournalRow({ posts }: { posts: Post[] }) {
  const latest = posts.slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section
      className="border-t border-border section-y"
      aria-labelledby="journal-row-heading"
    >
      <div className="container">
        <RevealOnScroll>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">The journal</p>
              <h2 id="journal-row-heading" className="mt-3 text-display-md">
                Notes on dye, motif and season
              </h2>
            </div>
            <Link
              href="/journal"
              className="inline-flex min-h-[2.75rem] items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
            >
              All notes
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </RevealOnScroll>

        <ul className="mt-5 grid gap-6 md:mt-6 md:grid-cols-3 md:gap-5">
          {latest.map((post, i) => {
            const tags = toList(post.tags);
            return (
              <li key={post.slug}>
                <RevealOnScroll delay={i * 0.06} className="h-full">
                  <article className="group relative flex h-full flex-col">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-cotton-300">
                      <Image
                        src={post.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                      />
                    </div>

                    {tags[0] && (
                      <p className="mt-4 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        {tags[0]}
                      </p>
                    )}
                    <h3 className="mt-2 font-display text-xl leading-snug">
                      <Link
                        href={`/journal/${post.slug}`}
                        className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                      {post.excerpt}
                    </p>
                    <p className="mt-auto pt-4 text-xs text-muted-foreground">
                      <time dateTime={post.publishedAt.toISOString()}>
                        {formatDate(post.publishedAt)}
                      </time>
                      <span aria-hidden="true"> · </span>
                      {post.readMinutes} min read
                    </p>
                  </article>
                </RevealOnScroll>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
