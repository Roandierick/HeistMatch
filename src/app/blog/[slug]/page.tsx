import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { JsonLd } from "@/components/seo/json-ld";
import { Markdown } from "@/components/blog/markdown";
import { TableOfContents } from "@/components/blog/toc";
import { FinderCta } from "@/components/blog/finder-cta";
import { PostCard } from "@/components/blog/post-card";
import { NewsletterSection } from "@/components/newsletter/newsletter-section";
import { getPostBySlug, getRelatedPosts, listAllPublishedSlugs } from "@/data/blog";
import { getCategory } from "@/config/blog";
import { extractToc } from "@/lib/markdown";
import { formatDate, readingTimeMinutes } from "@/lib/format";
import { canOptimizeImage } from "@/lib/images";
import { articleJsonLd, pageMetadata } from "@/lib/seo";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await listAllPublishedSlugs();
  return posts.slice(0, 200).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Article not found", robots: { index: false } };
  return pageMetadata({
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    image: post.featured_image,
    publishedTime: post.published_at,
    modifiedTime: post.updated_at,
    authors: [post.author_name],
  });
}

export default async function ArticlePage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const [related] = await Promise.all([getRelatedPosts(post)]);
  const category = getCategory(post.category);
  const toc = extractToc(post.content);
  const updated = post.published_at && new Date(post.updated_at).getTime() - new Date(post.published_at).getTime() > 24 * 3600_000;

  return (
    <article>
      <JsonLd data={articleJsonLd(post)} />
      <Container className="pt-8">
        <Breadcrumbs
          items={[
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            ...(category ? [{ name: category.name, path: `/blog/category/${category.slug}` }] : []),
            { name: post.title, path: `/blog/${post.slug}` },
          ]}
        />
        <header className="mt-6 max-w-3xl">
          {category && (
            <Link href={`/blog/category/${category.slug}`} className="text-sm font-medium tracking-wide text-accent uppercase hover:text-accent-strong">
              {category.name}
            </Link>
          )}
          <h1 className="mt-2 text-3xl leading-tight font-semibold tracking-tight sm:text-[2.6rem]">{post.title}</h1>
          <p className="mt-4 text-lg text-muted">{post.excerpt}</p>
          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle">
            <span>
              By <span className="text-fg">{post.author_name}</span>
            </span>
            {post.published_at && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Published <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                </span>
              </>
            )}
            {updated && (
              <>
                <span aria-hidden>·</span>
                <span>
                  Updated <time dateTime={post.updated_at}>{formatDate(post.updated_at)}</time>
                </span>
              </>
            )}
            <span aria-hidden>·</span>
            <span>{readingTimeMinutes(post.content)} min read</span>
          </p>
        </header>

        {post.featured_image && (
          <div className="relative mt-8 aspect-[16/9] max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface-2">
            <Image
              src={post.featured_image}
              alt={post.featured_image_alt ?? ""}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="object-cover"
              unoptimized={!canOptimizeImage(post.featured_image)}
            />
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0 max-w-3xl">
            <div className="mb-8 lg:hidden">
              <TableOfContents items={toc} />
            </div>
            <Markdown content={post.content} />

            {post.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                {post.tags.map((t) => (
                  <li key={t}>
                    <Badge>#{t}</Badge>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-10">
              <FinderCta slug={post.slug} />
            </div>
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-24 flex flex-col gap-4">
              <TableOfContents items={toc} />
              <FinderCta slug={post.slug} variant="sidebar" />
            </div>
          </aside>
        </div>
      </Container>

      <Container className="mt-16">
        {related.length > 0 && (
          <section aria-labelledby="related">
            <h2 id="related" className="text-xl font-semibold">Related articles</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-16">
          <NewsletterSection source="newsletter_article" />
        </div>
      </Container>
    </article>
  );
}
