import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/env";
import { logError } from "@/lib/errors";
import { POSTS_PER_PAGE } from "@/config/blog";
import type { Tables } from "@/types/database";

export type BlogPost = Tables<"blog_posts">;
export type BlogPostSummary = Pick<
  BlogPost,
  "id" | "slug" | "title" | "excerpt" | "category" | "tags" | "featured_image" | "featured_image_alt" | "author_name" | "published_at" | "updated_at" | "is_featured"
>;

const SUMMARY =
  "id, slug, title, excerpt, category, tags, featured_image, featured_image_alt, author_name, published_at, updated_at, is_featured" as const;

function publishedQuery() {
  return createPublicClient()
    .from("blog_posts")
    .select(SUMMARY, { count: "exact" })
    .eq("status", "published")
    .lte("published_at", new Date().toISOString());
}

/** Escape LIKE wildcards and PostgREST filter syntax in user search input. */
export function sanitizeSearch(q: string): string {
  return q.replace(/[%_\\,().*:"']/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
}

export async function listPosts({
  category,
  q,
  page = 1,
  limit = POSTS_PER_PAGE,
}: { category?: string; q?: string; page?: number; limit?: number } = {}): Promise<{ posts: BlogPostSummary[]; total: number }> {
  if (!hasSupabaseEnv()) return { posts: [], total: 0 };
  let query = publishedQuery();
  if (category) query = query.eq("category", category);
  const term = q ? sanitizeSearch(q) : "";
  if (term) query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%`);
  const from = (page - 1) * limit;
  const { data, error, count } = await query.order("published_at", { ascending: false }).range(from, from + limit - 1);
  if (error) {
    logError("listPosts", error);
    return { posts: [], total: 0 };
  }
  return { posts: data, total: count ?? data.length };
}

export async function listFeaturedPosts(limit = 3): Promise<BlogPostSummary[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await publishedQuery().eq("is_featured", true).order("published_at", { ascending: false }).limit(limit);
  return data ?? [];
}

export const getPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!hasSupabaseEnv() || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) return null;
  const { data, error } = await createPublicClient()
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) logError("getPostBySlug", error);
  return data ?? null;
});

/** Same category first, then shared tags, then latest. */
export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPostSummary[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await publishedQuery().neq("id", post.id).order("published_at", { ascending: false }).limit(30);
  const candidates = data ?? [];
  const score = (p: BlogPostSummary) =>
    (p.category === post.category ? 10 : 0) + p.tags.filter((t) => post.tags.includes(t)).length * 3;
  return [...candidates].sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export async function listAllPublishedSlugs(): Promise<{ slug: string; updated_at: string; category: string }[]> {
  if (!hasSupabaseEnv()) return [];
  const { data } = await createPublicClient()
    .from("blog_posts")
    .select("slug, updated_at, category")
    .eq("status", "published")
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false })
    .limit(5000);
  return data ?? [];
}
