import type { TocItem } from "@/lib/markdown";

export function TableOfContents({ items }: { items: TocItem[] }) {
  if (items.length < 2) return null;
  return (
    <nav aria-labelledby="toc-title" className="rounded-[var(--radius-card)] border border-line bg-surface p-4 text-sm">
      <p id="toc-title" className="font-semibold text-fg">On this page</p>
      <ol className="mt-3 flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : undefined}>
            <a href={`#${item.id}`} className="text-muted transition-colors hover:text-fg">
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
