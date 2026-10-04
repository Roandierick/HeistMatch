import Link from "next/link";
import type { BlogPostSummary } from "@/data/blog";
import { PostCard } from "./post-card";

export function PostGrid({ posts }: { posts: BlogPostSummary[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((p, i) => (
        <li key={p.id}>
          <PostCard post={p} priority={i < 3} />
        </li>
      ))}
    </ul>
  );
}

export function Pagination({ basePath, page, totalPages, query }: { basePath: string; page: number; totalPages: number; query?: string }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between text-sm">
      {page > 1 ? <Link href={href(page - 1)} className="text-accent hover:text-accent-strong">← Newer</Link> : <span />}
      <span className="text-subtle">Page {page} of {totalPages}</span>
      {page < totalPages ? <Link href={href(page + 1)} className="text-accent hover:text-accent-strong">Older →</Link> : <span />}
    </nav>
  );
}
