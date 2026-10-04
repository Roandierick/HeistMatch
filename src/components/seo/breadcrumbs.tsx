import Link from "next/link";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";
import { JsonLd } from "./json-ld";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="text-sm text-subtle">
        <ol className="flex flex-wrap items-center gap-1.5">
          {items.map((item, i) => {
            const last = i === items.length - 1;
            return (
              <li key={item.path} className="flex items-center gap-1.5">
                {last ? (
                  <span aria-current="page" className="max-w-[40ch] truncate text-muted">
                    {item.name}
                  </span>
                ) : (
                  <>
                    <Link href={item.path} className="hover:text-fg">
                      {item.name}
                    </Link>
                    <span aria-hidden>/</span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </>
  );
}
