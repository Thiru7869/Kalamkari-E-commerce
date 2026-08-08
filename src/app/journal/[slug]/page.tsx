import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getBlogPost, getBlogPosts } from '@/lib/queries';
import { parseMarkdown } from '@/lib/markdown';
import { toList } from '@/lib/serialize';
import { formatDate, absoluteUrl } from '@/lib/utils';
import { site } from '@/content/site';

type Params = Promise<{ slug: string }>;

export const revalidate = 600;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt.toISOString(),
      images: [post.coverImage],
    },
  };
}

export default async function JournalPostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const blocks = parseMarkdown(post.body);
  const all = await getBlogPosts();
  const more = all.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="pb-16">
        <header className="border-b border-border bg-cotton-100 pb-12 pt-10 md:pb-16 md:pt-14 dark:bg-card">
          <div className="container">
            <Link
              href="/journal"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All journal entries
            </Link>

            <div className="mt-8 max-w-3xl">
              <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.12em] text-muted-foreground">
                {toList(post.tags).map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <h1 className="mt-3 text-display-lg leading-tight">{post.title}</h1>
              <p className="mt-5 text-body-lg text-muted-foreground">{post.excerpt}</p>
              <p className="mt-6 text-sm text-muted-foreground">
                <time dateTime={post.publishedAt.toISOString()}>
                  {formatDate(post.publishedAt)}
                </time>
                <span aria-hidden="true"> · </span>
                {post.readMinutes} min read
              </p>
            </div>
          </div>
        </header>

        <div className="container">
          <div className="relative mt-10 aspect-[16/9] overflow-hidden rounded-sm bg-cotton-300 md:mt-14">
            <Image
              src={post.coverImage}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 70vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Measure capped near 68ch — the readable range for long-form body text. */}
          <div className="mx-auto mt-12 max-w-[42rem]">
            {blocks.map((block, i) => {
              if (block.type === 'heading') {
                const Tag = block.level === 2 ? 'h2' : 'h3';
                return (
                  <Tag
                    key={i}
                    className={
                      block.level === 2
                        ? 'mt-12 text-display-sm leading-tight first:mt-0'
                        : 'mt-9 font-display text-xl leading-snug first:mt-0'
                    }
                    dangerouslySetInnerHTML={{ __html: block.html }}
                  />
                );
              }

              if (block.type === 'list') {
                return (
                  <ul key={i} className="mt-5 flex list-disc flex-col gap-2.5 pl-5">
                    {block.items.map((item, j) => (
                      <li
                        key={j}
                        className="leading-relaxed text-muted-foreground"
                        dangerouslySetInnerHTML={{ __html: item }}
                      />
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={i}
                  className="mt-5 text-body-lg leading-relaxed text-muted-foreground first:mt-0"
                  dangerouslySetInnerHTML={{ __html: block.html }}
                />
              );
            })}

            <footer className="mt-14 border-t border-border pt-8">
              <p className="text-sm text-muted-foreground">
                Written at the store in {site.location.town}.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-chay-700"
                >
                  See the work
                </Link>
                <Link
                  href="/process"
                  className="inline-flex h-11 items-center rounded-sm border border-foreground/25 px-5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  The 23 steps
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-border bg-cotton-100 py-14 md:py-20 dark:bg-card">
          <div className="container">
            <h2 className="text-display-sm">More from the journal</h2>
            <ul className="mt-8 grid gap-8 md:grid-cols-3">
              {more.map((p) => (
                <li key={p.id}>
                  <article className="group relative">
                    <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-cotton-300">
                      <Image
                        src={p.coverImage}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 30vw, 100vw"
                        className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                      />
                    </div>
                    <h3 className="mt-4 font-display text-lg leading-snug">
                      <Link
                        href={`/journal/${p.slug}`}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {p.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                      {p.excerpt}
                    </p>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: post.title,
            description: post.excerpt,
            image: absoluteUrl(post.coverImage),
            datePublished: post.publishedAt.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { '@type': 'Organization', name: post.author },
            publisher: { '@type': 'Organization', name: site.name },
            mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
          }),
        }}
      />
    </>
  );
}
