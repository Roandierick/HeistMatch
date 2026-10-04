import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { CategoryNav } from "@/components/blog/category-nav";
import { Pagination, PostGrid } from "@/components/blog/post-list";
import { FinderCta } from "@/components/blog/finder-cta";
import { listPosts } from "@/data/blog";
import { BLOG_CATEGORIES, POSTS_PER_PAGE, getCategory } from "@/config/blog";
import { pageMetadata } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  const { total } = await listPosts({ category, limit: 1 });
  return pageMetadata({
    title: cat.name,
    description: cat.description,
    path: `/blog/category/${cat.slug}`,
    // Empty category pages are thin content: keep them out of the index until they have posts.
    noindex: total === 0,
  });
}

export const revalidate = 300;

export default async function CategoryPage({ params }: PageProps<"/blog/category/[category]">) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const { posts, total } = await listPosts({ category, page: 1 });

  return (
    <Container className="pt-8 pb-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Blog", path: "/blog" }, { name: cat.name, path: `/blog/category/${cat.slug}` }]} />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-muted">{cat.description}</p>
      <div className="mt-6">
        <CategoryNav active={cat.slug} />
      </div>
      <div className="mt-8">
        {posts.length > 0 ? (
          <PostGrid posts={posts} />
        ) : (
          <EmptyState title="No articles here yet" description="New guides are on the way. Meanwhile, find players for your next heist." />
        )}
        <Pagination basePath={`/blog/category/${cat.slug}`} page={1} totalPages={Math.ceil(total / POSTS_PER_PAGE)} />
      </div>
      <div className="mt-12">
        <FinderCta slug={`category-${cat.slug}`} />
      </div>
    </Container>
  );
}
