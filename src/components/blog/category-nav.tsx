import Link from "next/link";
import { BLOG_CATEGORIES } from "@/config/blog";
import { cn } from "@/components/ui/cn";

export function CategoryNav({ active }: { active?: string }) {
  return (
    <nav aria-label="Blog categories" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex gap-2 whitespace-nowrap sm:flex-wrap">
        <li>
          <Link href="/blog" aria-current={!active ? "page" : undefined} className={pill(!active)}>All</Link>
        </li>
        {BLOG_CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link href={`/blog/category/${c.slug}`} aria-current={active === c.slug ? "page" : undefined} className={pill(active === c.slug)}>
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function pill(active: boolean) {
  return cn(
    "inline-flex h-9 items-center rounded-full border px-3.5 text-sm transition-colors",
    active ? "border-accent/40 bg-accent/10 text-fg" : "border-line text-muted hover:border-line-strong hover:text-fg",
  );
}
