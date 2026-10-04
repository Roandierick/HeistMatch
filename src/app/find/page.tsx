import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconPlus } from "@/components/ui/icons";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { HeistGrid } from "@/components/heists/heist-grid";
import { FinderFilters } from "@/components/heists/finder-filters";
import { FINDER_PAGE_SIZE, getHeistTypes, listOpenHeists } from "@/data/heists";
import { activeFilterCount, findHref, parseFilters } from "@/lib/filters";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ searchParams }: PageProps<"/find">): Promise<Metadata> {
  const params = await searchParams;
  const hasQuery = Object.keys(params).length > 0;
  return pageMetadata({
    title: "Find GTA 6 Heist Players & Crews",
    description:
      "Browse open GTA 6 heist listings. Filter by platform, region, language, mic, skill and playstyle to find reliable teammates and join a crew.",
    // Canonical is always /find; filtered/paginated variants are noindex,follow
    // until there is enough unique data to justify dedicated landing pages.
    path: "/find",
    noindex: hasQuery,
  });
}

export default async function FindPage({ searchParams }: PageProps<"/find">) {
  const filters = parseFilters(await searchParams);
  const [heistTypes, { listings, total, error }] = await Promise.all([
    getHeistTypes(),
    listOpenHeists(filters, { page: filters.page }),
  ]);
  const activeCount = activeFilterCount(filters);
  const totalPages = Math.max(1, Math.ceil(total / FINDER_PAGE_SIZE));

  return (
    <Container className="pt-8 pb-28 md:pb-12">
      <Breadcrumbs items={[{ name: "Home", path: "/" }, { name: "Find Heists", path: "/find" }]} />
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Find GTA 6 heist players</h1>
          <p className="mt-2 text-muted" aria-live="polite">
            {error ? "Listings are temporarily unavailable." : `${total} open ${total === 1 ? "heist" : "heists"}${activeCount ? " matching your filters" : ""}`}
          </p>
        </div>
        <span className="hidden md:block">
          <LinkButton href="/create">
            <IconPlus className="size-4" /> Create Heist
          </LinkButton>
        </span>
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-[240px_1fr]">
        <aside aria-label="Filters" className="md:sticky md:top-24 md:self-start">
          <FinderFilters filters={filters} heistTypes={heistTypes} activeCount={activeCount} />
        </aside>

        <section aria-label="Heist listings">
          {listings.length > 0 ? (
            <>
              <HeistGrid listings={listings} />
              {totalPages > 1 && (
                <nav aria-label="Pagination" className="mt-8 flex items-center justify-between text-sm">
                  {filters.page > 1 ? (
                    <Link className="text-accent hover:text-accent-strong" href={findHref({ ...filters, page: filters.page - 1 })}>
                      ← Previous
                    </Link>
                  ) : <span />}
                  <span className="text-subtle">
                    Page {filters.page} of {totalPages}
                  </span>
                  {filters.page < totalPages ? (
                    <Link className="text-accent hover:text-accent-strong" href={findHref({ ...filters, page: filters.page + 1 })}>
                      Next →
                    </Link>
                  ) : <span />}
                </nav>
              )}
            </>
          ) : (
            <EmptyState
              title={activeCount ? "No heists match these filters" : "No open heists yet"}
              description={
                activeCount
                  ? "Try fewer filters, or post your own heist so matching players can find you."
                  : "Post a heist and players looking for a crew will find you here."
              }
              action={
                <>
                  <LinkButton href="/create">
                    <IconPlus className="size-4" /> Create Heist
                  </LinkButton>
                  {activeCount > 0 && (
                    <LinkButton href="/find" variant="secondary">
                      Clear filters
                    </LinkButton>
                  )}
                </>
              }
            />
          )}

          <aside className="mt-12 rounded-[var(--radius-card)] border border-line bg-surface p-5 text-sm text-muted">
            <h2 className="font-semibold text-fg">New to heist crews?</h2>
            <p className="mt-1">
              Read our <Link className="text-accent underline underline-offset-4 hover:text-accent-strong" href="/blog/category/heist-guides">heist guides</Link> and{" "}
              <Link className="text-accent underline underline-offset-4 hover:text-accent-strong" href="/blog/category/crews-lfg">crew &amp; LFG tips</Link> before your next job.
            </p>
          </aside>
        </section>
      </div>
    </Container>
  );
}
