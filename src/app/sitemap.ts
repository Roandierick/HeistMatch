import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { BLOG_CATEGORIES } from "@/config/blog";
import { listAllPublishedSlugs } from "@/data/blog";

export const revalidate = 3600;

/**
 * Only canonical, indexable URLs. Heist listings, profiles and filtered finder
 * URLs are deliberately excluded (noindex user-generated / parameter pages).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await listAllPublishedSlugs();
  const latestPost = posts[0]?.updated_at ? new Date(posts[0].updated_at) : undefined;
  const categoriesWithPosts = new Set(posts.map((p) => p.category));

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/find"), changeFrequency: "hourly", priority: 0.9 },
    { url: absoluteUrl("/create"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/blog"), changeFrequency: "daily", priority: 0.8, lastModified: latestPost },
    { url: absoluteUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/cookies"), changeFrequency: "yearly", priority: 0.1 },
    { url: absoluteUrl("/disclaimer"), changeFrequency: "yearly", priority: 0.1 },
  ];

  const categories: MetadataRoute.Sitemap = BLOG_CATEGORIES.filter((c) => categoriesWithPosts.has(c.slug)).map((c) => ({
    url: absoluteUrl(`/blog/category/${c.slug}`),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const articles: MetadataRoute.Sitemap = posts.map((p) => ({
    url: absoluteUrl(`/blog/${p.slug}`),
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categories, ...articles];
}
