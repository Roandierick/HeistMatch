import { z } from "zod";
import { BLOG_CATEGORIES } from "@/config/blog";

const optionalText = (max: number) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? null : v), z.string().trim().max(max).nullable());

export const blogPostSchema = z.object({
  title: z.string().trim().min(5).max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, { error: "Lowercase letters, numbers and dashes only." })
    .max(100),
  excerpt: z.string().trim().min(20).max(300),
  content: z.string().min(1, { error: "Write some content." }).max(100_000),
  category: z.enum(BLOG_CATEGORIES.map((c) => c.slug) as [string, ...string[]]),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .slice(0, 10),
    ),
  seo_title: optionalText(70),
  seo_description: optionalText(170),
  featured_image: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.string().trim().regex(/^(https:\/\/|\/)[^\s"'<>]+$/, { error: "Use an https:// URL or a /path." }).nullable(),
  ),
  featured_image_alt: optionalText(200),
  author_name: z.string().trim().min(2).max(80).default("HeistMatch Editorial"),
  is_featured: z.preprocess((v) => v === "on", z.boolean()),
  status: z.enum(["draft", "published", "archived"]),
  published_at: z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? null : v),
    z.iso.datetime({ offset: true }).nullable(),
  ),
});

export type BlogPostInput = z.output<typeof blogPostSchema>;
