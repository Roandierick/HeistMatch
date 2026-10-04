import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/config/blog";
import { formatDate } from "@/lib/format";
import { canOptimizeImage } from "@/lib/images";
import type { BlogPostSummary } from "@/data/blog";

export function PostCard({
  post,
  headingLevel = "h3",
  priority = false,
}: {
  post: BlogPostSummary;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const Heading = headingLevel;
  const category = getCategory(post.category);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface transition-colors hover:border-line-strong">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-2">
        {post.featured_image ? (
          <Image
            src={post.featured_image}
            alt={post.featured_image_alt ?? ""}
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={priority}
            unoptimized={!canOptimizeImage(post.featured_image)}
          />
        ) : (
          <div aria-hidden className="hero-glow absolute inset-0 grid place-items-center">
            <span className="text-sm font-medium tracking-widest text-subtle uppercase">{category?.name ?? "HeistMatch"}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium tracking-wide text-accent uppercase">{category?.name ?? post.category}</p>
        <Heading className="mt-1.5 line-clamp-2 text-[1.05rem] leading-snug font-semibold text-fg">
          <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </Heading>
        <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
        {post.published_at && (
          <time dateTime={post.published_at} className="mt-auto pt-4 text-xs text-subtle">
            {formatDate(post.published_at)}
          </time>
        )}
      </div>
    </article>
  );
}
