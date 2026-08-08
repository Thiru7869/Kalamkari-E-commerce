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
            <Breadcrumbs trail={[{ label: 'Journal' }]} className="mb-6" />
            <p className="eyebrow">Journal</p>
            <h1 className="mt-4 text-display-xl">Notes from the store</h1>
            <p className="mt-6 text-body-lg text-muted-foreground">
              Practical writing about the craft — what the materials do, how to tell real
              work from printed work, and why some months produce nothing at all.
            </p>
          </div>
        </div>
      </section>

      <div className="container py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="font-display text-2xl">Nothing written here yet</h2>
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
              <ul className="mt-16 grid gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <li key={post.id}>
                    <article className="group relative flex h-full flex-col">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-cotton-300">
                        <Image
                          src={post.coverImage}
                          alt=""
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                          className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                        />
                      </div>
                      <div className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                        {toList(post.tags).slice(0, 2).map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                      <h2 className="mt-2 font-display text-xl leading-snug">
                        <Link
                          href={`/journal/${post.slug}`}
                          className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {post.title}
                        </Link>
                      </h2>
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
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </>
  );
}
