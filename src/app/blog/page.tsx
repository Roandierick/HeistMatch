import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { Input } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconSearch } from "@/components/ui/icons";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CategoryNav } from "@/components/blog/category-nav";
import { Pagination, PostGrid } from "@/components/blog/post-list";
import { PostCard } from "@/components/blog/post-card";
import { NewsletterSection } from "@/components/newsletter/newsletter-section";
import { listFeaturedPosts, listPosts } from "@/data/blog";
import { POSTS_PER_PAGE } from "@/config/blog";
import { pageMetadata } from "@/lib/seo";

function parse(params: Record<string, string | string[] | undefined>) {
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const page = Math.min(Math.max(Number.parseInt(String(params.page ?? "1"), 10) || 1, 1), 100);
  return { q, page };
}

export async function generateMetadata({ searchParams }: PageProps<"/blog">): Promise<Metadata> {
  const { q, page } = parse(await searchParams);
  return pageMetadata({
    title: page > 1 ? `GTA 6 News, Heist Guides & Multiplayer Tips (page ${page})` : "GTA 6 News, Heist Guides & Multiplayer Tips",
    description:
      "GTA 6 news, GTA Online updates, heist guides and crew tips from HeistMatch. Confirmed facts only, with unconfirmed details clearly labelled.",
    path: page > 1 ? `/blog?page=${page}` : "/blog",
    noindex: Boolean(q),
  });
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const { q, page } = parse(await searchParams);
  const showFeatured = !q && page === 1;
  const [featured, { posts, total }] = await Promise.all([
    showFeatured ? listFeaturedPosts(1) : Promise.resolve([]),
    listPosts({ q, page }),
  ]);
  const hero = featured[0];
  const rest = hero ? posts.filter((p) => p.id !== hero.id) : posts;

  return (
    <Container className="pt-8 pb-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }]} />
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">GTA 6 news, heist guides &amp; crew tips</h1>
          <p className="mt-2 max-w-2xl text-muted">Everything you need for GTA 6 multiplayer. Confirmed facts first; anything unconfirmed is clearly labelled.</p>
        </div>
        <form action="/blog" method="get" role="search" className="flex w-full gap-2 lg:w-80">
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <Input id="blog-search" name="q" type="search" defaultValue={q} placeholder="Search articles" maxLength={80} />
          <Button type="submit" variant="secondary" aria-label="Search">
            <IconSearch className="size-4" />
          </Button>
        </form>
      </div>

      <div className="mt-6">
        <CategoryNav />
      </div>

      {hero && (
        <section aria-label="Featured article" className="mt-8">
          <div className="max-w-3xl">
            <PostCard post={hero} headingLevel="h2" priority />
          </div>
        </section>
      )}

      <section aria-labelledby="latest" className="mt-10">
        <h2 id="latest" className="mb-4 text-xl font-semibold">{q ? `Results for “${q}”` : "Latest articles"}</h2>
        {rest.length > 0 ? (
          <PostGrid posts={rest} />
        ) : (
          <EmptyState
            title={q ? "No articles match your search" : "Articles are on the way"}
            description={q ? "Try a different search term or browse a category." : "Subscribe below and we'll let you know when new guides are live."}
          />
        )}
        <Pagination basePath="/blog" page={page} totalPages={Math.ceil(total / POSTS_PER_PAGE)} query={q} />
      </section>

      <div className="mt-16">
        <NewsletterSection source="newsletter_blog" />
      </div>
    </Container>
  );
}
