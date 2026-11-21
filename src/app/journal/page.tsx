import type { Metadata } from 'next';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import Image from 'next/image';
import Link from 'next/link';
import { getBlogPosts } from '@/lib/queries';
import { toList } from '@/lib/serialize';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Journal — notes on dye, motif and season',
  description:
    'Writing from the store: why natural dye is slower, how to tell hand-painted Kalamkari from a print, why the monsoon stops everything, and how to care for naturally dyed cloth.',
  alternates: { canonical: '/journal' },
};

export const revalidate = 600;

export default async function JournalPage() {
  const posts = await getBlogPosts();
  const [lead, ...rest] = posts;

  return (
    <>
      <section className="border-b border-border bg-cotton-100 pb-12 pt-16 md:pb-16 md:pt-24 dark:bg-card">
        <div className="container">
          <div className="max-w-2xl">
            <Breadcrumbs trail={[{ label: 'Journal' }]} />
            <p className="eyebrow">Journal</p>
            <h1 className="mt-4 text-display-xl">Notes from the store</h1>
            <p className="mt-6 text-body-lg text-muted-foreground">
              Practical writing about the craft — what the materials do, how to tell real
              work from printed work, and why some months produce nothing at all.
            </p>
          </div>
        </div>
      </section>

      <div className="container section-y">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="font-display text-display-sm">Nothing written here yet</h2>
            <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground">
              The journal is written between dye baths rather than to a schedule, so it
              fills up slowly. In the meantime, the twenty-three steps are documented in
              full, and the family's own account is on the story page.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/process"
                className="inline-flex h-11 items-center justify-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
              >
                Walk through the process
              </Link>
              <Link
                href="/our-story"
                className="inline-flex h-11 items-center justify-center rounded-sm border border-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                Meet the family
              </Link>
            </div>
          </div>
        ) : (
          <>
            {lead && (
              <article className="group relative grid gap-8 md:grid-cols-2 md:gap-12">
                <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-cotton-300">
                  <Image
                    src={lead.coverImage}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                    {toList(lead.tags).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  <h2 className="mt-3 text-display-md leading-tight">
                    <Link
                      href={`/journal/${lead.slug}`}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {lead.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-body-lg leading-relaxed text-muted-foreground">
                    {lead.excerpt}
                  </p>
                  <p className="mt-5 text-sm text-muted-foreground">
                    <time dateTime={lead.publishedAt.toISOString()}>
                      {formatDate(lead.publishedAt)}
                    </time>
                    <span aria-hidden="true"> · </span>
                    {lead.readMinutes} min read
                  </p>
                </div>
              </article>
            )}

            {rest.length > 0 && (
              <ul className="mt-14 grid grid-cols-3 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12">
                {rest.map((post, i) => {
                  /*
                    A collage rather than a uniform grid.

                    Three across at every width, and every fourth entry takes
                    two columns with a landscape crop while the rest stay
                    square. That gives the page a rhythm — wide, square,
                    square — instead of a wall of identical rectangles, and it
                    keeps working however many posts there are, because the
                    pattern is derived from the index rather than hand-placed.
                  */
                  const wide = i % 4 === 0;

                  return (
                    <li key={post.id} className={wide ? 'col-span-2' : undefined}>
                      <article className="group relative flex h-full flex-col">
                        <div
                          className={`relative overflow-hidden rounded-sm bg-cotton-300 ${
                            wide ? 'aspect-[16/10]' : 'aspect-square'
                          }`}
                        >
                          <Image
                            src={post.coverImage}
                            alt=""
                            fill
                            sizes={
                              wide
                                ? '(min-width: 1024px) 60vw, 66vw'
                                : '(min-width: 1024px) 30vw, 33vw'
                            }
                            className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                          />
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2 text-label uppercase tracking-[0.12em] text-muted-foreground md:text-xs">
                          {toList(post.tags).slice(0, wide ? 2 : 1).map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>

                        <h2
                          className={`mt-1.5 font-display leading-snug ${
                            wide ? 'text-lg md:text-2xl' : 'text-base md:text-xl'
                          }`}
                        >
                          <Link
                            href={`/journal/${post.slug}`}
                            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          >
                            {post.title}
                          </Link>
                        </h2>

                        {/* The excerpt is the first thing to go when a card is
                            one third of a phone wide — the title and the date
                            carry it there. */}
                        <p
                          className={`mt-1.5 line-clamp-2 text-sm leading-snug text-muted-foreground ${
                            wide ? '' : 'hidden md:line-clamp-2 md:block'
                          }`}
                        >
                          {post.excerpt}
                        </p>

                        <p className="mt-auto pt-2.5 text-label text-muted-foreground md:text-xs">
                          <time dateTime={post.publishedAt.toISOString()}>
                            {formatDate(post.publishedAt)}
                          </time>
                          <span aria-hidden="true"> &middot; </span>
                          {post.readMinutes} min
                        </p>
                      </article>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}
